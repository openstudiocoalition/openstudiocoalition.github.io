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

    let promises : Promise<FirebaseFirestore.WriteResult>= [];
    snapshot.forEach((doc) => {
      const data = doc.data();

      if (!data.hasOwnProperty('signMailingList')) {
        const ref = doc.ref;
        promises.push(
          ref.update({
            signMailingList: true
          })
        );
        console.log(`ID: ${doc.id}, Data: ${JSON.stringify(doc.data())}`);
      }
      if (!data.hasOwnProperty('joinBetaTester')) {
        const ref = doc.ref;
        promises.push(
          ref.update({
            joinBetaTester: false
          })
        );
        console.log(`ID: ${doc.id}, Data: ${JSON.stringify(doc.data())}`);
      }

    });

    return Promise.all(promises);
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
