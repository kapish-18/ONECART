import AsyncStorage from "@react-native-async-storage/async-storage";

const USER_KEY = "onecart_user";

export const saveUser = async (user: any) => {
  await AsyncStorage.setItem(USER_KEY, JSON.stringify(user));
};

export const getUser = async () => {
  const data = await AsyncStorage.getItem(USER_KEY);
  return data ? JSON.parse(data) : null;
};

export const clearUser = async () => {
  await AsyncStorage.removeItem(USER_KEY);
};