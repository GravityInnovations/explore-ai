import { cp, lstat, mkdir, realpath } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const source = fileURLToPath(new URL("../skills/explore-ai/", import.meta.url));
const within = (root, child) => {
  const rel = path.relative(root, child);
  return (
    rel === "" ||
    (!rel.startsWith(`..${path.sep}`) && rel !== ".." && !path.isAbsolute(rel))
  );
};

export async function install(project) {
  const root = await realpath(path.resolve(project));
  if (!(await lstat(root)).isDirectory())
    throw new Error("Target project must be a directory");
  let parent = root;
  for (const segment of [".agents", "skills"]) {
    parent = path.join(parent, segment);
    try {
      await mkdir(parent);
    } catch (error) {
      if (error.code !== "EEXIST") throw error;
    }
    if (!within(root, await realpath(parent)))
      throw new Error("Installation directory escapes target project");
  }
  const destination = path.join(parent, "explore-ai");
  // Exclusive copy creation prevents accidental replacement and concurrent installers.
  try {
    await cp(source, destination, {
      recursive: true,
      force: false,
      errorOnExist: true,
      filter: async (entry) => {
        if (path.basename(entry) === "node_modules") return false;
        if ((await lstat(entry)).isSymbolicLink())
          throw new Error(`Package symlinks are not supported: ${entry}`);
        return true;
      },
    });
  } catch (error) {
    if (error.code === "ERR_FS_CP_EEXIST") error.code = "EEXIST";
    throw error;
  }
  return destination;
}

if (
  process.argv[1] &&
  import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href
) {
  try {
    if (process.argv.length !== 3)
      throw new Error(
        "Usage: node scripts/install.mjs <existing-target-project>",
      );
    const destination = await install(process.argv[2]);
    console.log(
      `Installed: ${destination}\nRun npm ci --ignore-scripts --no-audit --no-fund in that folder.\nSelect $explore-ai in the target project; restart Codex if discovery has not refreshed.`,
    );
  } catch (error) {
    console.error(`Installation failed: ${error.message}`);
    process.exitCode = 1;
  }
}
