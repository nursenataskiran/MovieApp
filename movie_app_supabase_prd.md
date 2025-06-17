# 🎬 Movie App – Ürün Gereksinimleri Dokümanı (prd.md)

## 🔖 Proje Adı

**Movie App**

## 🎯 Proje Amacı

Kullanıcıların popüler filmleri inceleyebileceği, arama yapabileceği, filmlere puan ve yorum verebileceği, kendi izleme listelerini oluşturabileceği basit bir film uygulamasıdır. TMDB API kullanılacak ve Supabase tabanlı temel kullanıcı yönetimi ile film etkileşimi sağlanacaktır.

---

## 🖼️ Uygulama Arayüzleri (Frontend)

### 1. Login & Register Screen

- E-posta ve şifre ile kayıt ve giriş.
- Supabase Authentication kullanılacak.
- Temel form validasyonu.

### 2. Home Screen

- TMDB API'den:
  - Popüler filmler
  - En çok izlenen filmler
  - En çok puanlanan filmler
- Kullanıcıya önerilen filmler (rastgele veya puana göre).
- Film kartları tıklanabilir olacak, detay ekranına yönlendirecek.

### 3. Movie Screen

- Film bilgileri:
  - Başlık, poster, özet, çıkış tarihi (TMDB'den alınır)
- Kullanıcı yorumları ve puanları (Supabase'den alınır).
- Kullanıcılar:
  - 1-5 aralığında puan verebilir.
  - Yorum ekleyebilir, düzenleyebilir, silebilir.

### 4. Search Screen

- TMDB API ile film arama.
- Sonuçlar listelenir, detay ekranına geçilir.

### 5. User Profile Screen

- Ad, e-posta, profil fotoğrafı.
- Kullanıcının:
  - İzleme listesi
  - Puanladığı filmler
- Profil bilgilerini düzenleyebilme.

### 6. Watchlist Screen

- Kullanıcının izleme listesi.
- Listeden film çıkarabilme.

---

## 🛠️ Backend (Supabase) Fonksiyonları

### 1. Authentication (Kimlik Doğrulama)

- Supabase Auth ile kullanıcı kayıt ve giriş işlemleri.
- Kullanıcı kimlik bilgileri (email, isim, profil fotoğrafı).

### 2. Watchlist İşlemleri

- `watchlist` tablosunda kullanıcı-ID ve film-ID tutulur.
- Film ekleme/çıkarma işlemleri yapılır.
- Kullanıcıya özel izleme listesi çekilebilir.

### 3. Film Puanlama

- `ratings` tablosunda kullanıcı-ID, film-ID ve 1-5 arası puan.
- Filmin ortalama puanı hesaplanabilir.

### 4. Film Yorumlama

- `comments` tablosunda kullanıcı-ID, film-ID, yorum metni ve tarih.
- Yorumlar eklenebilir, düzenlenebilir, silinebilir.

---

## 📦 Kullanılan Teknolojiler

### Frontend

- React Native
- Expo
- React Navigation
- Axios
- AsyncStorage
- TMDB API

### Backend

- Supabase (veritabanı, auth ve API)

---

## 🗂️ Ekstra Özellikler (isteğe bağlı)

- Profil fotoğrafı yükleme (Supabase storage)
- Karanlık mod

---

Hazırlandı: Haziran 2025
