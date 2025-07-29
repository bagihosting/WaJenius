# ChatterJet - WhatsApp Bot

Ini adalah aplikasi dasbor dan backend untuk bot WhatsApp yang didukung oleh AI, dibangun menggunakan Next.js dan Genkit.

## Fitur

*   **Backend WhatsApp Webhook:** Menerima dan membalas pesan secara real-time.
*   **Integrasi AI:** Menggunakan Genkit untuk menghasilkan balasan cerdas.
*   **Dasbor Web:** Antarmuka untuk mengirim pesan dan mengelola bot.
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
git clone [URL_GIT_REPOSITORY_ANDA] chatterjet
cd chatterjet
```

### Langkah 4: Konfigurasi Variabel Lingkungan (.env)

Buat file `.env` di dalam direktori proyek.

```bash
nano .env
```

Salin dan tempel konfigurasi berikut ke dalam file tersebut. **Pastikan untuk mengisi semua nilai placeholder dengan kredensial asli dari Meta Developer Dashboard Anda.**

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
```

Simpan file dan keluar (tekan `Ctrl+X`, lalu `Y`, lalu `Enter`).

### Langkah 5: Instal Dependensi dan Build Aplikasi

Instal semua paket yang diperlukan dan build aplikasi untuk produksi.

```bash
npm install
npm run build
```

Proses `build` akan mengoptimalkan aplikasi Anda untuk performa terbaik.

### Langkah 6: Instal PM2 dan Jalankan Aplikasi

Untuk memastikan aplikasi Anda terus berjalan di latar belakang, gunakan manajer proses seperti `pm2`.

```bash
# Instal pm2 secara global
sudo npm install pm2 -g
```

Jalankan aplikasi Anda menggunakan `pm2`.

```bash
pm2 start npm --name "chatterjet" -- start -p 9002
```

*   `--name "chatterjet"`: Memberi nama pada proses Anda.
*   `-- start`: Menjalankan skrip `start` dari `package.json`.
*   `-p 9002`: Menjalankan aplikasi di port 9002. Anda bisa mengubah ini jika perlu.

Simpan konfigurasi `pm2` agar aplikasi otomatis berjalan setelah server reboot.

```bash
pm2 save
sudo pm2 startup
```

### Langkah 7: Konfigurasi Webhook di Meta Developer Dashboard

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

### Langkah 8: (Opsional tapi Sangat Direkomendasikan) Konfigurasi Nginx dengan Subdomain

Menggunakan Nginx sebagai *reverse proxy* adalah praktik terbaik untuk keamanan dan manajemen.

#### 1. Instal Nginx

```bash
sudo apt install -y nginx
```

#### 2. Buat File Konfigurasi Nginx untuk Subdomain Anda

Ganti `bot.domainanda.com` dengan subdomain yang Anda inginkan.

```bash
sudo nano /etc/nginx/sites-available/chatterjet
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
sudo ln -s /etc/nginx/sites-available/chatterjet /etc/nginx/sites-enabled/
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
