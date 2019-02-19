import chai from "chai";
import chaiAsPromised from "chai-as-promised";
import { getCollectionProjects } from "../collection";

chai.use(chaiAsPromised);
const { expect } = chai;

describe("Source [collection]", () => {
  const explicitMetalsmith = {
    _metadata: {
      collections: {
        testCollection: [
          {
            owner: "testOwner",
            projectName: "testProject",
            projectFullName: "testFullName",
            projectDescription: "testDescription",
            stargazerCount: 7357,
            lastUpdated: new Date("7537-01-01"),
            projectLanguages: ["testLanguage"],
            url: "http://test.url"
          }
        ]
      }
    }
  };
  const implicitMetalsmith = {
    _metadata: {
      collections: {
        testCollection: [
          {
            title: "testProject",
            datePublished: new Date("7537-01-01"),
            path: "/testProjectPath"
          }
        ]
      },
      site: {
        url: "http://test.url"
      }
    }
  };
  const defaultMetalsmith = {
    _metadata: {
      collections: {
        testCollection: [
          {
            path: "/testProjectPath"
          }
        ]
      },
      site: {
        url: "http://test.url"
      }
    }
  };

  describe("getCollectionProjects", () => {
    it("rejects when collection does not exist", () => {
      return expect(
        getCollectionProjects(
          { name: "otherTestCollection", defaultOwner: "testDefaultOwner" },
          explicitMetalsmith
        )
      ).to.be.rejected;
    });

    it("propagates explicit relevant file metadata", async () => {
      expect(
        await getCollectionProjects(
          { name: "testCollection", defaultOwner: "testDefaultOwner" },
          explicitMetalsmith
        )
      ).to.deep.equal([
        {
          owner: "testOwner",
          name: "testProject",
          fullName: "testFullName",
          description: "testDescription",
          stargazerCount: 7357,
          lastUpdated: new Date("7537-01-01"),
          languages: ["testLanguage"],
          url: "http://test.url"
        }
      ]);
    });

    it("propagates implicit relevant file metadata", async () => {
      expect(
        await getCollectionProjects(
          { name: "testCollection", defaultOwner: "testDefaultOwner" },
          implicitMetalsmith
        )
      ).to.deep.equal([
        {
          owner: "testDefaultOwner",
          name: "testProject",
          fullName: "testProject",
          description: "",
          stargazerCount: 0,
          lastUpdated: new Date("7537-01-01"),
          languages: [],
          url: "http://test.url/testProjectPath"
        }
      ]);
    });

    it("propagates default relevant file metadata", async () => {
      expect(
        await getCollectionProjects(
          { name: "testCollection", defaultOwner: "testDefaultOwner" },
          defaultMetalsmith
        )
      ).to.deep.equal([
        {
          owner: "testDefaultOwner",
          name: "Unnamed",
          fullName: "Unnamed",
          description: "",
          stargazerCount: 0,
          lastUpdated: undefined,
          languages: [],
          url: "http://test.url/testProjectPath"
        }
      ]);
    });
    it("returns empty array when not supplied collection name", async () => {
      expect(
        await getCollectionProjects({} as any, explicitMetalsmith)
      ).to.have.lengthOf(0);
    });
  });
});
