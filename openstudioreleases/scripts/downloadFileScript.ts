import * as path from 'path';
import {downloadFile} from './downloadFile';

const cwd = process.cwd();

const outputPath = path.join(cwd, 'OpenStudioApplication-1.7.1.dmg');

const run = async () => {
  await downloadFile(cwd, outputPath);
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
