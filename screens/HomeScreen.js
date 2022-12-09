import {
  View,
  Text,
  Button,
  SafeAreaView,
  TouchableOpacity,
  Image,
  StyleSheet,
  Platform
} from "react-native";
import React, { useLayoutEffect, useRef, useState, useEffect } from "react";
import { useNavigation } from "@react-navigation/native";
import useAuth from "../hooks/useAuth";
import { AntDesign, Entypo, Ionicons, Fontisto } from "@expo/vector-icons";
import Swiper from "react-native-deck-swiper";
import {
  onSnapshot,
  doc,
  collection,
  setDoc,
  getDocs,
  query,
  where,
  getDoc,
  serverTimestamp
} from "firebase/firestore";
import { db } from "../firebase";
import generateId from "./../lib/generateId";

const HomeScreen = () => {
  const navigation = useNavigation();
  const { user, logout } = useAuth();
  const [profiles, setProfiles] = useState([]);
  const swipeRef = useRef();

  useEffect(
    () =>
      onSnapshot(doc(db, "users", user.uid), (snapshot) => {
        if (!snapshot.exists()) {
          navigation.navigate("Modal");
        }
      }),
    []
  );

  useEffect(() => {
    let unsub;
    const fetchCards = async () => {
      const passes = await getDocs(
        collection(db, "users", user.uid, "passes")
      ).then((snapshot) => snapshot.docs.map((doc) => doc.id));

      const swipes = await getDocs(
        collection(db, "users", user.uid, "swipes")
      ).then((snapshot) => snapshot.docs.map((doc) => doc.id));

      const passedUserIds = passes.length > 0 ? passes : ["test"];
      const swipedUserIds = swipes.length > 0 ? swipes : ["test"];

      unsub = onSnapshot(
        query(
          collection(db, "users"),
          where("id", "not-in", [...passedUserIds, ...swipedUserIds])
        ),
        (snapshot) => {
          setProfiles(
            snapshot.docs
              .filter((doc) => doc.id !== user.uid)
              .map((doc) => ({
                id: doc.id,
                ...doc.data(),
              }))
          );
        }
      );
    };
    fetchCards();
    return unsub;
  }, []);

  const swipeLeft = (cardIndex) => {
    if (!profiles[cardIndex]) return;

    const userSwiped = profiles[cardIndex];
    setDoc(doc(db, "users", user.uid, "passes", userSwiped.id), userSwiped);
  };

  const swipeRight = async (cardIndex) => {
    if (!profiles[cardIndex]) return;

    const userSwiped = profiles[cardIndex];
    const loggedInProfile = await (await getDoc(doc (db, "users", user.uid))).data();

    //Check if the user swiped on you
    getDoc(doc(db, "users", userSwiped.id, "swipes", user.uid)).then(
      (documentSnapshot) => {
        if (documentSnapshot.exists()) {
          
          // User Has Matched with you before you matched with them
          setDoc(
            doc(db, "users", user.uid, "swipes", userSwiped.id),
            userSwiped
          );

          //Create Match
          setDoc(doc(db, "matches", generateId(user.uid, userSwiped.id)), {
            users: {
              [user.uid]: loggedInProfile,
              [userSwiped.id]: userSwiped,
            },
            usersMatched: [user.uid, userSwiped.id],
            timestamp: serverTimestamp(),
          });
          navigation.navigate("Match", {
            loggedInProfile,
            userSwiped,
          });
        } else {
          setDoc(
            doc(db, "users", user.uid, "swipes", userSwiped.id),
            userSwiped
          );
        }
      }
    );
  };

  return (
    <SafeAreaView className="flex-1" style={{marginTop: Platform.OS === "android" ? 40 : 0 }}>
      {/* Header */}
      <View className=" flex -1 flex-row items-center justify-between px-5">
        <TouchableOpacity onPress={logout} className="h-10 w-10 rounded-full">
          <Image
            source={{ uri: user.photoURL }}
            className="h-10 w-10 rounded-full"
          />
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.navigate("Modal")}>
          <Fontisto name="tinder" size={35} color="#FF5864" />
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.navigate("Chat")}>
          <Ionicons name="chatbubbles-sharp" size={30} color="#FF5864" />
        </TouchableOpacity>
      </View>
      {/* End Of Header */}

      {/* Cards */}
      <View className="flex-1 -mt-6">
        <Swiper
          ref={swipeRef}
          containerStyle={{ backgroundColor: "transparent" }}
          cards={profiles}
          stackSize={5}
          showSecondCard
          cardIndex={0}
          verticalSwipe={false}
          animateCardOpacity
          onSwipedLeft={(cardIndex) => swipeLeft(cardIndex)}
          onSwipedRight={(cardIndex) => swipeRight(cardIndex)}
          backgroundColor={"#4FD0E9"}
          overlayLabels={{
            left: {
              title: "NOPE",
              style: {
                label: {
                  textAlign: "right",
                  color: "red",
                },
              },
            },
            right: {
              title: "LIKE",
              style: {
                label: {
                  color: "#4DED30",
                },
              },
            },
          }}
          renderCard={(card) => {
            return !card ? (
              <View
                style={styles.cardShadow}
                className="relative bg-white h-3/4  rounded-xl justify-center items-center"
              >
                <Text className="font-bold pb-5">No More Profiles</Text>
                <Image
                  className="h-20 w-20"
                  height={100}
                  width={100}
                  source={{ uri: "https://links.papareact.com/6gb" }}
                />
              </View>
            ) : (
              <View
                key={card.id}
                className="relative bg-white rounded-xl h-3/4"
              >
                <Image
                  source={{ uri: card.photoURL }}
                  className="absolute top-0 h-full w-full rounded-xl"
                />
                <View
                  className="absolute bottom-0 bg-white w-full flex-row justify-between items-between h-20 px-6 py-2 rounded-b-xl"
                  style={styles.cardShadow}
                >
                  <View>
                    <Text className="text-xl font-bold">
                      {card.displayName}
                    </Text>
                    <Text>{card.job}</Text>
                  </View>
                  <Text className="text-2xl font-bold">{card.age}</Text>
                </View>
              </View>
            );
          }}
        />
      </View>
      <View className="flex flex-row justify-evenly mb-5">
        <TouchableOpacity
          className="items-center justify-center rounded-full w-16 h-16 bg-red-200"
          onPress={() => swipeRef.current.swipeLeft()}
        >
          <Entypo name="cross" size={24} color="red" />
        </TouchableOpacity>
        <TouchableOpacity
          className="items-center justify-center rounded-full w-16 h-16 bg-green-200"
          onPress={() => swipeRef.current.swipeRight()}
        >
          <AntDesign name="heart" size={24} color="green" />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default HomeScreen;

const styles = StyleSheet.create({
  cardShadow: {
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
    elevation: 2,
  },
});
