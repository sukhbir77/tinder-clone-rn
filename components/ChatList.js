import { View, Text, FlatList } from "react-native";
import React, { useState, useEffect } from "react";
import { onSnapshot, collection, query, where } from "@firebase/firestore";

import useAuth from "../hooks/useAuth";
import { db } from "../firebase";
import ChatRow from "./ChatRow";

const ChatList = () => {
  const [matches, setMatches] = useState([]);
  const { user } = useAuth();

  useEffect(
    () =>
      onSnapshot(
        query(
          collection(db, "matches"),
          where("usersMatched", "array-contains", user.uid)
        ),
        (snapShot) =>
          setMatches(
            snapShot.docs.map((doc) => ({
              id: doc.id,
              ...doc.data(),
            }))
          )
      ),
    []
  );

  return matches.length > 0 ? (
    <FlatList
        className="h-full"
      data={matches}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => <ChatRow matchDetails={item} />}
    />
  ) : (
    <View className="p-5">
      <Text className="text-center text-lg">No Matches at the moment</Text>
    </View>
  );
};

export default ChatList;
