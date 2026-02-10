import { Modal, View, Text, TouchableOpacity } from "react-native";

type Outlet = {
  _id: string;
  name: string;
  menuImages: string[];
  instructions: string;
};

interface Props {
  visible: boolean;
  onClose: () => void;
  onSelect: (outlet: Outlet) => void;
  disabledOutlets: string[];
  outlets: Outlet[];
}

export default function OutletPickerModal({
  visible,
  onClose,
  onSelect,
  disabledOutlets,
  outlets,
}: Props) {
  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View
        style={{
          flex: 1,
          backgroundColor: "rgba(0,0,0,0.4)",
          justifyContent: "flex-end",
        }}
      >
        <View
          style={{
            backgroundColor: "#fff",
            padding: 24,
            borderTopLeftRadius: 16,
            borderTopRightRadius: 16,
          }}
        >
          <Text style={{ fontSize: 20, fontWeight: "bold", marginBottom: 16 }}>
            Select an Outlet
          </Text>

          {outlets.map((outlet) => {
            const disabled = disabledOutlets.includes(outlet.name);

            return (
              <TouchableOpacity
                key={outlet._id}
                disabled={disabled}
                onPress={() => {
                  onSelect(outlet);
                  onClose();
                }}
                style={{
                  paddingVertical: 14,
                  opacity: disabled ? 0.4 : 1,
                }}
              >
                <Text style={{ fontSize: 16 }}>{outlet.name}</Text>
              </TouchableOpacity>
            );
          })}

          <TouchableOpacity onPress={onClose} style={{ marginTop: 16 }}>
            <Text style={{ color: "red", textAlign: "center" }}>
              Cancel
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}
