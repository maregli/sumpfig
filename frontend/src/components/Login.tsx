import React from 'react';
import { Button, Typography } from '@mui/material';
import { auth } from 'firebaseServices/firebaseConfig';
import { GoogleAuthProvider } from 'firebase/auth';
import { signInWithPopup, signOut } from 'firebase/auth';
import LoginIcon from '@mui/icons-material/Login';
import LogoutIcon from '@mui/icons-material/Logout';
import { useAuth } from 'components/AuthProvider';

const LoginButton: React.FC = () => {
    const { user } = useAuth();
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({
    prompt: 'select_account'});

  const handleLogin = async () => {
    try {
      await signInWithPopup(auth, provider);
    } catch (err) {
      console.error('Login failed:', err);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (err) {
      console.error('Logout failed:', err);
    }
  };

  if (user) {
    return (
      <>
        <Typography variant="body1" sx={{ mr: 2 }}>
          {user.displayName ?? user.email}
        </Typography>
        <Button
          variant="outlined"
          color="secondary"
          onClick={handleLogout}
          startIcon={<LogoutIcon />}
        >
          Logout
        </Button>
      </>
    );
  }

  return (
    <Button
      variant="contained"
      color="primary"
      startIcon={<LoginIcon />}
      onClick={handleLogin}
      sx={{
        margin: '10px',
        backgroundColor: '#1976d2',
        color: 'white',
        fontSize: '16px',
        padding: '10px 20px',
      }}
    >
      Login
    </Button>
  );
};

export default LoginButton;
