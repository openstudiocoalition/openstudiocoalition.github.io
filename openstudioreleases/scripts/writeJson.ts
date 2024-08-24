import fs from 'fs';
import path from 'path';
import util from 'util';

const writeFile = util.promisify(fs.writeFile);

const cwd = process.cwd();

export const writeJson = async (filename: string, data: any) => {
  const jsonFile = path.join(cwd, `${filename}.json`);

  // eslint-disable-next-line
  console.log(`json at: ${jsonFile}`);

  await writeFile(jsonFile, JSON.stringify(data, null, 2));
};
