import {
  createEmptyFigDoc,
  encodeFigParts,
  assembleCanvasFig,
  createFigZip,
  hexToFigColor,
  type FigNode,
  type FigDocument,
} from "openfig-core";
import { compress } from "@mongodb-js/zstd";
import fs from "fs";
import path from "path";

/* ─── helpers ─── */
let gid = 1000;
const newGuid = () => ({ sessionID: 1, localID: gid++ });

let posCounter = 0;
function nextPos() {
  // a..z, aa..az, ba..bz ... enough for our needs
  const n = posCounter++;
  if (n < 26) return String.fromCharCode(97 + n);
  const first = String.fromCharCode(97 + Math.floor((n - 26) / 26));
  const second = String.fromCharCode(97 + ((n - 26) % 26));
  return first + second;
}

function resetCounters() {
  gid = 1000;
  posCounter = 0;
}

const C = {
  yellow: "#FCEE58",
  green: "#A4C639",
  dark: "#222222",
  grey: "#555555",
  light: "#F7F7F7",
  white: "#FFFFFF",
  header: "#F5D547",
};

function addRect(
  doc: FigDocument,
  parent: any,
  name: string,
  x: number,
  y: number,
  w: number,
  h: number,
  fillHex: string,
  opts: { corner?: number; stroke?: string; strokeW?: number } = {}
) {
  const n: any = {
    guid: newGuid(),
    phase: "CREATED",
    type: "RECTANGLE",
    name,
    parentIndex: { guid: parent, position: nextPos() },
    size: { x: w, y: h },
    transform: { m00: 1, m01: 0, m02: x, m10: 0, m11: 1, m12: y },
    visible: true,
    opacity: 1,
    fillPaints: [{ type: "SOLID", color: hexToFigColor(fillHex), visible: true }],
    cornerRadius: opts.corner ?? 0,
  };
  if (opts.stroke) {
    n.strokePaints = [{ type: "SOLID", color: hexToFigColor(opts.stroke), visible: true }];
    n.strokeWeight = opts.strokeW ?? 1;
    n.strokeAlign = "INSIDE";
  }
  doc.message.nodeChanges.push(n);
  return n.guid;
}

function addText(
  doc: FigDocument,
  parent: any,
  name: string,
  x: number,
  y: number,
  w: number,
  h: number,
  text: string,
  fontSize: number,
  opts: { bold?: boolean; color?: string; align?: string } = {}
) {
  const weight = opts.bold ? "Bold" : "Regular";
  const post = opts.bold ? "Inter-Bold" : "Inter-Regular";
  doc.message.nodeChanges.push({
    guid: newGuid(),
    phase: "CREATED",
    type: "TEXT",
    name,
    parentIndex: { guid: parent, position: nextPos() },
    size: { x: w, y: h },
    transform: { m00: 1, m01: 0, m02: x, m10: 0, m11: 1, m12: y },
    visible: true,
    opacity: 1,
    textData: { characters: text },
    fontSize,
    fontName: { family: "Inter", style: weight, postscript: post },
    textAlignHorizontal: (opts.align ?? "LEFT") as any,
    fillPaints: [{ type: "SOLID", color: hexToFigColor(opts.color ?? C.dark), visible: true }],
  });
}

function addEllipse(
  doc: FigDocument,
  parent: any,
  name: string,
  x: number,
  y: number,
  size: number,
  fillHex: string
) {
  doc.message.nodeChanges.push({
    guid: newGuid(),
    phase: "CREATED",
    type: "ELLIPSE",
    name,
    parentIndex: { guid: parent, position: nextPos() },
    size: { x: size, y: size },
    transform: { m00: 1, m01: 0, m02: x, y: y, m10: 0, m11: 1, m12: y },
    visible: true,
    opacity: 1,
    fillPaints: [{ type: "SOLID", color: hexToFigColor(fillHex), visible: true }],
  });
}

/* ─── page factory ─── */
function makeCanvas(doc: FigDocument, docGuid: any, name: string, w: number, h: number) {
  const g = newGuid();
  doc.message.nodeChanges.push({
    guid: g,
    phase: "CREATED",
    type: "CANVAS",
    name,
    parentIndex: { guid: docGuid, position: nextPos() },
    size: { x: w, y: h },
    visible: true,
    opacity: 1,
  });
  return g;
}

