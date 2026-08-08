/**
 * Sikaku Finance - Budget Plan & Spending Tracker SPA
 * Pure Client-Side • Vanilla JS ES6+ • localStorage
 * Mobile-First | Light/Dark Theme | WhatsApp Export
 */

// ==================== STATE ====================
const STORAGE_KEY = 'sikaku_transactions_v1';
const THEME_KEY = 'sikaku_theme';
const QUICK_ITEMS_KEY = 'sikaku_quick_items_v1';

const DEFAULT_QUICK_ITEMS = [
  { id: 'qi1', name: 'Rokok Sukun Kretek',  amount: 12500, category: 'Snacking' },
  { id: 'qi2', name: 'Rokok Sukun Filter 16', amount: 26000, category: 'Snacking' },
  { id: 'qi3', name: 'BCA Tahapan',         amount: 15000, category: 'Subscriptions' },
  { id: 'qi4', name: 'BCA Xpresi',          amount: 10000, category: 'Subscriptions' },
  { id: 'qi5', name: 'Pulsa TRI',           amount: 60000, category: 'Subscriptions' },
  { id: 'qi6', name: 'Spotify',             amount: 60000, category: 'Subscriptions' },
  { id: 'qi7', name: 'Netflix',             amount: 65000, category: 'Subscriptions' },
  { id: 'qi8', name: 'YT Premium',          amount: 79000, category: 'Subscriptions' }
];

const CATEGORIES = {
  income: [
    'Gaji Utama',
    'Freelance / Side Job',
    'Investasi / Return',
    'Lainnya (Pemasukan)'
  ],
  expense: [
    { name: 'Essentials',   targetPct: 50, group: 'Needs' },
    { name: 'RDN Savings',  targetPct: 20, group: 'Needs' },
    { name: 'Business',     targetPct: 0,  group: 'Needs' },
    { name: 'Entertainment',targetPct: 13, group: 'Wants' },
    { name: 'Eating out',   targetPct: 10, group: 'Wants' },
    { name: 'Shopping',     targetPct: 5,  group: 'Wants' },
    { name: 'Snacking',     targetPct: 2,  group: 'Wants' },
    { name: 'Subscriptions',targetPct: 0,  group: 'Lainnya' },
    { name: 'Incidental',   targetPct: 0,  group: 'Lainnya' }
  ]
};

const CATEGORY_COLORS = {
  'Essentials': '#10b981',
  'RDN Savings': '#3b82f6',
  'Business': '#8b5cf6',
  'Entertainment': '#f59e0b',
  'Eating out': '#ef4444',
  'Shopping': '#ec4899',
  'Snacking': '#14b8a6',
  'Subscriptions': '#6366f1',
  'Incidental': '#64748b'
};

const SAMPLE_TRANSACTIONS = [
  { id: 'sx1', date: '2026-08-01', type: 'income',  category: 'Gaji Utama',          description: 'Gaji Bulanan Agustus',          amount: 15000000 },
  { id: 'sx2', date: '2026-08-02', type: 'expense', category: 'Essentials',           description: 'Belanja Bulanan Supermarket',    amount: 4500000  },
  { id: 'sx3', date: '2026-08-02', type: 'expense', category: 'RDN Savings',          description: 'Topup RDN Saham & Reksa Dana',   amount: 3000000  },
  { id: 'sx4', date: '2026-08-03', type: 'expense', category: 'Subscriptions',        description: 'YT Premium & Cloud',             amount: 79000    },
  { id: 'sx5', date: '2026-08-03', type: 'expense', category: 'Subscriptions',        description: 'BCA Tahapan Admin',              amount: 15000    },
  { id: 'sx6', date: '2026-08-04', type: 'expense', category: 'Eating out',           description: 'Makan Malam Restoran',           amount: 350000   },
  { id: 'sx7', date: '2026-08-04', type: 'expense', category: 'Entertainment',        description: 'Tiket Nonton Bioskop XX1',       amount: 120000   },
  { id: 'sx8', date: '2026-08-05', type: 'expense', category: 'Snacking',             description: 'Es Kopi Kekinian',               amount: 35000    },
  { id: 'sx9', date: '2026-08-05', type: 'income',  category: 'Freelance / Side Job', description: 'Project Web Frontend',           amount: 2500000  },
  { id: 'sx10',date: '2026-08-06', type: 'expense', category: 'Shopping',             description: 'Beli Pakaian & Sepatu',          amount: 650000   }
];

let transactions = [];
let quickItems = [];
let categoryChartInstance = null;
let currentWaPeriod = 'daily';

// ==================== INIT ====================
document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  loadTransactions();
  loadQuickItems();
  initDateInputs();
  populateMonthFilter();
  populateCategoryDropdown('expense');
  setupEventListeners();
  renderApp();
  renderQuickItemsGrid();
});

// ==================== THEME ====================
function initTheme() {
  const saved = localStorage.getItem(THEME_KEY);
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const toggleEl = document.getElementById('theme-toggle');

  // Default to light mode unless user saved dark preference
  if (saved === 'dark') {
    document.documentElement.classList.add('dark');
    if (toggleEl) toggleEl.checked = true;
    setMetaThemeColor('#0f172a');
  } else {
    document.documentElement.classList.remove('dark');
    if (toggleEl) toggleEl.checked = false;
    setMetaThemeColor('#ffffff');
  }
}

function setMetaThemeColor(color) {
  const meta = document.getElementById('meta-theme-color');
  if (meta) meta.setAttribute('content', color);
}

