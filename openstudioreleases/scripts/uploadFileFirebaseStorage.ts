import { cert } from 'firebase-admin/app';
import * as admin from 'firebase-admin';
import path from 'path';
// move this to .env
import serviceAccount from '../firebase-admin-test-project.json';
import { v4 as uuidv4 } from 'uuid';

admin.initializeApp({
  credential: cert(serviceAccount),
  storageBucket: 'gs://testproject-c3dda.appspot.com',
});

const cwd = process.cwd();

const inputPath = path.join(cwd, 'OpenStudioApplication-1.7.1.dmg');

const run = async () => {
  const bucket = admin.storage().bucket();

  const destination = uuidv4();

  await bucket.upload(inputPath, {
    destination,
    metadata: {
      contentType: 'application/octet-stream', // You can set this to the correct MIME type of your file
    },
  });

  console.log(`File uploaded to ${destination}`);
};

(async () => {
  try {
    await run();
  } catch (err) {
    // eslint-disable-next-line
    console.log({
      err,
    });
    process.exit(1);
  }

  process.exit(0);
})();