/* ─── data ─── */
const specs = [
  { code: "38.02.08", name: "Торговое дело", note: "дистанционное", years: "2 года 10 мес." },
  { code: "23.02.07", name: "Техническое обслуживание и ремонт\nавтотранспортных средств", note: "", years: "2 года 10 мес." },
  { code: "23.02.01", name: "Организация перевозок и управление\nна транспорте (по видам)", note: "дистанционное", years: "2 года 10 мес." },
  { code: "22.02.04", name: "Техническая эксплуатация подъемно-\nтранспортных, строительных, дорожных\nмашин и оборудования (по отраслям)", note: "", years: "2 года 10 мес." },
  { code: "25.02.08", name: "Эксплуатация беспилотных\nавиационных систем", note: "", years: "3 года 10 мес." },
  { code: "43.02.17", name: "Технология индустрии красоты", note: "", years: "2 года 10 мес." },
  { code: "23.01.17", name: "Мастер по ремонту и обслуживанию\nавтомобилей", note: "", years: "1 год 10 мес." },
];

const accessibility = [
  { label: "по зрению", val: "88,67%" },
  { label: "по слуху", val: "86,67%" },
  { label: "НОДА\n(мобильные)", val: "93,2%" },
  { label: "НОДА\n(на коляске)", val: "85,67%" },
  { label: "УО", val: "93,34%" },
];

const W = 1680;
const H = 1200;

/* ═══════════════════════════════════════
   ВАРИАНТ 1 — по образцу (проценты, две колонки, фото placeholder)
   ═══════════════════════════════════════ */