function toggleTheme() {
  const isDark = document.documentElement.classList.toggle('dark');
  localStorage.setItem(THEME_KEY, isDark ? 'dark' : 'light');
  setMetaThemeColor(isDark ? '#0f172a' : '#ffffff');
  // Redraw chart for new color context
  const filtered = getFilteredTransactions();
  renderCategoryChart(filtered);
}

// ==================== STORAGE ====================
function loadTransactions() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (raw) {
    try { transactions = JSON.parse(raw); }
    catch { transactions = [...SAMPLE_TRANSACTIONS]; }
  } else {
    transactions = [...SAMPLE_TRANSACTIONS];
    saveTransactions();
  }
}

function saveTransactions() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(transactions));
}

function loadQuickItems() {
  const raw = localStorage.getItem(QUICK_ITEMS_KEY);
  if (raw) {
    try { quickItems = JSON.parse(raw); }
    catch { quickItems = DEFAULT_QUICK_ITEMS.map(i => ({ ...i })); }
  } else {
    quickItems = DEFAULT_QUICK_ITEMS.map(i => ({ ...i }));
    saveQuickItems();
  }
}

function saveQuickItems() {
  localStorage.setItem(QUICK_ITEMS_KEY, JSON.stringify(quickItems));
}

// ==================== HELPERS ====================
function formatIDR(amount) {
  return 'Rp\u00A0' + Math.abs(Number(amount)).toLocaleString('id-ID');
}

function formatDateID(dateStr) {
  if (!dateStr) return '-';
  const [y, m, d] = dateStr.split('-');
  return `${d}/${m}/${y}`;
}

function getTodayString() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')}`;
}

function genId() {
  return 'tx_' + Date.now() + '_' + Math.random().toString(36).substr(2,6);
}

