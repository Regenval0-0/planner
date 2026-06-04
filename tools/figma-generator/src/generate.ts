import { createEmptyFigDoc, encodeFigParts, assembleCanvasFig, createFigZip, hexToFigColor } from "openfig-core";
import { compress } from "@mongodb-js/zstd";
import fs from "fs";
import path from "path";

async function main() {
  const doc = createEmptyFigDoc();

  // Find Page 1 canvas guid (should be sessionID:0 localID:1)
  const page1 = doc.message.nodeChanges.find(
    (n: any) => n.type === "CANVAS" && n.name === "Page 1"
  );
  if (!page1) throw new Error("Page 1 not found");

  const parentGuid = page1.guid;

  // Helper to create GUID
  let nextLocalId = 100;
  const newGuid = () => ({ sessionID: 1, localID: nextLocalId++ });

  // Add a red rectangle
  doc.message.nodeChanges.push({
    guid: newGuid(),
    phase: "CREATED",
    type: "RECTANGLE",
    name: "Red Box",
    parentIndex: { guid: parentGuid, position: "a" },
    size: { x: 200, y: 100 },
    transform: { m00: 1, m01: 0, m02: 50, m10: 0, m11: 1, m12: 50 },
    visible: true,
    opacity: 1,
    fillPaints: [{ type: "SOLID", color: hexToFigColor("#FF3366"), visible: true }],
    strokeWeight: 2,
    strokePaints: [{ type: "SOLID", color: hexToFigColor("#000000"), visible: true }],
    strokeAlign: "INSIDE",
    cornerRadius: 8,
  });

  // Add a blue circle (ELLIPSE)
  doc.message.nodeChanges.push({
    guid: newGuid(),
    phase: "CREATED",
    type: "ELLIPSE",
    name: "Blue Circle",
    parentIndex: { guid: parentGuid, position: "b" },
    size: { x: 120, y: 120 },
    transform: { m00: 1, m01: 0, m02: 300, m10: 0, m11: 1, m12: 80 },
    visible: true,
    opacity: 1,
    fillPaints: [{ type: "SOLID", color: hexToFigColor("#3366FF"), visible: true }],
  });

  // Add a text node
  doc.message.nodeChanges.push({
    guid: newGuid(),
    phase: "CREATED",
    type: "TEXT",
    name: "Hello Text",
    parentIndex: { guid: parentGuid, position: "c" },
    size: { x: 300, y: 60 },
    transform: { m00: 1, m01: 0, m02: 50, m10: 0, m11: 1, m12: 220 },
    visible: true,
    opacity: 1,
    textData: { characters: "Привет из Node.js!" },
    fontSize: 24,
    fontName: { family: "Inter", style: "Regular", postscript: "Inter-Regular" },
    textAlignHorizontal: "LEFT",
    fillPaints: [{ type: "SOLID", color: hexToFigColor("#111111"), visible: true }],
  });

  // Add a frame containing two small rectangles
  const frameGuid = newGuid();
  doc.message.nodeChanges.push({
    guid: frameGuid,
    phase: "CREATED",
    type: "FRAME",
    name: "My Frame",
    parentIndex: { guid: parentGuid, position: "d" },
    size: { x: 300, y: 150 },
    transform: { m00: 1, m01: 0, m02: 50, m10: 0, m11: 1, m12: 320 },
    visible: true,
    opacity: 1,
    fillPaints: [{ type: "SOLID", color: hexToFigColor("#F3F4F6"), visible: true }],
    cornerRadius: 12,
  });

  // Child inside frame
  doc.message.nodeChanges.push({
    guid: newGuid(),
    phase: "CREATED",
    type: "RECTANGLE",
    name: "Child Rect",
    parentIndex: { guid: frameGuid, position: "a" },
    size: { x: 80, y: 80 },
    transform: { m00: 1, m01: 0, m02: 20, m10: 0, m11: 1, m12: 20 },
    visible: true,
    opacity: 1,
    fillPaints: [{ type: "SOLID", color: hexToFigColor("#10B981"), visible: true }],
    cornerRadius: 4,
  });

  // Encode
  const parts = encodeFigParts(doc);

  // Compress message with zstd (level 3 as recommended)
  const messageCompressed = await compress(Buffer.from(parts.messageRaw), 3);

  // Assemble canvas.fig binary
  const canvasFig = assembleCanvasFig({
    prelude: parts.prelude,
    version: parts.version,
    schemaCompressed: parts.schemaCompressed,
    messageCompressed: new Uint8Array(messageCompressed),
    passThrough: parts.passThrough,
  });

  // Package into .fig ZIP
  const figZip = createFigZip({
    canvasFig,
    meta: doc.meta,
    thumbnail: doc.thumbnail,
    images: doc.images,
  });

  // Write to disk
  const outPath = path.resolve(process.cwd(), "output.fig");
  fs.writeFileSync(outPath, figZip);
  console.log(`✅ Figma file saved to: ${outPath}`);
  console.log(`   Size: ${(figZip.length / 1024).toFixed(2)} KB`);
}

main().catch((err) => {
  console.error("❌ Error:", err);
  process.exit(1);
});