function buildVariant1(doc: FigDocument, pageGuid: any) {
  resetCounters();

  // diagonal bg blocks
  addRect(doc, pageGuid, "bg-yellow", -200, -200, 900, 700, C.yellow);
  addRect(doc, pageGuid, "bg-green", 1100, 800, 900, 700, C.green);

  // top bar
  addRect(doc, pageGuid, "top-bar", 0, 0, W, 140, C.yellow);

  // logo placeholder
  addRect(doc, pageGuid, "logo-pl", 40, 20, 100, 100, C.white, { corner: 12 });
  addText(doc, pageGuid, "logo-text", 40, 50, 100, 40, "ЛОГО", 14, { align: "CENTER" });

  // title
  addText(doc, pageGuid, "title", 160, 25, 900, 50,
    "ГПОУ «Кузбасский транспортно-технологический техникум»", 28, { bold: true });
  addText(doc, pageGuid, "subtitle", 160, 80, 700, 30,
    "Субъект Российской Федерации: Кемеровская область - Кузбасс", 16, { color: C.grey });

  // phone block (top right)
  addRect(doc, pageGuid, "phone-icon", W - 320, 25, 40, 40, C.green, { corner: 20 });
  addText(doc, pageGuid, "phone-label", W - 270, 25, 250, 20, "Телефон:", 14);
  addText(doc, pageGuid, "phone-num", W - 270, 50, 250, 25, "8(939)-273-24-03", 18, { bold: true });

  // accessibility header
  addText(doc, pageGuid, "acc-title", 40, 160, 500, 30, "Доступность организации:", 20, { bold: true });

  // accessibility blocks
  let bx = 40;
  accessibility.forEach((a, i) => {
    addRect(doc, pageGuid, `acc-bg-${i}`, bx, 200, 140, 90, C.white, { corner: 8, stroke: C.dark, strokeW: 1 });
    addText(doc, pageGuid, `acc-val-${i}`, bx, 210, 140, 35, a.val, 22, { bold: true, align: "CENTER" });
    addText(doc, pageGuid, `acc-lbl-${i}`, bx, 250, 140, 35, a.label, 11, { color: C.grey, align: "CENTER" });
    bx += 160;
  });

  // photo placeholder (right side)
  addRect(doc, pageGuid, "photo-bg", 1150, 160, 490, 680, "#E5E5E5", { corner: 12 });
  addText(doc, pageGuid, "photo-text", 1150 + 150, 160 + 320, 200, 40, "[ ФОТО ]", 24, { color: "#999999", align: "CENTER" });

  // specialties title
  addText(doc, pageGuid, "spec-title", 40, 320, 400, 30, "Профессии/Специальности:", 20, { bold: true });

  // specialties list (two-column layout simplified to one wide list)
  let sy = 360;
  specs.forEach((s, i) => {
    const num = `${i + 1}.`;
    addText(doc, pageGuid, `s-code-${i}`, 40, sy, 100, 22, s.code, 13, { bold: true });
    addText(doc, pageGuid, `s-name-${i}`, 150, sy, 500, 44, s.name, 13);
    addText(doc, pageGuid, `s-years-${i}`, 660, sy, 180, 22, s.years, 12, { color: C.grey });
    if (s.note) {
      addRect(doc, pageGuid, `s-note-${i}`, 850, sy + 2, 90, 18, C.yellow, { corner: 4 });
      addText(doc, pageGuid, `s-note-t-${i}`, 850, sy + 2, 90, 18, s.note, 10, { align: "CENTER" });
    }
    sy += 56;
  });

  // QR placeholder
  addRect(doc, pageGuid, "qr-bg", 880, 500, 140, 140, C.white, { corner: 8, stroke: C.dark, strokeW: 1 });
  addText(doc, pageGuid, "qr-text", 880, 560, 140, 20, "QR-код", 14, { align: "CENTER", color: C.grey });

  // bottom contacts bar
  addRect(doc, pageGuid, "bottom-bar", 0, H - 180, W, 180, C.green);

  // contacts left
  addText(doc, pageGuid, "contacts-title", 40, H - 160, 200, 25, "Наши контакты:", 18, { bold: true, color: C.dark });
  addText(doc, pageGuid, "addr-label", 40, H - 130, 80, 20, "Адрес БПОО:", 12, { bold: true, color: C.dark });
  addText(doc, pageGuid, "addr-val", 130, H - 130, 500, 40,
    "652702 Кемеровская обл. - Кузбасс, г. Киселёвск, ул. Дружбы, 11\n653036, Кемеровская обл. - Кузбасс, г. Прокопьевск, ул. Союзная, 70", 12, { color: C.dark });

  addText(doc, pageGuid, "mail-label", 40, H - 80, 140, 20, "Адрес электронной почты:", 12, { bold: true, color: C.dark });
  addText(doc, pageGuid, "mail-val", 190, H - 80, 250, 20, "kttt.kis@yandex.ru", 12, { color: C.dark });

  // contacts center
  addText(doc, pageGuid, "phone2-label", 620, H - 130, 80, 20, "Телефоны:", 12, { bold: true, color: C.dark });
  addText(doc, pageGuid, "phone2-val", 700, H - 130, 220, 50, "8(939)-273-24-03\n8(38464)2-41-34", 12, { color: C.dark });

  addText(doc, pageGuid, "hot-label", 620, H - 80, 100, 20, "Горячая линия:", 12, { bold: true, color: C.dark });
  addText(doc, pageGuid, "hot-val", 720, H - 80, 200, 40, "8(38464)2-41-34\n8(38464)2-37-46", 12, { color: C.dark });

  // socials right
  addText(doc, pageGuid, "site-label", 1100, H - 130, 80, 20, "Сайт:", 12, { bold: true, color: C.dark });
  addText(doc, pageGuid, "site-val", 1160, H - 130, 200, 20, "kttt42.ru", 12, { color: C.dark });

  addText(doc, pageGuid, "vk-label", 1100, H - 100, 80, 20, "VK:", 12, { bold: true, color: C.dark });
  addText(doc, pageGuid, "vk-val", 1160, H - 100, 200, 20, "club185", 12, { color: C.dark });

  // page number
  addRect(doc, pageGuid, "page-num-bg", W - 80, H - 50, 50, 35, C.yellow, { corner: 4 });
  addText(doc, pageGuid, "page-num", W - 80, H - 45, 50, 25, "11", 18, { bold: true, align: "CENTER" });
}

/* ═══════════════════════════════════════
   ВАРИАНТ 2 — табличный в новых цветах
   ═══════════════════════════════════════ */
