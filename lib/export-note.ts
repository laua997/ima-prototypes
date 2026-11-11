import type { Crop } from "@/lib/crop";

export function downloadJson(filename: string, data: unknown) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}

function wrapText(
  context: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  lineHeight: number,
  maxLines: number,
) {
  const words = text.split(/\s+/).filter(Boolean);
  let line = "";
  let used = 0;
  for (let index = 0; index < words.length; index += 1) {
    const word = words[index];
    const test = line ? `${line} ${word}` : word;
    if (context.measureText(test).width > maxWidth && line) {
      const last = used >= maxLines - 1;
      context.fillText(last ? `${line}…` : line, x, y);
      if (last) return;
      line = word;
      y += lineHeight;
      used += 1;
    } else {
      line = test;
    }
  }
  if (line) context.fillText(line, x, y);
}

export async function downloadNoteCard(input: {
  filename: string;
  title: string;
  imageSrc: string;
  crop: Crop;
  note: string;
  source: string;
  projectName: string;
}) {
  const image = new Image();
  image.src = input.imageSrc;
  await image.decode();
  const canvas = document.createElement("canvas");
  canvas.width = 900;
  canvas.height = 1200;
  const context = canvas.getContext("2d");
  if (!context) throw new Error("This browser could not draw the card.");

  context.fillStyle = "#f7f1e8";
  context.fillRect(0, 0, canvas.width, canvas.height);
  context.fillStyle = "#8e2a1c";
  context.fillRect(64, 64, 72, 6);

  context.fillStyle = "#1a120e";
  context.font = "500 22px Outfit, sans-serif";
  context.fillText("prototype", 64, 110);
  context.font = "600 42px Fraunces, serif";
  wrapText(context, input.title, 64, 170, 770, 48, 2);

  const sx = (input.crop.x / 100) * image.naturalWidth;
  const sy = (input.crop.y / 100) * image.naturalHeight;
  const sw = (input.crop.w / 100) * image.naturalWidth;
  const sh = (input.crop.h / 100) * image.naturalHeight;
  const dw = 772;
  const dh = Math.min(460, (sh / sw) * dw);
  context.drawImage(image, sx, sy, sw, sh, 64, 250, dw, dh);

  context.strokeStyle = "#8e2a1c";
  context.lineWidth = 4;
  context.strokeRect(64, 250, dw, dh);

  context.fillStyle = "#1a120e";
  context.font = "400 28px Fraunces, serif";
  wrapText(context, input.note, 64, 250 + dh + 64, 772, 38, 6);
  context.fillStyle = "#5c463c";
  context.font = "400 16px Outfit, sans-serif";
  wrapText(context, input.source, 64, 1080, 772, 22, 3);
  context.fillText(`Sample card for ${input.projectName}. Saved on this computer only. Nothing was uploaded.`, 64, 1150);

  const url = canvas.toDataURL("image/png");
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = input.filename;
  anchor.click();
}
