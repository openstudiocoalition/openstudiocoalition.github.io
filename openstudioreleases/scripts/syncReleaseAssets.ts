import * as path from 'path';
import {downloadFile} from './downloadFile';
import * as fs from 'fs/promises';
import { firebaseBucket } from './firebaseAdmin';
import releases from '../src/releases/releases.json';
import {uploadStorage} from './uploadStorage';
import {promiseAllLimit} from './promiseAllLimit';
import AdmZip from 'adm-zip';

import { getFirebaseKeyFromReleaseAsset, isExecutable } from '../src/releases/getFirebaseKeyFromReleaseAsset';

const cwd = process.cwd();

export const checkFileExistsStorage = async (filePath: string): Promise<boolean>  => {
  try {
    const file = firebaseBucket.file(filePath);
    await file.getMetadata(); // This will throw an error if the file does not exist
    return true;
  } catch (error: any) {
    if (error.code === 404) {
      return false;
    }
    throw error; // Re-throw unexpected errors
  }
}

export const checkFileExists = async (filePath: string): Promise<boolean> => {
  try {
    await fs.access(filePath);
    return true;
  } catch (error) {
    if (error.code === 'ENOENT') {
      return false;
    }
    throw error; // Re-throw unexpected errors
  }
}

const zipFile = async (inputPath: string, outputPath: string) => {
  const zip = new AdmZip();

  zip.addLocalFile(inputPath, outputPath);
  await zip.writeZipPromise(outputPath);
}

const downloadUploadAsset = async (asset: any, release: any) => {
  // firebase key is the same as the download key if download is not an executable, otherwise it is a .zip file

  const downloadKey = `assets/${release.tag_name}/${asset.name}`;
  const firebaseKey = getFirebaseKeyFromReleaseAsset(release, asset);
  const outputPath = path.join(cwd, downloadKey);

  if (await checkFileExistsStorage(firebaseKey)) {
    console.log(`File already exists on bucket: ${firebaseKey}`);
    return;
  }

  // check if file exists on fs
  if (!(await checkFileExists(outputPath))) {
    await downloadFile(asset.browser_download_url, outputPath);
  }

  // after download we need to zip the file
  if (isExecutable(asset.name)) {
    const zipfilepath = `${outputPath}.zip`;

    if (!(await checkFileExists(zipfilepath))) {
      await zipFile(outputPath, zipfilepath);
    }
  }

  // upload to storage
  await uploadStorage(outputPath, firebaseKey);
}

const run = async () => {
  let allReleases = [];

  // download file from github and upload to firebase storage
  // check if file exists on storage
  for (const release of releases) {
    for (const asset of release.assets) {
      allReleases = [
        ...allReleases,
        {
          release,
          asset,
        }
      ];
    }
  }

  await promiseAllLimit(allReleases, 2, async ({release, asset}) => {
    await downloadUploadAsset(asset, release);
  });
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