function buildVariant2(doc: FigDocument, pageGuid: any) {
  resetCounters();

  // clean white bg
  addRect(doc, pageGuid, "bg", 0, 0, W, H, C.white);
  // left accent stripe
  addRect(doc, pageGuid, "stripe", 0, 0, 16, H, C.green);

  // header
  addRect(doc, pageGuid, "header-bg", 0, 0, W, 120, C.header);
  addText(doc, pageGuid, "v2-title", 40, 30, 1400, 45,
    "ГПОУ «Кузбасский транспортно-технологический техникум»", 32, { bold: true });
  addText(doc, pageGuid, "v2-sub", 40, 80, 800, 25,
    "Профессии/специальности для лиц с ОВЗ и инвалидностью", 16, { color: C.grey });

  // contacts mini (top right)
  addText(doc, pageGuid, "v2-phone", W - 340, 30, 300, 22, "Тел.: 8(939)-273-24-03", 14, { color: C.dark });
  addText(doc, pageGuid, "v2-site", W - 340, 55, 300, 22, "Сайт: kttt42.ru | VK: club185", 14, { color: C.dark });

  // table header
  const thY = 150;
  addRect(doc, pageGuid, "th-bg", 40, thY, 1000, 40, C.green);
  addText(doc, pageGuid, "th-n", 45, thY + 10, 30, 25, "№", 14, { bold: true, color: C.white });
  addText(doc, pageGuid, "th-spec", 85, thY + 10, 500, 25, "Наименование профессии/специальности", 14, { bold: true, color: C.white });
  addText(doc, pageGuid, "th-term", 620, thY + 10, 180, 25, "Срок обучения", 14, { bold: true, color: C.white });
  addText(doc, pageGuid, "th-adm", 820, thY + 10, 220, 25, "Срок приёма", 14, { bold: true, color: C.white });

  // table rows
  let ry = thY + 40;
  specs.forEach((s, i) => {
    const bg = i % 2 === 0 ? C.light : C.white;
    addRect(doc, pageGuid, `tr-bg-${i}`, 40, ry, 1000, 48, bg);
    addText(doc, pageGuid, `tr-n-${i}`, 50, ry + 14, 30, 22, `${i + 1}`, 13, { bold: true });
    addText(doc, pageGuid, `tr-spec-${i}`, 85, ry + 6, 520, 40, `${s.code}  ${s.name.replace(/\n/g, " ")}`, 13);
    addText(doc, pageGuid, `tr-term-${i}`, 620, ry + 14, 180, 22, s.years, 12, { color: C.grey });
    if (i === 0) {
      addText(doc, pageGuid, `tr-adm-0`, 820, ry + 6, 220, 40,
        "Общий набор\nс 20.06.2026 до 15.08.2026", 12, { color: C.grey });
    } else if (i === 3) {
      addText(doc, pageGuid, `tr-adm-3`, 820, ry + 14, 220, 22, "Доп. набор до 25.11.2026", 12, { color: C.grey });
    }
    if (s.note) {
      addRect(doc, pageGuid, `tr-note-${i}`, 1050, ry + 14, 100, 20, C.yellow, { corner: 4 });
      addText(doc, pageGuid, `tr-note-t-${i}`, 1050, ry + 16, 100, 18, s.note, 10, { align: "CENTER" });
    }
    ry += 48;
  });

  // dormitory + diseases block (right column)
  const colX = 1100;
  addRect(doc, pageGuid, "info-bg", colX, 150, 540, 500, C.light, { corner: 12 });
  addText(doc, pageGuid, "info-title", colX + 20, 170, 300, 25, "Общежитие (адрес):", 14, { bold: true });
  addText(doc, pageGuid, "info-addr", colX + 20, 200, 500, 40,
    "652702 Кемеровская область,\nг. Киселёвск, ул. Дружбы, д.13", 13, { color: C.grey });

  addText(doc, pageGuid, "info-d-title", colX + 20, 260, 300, 25, "Заболевания, с которыми возможно обучение:", 14, { bold: true });
  const diseases = [
    "ОДА ВК слабые, соматические, зрения",
    "Соматические, слуха",
    "ОДА НК слабые, соматические, слух",
    "Соматические, слуха",
    "ОДА НК слабые, соматические",
    "Соматические, слуха",
  ];
  let dy = 290;
  diseases.forEach((d, i) => {
    addText(doc, pageGuid, `dis-${i}`, colX + 20, dy, 500, 22, `• ${d}`, 12, { color: C.grey });
    dy += 24;
  });

  // accessibility big numbers
  addText(doc, pageGuid, "acc2-title", colX + 20, 450, 300, 25, "Доступность организации:", 14, { bold: true });
  let ax = colX + 20;
  accessibility.forEach((a, i) => {
    addText(doc, pageGuid, `a2-val-${i}`, ax, 480, 90, 28, a.val, 20, { bold: true, color: C.green });
    addText(doc, pageGuid, `a2-lbl-${i}`, ax, 510, 90, 30, a.label, 10, { color: C.grey });
    ax += 105;
  });

  // note block
  addRect(doc, pageGuid, "note-bg", 40, ry + 30, 1000, 80, C.yellow, { corner: 8 });
  addText(doc, pageGuid, "note-t", 60, ry + 40, 960, 60,
    "ВК – верхние конечности | НК – нижние конечности (коляска, ходунки)\nДоступность: по зрению – 88,67%, по слуху – 86,67%, НОДА (мобильные) – 93,2%, НОДА (на коляске) – 85,67%, УО – 93,34%", 12, { color: C.dark });

  // bottom contacts
  addRect(doc, pageGuid, "bot-bg", 0, H - 100, W, 100, C.dark);
  addText(doc, pageGuid, "bot-addr", 40, H - 80, 700, 22,
    "652702 Кемеровская обл. - Кузбасс, г. Киселёвск, ул. Дружбы, 11  |  653036, г. Прокопьевск, ул. Союзная, 70", 13, { color: C.white });
  addText(doc, pageGuid, "bot-mail", 40, H - 55, 300, 22, "kttt.kis@yandex.ru", 13, { color: C.white });
  addText(doc, pageGuid, "bot-phone", 400, H - 55, 300, 22, "8(939)-273-24-03", 13, { color: C.white });
  addText(doc, pageGuid, "bot-hot", 720, H - 55, 300, 22, "Горячая линия: 8(38464)2-41-34, 8(38464)2-37-46", 13, { color: C.white });

  // page number
  addText(doc, pageGuid, "page2", W - 60, H - 30, 40, 20, "11", 16, { bold: true, color: C.white, align: "CENTER" });
}

