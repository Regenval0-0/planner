import { parseFig } from "openfig-core";
import fs from "fs";

const data = fs.readFileSync("atlas-designs.fig");
const doc = parseFig(new Uint8Array(data));

console.log("✅ Файл atlas-designs.fig открыт успешно!");
console.log(`   Всего нод: ${doc.message.nodeChanges.length}`);

const pages = doc.message.nodeChanges.filter((n: any) => n.type === "CANVAS");
console.log(`   Страниц: ${pages.length}`);
pages.forEach((p: any) => {
  const children = doc.message.nodeChanges.filter(
    (n: any) => n.parentIndex && n.parentIndex.guid.sessionID === p.guid.sessionID && n.parentIndex.guid.localID === p.guid.localID
  );
  console.log(`   • ${p.name}: ${children.length} элементов`);
});
