// Tambahkan middleware untuk CORS
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

// Tambahkan middleware proxy dengan konfigurasi yang lebih baik
app.use('/api/subscription', createProxyMiddleware({
  target: 'http://10.80.253.78:6868',
  changeOrigin: true,
  secure: false,
  pathRewrite: {
    '^/api/subscription': '/api/subscription'
  },
  onProxyReq: (proxyReq, req, res) => {
    // Log request untuk debugging
    console.log('Proxying request to:', req.url);
    
    // Jika ada body, pastikan content-length diatur dengan benar
    if (req.body) {
      const bodyData = JSON.stringify(req.body);
      proxyReq.setHeader('Content-Type', 'application/json');
      proxyReq.setHeader('Content-Length', Buffer.byteLength(bodyData));
      proxyReq.write(bodyData);
    }
  },
  onProxyRes: (proxyRes, req, res) => {
    // Log response untuk debugging
    console.log('Received response from API:', proxyRes.statusCode);
  },
  onError: (err, req, res) => {
    console.error('Proxy error:', err);
    res.status(500).send('Proxy Error: ' + err.message);
  }
}));

// Endpoint khusus untuk upload KTP
app.post('/api/upload-ktp', (req, res) => {
  console.log('Menerima request upload KTP');
  
  // Gunakan proxy yang sudah dibuat dengan konfigurasi khusus
  const ktpProxy = createProxyMiddleware({
    target: 'http://10.80.253.78:6868',
    changeOrigin: true,
    pathRewrite: {
      '^/api/upload-ktp': '/api/subscription/retail/fkb/user'
    },
    onProxyReq: (proxyReq, req, res) => {
      console.log('Proxying KTP upload to API');
    },
    onProxyRes: (proxyRes, req, res) => {
      console.log('KTP upload response:', proxyRes.statusCode);
    },
    onError: (err, req, res) => {
      console.error('KTP upload error:', err);
      res.status(500).send('Error uploading KTP: ' + err.message);
    }
  });
  
  ktpProxy(req, res);
});

// Endpoint khusus untuk upload tanda tangan
app.post('/api/upload-signature/:task_id', (req, res) => {
  const taskId = req.params.task_id;
  console.log(`Menerima request upload tanda tangan untuk task_id: ${taskId}`);
  
  // Gunakan proxy yang sudah dibuat dengan konfigurasi khusus
  const signatureProxy = createProxyMiddleware({
    target: 'http://10.80.253.78:6868',
    changeOrigin: true,
    pathRewrite: (path, req) => {
      return `/api/subscription/signature/upload/${taskId}`;
    },
    onProxyReq: (proxyReq, req, res) => {
      console.log(`Proxying signature upload to API for task_id: ${taskId}`);
    },
    onProxyRes: (proxyRes, req, res) => {
      console.log('Signature upload response:', proxyRes.statusCode);
    },
    onError: (err, req, res) => {
      console.error('Signature upload error:', err);
      res.status(500).send('Error uploading signature: ' + err.message);
    }
  });
  
  signatureProxy(req, res);
});
app.post('/api/subscription/fkb/submit-form', (req, res) => {
  // Gunakan proxy yang sudah dibuat
  createProxyMiddleware({
    target: 'http://10.80.253.78:6868',
    changeOrigin: true,
    pathRewrite: {
      '^/api/subscription': '/api/subscription'
    }
  })(req, res);
});