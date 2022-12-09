import {
  View,
  Text,
  Button,
  ImageBackground,
  TouchableOpacity,
} from "react-native";
import React, { useLayoutEffect } from "react";
import { useNavigation } from "@react-navigation/native";
import useAuth from "../hooks/useAuth";

const LoginScreen = () => {
  const { user, promptAsync, loading } = useAuth();
  const navigation = useNavigation();

  useLayoutEffect(() => {
    navigation.setOptions({
      headerShown: false,
    });
  }, []);

  return (
    <View className="flex flex-1">
      <ImageBackground
        resizeMode="cover"
        source={{ uri: "https://tinder.com/static/tinder.png" }}
        className="flex-1"
      >
        <TouchableOpacity
          className="absolute bottom-40 w-52 bg-white p-4 rounded-xl"
          style={{ marginHorizontal: "25%" }}
          onPress={promptAsync}
        >
          <Text className="text-center font-semibold">Sign in & get swiping</Text>
        </TouchableOpacity>
      </ImageBackground>
    </View>
  );
};

export default LoginScreen;
