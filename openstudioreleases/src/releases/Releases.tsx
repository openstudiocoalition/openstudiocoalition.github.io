import releases from './releases.json';
import { ReleaseInfo } from './ReleaseInfo';
import { Box, Container, Stack } from '@mui/material';
import { Header } from '../Header';

export const Releases = () => {
  return (
    <>
      <Header />
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
            {releases.map((release) => (
              <ReleaseInfo release={release} key={release.name} />
            ))}
          </Stack>
        </Container>
      </Box>
    </>
  );
};
