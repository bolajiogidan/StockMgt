import React, { createContext, useContext, useEffect, useState } from 'react';
import { User as FirebaseUser, onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';
import { User } from '../types';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
}

const AuthContext = createContext<AuthContextType>({ 
  user: null, 
  loading: true,
  setUser: () => {} 
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    return onAuthStateChanged(auth, async (firebaseUser) => {
      setLoading(true);
      if (firebaseUser) {
        try {
          // Check if user exists in Firestore
          const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
          
          if (userDoc.exists()) {
            // Check for migration/upgrade
            const existingUser = userDoc.data() as User;
            if (firebaseUser.email?.toLowerCase() === 'bolajiogidan@gmail.com' && existingUser.role !== 'admin') {
               const upgradedUser = { ...existingUser, role: 'admin' as const };
               await setDoc(doc(db, 'users', firebaseUser.uid), upgradedUser);
               setUser(upgradedUser);
            } else {
               setUser({ ...existingUser, email: firebaseUser.email || existingUser.email }); // Ensure email is fresh
            }
          } else {
            // Create a default profile if not exists
            const isAdminEmail = firebaseUser.email?.toLowerCase() === 'bolajiogidan@gmail.com';
            const newUser: User = {
              id: firebaseUser.uid,
              name: firebaseUser.displayName || 'Anonymous User',
              email: firebaseUser.email || '',
              role: isAdminEmail ? 'admin' : 'student',
              department: isAdminEmail ? 'Administration' : 'General'
            };
            await setDoc(doc(db, 'users', firebaseUser.uid), newUser);
            setUser(newUser);
          }
        } catch (error) {
          console.error("Auth initialization error:", error);
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, setUser }}>
      {children}
    </AuthContext.Provider>
  );
};