/* ═══════════════════════════════════════
   ВАРИАНТ 3 — альтернативный (акцент на контакты + вертикаль)
   ═══════════════════════════════════════ */
function buildVariant3(doc: FigDocument, pageGuid: any) {
  resetCounters();

  // bg
  addRect(doc, pageGuid, "v3-bg", 0, 0, W, H, C.white);
  // top-right diagonal-ish block
  addRect(doc, pageGuid, "v3-tr", 1200, 0, 500, 450, C.yellow);
  // bottom-left block
  addRect(doc, pageGuid, "v3-bl", 0, 700, 600, 520, C.green);

  // title
  addText(doc, pageGuid, "v3-title", 40, 40, 1100, 45,
    "ГПОУ «Кузбасский транспортно-технологический техникум»", 30, { bold: true });
  addText(doc, pageGuid, "v3-sub", 40, 90, 600, 25, "Кемеровская область - Кузбасс", 16, { color: C.grey });

  // photo placeholder inside yellow block
  addRect(doc, pageGuid, "v3-photo", 1250, 40, 400, 350, "#D9D9D9", { corner: 12 });
  addText(doc, pageGuid, "v3-photo-t", 1350, 200, 200, 30, "[ ФОТО ]", 20, { color: "#888888", align: "CENTER" });

  // accessibility (left panel)
  addText(doc, pageGuid, "v3-acc-title", 40, 150, 300, 28, "Доступность:", 20, { bold: true });
  let ay = 190;
  accessibility.forEach((a, i) => {
    addRect(doc, pageGuid, `v3-acc-bg-${i}`, 40, ay, 260, 55, C.light, { corner: 8 });
    addText(doc, pageGuid, `v3-acc-val-${i}`, 50, ay + 8, 120, 28, a.val, 20, { bold: true, color: C.green });
    addText(doc, pageGuid, `v3-acc-lbl-${i}`, 50, ay + 32, 240, 20, a.label, 11, { color: C.grey });
    ay += 68;
  });

  // specialties (center-right area)
  addText(doc, pageGuid, "v3-spec-title", 340, 150, 400, 28, "Специальности:", 20, { bold: true });
  let sy = 190;
  specs.forEach((s, i) => {
    addText(doc, pageGuid, `v3-s-code-${i}`, 340, sy, 90, 20, s.code, 13, { bold: true });
    addText(doc, pageGuid, `v3-s-name-${i}`, 440, sy, 680, 40, s.name, 13);
    sy += 46;
  });

  // QR placeholder
  addRect(doc, pageGuid, "v3-qr", 340, sy + 20, 120, 120, C.white, { corner: 8, stroke: C.dark, strokeW: 1 });
  addText(doc, pageGuid, "v3-qr-t", 340, sy + 70, 120, 20, "QR", 14, { color: C.grey, align: "CENTER" });

  // bottom contacts inside green block
  addText(doc, pageGuid, "v3-contact-title", 40, 720, 300, 28, "Контакты:", 20, { bold: true, color: C.dark });
  addText(doc, pageGuid, "v3-addr", 40, 760, 520, 60,
    "Адрес:\n652702, г. Киселёвск, ул. Дружбы, 11\n653036, г. Прокопьевск, ул. Союзная, 70", 13, { color: C.dark });
  addText(doc, pageGuid, "v3-mail", 40, 830, 520, 22, "E-mail: kttt.kis@yandex.ru", 13, { color: C.dark });
  addText(doc, pageGuid, "v3-phone", 40, 860, 520, 22, "Тел.: 8(939)-273-24-03", 13, { color: C.dark });
  addText(doc, pageGuid, "v3-hot", 40, 890, 520, 40,
    "Горячая линия:\n8(38464)2-41-34  |  8(38464)2-37-46", 13, { color: C.dark });

  // social / site (right bottom)
  addText(doc, pageGuid, "v3-site", 620, 730, 400, 25, "Сайт: kttt42.ru", 16, { bold: true, color: C.dark });
  addText(doc, pageGuid, "v3-vk", 620, 765, 400, 25, "VK: club185", 16, { bold: true, color: C.dark });
  addText(doc, pageGuid, "v3-adm", 620, 810, 550, 80,
    "Приём: с 20.06.2026 по 15.08.2026\nДополнительный набор до 25.11.2026\nОбщежитие: г. Киселёвск, ул. Дружбы, д.13", 14, { color: C.dark });

  // page number
  addRect(doc, pageGuid, "v3-pn-bg", W - 80, H - 60, 50, 35, C.yellow, { corner: 4 });
  addText(doc, pageGuid, "v3-pn", W - 80, H - 55, 50, 25, "11", 18, { bold: true, align: "CENTER" });
}

