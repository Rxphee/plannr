// One version for the whole repository, kept in the package.json and package-lock.json of the root, the API and the web app.
//   node version.js set 0.2.0         sets it everywhere through npm version, which updates the lockfile too
//   node version.js check             fails when the files disagree
//   node version.js check v0.2.0      also fails when the release tag names another version
const { execFileSync } = require("node:child_process");
const fs = require("node:fs");
const path = require("node:path");

const PACKAGE_DIRECTORIES = [".", "api", "web"];
const SEMANTIC_VERSION = /^\d+\.\d+\.\d+$/;

function readJson(directory, file) {
    return JSON.parse(fs.readFileSync(path.join(__dirname, directory, file), "utf8"));
}

function findVersions() {
    return PACKAGE_DIRECTORIES.flatMap((directory) => {
        const packageJson = readJson(directory, "package.json");
        const lockfile = readJson(directory, "package-lock.json");
        return [
            { file: path.join(directory, "package.json"), version: packageJson.version },
            { file: path.join(directory, "package-lock.json"), version: lockfile.version },
            { file: `${path.join(directory, "package-lock.json")} (root package)`, version: lockfile.packages[""].version },
        ];
    });
}

function setVersion(version) {
    if (!SEMANTIC_VERSION.test(version ?? "")) {
        throw new Error(`Give the version as major.minor.patch, e.g. 0.2.0, not "${version ?? ""}"`);
    }
    for (const directory of PACKAGE_DIRECTORIES) {
        execFileSync("npm", ["version", version, "--no-git-tag-version", "--allow-same-version"], {
            cwd: path.join(__dirname, directory),
            stdio: "inherit",
        });
    }
}

function checkVersions(tag) {
    const versions = findVersions();
    const expected = tag ? tag.replace(/^v/, "") : versions[0].version;
    const mismatches = versions.filter(({ version }) => version !== expected);
    if (mismatches.length > 0) {
        const details = mismatches.map(({ file, version }) => `  ${file}: ${version ?? "no version"}`).join("\n");
        throw new Error(`Expected version ${expected}${tag ? ` from the tag ${tag}` : ""} everywhere, but found:\n${details}`);
    }
    console.log(`All packages are at version ${expected}`);
}

const [command, argument] = process.argv.slice(2);
try {
    if (command === "set") {
        setVersion(argument);
    } else if (command === "check") {
        checkVersions(argument);
    } else {
        throw new Error("Usage: node version.js set <version> | check [<tag>]");
    }
} catch (error) {
    console.error(error.message);
    process.exitCode = 1;
}
