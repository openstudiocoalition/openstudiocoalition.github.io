import { firebaseBucket } from './firebaseAdmin';

export const uploadStorage = async (inputPath: string, destination: string) => {
  console.log(`Upload Storage Input: ${destination}`);
  await firebaseBucket.upload(inputPath, {
    destination,
    metadata: {
      contentType: 'application/octet-stream', // You can set this to the correct MIME type of your file
    },
  });

  console.log(`File uploaded to ${destination}`);
}