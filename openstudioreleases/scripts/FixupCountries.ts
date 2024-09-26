import { writeJson } from './writeJson';
import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

import serviceAccount from '../firebase-service-account.json';
import { countries } from '../src/fields/CountrySelect'

initializeApp({
  credential: cert(serviceAccount)
});

const db = getFirestore();

const country_names = countries.map((e) => e.label);

// This is a semi-automatic mapping (fuzzy matching) done via python then fixed
// up manually and exported to a json
import remap_countries from './remap_countries.json';

const run = async () => {
    const usersRef = db.collection('users');
    const snapshot = await usersRef.get();

    if (snapshot.empty) {
      console.log('No users found.');
      return;
    }

    let promises : Promise<FirebaseFirestore.WriteResult>= [];
    let invalidCountries = [];
    snapshot.forEach((doc) => {
      const data = doc.data();

      const ori_country = data.country;

      if (country_names.includes(ori_country)) {
        return;
      }

      if (remap_countries.hasOwnProperty(ori_country)) {
        const new_country = remap_countries[ori_country];
        const ref = doc.ref;
        promises.push(
          ref.update({
            country: new_country
          })
        );
        console.log(`ID: ${doc.id}, Data: ${JSON.stringify(doc.data())}`);
      } else {
        invalidCountries.push(ori_country);
      }


    });
    console.log(`There are ${invalidCountries.length} Invalid countries left: `, invalidCountries);
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
