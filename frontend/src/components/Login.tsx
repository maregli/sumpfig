import React, {useState} from 'react';
import { Button, Typography, TextField, Dialog, DialogActions, DialogContent, DialogTitle, Box } from '@mui/material';
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
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <Box 
          sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: 1.5,
            backgroundColor: 'rgba(255, 255, 255, 0.15)',
            px: 2,
            py: 1,
            borderRadius: '12px',
            backdropFilter: 'blur(10px)',
          }}
        >
          <Box
            sx={{
              width: 32,
              height: 32,
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 700,
              color: 'white',
              fontSize: '0.9rem',
            }}
          >
            {(user.displayName ?? user.email ?? 'U')[0].toUpperCase()}
          </Box>
          <Typography 
            variant="body1" 
            sx={{ 
              fontWeight: 600,
              color: 'white',
              textShadow: '0 1px 2px rgba(0, 0, 0, 0.2)',
            }}
          >
            {user.displayName ?? user.email}
          </Typography>
        </Box>
        <Button
          variant="outlined"
          onClick={handleLogout}
          startIcon={<LogoutIcon />}
          sx={{
            color: 'white',
            borderColor: 'rgba(255, 255, 255, 0.5)',
            borderWidth: 2,
            fontWeight: 600,
            '&:hover': {
              borderColor: 'white',
              backgroundColor: 'rgba(255, 255, 255, 0.15)',
              borderWidth: 2,
            },
          }}
        >
          Logout
        </Button>
      </Box>
    );
  }

  return (
    <>
      <Button 
        variant="contained" 
        onClick={() => setOpen(true)}
        sx={{
          background: 'rgba(255, 255, 255, 0.95)',
          color: '#6366f1',
          fontWeight: 700,
          px: 3,
          py: 1.2,
          '&:hover': {
            background: 'white',
            transform: 'translateY(-2px)',
            boxShadow: '0 8px 20px rgba(0, 0, 0, 0.2)',
          },
        }}
      >
        Login
      </Button>
  
      <Dialog 
        open={open} 
        onClose={() => setOpen(false)} 
        maxWidth="xs" 
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: '24px',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          }
        }}
      >
        <DialogTitle 
          textAlign="center" 
          sx={{ 
            pt: 4, 
            pb: 2,
            background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
            color: 'white',
            fontWeight: 700,
            fontSize: '1.5rem',
          }}
        >
          Welcome to Sumpfig
        </DialogTitle>
  
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', pt: 3, pb: 2 }}>
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
  
        <DialogActions sx={{ justifyContent: 'space-between', px: 3, pb: 3, pt: 2 }}>
          <Button 
            onClick={() => setOpen(false)}
            sx={{ 
              color: '#64748b',
              fontWeight: 600,
            }}
          >
            Cancel
          </Button>
          {!isSignUp ? (
  <Box sx={{ display: 'flex', gap: 1 }}>
    <Button 
      onClick={handleEmailPasswordLogin} 
      variant="contained"
      sx={{
        background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
        fontWeight: 600,
        px: 3,
      }}
    >
      Login
    </Button>
    <Button 
      onClick={() => setIsSignUp(true)} 
      variant="text"
      sx={{
        color: '#6366f1',
        fontWeight: 600,
      }}
    >
      Sign Up
    </Button>
  </Box>
) : (
  <Box sx={{ display: 'flex', gap: 1 }}>
    <Button 
      onClick={handleEmailPasswordSignUp} 
      variant="contained"
      sx={{
        background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
        fontWeight: 600,
        px: 3,
      }}
    >
      Sign Up
    </Button>
    <Button 
      onClick={() => setIsSignUp(false)} 
      variant="text"
      sx={{
        color: '#6366f1',
        fontWeight: 600,
      }}
    >
      Back to Login
    </Button>
  </Box>
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
