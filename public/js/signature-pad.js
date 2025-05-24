// Inisialisasi canvas tanda tangan menggunakan Fabric.js
let signatureCanvas;

document.addEventListener('DOMContentLoaded', () => {
  // Inisialisasi canvas tanda tangan
  signatureCanvas = new fabric.Canvas('signature-canvas');
  signatureCanvas.isDrawingMode = true;
  signatureCanvas.freeDrawingBrush.width = 3; // Perbesar ukuran brush
  signatureCanvas.freeDrawingBrush.color = '#000000';
  
  // Sesuaikan ukuran canvas dengan container
  resizeCanvas();
  
  // Tombol untuk menghapus tanda tangan
  document.getElementById('clear-signature').addEventListener('click', () => {
    signatureCanvas.clear();
  });
  
  // Tambahkan event listener untuk resize window
  window.addEventListener('resize', resizeCanvas);
});

// Fungsi untuk menyesuaikan ukuran canvas
function resizeCanvas() {
  const container = document.querySelector('.signature-canvas-container');
  if (!container) return;
  
  const containerWidth = container.clientWidth;
  const containerHeight = container.clientHeight;
  
  const canvas = document.getElementById('signature-canvas');
  
  // Sesuaikan ukuran canvas dengan container
  canvas.width = containerWidth;
  canvas.height = containerHeight;
  
  if (signatureCanvas) {
    signatureCanvas.setWidth(containerWidth);
    signatureCanvas.setHeight(containerHeight);
    signatureCanvas.renderAll();
  }
}

// Fungsi untuk mendapatkan tanda tangan sebagai data URL
function getSignatureImage() {
  if (signatureCanvas.isEmpty()) {
    return null;
  }
  return signatureCanvas.toDataURL('image/png');
}