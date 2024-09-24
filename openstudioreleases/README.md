# OpenStudioCoalition GitHub IO Release Pages

## Install Yarn and package dependencies

Install the `yarn` package manager. Assuming you have installed nodejs and npm, `npm install -g yarn`

Now install the dependencies:

```shell
yarn install
```

## Setup secrets

### Download Firebase config file

Go to [OSC Downloads](https://console.firebase.google.com/u/2/project/osc-downloads/overview), you can access this with the OSC email.

https://support.google.com/firebase/answer/7015592?hl=en#zippy=%2Cin-this-article

Go to the OSC Downloads's Settings, get values from the osc "Config" snippet and place it at `firebase-config.json` next to this readme, changing the format to be a JSON one:

```json
{
  "apiKey": "XXXXX",
  "authDomain": "XXXXX",
  "projectId": "osc-downloads",
  "storageBucket": "XXXXX",
  "messagingSenderId": "XXXXX",
  "appId": "XXXXX",
  "measurementId": "XXXXX"
}
```

Additionally, do `cp .env.example .env`

Then edit it to add the values to each key.

### Google Analytics

Set the `GA_ID` in the `.env` file. This is the Measurement ID for the OS App website itself (OS App Git - GA4)

## Running the website
Run dev mode

```bash
yarn dev
```

Build

```bash
yarn build
```

### Too many open files error

*Note:* if you get this error: `Error: EMFILE: too many open files, watch 'path/to/openstudiocoalition.github.io/openstudioreleases/public'`

On ubuntu 24.04, I modified `/etc/sysctl.conf`, added

```
# Default: 128
fs.inotify.max_user_instances = 512
# Default: 65536
fs.inotify.max_user_watches = 524288
```

Reloaded: `sudo sysctl --system`


## Update release assets

This will parse the Github Releases and save a JSON at `src/releases/releases.json`

```bash
yarn es scripts/getReleaseInfo.ts
```

## Firebase

[OSC Downloads](https://console.firebase.google.com/u/2/project/osc-downloads/overview)

### Firebase Auth

We use Firebase Auth to authenticate users.

Only Email/Password is supported.

Modify settings [here](https://console.firebase.google.com/u/2/project/osc-downloads/authentication/settings)

### Firebase Firestore

We use Firestore to store user data.

This is the firestore rule to let the logged user to modify their own data.

This is needed for firstName, lastName, company, occupation, country

```javascript
rules_version = '2';

service cloud.firestore {
  match /databases/{database}/documents {
    // Match any document in the 'users' collection
    match /users/{userId} {
      // Allow read/write if the user is authenticated and the user ID matches
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

The data is stored in the `users` collection.

The script below will get all users from the database and save to a json file.

For it to work, you need the `firebase-service-account.json` with the private key next to this README.md (Ask the maintainers).

To generate one you will need to go to the [Firebase project Service Accounts settings](https://console.firebase.google.com/u/0/project/osc-downloads/settings/serviceaccounts/adminsdk)

Generate a new private key, and save it to `firebase-service-account.json`. **Note: as soon as you generate a new private key, the old key will stop working, so ask the maintainers to provide it instead**

```bash
yarn es scripts/getUsers.ts
```

### Firebase Storage

We use Firebase Storage to store release assets

Modify the [rules](https://console.firebase.google.com/u/2/project/osc-downloads/storage/osc-downloads.appspot.com/rules)

This is the rule to enable any logged user to download the release assets

```javascript
rules_version = '2';

service firebase.storage {
  match /b/{bucket}/o {
    // Match all paths
    match /{allPaths=**} {
      // Allow read access for authenticated users
      allow read: if request.auth != null;
      // Deny all write access
      allow write: if false;
    }
  }
}
```

The bucket name is `gs://osc-downloads.appspot.com`

Install the Google Cloud SDK

```bash
curl https://sdk.cloud.google.com | bash
exec -l $SHELL
gcloud init
```

Upload `./config/cors.json` to the bucket

```bash
gcloud storage buckets update gs://osc-downloads.appspot.com --cors-file=cors.json
```

### Download and Upload release assets

```bash
yarn es scripts/getReleaseInfo.ts
yarn es scripts/syncReleaseAssets.ts
```

# TODO: explain this

set `.env.prd` for production build