/* ═══════════════════════════════════════
   MAIN
   ═══════════════════════════════════════ */
async function main() {
  const doc = createEmptyFigDoc();

  const docNode = doc.message.nodeChanges.find((n: any) => n.type === "DOCUMENT")!;
  const docGuid = docNode.guid;

  // Rename default Page 1
  const page1 = doc.message.nodeChanges.find((n: any) => n.type === "CANVAS" && n.name === "Page 1")!;
  page1.name = "Вариант 1 — по образцу";
  buildVariant1(doc, page1.guid);

  // Variant 2
  const page2 = makeCanvas(doc, docGuid, "Вариант 2 — табличный", W, H);
  buildVariant2(doc, page2);

  // Variant 3
  const page3 = makeCanvas(doc, docGuid, "Вариант 3 — альтернативный", W, H);
  buildVariant3(doc, page3);

  // encode
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

  const outPath = path.resolve(process.cwd(), "atlas-designs.fig");
  fs.writeFileSync(outPath, figZip);
  console.log(`✅ Готово: ${outPath}`);
  console.log(`   Размер: ${(figZip.length / 1024).toFixed(2)} KB`);
  console.log(`   Страниц: 3 (Вариант 1, Вариант 2, Вариант 3)`);
}

main().catch((err) => {
  console.error("❌ Ошибка:", err);
  process.exit(1);
});
