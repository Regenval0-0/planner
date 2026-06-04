import { createEmptyFigDoc, encodeFigParts, assembleCanvasFig, createFigZip, hexToFigColor } from "openfig-core";
import { compress } from "@mongodb-js/zstd";
import fs from "fs";

async function main() {
  const doc = createEmptyFigDoc();
  const docNode = doc.message.nodeChanges.find((n: any) => n.type === "DOCUMENT")!;
  const docGuid = docNode.guid;

  // Rename default page
  const page1 = doc.message.nodeChanges.find((n: any) => n.type === "CANVAS" && n.name === "Page 1")!;
  page1.name = "Page A";

  // Add a rectangle to page1
  doc.message.nodeChanges.push({
    guid: { sessionID: 1, localID: 100 },
    phase: "CREATED",
    type: "RECTANGLE",
    name: "R1",
    parentIndex: { guid: page1.guid, position: "a" },
    size: { x: 200, y: 100 },
    transform: { m00: 1, m01: 0, m02: 50, m10: 0, m11: 1, m12: 50 },
    visible: true,
    opacity: 1,
    fillPaints: [{ type: "SOLID", color: hexToFigColor("#FF3366"), visible: true }],
  });

  // Add second page (position "c" because "b" is taken by Internal Only Canvas)
  const page2Guid = { sessionID: 1, localID: 200 };
  doc.message.nodeChanges.push({
    guid: page2Guid,
    phase: "CREATED",
    type: "CANVAS",
    name: "Page B",
    parentIndex: { guid: docGuid, position: "c" },
    size: { x: 1000, y: 800 },
    visible: true,
    opacity: 1,
  });

  // Add text to page2
  doc.message.nodeChanges.push({
    guid: { sessionID: 1, localID: 201 },
    phase: "CREATED",
    type: "TEXT",
    name: "T2",
    parentIndex: { guid: page2Guid, position: "a" },
    size: { x: 300, y: 40 },
    transform: { m00: 1, m01: 0, m02: 50, m10: 0, m11: 1, m12: 50 },
    visible: true,
    opacity: 1,
    textData: { characters: "Page B content" },
    fontSize: 24,
    fontName: { family: "Inter", style: "Regular", postscript: "Inter-Regular" },
    textAlignHorizontal: "LEFT",
    fillPaints: [{ type: "SOLID", color: hexToFigColor("#111111"), visible: true }],
  });

  const parts = encodeFigParts(doc);
  const msg = await compress(Buffer.from(parts.messageRaw), 3);
  const canvasFig = assembleCanvasFig({ ...parts, messageCompressed: new Uint8Array(msg) });
  const zip = createFigZip({ canvasFig, meta: doc.meta, thumbnail: doc.thumbnail, images: doc.images });
  fs.writeFileSync("test8-multipage.fig", zip);
  console.log("test8-multipage.fig", zip.length);
}
main().catch(console.error);
