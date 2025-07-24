// 🌙 Mode sombre
const toggleThemeBtn = document.getElementById('toggleTheme');
toggleThemeBtn.addEventListener('click', () => {
  document.body.classList.toggle('dark-mode');
  toggleThemeBtn.textContent = document.body.classList.contains('dark-mode')
    ? '☀️ Mode clair'
    : '🌙 Mode sombre';
});

// 📦 Utils LocalStorage
function getCodes() {
  return JSON.parse(localStorage.getItem('codes') || '[]');
}
function saveCodes(codes) {
  localStorage.setItem('codes', JSON.stringify(codes));
}

// 📄 Pagination
let currentPage = 1;
const itemsPerPage = 6; // ✅ 6 lignes par page
let currentFilter = '';

// 🖼 Affichage des codes + pagination
function renderCodes() {
  const codesList = document.getElementById('codesList');
  codesList.innerHTML = '';
  let codes = getCodes();

  // Filtrer si recherche
  if (currentFilter.trim() !== '') {
    const f = currentFilter.trim().toLowerCase();
    codes = codes.filter(c =>
      c.codeChimique.toLowerCase().includes(f) ||
      c.codeCommercial.toLowerCase().includes(f)
    );
  }

  codes = codes.slice().reverse(); // dernier ajouté en premier

  const totalPages = Math.ceil(codes.length / itemsPerPage);
  if (currentPage > totalPages) currentPage = totalPages || 1;

  const start = (currentPage - 1) * itemsPerPage;
  const pageItems = codes.slice(start, start + itemsPerPage);

  pageItems.forEach((code, i) => {
    const realIndex = getCodes().length - 1 - (start + i);
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${code.codeChimique}</td>
      <td>${code.codeCommercial}</td>
      <td>${code.createdAt}</td>
      <td>${code.updatedAt || '--'}</td>
      <td class="actions">
        <button class="edit" data-index="${realIndex}">Modifier</button>
        <button class="delete" data-index="${realIndex}">Supprimer</button>
      </td>
    `;
    codesList.appendChild(tr);
  });

  renderPagination(totalPages);
}

// 📌 Pagination boutons
function renderPagination(totalPages) {
  let container = document.querySelector('.pagination');
  if (!container) {
    container = document.createElement('div');
    container.className = 'pagination';
    document.querySelector('.container').appendChild(container);
  }
  container.innerHTML = '';

  if (totalPages > 1) {
    const prevBtn = document.createElement('button');
    prevBtn.textContent = '←';
    prevBtn.disabled = currentPage === 1;
    prevBtn.onclick = () => { currentPage--; renderCodes(); };
    container.appendChild(prevBtn);

    const info = document.createElement('span');
    info.className = 'page-info';
    info.textContent = `Page ${currentPage} / ${totalPages}`;
    container.appendChild(info);

    const nextBtn = document.createElement('button');
    nextBtn.textContent = '→';
    nextBtn.disabled = currentPage === totalPages;
    nextBtn.onclick = () => { currentPage++; renderCodes(); };
    container.appendChild(nextBtn);
  }
}

// ➕ Ajouter
document.getElementById('addCodeForm').addEventListener('submit', e => {
  e.preventDefault();
  const codeChimique = document.getElementById('codeChimique').value.trim();
  const codeCommercial = document.getElementById('codeCommercial').value.trim();
  if (!codeChimique || !codeCommercial) return;

  const codes = getCodes();
  const now = new Date().toLocaleString();
  codes.push({ codeChimique, codeCommercial, createdAt: now, updatedAt: now });
  saveCodes(codes);
  currentPage = 1; // pour voir le nouveau
  renderCodes();
  e.target.reset();
});

// ✏️ Modifier
let editingIndex = null;
const editModal = document.getElementById('editModal');
const editCodeForm = document.getElementById('editCodeForm');
const editCodeChimique = document.getElementById('editCodeChimique');
const editCodeCommercial = document.getElementById('editCodeCommercial');

document.getElementById('codesList').addEventListener('click', e => {
  if (e.target.classList.contains('edit')) {
    editingIndex = e.target.dataset.index;
    const code = getCodes()[editingIndex];
    editCodeChimique.value = code.codeChimique;
    editCodeCommercial.value = code.codeCommercial;
    editModal.classList.remove('hidden');
  }
});

// ✅ Sauvegarder modif
editCodeForm.addEventListener('submit', e => {
  e.preventDefault();
  const codes = getCodes();
  codes[editingIndex].codeChimique = editCodeChimique.value.trim();
  codes[editingIndex].codeCommercial = editCodeCommercial.value.trim();
  codes[editingIndex].updatedAt = new Date().toLocaleString();
  saveCodes(codes);
  editModal.classList.add('hidden');
  renderCodes();
});

// ❌ Annuler modif
document.getElementById('cancelEdit').addEventListener('click', () => {
  editModal.classList.add('hidden');
});

// 🗑 Supprimer
let deletingIndex = null;
const confirmDeleteModal = document.getElementById('confirmDeleteModal');

document.getElementById('codesList').addEventListener('click', e => {
  if (e.target.classList.contains('delete')) {
    deletingIndex = e.target.dataset.index;
    confirmDeleteModal.classList.remove('hidden');
  }
});
document.getElementById('confirmDeleteBtn').addEventListener('click', () => {
  const codes = getCodes();
  codes.splice(deletingIndex, 1);
  saveCodes(codes);
  confirmDeleteModal.classList.add('hidden');
  renderCodes();
});
document.getElementById('cancelDeleteBtn').addEventListener('click', () => {
  confirmDeleteModal.classList.add('hidden');
});

// 🔍 Recherche
document.getElementById('searchInput').addEventListener('input', e => {
  currentFilter = e.target.value;
  currentPage = 1;
  renderCodes();
});

// ✅ Charger au démarrage
renderCodes();
