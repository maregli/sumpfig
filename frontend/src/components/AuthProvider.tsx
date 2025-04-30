import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, onAuthStateChanged } from 'firebase/auth';
import { auth } from 'firebaseServices/firebaseConfig';
import { getUserFromId, addUser } from 'firebaseServices/firestore';
import { UserRole } from 'types/users';

interface AuthContextType {
  user: UserRole | null;
}

const AuthContext = createContext<AuthContextType>({ user: null });

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<UserRole | null>(null);

  const handleAuthStateChange = async (currentUser: User | null) => {
    if (currentUser) {
      const userData : UserRole | null = await getUserFromId(currentUser.uid);
      if (userData) {
        setUser(userData);
      } else {
        console.log("User not found in Firestore, adding new user...");
        console.log("Current User:", currentUser);
        const userWithRole: UserRole = {
          uid: currentUser.uid,
          displayName: currentUser.displayName || "Anonymous",
          email: currentUser.email || "Anonymous",
          role: "user", // Default role if user not found in Firestore
        };
        setUser(userWithRole);
        await addUser(userWithRole);
      }
    } else {
      setUser(null); // User is signed out
    }
  };


  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      handleAuthStateChange(currentUser);
    });

    return () => unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ user }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
