import { lstat, readdir, rm, rmdir, unlink } from 'node:fs/promises';
import path from 'node:path';

const targets = [path.join(process.cwd(), '.next'), path.join(process.cwd(), 'tsconfig.tsbuildinfo')];

async function removeEntry(entryPath) {
  let stats;

  try {
    stats = await lstat(entryPath);
  } catch (error) {
    if (error && typeof error === 'object' && 'code' in error && error.code === 'ENOENT') {
      return;
    }
    throw error;
  }

  if (stats.isDirectory() && !stats.isSymbolicLink()) {
    const children = await readdir(entryPath);
    await Promise.all(children.map((child) => removeEntry(path.join(entryPath, child))));
    await rmdir(entryPath).catch(async (error) => {
      if (error && typeof error === 'object' && 'code' in error && error.code === 'ENOTEMPTY') {
        await rm(entryPath, { recursive: true, force: true });
        return;
      }
      if (error && typeof error === 'object' && 'code' in error && error.code === 'ENOENT') {
        return;
      }
      throw error;
    });
    return;
  }

  await unlink(entryPath).catch(async (error) => {
    if (error && typeof error === 'object' && 'code' in error && error.code === 'ENOENT') {
      return;
    }
    if (error && typeof error === 'object' && 'code' in error && error.code === 'EPERM') {
      await rm(entryPath, { recursive: true, force: true });
      return;
    }
    throw error;
  });
}

await Promise.all(
  targets.map((target) =>
    removeEntry(target).catch((error) => {
      console.error(`Failed to clean ${path.basename(target)}:`, error);
      process.exitCode = 1;
    })
  )
);
