import { AppBar, Toolbar, Typography, Button } from '@mui/material';
import { signOut } from 'firebase/auth';
import { firebaseAuth} from './firebase'
import { useNavigate } from 'react-router-dom';
import { BASENAME } from './routes';

export const Header = () => {
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut(firebaseAuth);
  };

  return (
    <AppBar position="static">
      <Toolbar>
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          OpenStudio Coalition Releases
        </Typography>
        <Button color="inherit" onClick={() => navigate(`${BASENAME}/releases`)}>
          Releases
        </Button>
        <Button color="inherit" onClick={() => navigate(`${BASENAME}/profile`)}>
          My Profile
        </Button>
        <Button color="inherit" onClick={handleSignOut}>
          Sign Out
        </Button>
      </Toolbar>
    </AppBar>
  );
};
