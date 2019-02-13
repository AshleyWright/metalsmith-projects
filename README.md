metalsmith-projects
============

A [Metalsmith](https://metalsmith.io/) plugin for adding metadata for *projects* (think portfolio content) from GitHub or filesystem (through [metalsmith-collections](https://github.com/segmentio/metalsmith-collections)) that can be looped over for creating a portfolio of work.

## Installation
```
$ npm install metalsmith-projects
```

##Usage
There are currently two sources from which projects can be retrieved from:
 - GitHub: retrieves metadata on all public non-fork repositories owned by the provided username, plus any specific additional repositories.
 - collection: retrieves metadata from the front-matter of files under a specified collection.

All sources add objects to the the metadata property `projects` of the form:

| Property | Type |
|---|---|
| `name` | `String` |
| `owner` | `String` |
| `fullName` | `String` |
| `description` | `String` |
| `stargazerCount` | `Number` |
| `lastUpdated` | `Date` |
| `languages` | `String[]` |
| `url` | `String` |

Multiple sources can be used simultaneously in the same call to `metalsmith-projects`.

### Source: GitHub
```javascript
const projects = require("metalsmith-projects").default;

metalsmith.use(projects({
  github: {
    authToken: "<githubOAuth2Token>", // optional (see note below)
    username: "AshleyWright",
    additionalRepos: ["<owner>/<repoName>", ...],  // optional
    exclude: ["<owner>/<repoName>", ...] // optional
  }
}))
```
Note: although an `authToken` is not required, absence of one incurs greater GitHub API rate limiting.

### Source: collection
```javascript
const collections = require("metalsmith-collections");
const projects = require("metalsmith-projects").default;

metalsmith.use(collections({
  <collectionName>: "<fileGlob>"
})).use(projects({
  collection: {
    name: "<collectionName>",
    defaultOwner: "<defaultOwner>"
  }
}))
```
The mapping of file front-matter to project metadata is as follows:

| Project metadata | Frontmatter | Default Value |
|---|---|---|
| `name` | `projectName` or `title` | `"Unnamed"` |
| `owner` | `owner` | `options.collection.defaultOwner` |
| `fullName` | `projectFullName` or `title` | `"Unnamed"` |
| `description` | `projectDescription` | `""` (the empty string) |
| `stargazerCount` | `stargazerCount` | `0` |
| `lastUpdated` | `lastUpdated` or `datePublished` | `undefined` |
| `languages` | `projectLanguages` | `[]` |
| `url` | `url` | `metadata.site.url + fileMetadata.path` |


MIT &copy; Ashley Wright