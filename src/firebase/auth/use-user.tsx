'use client';

import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { getAuth, onAuthStateChanged, User } from 'firebase/auth';
import { useFirebaseApp } from '../provider';

interface UserContextType {
  user: User | null;
  loading: boolean;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const app = useFirebaseApp();
  const auth = getAuth(app);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });
    return () => unsubscribe();
  }, [auth]);

  return (
    <UserContext.Provider value={{ user, loading }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = (): UserContextType => {
  const context = useContext(UserContext);
  if (context === undefined) {
    // This is a special case. Since useUser can be used anywhere,
    // we provide a fallback provider if one isn't already in the tree.
    // This simplifies usage and avoids having to wrap everything in UserProvider.
    return useUserWrapper();
  }
  return context;
};

// This is a helper component to ensure useUser always has a provider.
const useUserWrapper = (): UserContextType => {
    const app = useFirebaseApp();
    const auth = getAuth(app);
    const [user, setUser] = useState<User | null>(auth.currentUser);
    const [loading, setLoading] = useState(auth.currentUser === null);
  
    useEffect(() => {
      const unsubscribe = onAuthStateChanged(auth, (user) => {
        setUser(user);
        setLoading(false);
      });
      return () => unsubscribe();
    }, [auth]);
  
    return { user, loading };
};
