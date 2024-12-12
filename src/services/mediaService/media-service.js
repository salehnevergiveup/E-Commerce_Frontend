// /frontend/services/mediaService.js
import AWS from 'aws-sdk';

// Load environment variables
// Configure S3 with credentials from environment variables
const s3 = new AWS.S3({
  region: process.env.NEXT_PUBLIC_AWS_BUCKET_REGION,
  accessKeyId: process.env.NEXT_PUBLIC_AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.NEXT_PUBLIC_AWS_SECRET_ACCESS_KEY,
});
const bucketName = process.env.NEXT_PUBLIC_AWS_BUCKET_NAME;


/**
 * Uploads a file directly to S3 using AWS SDK.
 * @param {File|Blob} file - The file to upload.
 * @param {string} objectKey - The desired key for the object in S3.
 * @returns {Promise<string>} - The URL of the uploaded file.
 */
export async function uploadFileToS3(file, objectKey) {
  const params = {
    Bucket: bucketName,
    Key: objectKey,
    Body: file,
    ContentType: file.type || 'application/octet-stream', // Set appropriate MIME type
  };

  try {
    const data = await s3.upload(params).promise();
    console.log('File uploaded successfully:', data.Location);
    return data.Location; // URL of the uploaded file
  } catch (error) {
    console.error('Error uploading file to S3:', error);
    throw new Error(error.message || 'Failed to upload file to S3');
  }
}

/**
 * Deletes a media file directly from S3 using AWS SDK.
 * @param {string} objectKey - The key of the object in S3.
 * @returns {Promise<void>}
 */
export async function deleteMediaFromS3(objectKey) {

    console.log("object to delete");
    console.log(objectKey);
  const params = {
    Bucket: bucketName,
    Key: objectKey,
  };

  try {
    await s3.deleteObject(params).promise();
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
  return `https://${bucketName}.s3.${process.env.NEXT_PUBLIC_AWS_BUCKET_REGION}.amazonaws.com/${objectKey}`;
}
