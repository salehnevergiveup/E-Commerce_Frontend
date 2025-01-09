// /frontend/services/mediaService.js
import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';

// Load environment variables
const region = process.env.NEXT_PUBLIC_AWS_BUCKET_REGION;
const bucketName = process.env.NEXT_PUBLIC_AWS_BUCKET_NAME;
const accessKeyId = process.env.NEXT_PUBLIC_AWS_ACCESS_KEY_ID;
const secretAccessKey = process.env.NEXT_PUBLIC_AWS_SECRET_ACCESS_KEY;

// Create the S3 client
const s3Client = new S3Client({
  region,
  credentials: {
    accessKeyId,
    secretAccessKey,
  },
});

/**
 * Uploads a file directly to S3 using AWS SDK v3.
 * @param {File|Blob} file - The file to upload.
 * @param {string} objectKey - The desired key for the object in S3.
 * @returns {Promise<string>} - The URL of the uploaded file.
 */
export async function uploadFileToS3(file, objectKey) {
  try {
    const putObjectParams = {
      Bucket: bucketName,
      Key: objectKey,
      Body: file,
      ContentType: file.type || 'application/octet-stream', 
    };

    // Use the v3 command
    await s3Client.send(new PutObjectCommand(putObjectParams));

    // Construct and return the file's URL (v3 doesn't return .Location like v2 did)
    const fileURL = constructMediaURL(objectKey);
    console.log('File uploaded successfully:', fileURL);
    return fileURL;
  } catch (error) {
    console.error('Error uploading file to S3:', error);
    throw new Error(error.message || 'Failed to upload file to S3');
  }
}

/**
 * Deletes a media file directly from S3 using AWS SDK v3.
 * @param {string} objectKey - The key of the object in S3.
 * @returns {Promise<void>}
 */
export async function deleteMediaFromS3(objectKey) {
  console.log('Object to delete:', objectKey);

  const deleteObjectParams = {
    Bucket: bucketName,
    Key: objectKey,
  };

  try {
    await s3Client.send(new DeleteObjectCommand(deleteObjectParams));
    console.log(`Successfully deleted object: ${objectKey} from bucket: ${bucketName}`);
  } catch (error) {
    console.error('Error deleting media from S3:', error);
    throw new Error(error.message || 'Failed to delete media from S3');
  }
}

/**
 * Constructs the public URL of a media file given its objectKey.
 * @param {string} objectKey - The key of the object in S3.
 * @returns {string} - The constructed URL.
 */
export function constructMediaURL(objectKey) {
  return `https://${bucketName}.s3.${region}.amazonaws.com/${objectKey}`;
}
