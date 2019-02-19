import { expect } from "chai";
import {
  filterNonForks,
  filterOutByFullName,
  convertToProjectArray,
  getReposByOwner,
  getRepositoriesByFullNames,
  hydrateReposWithLanguages
} from "../github";

describe("Source [GitHub]:", () => {
  const octokit = {
    repos: {
      listForUser: () => ({ data: [{ full_name: "testOwner/testRepo" }] }),
      get: ({ owner, repo }) => {
        if (owner === "testOwner" && repo === "testRepo")
          return { data: { full_name: "testOwner/testRepo" } };
        throw "Repo does not exist";
      },
      listLanguages: () => ({ data: { testLanguage: 100 } })
    }
  };

  describe("getReposByOwner", () => {
    it("returns array of repositories", async () => {
      expect(await getReposByOwner(octokit, "testOwner")).to.have.lengthOf(1);
    });
  });

  describe("filterNonForks", () => {
    it("only removes forked repositories", () => {
      expect(filterNonForks([{ fork: true }])).to.have.lengthOf(0);
      expect(filterNonForks([{ fork: false }])).to.have.lengthOf(1);
    });
  });

  describe("getRepositoriesByFullNames", () => {
    it("returns array of repositories", async () => {
      expect(
        await getRepositoriesByFullNames(octokit, ["testOwner/testRepo"])
      ).to.have.lengthOf(1);
    });
  });

  describe("filterOutByFullName", () => {
    it("only removes repositories named", () => {
      expect(
        filterOutByFullName(["testOwner/testRepo"])([
          {
            owner: { login: "testOwner" },
            name: "testRepo",
            full_name: "testOwner/testRepo"
          }
        ])
      ).to.have.lengthOf(0);

      expect(
        filterOutByFullName(["testOwner/otherTestRepo"])([
          {
            owner: { login: "testOwner" },
            name: "testRepo",
            full_name: "testOwner/testRepo"
          }
        ])
      ).to.have.lengthOf(1);
    });
  });

  describe("hydrateReposWithLanguages", () => {
    it("adds list of languages", async () => {
      expect(
        await hydrateReposWithLanguages(octokit, [
          { owner: { login: "testOwner" }, name: "testRepo" }
        ])
      ).to.deep.equal([
        {
          owner: { login: "testOwner" },
          name: "testRepo",
          languages: ["testLanguage"]
        }
      ]);
    });
  });

  describe("convertToProjectArray", () => {
    it("propagates all relevant repo properties", () => {
      expect(
        convertToProjectArray([
          {
            owner: { login: "testOwner" },
            name: "testRepo",
            full_name: "testOwner/testRepo",
            description: "testDescription",
            stargazers_count: 7357,
            updated_at: "7357-01-01",
            languages: ["testLanguage"],
            html_url: "http://test.url"
          }
        ])
      ).to.deep.equal([
        {
          owner: "testOwner",
          name: "testRepo",
          fullName: "testOwner/testRepo",
          description: "testDescription",
          stargazerCount: 7357,
          lastUpdated: new Date("7357-01-01"),
          languages: ["testLanguage"],
          url: "http://test.url"
        }
      ]);
    });
  });
});
