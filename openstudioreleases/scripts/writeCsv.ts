import { stringify } from "csv-stringify/sync";
import fs from 'fs';
import path from 'path';
import util from 'util';

const writeFile = util.promisify(fs.writeFile);

const cwd = process.cwd();

export const writeCsv = async (filename: string, data: any) => {
  const csvFile = path.join(cwd, `${filename}.csv`);

  let csvData = [];
  let columns = ['id','firstName','lastName','occupation','company','email','joinBetaTester','signMailingList','country'];

  let row = [];
  columns.forEach(column => {
    row.push(column);
  });
  csvData.push(row);

  data.forEach(element => {
    row = [];
    columns.forEach(column => {
      value = element[column];
      switch (column) {
        case 'joinBetaTester':
          value = value == 1 ? "True" : "False";
          break;
        case 'signMailingList':
          value = value == 1 ? "True" : "False";
          break;
        default:
          break;
      }
      row.push(value);
    });
    csvData.push(row);
  });

  await writeFile(csvFile, stringify(csvData));
};
