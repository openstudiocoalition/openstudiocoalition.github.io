import { writeJson } from './writeJson';
import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
// move this to .env
import serviceAccount from '../firebase-admin-test-project.json';

initializeApp({
  credential: cert(serviceAccount)
});

const db = getFirestore();

const run = async () => {
    const usersRef = db.collection('users');
    const snapshot = await usersRef.get();

    if (snapshot.empty) {
      console.log('No users found.');
      return;
    }

    console.log('Listing users:');

    let users = [];
    snapshot.forEach((doc) => {
      users = [
        ...users,
        doc.data(),
      ];
      console.log(`ID: ${doc.id}, Data: ${JSON.stringify(doc.data())}`);
    });

    await writeJson('users', users);
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
