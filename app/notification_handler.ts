import * as Notifications from 'expo-notifications';

// 1. Setup Notification Behavior (Kaise dikhega)
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

// 2. Register Actions (Buttons banana)
export async function registerNotificationCategories() {
  await Notifications.setNotificationCategoryAsync('sos-category', [
    {
      identifier: 'HIGH_THREAT',
      buttonTitle: '💀 HIGH THREAT',
      options: { opensAppToForeground: true }, // App khol ke turant action lega
    },
    {
      identifier: 'MEDIUM_THREAT',
      buttonTitle: '🚨 MEDIUM',
      options: { opensAppToForeground: true },
    },
    {
      identifier: 'LOW_THREAT',
      buttonTitle: '⚠️ LOW',
      options: { opensAppToForeground: true },
    },
  ]);
}

// 3. Trigger the Notification (Notification bhejna)
export async function showStickyNotification() {
  await Notifications.scheduleNotificationAsync({
    content: {
      title: '🛡️ ARES ACTIVE',
      body: 'Expand for Emergency Controls',
      sticky: true, // Android only (Attempts to keep it there)
      priority: Notifications.AndroidNotificationPriority.MAX,
      categoryIdentifier: 'sos-category', // Link to buttons above
      sound: false, // Chupchap top pe baitha rahega
      autoDismiss: false, // Button dabane pe bhi nahi hatega
    },
    trigger: null, // Show immediately
  });
}

// 4. Permissions (Zaroori hai)
export async function requestPermissions() {
  const { status } = await Notifications.requestPermissionsAsync();
  if (status !== 'granted') {
    alert('Permission not granted for notifications!');
    return false;
  }
  return true;
}