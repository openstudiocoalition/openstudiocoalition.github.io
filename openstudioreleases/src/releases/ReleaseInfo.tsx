import {
  Card,
  CardActions,
  CardHeader,
  CardContent,
  Divider,
  Link,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Typography,
} from '@mui/material';
import Markdown from 'react-markdown';
import rehypeRaw from 'rehype-raw'
import { firebaseStorage } from '../firebase';
import { getDownloadURL, getMetadata, ref } from 'firebase/storage';
import { enqueueSnackbar } from 'notistack';
import { getFirebaseKeyFromReleaseAsset } from './getFirebaseKeyFromReleaseAsset';
import { gaDownloadClick } from '../ga/gaEvents';
import { FaWindows } from "react-icons/fa";
import { FaApple } from "react-icons/fa";
import { FaUbuntu } from "react-icons/fa";
import { FaRedhat } from "react-icons/fa";
import { useState } from 'react'
import { styled } from '@mui/material/styles';
import IconButton from '@mui/material/IconButton';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { FaGithub } from 'react-icons/fa';

export const extractPlatform = (fileName: string) => {
  if (fileName.includes('macOS')) {
    return 'mac';
  } else if (fileName.includes('Windows')) {
    return 'windows';
  } else if (fileName.includes('Ubuntu')) {
    return 'linux';
  } else if (fileName.includes('AlmaLinux')) {
    return 'almalinux';
  }

  return 'unknown';
}

export type Release = {
  name: string;
  published_at: string;
  tag_name: string;
  body: string;
  assets: AssetsItem[];
  prerelease: boolean;
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
  index: number;
  displayPreReleases: boolean;
};


const assetIcon = (platform) => {
  if (platform == 'mac') {
    return <ListItemIcon>
             <FaApple color="black" size="1.2em" />
           </ListItemIcon>;
  }
  if (platform == 'windows') {
    return <ListItemIcon>
             <FaWindows color="#08a1f7" size="1.2em" />
           </ListItemIcon>;
  }
  if (platform == 'linux') {
    return <ListItemIcon>
             <FaUbuntu color="#E95420" size="1.2em" />
           </ListItemIcon>;
  }
  if (platform == 'almalinux') {
    return <ListItemIcon>
             <FaRedhat color="#EE0000" size="1.2em" />
           </ListItemIcon>;
  }
};

interface ExpandMoreProps extends IconButtonProps {
  expand: boolean;
}

const ExpandMore = styled((props: ExpandMoreProps) => {
  const { expand, ...other } = props;
  return <IconButton {...other} />;
})(({ theme }) => ({
  marginLeft: 'auto',
  transition: theme.transitions.create('transform', {
    duration: theme.transitions.duration.shortest,
  }),
  variants: [
    {
      props: ({ expand }) => !expand,
      style: {
        transform: 'rotate(0deg)',
      },
    },
    {
      props: ({ expand }) => !!expand,
      style: {
        transform: 'rotate(180deg)',
      },
    },
  ],
}));

export const ReleaseInfo = ({ release, index, displayPreReleases }: Props) => {
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

  if (release.prerelease && !displayPreReleases) {
    return null;
  }

  const [expanded, setExpanded] = useState(index == 0);

  function handleExpandClick() {
    setExpanded(!expanded);
  }

  const githubReleaseUrl: string = `https://github.com/openstudiocoalition/OpenStudioApplication/releases/tag/${release.tag_name}`;
  const shareTitle: string = `OpenStudioApplication Release ${release.name}`;

  return (
    <Card>
      <CardHeader
        title={release.name}
        titleTypographyProps={{color: release.prerelease ? 'orange' : 'green', variant:'h3'}}
        subheader={`Published ${new Date(release.published_at).toISOString().split('T')[0]}`}
        action={
          <ExpandMore
            expand={expanded}
            onClick={handleExpandClick}
            aria-expanded={expanded}
            aria-label="show more"
          >
            <ExpandMoreIcon />
          </ExpandMore>
        }
      />
      {expanded &&
      <CardContent>
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
      }
      <CardActions disableSpacing>
        <IconButton component={Link} href={githubReleaseUrl} target="_blank" rel="noopener" title="View on Github">
          <FaGithub />
        </IconButton>
      </CardActions>
    </Card>
  );
};
