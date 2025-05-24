// Inisialisasi PDF.js
pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.10.377/pdf.worker.min.js';

// URL PDF default (bisa diganti dengan URL PDF Anda)
const pdfUrl = '/assets/formulir-berlangganan.pdf';

// Fungsi untuk memuat dan menampilkan PDF
async function loadPdf(url) {
  try {
    const loadingTask = pdfjsLib.getDocument(url);
    const pdf = await loadingTask.promise;
    
    // Ambil halaman pertama
    const page = await pdf.getPage(1);
    
    // Siapkan canvas untuk rendering
    const canvas = document.getElementById('pdf-canvas');
    const context = canvas.getContext('2d');
    
    // Dapatkan ukuran viewport
    const viewport = page.getViewport({ scale: 1.0 });
    
    // Sesuaikan skala berdasarkan lebar container
    const container = document.querySelector('.pdf-container');
    const containerWidth = container.clientWidth - 20; // Kurangi padding
    const scale = containerWidth / viewport.width;
    
    // Buat viewport baru dengan skala yang disesuaikan
    const scaledViewport = page.getViewport({ scale: scale });
    
    // Sesuaikan ukuran canvas dengan ukuran PDF yang sudah diskala
    canvas.height = scaledViewport.height;
    canvas.width = scaledViewport.width;
    
    // Render PDF ke canvas
    const renderContext = {
      canvasContext: context,
      viewport: scaledViewport
    };
    
    await page.render(renderContext).promise;
    console.log('PDF berhasil dimuat');
  } catch (error) {
    console.error('Error saat memuat PDF:', error);
  }
}

// Fungsi untuk mengatur ulang ukuran PDF saat ukuran window berubah
function resizePdf() {
  loadPdf(pdfUrl);
}

// Muat PDF saat halaman dimuat
document.addEventListener('DOMContentLoaded', () => {
  loadPdf(pdfUrl);
  
  // Tambahkan event listener untuk resize window
  window.addEventListener('resize', resizePdf);
});