# WartaBot - WhatsApp Bot

Ini adalah aplikasi dasbor dan backend untuk bot WhatsApp yang didukung oleh AI, dibangun menggunakan Next.js dan Genkit.

## Fitur

*   **Backend WhatsApp Webhook:** Menerima dan membalas pesan secara real-time.
*   **Integrasi AI:** Menggunakan Genkit untuk menghasilkan balasan cerdas.
*   **Dasbor Web:** Antarmuka untuk mengirim pesan dan mengelola bot.
*   **Penyimpanan Cloud:** Terintegrasi dengan Google Cloud Firestore untuk menyimpan riwayat percakapan.
*   **Aman:** Verifikasi webhook menggunakan `WHATSAPP_APP_SECRET`.

---

## Panduan Instalasi di Server Ubuntu 22.04

Berikut adalah cara menginstal dan menjalankan aplikasi ini di server Ubuntu 22.04 agar terhubung dengan WhatsApp secara permanen.

### Langkah 1: Persiapan Server

Pertama, pastikan server Anda sudah diperbarui.

```bash
sudo apt update && sudo apt upgrade -y
```

### Langkah 2: Instal Node.js

Aplikasi ini memerlukan Node.js. Sebaiknya instal versi 18.x atau yang lebih baru.

```bash
# Mengunduh dan menjalankan skrip instalasi NodeSource
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -

# Menginstal Node.js dan npm
sudo apt-get install -y nodejs
```

Verifikasi instalasi:

```bash
node -v  # Seharusnya menampilkan v18.x.x atau lebih tinggi
npm -v
```

### Langkah 3: Instal Git dan Clone Proyek

Jika Anda belum memiliki Git, instal terlebih dahulu.

```bash
sudo apt install -y git
```

Clone kode proyek Anda ke server. Ganti `[URL_GIT_REPOSITORY_ANDA]` dengan URL repositori Git Anda.

```bash
git clone [URL_GIT_REPOSITORY_ANDA] wartabot
cd wartabot
```

### Langkah 4: Buat Kredensial Firebase Admin (Penting)

Backend aplikasi ini menggunakan Firebase Admin SDK untuk berinteraksi secara aman dengan Firestore. Ini memerlukan file kunci akun layanan (service account key).

