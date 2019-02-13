import { GithubProjectsOptions, getGithubProjects } from "./sources/github";
import {
  getCollectionProjects,
  CollectionProjectsOptions
} from "./sources/collection";

import Octokit from "@octokit/rest";
const octokit = new Octokit();

export interface ProjectsOptions {
  github?: GithubProjectsOptions;
  collection?: CollectionProjectsOptions;
}

export interface Project {
  owner: string;
  name: string;
  fullName: string;
  description: string;
  stargazerCount: number;
  lastUpdated: Date;
  languages: string[];
  url: string;
}

export default function(opts: ProjectsOptions) {
  return async function(files, metalsmith, done) {
    const projects = [
      ...(await getGithubProjects(opts.github)),
      ...(await getCollectionProjects(opts.collection, metalsmith))
    ];

    //Sort projects by stargazer count, date of last update descending.
    const sortedProjects = projects.sort((projA, projB) => {
      if (projA.stargazerCount === projB.stargazerCount) {
        return (
          new Date(projB.lastUpdated.valueOf()).valueOf() -
          new Date(projA.lastUpdated.valueOf()).valueOf()
        );
      }
      return projB.stargazerCount - projA.stargazerCount;
    });

    metalsmith._metadata.projects = sortedProjects;
    setImmediate(done);
  };
}
