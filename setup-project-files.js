const fs = require("node:fs");
const path = require("node:path");

const files = [
    ...(process.env.CI === "true"
        ? []
        : [
              {
                  file: ".env",
                  targetDir: ["api", "web"],
              },
              {
                  file: ".env.local",
                  targetDir: ["api", "web"],
              },
              {
                  file: ".env.secrets",
                  targetDir: ["api", "web"],
              },
          ]),
    {
        file: "api/schema.gql",
        targetDir: ["web"],
    },
    {
        file: ".npmrc",
        targetDir: ["api", "web"],
    },
];

for (const { file, targetDir } of files) {
    for (const dir of targetDir) {
        const targetFile = `${dir}/${path.basename(file)}`;
        if (process.env.CI === "true") {
            fs.copyFileSync(file, targetFile);
        } else {
            try {
                fs.unlinkSync(targetFile);
            } catch (e) {
                // Do nothing, if file does not exist
            }
            fs.symlinkSync(path.relative(dir, file), targetFile);
        }
    }
}
