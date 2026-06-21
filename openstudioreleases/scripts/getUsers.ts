import { writeCsv } from './writeCsv';
import { writeJson } from './writeJson';
import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';

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

    // Build a map of uid -> auth metadata (creationTime, lastSignInTime)
    const authMetaMap: Record<string, { signUpDate: string; lastSignInDate: string; longevity: number | string }> = {};
    let nextPageToken: string | undefined;
    do {
      const listResult = await getAuth().listUsers(1000, nextPageToken);
      listResult.users.forEach((userRecord) => {
        const toYYYYMMDD = (dateStr: string | undefined): string => {
          if (!dateStr) return '';
          const d = new Date(dateStr);
          const yyyy = d.getUTCFullYear();
          const mm = String(d.getUTCMonth() + 1).padStart(2, '0');
          const dd = String(d.getUTCDate()).padStart(2, '0');
          return `${yyyy}${mm}${dd}`;
        };
        const creationDate = userRecord.metadata.creationTime ? new Date(userRecord.metadata.creationTime) : null;
        const refreshDate = userRecord.metadata.lastRefreshTime ? new Date(userRecord.metadata.lastRefreshTime) : null;
        const longevity = creationDate && refreshDate
          ? Math.round((refreshDate.getTime() - creationDate.getTime()) / (1000 * 60 * 60 * 24))
          : '';
        authMetaMap[userRecord.uid] = {
          signUpDate: toYYYYMMDD(userRecord.metadata.creationTime),
          lastSignInDate: toYYYYMMDD(userRecord.metadata.lastRefreshTime),
          longevity,
        };
      });
      nextPageToken = listResult.pageToken;
    } while (nextPageToken);

    let users = [];
    snapshot.forEach((doc) => {
      const meta = authMetaMap[doc.id] ?? { signUpDate: '', lastSignInDate: '' };
      users = [
        ...users,
        { ...doc.data(), id: doc.id, ...meta },
      ];
      console.log(`ID: ${doc.id}, Data: ${JSON.stringify(doc.data())}`);
    });

    console.log(`We have ${users.length} Registered Users`);
    await writeCsv('users', users);
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
