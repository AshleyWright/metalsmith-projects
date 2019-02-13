import R from "ramda";
import { Project } from "../index";
import Octokit from "@octokit/rest";

type Repository = any;

export interface GithubProjectsOptions {
  authToken: string;
  username: string;
  additionalRepos?: string[];
  exclude?: string[];
}

const defaultOptions = {
  authToken: undefined,
  username: undefined,
  additionalRepos: [],
  exclude: []
};

let octokit;

const getReposByOwner = async (owner: string): Promise<Partial<Repository>[]> =>
  (await octokit.repos.listForUser({
    username: owner,
    type: "owner"
  })).data;
const filterNonForks = (repos: Partial<Repository>[]) =>
  R.filter((repo: Partial<Repository>) => !repo.fork, repos);
const getRepositoriesByFullNames = (fullNames: string[]) =>
  Promise.all(
    R.map(async (fullName: string): Promise<Partial<Repository>> => {
      const [owner, repoName] = fullName.split("/");
      return (await octokit.repos.get({
        owner,
        repo: repoName
      })).data;
    }, fullNames)
  ) as Promise<Partial<Repository>[]>;
const filterOutByFullName = (fullNames: string[]) =>
  R.filter((repo: Partial<Repository>) => !fullNames.includes(repo.full_name));
const setLanguages = R.set(R.lensProp("languages"));
const hydrateReposWithLanguages = (repos: Partial<Repository>[]) =>
  Promise.all(
    R.map(
      async (repo: Partial<Repository>): Promise<Repository> =>
        setLanguages(
          Object.keys(
            (await octokit.repos.listLanguages({
              owner: repo.owner.login,
              repo: repo.name
            })).data
          ),
          repo
        ),
      repos
    )
  );
const convertToProjectArray = R.map(
  (repo: Repository): Project => ({
    owner: repo.owner.login,
    name: repo.name,
    fullName: repo.full_name,
    description: repo.description,
    stargazerCount: repo.stargazers_count,
    lastUpdated: new Date(repo.updated_at),
    languages: repo.languages,
    url: repo.html_url
  })
);

export async function getGithubProjects(opts: GithubProjectsOptions) {
  const options = R.merge(defaultOptions, opts);
  if (!options.username) throw "username undefined";

  if (options.authToken) octokit = new Octokit({auth: `token ${options.authToken}`});
  else octokit = new Octokit();

  return convertToProjectArray(
    await hydrateReposWithLanguages(
      filterOutByFullName(options.exclude)(
        R.concat<Partial<Repository>[]>(
          filterNonForks(await getReposByOwner(options.username)),
          (await getRepositoriesByFullNames(options.additionalRepos)) as any
        )
      )
    )
  );
}
