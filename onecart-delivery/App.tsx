import { useEffect } from "react";
import * as Notifications from "expo-notifications";
import { Platform } from "react-native";
import AppNavigator from "./src/navigation/AppNavigator";
import { registerForPushNotifications } from "./src/utils/notifications";

/* Allow notifications in foreground */
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export default function App() {
  useEffect(() => {
    init();
  }, []);

  const init = async () => {
    if (Platform.OS === "android") {
      await Notifications.setNotificationChannelAsync("default", {
        name: "default",
        importance: Notifications.AndroidImportance.MAX,
        sound: "default",
      });
    }

    await registerForPushNotifications();
  };

  return <AppNavigator />;
}