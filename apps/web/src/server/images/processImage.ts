import sharp from "sharp";

const MAX_DIMENSION = 1200;

/** Resizes to a bounded max dimension and re-encodes to webp before storage/upload. */
export async function processImage(buffer: Buffer): Promise<{ buffer: Buffer; contentType: string }> {
  const resized = await sharp(buffer)
    .rotate() // apply EXIF orientation, then strip metadata by re-encoding
    .resize({ width: MAX_DIMENSION, height: MAX_DIMENSION, fit: "inside", withoutEnlargement: true })
    .webp({ quality: 82 })
    .toBuffer();
  return { buffer: resized, contentType: "image/webp" };
}
