# Setup Google Authentication

Fitur login dengan Google telah berhasil diimplementasikan. Berikut adalah langkah-langkah untuk setup Google OAuth:

## 1. Konfigurasi Google OAuth Console

1. Pergi ke [Google Cloud Console](https://console.cloud.google.com/)
2. Buat project baru atau pilih project yang sudah ada
3. Aktifkan **Google+ API** atau **Google Identity API**
4. Buat **OAuth 2.0 Client IDs**:
   - Pilih **Web application**
   - Tambahkan **Authorized JavaScript origins**: `http://localhost:3000` (untuk development)
   - Tambahkan **Authorized redirect URIs**: `http://localhost:3000/auth/google/callback`
5. Copy **Client ID** dan **Client Secret**

## 2. Setup Environment Variables

Tambahkan variabel berikut ke file `.env`:

```env
GOOGLE_CLIENT_ID=your-google-client-id.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-google-client-secret
```

## 3. Cara Menggunakan GraphQL API

### Login dengan Google

```graphql
mutation GoogleLogin($input: GoogleLoginInput!) {
  googleLogin(input: $input) {
    success
    message
    token
    user {
      id
      email
      namaLengkap
      noHP
      isVerified
      profilePicture
      authProvider
    }
  }
}
```

Variables:

```json
{
  "input": {
    "googleToken": "eyJhbGciOiJSUzI1NiIsImtpZCI6I..."
  }
}
```

### Lengkapi Profil Google User (jika noHP kosong)

```graphql
mutation CompleteGoogleProfile($input: CompleteGoogleProfileInput!) {
  completeGoogleProfile(input: $input) {
    success
    message
    data {
      id
      email
      namaLengkap
      noHP
      profilePicture
    }
  }
}
```

Variables:

```json
{
  "input": {
    "noHP": "08123456789"
  }
}
```

## 4. Frontend Integration (React/JavaScript)

### Install Google Sign-In

```bash
npm install @google-oauth/id-services
```

### Setup Google Sign-In Button

```javascript
import { googleLogout, useGoogleLogin } from "@react-oauth/google";

const GoogleLoginButton = () => {
  const login = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      // Kirim token ke backend
      const { data } = await apolloClient.mutate({
        mutation: GOOGLE_LOGIN_MUTATION,
        variables: {
          input: {
            googleToken: tokenResponse.access_token,
          },
        },
      });

      if (data.googleLogin.success) {
        // Simpan token JWT
        localStorage.setItem("token", data.googleLogin.token);
        // Redirect atau update state
      }
    },
  });

  return <button onClick={() => login()}>Login with Google</button>;
};
```

## 5. Flow Aplikasi

1. **User klik "Login with Google"**
2. **Google OAuth popup** terbuka
3. **User login** ke Google account
4. **Frontend mendapat Google token**
5. **Kirim token ke backend** via GraphQL mutation `googleLogin`
6. **Backend verify token** dengan Google API
7. **Backend membuat/update user** di database
8. **Backend mengembalikan JWT token**
9. **Frontend simpan JWT** untuk request selanjutnya
10. **Jika noHP kosong**, tampilkan form untuk melengkapi profil

## 6. Fitur Tambahan

- **Auto-verified**: User Google otomatis terverifikasi
- **Profile picture**: Gambar profil dari Google account
- **Mixed authentication**: User bisa login email/password atau Google
- **Profile completion**: Google user bisa melengkapi nomor HP

## 7. Error Handling

- Token Google tidak valid
- Email Google belum terverifikasi
- Network errors
- Database errors

Pastikan untuk handle semua error dengan pesan yang user-friendly.
