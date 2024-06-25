import React, { createContext, useContext, useEffect, useState } from 'react';
import { getAuth, onAuthStateChanged, User } from 'firebase/auth';
import { doc, getDoc, getFirestore } from 'firebase/firestore';
import { firebaseConfig } from '../config/firebaseConfig'; // Changed to use firebaseConfig from separate config file
import { initializeApp } from 'firebase/app';

const firebaseApp = initializeApp(firebaseConfig); // Initialize Firebase app with config

// Define the shape of the context data for authentication
interface AuthContextType {
  user: User | null;
  loading: boolean;
  userRole: string | null;
  setUser: (user: User | null) => void;
  setUserRole: (role: string | null) => void;
}

// Create a Context with an undefined initial value
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Custom hook for easy Context consumption
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Provider Component
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setLoading(true);
      const auth = getAuth(firebaseApp);
      const db = getFirestore(firebaseApp);
      const unsubscribe = onAuthStateChanged(auth, async (authUser) => {
        if (authUser) {
          const userDocRef = doc(db, "users", authUser.uid);
          try {
            const userDoc = await getDoc(userDocRef);
            if (userDoc.exists()) {
              const userData = userDoc.data();
              const savedUser = localStorage.getItem('user');
              const savedUserRole = localStorage.getItem('userRole');

              if (!savedUser || !savedUserRole || JSON.parse(savedUser).uid !== authUser.uid || savedUserRole !== userData.role) {
                localStorage.setItem('user', JSON.stringify(authUser));
                localStorage.setItem('userRole', userData.role);
              }

              setUser(authUser);
              setUserRole(userData.role);
            } else {
              console.error("User document does not exist in Firestore.");
              setUser(null);
              setUserRole(null);
              localStorage.removeItem('user');
              localStorage.removeItem('userRole');
            }
          } catch (error) {
            console.error('Error fetching user document from Firestore:', error);
          }
        } else {
          setUser(null);
          setUserRole(null);
          localStorage.removeItem('user');
          localStorage.removeItem('userRole');
        }
        setLoading(false);
      }, (error) => {
        console.error('Error observing auth state:', error);
        setLoading(false);
      });
      // Clean up subscription on unmount
      return () => unsubscribe();
    }
  }, []);

  // Render nothing while in loading state to prevent SSR hydration issues
  if (loading) return null;

  // Provide auth context to application
  return (
    <AuthContext.Provider value={{ user, loading, userRole, setUser, setUserRole }}>
      {children}
    </AuthContext.Provider>
  );
};