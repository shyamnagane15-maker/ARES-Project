import * as SMS from 'expo-sms';
import { Alert } from 'react-native';

/**
 * Sends an offline SOS SMS to emergency contacts.
 */
export const sendOfflineSMS = async (
  location: { latitude: number; longitude: number } | null,
  userName: string,
  threatLevel: string,
  phoneNumbers: string[]
) => {
  // 1. Availability Check
  const isAvailable = await SMS.isAvailableAsync();
  if (!isAvailable) {
    Alert.alert("SMS Error", "SMS service is not available on this device.");
    return;
  }

  // 2. Generate Google Maps Link (Fixed Syntax)
  const lat = location?.latitude || 0;
  const long = location?.longitude || 0;
  const mapLink = `https://www.google.com/maps/search/?api=1&query=${lat},${long}`;

  // 3. Construct Message Body (Fixed Backticks)
  const message = `🚨 SOS ALERT: ${threatLevel} THREAT 🚨\n\nNAME: ${userName}\nI need immediate help!\n\nLOCATION:\n${mapLink}`;

  // 4. Send Message
  try {
    const { result } = await SMS.sendSMSAsync(
      phoneNumbers,
      message
    );
    
    if (result === 'sent') {
      console.log("Offline SMS Sent Successfully");
    } else {
      console.log("SMS Cancelled or Failed");
    }
  } catch (error) {
    console.error("SMS Fallback Failed:", error);
    Alert.alert("Critical Fail", "Could not initiate SMS fallback.");
  }
};