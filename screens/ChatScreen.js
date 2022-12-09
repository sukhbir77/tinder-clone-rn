import { View, Text, SafeAreaView } from "react-native";
import * as React from "react";

import Header from "../components/Header";
import ChatList from "../components/ChatList";

const ChatScreen = () => {
  return (
    <SafeAreaView>
      <Header title="Chat" callEnabled={true} />
      <ChatList />
    </SafeAreaView>
  );
};

export default ChatScreen;
