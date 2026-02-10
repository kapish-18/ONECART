import * as Notifications from "expo-notifications";
import * as Device from "expo-device";
import Constants from "expo-constants";
import { Platform } from "react-native";
import { BASE_URL } from "../config/api";
import { getUser } from "./auth";

export async function registerForPushNotifications() {
  try {
    if (!Device.isDevice) {
      console.log("❌ Must use physical device");
      return null;
    }

    const { status: existingStatus } =
      await Notifications.getPermissionsAsync();

    let finalStatus = existingStatus;

    if (existingStatus !== "granted") {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== "granted") {
      console.log("❌ Notification permission denied");
      return null;
    }

    const projectId =
      Constants.expoConfig?.extra?.eas?.projectId ??
      Constants.easConfig?.projectId;

    if (!projectId) {
      throw new Error("No projectId found");
    }

    const token = (
      await Notifications.getExpoPushTokenAsync({ projectId })
    ).data;

    console.log("🔔 EXPO PUSH TOKEN:", token);

    // Send token to backend
    const user = await getUser();
    if (user?.email) {
      await fetch(`${BASE_URL}/delivery/push-token`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: user.email,
          pushToken: token,
        }),
      });
    }

    // Android notification channel (REQUIRED)
    if (Platform.OS === "android") {
      await Notifications.setNotificationChannelAsync("default", {
        name: "default",
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        sound: "default",
        lockscreenVisibility:
          Notifications.AndroidNotificationVisibility.PUBLIC,
      });
    }

    return token;
  } catch (err) {
    console.error("❌ Push notification setup failed:", err);
    return null;
  }
}
