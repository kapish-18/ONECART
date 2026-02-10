import {
  View,
  Text,
  ScrollView,
  Image,
  TextInput,
  TouchableOpacity,
} from "react-native";
import { useState } from "react";
import { useNavigation } from "@react-navigation/native";

type Outlet = {
  _id: string;
  name: string;
  menuImages: string[];
  instructions: string;
};

export default function MenuScreen({ route }: any) {
  const { outlet1, outlet2 } = route.params as {
    outlet1: Outlet;
    outlet2?: Outlet | null;
  };

  const navigation = useNavigation<any>();

  const [outlet1Notes, setOutlet1Notes] = useState("");
  const [outlet2Notes, setOutlet2Notes] = useState("");

  return (
    <ScrollView
      style={{ flex: 1 }}
      contentContainerStyle={{ padding: 24 }}
      showsVerticalScrollIndicator={false}
    >
      {/* ---------- OUTLET 1 ---------- */}
      <Text style={{ fontSize: 22, fontWeight: "bold", marginBottom: 12 }}>
        {outlet1.name}
      </Text>

      {/* Menu Images */}
      <ScrollView
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        style={{ marginBottom: 12 }}
      >
        {outlet1.menuImages.map((img, index) => (
          <Image
            key={index}
            source={{ uri: img }}
            style={{
              width: 280,
              height: 380,
              borderRadius: 12,
              marginRight: 12,
              backgroundColor: "#eee",
            }}
            resizeMode="contain"
          />
        ))}
      </ScrollView>

      {/* Instructions */}
      <Text style={{ fontSize: 14, color: "#666", marginBottom: 6 }}>
        {outlet1.instructions}
      </Text>

      {/* Text Input */}
      <TextInput
        placeholder="Type what you want from this outlet..."
        value={outlet1Notes}
        onChangeText={setOutlet1Notes}
        multiline
        style={{
          borderWidth: 1,
          borderColor: "#ccc",
          borderRadius: 10,
          padding: 12,
          minHeight: 80,
          marginBottom: 32,
          textAlignVertical: "top",
        }}
      />

      {/* ---------- OUTLET 2 (OPTIONAL) ---------- */}
      {outlet2 && (
        <>
          <Text
            style={{
              fontSize: 22,
              fontWeight: "bold",
              marginBottom: 12,
            }}
          >
            {outlet2.name}
          </Text>

          <ScrollView
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            style={{ marginBottom: 12 }}
          >
            {outlet2.menuImages.map((img, index) => (
              <Image
                key={index}
                source={{ uri: img }}
                style={{
                  width: 280,
                  height: 380,
                  borderRadius: 12,
                  marginRight: 12,
                  backgroundColor: "#eee",
                }}
                resizeMode="contain"
              />
            ))}
          </ScrollView>

          <Text style={{ fontSize: 14, color: "#666", marginBottom: 6 }}>
            {outlet2.instructions}
          </Text>

          <TextInput
            placeholder="Type what you want from this outlet..."
            value={outlet2Notes}
            onChangeText={setOutlet2Notes}
            multiline
            style={{
              borderWidth: 1,
              borderColor: "#ccc",
              borderRadius: 10,
              padding: 12,
              minHeight: 80,
              marginBottom: 32,
              textAlignVertical: "top",
            }}
          />
        </>
      )}

      {/* ---------- REVIEW ORDER BUTTON ---------- */}
      <TouchableOpacity
        onPress={() => {
          const order = {
            outlets: [
              {
                outletId: outlet1._id,
                outletName: outlet1.name,
                items: outlet1Notes,
              },
              ...(outlet2
                ? [
                    {
                      outletId: outlet2._id,
                      outletName: outlet2.name,
                      items: outlet2Notes,
                    },
                  ]
                : []),
            ],
          };

          navigation.navigate("ReviewOrder", { order });
        }}
        style={{
          backgroundColor: "#000",
          paddingVertical: 16,
          borderRadius: 12,
          alignItems: "center",
          marginBottom: 40,
        }}
      >
        <Text
          style={{
            color: "#fff",
            fontSize: 16,
            fontWeight: "600",
          }}
        >
          Review Order
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}
