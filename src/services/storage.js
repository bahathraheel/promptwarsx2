/**
 * Google Cloud Storage service for ELITE ELECTION.
 * Stores generated TTS audio and static assets.
 */

async function uploadBuffer(
  bucketName,
  fileName,
  buffer,
  contentType = "application/octet-stream",
) {
  try {
    const { Storage } = require("@google-cloud/storage");
    const storage = new Storage({
      projectId: process.env.GOOGLE_CLOUD_PROJECT,
    });
    const bucket = storage.bucket(bucketName || process.env.GCS_BUCKET_NAME);
    const file = bucket.file(fileName);

    await file.save(buffer, { contentType, resumable: false });
    await file.makePublic();

    return {
      url: `https://storage.googleapis.com/${bucket.name}/${fileName}`,
      success: true,
    };
  } catch (error) {
    console.warn("[Storage] Upload failed:", error.message);
    return { url: null, success: false, fallback: true };
  }
}

async function downloadFile(bucketName, fileName) {
  try {
    const { Storage } = require("@google-cloud/storage");
    const storage = new Storage({
      projectId: process.env.GOOGLE_CLOUD_PROJECT,
    });
    const [contents] = await storage
      .bucket(bucketName)
      .file(fileName)
      .download();
    return { data: contents, success: true };
  } catch (error) {
    console.warn("[Storage] Download failed:", error.message);
    return { data: null, success: false };
  }
}

module.exports = { uploadBuffer, downloadFile };
