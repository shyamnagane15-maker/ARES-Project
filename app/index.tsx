import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function WelcomeScreen() {
  const router = useRouter();
  const [checking, setChecking] = useState(true); // "Is the guard checking ID?"

  useEffect(() => {
    checkLoginStatus();
  }, []);

  const checkLoginStatus = async () => {
    try {
      console.log("--- GUARD CHECKING ID ---"); // <--- ADD THIS
      const userId = await AsyncStorage.getItem('user_id');
      console.log("Found ID:", userId); // <--- ADD THIS
      
      if (userId) {
        console.log("Access Granted."); // <--- ADD THIS
        router.replace('/emergency');
      } else {
        console.log("No ID found. Send to Recruitment."); // <--- ADD THIS
        setChecking(false);
      }
    } catch (e) {
      console.error("Memory Error:", e);
      setChecking(false);
    }
  };
  

  // While checking, show a loading spinner (The "Loading..." screen)
  if (checking) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#FF4D6D" />
        <Text style={styles.loadingText}>VERIFYING CREDENTIALS...</Text>
      </View>
    );
  }

  // If NOT registered, show the normal Welcome Page
  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>ARES</Text>
        <Text style={styles.subtitle}>WOMEN SAFETY & SOS SYSTEM</Text>
      </View>

      {/* Action Buttons */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity 
          style={styles.primaryButton} 
          onPress={() => router.push('/register')}
        >
          <Text style={styles.primaryButtonText}>REGISTER YOURSELF</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.secondaryButton}
          onPress={() => router.push('/emergency')} // Kept for testing
        >
          <Text style={styles.secondaryButtonText}>TEST EMERGENCY (Demo)</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.footer}>Task Force 404 © 2026</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF0F3', justifyContent: 'center', alignItems: 'center', padding: 20 },
  loadingText: { marginTop: 20, color: '#FF4D6D', fontWeight: 'bold', letterSpacing: 1 },
  
  header: { marginBottom: 60, alignItems: 'center' },
  title: { fontSize: 48, fontWeight: '900', color: '#FF4D6D', letterSpacing: 5 },
  subtitle: { fontSize: 14, color: '#FF8FA3', fontWeight: '600', letterSpacing: 1, marginTop: 5 },

  buttonContainer: { width: '100%', alignItems: 'center', gap: 15 },
  primaryButton: { backgroundColor: '#FF4D6D', width: '80%', padding: 18, borderRadius: 30, alignItems: 'center', elevation: 5 },
  primaryButtonText: { color: 'white', fontWeight: 'bold', fontSize: 16, letterSpacing: 1 },
  secondaryButton: { borderWidth: 2, borderColor: '#FF4D6D', width: '80%', padding: 18, borderRadius: 30, alignItems: 'center' },
  secondaryButtonText: { color: '#FF4D6D', fontWeight: 'bold', fontSize: 16, letterSpacing: 1 },

  footer: { position: 'absolute', bottom: 30, color: '#FFCCD5', fontWeight: 'bold' }
});