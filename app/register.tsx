import AsyncStorage from '@react-native-async-storage/async-storage'; // <--- THE MEMORY TOOL
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import React, { useState } from 'react';
import {
  Alert,
  Image,
  ScrollView,
  StatusBar,
  StyleSheet, Text,
  TextInput, TouchableOpacity,
  View
} from 'react-native';
import { db } from '../firebaseConfig';

export default function RegisterPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [photo, setPhoto] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: '', mobile: '', email: '',
    fatherName: '', fatherMobile: '',
    motherName: '', motherMobile: '',
    siblingName: '', siblingMobile: '',
  });

  const updateField = (key: string, value: string) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.5,
    });

    if (!result.canceled) {
      setPhoto(result.assets[0].uri);
    }
  };

  const handleRegister = async () => {
    console.log("--- STARTING REGISTRATION ---");

    if (!formData.name || !formData.mobile) {
      Alert.alert("Missing Info", "Please enter at least your Name and Mobile Number.");
      return;
    }

    setLoading(true);
    try {
      console.log("1. Uploading to Firebase...");
      const docRef = await addDoc(collection(db, "users"), {
        personal: {
          name: formData.name,
          mobile: formData.mobile,
          email: formData.email,
          photoUri: photo ? "Photo Selected" : "No Photo" 
        },
        emergency_contacts: {
          father: { name: formData.fatherName, mobile: formData.fatherMobile },
          mother: { name: formData.motherName, mobile: formData.motherMobile },
          sibling: { name: formData.siblingName, mobile: formData.siblingMobile },
        },
        joinedAt: serverTimestamp(),
        device: "ARES_V1"
      });

      console.log("2. Firebase Success. ID:", docRef.id);

      // --- CRITICAL UPDATE: SAVE CONTACTS LOCALLY ---
      console.log("3. Saving to Local Memory...");
      await AsyncStorage.setItem('user_id', docRef.id);
      await AsyncStorage.setItem('user_name', formData.name);
      
      // Filter out empty numbers so we don't send SMS to blank spaces
      const contacts = [
        formData.fatherMobile,
        formData.motherMobile,
        formData.siblingMobile
      ].filter(num => num && num.trim().length > 0);

      await AsyncStorage.setItem('emergency_contacts', JSON.stringify(contacts));
      console.log("4. Memory Saved (ID + Contacts).");
      // ----------------------------------------------

      Alert.alert("WELCOME", "You are now a registered agent.");
      router.replace('/emergency'); 
    } catch (error: any) {
      console.error("REGISTRATION ERROR:", error);
      Alert.alert("Error", error.message || "Could not save data.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.header}>
        <Text style={styles.headerTitle}>ENLISTMENT</Text>
        <Text style={styles.headerSubtitle}>Task Force 404 Registry</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <Text style={styles.sectionTitle}>1. PERSONAL INTEL</Text>
        
        <TouchableOpacity style={styles.photoBox} onPress={pickImage}>
          {photo ? (
            <Image source={{ uri: photo }} style={styles.photo} />
          ) : (
            <Text style={styles.photoText}>+ Add Photo</Text>
          )}
        </TouchableOpacity>

        <TextInput placeholder="Full Name" style={styles.input} placeholderTextColor="#FFB3C1" onChangeText={(t) => updateField('name', t)}/>
        <TextInput placeholder="Mobile Number" keyboardType="phone-pad" style={styles.input} placeholderTextColor="#FFB3C1" onChangeText={(t) => updateField('mobile', t)}/>
        <TextInput placeholder="Email ID" keyboardType="email-address" style={styles.input} placeholderTextColor="#FFB3C1" onChangeText={(t) => updateField('email', t)}/>

        <Text style={styles.sectionTitle}>2. EMERGENCY CONTACTS (FAMILY)</Text>
        <Text style={styles.helperText}>Who do we call when the SOS triggers?</Text>

        <View style={styles.contactRow}>
          <TextInput placeholder="Father's Name" style={[styles.input, styles.halfInput]} placeholderTextColor="#FFB3C1" onChangeText={(t) => updateField('fatherName', t)}/>
          <TextInput placeholder="Mobile" keyboardType="phone-pad" style={[styles.input, styles.halfInput]} placeholderTextColor="#FFB3C1" onChangeText={(t) => updateField('fatherMobile', t)}/>
        </View>

        <View style={styles.contactRow}>
          <TextInput placeholder="Mother's Name" style={[styles.input, styles.halfInput]} placeholderTextColor="#FFB3C1" onChangeText={(t) => updateField('motherName', t)}/>
          <TextInput placeholder="Mobile" keyboardType="phone-pad" style={[styles.input, styles.halfInput]} placeholderTextColor="#FFB3C1" onChangeText={(t) => updateField('motherMobile', t)}/>
        </View>

        <View style={styles.contactRow}>
          <TextInput placeholder="Sibling/Uncle Name" style={[styles.input, styles.halfInput]} placeholderTextColor="#FFB3C1" onChangeText={(t) => updateField('siblingName', t)}/>
          <TextInput placeholder="Mobile" keyboardType="phone-pad" style={[styles.input, styles.halfInput]} placeholderTextColor="#FFB3C1" onChangeText={(t) => updateField('siblingMobile', t)}/>
        </View>

        <TouchableOpacity style={[styles.submitButton, { opacity: loading ? 0.7 : 1 }]} onPress={handleRegister} disabled={loading}>
          <Text style={styles.submitText}>{loading ? "SAVING..." : "CONFIRM REGISTRATION"}</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => router.back()} style={{ marginTop: 20 }}>
          <Text style={styles.cancelText}>Cancel</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  header: { padding: 20, paddingTop: 50, backgroundColor: '#FFF0F3', alignItems: 'center' },
  headerTitle: { fontSize: 24, fontWeight: '900', color: '#FF4D6D', letterSpacing: 2 },
  headerSubtitle: { color: '#FF8FA3', fontWeight: 'bold', marginTop: 5 },
  scrollContent: { padding: 25, paddingBottom: 50 },
  sectionTitle: { fontSize: 16, fontWeight: '800', color: '#FF4D6D', marginTop: 20, marginBottom: 10 },
  helperText: { fontSize: 12, color: '#AAA', marginBottom: 10, fontStyle: 'italic' },
  photoBox: { width: 100, height: 100, borderRadius: 50, backgroundColor: '#FFF0F3', alignSelf: 'center', justifyContent: 'center', alignItems: 'center', marginBottom: 20, borderWidth: 1, borderColor: '#FFCCD5', overflow: 'hidden' },
  photo: { width: '100%', height: '100%' },
  photoText: { color: '#FF4D6D', fontWeight: 'bold', fontSize: 12 },
  input: { backgroundColor: '#FFF0F3', borderRadius: 12, padding: 15, marginBottom: 15, color: '#FF4D6D', fontWeight: '600', borderWidth: 1, borderColor: '#FFCCD5' },
  contactRow: { flexDirection: 'row', justifyContent: 'space-between' },
  halfInput: { width: '48%' },
  submitButton: { backgroundColor: '#FF4D6D', padding: 20, borderRadius: 15, alignItems: 'center', marginTop: 30, elevation: 5 },
  submitText: { color: '#FFFFFF', fontWeight: '900', fontSize: 16, letterSpacing: 1 },
  cancelText: { textAlign: 'center', color: '#AAA', fontWeight: 'bold' }
});