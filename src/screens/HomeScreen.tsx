import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Alert, Dimensions, Animated, StatusBar } from 'react-native';
import * as Location from 'expo-location';
import { BASE_URL } from '../config/api';

const { width } = Dimensions.get('window');

export const HomeScreen = ({ user, onLogout }: { user: any, onLogout: () => void }) => {
  const [isEmergency, setIsEmergency] = useState(false);
  const [isVerified, setIsVerified] = useState(false); // NID Verification Status
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.15, duration: 1000, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 1000, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  const handleSOS = async () => {
    setIsEmergency(true);
    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Denied', 'Location access is required.');
      setIsEmergency(false);
      return;
    }

    try {
      let currentLocation = await Location.getCurrentPositionAsync({});
      const response = await fetch(`${BASE_URL}/alerts/sos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.uid,
          latitude: currentLocation.coords.latitude,
          longitude: currentLocation.coords.longitude,
        }),
      });

      if (response.ok) {
        Alert.alert("SOS SENT! 🚨", "Your community has been notified.");
      }
    } catch (error) {
      Alert.alert("Error", "Could not send SOS.");
    } finally {
      setIsEmergency(false);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      {/* User Info & Verification Status */}
      <View style={styles.header}>
        <View style={styles.userInfo}>
          <Text style={styles.welcomeText}>Hello,</Text>
          <Text style={styles.userName}>{user.email.split('@')[0]}</Text>
        </View>
        <TouchableOpacity 
          style={[styles.verifyBadge, isVerified && styles.verifiedBg]}
          onPress={() => Alert.alert("NID Verification", "This feature is coming soon! You can verify your identity with NID/Birth Certificate.")}
        >
          <Text style={styles.verifyText}>{isVerified ? '✅ Verified' : '⚠️ Unverified'}</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.mainArea}>
        <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
          <TouchableOpacity 
            style={[styles.sosButton, isEmergency && styles.sosActive]} 
            onPress={handleSOS}
          >
            <View style={styles.sosInnerCircle}>
              <Text style={styles.sosLabel}>SOS</Text>
            </View>
          </TouchableOpacity>
        </Animated.View>
        <Text style={styles.emergencyHint}>Tap for immediate help</Text>
      </View>

      <View style={styles.bottomNav}>
        <TouchableOpacity style={styles.logoutBtn} onPress={onLogout}>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0F172A', paddingHorizontal: 20 },
  header: { marginTop: 60, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  userInfo: { flex: 1 },
  welcomeText: { color: '#94A3B8', fontSize: 14 },
  userName: { color: '#FFFFFF', fontSize: 20, fontWeight: 'bold' },
  verifyBadge: { backgroundColor: '#1E293B', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 },
  verifiedBg: { backgroundColor: '#10B981' },
  verifyText: { color: '#F8FAFC', fontSize: 10, fontWeight: 'bold' },
  mainArea: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  sosButton: {
    width: width * 0.6, height: width * 0.6, borderRadius: (width * 0.6) / 2,
    backgroundColor: 'rgba(239, 68, 68, 0.2)', alignItems: 'center', justifyContent: 'center'
  },
  sosInnerCircle: {
    width: width * 0.45, height: width * 0.45, borderRadius: (width * 0.45) / 2,
    backgroundColor: '#EF4444', alignItems: 'center', justifyContent: 'center', elevation: 20
  },
  sosLabel: { color: '#FFFFFF', fontSize: 48, fontWeight: 'bold' },
  emergencyHint: { color: '#64748B', marginTop: 30, fontSize: 16 },
  sosActive: { backgroundColor: 'rgba(239, 68, 68, 0.5)' },
  bottomNav: { paddingBottom: 40, alignItems: 'center' },
  logoutBtn: { backgroundColor: '#1E293B', paddingHorizontal: 30, paddingVertical: 12, borderRadius: 12 },
  logoutText: { color: '#EF4444', fontWeight: 'bold' },
});
