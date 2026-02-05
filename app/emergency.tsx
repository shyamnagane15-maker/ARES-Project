import { MaterialCommunityIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Location from 'expo-location';
import * as Notifications from 'expo-notifications';
import { useRouter } from 'expo-router'; // <--- CORRECT IMPORT
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import { Alert, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { db } from '../firebaseConfig';
import {
  registerNotificationCategories,
  requestPermissions,
  showStickyNotification
} from './notification_handler';
import { sendOfflineSMS } from './sms_fallback';

export default function AresHome() {
  const router = useRouter(); // <--- INITIALIZE ROUTER
  const [location, setLocation] = useState<Location.LocationObject | null>(null);

  // --- 1. LOGIC SECTION (Paste handleLogout HERE) ---
  const handleLogout = async () => {
    await AsyncStorage.clear(); // Burn the ID card
    router.replace('/'); // Go back to Welcome Screen
  };
  // --------------------------------------------------

  // --- 🔔 NOTIFICATION COMMAND CENTER ---
  useEffect(() => {
    // 1. Setup System
    const setupNotifications = async () => {
      const hasPermission = await requestPermissions();
      if (hasPermission) {
        await registerNotificationCategories();
        await showStickyNotification(); // App khulte hi Notification bhej do
      }
    };
    setupNotifications();

    // 2. Listen for Button Clicks
    const subscription = Notifications.addNotificationResponseReceivedListener(response => {
      const actionId = response.actionIdentifier;

      // Check which button was pressed
      if (actionId === 'HIGH_THREAT') {
        console.log("Notification Trigger: HIGH");
        triggerEmergency('HIGH');
      } else if (actionId === 'MEDIUM_THREAT') {
        console.log("Notification Trigger: MEDIUM");
        triggerEmergency('MEDIUM');
      } else if (actionId === 'LOW_THREAT') {
        console.log("Notification Trigger: LOW");
        triggerEmergency('LOW');
      }
    });

    return () => subscription.remove();
  }, []);
  // ----------------------------------------

  const triggerEmergency = async (level: 'LOW' | 'MEDIUM' | 'HIGH') => {
    if (!location) {
      Alert.alert("GPS ERROR", "Coordinates not locked.");
      return;
    }

    // Prepare Intel
    const uid = await AsyncStorage.getItem('user_id');
    const name = await AsyncStorage.getItem('user_name') || "Unknown Agent";
    const storedContacts = await AsyncStorage.getItem('emergency_contacts');
    const contacts = storedContacts ? JSON.parse(storedContacts) : [];
    
    // Safety Net: If no contacts found, warn the user
    if (contacts.length === 0) {
      console.warn("No contacts found in memory!");
    }

    try {
      // PHASE 1: Try Online Database
      await addDoc(collection(db, "emergency_alerts"), {
        user_id: uid,
        userName: name,
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        threatLevel: level,
        timestamp: serverTimestamp(),
        status: "active"
      });
      
      Alert.alert(`${level} ALERT`, "HQ Notified. Engaging SMS Protocol...");
      
      // PHASE 2: FIRE SMS ANYWAY (Better safe than sorry)
      // We run this AFTER database success to ensure parents get the text immediately
      await sendOfflineSMS(location.coords, name, level, contacts);

    } catch (e) {
      // FALLBACK: If Internet Fails, Force SMS immediately
      console.log("Internet Failed. Switching to Offline SMS Protocol.");
      await sendOfflineSMS(location.coords, name, level, contacts);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.header}>
        <Text style={styles.brandName}>ARES</Text>
        <Text style={styles.subtitle}>TACTICAL THREAT CLASSIFICATION</Text>
      </View>

      <View style={styles.buttonStack}>
        
        {/* HIGH THREAT (Skull) */}
        <TouchableOpacity 
          style={[styles.threatButton, { backgroundColor: '#f00000' }]} 
          onLongPress={() => triggerEmergency('HIGH')}
          delayLongPress={1500}
        >
          <MaterialCommunityIcons name="skull" size={32} color="white" />
          <Text style={styles.buttonLabel}>HIGH THREAT</Text>
          <Text style={styles.buttonText}>Critical Situation</Text>
          <Text style={styles.buttonText}>Immidiate Help needed</Text>
        </TouchableOpacity>

        {/* MEDIUM THREAT (Siren/Alarm) */}
        <TouchableOpacity 
          style={[styles.threatButton, { backgroundColor: 'hsl(17, 100%, 62%)' }]} 
          onLongPress={() => triggerEmergency('MEDIUM')}
          delayLongPress={1500}
        >
          <MaterialCommunityIcons name="alarm-light" size={32} color="white" />
          <Text style={styles.buttonLabel}>MEDIUM THREAT</Text>
          <Text style={styles.buttonText}>Moderate Danger</Text>
          <Text style={styles.buttonText}>Help Needed Soon</Text>
          
          
        </TouchableOpacity>
          
        {/* LOW THREAT (Caution/Alert) */}
        <TouchableOpacity 
          style={[styles.threatButton, { backgroundColor: '#ffcf0d' }]} 
          onLongPress={() => triggerEmergency('LOW')}
          delayLongPress={1500}
        >
          <MaterialCommunityIcons name="alert" size={32} color="white" />
          <Text style={styles.buttonLabel}>LOW THREAT</Text>
          <Text style={styles.buttonText}>Stay Alert</Text>
          <Text style={styles.buttonText}>Assistance may be needed</Text>
        </TouchableOpacity>

      </View>

      {/* --- 2. UI SECTION (Paste Button HERE) --- */}
      <TouchableOpacity onPress={handleLogout} style={{ marginTop: 50 }}>
        <Text style={{ color: '#AAA', textDecorationLine: 'underline', marginTop: 120 }}>
          Reset / Logout
        </Text>
      </TouchableOpacity>
      {/* ----------------------------------------- */}

    </View>
  );
};

const styles = StyleSheet.create({
  
  container: { flex: 1, backgroundColor: '#FFF0F3', alignItems: 'center', padding: 30 },
  header: { marginTop: 45, marginBottom: 60, alignItems: 'center' },
  brandName: { fontSize: 40, fontWeight: '900', color: '#FF4D6D', letterSpacing: 5 },
  subtitle: { fontSize: 12, color: '#FF8FA3', fontWeight: 'bold', letterSpacing: 1 },
  buttonStack: { width: '100%', gap: 15, height: '50%', marginTop: -20 },
  threatButton: { 
    width: '100%', 
    padding: 10, 
    borderRadius: 20, 
    height: '40%',
    elevation: 5,
    // NEW LAYOUT RULES:
           // Put items side by side
    justifyContent: 'center',   // Center them horizontally
    alignItems: 'center',       // Center them vertically
    gap: 10                     // Space between Icon and Text
  },
  buttonLabel: { color: 'white', fontSize: 20, fontWeight: '900', letterSpacing: 2, justifyContent: 'center', alignItems: 'center' },
  buttonText: { marginBottom: -10, color: 'white', fontSize: 14, fontWeight: '600', justifyContent: 'center', alignItems: 'center' }
});