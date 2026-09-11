import { readdir, readFile, stat } from "node:fs/promises";
import { gzipSync } from "node:zlib";

const dir = new URL("../dist/", import.meta.url);
const names = await readdir(dir, { recursive: true });
let raw = 0,
  gzip = 0,
  count = 0;
for (const name of names) {
  const file = new URL(name.replaceAll("\\", "/"), dir);
  if (!(await stat(file)).isFile()) continue;
  const bytes = await readFile(file);
  raw += bytes.length;
  gzip += gzipSync(bytes).length;
  count++;
}
console.log(
  JSON.stringify(
    {
      files: count,
      rawBytes: raw,
      estimatedGzipBytes: gzip,
      note: "Total build, including lazy chunks and font fallbacks; actual first navigation can be smaller. Not an HTTP transfer measurement.",
    },
    null,
    2,
  ),
);
