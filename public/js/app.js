document.addEventListener('DOMContentLoaded', function () {
  const tombolGenerate = document.querySelectorAll('[data-generate]');
  tombolGenerate.forEach(btn => {
    btn.addEventListener('click', () => {
      const babId = btn.dataset.generate;
      generate(babId);
    });
  });
});

function generate(babId) {
  const topic = document.getElementById('topik').value.trim();
  const rumusan = document.getElementById('rumusan').value.trim();
  const output = document.getElementById(`output-${babId}`);

  if (!topic || !rumusan) {
    alert("🚫 Harap isi Topik dan Rumusan Masalah terlebih dahulu.");
    return;
  }

  output.innerHTML = `<em>⏳ Memproses ${babId.toUpperCase()}...</em>`;

  // Contoh respons dummy, tinggal ganti ke fetch ke API nanti
  setTimeout(() => {
    output.innerHTML = `
      📌 <strong>Draf ${babId.toUpperCase()}</strong><br/>
      <strong>Topik:</strong> ${topic}<br/>
      <strong>Rumusan Masalah:</strong><br/>${rumusan}<br/><br/>
      📄 <em>(Konten lengkap Bab akan dimuat di sini...)</em>
    `;
  }, 1200);
}
