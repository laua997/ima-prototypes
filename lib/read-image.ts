export async function readImageFile(file: File) {
  if (!file.type.startsWith("image/")) {
    throw new Error("Choose a JPEG, PNG, or WebP.");
  }
  if (file.size > 12_000_000) {
    throw new Error("That file is over 12MB. Try a smaller image.");
  }
  let bitmap: ImageBitmap;
  try {
    bitmap = await createImageBitmap(file);
  } catch {
    throw new Error("This image could not be read. Try a JPEG or PNG.");
  }
  const max = 1400;
  const scale = Math.min(1, max / Math.max(bitmap.width, bitmap.height));
  const width = Math.max(1, Math.round(bitmap.width * scale));
  const height = Math.max(1, Math.round(bitmap.height * scale));
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext("2d");
  if (!context) {
    bitmap.close();
    throw new Error("This browser could not prepare the image.");
  }
  context.drawImage(bitmap, 0, 0, width, height);
  bitmap.close();
  const src = canvas.toDataURL("image/jpeg", 0.82);
  const alt = file.name.replace(/\.[^.]+$/, "").replace(/[_-]+/g, " ") || "Uploaded image";
  return { src, alt };
}
