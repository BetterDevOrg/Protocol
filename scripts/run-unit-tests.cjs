const path = require("node:path");

const projectRoot = path.resolve(__dirname, "..");

process.chdir(projectRoot);
process.env.TS_NODE_PROJECT = path.join(projectRoot, "tsconfig.json");
process.env.TS_NODE_BASEURL = ".";
process.env.TS_NODE_COMPILER_OPTIONS = JSON.stringify({
  module: "CommonJS",
  moduleResolution: "node",
  target: "ES2020",
});

require("ts-node/register");
require("tsconfig-paths/register");

[
  "CommunityId",
  "MeetupSlug",
  "FormatDate",
  "OrganizerCode",
  "BuilderCircleMatching",
].forEach((testFile) => {
  require(path.join(projectRoot, "test", testFile));
});
