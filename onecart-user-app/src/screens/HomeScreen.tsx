import { View, Text, TouchableOpacity, ActivityIndicator } from "react-native";
import { useEffect, useState } from "react";
import { useNavigation } from "@react-navigation/native";

import { clearUser } from "../utils/auth";
import OutletPickerModal from "../components/OutletPickerModal";
import { BASE_URL } from "../config/api";

type Outlet = {
  _id: string;
  name: string;
  menuImages: string[];
  instructions: string;
};

export default function HomeScreen() {
  const navigation = useNavigation<any>();

  const [outlet1, setOutlet1] = useState<Outlet | null>(null);
  const [outlet2, setOutlet2] = useState<Outlet | null>(null);

  const [modalVisible, setModalVisible] = useState(false);
  const [selectingSlot, setSelectingSlot] = useState<1 | 2 | null>(null);

  const [outlets, setOutlets] = useState<Outlet[]>([]);
  const [loadingOutlets, setLoadingOutlets] = useState(true);

  // 🔒 SYSTEM STATUS
  const [acceptingOrders, setAcceptingOrders] = useState(true);
  const [checkingSystem, setCheckingSystem] = useState(true);

  const canContinue = outlet1 !== null && acceptingOrders;

  // 🔹 Fetch outlets + system status
  useEffect(() => {
    const init = async () => {
      try {
        const [outletsRes, systemRes] = await Promise.all([
          fetch(`${BASE_URL}/outlets`),
          fetch(`${BASE_URL}/system/status`),
        ]);

        const outletsData = await outletsRes.json();
        const systemData = await systemRes.json();

        setOutlets(outletsData);
        setAcceptingOrders(systemData.acceptingOrders);
      } catch (error) {
        console.error("Init failed", error);
      } finally {
        setLoadingOutlets(false);
        setCheckingSystem(false);
      }
    };

    init();
  }, []);

  // 🔹 Loading state
  if (loadingOutlets || checkingSystem) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, padding: 24 }}>
      {/* Header */}
      <Text style={{ fontSize: 26, fontWeight: "bold", marginBottom: 8 }}>
        Hi 👋
      </Text>

      <Text style={{ fontSize: 16, color: "#555", marginBottom: 32 }}>
        Order from multiple outlets in one delivery
      </Text>

      {/* Outlet Slot 1 */}
      <TouchableOpacity
        onPress={() => {
          setSelectingSlot(1);
          setModalVisible(true);
        }}
        style={{
          borderWidth: 1,
          borderColor: "#ccc",
          borderRadius: 10,
          padding: 16,
          marginBottom: 16,
        }}
      >
        <Text style={{ fontSize: 14, color: "#777" }}>
          Outlet 1 (required)
        </Text>
        <Text style={{ fontSize: 18, marginTop: 6 }}>
          {outlet1 ? outlet1.name : "Select first outlet"}
        </Text>
      </TouchableOpacity>

      {/* Outlet Slot 2 */}
      <TouchableOpacity
        onPress={() => {
          setSelectingSlot(2);
          setModalVisible(true);
        }}
        style={{
          borderWidth: 1,
          borderColor: "#ccc",
          borderRadius: 10,
          padding: 16,
          marginBottom: 32,
        }}
      >
        <Text style={{ fontSize: 14, color: "#777" }}>
          Outlet 2 (optional)
        </Text>
        <Text style={{ fontSize: 18, marginTop: 6 }}>
          {outlet2 ? outlet2.name : "Select second outlet (optional)"}
        </Text>
      </TouchableOpacity>

      {/* Continue Button */}
      <TouchableOpacity
        disabled={!canContinue}
        onPress={() =>
          navigation.navigate("Menu", {
            outlet1,
            outlet2,
          })
        }
        style={{
          backgroundColor: canContinue ? "#000" : "#aaa",
          paddingVertical: 14,
          borderRadius: 10,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Text
          style={{
            color: "#fff",
            fontSize: 16,
            fontWeight: "600",
          }}
        >
          {acceptingOrders
            ? "Continue to Menu"
            : "Delivery unavailable right now"}
        </Text>
      </TouchableOpacity>

      {/* 🔹 MY ORDERS BUTTON */}
      <TouchableOpacity
        onPress={() => navigation.navigate("MyOrders")}
        style={{
          marginTop: 16,
          paddingVertical: 14,
          borderRadius: 10,
          borderWidth: 1,
          borderColor: "#000",
          alignItems: "center",
        }}
      >
        <Text style={{ fontSize: 16, fontWeight: "500" }}>
          My Orders
        </Text>
      </TouchableOpacity>

      {/* TEMP LOGOUT */}
      <TouchableOpacity
        onPress={async () => {
          await clearUser();
        }}
        style={{ marginTop: 24 }}
      >
        <Text style={{ color: "red", textAlign: "center" }}>
          Logout
        </Text>
      </TouchableOpacity>

      {/* Outlet Picker Modal */}
      <OutletPickerModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        outlets={outlets}
        disabledOutlets={[
          outlet1?.name,
          outlet2?.name,
        ].filter(Boolean) as string[]}
        onSelect={(outlet: Outlet) => {
          if (selectingSlot === 1) setOutlet1(outlet);
          if (selectingSlot === 2) setOutlet2(outlet);
        }}
      />
    </View>
  );
}
