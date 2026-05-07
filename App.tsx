import React, { useState } from 'react';
import { AuthScreen } from './src/screens/AuthScreen';
import { HomeScreen } from './src/screens/HomeScreen';
import { auth } from './src/config/firebase';
import { signOut } from 'firebase/auth';

export default function App() {
  const [user, setUser] = useState<any>(null);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setUser(null);
    } catch (error) {
      console.error(error);
    }
  };

  if (!user) {
    return <AuthScreen onAuthSuccess={(user) => setUser(user)} />;
  }

  return <HomeScreen user={user} onLogout={handleLogout} />;
}
