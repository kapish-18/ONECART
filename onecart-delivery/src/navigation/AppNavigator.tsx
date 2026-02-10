import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { useEffect, useState } from "react";
import { View, ActivityIndicator } from "react-native";

import LoginScreen from "../screens/LoginScreen";
import OtpScreen from "../screens/OtpScreen";
import HomeScreen from "../screens/HomeScreen";
import EarningsScreen from "../screens/EarningsScreen";
import DeliveryHistoryScreen from "../screens/DeliveryHistoryScreen";

import { getUser } from "../utils/auth";

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  const [loading, setLoading] = useState(true);
  const [loggedIn, setLoggedIn] = useState(false);

  useEffect(() => {
    let interval: any;

    const checkAuth = async () => {
      const user = await getUser();
      if (user) {
        setLoggedIn(true);
        setLoading(false);
        clearInterval(interval);
      } else {
        setLoggedIn(false);
        setLoading(false);
      }
    };

    // initial check
    checkAuth();

    // keep checking until login happens
    interval = setInterval(checkAuth, 500);

    return () => clearInterval(interval);
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
      <Stack.Navigator key={loggedIn ? "user" : "guest"}>
        {loggedIn ? (
          <>
            <Stack.Screen
              name="Home"
              component={HomeScreen}
              options={{ title: "Delivery Dashboard" }}
            />

            <Stack.Screen
              name="Earnings"
              component={EarningsScreen}
              options={{ title: "My Earnings" }}
            />

            <Stack.Screen
              name="DeliveryHistory"
              component={DeliveryHistoryScreen}
              options={{ title: "Delivery History" }}
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
