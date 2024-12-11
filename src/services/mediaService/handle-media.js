import { ExitFullScreenIcon } from '@radix-ui/react-icons';
import { uploadFileToS3, deleteMediaFromS3 } from '../mediaService/media-service';

/**
 * user this class to  handle 
 * the interaction with S3 service 
 */
class S3MediaFacade {
    /**
  * Uploads an array of media files to S3.
  * @param {Array<Object>} medias - Array of media objects { file: File, type?: string }
  * @returns {Promise<Array<Object>>} An array of uploaded media metadata.
  */
    static async uploadMedias(medias) {

        const uploadPromises = medias.map(async (media, index) => {
            if (!media.file) {
                return null;
            }

            const objectKey = `${Date.now()}_${index}_media`; // added index just in case if same media updated for everyting 

            const fullS3Url = await uploadFileToS3(media.file, objectKey);

            const bucketUrl = fullS3Url.split(objectKey)[0];  // get the url with out the key from the respones 

            const fileUrl = `${bucketUrl}${objectKey}`; // merege the return dht

            // Return the metadata
            return {
                id: null,
                type: media.type || null,
                mediaUrl: fileUrl,
                createdAt: null,
                updatedAt: null
            };
        });

        const uploadedMedias = await Promise.all(uploadPromises);
        return uploadedMedias.filter(Boolean); // Filter out null entries
    }

    /**
     * 
     * @param {Array<string>} mediaUrls 
     * @returns {Promise<void>}
     */
    static async deleteMedias(mediaUrls) {
        if (!mediaUrls || mediaUrls.length === 0) return;

        const deletePromises = mediaUrls.map((url) => {
            const urlParts = url.split('/');
            const objectKey = urlParts.slice(3).join('/');
            return deleteMediaFromS3(objectKey);
        });

        await Promise.all(deletePromises);

        return [];
    }


    /**
     * For updating media, you'd first delete the unwanted ones using deleteMedias,
     * and upload the new ones using uploadMedias, then combine results before sending to the backend.
     * 
     * If needed, you can create a helper method that given oldMediaUrlsToDelete and newMediasToUpload,
     * it performs both actions and returns the final combined array of media metadata.
     */
    static async updateMedias(existingMedias, updatedMediaInputs) {
     
        if (!existingMedias) {
           return; 
        }

        if (!updatedMediaInputs) {
            return;  
        }

        const updatedMediaArray = await Promise.all(
            existingMedias.map(async (media) => {

                const input = updatedMediaInputs.find((item) => item.id === media.id);

                if (!input || !input.file) {
                    return { ...media };
                }

                // Delete the old media from S3 if it exists
                if (input.url) {
                    const urlParts = input.url.split("/");
                    const objectKey = urlParts.slice(3).join("/");
                    try {
                        await deleteMediaFromS3(objectKey);
                        console.log(`Deleted old media: ${input.url}`);
                    } catch (error) {
                        console.error(`Failed to delete old media: ${input.url}`, error);
                    }
                }

                try {
                    const objectKey = `${Date.now()}_0_media`;
                    const fullS3Url = await uploadFileToS3(input.file, objectKey);
                    const newFileUrl = fullS3Url;

                    return {
                        ...media,
                        mediaUrl: newFileUrl
                    };
                } catch (error) {
                    console.error(`Failed to upload new media for id: ${media.id}`, error);
                    throw new Error(`Failed to upload media: ${input.file.name}`);
                }
            })
        );

        // Return both arrays
        return {
            oldMediaArray: [...existingMedias], // Return the unchanged old array
            updatedMediaArray, // Return the updated array
        };
    }

}

export default S3MediaFacade;
