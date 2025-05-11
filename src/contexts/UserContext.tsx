import React, { createContext, useContext, useState, useEffect } from 'react';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { auth, db } from '../firebase';
import { onAuthStateChanged } from 'firebase/auth';

interface UserContextType {
  balance: number;
  updateBalance: (newBalance: number) => Promise<void>;
  deductBalance: (amount: number) => Promise<boolean>;
}

const UserContext = createContext<UserContextType | null>(null);

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [balance, setBalance] = useState<number>(0);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const username = user.email?.split('@')[0];
        if (username) {
          const userDoc = await getDoc(doc(db, 'User', username));
          if (userDoc.exists()) {
            setBalance(userDoc.data().balance || 0);
          }
        }
      } else {
        setBalance(0);
      }
    });

    return () => unsubscribe();
  }, []);

  const updateBalance = async (newBalance: number) => {
    if (auth.currentUser) {
      const username = auth.currentUser.email?.split('@')[0];
      if (username) {
        const userRef = doc(db, 'User', username);
        await updateDoc(userRef, { balance: newBalance });
        setBalance(newBalance);
      }
    }
  };

  const deductBalance = async (amount: number): Promise<boolean> => {
    if (balance >= amount) {
      const newBalance = balance - amount;
      await updateBalance(newBalance);
      return true;
    }
    return false;
  };

  return (
    <UserContext.Provider value={{ balance, updateBalance, deductBalance }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
}; 