import * as path from 'path';
import releases from '../src/releases/releases.json';
import {downloadFile} from './downloadFile';
import {checkFileExists} from './syncReleaseAssets';

const cwd = process.cwd();

const run = async () => {
  for (const release of releases) {
    for (const asset of release.assets) {
      const key = `assets/${release.tag_name}/${asset.name}`;
      const outputPath = path.join(cwd, key);

      if (!(await checkFileExists(outputPath))) {
        await downloadFile(asset.browser_download_url, outputPath);
      }
    }
  }
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
