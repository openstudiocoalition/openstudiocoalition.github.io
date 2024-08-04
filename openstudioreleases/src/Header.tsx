import { AppBar, Toolbar, Typography, Button } from '@mui/material';
import { signOut } from 'firebase/auth';
import { firebaseAuth} from './firebase'

export const Header = () => {
  const handleSignOut = async () => {
    // Add sign-out logic here
    console.log('Signing out...');
    await signOut(firebaseAuth);
  };

  return (
    <AppBar position="static">
      <Toolbar>
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          OpenStudio Coalition Releases
        </Typography>
        <Button color="inherit" onClick={handleSignOut}>
          Sign Out
        </Button>
      </Toolbar>
    </AppBar>
  );
};
