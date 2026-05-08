import React, { useState, useEffect } from 'react';
import {
  StyleSheet, Text, ScrollView, KeyboardAvoidingView,
  Platform, TouchableOpacity, Alert, View
} from 'react-native';
import { auth } from '../config/firebase';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithCredential,
} from 'firebase/auth';
import * as WebBrowser from 'expo-web-browser';
import * as Google from 'expo-auth-session/providers/google';
import { makeRedirectUri } from 'expo-auth-session';
import { CustomInput } from '../components/CustomInput';
import { CustomButton } from '../components/CustomButton';
import { SocialButton } from '../components/SocialButton';

WebBrowser.maybeCompleteAuthSession();

const GOOGLE_CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID;

export const AuthScreen = ({ onAuthSuccess }: { onAuthSuccess: (user: any) => void }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  // Google Auth Session — proxy ব্যবহার করে Expo Go তে কাজ করবে
  const [request, response, promptAsync] = Google.useAuthRequest({
    clientId: GOOGLE_CLIENT_ID,
    redirectUri: makeRedirectUri({ useProxy: true }),
  });

  // Google login response handle
  useEffect(() => {
    if (response?.type === 'success') {
      const { id_token } = response.params;
      const credential = GoogleAuthProvider.credential(id_token);
      signInWithCredential(auth, credential)
        .then((result) => {
          onAuthSuccess(result.user);
        })
        .catch((error) => {
          Alert.alert('Google Login Failed', error.message);
        });
    }
  }, [response]);

  const handleAuth = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }
    setLoading(true);
    try {
      let userCredential;
      if (isLogin) {
        userCredential = await signInWithEmailAndPassword(auth, email, password);
      } else {
        userCredential = await createUserWithEmailAndPassword(auth, email, password);
      }
      onAuthSuccess(userCredential.user);
    } catch (error: any) {
      Alert.alert('Authentication Failed', error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    if (!GOOGLE_CLIENT_ID) {
      Alert.alert(
        'Setup Required',
        'Google Client ID is missing. Please add EXPO_PUBLIC_GOOGLE_CLIENT_ID to your .env file.\n\nFirebase Console → Authentication → Sign-in method → Google → Enable করুন।'
      );
      return;
    }
    await promptAsync({ useProxy: true });
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.headerArea}>
          <Text style={styles.title}>{isLogin ? 'Welcome Back' : 'Join Us'}</Text>
          <Text style={styles.subtitle}>Your Safety, Our Priority 🛡️</Text>
        </View>

        <View style={styles.formArea}>
          <CustomInput placeholder="Email Address" value={email} onChangeText={setEmail} />
          <CustomInput placeholder="Password" value={password} onChangeText={setPassword} secureTextEntry />

          <CustomButton
            title={loading ? 'Please wait...' : (isLogin ? 'Login' : 'Create Account')}
            onPress={handleAuth}
          />

          <View style={styles.dividerArea}>
            <View style={styles.line} />
            <Text style={styles.dividerText}>OR</Text>
            <View style={styles.line} />
          </View>

          <SocialButton title="Continue with Google" onPress={handleGoogleLogin} />
        </View>

        <TouchableOpacity onPress={() => setIsLogin(!isLogin)} style={styles.toggleBtn}>
          <Text style={styles.toggleText}>
            {isLogin ? "Don't have an account? " : 'Already have an account? '}
            <Text style={styles.toggleLink}>{isLogin ? 'Register' : 'Login'}</Text>
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0F172A' },
  scroll: { flexGrow: 1, justifyContent: 'center', padding: 25 },
  headerArea: { alignItems: 'center', marginBottom: 40 },
  title: { color: '#FFFFFF', fontSize: 32, fontWeight: 'bold' },
  subtitle: { color: '#94A3B8', fontSize: 16, marginTop: 8 },
  formArea: { width: '100%' },
  dividerArea: { flexDirection: 'row', alignItems: 'center', marginVertical: 25 },
  line: { flex: 1, height: 1, backgroundColor: '#1E293B' },
  dividerText: { color: '#64748B', marginHorizontal: 15, fontSize: 12, fontWeight: 'bold' },
  toggleBtn: { marginTop: 30, alignItems: 'center' },
  toggleText: { color: '#94A3B8', fontSize: 14 },
  toggleLink: { color: '#3B82F6', fontWeight: 'bold' },
});
