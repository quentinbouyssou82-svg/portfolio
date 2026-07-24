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
const MAX_EDGE = Number(process.env.DRIVEELY_VISION_MAX_EDGE ?? 768);
const JPEG_QUALITY = Number(process.env.DRIVEELY_VISION_JPEG_QUALITY ?? 62);
/** Photos perso lourdes : un cran plus agressif pour limiter la latence Mistral. */
const HEAVY_BYTES = 1_200_000;
const HEAVY_MAX_EDGE = Number(process.env.DRIVEELY_VISION_HEAVY_MAX_EDGE ?? 640);
const HEAVY_JPEG_QUALITY = Number(
  process.env.DRIVEELY_VISION_HEAVY_JPEG_QUALITY ?? 55,
);

/**
 * Redimensionne + compresse en JPEG pour accélérer l'appel Vision
 * sans dégrader la lisibilité des chiffres / textes UI.
 * @throws Error Sharp sur buffer invalide — à mapper en ApiError côté route.
 */
export async function prepareScreenshotForVision(
  image: File | Blob | ArrayBuffer | Buffer,
): Promise<PreparedImage> {
  const input =
    Buffer.isBuffer(image)
      ? image
      : image instanceof ArrayBuffer
        ? Buffer.from(image)
        : Buffer.from(await image.arrayBuffer());

  if (input.byteLength === 0) {
    throw new Error("Empty image buffer");
  }

  const heavy = input.byteLength >= HEAVY_BYTES;
  const maxEdge = heavy ? HEAVY_MAX_EDGE : MAX_EDGE;
  const quality = heavy ? HEAVY_JPEG_QUALITY : JPEG_QUALITY;

  // Déjà petit JPEG (ex. préparé côté client) : éviter un 2e encode coûteux
  const looksPreparedJpeg =
    input.byteLength <= 420_000 &&
    input[0] === 0xff &&
    input[1] === 0xd8;

  let prepared: Buffer;
  if (looksPreparedJpeg && !heavy) {
    // Déjà compressé côté client (orientation déjà appliquée via canvas)
    prepared = input;
  } else {
    // mozjpeg off : ~2× plus rapide, taille quasi identique pour screenshots UI
    prepared = await sharp(input, { failOn: "error" })
      .rotate()
      .resize({
        width: maxEdge,
        height: maxEdge,
        fit: "inside",
        withoutEnlargement: true,
      })
      .jpeg({ quality, mozjpeg: false, progressive: false })
      .toBuffer();
  }

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
