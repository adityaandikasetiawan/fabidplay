document.addEventListener('DOMContentLoaded', () => {
  const agreeCheckbox = document.getElementById('agree-tnc');
  const submitButton = document.getElementById('submit-form');
  
  // Fungsi untuk mengaktifkan/menonaktifkan tombol submit berdasarkan checkbox
  function updateSubmitButton() {
    submitButton.disabled = !agreeCheckbox.checked;
  }
  
  // Tambahkan event listener untuk checkbox
  agreeCheckbox.addEventListener('change', updateSubmitButton);
  
  // Inisialisasi status tombol submit
  updateSubmitButton();
});