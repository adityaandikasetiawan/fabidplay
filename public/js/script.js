// Variabel global
let hasScrolledToBottom = false;
let agreeCheckbox = null;
let tncNotice = null;
let ktpImageData = null;
let signatureImageData = null;
let signaturePad = null;

// Fungsi untuk memeriksa scroll
function checkScrollToBottom() {
  const tncContainer = document.querySelector('.scrollable-tnc');
  if (tncContainer) {
    tncContainer.addEventListener('scroll', function() {
      if (this.scrollTop + this.clientHeight >= this.scrollHeight - 20) {
        hasScrolledToBottom = true;
        if (agreeCheckbox) {
          agreeCheckbox.disabled = false;
          tncNotice.textContent = "Terima kasih telah membaca syarat dan ketentuan.";
          tncNotice.style.color = "green";
        }
      }
    });
  }
}

// Fungsi untuk validasi form
function validateForm() {
  if (!hasScrolledToBottom) {
    alert('Mohon baca seluruh Syarat dan Ketentuan dengan menggulir sampai bawah.');
    return false;
  }
  
  if (!agreeCheckbox.checked) {
    alert('Anda harus menyetujui Syarat dan Ketentuan untuk melanjutkan.');
    return false;
  }
  
  return true;
}

// Fungsi untuk upload KTP
function uploadKTP(fileData) {
  return new Promise((resolve, reject) => {
    try {
      const formData = new FormData();
      formData.append('ktp', fileData); // Ubah 'file' menjadi 'ktp'
      
      // Ambil task_id dari URL
      const urlParams = new URLSearchParams(window.location.search);
      const taskId = urlParams.get('task_id') || '16003265';
      formData.append('task_id', taskId);

      // Tambahkan user_id jika tidak ada token
      const userId = 'customer@gmail.com'; // Sesuaikan dengan cara Anda mendapatkan user_id
      formData.append('user_id', userId);
      
      console.log('Mencoba upload KTP...', {
        fileName: fileData.name,
        fileSize: fileData.size,
        fileType: fileData.type,
        taskId: taskId,
        userId: userId
      });
      
      // Gunakan endpoint yang benar dengan HTTPS
      fetch('https://apiidmall.supercorridor.co.id/api/subscription/retail/fkb/user', {
        method: 'POST',
        body: formData
      })
      .then(response => {
        console.log('Response status:', response.status);
        if (!response.ok) {
          throw new Error('Gagal mengunggah KTP. Status: ' + response.status);
        }
        return response.json();
      })
      .then(data => {
        console.log('Upload berhasil:', data);
        resolve(data);
      })
      .catch(error => {
        console.error('Error detail:', error);
        reject(error);
      });
    } catch (error) {
      console.error('Error dalam try-catch:', error);
      reject(error);
    }
  });
}

// Fungsi untuk upload tanda tangan
// Fungsi untuk upload tanda tangan
function uploadSignature(imageData, taskId) {
  return new Promise((resolve, reject) => {
    try {
      const formData = new FormData();
      formData.append('signature', imageData); // Ubah 'file' menjadi 'signature'
      formData.append('type', 'AUTOGRAPH'); // Tambahkan type AUTOGRAPH
      
      // Tambahkan user_id jika tidak ada token
      const userId = 'customer@gmail.com';
      formData.append('user_id', userId);
      
      console.log('Mencoba upload tanda tangan...', {
        taskId: taskId,
        userId: userId,
        type: 'AUTOGRAPH'
      });
      
      // Gunakan endpoint yang benar dengan HTTPS
      fetch(`https://apiidmall.supercorridor.co.id/api/subscription/signature/upload/${taskId}`, {
        method: 'POST',
        body: formData
      })
      .then(response => {
        if (!response.ok) {
          throw new Error('Gagal mengunggah tanda tangan. Status: ' + response.status);
        }
        return response.json();
      })
      .then(data => resolve(data))
      .catch(error => reject(error));
    } catch (error) {
      reject(error);
    }
  });
}

