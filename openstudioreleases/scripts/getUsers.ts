import { writeJson } from './writeJson';
import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

import serviceAccount from '../firebase-service-account.json';

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
        {...doc.data(), id: doc.id},
      ];
      console.log(`ID: ${doc.id}, Data: ${JSON.stringify(doc.data())}`);
    });

    console.log(`We have ${users.length} Registered Users`);
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