1.  **Buka Google Cloud Console:** Navigasi ke [IAM & Admin > Service Accounts](https://console.cloud.google.com/iam-admin/serviceaccounts) di Google Cloud Console. Pastikan Anda telah memilih proyek Firebase (`chatterjet`) Anda.
2.  **Pilih Akun Layanan:** Temukan akun layanan dengan nama yang mirip seperti `firebase-adminsdk-...` atau buat yang baru. Akun ini harus memiliki peran **Editor** atau peran lain yang memberikan izin untuk mengakses Firestore.
3.  **Buat Kunci Baru:** Klik pada akun layanan, lalu buka tab "Keys". Klik "Add Key" -> "Create new key".
4.  **Pilih JSON:** Pilih tipe kunci **JSON** dan klik "Create". Sebuah file `.json` akan diunduh secara otomatis.
5.  **Amankan Kunci:** Jaga kerahasiaan file ini! **Jangan pernah** memasukkannya ke dalam repositori Git Anda.

### Langkah 5: Konfigurasi Variabel Lingkungan (.env)

Buat file `.env` di dalam direktori proyek.

```bash
nano .env
```

Salin dan tempel konfigurasi berikut.

```
# Kredensial WhatsApp Business API dari Meta Developer Dashboard
WHATSAPP_ACCESS_TOKEN=YOUR_ACCESS_TOKEN
WHATSAPP_PHONE_NUMBER_ID=YOUR_PHONE_NUMBER_ID
WHATSAPP_APP_SECRET=YOUR_APP_SECRET

# Token ini Anda buat sendiri. Harus sama dengan yang dimasukkan di Meta Dashboard
WHATSAPP_VERIFY_TOKEN=YOUR_VERIFY_TOKEN

# Nomor telepon bot Anda (untuk ditampilkan di UI)
# Contoh: +15551234567
NEXT_PUBLIC_WHATSAPP_PHONE_NUMBER=YOUR_WHATSAPP_NUMBER

# Nomor telepon penerima untuk pengujian dari dasbor
# Contoh: 6281234567890
NEXT_PUBLIC_WHATSAPP_RECIPIENT_PHONE_NUMBER=YOUR_RECIPIENT_NUMBER

# Kredensial Firebase Admin SDK
# Buka file JSON yang Anda unduh, salin SELURUH isinya, dan tempel di sini.
# Pastikan tidak ada baris baru yang tidak perlu.
FIREBASE_SERVICE_ACCOUNT_KEY={"type": "service_account", "project_id": "...", ...}

```
*   **Isi `FIREBASE_SERVICE_ACCOUNT_KEY`:** Buka file JSON yang baru saja Anda unduh. Salin seluruh kontennya dan tempelkan sebagai nilai untuk `FIREBASE_SERVICE_ACCOUNT_KEY`. Pastikan semuanya berada dalam satu baris.
*   **Isi kredensial WhatsApp lainnya.**

Simpan file dan keluar (tekan `Ctrl+X`, lalu `Y`, lalu `Enter`).

### Langkah 6: Instal Dependensi dan Build Aplikasi

Instal semua paket yang diperlukan dan build aplikasi untuk produksi.

```bash
npm install
npm run build
```

Proses `build` akan mengoptimalkan aplikasi Anda untuk performa terbaik.

### Langkah 7: Instal PM2 dan Jalankan Aplikasi

Untuk memastikan aplikasi Anda terus berjalan di latar belakang, gunakan manajer proses seperti `pm2`.

```bash
# Instal pm2 secara global
sudo npm install pm2 -g
```

Jalankan aplikasi Anda menggunakan `pm2`.

```bash
pm2 start npm --name "wartabot" -- start -p 9002
```

*   `--name "wartabot"`: Memberi nama pada proses Anda.
*   `-- start`: Menjalankan skrip `start` dari `package.json`.
*   `-p 9002`: Menjalankan aplikasi di port 9002. Anda bisa mengubah ini jika perlu.

Simpan konfigurasi `pm2` agar aplikasi otomatis berjalan setelah server reboot.

```bash
pm2 save
sudo pm2 startup
```

### Langkah 8: Konfigurasi Webhook di Meta Developer Dashboard

Aplikasi Anda sekarang berjalan di `http://[ALAMAT_IP_SERVER_ANDA]:9002`. Namun, untuk produksi, Anda harus menggunakan URL HTTPS yang disediakan oleh Nginx dan subdomain Anda.

1.  **URL Webhook:** Alamat lengkap webhook Anda seharusnya `https://[SUBDOMAIN_ANDA]/api/whatsapp/webhook`.
2.  **Konfigurasi di Meta:**
    *   Buka Pengaturan Aplikasi Meta Anda -> Produk -> WhatsApp -> Konfigurasi.
    *   Klik "Edit" pada bagian Webhooks.
    *   Masukkan **URL Webhook** HTTPS Anda.
    *   Masukkan **Verify Token** yang sama dengan yang Anda tulis di file `.env`.
    *   Klik "Verify and Save".
    *   Setelah terverifikasi, klik "Manage" dan pastikan Anda berlangganan (`subscribe`) ke event `messages`.

Aplikasi Anda sekarang sepenuhnya terhubung dan siap merespons pesan WhatsApp secara otomatis.

### Langkah 9: (Sangat Direkomendasikan) Konfigurasi Nginx dengan Subdomain

Menggunakan Nginx sebagai *reverse proxy* adalah praktik terbaik untuk keamanan dan manajemen.

#### 1. Instal Nginx

```bash
sudo apt install -y nginx
```

#### 2. Buat File Konfigurasi Nginx untuk Subdomain Anda

Ganti `bot.domainanda.com` dengan subdomain yang Anda inginkan.

```bash
sudo nano /etc/nginx/sites-available/wartabot
```

Salin dan tempel konfigurasi berikut. Pastikan untuk mengganti `bot.domainanda.com` dengan subdomain Anda.

```nginx
server {
    listen 80;
    server_name bot.domainanda.com;

    location / {
        proxy_pass http://localhost:9002;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

*   `listen 80`: Nginx akan mendengarkan lalu lintas HTTP.
*   `server_name`: Subdomain yang akan Anda gunakan.
*   `proxy_pass`: Meneruskan semua permintaan ke aplikasi Next.js Anda yang berjalan di port 9002.

#### 3. Aktifkan Konfigurasi

Buat *symbolic link* dari konfigurasi Anda ke direktori `sites-enabled`.

```bash
sudo ln -s /etc/nginx/sites-available/wartabot /etc/nginx/sites-enabled/
```

Periksa apakah konfigurasi Nginx Anda valid:

```bash
sudo nginx -t
```

Jika tidak ada error, restart Nginx untuk menerapkan perubahan:

```bash
sudo systemctl restart nginx
```

#### 4. Dapatkan Sertifikat SSL (HTTPS) dengan Certbot

WhatsApp **mewajibkan** webhook menggunakan HTTPS. Cara termudah adalah menggunakan Let's Encrypt.

Instal Certbot:
```bash
sudo apt install certbot python3-certbot-nginx -y
```

Jalankan Certbot untuk Nginx. Ganti `bot.domainanda.com` dengan subdomain Anda.
```bash
sudo certbot --nginx -d bot.domainanda.com
```
Certbot akan secara otomatis mengedit file konfigurasi Nginx Anda untuk menambahkan pengaturan SSL dan mengatur pembaruan otomatis.

Setelah selesai, Nginx akan melayani aplikasi Anda di `https://bot.domainanda.com`.

### Langkah 10: (Penting) Konfigurasi Cloud Firestore

Aplikasi ini menggunakan Google Cloud Firestore untuk menyimpan riwayat percakapan. Anda harus mengaktifkannya di Firebase Console.

1.  **Buka Firebase Console:** Navigasi ke [Firebase Console](https://console.firebase.google.com/) dan pilih proyek Anda (`chatterjet`).
2.  **Pilih Cloud Firestore:** Dari menu di sebelah kiri, klik "Build" -> "Firestore Database".
3.  **Buat Database:** Klik tombol "Create database".
4.  **Mulai dalam Mode Produksi:** Pilih "Start in **production mode**". Ini lebih aman. Klik "Next".
5.  **Pilih Lokasi:** Pilih lokasi Cloud Firestore yang paling dekat dengan server atau pengguna Anda. Klik "Enable".
6.  **Aturan Keamanan (Tidak Perlu Diubah):** Karena backend kita sekarang menggunakan Firebase Admin SDK, ia akan melewati aturan keamanan. Anda dapat membiarkan aturan default yang memblokir semua akses klien, yang lebih aman.

Database Anda sekarang siap untuk digunakan oleh aplikasi WartaBot.
