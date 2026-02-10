import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { useEffect, useState } from "react";
import { View, ActivityIndicator } from "react-native";

import LoginScreen from "../screens/LoginScreen";
import HomeScreen from "../screens/HomeScreen";
import OtpScreen from "../screens/OtpScreen";
import MenuScreen from "../screens/MenuScreen";
import ReviewOrderScreen from "../screens/ReviewOrderScreen";
import MyOrdersScreen from "../screens/MyOrdersScreen";

import { getUser } from "../utils/auth";

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  const [loading, setLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      const user = await getUser();
      setIsLoggedIn(!!user);
      setLoading(false);
    };
    checkAuth();
  }, []);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator>
        {isLoggedIn ? (
          <>
            <Stack.Screen
              name="Home"
              component={HomeScreen}
              options={{ title: "OneCart" }}
            />

            <Stack.Screen
              name="Menu"
              component={MenuScreen}
              options={{ title: "Select Items" }}
            />

            <Stack.Screen
              name="ReviewOrder"
              component={ReviewOrderScreen}
              options={{ title: "Review Order" }}
            />

            {/* ✅ ADD THIS */}
            <Stack.Screen
              name="MyOrders"
              component={MyOrdersScreen}
              options={{ title: "My Orders" }}
            />
          </>
        ) : (
          <>
            <Stack.Screen
              name="Login"
              component={LoginScreen}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="Otp"
              component={OtpScreen}
              options={{ headerShown: false }}
            />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

