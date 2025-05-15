import React, {useState} from 'react';
import { Button, Typography, TextField, Dialog, DialogActions, DialogContent, DialogTitle } from '@mui/material';
import { auth } from 'firebaseServices/firebaseConfig';
// import { GoogleAuthProvider } from 'firebase/auth';
import {
  // signInWithPopup,
  signOut, createUserWithEmailAndPassword, signInWithEmailAndPassword
} from 'firebase/auth';
// import LoginIcon from '@mui/icons-material/Login';
import LogoutIcon from '@mui/icons-material/Logout';
// import GoogleIcon from '@mui/icons-material/Google'; // You can use a custom SVG or this icon
import { useAuth } from 'components/AuthProvider';
import { addUser, getUserFromId } from 'firebaseServices/firestore';
import { UserRole } from 'types/users';
import ErrorDialog from './ErrorDialog';


const LoginButton: React.FC = () => {
  const { user, setUser } = useAuth();
  const [open, setOpen] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordRepeat, setPasswordRepeat] = useState('');
  const [error, setError] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [loginToken, setLoginToken] = useState('');

  // const handleGoogleLogin = async () => {
  //   const provider = new GoogleAuthProvider();
  //   provider.setCustomParameters({
  //     prompt: 'select_account'
  //   });

  //   try {
  //     const authUser = await signInWithPopup(auth, provider);
  //     const dbUser = await getUserFromId(authUser.user.uid);
  //     if (!dbUser) {
  //       console.log('Google User not found in Firestore, creating new user...');
  //       const newUser: UserRole = {
  //         uid: authUser.user.uid,
  //         displayName: authUser.user.displayName || 'Anonymous',
  //         email: authUser.user.email || 'Anonymous',
  //         role: 'user', // Default role, you can change this based on your logic
  //       };
  //       await addUser(newUser);
  //       setUser(newUser);
  //       console.log('Set new user:', newUser);
  //     } else {
  //       setUser(dbUser);
  //       console.log('User found in Firestore:', dbUser);
  //     }
  //     setOpen(false);
  //   } catch (err) {
  //     console.error('Login failed:', err);
  //   }
  // };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setUser(null); // Clear user state on logout
    } catch (err) {
      console.error('Logout failed:', err);
    }
  };

  const handleEmailPasswordLogin = async () => {
    try {
      const authUser = await signInWithEmailAndPassword(auth, email, password);
      const dbUser = await getUserFromId(authUser.user.uid);
      setUser(dbUser);
      setOpen(false);
    } catch (error) {
      console.error('Login failed:', error);
      if (typeof error === 'object' && error !== null && 'code' in error) {
        const firebaseError = error as { code: string };
        if (firebaseError.code === 'auth/invalid-credential') {
          setError('Invalid credentials. Wrong email or password? Do you have an account?');
        } else if (firebaseError.code === 'auth/missing-password') {
          setError('Missing password. Please enter your password.');
        } else {
          setError('An error occurred during login. Please try again.');
        }
      } else {
        setError('An unknown error occurred.');
      }
    }
  };

  const handleEmailPasswordSignUp = async () => {
    if (password !== passwordRepeat) {
      setError('Passwords do not match');
      return;
    }

    if (loginToken !== process.env.REACT_APP_LOGIN_AUTH_TOKEN) {
      setError('Invalid login token');
      return;
    }

    try {
      const authUser = await createUserWithEmailAndPassword(auth, email, password);
      const newUser: UserRole = {
        uid: authUser.user.uid,
        displayName: displayName || 'Anonymous',
        email: authUser.user.email || 'Anonymous',
        role: 'user', // Default role, you can change this based on your logic
      };
      await addUser(newUser);
      setUser(newUser);
      setOpen(false);
    } catch (error) {if (typeof error === 'object' && error !== null && 'code' in error) {
      const firebaseError = error as { code: string };
  
      if (firebaseError.code === 'auth/email-already-in-use') {
        setError('Email already in use');
      } else if (firebaseError.code === 'auth/weak-password') {
        setError('Weak password, please choose a stronger one');
      } else {
        setError('An error occurred during sign up. Please try again.');
      }
    } else {
      setError('An unknown error occurred.');
    }
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
    <>
      <Button variant="contained" onClick={() => setOpen(true)}>
        Login
      </Button>
  
      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle textAlign="center">Welcome</DialogTitle>
  
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          {/* <Button
            variant="contained"
            onClick={handleGoogleLogin}
            startIcon={<GoogleIcon />}
            sx={{
              backgroundColor: '#4285F4',
              color: '#fff',
              textTransform: 'none',
              fontWeight: 'bold',
              width: '100%',
              mb: 2,
              '&:hover': {
                backgroundColor: '#357ae8',
              },
            }}
          >
            Sign in with Google
          </Button>
  
          <Typography variant="body2" color="textSecondary" sx={{ my: 1 }}>
            — or sign in with email —
          </Typography> */}
  
          <TextField
            margin="dense"
            label="Email Address"
            type="email"
            fullWidth
            variant="outlined"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <TextField
            margin="dense"
            label="Password"
            type="password"
            fullWidth
            variant="outlined"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          {isSignUp && (
            <>
              <TextField
                margin="dense"
                label="Repeat Password"
                type="password"
                fullWidth
                variant="outlined"
                value={passwordRepeat}
                onChange={(e) => setPasswordRepeat(e.target.value)}
              />
              <TextField
                margin="dense"
                label="Username (for Sign Up)"
                type="text"
                fullWidth
                variant="outlined"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
              />
              <TextField
                margin="dense"
                label="Authorized Login Token (for Sign Up)"
                type="text"
                fullWidth
                variant="outlined"
                value={loginToken}
                onChange={(e) => setLoginToken(e.target.value)}
              />
            </>
          )}
        </DialogContent>
  
        <DialogActions sx={{ justifyContent: 'space-between', px: 3, pb: 2 }}>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          {!isSignUp ? (
  <>
    <Button onClick={handleEmailPasswordLogin} variant="contained">Login</Button>
    <Button onClick={() => setIsSignUp(true)} variant="text">Sign Up</Button>
  </>
) : (
  <>
    <Button onClick={handleEmailPasswordSignUp} variant="contained">Sign Up</Button>
    <Button onClick={() => setIsSignUp(false)} variant="text">Back to Login</Button>
  </>
)}

        </DialogActions>
      </Dialog>
        <ErrorDialog
        open={!!error}
        onClose={() => setError('')}
        title="Error"
        message={error}
        messageType="hint"
      />
    </>
  );
}
export default LoginButton;
