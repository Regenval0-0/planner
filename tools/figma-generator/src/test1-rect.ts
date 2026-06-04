import { createEmptyFigDoc, encodeFigParts, assembleCanvasFig, createFigZip, hexToFigColor } from "openfig-core";
import { compress } from "@mongodb-js/zstd";
import fs from "fs";

async function main() {
  const doc = createEmptyFigDoc();
  const page1 = doc.message.nodeChanges.find((n: any) => n.type === "CANVAS" && n.name === "Page 1")!;

  doc.message.nodeChanges.push({
    guid: { sessionID: 1, localID: 100 },
    phase: "CREATED",
    type: "RECTANGLE",
    name: "Box",
    parentIndex: { guid: page1.guid, position: "a" },
    size: { x: 200, y: 100 },
    transform: { m00: 1, m01: 0, m02: 50, m10: 0, m11: 1, m12: 50 },
    visible: true,
    opacity: 1,
    fillPaints: [{ type: "SOLID", color: hexToFigColor("#FF3366"), visible: true }],
  });

  const parts = encodeFigParts(doc);
  const msg = await compress(Buffer.from(parts.messageRaw), 3);
  const canvasFig = assembleCanvasFig({ ...parts, messageCompressed: new Uint8Array(msg) });
  const zip = createFigZip({ canvasFig, meta: doc.meta, thumbnail: doc.thumbnail, images: doc.images });
  fs.writeFileSync("test1-rect.fig", zip);
  console.log("test1-rect.fig", zip.length);
}
main().catch(console.error);
