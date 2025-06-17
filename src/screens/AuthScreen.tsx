import React, { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
} from "react-native";
import { Button, Input, Text } from "react-native-elements";
import { signIn, signUp, supabase } from "../services/supabase";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../../App";

type Props = NativeStackScreenProps<RootStackParamList, "Auth">;

// E-posta formatı için daha sıkı bir regex
const EMAIL_REGEX = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;

export default function AuthScreen({ navigation }: Props) {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");

  // Debug için session kontrolü
  useEffect(() => {
    const checkSession = async () => {
      try {
        const {
          data: { session },
          error,
        } = await supabase.auth.getSession();
        console.log("Mevcut oturum kontrolü:", { session, error });

        if (error) {
          console.error("Oturum kontrolü hatası:", error);
          return;
        }

        if (session?.user) {
          console.log("Aktif oturum bulundu:", session.user);
          navigation.replace("Main");
        }
      } catch (error) {
        console.error("Oturum kontrolü beklenmeyen hata:", error);
      }
    };

    checkSession();
  }, []);

  const validateEmail = (email: string): boolean => {
    if (!email) {
      setEmailError("E-posta adresi gerekli");
      return false;
    }

    // E-posta adresini normalize et
    email = email.toLowerCase().trim();

    // RFC 5322 standardına uygun e-posta validasyonu
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(email)) {
      setEmailError(
        "Geçerli bir e-posta adresi girin (örn: kullanici@domain.com)"
      );
      return false;
    }

    return true;
  };

  const validatePassword = (password: string): boolean => {
    if (!password) {
      setPasswordError("Şifre gerekli");
      return false;
    }

    if (password.length < 6) {
      setPasswordError("Şifre en az 6 karakter olmalı");
      return false;
    }

    if (!/[A-Z]/.test(password)) {
      setPasswordError("Şifre en az bir büyük harf içermeli");
      return false;
    }

    if (!/[0-9]/.test(password)) {
      setPasswordError("Şifre en az bir rakam içermeli");
      return false;
    }

    return true;
  };

  const validateInputs = () => {
    console.log("Input validasyonu başladı:", {
      email,
      password: password.length,
    });

    const isEmailValid = validateEmail(email);
    const isPasswordValid = validatePassword(password);

    console.log("Input validasyonu sonucu:", {
      isEmailValid,
      isPasswordValid,
      emailError,
      passwordError,
    });

    return isEmailValid && isPasswordValid;
  };

  const handleAuth = async () => {
    try {
      setEmailError("");
      setPasswordError("");

      if (!validateInputs()) {
        console.log("Validasyon başarısız");
        return;
      }

      setLoading(true);
      const normalizedEmail = email.toLowerCase().trim();

      console.log(`${isLogin ? "Giriş" : "Kayıt"} işlemi başlatılıyor:`, {
        email: normalizedEmail,
        passwordLength: password.length,
      });

      const { user, error } = await (isLogin
        ? signIn(normalizedEmail, password)
        : signUp(normalizedEmail, password));

      if (error) {
        console.error("Auth hatası:", error);

        // Hata mesajını uygun input alanına yerleştir
        if (error.message.includes("e-posta")) {
          setEmailError(error.message);
        } else if (error.message.includes("şifre")) {
          setPasswordError(error.message);
        } else {
          // Genel hata mesajı
          Alert.alert(
            isLogin ? "Giriş Hatası" : "Kayıt Hatası",
            error.message,
            [
              {
                text: "Tamam",
                onPress: () => {
                  // Şifre alanını temizle
                  if (error.message.includes("hatalı")) {
                    setPassword("");
                    setPasswordError("");
                  }
                },
              },
            ]
          );
        }
        return;
      }

      if (user) {
        if (!isLogin) {
          Alert.alert(
            "Kayıt Başarılı",
            "Hesabınız oluşturuldu. Lütfen e-posta adresinize gönderilen onay bağlantısına tıklayın.",
            [
              {
                text: "Tamam",
                onPress: () => {
                  setIsLogin(true);
                  setEmail("");
                  setPassword("");
                },
              },
            ]
          );
        } else {
          navigation.replace("Main");
        }
      }
    } catch (error) {
      console.error("Beklenmeyen hata:", error);
      Alert.alert(
        "Hata",
        "Beklenmeyen bir hata oluştu. Lütfen daha sonra tekrar deneyin.",
        [{ text: "Tamam" }]
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.form}>
          <Text h3 style={styles.title}>
            {isLogin ? "Giriş Yap" : "Kayıt Ol"}
          </Text>

          <Input
            placeholder="E-posta"
            value={email}
            onChangeText={(text) => {
              const normalized = text.toLowerCase().trim();
              setEmail(normalized);
              setEmailError("");
            }}
            autoCapitalize="none"
            keyboardType="email-address"
            errorMessage={emailError}
            disabled={loading}
          />

          <Input
            placeholder="Şifre"
            value={password}
            onChangeText={(text) => {
              setPassword(text);
              setPasswordError("");
            }}
            secureTextEntry
            errorMessage={passwordError}
            disabled={loading}
          />

          <Button
            title={isLogin ? "Giriş Yap" : "Kayıt Ol"}
            onPress={handleAuth}
            loading={loading}
            disabled={loading}
            containerStyle={styles.button}
          />

          <Button
            title={
              isLogin
                ? "Hesabınız yok mu? Kayıt olun"
                : "Zaten hesabınız var mı? Giriş yapın"
            }
            type="clear"
            disabled={loading}
            onPress={() => {
              setIsLogin(!isLogin);
              setEmailError("");
              setPasswordError("");
              setEmail("");
              setPassword("");
            }}
          />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: "center",
  },
  form: {
    padding: 20,
  },
  title: {
    textAlign: "center",
    marginBottom: 30,
  },
  button: {
    marginVertical: 10,
  },
});
