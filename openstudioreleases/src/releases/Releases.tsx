import releases from './releases.json';
import { ReleaseInfo } from './ReleaseInfo';
import { Box, Checkbox, FormControlLabel, Container, Stack } from '@mui/material';
import { Header } from '../Header';
import { useState } from 'react';

export const Releases = () => {

  const [displayPreReleases, setDisplayPreReleases] = useState(false);
  
  function handleDisplayPreReleases() {
    setDisplayPreReleases(!displayPreReleases);
  }

  return (
    <>
      <Header />
      <FormControlLabel
        label="Display Pre-releases"
        control={
          <Checkbox
            checked={displayPreReleases}
            onChange={handleDisplayPreReleases}
            inputProps={{ 'aria-label': 'controlled' }}
          />
        }
      />
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '100vh',
          p: 5,
        }}
      >
        <Container maxWidth='md'>
          <Stack spacing={2}>
            {releases.map((release, index) => (
              <ReleaseInfo release={release} key={release.name} index={index} displayPreReleases={displayPreReleases}/>
            ))}
          </Stack>
        </Container>
      </Box>
    </>
  );
};
