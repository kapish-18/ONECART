import { useEffect } from "react";
import * as Notifications from "expo-notifications";
import { Platform } from "react-native";

import AppNavigator from "./src/navigation/AppNavigator";

/* 🔔 Allow notifications to show when app is OPEN */
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export default function App() {
  useEffect(() => {
    setupAndroidChannel();
  }, []);

  const setupAndroidChannel = async () => {
    if (Platform.OS === "android") {
      await Notifications.setNotificationChannelAsync("default", {
        name: "default",
        importance: Notifications.AndroidImportance.MAX,
        sound: "default",
        vibrationPattern: [0, 250, 250, 250],
        enableVibrate: true,
        lockscreenVisibility:
          Notifications.AndroidNotificationVisibility.PUBLIC,
      });
    }
  };

  return <AppNavigator />;
}
