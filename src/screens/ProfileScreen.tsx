import React, { useState, useEffect } from "react";
import { View, StyleSheet, Alert, TouchableOpacity, Image } from "react-native";
import { Text, Button } from "react-native-elements";
import * as ImagePicker from "expo-image-picker";
import type { CompositeScreenProps } from "@react-navigation/native";
import type { BottomTabScreenProps } from "@react-navigation/bottom-tabs";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { BottomTabParamList, RootStackParamList } from "../../App";
import { supabase, signOut } from "../services/supabase";

type Props = CompositeScreenProps<
  BottomTabScreenProps<BottomTabParamList, "Profile">,
  NativeStackScreenProps<RootStackParamList>
>;

export default function ProfileScreen({ navigation }: Props) {
  const [loading, setLoading] = useState(false);
  const [avatar, setAvatar] = useState<string | null>(null);
  const [email, setEmail] = useState<string>("");

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        setEmail(user.email || "");
        // TODO: Load avatar from Supabase storage
      }
    } catch (error) {
      console.error("Error loading profile:", error);
    }
  };

  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 1,
      });

      if (!result.canceled) {
        // TODO: Upload image to Supabase storage
        setAvatar(result.assets[0].uri);
      }
    } catch (error) {
      Alert.alert("Hata", "Fotoğraf seçilirken bir hata oluştu.");
    }
  };

  const handleSignOut = async () => {
    setLoading(true);
    try {
      await signOut();
      navigation.replace("Auth");
    } catch (error) {
      Alert.alert("Hata", "Çıkış yapılırken bir hata oluştu.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={pickImage}>
          <View style={styles.avatarContainer}>
            {avatar ? (
              <Image source={{ uri: avatar }} style={styles.avatar} />
            ) : (
              <View style={[styles.avatar, styles.placeholderAvatar]}>
                <Text style={styles.placeholderText}>
                  {email.charAt(0).toUpperCase()}
                </Text>
              </View>
            )}
            <View style={styles.editBadge}>
              <Text style={styles.editBadgeText}>Düzenle</Text>
            </View>
          </View>
        </TouchableOpacity>

        <Text h4 style={styles.email}>
          {email}
        </Text>
      </View>

      <View style={styles.section}>
        <Text h4 style={styles.sectionTitle}>
          Hesap Ayarları
        </Text>
        <Button
          title="Çıkış Yap"
          onPress={handleSignOut}
          loading={loading}
          buttonStyle={styles.signOutButton}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  header: {
    alignItems: "center",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  avatarContainer: {
    position: "relative",
    marginBottom: 10,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  placeholderAvatar: {
    backgroundColor: "#e1e1e1",
    justifyContent: "center",
    alignItems: "center",
  },
  placeholderText: {
    fontSize: 40,
    color: "#666",
  },
  editBadge: {
    position: "absolute",
    right: 0,
    bottom: 0,
    backgroundColor: "#000",
    padding: 5,
    borderRadius: 10,
  },
  editBadgeText: {
    color: "#fff",
    fontSize: 12,
  },
  email: {
    marginTop: 10,
  },
  section: {
    padding: 20,
  },
  sectionTitle: {
    marginBottom: 20,
  },
  signOutButton: {
    backgroundColor: "#ff0000",
  },
});
