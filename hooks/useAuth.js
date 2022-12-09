import { View, Text } from "react-native";
import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import * as Google from "expo-auth-session/providers/google";
import {
  GoogleAuthProvider,
  onAuthStateChanged,
  signInWithCredential,
  signOut,
} from "@firebase/auth";
import {
  EXPO_CLIENT_ID,
  EXPO_ANDROID_CLIENT_ID,
  EXPO_IOS_CLIENT_ID,
} from "@env";

import { auth } from "../firebase";
const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [request, response, promptAsync] = Google.useIdTokenAuthRequest({
    expoClientId: EXPO_CLIENT_ID,
    iosClientId: EXPO_IOS_CLIENT_ID,
    androidClientId: EXPO_ANDROID_CLIENT_ID,
    scopes: ["profile", "email"],
  });
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);
  const [loadingInitial, setLoadingInitial] = useState(true);
  const [loading, setLoading] = useState(false);

  const logout = () => {
    setLoading(true);
    signOut(auth)
      .catch((error) => setError(error))
      .finally(() => setLoading(false));
  };

  useState(
    () =>
      onAuthStateChanged(auth, (user) => {
        if (user) {
          setUser(user);
        } else {
          setUser(null);
        }
        setLoadingInitial(false);
      }),
    []
  );

  useEffect(() => {
    const googleSignIn = async () => {
      setLoading(true);
      if (response?.type === "success") {
        const credential = GoogleAuthProvider.credential(
          response.params.id_token
        );
        await signInWithCredential(auth, credential);
        setLoading(false);
      }
      return Promise.reject();
    };
    googleSignIn();
  }, [response]);

  const memoedValue = useMemo(
    () => ({ user, loading, logout, promptAsync }),
    [user, loading, error]
  );

  const signInWithGoogle = () => {
    setLoading(true);
    promptAsync();
  };

  return (
    <AuthContext.Provider
      value={{ user, loading, logout, promptAsync: signInWithGoogle }}
    >
      {!loadingInitial && children}
    </AuthContext.Provider>
  );
};

export default function useAuth() {
  return useContext(AuthContext);
}
