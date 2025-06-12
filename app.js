const express = require('express');
const multer = require('multer');
const path = require('path');
const bodyParser = require('body-parser');
const cors = require('cors');
const fs = require('fs');

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));

// Set view engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Konfigurasi penyimpanan untuk upload file
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

// Pastikan folder uploads ada
if (!fs.existsSync('uploads')) {
  fs.mkdirSync('uploads');
}

const upload = multer({ storage: storage });

// Routes
app.get('/', (req, res) => {
  // Ambil parameter cid dan key dari query string
  const cid = req.query.cid || '';
  const key = req.query.key || '';
  
  // Periksa apakah cid dan key ada
  if (!cid || !key) {
    // Jika tidak ada cid atau key, arahkan ke halaman error
    return res.render('error', { 
      message: 'CID dan Key tidak ditemukan',
      redirectUrl: 'https://idplay.co.id'
    });
  }
  
  // Kirim parameter ke template jika valid
  res.render('index', { cid: cid, key: key });
});
app.get('/thankyou', (req, res) => {
  res.render('thankyou');
});

// API untuk menyimpan formulir yang sudah diisi
app.post('/submit-form', upload.single('pdf'), (req, res) => {
  // Logika untuk menyimpan formulir dan data tanda tangan
  console.log('Form submitted:', req.body);
  
  // Periksa apakah TNC telah disetujui
  if (req.body.tnc_agreed !== 'true') {
    return res.json({ success: false, message: 'Anda harus menyetujui Syarat dan Ketentuan' });
  }
  
  // Periksa apakah KTP telah diunggah
  if (!req.body.ktp_image) {
    return res.json({ success: false, message: 'Foto KTP diperlukan' });
  }
  
  // Periksa apakah tanda tangan pelanggan ada
  if (!req.body.signature) {
    return res.json({ success: false, message: 'Tanda tangan pelanggan diperlukan' });
  }
  
  // Simpan gambar KTP
  if (req.body.ktp_image) {
    const ktpData = req.body.ktp_image.replace(/^data:image\/\w+;base64,/, '');
    const ktpPath = path.join('uploads', `ktp_${Date.now()}.png`);
    
    fs.writeFileSync(ktpPath, Buffer.from(ktpData, 'base64'));
    console.log('KTP image saved:', ktpPath);
  }
  
  // Simpan tanda tangan pelanggan
  if (req.body.signature) {
    const signatureData = req.body.signature.replace(/^data:image\/png;base64,/, '');
    const signaturePath = path.join('uploads', `signature_${Date.now()}.png`);
    
    fs.writeFileSync(signaturePath, Buffer.from(signatureData, 'base64'));
    console.log('Signature saved:', signaturePath);
  }
  
  if (req.file) {
    console.log('File uploaded:', req.file.path);
  }
  
  res.json({ success: true, message: 'Formulir berhasil disimpan' });
});

// Mulai server
app.listen(port, () => {
  console.log(`Server berjalan di http://localhost:${port}`);
});