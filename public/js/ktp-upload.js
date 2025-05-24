document.addEventListener('DOMContentLoaded', () => {
  const ktpUpload = document.getElementById('ktp-upload');
  const ktpPreviewImage = document.getElementById('ktp-preview-image');
  const ktpUploadStatus = document.getElementById('ktp-upload-status');
  
  // Fungsi untuk menampilkan preview KTP
  ktpUpload.addEventListener('change', (event) => {
    const file = event.target.files[0];
    
    if (!file) return;
    
    // Validasi ukuran file (maksimal 5MB)
    if (file.size > 5 * 1024 * 1024) {
      ktpUploadStatus.textContent = 'Ukuran file terlalu besar (maksimal 5MB)';
      ktpUploadStatus.className = 'error';
      return;
    }
    
    // Validasi tipe file
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png'];
    if (!validTypes.includes(file.type)) {
      ktpUploadStatus.textContent = 'Format file tidak didukung (hanya JPG, PNG, JPEG)';
      ktpUploadStatus.className = 'error';
      return;
    }
    
    // Tampilkan preview
    const reader = new FileReader();
    reader.onload = (e) => {
      ktpPreviewImage.src = e.target.result;
      ktpUploadStatus.textContent = 'KTP berhasil diunggah';
      ktpUploadStatus.className = 'success';
      
      // Aktifkan tombol submit jika TNC juga sudah disetujui
      updateSubmitButton();
    };
    reader.readAsDataURL(file);
  });
  
  // Fungsi untuk mengupdate status tombol submit
  function updateSubmitButton() {
    const submitButton = document.getElementById('submit-form');
    const agreeCheckbox = document.getElementById('agree-tnc');
    const ktpUploaded = ktpUploadStatus.className === 'success';
    
    submitButton.disabled = !(agreeCheckbox.checked && ktpUploaded);
  }
  
  // Tambahkan event listener untuk checkbox TNC
  document.getElementById('agree-tnc').addEventListener('change', updateSubmitButton);
});