import { createEmptyFigDoc, encodeFigParts, assembleCanvasFig, createFigZip, hexToFigColor } from "openfig-core";
import { compress } from "@mongodb-js/zstd";
import fs from "fs";

async function main() {
  const doc = createEmptyFigDoc();
  const page1 = doc.message.nodeChanges.find((n: any) => n.type === "CANVAS" && n.name === "Page 1")!;
  const p = page1.guid;

  for (let i = 0; i < 40; i++) {
    doc.message.nodeChanges.push({
      guid: { sessionID: 1, localID: 100 + i },
      phase: "CREATED",
      type: i % 2 === 0 ? "RECTANGLE" : "TEXT",
      name: `Item ${i}`,
      parentIndex: { guid: p, position: String.fromCharCode(97 + (i % 26)) + (i >= 26 ? String.fromCharCode(97 + Math.floor(i / 26)) : "") },
      size: { x: 200, y: i % 2 === 0 ? 30 : 20 },
      transform: { m00: 1, m01: 0, m02: 50 + (i % 10) * 20, m10: 0, m11: 1, m12: 50 + Math.floor(i / 10) * 40 },
      visible: true,
      opacity: 1,
      fillPaints: [{ type: "SOLID", color: hexToFigColor("#FF3366"), visible: true }],
      ...(i % 2 !== 0 ? {
        textData: { characters: `Text ${i}` },
        fontSize: 14,
        fontName: { family: "Inter", style: "Regular", postscript: "Inter-Regular" },
        textAlignHorizontal: "LEFT",
      } : {}),
    });
  }

  const parts = encodeFigParts(doc);
  const msg = await compress(Buffer.from(parts.messageRaw), 3);
  const canvasFig = assembleCanvasFig({ ...parts, messageCompressed: new Uint8Array(msg) });
  const zip = createFigZip({ canvasFig, meta: doc.meta, thumbnail: doc.thumbnail, images: doc.images });
  fs.writeFileSync("test4-many.fig", zip);
  console.log("test4-many.fig", zip.length);
}
main().catch(console.error);
