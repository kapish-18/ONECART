import Constants from "expo-constants";
import { Platform } from "react-native";

const getDevUrl = () => {
  const hostUri = Constants.expoConfig?.hostUri;
  if (hostUri) {
    const ip = hostUri.split(":")[0];
    return `http://${ip}:5000`;
  }
  return Platform.OS === "android" ? "http://10.0.2.2:5000" : "http://localhost:5000";
};

export const BASE_URL = __DEV__ 
  ? getDevUrl() 
  : "https://onecart-s238.onrender.com";
