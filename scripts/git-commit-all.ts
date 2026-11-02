import git from "isomorphic-git";
import * as fs from "fs";
import * as path from "path";

const dir = process.cwd();

// Recursively find all files honoring .gitignore exclusions
function getFiles(currentDir: string, baseDir: string = currentDir): string[] {
  const ignoreDirs = new Set([
    "node_modules",
    ".next",
    ".git",
    "coverage",
    ".vercel",
  ]);

  const ignoreFiles = new Set([
    ".env",
    "dev.db",
    "dev.db-journal",
    "tsconfig.tsbuildinfo",
  ]);

  let results: string[] = [];
  const entries = fs.readdirSync(currentDir, { withFileTypes: true });

  for (const entry of entries) {
    if (entry.isDirectory()) {
      if (!ignoreDirs.has(entry.name)) {
        results = results.concat(getFiles(path.join(currentDir, entry.name), baseDir));
      }
    } else {
      if (!ignoreFiles.has(entry.name) && !entry.name.endsWith(".tsbuildinfo")) {
        const relPath = path.relative(baseDir, path.join(currentDir, entry.name)).replace(/\\/g, "/");
        results.push(relPath);
      }
    }
  }

  return results;
}

async function run() {
  console.log("Reading workspace files for Git staging...");
  const files = getFiles(dir);
  console.log(`Found ${files.length} project files to stage.`);

  // Stage files
  for (const file of files) {
    await git.add({ fs, dir, filepath: file });
  }

  // Commit
  const sha = await git.commit({
    fs,
    dir,
    message: "feat: Mission LiFE Gujarat & EcoVerse v1.0.0 — Production Release (GEDA Hackathon HC26-GEDA01)",
    author: {
      name: "Utkarsh Johar",
      email: "citizen@life.gujarat.gov.in",
    },
  });

  console.log(`Commit created successfully! Commit SHA: ${sha}`);

  // Print commit log
  const commits = await git.log({ fs, dir, depth: 5 });
  console.log("Recent commit history:");
  for (const c of commits) {
    console.log(`- [${c.oid.substring(0, 7)}] ${c.commit.message.split("\n")[0]}`);
  }
}

run().catch((err) => {
  console.error("Git commit error:", err);
  process.exit(1);
});
