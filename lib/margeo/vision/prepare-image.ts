import sharp from "sharp";

export interface PreparedImage {
  buffer: Buffer;
  mimeType: "image/jpeg";
  ext: "jpg";
  originalBytes: number;
  preparedBytes: number;
  /** Hash court pour cache Vision (contenu préparé). */
  contentHash: string;
}

/** Plus petit = Vision plus rapide (chiffres UI restent lisibles à 768). */
const MAX_EDGE = Number(process.env.UBERLY_VISION_MAX_EDGE ?? 768);
const JPEG_QUALITY = Number(process.env.UBERLY_VISION_JPEG_QUALITY ?? 62);

/**
 * Redimensionne + compresse en JPEG pour accélérer l'appel Vision
 * sans dégrader la lisibilité des chiffres / textes UI.
 */
export async function prepareScreenshotForVision(
  image: File | Blob | ArrayBuffer,
): Promise<PreparedImage> {
  const input =
    image instanceof ArrayBuffer
      ? Buffer.from(image)
      : Buffer.from(await image.arrayBuffer());

  // mozjpeg off : ~2× plus rapide, taille quasi identique pour screenshots UI
  const prepared = await sharp(input)
    .rotate()
    .resize({
      width: MAX_EDGE,
      height: MAX_EDGE,
      fit: "inside",
      withoutEnlargement: true,
    })
    .jpeg({ quality: JPEG_QUALITY, mozjpeg: false, progressive: false })
    .toBuffer();

  const contentHash = simpleHash(prepared);

  return {
    buffer: prepared,
    mimeType: "image/jpeg",
    ext: "jpg",
    originalBytes: input.byteLength,
    preparedBytes: prepared.byteLength,
    contentHash,
  };
}

export function preparedImageToFile(
  prepared: PreparedImage,
  name = "capture.jpg",
): File {
  return new File([new Uint8Array(prepared.buffer)], name, {
    type: prepared.mimeType,
  });
}

/** Hash FNV-1a 32-bit — assez pour cache mémoire de session. */
function simpleHash(buf: Buffer): string {
  let h = 0x811c9dc5;
  const step = Math.max(1, Math.floor(buf.length / 4096));
  for (let i = 0; i < buf.length; i += step) {
    h ^= buf[i]!;
    h = Math.imul(h, 0x01000193);
  }
  h ^= buf.length;
  return (h >>> 0).toString(16);
}
