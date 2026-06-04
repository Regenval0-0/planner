import { createEmptyFigDoc, encodeFigParts, assembleCanvasFig, createFigZip, hexToFigColor } from "openfig-core";
import { compress } from "@mongodb-js/zstd";
import fs from "fs";

async function main() {
  const doc = createEmptyFigDoc();
  const page1 = doc.message.nodeChanges.find((n: any) => n.type === "CANVAS" && n.name === "Page 1")!;
  const p = page1.guid;

  // 70 rectangles with unique positions (a..z, aa..az, etc)
  let posCounter = 0;
  const nextPos = () => {
    const n = posCounter++;
    if (n < 26) return String.fromCharCode(97 + n);
    return String.fromCharCode(97 + Math.floor((n - 26) / 26)) + String.fromCharCode(97 + ((n - 26) % 26));
  };

  for (let i = 0; i < 70; i++) {
    doc.message.nodeChanges.push({
      guid: { sessionID: 1, localID: 100 + i },
      phase: "CREATED",
      type: "RECTANGLE",
      name: `R${i}`,
      parentIndex: { guid: p, position: nextPos() },
      size: { x: 50, y: 30 },
      transform: { m00: 1, m01: 0, m02: (i % 10) * 60, m10: 0, m11: 1, m12: Math.floor(i / 10) * 40 },
      visible: true,
      opacity: 1,
      fillPaints: [{ type: "SOLID", color: hexToFigColor(i % 2 === 0 ? "#FF3366" : "#3366FF"), visible: true }],
    });
  }

  const parts = encodeFigParts(doc);
  const msg = await compress(Buffer.from(parts.messageRaw), 3);
  const canvasFig = assembleCanvasFig({ ...parts, messageCompressed: new Uint8Array(msg) });
  const zip = createFigZip({ canvasFig, meta: doc.meta, thumbnail: doc.thumbnail, images: doc.images });
  fs.writeFileSync("test7-bigpage.fig", zip);
  console.log("test7-bigpage.fig", zip.length);
}
main().catch(console.error);
