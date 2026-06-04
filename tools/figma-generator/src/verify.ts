import { parseFig } from "openfig-core";
import fs from "fs";

const data = fs.readFileSync("output.fig");
const doc = parseFig(new Uint8Array(data));

console.log("✅ Parsed successfully!");
console.log("Nodes count:", doc.message.nodeChanges.length);
console.log("\nNodes:");
for (const node of doc.message.nodeChanges) {
  const parent = node.parentIndex ? `parent(${node.parentIndex.guid.sessionID},${node.parentIndex.guid.localID})` : "root";
  console.log(`  [${node.type}] "${node.name}" guid(${node.guid.sessionID},${node.guid.localID}) ${parent}`);
}
