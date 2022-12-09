import {
  View,
  Text,
  Keyboard,
  SafeAreaView,
  TextInput,
  Button,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  FlatList,
} from "react-native";
import React, { useState, useEffect } from "react";

import Header from "../components/Header";
import useAuth from "../hooks/useAuth";
import getMatchedUserInfo from "../lib/getMatchedUserInfo";
import { useRoute } from "@react-navigation/native";
import SenderMessage from "../components/SenderMessage";
import RecieverMessage from "../components/RecieverMessage";
import {
  addDoc,
  collection,
  serverTimestamp,
  onSnapshot,
  query,
  orderBy,
} from "@firebase/firestore";
import { db } from "../firebase";

const MessageScreen = () => {
  const { user } = useAuth();
  const { params } = useRoute();
  const { matchDetails } = params;

  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([]);

  useEffect(() => 
    onSnapshot(
      query(
        collection(db, "matches", matchDetails.id, "messages"),
        orderBy("timestamp", "desc")
      ),
      (snapshot) =>
        setMessages(
          snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }))
        )
    )
  , [matchDetails, db]);

  const sendMessage = () => {
    if(input.length < 1) return;
    addDoc(collection(db, "matches", matchDetails.id, "messages"), {
      timestamp: serverTimestamp(),
      userId: user.uid,
      displayName: user.displayName,
      photoURL: matchDetails.users[user.uid].photoURL,
      message: input,
    });
    setInput("");
  };

  return (
    <SafeAreaView className="flex-1">
      <Header
        callEnabled={true}
        title={getMatchedUserInfo(matchDetails?.users, user.uid).displayName}
      />
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
        keyboardVerticalOffset={10}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <FlatList
            data={messages}
            inverted={-1}
            className="pl-4"
            keyExtractor={(item) => item.id}
            renderItem={({ item: message }) => {
             return message?.userId === user.uid ? (
                <SenderMessage key={message.id} message={message} />
              ) : (
                <RecieverMessage key={message.id} message={message} />
              );
            }}
          />
        </TouchableWithoutFeedback>

        <View className="flex-row justify-between items-center border-t border-gray-200 px-5 py-2">
          <TextInput
            className="h-10 text-lg"
            placeholder="Send Message..."
            onChangeText={setInput}
            onSubmitEditing={sendMessage}
            value={input}
          />
          <Button title="Send" color="#FF5864" onPress={sendMessage} />
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default MessageScreen;
