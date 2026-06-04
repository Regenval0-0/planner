import {
  createEmptyFigDoc,
  encodeFigParts,
  assembleCanvasFig,
  createFigZip,
  hexToFigColor,
} from "openfig-core";
import { compress } from "@mongodb-js/zstd";
import fs from "fs";

async function main() {
  const doc = createEmptyFigDoc();

  const page1 = doc.message.nodeChanges.find(
    (n: any) => n.type === "CANVAS" && n.name === "Page 1"
  )!;
  const parent = page1.guid;
  let id = 100;

  // Simple rectangle
  doc.message.nodeChanges.push({
    guid: { sessionID: 1, localID: id++ },
    phase: "CREATED",
    type: "RECTANGLE",
    name: "Test Rect",
    parentIndex: { guid: parent, position: "a" },
    size: { x: 200, y: 100 },
    transform: { m00: 1, m01: 0, m02: 50, m10: 0, m11: 1, m12: 50 },
    visible: true,
    opacity: 1,
    fillPaints: [{ type: "SOLID", color: hexToFigColor("#FF3366"), visible: true }],
    cornerRadius: 8,
  });

  // Simple text
  doc.message.nodeChanges.push({
    guid: { sessionID: 1, localID: id++ },
    phase: "CREATED",
    type: "TEXT",
    name: "Test Text",
    parentIndex: { guid: parent, position: "b" },
    size: { x: 300, y: 40 },
    transform: { m00: 1, m01: 0, m02: 50, m10: 0, m11: 1, m12: 180 },
    visible: true,
    opacity: 1,
    textData: { characters: "Hello Figma" },
    fontSize: 24,
    fontName: { family: "Inter", style: "Regular", postscript: "Inter-Regular" },
    textAlignHorizontal: "LEFT",
    fillPaints: [{ type: "SOLID", color: hexToFigColor("#111111"), visible: true }],
  });

  const parts = encodeFigParts(doc);
  const messageCompressed = await compress(Buffer.from(parts.messageRaw), 3);

  const canvasFig = assembleCanvasFig({
    prelude: parts.prelude,
    version: parts.version,
    schemaCompressed: parts.schemaCompressed,
    messageCompressed: new Uint8Array(messageCompressed),
    passThrough: parts.passThrough,
  });

  const figZip = createFigZip({
    canvasFig,
    meta: doc.meta,
    thumbnail: doc.thumbnail,
    images: doc.images,
  });

  fs.writeFileSync("test-simple.fig", figZip);
  console.log("test-simple.fig created", figZip.length, "bytes");
}

main().catch(console.error);
