import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Alert, Dimensions, Animated, StatusBar, Platform, ScrollView, Image } from 'react-native';
import * as Location from 'expo-location';
import { Ionicons } from '@expo/vector-icons';
import { BASE_URL } from '../config/api';

const { width } = Dimensions.get('window');

export const HomeScreen = ({ user, onLogout }: { user: any, onLogout: () => void }) => {
  const [isEmergency, setIsEmergency] = useState(false);
  const [isVerified, setIsVerified] = useState(true); // Default to true for design
  const [currentLocation, setCurrentLocation] = useState<Location.LocationObject | null>(null);
  
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const glowAnim = useRef(new Animated.Value(0.5)).current;

  useEffect(() => {
    // Location fetch
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        let loc = await Location.getCurrentPositionAsync({});
        setCurrentLocation(loc);
      }
    })();

    // Animations
    Animated.loop(
      Animated.parallel([
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 1.2, duration: 1200, useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 1, duration: 1200, useNativeDriver: true }),
        ]),
        Animated.sequence([
          Animated.timing(glowAnim, { toValue: 0.8, duration: 1200, useNativeDriver: true }),
          Animated.timing(glowAnim, { toValue: 0.3, duration: 1200, useNativeDriver: true }),
        ])
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
      let loc = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      const response = await fetch(`${BASE_URL}/alerts/sos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.uid,
          latitude: loc.coords.latitude,
          longitude: loc.coords.longitude,
        }),
      });

      if (response.ok) {
        Alert.alert("SOS SENT! 🚨", "Your community has been notified.");
      }
    } catch (error) {
      Alert.alert("Error", "Could not send SOS. Please check your connection.");
    } finally {
      setIsEmergency(false);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0F172A" />
      
      {/* Header Section */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.avatarPlaceholder}>
             <Ionicons name="person" size={24} color="#94A3B8" />
          </View>
          <TouchableOpacity 
            style={styles.verifyBadge}
            onPress={() => Alert.alert("NID Verification", "You are a verified user.")}
          >
            <Ionicons name="checkmark-circle" size={16} color="#10B981" style={{marginRight: 4}} />
            <Text style={styles.verifyText}>VERIFIED</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.headerRight}>
          <TouchableOpacity style={styles.iconButton}>
             <Ionicons name="search-outline" size={24} color="#94A3B8" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconButton}>
             <View style={styles.notificationBadge}><Text style={styles.notificationText}>3</Text></View>
             <Ionicons name="notifications-outline" size={24} color="#94A3B8" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* Main SOS Area */}
        <View style={styles.sosSection}>
          <View style={styles.sosContainer}>
            <Animated.View style={[styles.glowRing, { transform: [{ scale: pulseAnim }], opacity: glowAnim }]} />
            <Animated.View style={[styles.glowRingInner, { transform: [{ scale: pulseAnim }] }]} />
            
            <TouchableOpacity 
              style={[styles.sosButton, isEmergency && styles.sosActive]} 
              onLongPress={handleSOS}
              delayLongPress={3000}
              activeOpacity={0.8}
            >
              <View style={styles.sosInnerCircle}>
                <Ionicons name="megaphone-outline" size={32} color="#FFFFFF" style={{marginBottom: 5}}/>
                <Text style={styles.sosLabel}>SOS</Text>
              </View>
            </TouchableOpacity>
          </View>
          <Text style={styles.emergencyHint}>HOLD 3 SECONDS FOR EMERGENCY</Text>
        </View>

        {/* Action Cards */}
        <View style={styles.actionCardsRow}>
           <TouchableOpacity style={styles.actionCard}>
              <Ionicons name="person-add-outline" size={28} color="#10B981" />
              <Text style={styles.actionCardTitle}>SAFETY{'\n'}CHECK</Text>
              <Text style={styles.actionCardSub}>Tap to check in</Text>
           </TouchableOpacity>
           
           <TouchableOpacity style={styles.actionCard}>
              <Ionicons name="warning-outline" size={28} color="#F59E0B" />
              <Text style={styles.actionCardTitle}>REPORT{'\n'}INCIDENT</Text>
              <Text style={styles.actionCardSub}>File a report</Text>
           </TouchableOpacity>

           <TouchableOpacity style={styles.actionCard}>
              <Ionicons name="map-outline" size={28} color="#3B82F6" />
              <Text style={styles.actionCardTitle}>FIND{'\n'}HELP</Text>
              <Text style={styles.actionCardSub}>Emergency nearby</Text>
           </TouchableOpacity>
        </View>

        {/* Location Status */}
        <View style={styles.locationSection}>
          <Text style={styles.sectionTitle}>LOCATION STATUS</Text>
          
          <View style={styles.locationCardContainer}>
            
            {/* Free Map Implementation */}
            {currentLocation && Platform.OS === 'web' ? (
               React.createElement('iframe', {
                 src: `https://www.openstreetmap.org/export/embed.html?bbox=${currentLocation.coords.longitude-0.01},${currentLocation.coords.latitude-0.01},${currentLocation.coords.longitude+0.01},${currentLocation.coords.latitude+0.01}&layer=mapnik&marker=${currentLocation.coords.latitude},${currentLocation.coords.longitude}`,
                 style: {width: '100%', height: '100%', border: 0, position: 'absolute', opacity: 0.6}
               })
            ) : (
               <View style={styles.mapBackgroundPlaceholder}>
                 <Ionicons name="map" size={100} color="rgba(255,255,255,0.05)" />
               </View>
            )}
            
            {/* Map Overlay content */}
            <View style={styles.locationCardContent}>
               <View style={styles.locationRow}>
                 <View style={[styles.iconBox, {backgroundColor: 'rgba(239, 68, 68, 0.2)'}]}>
                    <Ionicons name="location" size={20} color="#EF4444" />
                 </View>
                 <View style={styles.locationTextContainer}>
                    <Text style={styles.locationTitle}>Your Location</Text>
                    <Text style={styles.locationSubtitle}>
                      {currentLocation ? `Lat: ${currentLocation.coords.latitude.toFixed(2)}, Lon: ${currentLocation.coords.longitude.toFixed(2)}` : 'Updating...'}
                    </Text>
                 </View>
               </View>

               <View style={styles.divider} />

               <View style={styles.locationRow}>
                 <View style={[styles.iconBox, {backgroundColor: 'rgba(16, 185, 129, 0.2)'}]}>
                    <Ionicons name="shield-checkmark" size={20} color="#10B981" />
                 </View>
                 <View style={styles.locationTextContainer}>
                    <Text style={[styles.locationTitle, {color: '#10B981'}]}>SAFE ZONE</Text>
                    <Text style={styles.locationSubtitle}>Home, 1.2 miles away</Text>
                 </View>
               </View>
            </View>
          </View>

        </View>
        <View style={{height: 100}} /> {/* Padding for Bottom Nav */}
      </ScrollView>

      {/* Glassmorphism Bottom Navigation (Concept 2 Design) */}
      <View style={styles.bottomNavContainer}>
        <View style={styles.bottomNav}>
            {/* Active Item */}
            <TouchableOpacity style={[styles.navItem, styles.activeNavItem]}>
                <Ionicons name="home" size={20} color="#10B981" />
                <Text style={styles.activeNavText}>Home</Text>
            </TouchableOpacity>
            
            {/* Inactive Items */}
            <TouchableOpacity style={styles.navItem}>
                <Ionicons name="location-outline" size={24} color="#94A3B8" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.navItem}>
                <Ionicons name="person-outline" size={24} color="#94A3B8" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.navItem} onPress={onLogout}>
                <Ionicons name="log-out-outline" size={24} color="#94A3B8" />
            </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0F172A' },
  scrollContent: { paddingHorizontal: 20, paddingBottom: 40 },
  
  header: { 
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', 
    paddingHorizontal: 20, paddingTop: Platform.OS === 'ios' ? 60 : 40, paddingBottom: 20
  },
  headerLeft: { flexDirection: 'row', alignItems: 'center' },
  avatarPlaceholder: { width: 45, height: 45, borderRadius: 22.5, backgroundColor: '#334155', alignItems: 'center', justifyContent: 'center', marginRight: 10 },
  verifyBadge: { 
    flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.05)', 
    paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20,
  },
  verifyText: { color: '#10B981', fontSize: 12, fontWeight: 'bold' },
  
  headerRight: { flexDirection: 'row', alignItems: 'center' },
  iconButton: { marginLeft: 15, position: 'relative' },
  notificationBadge: { 
    position: 'absolute', top: -5, right: -5, backgroundColor: '#64748B', 
    width: 18, height: 18, borderRadius: 9, alignItems: 'center', justifyContent: 'center', zIndex: 1 
  },
  notificationText: { color: '#FFF', fontSize: 10, fontWeight: 'bold' },

  sosSection: { alignItems: 'center', justifyContent: 'center', marginVertical: 30 },
  sosContainer: { alignItems: 'center', justifyContent: 'center', position: 'relative' },
  glowRing: {
    position: 'absolute', width: width * 0.7, height: width * 0.7, borderRadius: (width * 0.7) / 2,
    backgroundColor: 'rgba(239, 68, 68, 0.1)', borderWidth: 1, borderColor: 'rgba(239, 68, 68, 0.3)'
  },
  glowRingInner: {
    position: 'absolute', width: width * 0.55, height: width * 0.55, borderRadius: (width * 0.55) / 2,
    backgroundColor: 'rgba(239, 68, 68, 0.2)', borderWidth: 1, borderColor: 'rgba(239, 68, 68, 0.4)'
  },
  sosButton: {
    width: width * 0.45, height: width * 0.45, borderRadius: (width * 0.45) / 2,
    backgroundColor: 'rgba(239, 68, 68, 0.8)', alignItems: 'center', justifyContent: 'center',
    shadowColor: '#EF4444', shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.8, shadowRadius: 30,
    elevation: 20,
  },
  sosInnerCircle: {
    width: width * 0.35, height: width * 0.35, borderRadius: (width * 0.35) / 2,
    backgroundColor: '#DC2626', alignItems: 'center', justifyContent: 'center',
    borderWidth: 3, borderColor: '#F87171'
  },
  sosLabel: { color: '#FFFFFF', fontSize: 36, fontWeight: '900', letterSpacing: 2 },
  emergencyHint: { color: '#94A3B8', marginTop: 50, fontSize: 12, fontWeight: '600', letterSpacing: 1 },
  sosActive: { transform: [{ scale: 0.95 }] },
  
  actionCardsRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 30 },
  actionCard: { 
    backgroundColor: 'rgba(30, 41, 59, 0.6)', borderRadius: 16, padding: 15, 
    flex: 1, marginHorizontal: 5, borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)'
  },
  actionCardTitle: { color: '#F8FAFC', fontSize: 12, fontWeight: 'bold', marginTop: 10 },
  actionCardSub: { color: '#64748B', fontSize: 10, marginTop: 4 },

  locationSection: { marginBottom: 20 },
  sectionTitle: { color: '#94A3B8', fontSize: 12, fontWeight: 'bold', letterSpacing: 1, marginBottom: 15 },
  locationCardContainer: {
    borderRadius: 20, overflow: 'hidden', backgroundColor: '#1E293B', position: 'relative'
  },
  mapBackgroundPlaceholder: { 
    width: '100%', height: 180, position: 'absolute', 
    alignItems: 'center', justifyContent: 'center', backgroundColor: '#0F172A'
  },
  locationCardContent: { padding: 20, backgroundColor: 'rgba(15, 23, 42, 0.7)' },

  locationRow: { flexDirection: 'row', alignItems: 'center' },
  iconBox: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center', marginRight: 15 },
  locationTextContainer: { flex: 1 },
  locationTitle: { color: '#F8FAFC', fontSize: 16, fontWeight: 'bold' },
  locationSubtitle: { color: '#94A3B8', fontSize: 13, marginTop: 2 },
  divider: { height: 1, backgroundColor: 'rgba(255,255,255,0.1)', marginVertical: 15, marginLeft: 55 },

  bottomNavContainer: {
    position: 'absolute', bottom: 30, left: 20, right: 20,
  },
  bottomNav: { 
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    backgroundColor: 'rgba(30, 41, 59, 0.95)', borderRadius: 30, paddingVertical: 12, paddingHorizontal: 20,
    borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.1)',
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 10 },
      android: { elevation: 8 }
    })
  },
  navItem: { alignItems: 'center', justifyContent: 'center', padding: 10 },
  activeNavItem: {
    flexDirection: 'row',
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  activeNavText: { color: '#10B981', fontSize: 14, fontWeight: '700', marginLeft: 8 },
});