function escapeHTML(str) {
  if (!str) return '';
  return str.replace(/[&<>'"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c] || c));
}

function initDateInputs() {
  const el = document.getElementById('tx-date');
  if (el) el.value = getTodayString();
}

// ==================== TOAST ====================
function showToast(msg, type = 'success') {
  const container = document.getElementById('toast-container');
  if (!container) return;
  const t = document.createElement('div');
  const iconMap = { success: 'fa-circle-check', error: 'fa-circle-xmark', warning: 'fa-triangle-exclamation' };
  t.className = `toast-item toast-${type}`;
  t.innerHTML = `<i class="fa-solid ${iconMap[type] || iconMap.success}"></i> ${escapeHTML(msg)}`;
  container.appendChild(t);
  requestAnimationFrame(() => t.classList.add('show'));
  setTimeout(() => {
    t.classList.remove('show');
    setTimeout(() => t.remove(), 300);
  }, 3500);
}

// ==================== CUSTOM CONFIRM ====================
function showConfirm({ msg, sub, okLabel = 'Hapus', onConfirm }) {
  const overlay = document.getElementById('custom-confirm-overlay');
  const box     = document.getElementById('custom-confirm-box');
  const msgEl   = document.getElementById('custom-confirm-msg');
  const subEl   = document.getElementById('custom-confirm-sub');
  const okBtn   = document.getElementById('custom-confirm-ok');
  const cancelBtn = document.getElementById('custom-confirm-cancel');

  msgEl.textContent  = msg  || 'Yakin?';
  subEl.textContent  = sub  || '';
  okBtn.textContent  = okLabel;
  box.className      = 'confirm-danger';
  overlay.classList.add('open');

  const close = () => overlay.classList.remove('open');

  const handleOk = () => { close(); onConfirm && onConfirm(); cleanup(); };
  const handleCancel = () => { close(); cleanup(); };
  const handleOverlay = (e) => { if (e.target === overlay) { close(); cleanup(); } };

  function cleanup() {
    okBtn.removeEventListener('click', handleOk);
    cancelBtn.removeEventListener('click', handleCancel);
    overlay.removeEventListener('click', handleOverlay);
  }

  okBtn.addEventListener('click', handleOk);
  cancelBtn.addEventListener('click', handleCancel);
  overlay.addEventListener('click', handleOverlay);
}

// ==================== FILTER & CALC ====================
function getFilteredTransactions() {
  const search   = document.getElementById('filter-search')?.value.toLowerCase().trim() || '';
  const period   = document.getElementById('filter-period')?.value || 'all';
  const category = document.getElementById('filter-category')?.value || 'all';
  const type     = document.getElementById('filter-type')?.value || 'all';
  const sort     = document.getElementById('filter-sort')?.value || 'date-desc';

  let list = transactions.filter(tx => {
    const okSearch   = !search || tx.description.toLowerCase().includes(search) || tx.category.toLowerCase().includes(search);
    const okPeriod   = period === 'all' || tx.date.startsWith(period);
    const okCategory = category === 'all' || tx.category === category;
    const okType     = type === 'all' || tx.type === type;
    return okSearch && okPeriod && okCategory && okType;
  });

  list.sort((a, b) => {
    if (sort === 'date-desc')    return new Date(b.date) - new Date(a.date);
    if (sort === 'date-asc')     return new Date(a.date) - new Date(b.date);
    if (sort === 'amount-desc')  return b.amount - a.amount;
    if (sort === 'amount-asc')   return a.amount - b.amount;
    return 0;
  });

  return list;
}

function calculateSummary(list) {
  let totalIncome = 0, totalExpense = 0, incomeCount = 0, expenseCount = 0;
  list.forEach(tx => {
    if (tx.type === 'income') { totalIncome += Number(tx.amount); incomeCount++; }
    else { totalExpense += Number(tx.amount); expenseCount++; }
  });
  const netBalance = totalIncome - totalExpense;
  const savingsRate = totalIncome > 0 ? Math.max(0, Math.round((netBalance / totalIncome) * 100)) : 0;
  return { totalIncome, totalExpense, netBalance, savingsRate, incomeCount, expenseCount };
}

// ==================== RENDER ====================
function renderApp() {
  const list = getFilteredTransactions();
  const summary = calculateSummary(list);
  renderSummaryCards(summary);
  renderTransactionList(list);
  renderBudgetMonitoring(summary.totalIncome, list);
  renderCategoryChart(list);
}

function renderSummaryCards(s) {
  const setText = (id, val) => {
    const el = document.getElementById(id);
    if (el) el.textContent = val;
  };

  setText('stat-total-income',  formatIDR(s.totalIncome));
  setText('stat-total-expense', formatIDR(s.totalExpense));
  setText('stat-income-count',  s.incomeCount);
  setText('stat-expense-count', s.expenseCount);
  setText('stat-savings-rate',  s.savingsRate + '%');

  const balEl = document.getElementById('stat-net-balance');
  if (balEl) {
    balEl.textContent = (s.netBalance < 0 ? '- ' : '') + formatIDR(s.netBalance);
    balEl.className = s.netBalance < 0
      ? 'text-sm font-bold font-heading text-rose-600 dark:text-rose-400 shrink-0'
      : 'text-sm font-bold font-heading text-blue-600 dark:text-sky-400 shrink-0';
  }

  const statusEl = document.getElementById('stat-balance-status');
  if (statusEl) {
    if (s.netBalance < 0) {
      statusEl.textContent = 'Defisit';
      statusEl.className = 'inline-flex items-center px-1.5 py-0.5 rounded-md text-[9px] font-bold bg-rose-50 dark:bg-rose-500/15 text-rose-700 dark:text-rose-300';
    } else {
      statusEl.textContent = 'Surplus';
      statusEl.className = 'inline-flex items-center px-1.5 py-0.5 rounded-md text-[9px] font-bold bg-emerald-50 dark:bg-emerald-500/15 text-emerald-700 dark:text-emerald-300';
    }
  }

  const barEl = document.getElementById('stat-savings-bar');
  if (barEl) barEl.style.width = Math.min(100, s.savingsRate) + '%';
}

function renderTransactionList(list) {
  const container = document.getElementById('transaction-list');
  const emptyState = document.getElementById('empty-state');
  const badge = document.getElementById('transaction-count-badge');

  badge.textContent = `${list.length} item`;

  if (list.length === 0) {
    container.innerHTML = '';
    emptyState.classList.remove('hidden');
    return;
  }
  emptyState.classList.add('hidden');

  // Mobile-friendly card layout (works on all screen sizes)
  container.innerHTML = list.map(tx => {
    const isIncome = tx.type === 'income';
    const amountColor = isIncome ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400';
    const typeBadge = isIncome
      ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-500/20'
      : 'bg-rose-50 dark:bg-rose-500/10 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-500/20';
    const sign = isIncome ? '+' : '-';
    const catColor = CATEGORY_COLORS[tx.category] || '#94a3b8';

    return `
      <div class="tx-card-mobile">
        <!-- Category color dot -->
        <div class="w-10 h-10 rounded-xl shrink-0 flex items-center justify-center text-white text-sm font-bold"
          style="background-color: ${catColor}20; color: ${catColor};">
          <i class="fa-solid ${getCategoryIcon(tx.category)}"></i>
        </div>
        <!-- Main info -->
        <div class="flex-1 min-w-0">
          <div class="flex items-start justify-between gap-2">
            <div class="min-w-0">
              <p class="font-semibold text-sm text-base-primary truncate">${escapeHTML(tx.description)}</p>
              <div class="flex items-center gap-1.5 mt-0.5">
                <span class="text-[10px] font-semibold px-1.5 py-0.5 rounded-md border ${typeBadge}">${isIncome ? 'Masuk' : 'Keluar'}</span>
                <span class="text-[11px] text-base-muted">${escapeHTML(tx.category)}</span>
              </div>
            </div>
            <div class="text-right shrink-0">
              <p class="font-bold text-sm font-mono ${amountColor}">${sign} ${formatIDR(tx.amount)}</p>
              <p class="text-[11px] text-base-muted mt-0.5">${formatDateID(tx.date)}</p>
            </div>
          </div>
        </div>
        <!-- Action Buttons -->
        <div class="flex flex-col gap-1 shrink-0">
          <button onclick="editTransaction('${tx.id}')" class="w-7 h-7 rounded-lg flex items-center justify-center text-base-muted hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-500/10 transition" title="Edit">
            <i class="fa-solid fa-pen text-[11px]"></i>
          </button>
          <button onclick="deleteTransaction('${tx.id}')" class="w-7 h-7 rounded-lg flex items-center justify-center text-base-muted hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition" title="Hapus">
            <i class="fa-solid fa-trash-can text-[11px]"></i>
          </button>
        </div>
      </div>
    `;
  }).join('');
}

function getCategoryIcon(category) {
  const map = {
    'Gaji Utama': 'fa-briefcase',
    'Freelance / Side Job': 'fa-laptop-code',
    'Investasi / Return': 'fa-chart-line',
    'Lainnya (Pemasukan)': 'fa-circle-dollar-to-slot',
    'Essentials': 'fa-house',
    'RDN Savings': 'fa-piggy-bank',
    'Business': 'fa-store',
    'Entertainment': 'fa-gamepad',
    'Eating out': 'fa-utensils',
    'Shopping': 'fa-bag-shopping',
    'Snacking': 'fa-cookie-bite',
    'Subscriptions': 'fa-repeat',
    'Incidental': 'fa-bolt'
  };
  return map[category] || 'fa-tag';
}

function renderBudgetMonitoring(totalIncome, list) {
  const container = document.getElementById('budget-breakdown-container');
  if (!container) return;

  const actuals = {};
  list.forEach(tx => {
    if (tx.type === 'expense') {
      actuals[tx.category] = (actuals[tx.category] || 0) + Number(tx.amount);
    }
  });

  const totalExpense = Object.values(actuals).reduce((a, b) => a + b, 0);

  container.innerHTML = CATEGORIES.expense.map(cat => {
    const actual = actuals[cat.name] || 0;
    const actualPct = totalExpense > 0 ? Math.round((actual / totalExpense) * 100) : 0;
    const targetAmount = cat.targetPct > 0 ? Math.round((cat.targetPct / 100) * (totalIncome || totalExpense || 1)) : 0;
    const isOverBudget = cat.targetPct > 0 && actual > targetAmount && targetAmount > 0;
    const catColor = CATEGORY_COLORS[cat.name] || '#94a3b8';
    const pctBadge = isOverBudget
      ? 'bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-500/20'
      : 'bg-slate-100 dark:bg-slate-800 text-base-secondary border-base';

    return `
      <div class="space-y-1 text-xs">
        <div class="flex items-center justify-between gap-2">
          <div class="flex items-center gap-1.5 min-w-0">
            <div class="w-2 h-2 rounded-full shrink-0" style="background:${catColor}"></div>
            <span class="font-semibold text-base-primary truncate">${cat.name}</span>
            ${cat.targetPct > 0 ? `<span class="text-base-muted text-[10px] shrink-0">${cat.targetPct}%</span>` : ''}
          </div>
          <div class="flex items-center gap-1.5 shrink-0">
            <span class="font-mono text-[11px] text-base-secondary">${formatIDR(actual)}</span>
            <span class="text-[10px] px-1.5 py-0.5 rounded border font-semibold ${pctBadge}">${actualPct}%</span>
          </div>
        </div>
        <div class="progress-track">
          <div class="progress-bar" style="width:${Math.min(100, actualPct)}%; background-color: ${isOverBudget ? '#ef4444' : catColor};"></div>
        </div>
      </div>
    `;
  }).join('');
}

function renderCategoryChart(list) {
  const canvas = document.getElementById('categoryChart');
  if (!canvas) return;

  const actuals = {};
  list.forEach(tx => {
    if (tx.type === 'expense') {
      actuals[tx.category] = (actuals[tx.category] || 0) + Number(tx.amount);
    }
  });

  const labels = Object.keys(actuals);
  const data = Object.values(actuals);
  const colors = labels.map(l => CATEGORY_COLORS[l] || '#94a3b8');

  if (categoryChartInstance) { categoryChartInstance.destroy(); }

  if (labels.length === 0) {
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    return;
  }

  const isDark = document.documentElement.classList.contains('dark');
  const legendColor = isDark ? '#94a3b8' : '#64748b';

  categoryChartInstance = new Chart(canvas, {
    type: 'doughnut',
    data: {
      labels,
      datasets: [{
        data,
        backgroundColor: colors,
        borderWidth: 2,
        borderColor: isDark ? '#1e293b' : '#ffffff'
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: true,
          position: 'right',
          labels: { color: legendColor, font: { size: 10, family: 'Inter' }, boxWidth: 8, padding: 8 }
        },
        tooltip: {
          callbacks: {
            label: ctx => ` ${ctx.label}: ${formatIDR(ctx.raw)}`
          }
        }
      },
      cutout: '65%'
    }
  });
}

function populateMonthFilter() {
  const sel = document.getElementById('filter-period');
  if (!sel) return;
  const months = new Set(transactions.map(t => t.date?.substring(0, 7)).filter(Boolean));
  const sorted = [...months].sort().reverse();
  const monthNames = ['Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember'];
  sel.innerHTML = '<option value="all">Semua Periode</option>' +
    sorted.map(p => {
      const [y, m] = p.split('-');
      return `<option value="${p}">${monthNames[parseInt(m)-1]} ${y}</option>`;
    }).join('');
}

function populateCategoryDropdown(type) {
  const sel = document.getElementById('tx-category');
  if (!sel) return;
  if (type === 'income') {
    sel.innerHTML = CATEGORIES.income.map(c => `<option value="${c}">${c}</option>`).join('');
  } else {
    sel.innerHTML = CATEGORIES.expense.map(c => `<option value="${c.name}">${c.name} — ${c.group}</option>`).join('');
  }
}

// ==================== EVENT LISTENERS ====================
function setupEventListeners() {
  // Theme Toggle
  document.getElementById('theme-toggle')?.addEventListener('change', toggleTheme);

  // Filters
  ['filter-search','filter-period','filter-category','filter-type','filter-sort'].forEach(id => {
    document.getElementById(id)?.addEventListener('input', renderApp);
    document.getElementById(id)?.addEventListener('change', renderApp);
  });

  document.getElementById('btn-reset-filters')?.addEventListener('click', () => {
    document.getElementById('filter-search').value = '';
    document.getElementById('filter-period').value = 'all';
    document.getElementById('filter-category').value = 'all';
    document.getElementById('filter-type').value = 'all';
    document.getElementById('filter-sort').value = 'date-desc';
    renderApp();
    showToast('Filter telah direset.');
  });

  // Add Transaction
  document.getElementById('btn-open-add-modal-hdr')?.addEventListener('click', () => openTransactionModal());
  document.getElementById('fab-add-btn')?.addEventListener('click', () => openTransactionModal());
  document.getElementById('btn-close-tx-modal')?.addEventListener('click', closeTransactionModal);
  document.getElementById('btn-cancel-tx')?.addEventListener('click', closeTransactionModal);
  document.getElementById('form-transaction')?.addEventListener('submit', handleSaveTransaction);

  // Type toggle buttons in modal
  document.getElementById('btn-type-expense')?.addEventListener('click', () => setTxType('expense'));
  document.getElementById('btn-type-income')?.addEventListener('click', () => setTxType('income'));

  // WA Modal
  document.getElementById('btn-open-wa-modal-hdr')?.addEventListener('click', () => {
    openModal('modal-wa-export');
    updateWhatsAppPreview();
  });
  document.getElementById('btn-close-wa-modal')?.addEventListener('click', () => closeModal('modal-wa-export'));
  document.getElementById('wa-period-daily')?.addEventListener('click', e => setWaPeriod('daily'));
  document.getElementById('wa-period-weekly')?.addEventListener('click', e => setWaPeriod('weekly'));
  document.getElementById('wa-period-monthly')?.addEventListener('click', e => setWaPeriod('monthly'));
  document.getElementById('btn-copy-wa-text')?.addEventListener('click', copyWaText);
  document.getElementById('btn-share-wa-direct')?.addEventListener('click', shareToWA);

  // Backup Modal
  document.getElementById('btn-open-backup-modal-hdr')?.addEventListener('click', () => openModal('modal-backup'));
  document.getElementById('btn-close-backup-modal')?.addEventListener('click', () => closeModal('modal-backup'));
  document.getElementById('btn-export-json')?.addEventListener('click', exportJSON);
  document.getElementById('btn-export-csv')?.addEventListener('click', exportCSV);
  // btn-trigger-import sekarang pakai <label for="import-file-input"> di HTML
  // sehingga file picker terbuka secara native tanpa perlu JS .click()
  document.getElementById('import-file-input')?.addEventListener('change', handleImport);
  document.getElementById('btn-clear-all-data')?.addEventListener('click', clearAllData);

  // Quick Add — event handling dilakukan via renderQuickItemsGrid() (event delegation)
  document.getElementById('btn-edit-quick-items')?.addEventListener('click', () => openQuickEditModal());

  // Sample Data
  document.getElementById('btn-load-sample')?.addEventListener('click', () => {
    transactions = [...SAMPLE_TRANSACTIONS];
    saveTransactions();
    populateMonthFilter();
    renderApp();
    showToast('Data sampel berhasil dimuat!');
  });

  // Close modals on backdrop click
  ['modal-transaction','modal-wa-export','modal-backup','modal-settings','modal-quick-edit'].forEach(id => {
    document.getElementById(id)?.addEventListener('click', e => {
      if (e.target.id === id) closeModal(id);
    });
  });

  // Settings Modal listeners
  document.getElementById('theme-toggle-settings')?.addEventListener('change', function() {
    document.getElementById('theme-toggle').checked = this.checked;
    toggleTheme();
    // Keep both toggles in sync
    document.getElementById('theme-toggle-settings').checked = document.documentElement.classList.contains('dark');
  });

  document.getElementById('btn-load-sample-settings')?.addEventListener('click', () => {
    transactions = [...SAMPLE_TRANSACTIONS];
    saveTransactions();
    populateMonthFilter();
    renderApp();
    closeModal('modal-settings');
    showToast('Data sampel berhasil dimuat!');
  });

  document.getElementById('btn-clear-settings')?.addEventListener('click', () => {
    showConfirm({
      msg: 'Hapus semua data?',
      sub: 'Tindakan ini tidak dapat dibatalkan!',
      okLabel: 'Hapus Semua',
      onConfirm: () => {
        transactions = [];
        saveTransactions();
        populateMonthFilter();
        renderApp();
        closeModal('modal-settings');
        showToast('Semua data telah dihapus.', 'warning');
      }
    });
  });
}

// ==================== MODAL HELPERS ====================
function openModal(id) {
  const el = document.getElementById(id);
  if (el) el.classList.add('open');
  document.body.style.overflow = 'hidden';
  // Sync theme toggle inside settings modal
  if (id === 'modal-settings') {
    const settingsToggle = document.getElementById('theme-toggle-settings');
    if (settingsToggle) settingsToggle.checked = document.documentElement.classList.contains('dark');
  }
}

function closeModal(id) {
  const el = document.getElementById(id);
  if (el) el.classList.remove('open');
  document.body.style.overflow = '';
}

function openTransactionModal(tx = null) {
  const titleEl = document.getElementById('modal-tx-title');
  const idEl = document.getElementById('tx-id');
  const dateEl = document.getElementById('tx-date');
  const amountEl = document.getElementById('tx-amount');
  const descEl = document.getElementById('tx-description');

  if (tx) {
    titleEl.innerHTML = `<i class="fa-solid fa-pen-to-square text-emerald-500"></i> Edit Transaksi`;
    idEl.value = tx.id;
    dateEl.value = tx.date;
    amountEl.value = tx.amount;
    descEl.value = tx.description;
    setTxType(tx.type);
    setTimeout(() => { document.getElementById('tx-category').value = tx.category; }, 0);
  } else {
    titleEl.innerHTML = `<i class="fa-solid fa-plus-circle text-emerald-500"></i> Tambah Transaksi`;
    idEl.value = '';
    dateEl.value = getTodayString();
    amountEl.value = '';
    descEl.value = '';
    setTxType('expense');
  }
  openModal('modal-transaction');
}

function closeTransactionModal() { closeModal('modal-transaction'); }

function setTxType(type) {
  document.getElementById('tx-type').value = type;
  const btnExp = document.getElementById('btn-type-expense');
  const btnInc = document.getElementById('btn-type-income');
  if (type === 'expense') {
    btnExp.className = 'py-3 rounded-xl border-2 border-rose-300 bg-rose-50 dark:border-rose-600 dark:bg-rose-500/10 text-rose-700 dark:text-rose-300 font-bold text-sm flex items-center justify-center gap-2 transition';
    btnInc.className = 'py-3 rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-transparent text-base-muted font-semibold text-sm flex items-center justify-center gap-2 hover:border-emerald-300 transition';
  } else {
    btnInc.className = 'py-3 rounded-xl border-2 border-emerald-300 bg-emerald-50 dark:border-emerald-600 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 font-bold text-sm flex items-center justify-center gap-2 transition';
    btnExp.className = 'py-3 rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-transparent text-base-muted font-semibold text-sm flex items-center justify-center gap-2 hover:border-rose-300 transition';
  }
  populateCategoryDropdown(type);
}

// ==================== CRUD TRANSACTIONS ====================
function handleSaveTransaction(e) {
  e.preventDefault();
  const id   = document.getElementById('tx-id').value;
  const date = document.getElementById('tx-date').value;
  const type = document.getElementById('tx-type').value;
  const cat  = document.getElementById('tx-category').value;
  const desc = document.getElementById('tx-description').value.trim();
  const amt  = Number(document.getElementById('tx-amount').value);

  if (!date || !cat || !desc || isNaN(amt) || amt <= 0) {
    showToast('Mohon lengkapi semua kolom dengan benar.', 'error');
    return;
  }

  const tx = { id: id || genId(), date, type, category: cat, description: desc, amount: amt };

  if (id) {
    const idx = transactions.findIndex(t => t.id === id);
    if (idx !== -1) transactions[idx] = tx;
    showToast('Transaksi berhasil diperbarui!');
  } else {
    transactions.unshift(tx);
    showToast('Transaksi berhasil ditambahkan!');
  }

  saveTransactions();
  populateMonthFilter();
  renderApp();
  closeTransactionModal();
}

function editTransaction(id) {
  const tx = transactions.find(t => t.id === id);
  if (tx) openTransactionModal(tx);
}

function deleteTransaction(id) {
  showConfirm({
    msg: 'Hapus transaksi ini?',
    sub: 'Data transaksi akan dihapus permanen.',
    okLabel: 'Hapus',
    onConfirm: () => {
      transactions = transactions.filter(t => t.id !== id);
      saveTransactions();
      populateMonthFilter();
      renderApp();
      showToast('Transaksi dihapus.', 'warning');
    }
  });
}

function addQuickTx(name, amount, category) {
  const tx = { id: genId(), date: getTodayString(), type: 'expense', category, description: name, amount: Number(amount) };
  transactions.unshift(tx);
  saveTransactions();
  populateMonthFilter();
  renderApp();
  showToast(`${name} (${formatIDR(amount)}) ditambahkan!`);
}

// ==================== QUICK ITEMS MANAGEMENT ====================
function renderQuickItemsGrid() {
  const container = document.getElementById('quick-items-grid');
  if (!container) return;
  if (!quickItems.length) {
    container.innerHTML = `
      <div class="col-span-2 text-center py-6 text-base-muted text-xs">
        <i class="fa-solid fa-plus-circle text-2xl mb-2 opacity-30"></i>
        <p>Belum ada item. Ketuk <span class="font-bold">Edit</span> untuk menambah.</p>
      </div>`;
    return;
  }
  container.innerHTML = quickItems.map(item => `
    <button
      onclick="addQuickTx('${item.name.replace(/'/g, "\\'")}', ${item.amount}, '${item.category}')"
      class="btn-quick-add text-left p-3 rounded-xl border border-base hover:border-emerald-300 dark:hover:border-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-500/5 transition">
      <p class="font-semibold text-xs text-base-primary leading-snug">${item.name}</p>
      <p class="text-[11px] text-rose-500 font-medium mt-0.5">${formatIDR(item.amount)}</p>
    </button>
  `).join('');
}

function openQuickEditModal() {
  renderQuickEditList();
  openModal('modal-quick-edit');
  // reset form
  resetQuickItemForm();
}

function resetQuickItemForm() {
  const nameEl = document.getElementById('qi-name');
  const amtEl  = document.getElementById('qi-amount');
  const catEl  = document.getElementById('qi-category');
  const idEl   = document.getElementById('qi-id');
  if (nameEl) nameEl.value = '';
  if (amtEl)  amtEl.value  = '';
  if (idEl)   idEl.value   = '';
  if (catEl) {
    // populate category options
    catEl.innerHTML = CATEGORIES.expense.map(c =>
      `<option value="${c.name}">${c.name}</option>`
    ).join('');
  }
  const saveBtn = document.getElementById('btn-qi-save');
  if (saveBtn) saveBtn.textContent = 'Tambah Item';
  const cancelEditBtn = document.getElementById('btn-qi-cancel-edit');
  if (cancelEditBtn) cancelEditBtn.classList.add('hidden');
}

function renderQuickEditList() {
  const list = document.getElementById('qi-list');
  if (!list) return;
  if (!quickItems.length) {
    list.innerHTML = `<p class="text-center text-xs text-base-muted py-4">Belum ada item. Tambahkan di bawah.</p>`;
    return;
  }
  list.innerHTML = quickItems.map((item, idx) => `
    <div class="flex items-center gap-2 p-2.5 rounded-xl border border-base bg-slate-50/50 dark:bg-slate-800/40">
      <div class="flex-1 min-w-0">
        <p class="text-xs font-semibold text-base-primary truncate">${item.name}</p>
        <p class="text-[11px] text-rose-500 font-medium">${formatIDR(item.amount)} · ${item.category}</p>
      </div>
      <button onclick="editQuickItemForm('${item.id}')"
        class="w-7 h-7 rounded-lg flex items-center justify-center text-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 transition shrink-0"
        title="Edit">
        <i class="fa-solid fa-pen text-[11px]"></i>
      </button>
      <button onclick="deleteQuickItem('${item.id}')"
        class="w-7 h-7 rounded-lg flex items-center justify-center text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition shrink-0"
        title="Hapus">
        <i class="fa-solid fa-trash-can text-[11px]"></i>
      </button>
    </div>
  `).join('');
}

function editQuickItemForm(id) {
  const item = quickItems.find(i => i.id === id);
  if (!item) return;
  const nameEl = document.getElementById('qi-name');
  const amtEl  = document.getElementById('qi-amount');
  const catEl  = document.getElementById('qi-category');
  const idEl   = document.getElementById('qi-id');
  if (nameEl) nameEl.value = item.name;
  if (amtEl)  amtEl.value  = item.amount;
  if (idEl)   idEl.value   = item.id;
  if (catEl)  catEl.value  = item.category;
  const saveBtn = document.getElementById('btn-qi-save');
  if (saveBtn) saveBtn.textContent = 'Simpan Perubahan';
  const cancelEditBtn = document.getElementById('btn-qi-cancel-edit');
  if (cancelEditBtn) cancelEditBtn.classList.remove('hidden');
  // scroll form ke view
  document.getElementById('qi-form-section')?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

function deleteQuickItem(id) {
  showConfirm({
    msg: 'Hapus item ini?',
    sub: 'Item akan dihapus dari daftar Quick Add.',
    okLabel: 'Hapus',
    onConfirm: () => {
      quickItems = quickItems.filter(i => i.id !== id);
      saveQuickItems();
      renderQuickEditList();
      renderQuickItemsGrid();
      showToast('Item dihapus.', 'warning');
    }
  });
}

function handleQuickItemFormSubmit(e) {
  e.preventDefault();
  const nameEl = document.getElementById('qi-name');
  const amtEl  = document.getElementById('qi-amount');
  const catEl  = document.getElementById('qi-category');
  const idEl   = document.getElementById('qi-id');
  const name   = nameEl?.value.trim();
  const amount = Number(amtEl?.value);
  const cat    = catEl?.value;
  const id     = idEl?.value;
  if (!name || !amount || amount <= 0) {
    showToast('Isi nama dan nominal dengan benar.', 'error');
    return;
  }
  if (id) {
    // edit existing
    const idx = quickItems.findIndex(i => i.id === id);
    if (idx !== -1) quickItems[idx] = { id, name, amount, category: cat };
    showToast('Item berhasil diperbarui!');
  } else {
    // add new
    quickItems.push({ id: genId(), name, amount, category: cat });
    showToast(`"${name}" ditambahkan ke Quick Add!`);
  }
  saveQuickItems();
  renderQuickEditList();
  renderQuickItemsGrid();
  resetQuickItemForm();
}

// ==================== BACKUP & RESTORE ====================
function exportJSON() {
  if (!transactions.length) { showToast('Tidak ada data untuk diekspor.', 'error'); return; }
  const jsonStr = JSON.stringify(transactions, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `Sikaku_Backup_${getTodayString()}.json`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
  showToast('File JSON berhasil diunduh!');
}

function exportCSV() {
  if (!transactions.length) { showToast('Tidak ada data untuk diekspor.', 'error'); return; }
  const headers = ['ID','Tanggal','Jenis','Kategori','Deskripsi','Nominal'];
  const rows = transactions.map(t => [t.id, t.date, t.type, `"${(t.category||'').replace(/"/g,'""')}"`, `"${(t.description||'').replace(/"/g,'""')}"`, t.amount]);
  const csv = '\uFEFF' + [headers, ...rows].map(r => r.join(',')).join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `Sikaku_Report_${getTodayString()}.csv`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
  showToast('File CSV berhasil diunduh!');
}

function handleImport(e) {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = function(ev) {
    const content = ev.target.result;
    let success = false;

    // Try parsing content as JSON first regardless of extension quirks on mobile
    try {
      const data = JSON.parse(content);
      if (Array.isArray(data)) {
        if (data.length > 0) {
          transactions = data;
          saveTransactions();
          populateMonthFilter();
          renderApp();
          closeModal('modal-backup');
          showToast(`${data.length} transaksi berhasil dipulihkan!`);
          success = true;
        } else {
          showToast('File JSON kosong.', 'warning');
          success = true;
        }
      }
    } catch (jsonErr) {
      // Not JSON or parsing failed, fallback to CSV
    }

    if (!success) {
      try {
        const lines = content.split(/\r?\n/).filter(l => l.trim());
        if (lines.length > 1) {
          const clean = s => (s || '').replace(/^"|"$/g,'').trim();
          const imported = lines.slice(1).map((line) => {
            const cols = line.match(/(".*?"|[^",\s]+)(?=\s*,|\s*$)/g) || [];
            if (cols.length < 6) return null;
            return {
              id: clean(cols[0]) || genId(),
              date: clean(cols[1]),
              type: clean(cols[2]),
              category: clean(cols[3]),
              description: clean(cols[4]),
              amount: Number(clean(cols[5])) || 0
            };
          }).filter(Boolean);

          if (imported.length > 0) {
            transactions = imported;
            saveTransactions();
            populateMonthFilter();
            renderApp();
            closeModal('modal-backup');
            showToast(`${imported.length} transaksi berhasil dipulihkan dari CSV!`);
            success = true;
          }
        }
      } catch (csvErr) {
        console.error(csvErr);
      }
    }

    if (!success) {
      showToast('Gagal membaca file. Pastikan format JSON/CSV sesuai.', 'error');
    }
  };
  reader.readAsText(file);
  e.target.value = '';
}

function clearAllData() {
  showConfirm({
    msg: 'Hapus semua data?',
    sub: 'Tindakan ini tidak dapat dibatalkan!',
    okLabel: 'Hapus Semua',
    onConfirm: () => {
      transactions = [];
      saveTransactions();
      populateMonthFilter();
      renderApp();
      closeModal('modal-backup');
      showToast('Semua data telah dihapus.', 'warning');
    }
  });
}

// ==================== WHATSAPP REPORT ====================
function setWaPeriod(period) {
  currentWaPeriod = period;
  document.querySelectorAll('.btn-wa-period').forEach(b => {
    b.className = 'btn-wa-period py-3 rounded-xl border-2 border-slate-200 dark:border-slate-700 text-base-secondary font-semibold text-xs text-center hover:border-emerald-300 transition';
  });
  const activeId = { daily: 'wa-period-daily', weekly: 'wa-period-weekly', monthly: 'wa-period-monthly' }[period];
  const activeBtn = document.getElementById(activeId);
  if (activeBtn) activeBtn.className = 'btn-wa-period py-3 rounded-xl border-2 border-emerald-400 bg-emerald-50 dark:bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 font-bold text-xs text-center transition';
  updateWhatsAppPreview();
}

function getWaPeriodTransactions(periodType) {
  const today = getTodayString();
  if (periodType === 'daily') {
    return { list: transactions.filter(t => t.date === today), label: `Harian — ${formatDateID(today)}` };
  }
  if (periodType === 'weekly') {
    const now = new Date(), past = new Date();
    past.setDate(now.getDate() - 7);
    return {
      list: transactions.filter(t => { const d = new Date(t.date); return d >= past && d <= now; }),
      label: 'Mingguan — 7 Hari Terakhir'
    };
  }
  // Monthly
  const selPeriod = document.getElementById('filter-period')?.value;
  const targetMonth = selPeriod && selPeriod !== 'all' ? selPeriod : today.substring(0,7);
  const [y, m] = targetMonth.split('-');
  const monthNames = ['Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember'];
  return {
    list: transactions.filter(t => t.date.startsWith(targetMonth)),
    label: `Bulanan — ${monthNames[parseInt(m)-1]} ${y}`
  };
}

function generateWaText(periodType) {
  const { list, label } = getWaPeriodTransactions(periodType);
  const s = calculateSummary(list);

  const catMap = {};
  list.forEach(t => { if (t.type === 'expense') catMap[t.category] = (catMap[t.category] || 0) + Number(t.amount); });

  let txt = `📊 *LAPORAN KEUANGAN ${label.toUpperCase()}*\n`;
  txt += `🗓️ Dibuat: ${formatDateID(getTodayString())}\n\n`;
  txt += `━━━━━━━━━━━━━━━━\n`;
  txt += `💰 *RINGKASAN CASH FLOW*\n`;
  txt += `🟢 Pemasukan : *${formatIDR(s.totalIncome)}* (${s.incomeCount} transaksi)\n`;
  txt += `🔴 Pengeluaran: *${formatIDR(s.totalExpense)}* (${s.expenseCount} transaksi)\n`;
  txt += `${s.netBalance >= 0 ? '✅' : '⚠️'} Sisa Saldo : *${s.netBalance < 0 ? '-' : ''}${formatIDR(s.netBalance)}* (${s.savingsRate}%)\n\n`;

  txt += `📋 *RINCIAN PER KATEGORI*\n`;
  if (Object.keys(catMap).length === 0) {
    txt += `  _Belum ada pengeluaran_\n`;
  } else {
    Object.entries(catMap).sort((a, b) => b[1] - a[1]).forEach(([cat, amt]) => {
      txt += `• ${cat}: *${formatIDR(amt)}*\n`;
    });
  }
  txt += `\n`;

  txt += `📝 *RIWAYAT TRANSAKSI (${list.length} items)*\n`;
  if (list.length === 0) {
    txt += `  _Tidak ada transaksi_\n`;
  } else {
    list.slice(0, 20).forEach(t => {
      const sign = t.type === 'income' ? '🟢' : '🔴';
      txt += `${sign} ${formatDateID(t.date)} — ${t.description} (${t.category}): *${formatIDR(t.amount)}*\n`;
    });
    if (list.length > 20) txt += `_...dan ${list.length - 20} transaksi lainnya_\n`;
  }

  txt += `\n━━━━━━━━━━━━━━━━\n_Dikirim via Sikaku Finance Tracker_`;
  return txt;
}

function updateWhatsAppPreview() {
  const ta = document.getElementById('wa-preview-text');
  if (ta) ta.value = generateWaText(currentWaPeriod);
}

function copyWaText() {
  const ta = document.getElementById('wa-preview-text');
  if (!ta) return;
  navigator.clipboard.writeText(ta.value).then(() => showToast('Teks berhasil disalin!')).catch(() => {
    ta.select();
    document.execCommand('copy');
    showToast('Teks berhasil disalin!');
  });
}

function shareToWA() {
  const text = generateWaText(currentWaPeriod);
  window.open('https://api.whatsapp.com/send?text=' + encodeURIComponent(text), '_blank');
}

// ==================== BOTTOM NAV HELPER ====================
function bottomNavActivate(id) {
  document.querySelectorAll('.bottom-nav-btn').forEach(b => b.classList.remove('active'));
  const el = document.getElementById('bnav-' + id);
  if (el) el.classList.add('active');
}
