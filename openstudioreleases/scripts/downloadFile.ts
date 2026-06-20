import path from 'path';
import { pipeline } from 'stream/promises';
import { Readable } from 'stream';
import fs from 'fs';
import * as fsPromises from 'fs/promises';

const createDirectoriesRecursively = async (dirPath: string): Promise<void> => {
  try {
    await fsPromises.mkdir(dirPath, { recursive: true });
    console.log(`Directory ${dirPath} created successfully.`);
  } catch (error) {
    console.error(`Error creating directory ${dirPath}:`, error);
    throw error; // Re-throw the error for further handling if needed
  }
}


export const downloadFile = async (fileUrl: string, outputPath: string) => {
  const name = path.basename(outputPath);

  const response = await fetch(fileUrl);
  if (!response.ok) {
    throw new Error(`HTTP error! Status: ${response.status}`);
  }

  await createDirectoriesRecursively(path.dirname(outputPath));

  const totalBytes = parseInt(response.headers.get('content-length') || '0', 10);
  let downloadedBytes = 0;

  const nodeStream = Readable.fromWeb(response.body as any);

  nodeStream.on('data', (chunk: Buffer) => {
    downloadedBytes += chunk.length;
    const progress = ((downloadedBytes / totalBytes) * 100).toFixed(2);
    console.log(`(${name}) Download progress: ${progress}%`);
  });

  const fileStream = fs.createWriteStream(outputPath);
  await pipeline(nodeStream, fileStream);

  console.log(`(${name}) Download complete.`);
}