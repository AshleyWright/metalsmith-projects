import R from "ramda";
import { Project } from "../index";

export interface CollectionProjectsOptions {
  name: string;
  defaultOwner: string;
}

export async function getCollectionProjects(
  options: CollectionProjectsOptions,
  metalsmith
): Promise<Project[]> {
  if (!options.name) return [];
  const collection = metalsmith._metadata.collections[options.name];
  if (!collection) throw `Collection ${options.name} does not exist.`;
  return R.map(
    (fileMetadata: any): Project => ({
      owner: fileMetadata.owner || options.defaultOwner,
      name: fileMetadata.projectName || fileMetadata.title || "Unnamed",
      fullName: fileMetadata.projectFullName || fileMetadata.title || "Unnamed",
      description: fileMetadata.projectDescription || "",
      stargazerCount: fileMetadata.stargazerCount || 0,
      lastUpdated:
        fileMetadata.lastUpdated || fileMetadata.datePublished || undefined,
      languages: fileMetadata.projectLanguages || [],
      url: fileMetadata.url || metalsmith._metadata.site.url + fileMetadata.path
    }),
    collection
  );
}
