# OpenStudioCoalition GitHub IO Release Pages

Run dev mode
```bash
yarn dev
```

Build

```bash
yarn build
```

## Update release assets

```bash
yarn es scripts/getReleaseInfo.ts
```

## Firebase

[Test Project](https://console.firebase.google.com/u/0/project/testproject-c3dda/overview)

### Firebase Auth

We use Firebase Auth to authenticate users.

Only Email/Password is supported.

Modify settings [here](https://console.firebase.google.com/u/0/project/testproject-c3dda/authentication/settings)

### Firebase Firestore

We use Firestore to store user data.

This is the firestore rule to let the logged user to modify their own data.

This is needed for firstName, lastName, company, occupation, country

```yaml
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

The script below will get all users from the database and save to a json file

```bash
yarn es scripts/getUsers.ts
```

### Firebase Storage

We use Firebase Storage to store release assets

Modify the [rules](https://console.firebase.google.com/u/0/project/testproject-c3dda/storage/testproject-c3dda.appspot.com/rules)

This is the rule to enable any logged user to download the release assets

```yaml
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

The bucket name is `gs://testproject-c3dda.appspot.com`

Install the Google Cloud SDK

```bash
curl https://sdk.cloud.google.com | bash
exec -l $SHELL
gcloud init
```

Upload `cors.json` to the bucket

```bash
gsutil cors set cors.json gs://testproject-c3dda.appspot.com
```

### Download and Upload release assets

```bash
yarn es scripts/downloadReleaseAssets.ts
```

## Google Analytics

Set the `GA_ID` in the `.env` file

set `.env.prd` for production build