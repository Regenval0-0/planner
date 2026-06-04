import { createEmptyFigDoc } from "openfig-core";

const doc = createEmptyFigDoc();

console.log("Empty doc nodes:");
for (const node of doc.message.nodeChanges) {
  console.log(`  ${node.type} - ${node.name} - guid(${node.guid.sessionID}, ${node.guid.localID})`);
}

// Also check parent guids
console.log("\nParent relations:");
for (const node of doc.message.nodeChanges) {
  if (node.parentIndex) {
    console.log(`  ${node.name} -> parent ${node.parentIndex.guid.sessionID}:${node.parentIndex.guid.localID} pos=${node.parentIndex.position}`);
  }
}
