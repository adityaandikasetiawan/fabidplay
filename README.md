# Fabidplay API Proxy Server

## Deskripsi
Server ini berfungsi sebagai proxy untuk meneruskan permintaan API dari aplikasi Fabidplay ke berbagai endpoint backend. Server menggunakan Express.js dan http-proxy-middleware untuk menangani routing dan proxy permintaan.

## Fitur
- Proxy untuk API IDMall (`https://apiidmall.supercorridor.co.id`)
- Proxy untuk API Subscription (`http://10.80.253.78:6868`)
- Endpoint khusus untuk upload KTP
- Endpoint khusus untuk upload tanda tangan
- Endpoint khusus untuk submit form FKB
- Penanganan CORS
- Logging untuk debugging
- Penanganan kesalahan

## Instalasi

```bash
# Instal dependensi
npm install

# Jalankan server
node server.js
```

Server akan berjalan di `http://localhost:3005` secara default.

## Konfigurasi
Konfigurasi server dapat diubah melalui variabel lingkungan atau dengan mengedit objek `CONFIG` di file `server.js`.

### Variabel Lingkungan
- `PORT`: Port untuk menjalankan server (default: 3005)

## Endpoint API

### API IDMall
- **Prefix**: `/api/idmall`
- **Target**: `https://apiidmall.supercorridor.co.id`
- **Contoh**: `http://localhost:3005/api/idmall/users` akan diteruskan ke `https://apiidmall.supercorridor.co.id/users`

### API Subscription
- **Prefix**: `/api/subscription`
- **Target**: `http://10.80.253.78:6868/api/subscription`
- **Contoh**: `http://localhost:3005/api/subscription/users` akan diteruskan ke `http://10.80.253.78:6868/api/subscription/users`

### Upload KTP
- **Endpoint**: `POST /api/upload-ktp`
- **Target**: `http://10.80.253.78:6868/api/subscription/retail/fkb/user`

### Upload Tanda Tangan
- **Endpoint**: `POST /api/upload-signature/:task_id`
- **Target**: `http://10.80.253.78:6868/api/subscription/signature/upload/:task_id`

### Submit Form FKB
- **Endpoint**: `POST /api/subscription/fkb/submit-form`
- **Target**: `http://10.80.253.78:6868/api/subscription/fkb/submit-form`

## Struktur Kode
- **Konfigurasi**: Objek `CONFIG` berisi semua konfigurasi server dan API
- **Middleware**: Fungsi `createStandardProxy` untuk membuat proxy dengan konfigurasi standar
- **Error Handling**: Middleware untuk menangani kesalahan server dan endpoint yang tidak ditemukan

## Pengembangan
Untuk menambahkan endpoint proxy baru, tambahkan konfigurasi di objek `CONFIG.APIS` dan gunakan fungsi `createStandardProxy` untuk membuat proxy.

```javascript
// Contoh menambahkan API baru
CONFIG.APIS.NEW_API = {
  BASE_URL: 'https://api.example.com',
  PATH_PREFIX: '/api/example',
  REWRITE_RULE: '^/api/example'
};

// Tambahkan proxy untuk API baru
app.use(
  CONFIG.APIS.NEW_API.PATH_PREFIX, 
  createStandardProxy(
    CONFIG.APIS.NEW_API.BASE_URL, 
    { [CONFIG.APIS.NEW_API.REWRITE_RULE]: '' },
    'New API'
  )
);
```