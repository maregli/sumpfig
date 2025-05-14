import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from 'firebaseServices/firebaseConfig';
import { getUserFromId } from 'firebaseServices/firestore';
import { UserRole } from 'types/users';

interface AuthContextType {
  user: UserRole | null;
  setUser: (user: UserRole | null) => void;
  activeGroupId: string | null;
  setActiveGroupId: (id: string | null) => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  setUser: () => {},
  activeGroupId: null,
  setActiveGroupId: () => {},
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<UserRole | null>(null);
  const [activeGroupId, setActiveGroupId] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (!currentUser) {
        setUser(null);
        setActiveGroupId(null); // Clear group on logout
        return;
      }

      const dbUser = await getUserFromId(currentUser.uid);
      if (dbUser) {
        setUser(dbUser);
        // Optional: auto-select default group here if you want
        // setActiveGroupId(dbUser.groups?.[0]?.id ?? null);
      }
    });

    return () => unsubscribe();
  }, []);

  return (
    <AuthContext.Provider
      value={{ user, setUser, activeGroupId, setActiveGroupId }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
