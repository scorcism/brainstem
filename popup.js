let currentFilter = 'all';
let allBrainstem = [];

// Load brainstems when popup opens
document.addEventListener('DOMContentLoaded', () => {
  loadBrainstem();
  setupEventListeners();
});

// Setup event listeners
function setupEventListeners() {
  // Filter tabs
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      currentFilter = btn.dataset.filter;
      updateActiveTab(btn);
      renderBrainstem();
    });
  });

  // Clear all button
  document.getElementById('clearAllBtn').addEventListener('click', clearAllBrainstem);
}

// Update active tab
function updateActiveTab(activeBtn) {
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.classList.remove('active');
  });
  activeBtn.classList.add('active');
}

// Load brainstems from storage
function loadBrainstem() {
  chrome.storage.local.get(['savedBrainstem'], (result) => {
    allBrainstem = result.savedBrainstem || [];
    renderBrainstem();
  });
}

// Render brainstems based on current filter
function renderBrainstem() {
  const brainstemsList = document.getElementById('brainstemsList');
  const emptyState = document.getElementById('emptyState');
  const clearAllBtn = document.getElementById('clearAllBtn');
  const countBadge = document.getElementById('countBadge');

  // Filter brainstems
  let filteredBrainstem = allBrainstem;
  if (currentFilter === 'links') {
    filteredBrainstem = allBrainstem.filter(note => note.type === 'link');
  } else if (currentFilter === 'text') {
    filteredBrainstem = allBrainstem.filter(note => note.type === 'text');
  }

  // Update count badge
  const count = allBrainstem.length;
  countBadge.textContent = `${count} ${count === 1 ? 'note' : 'brainstems'}`;

  // Show/hide empty state
  if (filteredBrainstem.length === 0) {
    emptyState.style.display = 'block';
    brainstemsList.style.display = 'none';
    clearAllBtn.style.display = 'none';
  } else {
    emptyState.style.display = 'none';
    brainstemsList.style.display = 'flex';
    clearAllBtn.style.display = allBrainstem.length > 0 ? 'block' : 'none';
  }

  // Render note cards
  brainstemsList.innerHTML = filteredBrainstem.map(note => createNoteCard(note)).join('');

  // Add event listeners to action buttons
  document.querySelectorAll('.copy-btn').forEach(btn => {
    btn.addEventListener('click', () => copyToClipboard(btn));
  });

  document.querySelectorAll('.delete-btn').forEach(btn => {
    btn.addEventListener('click', () => deleteNote(btn.dataset.id));
  });
}

// Create note card HTML
function createNoteCard(note) {
  const iconType = note.type === 'link' ? 'link' : 'text';
  const icon = note.type === 'link' 
    ? '<path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line>'
    : '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline>';

  const contentHTML = note.type === 'link'
    ? `<a href="${escapeHtml(note.content)}" target="_blank" rel="noopener noreferrer">${escapeHtml(note.content)}</a>`
    : `<span style="font-weight: 500;">${escapeHtml(note.content)}</span>`;

  const urlHTML = note.url && note.type === 'text'
    ? `<a href="${escapeHtml(note.url)}" target="_blank" rel="noopener noreferrer" class="note-url">${escapeHtml(note.url)}</a>`
    : '';

  const timestamp = new Date(note.timestamp).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  return `
    <div class="note-card">
      <div class="note-card-content">
        <div class="note-icon ${iconType}">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            ${icon}
          </svg>
        </div>
        <div class="note-body">
          <div class="note-text">
            ${contentHTML}
          </div>
          ${urlHTML}
          <div class="note-timestamp">${timestamp}</div>
        </div>
        <div class="note-actions">
          <button class="action-btn copy-btn" data-content="${escapeHtml(note.content)}" data-id="${note.id}" title="Copy">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
              <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
            </svg>
          </button>
          <button class="action-btn delete-btn" data-id="${note.id}" title="Delete">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="3 6 5 6 21 6"></polyline>
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
            </svg>
          </button>
        </div>
      </div>
    </div>
  `;
}

// Copy to clipboard
function copyToClipboard(btn) {
  const content = btn.dataset.content;
  navigator.clipboard.writeText(content).then(() => {
    btn.classList.add('copied');
    btn.innerHTML = `
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <polyline points="20 6 9 17 4 12"></polyline>
      </svg>
    `;
    setTimeout(() => {
      btn.classList.remove('copied');
      btn.innerHTML = `
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
          <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
        </svg>
      `;
    }, 2000);
  });
}

// Delete a note
function deleteNote(id) {
  allBrainstem = allBrainstem.filter(note => note.id !== id);
  chrome.storage.local.set({ savedBrainstem: allBrainstem }, () => {
    renderBrainstem();
  });
}

// Clear all brainstems
function clearAllBrainstem() {
  if (confirm('Are you sure you want to delete all brainstems?')) {
    allBrainstem = [];
    chrome.storage.local.set({ savedBrainstem: [] }, () => {
      renderBrainstem();
    });
  }
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}