// Event listener utama
document.addEventListener('DOMContentLoaded', function() {
  // Inisialisasi elemen
  agreeCheckbox = document.getElementById('agree-tnc');
  tncNotice = document.querySelector('.tnc-notice p');
  
  // Nonaktifkan checkbox
  if (agreeCheckbox) {
    agreeCheckbox.disabled = true;
  }
  
  // Inisialisasi scroll
  checkScrollToBottom();
  
  // Event listener untuk form
  const form = document.getElementById('subscription-form');
  if (form) {
    form.addEventListener('submit', function(event) {
      if (!validateForm()) {
        event.preventDefault();
      }
    });
  }

  // Inisialisasi upload KTP
  const ktpUpload = document.getElementById('ktp-upload');
  const ktpPreviewImage = document.getElementById('ktp-preview-image');
  const ktpUploadStatus = document.getElementById('ktp-upload-status');
  
  if (ktpUpload && ktpPreviewImage && ktpUploadStatus) {
    ktpUpload.addEventListener('change', function(e) {
      const file = e.target.files[0];
      ktpUploadStatus.textContent = '';
      ktpUploadStatus.className = '';
      
      if (file) {
        const validTypes = ['image/jpeg', 'image/jpg', 'image/png'];
        if (!validTypes.includes(file.type)) {
          ktpUploadStatus.textContent = 'Error: Format file tidak didukung. Gunakan JPG, PNG, atau JPEG.';
          ktpUploadStatus.className = 'error';
          return;
        }
        
        const maxSize = 5 * 1024 * 1024;
        if (file.size > maxSize) {
          ktpUploadStatus.textContent = 'Error: Ukuran file terlalu besar. Maksimal 5MB.';
          ktpUploadStatus.className = 'error';
          return;
        }
        
        const reader = new FileReader();
        reader.onload = function(event) {
          ktpPreviewImage.src = event.target.result;
          ktpImageData = file; // File object langsung disimpan
          ktpUploadStatus.textContent = 'KTP berhasil diunggah!';
          ktpUploadStatus.className = 'success';
        };
        reader.readAsDataURL(file);
      }
    });
  }

  // Inisialisasi tanda tangan
  const canvas = document.getElementById('signature-pad');
  const signatureStatus = document.getElementById('signature-status');
  
  if (canvas) {
    signaturePad = new fabric.Canvas('signature-pad', {
      isDrawingMode: true,
      backgroundColor: '#ffffff'
    });
    
    signaturePad.freeDrawingBrush.width = 2;
    signaturePad.freeDrawingBrush.color = '#000000';
    
    const clearButton = document.getElementById('clear-signature');
    if (clearButton) {
      clearButton.addEventListener('click', function() {
        signaturePad.clear();
        signatureImageData = null;
        if (signatureStatus) {
          signatureStatus.textContent = 'Tanda tangan dihapus.';
          signatureStatus.className = '';
        }
      });
    }
    
    const saveButton = document.getElementById('save-signature');
    if (saveButton) {
      saveButton.addEventListener('click', function() {
        if (!signaturePad || signaturePad.isEmpty()) {
          if (signatureStatus) {
            signatureStatus.textContent = 'Error: Silakan tanda tangan terlebih dahulu.';
            signatureStatus.className = 'error';
          }
          return;
        }
        
        try {
          // Ubah ini untuk mendapatkan base64 string yang benar
          const canvas = document.getElementById('signature-pad');
          signatureImageData = canvas.toDataURL('image/png').split(',')[1];
          if (signatureStatus) {
            signatureStatus.textContent = 'Tanda tangan berhasil disimpan!';
            signatureStatus.className = 'success';
          }
        } catch (error) {
          console.error('Error saat menyimpan tanda tangan:', error);
          if (signatureStatus) {
            signatureStatus.textContent = 'Error: Gagal menyimpan tanda tangan.';
            signatureStatus.className = 'error';
          }
        }
      });
    }
  }

  // Event listener untuk submit
  const submitButton = document.getElementById('submit-form');
  const formSubmitStatus = document.getElementById('form-submit-status');
  
  if (submitButton) {
    submitButton.addEventListener('click', function() {
      // Tambahkan validasi checkbox di sini
      if (!validateForm()) {
        if (formSubmitStatus) {
          formSubmitStatus.textContent = 'Error: Mohon baca dan setujui Syarat dan Ketentuan terlebih dahulu.';
          formSubmitStatus.className = 'error';
        }
        return;
      }
  
      if (!ktpImageData) {
        if (formSubmitStatus) {
          formSubmitStatus.textContent = 'Error: Silakan upload foto KTP terlebih dahulu.';
          formSubmitStatus.className = 'error';
        }
        return;
      }
      
      if (!signatureImageData) {
        if (formSubmitStatus) {
          formSubmitStatus.textContent = 'Error: Silakan tanda tangan terlebih dahulu.';
          formSubmitStatus.className = 'error';
        }
        return;
      }
      
      const urlParams = new URLSearchParams(window.location.search);
      const taskId = urlParams.get('task_id') || '16003265';
      
      if (formSubmitStatus) {
        formSubmitStatus.textContent = 'Mengirim formulir...';
        formSubmitStatus.className = '';
      }
      
      uploadKTP(ktpImageData)
        .then(ktpResponse => {
          console.log('KTP berhasil diunggah:', ktpResponse);
          return uploadSignature(signatureImageData, taskId);
        })
        .then(signatureResponse => {
          console.log('Tanda tangan berhasil diunggah:', signatureResponse);
          
          if (formSubmitStatus) {
            formSubmitStatus.textContent = 'Formulir berhasil dikirim!';
            formSubmitStatus.className = 'success';
          }
          
          ktpImageData = null;
          signatureImageData = null;
          
          if (ktpPreviewImage) {
            ktpPreviewImage.src = '/assets/images/ktp-placeholder.png';
          }
          if (signaturePad) {
            signaturePad.clear();
          }
          
          // Redirect ke halaman thank you setelah delay singkat
          setTimeout(() => {
            window.location.href = '/thankyou';
          }, 1000);
        })
        .catch(error => {
          console.error('Error:', error);
          if (formSubmitStatus) {
            formSubmitStatus.textContent = 'Error: ' + error.message;
            formSubmitStatus.className = 'error';
          }
        });
    });
  }

  // Fungsi untuk memuat dokumen formulir dari API
  function loadFormDocument() {
    // Ambil CID dari parameter URL
    const urlParams = new URLSearchParams(window.location.search);
    const taskId = urlParams.get('cid'); // Parameter 'cid' dari URL
    
    // Jika CID tidak ada di URL, tampilkan pesan error
    if (!taskId) {
      const pdfCanvasContainer = document.querySelector('.pdf-canvas-container');
      if (pdfCanvasContainer) {
        pdfCanvasContainer.innerHTML = '<div class="error-message">Error: CID tidak ditemukan dalam URL</div>';
      }
      return;
    }
    
    const apiUrl = `https://apiidmall.supercorridor.co.id/api/subscription/fab/generate/${taskId}?cust_sign=blank`;
    const pdfCanvasContainer = document.querySelector('.pdf-canvas-container');
    
    if (!pdfCanvasContainer) {
      console.error('Error: Container PDF tidak ditemukan');
      return;
    }
    
    pdfCanvasContainer.innerHTML = '<div class="loading-indicator"><i class="fas fa-spinner fa-spin"></i> Memuat dokumen formulir...</div>';
    
    // Gunakan iframe dengan src langsung ke API URL
    console.log('Loading PDF from API URL:', apiUrl);
    
    // Bersihkan container
    pdfCanvasContainer.innerHTML = '';
    
    // Gunakan fetch untuk mengambil PDF sebagai blob dan tampilkan dengan object tag
    console.log('Fetching PDF from API URL:', apiUrl);
    
    fetch(apiUrl, {
      method: 'GET',
      headers: {
        'Accept': 'application/pdf'
      }
    })
    .then(response => {
      if (!response.ok) {
        throw new Error('Network response was not ok: ' + response.status);
      }
      return response.blob();
    })
    .then(blob => {
      console.log('PDF blob received:', blob.size, 'bytes');
      
      // Buat object URL dari blob
      const url = URL.createObjectURL(blob);
      
      // Buat object tag untuk menampilkan PDF
      const obj = document.createElement('object');
      obj.data = url;
      obj.type = 'application/pdf';
      obj.style.width = '100%';
      obj.style.height = '800px';
      obj.style.display = 'block';
      
      // Tambahkan object tag ke container
      pdfCanvasContainer.appendChild(obj);
      
      console.log('PDF object added to container with blob URL:', url);
      
      // Bersihkan object URL saat object tag dimuat
      obj.onload = function() {
        console.log('PDF object loaded successfully');
      };
      
      // Tangani error
      obj.onerror = function(error) {
        console.error('Object error:', error);
        pdfCanvasContainer.innerHTML = '<div class="error-message">Error: Gagal menampilkan PDF. Lihat console untuk detail.</div>';
      };
    })
    .catch(error => {
      console.error('Error fetching PDF:', error);
      pdfCanvasContainer.innerHTML = `<div class="error-message">Gagal mengambil PDF: ${error.message}</div>`;
    });
    
    console.log('PDF fetch initiated');
    
    // Tidak perlu event listener untuk iframe karena kita menggunakan object tag
  }
  
  // Fungsi untuk menampilkan PDF
  function displayPDF(pdfUrl, container) {
    // Pastikan PDF.js sudah dimuat
    if (typeof pdfjsLib === 'undefined') {
      console.error('Error: PDF.js tidak ditemukan');
      container.innerHTML = '<div class="error-message"><i class="fas fa-exclamation-circle"></i> PDF.js tidak tersedia</div>';
      return;
    }
    
    // Bersihkan container
    container.innerHTML = '';
    
    // Buat canvas untuk PDF
    const canvas = document.createElement('canvas');
    canvas.id = 'pdf-canvas';
    container.appendChild(canvas);
    
    // Inisialisasi PDF.js
    pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.10.377/pdf.worker.min.js';
    
    // Muat dan tampilkan PDF
    pdfjsLib.getDocument(pdfUrl).promise
      .then(pdf => {
        // Ambil halaman pertama
        return pdf.getPage(1);
      })
      .then(page => {
        const canvas = document.getElementById('pdf-canvas');
        const context = canvas.getContext('2d');
        
        // Sesuaikan ukuran canvas dengan ukuran PDF
        const viewport = page.getViewport({ scale: 1.5 });
        canvas.height = viewport.height;
        canvas.width = viewport.width;
        
        // Render PDF ke canvas
        const renderContext = {
          canvasContext: context,
          viewport: viewport
        };
        
        return page.render(renderContext).promise;
      })
      .catch(error => {
        console.error('Error saat memuat PDF:', error);
        container.innerHTML = '<div class="error-message"><i class="fas fa-exclamation-circle"></i> Gagal memuat dokumen PDF</div>';
      });
  }
  
  // Panggil fungsi untuk memuat dokumen formulir jika ada container-nya
  if (document.querySelector('.pdf-canvas-container')) {
    loadFormDocument();
  }
});

// Fungsi untuk upload tanda tangan
function uploadSignature(imageData, taskId) {
  return new Promise((resolve, reject) => {
    try {
      const formData = new FormData();
      formData.append('signature', imageData); // Kirim base64 string langsung
      formData.append('type', 'AUTOGRAPH');
      formData.append('user_id', 'customer@gmail.com');
      
      console.log('Mencoba upload tanda tangan...', {
        taskId: taskId,
        signatureLength: imageData.length,
        type: 'AUTOGRAPH'
      });
      
      fetch(`https://apiidmall.supercorridor.co.id/api/subscription/signature/upload/${taskId}`, {
        method: 'POST',
        body: formData
      })
      .then(response => {
        console.log('Response status:', response.status);
        if (!response.ok) {
          throw new Error('Gagal mengunggah tanda tangan. Status: ' + response.status);
        }
        return response.json();
      })
      .then(data => {
        console.log('Upload berhasil:', data);
        resolve(data);
      })
      .catch(error => {
        console.error('Error detail:', error);
        reject(error);
      });
    } catch (error) {
      console.error('Error dalam try-catch:', error);
      reject(error);
    }
  });
}