import R from "ramda";
import { Project } from "../index";
import { Octokit } from "@octokit/rest";

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

export const getReposByOwner = async (
  octokit,
  owner: string
): Promise<Partial<Repository>[]> =>
  (await octokit.repos.listForUser({
    username: owner,
    type: "owner"
  })).data;
export const filterNonForks = (repos: Partial<Repository>[]) =>
  R.filter((repo: Partial<Repository>) => !repo.fork, repos);
export const getRepositoriesByFullNames = (octokit, fullNames: string[]) =>
  Promise.all(
    R.map(async (fullName: string): Promise<Partial<Repository>> => {
      const [owner, repoName] = fullName.split("/");
      return (await octokit.repos.get({
        owner,
        repo: repoName
      })).data;
    }, fullNames)
  ) as Promise<Partial<Repository>[]>;
export const filterOutByFullName = (fullNames: string[]) =>
  R.filter((repo: Partial<Repository>) => !fullNames.includes(repo.full_name));
export const setLanguages = R.set(R.lensProp("languages"));
export const hydrateReposWithLanguages = (
  octokit,
  repos: Partial<Repository>[]
) =>
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
export const convertToProjectArray = R.map(
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

  let octokit;
  if (options.authToken)
    octokit = new Octokit({ auth: `token ${options.authToken}` });
  else octokit = new Octokit();

  return convertToProjectArray(
    await hydrateReposWithLanguages(
      octokit,
      filterOutByFullName(options.exclude)(
        R.concat<Partial<Repository>[]>(
          filterNonForks(await getReposByOwner(octokit, options.username)),
          (await getRepositoriesByFullNames(
            octokit,
            options.additionalRepos
          )) as any
        )
      )
    )
  );
}
