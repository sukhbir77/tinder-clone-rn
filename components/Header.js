import { View, Text, TouchableOpacity, Platform } from "react-native";
import React from "react";
import { Foundation, Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";

const Header = ({ title, callEnabled }) => {
  const navigation = useNavigation();
  return (
    <View className="p-2 flex-row items-center justify-between" style={{marginTop: Platform.OS === "android" ? 40 : 0 }}>
      <View className="flex flex-row items-center">
        <TouchableOpacity className="p-2" onPress={() => navigation.goBack()}>
          <Ionicons
            name="chevron-back-outline"
            size={34}
            color="#FF5864"
          ></Ionicons>
        </TouchableOpacity>
        <Text className="text-2xl font-bold pl-2">{title}</Text>
      </View>
      {callEnabled && (
        <TouchableOpacity className="rounded-full mr-4 p-2 w-12 items-center bg-red-200">
            <Foundation name="telephone" size={30} color="#FF5864" />
        </TouchableOpacity>
      )}
    </View>
  );
};

export default Header;
