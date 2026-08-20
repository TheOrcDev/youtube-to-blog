const AVATAR_EDGE_PX = 256;
const WEBP_QUALITY = 0.85;

export function toSquareAvatarDataUri(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const objectUrl = URL.createObjectURL(file);
    const image = new Image();

    image.onload = () => {
      URL.revokeObjectURL(objectUrl);

      const canvas = document.createElement("canvas");
      canvas.height = AVATAR_EDGE_PX;
      canvas.width = AVATAR_EDGE_PX;

      const context = canvas.getContext("2d");

      if (!context) {
        reject(new Error("Canvas is unavailable."));
        return;
      }

      const edge = Math.min(image.width, image.height);
      const sourceX = (image.width - edge) / 2;
      const sourceY = (image.height - edge) / 2;

      context.drawImage(
        image,
        sourceX,
        sourceY,
        edge,
        edge,
        0,
        0,
        AVATAR_EDGE_PX,
        AVATAR_EDGE_PX
      );
      resolve(canvas.toDataURL("image/webp", WEBP_QUALITY));
    };

    image.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error("That file is not a readable image."));
    };

    image.src = objectUrl;
  });
}
