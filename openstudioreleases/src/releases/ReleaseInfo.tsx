import {
  Button,
  Card,
  CardContent,
  Divider,
  Link,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  SvgIcon,
  Typography,
} from '@mui/material';
import AppleIcon from '@mui/icons-material/Apple';
import MicrosoftIcon from '@mui/icons-material/Microsoft';
import Markdown from 'react-markdown';
import rehypeRaw from 'rehype-raw'
import { firebaseStorage } from '../firebase';
import { getDownloadURL, getMetadata, ref } from 'firebase/storage';
import { enqueueSnackbar } from 'notistack';
import { getFirebaseKeyFromReleaseAsset } from './getFirebaseKeyFromReleaseAsset';
import { gaDownloadClick } from '../ga/gaEvents';

const wrapSvgPath = (path, viewBox='0 0 24 24') => (props) => (
    <SvgIcon {...props} viewBox={viewBox}>{path}</SvgIcon>
);

const linuxPath = (<path
    d="M14.62 8.35c-.42.28-1.75 1.04-1.95 1.19c-.39.31-.75.29-1.14-.01c-.2-.16-1.53-.92-1.95-1.19c-.48-.31-.45-.7.08-.92c1.64-.69 3.28-.64 4.91.03c.49.21.51.6.05.9m7.22 7.28c-.93-2.09-2.2-3.99-3.84-5.66a4.3 4.3 0 0 1-1.06-1.88c-.1-.33-.17-.67-.24-1.01c-.2-.88-.29-1.78-.7-2.61c-.73-1.58-2-2.4-3.84-2.47c-1.81.05-3.16.81-3.95 2.4c-.21.43-.36.88-.46 1.34c-.17.76-.32 1.55-.5 2.32c-.15.65-.45 1.21-.96 1.71c-1.61 1.57-2.9 3.37-3.88 5.35c-.14.29-.28.58-.37.88c-.19.66.29 1.12.99.96c.44-.09.88-.18 1.3-.31c.41-.15.57-.05.67.35c.65 2.15 2.07 3.66 4.24 4.5c4.12 1.56 8.93-.66 9.97-4.58c.07-.27.17-.37.47-.27c.46.14.93.24 1.4.35c.49.09.85-.16.92-.64c.03-.26-.06-.49-.16-.73" />
);

export const LinuxIcon = wrapSvgPath(linuxPath);

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


const assetIcon = (platform) => {
  if (platform == 'mac') {
    return <ListItemIcon>
             <AppleIcon />
           </ListItemIcon>;
  }
  if (platform == 'windows') {
    return <ListItemIcon>
             <MicrosoftIcon />
           </ListItemIcon>;
  }
  if (platform == 'linux') {
    return <ListItemIcon>
             <LinuxIcon />
           </ListItemIcon>;
  }
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
        <Markdown rehypePlugins={[rehypeRaw]}>{release.body}</Markdown>
        <Divider/>
        <Typography variant='h4' gutterBottom>
          Assets:
        </Typography>
        <List>
          {release.assets.map((asset) => (
            <ListItem key={asset.name}>
              {assetIcon(extractPlatform(asset.name))}
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
