import { createEmptyFigDoc, encodeFigParts, assembleCanvasFig, createFigZip } from "openfig-core";
import { compress } from "@mongodb-js/zstd";
import fs from "fs";

async function main() {
  const doc = createEmptyFigDoc();

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

  fs.writeFileSync("test-empty.fig", figZip);
  console.log("test-empty.fig created", figZip.length, "bytes");
}

main().catch(console.error);
