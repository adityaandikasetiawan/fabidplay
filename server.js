/**
 * API Proxy Server untuk Fab IDPlay
 * 
 * Server ini berfungsi sebagai proxy untuk menghubungkan frontend dengan
 * API IDMall. Mendukung fitur-fitur:
 * - Proxy API subscription
 * - Upload KTP
 * - Upload tanda tangan
 * - Submit form
 */

const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const { createProxyMiddleware } = require('http-proxy-middleware');

// Konfigurasi dasar
const API_TARGET = 'https://apiidmall.supercorridor.co.id/api';
const PORT = process.env.PORT || 3004;

// Body parser middleware untuk parsing JSON dan form data
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// CORS middleware
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  next();
});

// Tambahkan proxy untuk API
const { createProxyMiddleware } = require('http-proxy-middleware');

// Konfigurasi proxy paths
const PROXY_PATHS = {
  subscription: '/api/subscription',
  uploadKtp: '/api/upload-ktp',
  uploadSignature: '/api/upload-signature',
  submitForm: '/api/subscription/fkb/submit-form'
};

// Konfigurasi proxy target paths
const TARGET_PATHS = {
  subscription: '/api/subscription',
  uploadKtp: '/api/subscription/retail/fkb/user',
  uploadSignature: '/api/subscription/signature/upload',
  submitForm: '/api/subscription/fkb/submit-form'
};

// Fungsi helper untuk proxy request
const handleProxyRequest = (proxyReq, req, res) => {
  if (req.body) {
    const bodyData = JSON.stringify(req.body);
    proxyReq.setHeader('Content-Type', 'application/json');
    proxyReq.setHeader('Content-Length', Buffer.byteLength(bodyData));
    proxyReq.write(bodyData);
  }
};

// Proxy middleware untuk subscription
app.use(PROXY_PATHS.subscription, createProxyMiddleware({
  target: API_TARGET,
  changeOrigin: true,
  secure: false,
  onProxyReq: handleProxyRequest,
  onError: (err, req, res) => {
    console.error('Subscription Proxy Error:', err);
    res.status(500).send('Proxy Error: ' + err.message);
  }
}));

// Endpoint untuk upload KTP
app.post(PROXY_PATHS.uploadKtp, createProxyMiddleware({
  target: API_TARGET,
  changeOrigin: true,
  pathRewrite: {
    ['^' + PROXY_PATHS.uploadKtp]: TARGET_PATHS.uploadKtp
  },
  onProxyReq: handleProxyRequest,
  onError: (err, req, res) => {
    console.error('KTP Upload Error:', err);
    res.status(500).send('Error uploading KTP: ' + err.message);
  }
}));

// Endpoint untuk upload tanda tangan
app.post(PROXY_PATHS.uploadSignature + '/:task_id', createProxyMiddleware({
  target: API_TARGET,
  changeOrigin: true,
  pathRewrite: (path, req) => {
    const taskId = req.params.task_id;
    return `${TARGET_PATHS.uploadSignature}/${taskId}`;
  },
  onProxyReq: handleProxyRequest,
  onError: (err, req, res) => {
    console.error('Signature Upload Error:', err);
    res.status(500).send('Error uploading signature: ' + err.message);
  }
}));

// Endpoint untuk submit form
app.post(PROXY_PATHS.submitForm, createProxyMiddleware({
  target: API_TARGET,
  changeOrigin: true,
  onProxyReq: handleProxyRequest,
  onError: (err, req, res) => {
    console.error('Submit Form Error:', err);
    res.status(500).send('Error submitting form: ' + err.message);
  }
}));

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Global Error Handler:', err);
  res.status(500).json({
    error: 'Internal Server Error',
    message: err.message
  });
});

// Unhandled rejection handler
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise);
  console.error('Reason:', reason);
});

// Uncaught exception handler
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  // Keluar dengan status error
  process.exit(1);
});

// Jalankan server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}).on('error', (err) => {
  console.error('Server failed to start:', err);
});