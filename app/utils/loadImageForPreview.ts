/**
 * Load an image from a FileSystemFileHandle, create a blob copy of the file and return a URL for preview.
 * This is required because once the original file is overwritten or deleted, the URL created from it becomes invalid,
 * but using a blob copy ensures the preview remains accessible.
 * @param buffer The image file buffer to preview
 * @returns A URL that can be used to preview the image
 */
export default async function loadImageForPreview(buffer: ArrayBuffer, type = 'image/jpeg'): Promise<string> {
  const blob = new Blob([buffer], { type })
  const imageUrl = URL.createObjectURL(blob)

  return imageUrl
}
