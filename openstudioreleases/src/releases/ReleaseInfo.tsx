import {
  Button,
  Card,
  CardContent,
  Link,
  List,
  ListItem,
  ListItemText,
  Typography,
} from '@mui/material';
import Markdown from 'react-markdown';
import { firebaseStorage } from '../firebase';
import { getDownloadURL, getMetadata, ref } from 'firebase/storage';
import { enqueueSnackbar } from 'notistack';
import { getFirebaseKeyFromReleaseAsset } from './getFirebaseKeyFromReleaseAsset';
import { gaDownloadClick } from '../ga/gaEvents';

export const extractPlatform = (fileName: string) => {
  if (fileName.includes('macOS')) {
    return 'mac';
  } else if (fileName.includes('Windows')) {
    return 'windows';
  } else if (fileName.includes('Ubuntu')) {
    return 'linux';
  }

  return 'unknown';
}

export type Release = {
  name: string;
  tag_name: string;
  body: string;
  assets: AssetsItem[];
};
export type AssetsItem = {
  url: string;
  name: string;
  browser_download_url: string;
  firestore: string;
};

export const checkFileExistsStorage = async (
  filePath: string,
): Promise<boolean> => {
  try {
    const fileRef = ref(firebaseStorage, filePath);
    await getMetadata(fileRef);
    return true;
  } catch (error: any) {
    if (error.code === 'storage/object-not-found') {
      return false;
    }
    throw error; // Re-throw unexpected errors
  }
};

type Props = {
  release: Release;
};
export const ReleaseInfo = ({ release }: Props) => {
  const onDownload = async (e, release: Release, asset: AssetsItem) => {
    e.preventDefault();
    try {
      const key = getFirebaseKeyFromReleaseAsset(release, asset);

      // Get the download URL for the file
      const fileRef = ref(firebaseStorage, key);

      if (!(await checkFileExistsStorage(key))) {
        enqueueSnackbar('Asset not found');
        return;
      }

      const platform = extractPlatform(asset.name);

      gaDownloadClick(asset.name, release.tag_name, platform);

      const url = await getDownloadURL(fileRef);

      // Fetch the file from the URL
      // const response = await fetch(url);
      // const blob = await response.blob();

      // Create a link element and simulate a click to download the file
      const link = document.createElement('a');
      link.href = url;
      // link.href = window.URL.createObjectURL(blob);
      link.download = asset.name; // Replace with the desired file name

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      console.log('File downloaded successfully');
    } catch (error) {
      console.error('Error downloading file:', error);
    }
  };

  return (
    <Card>
      <CardContent>
        <Typography variant='h5' component='div' gutterBottom>
          {release.name}
        </Typography>
        <Markdown>{release.body}</Markdown>
        <Typography variant='subtitle1' gutterBottom>
          Assets:
        </Typography>
        <List>
          {release.assets.map((asset) => (
            <ListItem key={asset.name}>
              <ListItemText>
                <Link
                  href={'#'}
                  target='_blank'
                  rel='noopener'
                  onClick={(e) => onDownload(e, release, asset)}
                >
                  {asset.name}
                </Link>
              </ListItemText>
            </ListItem>
          ))}
        </List>
      </CardContent>
    </Card>
  );
};