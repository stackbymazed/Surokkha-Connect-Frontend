import React, { useState, useEffect } from 'react';
import { ActivityIndicator, View, StyleSheet } from 'react-native';
import { AuthScreen } from './src/screens/AuthScreen';
import { HomeScreen } from './src/screens/HomeScreen';
import { auth } from './src/config/firebase';
import { signOut, onAuthStateChanged } from 'firebase/auth';

export default function App() {
  const [user, setUser] = useState<any>(undefined); // undefined = loading, null = logged out

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (authenticatedUser) => {
      setUser(authenticatedUser ?? null);
    });
    return unsubscribe;
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error(error);
    }
  };

  // Loading state — Firebase auth check হচ্ছে
  if (user === undefined) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3B82F6" />
      </View>
    );
  }

  // User নেই — Login screen দেখাও
  if (!user) {
    return (
      <AuthScreen
        onAuthSuccess={(loggedInUser) => setUser(loggedInUser)}
      />
    );
  }

  // User আছে — Home screen দেখাও
  return <HomeScreen user={user} onLogout={handleLogout} />;
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    backgroundColor: '#0F172A',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
