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
const itemsPerPage = 9;
let currentFilter = '';

// 🖼 Affichage des codes + pagination
function renderCodes() {
  const codesList = document.getElementById('codesList');
  codesList.innerHTML = '';
  let codes = getCodes();

  if (currentFilter.trim() !== '') {
    const f = currentFilter.trim().toLowerCase();
    codes = codes.filter(c =>
      c.codeChimique.toLowerCase().includes(f) ||
      c.codeCommercial.toLowerCase().includes(f)
    );
  }

  codes = codes.slice().reverse();

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

// 📌 Pagination
function renderPagination(totalPages) {
  let container = document.querySelector('.pagination');
  if (!container) {
    container = document.createElement('div');
    container.className = 'pagination';
    document.querySelector('.content').appendChild(container);
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
  const codeChimiqueInput = document.getElementById('codeChimique');
  const codeCommercialInput = document.getElementById('codeCommercial');
  const codeChimique = codeChimiqueInput.value.trim();
  const codeCommercial = codeCommercialInput.value.trim();
  if (!codeChimique || !codeCommercial) return;

  const codes = getCodes();
  const now = new Date().toLocaleString();
  codes.push({ codeChimique, codeCommercial, createdAt: now, updatedAt: now });
  saveCodes(codes);
  currentPage = 1;
  renderCodes();

  codeChimiqueInput.value = '';
  codeCommercialInput.value = '';
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

// 📥 Import (avec modal custom)
let importedData = null;
const importChoiceModal = document.getElementById('importChoiceModal');
document.getElementById('importBtn').addEventListener('click', () => {
  document.getElementById('importFile').click();
});
document.getElementById('importFile').addEventListener('change', e => {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = event => {
    try {
      importedData = JSON.parse(event.target.result);
      if (!Array.isArray(importedData)) {
        alert('Fichier invalide (il faut un tableau).'); return;
      }
      if (!importedData.every(c => 'codeChimique' in c && 'codeCommercial' in c)) {
        alert('Chaque objet doit contenir "codeChimique" et "codeCommercial".'); return;
      }
      importChoiceModal.classList.remove('hidden');
    } catch (err) {
      alert('Erreur lors de la lecture du fichier JSON.');
    }
  };
  reader.readAsText(file);
});
document.getElementById('replaceImportBtn').addEventListener('click', () => {
  saveCodes(importedData);
  importChoiceModal.classList.add('hidden');
  renderCodes();
});
document.getElementById('addImportBtn').addEventListener('click', () => {
  const merged = getCodes().concat(importedData);
  saveCodes(merged);
  importChoiceModal.classList.add('hidden');
  renderCodes();
});
document.getElementById('cancelImportBtn').addEventListener('click', () => {
  importChoiceModal.classList.add('hidden');
});

// 📤 Export
document.getElementById('exportBtn').addEventListener('click', () => {
  const data = JSON.stringify(getCodes(), null, 2);
  const blob = new Blob([data], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'codes.json';
  a.click();
  URL.revokeObjectURL(url);
});

// ✅ Charger au démarrage
renderCodes();
