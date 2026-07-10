export async function toBase64(
  image: File | Blob | ArrayBuffer,
): Promise<{ base64: string; mimeType: string }> {
  if (image instanceof ArrayBuffer) {
    return {
      base64: Buffer.from(image).toString("base64"),
      mimeType: "image/png",
    };
  }
  const mimeType = image.type || "image/png";
  const buffer = await image.arrayBuffer();
  return {
    base64: Buffer.from(buffer).toString("base64"),
    mimeType,
  };
}

export function hashImage(image: File | Blob | ArrayBuffer): number {
  if (image instanceof ArrayBuffer) {
    return new Uint8Array(image).reduce((a, b) => a + b, 0);
  }
  return image.size;
}
