document.addEventListener('DOMContentLoaded', () => {
  // Tombol submit formulir
  document.getElementById('submit-form').addEventListener('click', async () => {
    try {
      // Periksa apakah TNC telah disetujui
      const agreeCheckbox = document.getElementById('agree-tnc');
      if (!agreeCheckbox.checked) {
        alert('Anda harus menyetujui Syarat dan Ketentuan terlebih dahulu');
        return;
      }
      
      // Periksa apakah KTP telah diunggah
      const ktpPreviewImage = document.getElementById('ktp-preview-image');
      const ktpUploadStatus = document.getElementById('ktp-upload-status');
      
      if (ktpUploadStatus.className !== 'success') {
        alert('Silakan unggah foto KTP Anda terlebih dahulu');
        return;
      }
      
      // Dapatkan gambar tanda tangan pelanggan
      const signatureImage = getSignatureImage();
      
      if (!signatureImage) {
        alert('Silakan tambahkan tanda tangan pelanggan terlebih dahulu');
        return;
      }
      
      // Siapkan data formulir
      const formData = new FormData();
      formData.append('signature', signatureImage);
      formData.append('ktp_image', ktpPreviewImage.src);
      formData.append('tnc_agreed', 'true');
      
      // Kirim data ke server
      const response = await fetch('/submit-form', {
        method: 'POST',
        body: formData
      });
      
      const result = await response.json();
      
      if (result.success) {
        alert('Formulir berhasil dikirim!');
      } else {
        alert('Terjadi kesalahan saat mengirim formulir: ' + result.message);
      }
    } catch (error) {
      console.error('Error saat mengirim formulir:', error);
      alert('Terjadi kesalahan saat mengirim formulir');
    }
  });
});