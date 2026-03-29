// ── DATA ──
let faturas = [
  { id: 1, paciente: 'Maria Silva',  data: '2024-04-10', convenio: 'Unimed',     valor: 300,  status: 'Pendente'  },
  { id: 2, paciente: 'João Souza',   data: '2024-04-08', convenio: 'Particular', valor: 150,  status: 'Pago'      },
  { id: 3, paciente: 'Ana Costa',    data: '2024-04-05', convenio: 'Amil',       valor: 500,  status: 'Cancelado' },
  { id: 4, paciente: 'Pedro Lima',   data: '2024-04-02', convenio: 'Unimed',     valor: 400,  status: 'Pago'      },
];

let editingId = null;
let sortKey   = 'data';
let sortAsc   = false;
let nextId    = 5;

// ── FORMATTERS ──
const fmt     = v => 'R$ ' + v.toFixed(2).replace('.', ',').replace(/\B(?=(\d{3})+(?!\d))/g, '.');
const fmtDate = s => { const [y, m, d] = s.split('-'); return `${d}/${m}/${y}`; };

// ── FILTER ──
function getFiltered() {
  const q  = document.getElementById('searchInput').value.toLowerCase();
  const ds = document.getElementById('dateStart').value;
  const de = document.getElementById('dateEnd').value;
  const st = document.getElementById('statusFilter').value;

  return faturas.filter(f => {
    if (q  && !f.paciente.toLowerCase().includes(q)) return false;
    if (ds && f.data < ds) return false;
    if (de && f.data > de) return false;
    if (st && f.status !== st) return false;
    return true;
  });
}

// ── SORT ──
function sortBy(key) {
  if (sortKey === key) sortAsc = !sortAsc;
  else { sortKey = key; sortAsc = true; }
  renderTable();
}

// ── RENDER ──
function renderTable() {
  const keyMap = { paciente: 'paciente', convenio: 'convenio', valor: 'valor', data: 'data' };
  const k = keyMap[sortKey] || 'data';

  const data = getFiltered().slice().sort((a, b) => {
    if (a[k] < b[k]) return sortAsc ? -1 : 1;
    if (a[k] > b[k]) return sortAsc ?  1 : -1;
    return 0;
  });

  // KPIs
  const all = getFiltered();
  document.getElementById('kpiPending').textContent  = fmt(all.filter(f => f.status === 'Pendente').reduce((s, f) => s + f.valor, 0));
  document.getElementById('kpiPaid').textContent     = fmt(all.filter(f => f.status === 'Pago').reduce((s, f) => s + f.valor, 0));
  document.getElementById('kpiCanceled').textContent = fmt(all.filter(f => f.status === 'Cancelado').reduce((s, f) => s + f.valor, 0));

  const tbody = document.getElementById('tableBody');

  if (data.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="6">
          <div class="empty-state">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
              <circle cx="12" cy="12" r="10"/>
              <line x1="8" y1="15" x2="16" y2="15"/>
              <line x1="9" y1="9" x2="9.01" y2="9"/>
              <line x1="15" y1="9" x2="15.01" y2="9"/>
            </svg>
            <p>Nenhuma fatura encontrada.</p>
          </div>
        </td>
      </tr>`;
    return;
  }

  tbody.innerHTML = data.map(f => {
    const sc = f.status === 'Pendente' ? 'pendente' : f.status === 'Pago' ? 'pago' : 'cancelado';

    let actions = `<button class="btn-action" onclick="verFatura(${f.id})">Ver</button>`;
    if (f.status === 'Pendente') {
      actions += `<button class="btn-action primary" onclick="receber(${f.id})">Receber</button>`;
      actions += `<button class="btn-action danger"  onclick="cancelar(${f.id})">Cancelar</button>`;
    }
    if (f.status === 'Pago') {
      actions += `<button class="btn-action" onclick="emitirRecibo(${f.id})">Emitir Recibo</button>`;
    }

    return `
      <tr>
        <td class="patient-name">${f.paciente}</td>
        <td class="date-cell">${fmtDate(f.data)}</td>
        <td class="convenio-cell">${f.convenio}</td>
        <td class="value-cell">${fmt(f.valor)}</td>
        <td><span class="badge ${sc}">${f.status}</span></td>
        <td>
          <div class="actions-cell">
            ${actions}
            <button class="btn-action" onclick="editFatura(${f.id})" title="Editar">✏️</button>
          </div>
        </td>
      </tr>`;
  }).join('');
}

// ── ACTIONS ──
function receber(id) {
  faturas.find(f => f.id === id).status = 'Pago';
  renderTable();
  toast('Fatura marcada como Paga ✓', 'success');
}

function cancelar(id) {
  if (!confirm('Cancelar esta fatura?')) return;
  faturas.find(f => f.id === id).status = 'Cancelado';
  renderTable();
  toast('Fatura cancelada.', 'danger');
}

function verFatura(id) {
  const f = faturas.find(f => f.id === id);
  toast(`Paciente: ${f.paciente} | ${f.convenio} | ${fmt(f.valor)}`, 'info');
}

function emitirRecibo(id) {
  const f = faturas.find(f => f.id === id);
  toast(`Recibo emitido para ${f.paciente} — ${fmt(f.valor)}`, 'success');
}

function editFatura(id) {
  editingId = id;
  const f = faturas.find(f => f.id === id);
  document.getElementById('modalTitle').textContent    = 'Editar Fatura';
  document.getElementById('formPaciente').value        = f.paciente;
  document.getElementById('formData').value            = f.data;
  document.getElementById('formConvenio').value        = f.convenio;
  document.getElementById('formValor').value           = f.valor;
  document.getElementById('formStatus').value          = f.status;
  openModal();
}

// ── MODAL ──
function openModal() {
  document.getElementById('modalOverlay').classList.add('open');
}

function closeModal() {
  document.getElementById('modalOverlay').classList.remove('open');
  editingId = null;
  document.getElementById('modalTitle').textContent = 'Nova Fatura';
  ['formPaciente', 'formData', 'formValor'].forEach(id => {
    document.getElementById(id).value = '';
  });
  document.getElementById('formConvenio').selectedIndex = 0;
  document.getElementById('formStatus').selectedIndex   = 0;
}

function saveFatura() {
  const p = document.getElementById('formPaciente').value.trim();
  const d = document.getElementById('formData').value;
  const c = document.getElementById('formConvenio').value;
  const v = parseFloat(document.getElementById('formValor').value);
  const s = document.getElementById('formStatus').value;

  if (!p || !d || !c || isNaN(v) || v <= 0) {
    toast('Preencha todos os campos corretamente.', 'danger');
    return;
  }

  if (editingId) {
    const f = faturas.find(f => f.id === editingId);
    Object.assign(f, { paciente: p, data: d, convenio: c, valor: v, status: s });
    toast('Fatura atualizada com sucesso ✓', 'success');
  } else {
    faturas.unshift({ id: nextId++, paciente: p, data: d, convenio: c, valor: v, status: s });
    toast('Nova fatura criada com sucesso ✓', 'success');
  }

  closeModal();
  renderTable();
}

// ── RELATÓRIO ──
function gerarRelatorio() {
  const rows = getFiltered();
  const lines = [
    'RELATÓRIO DE FATURAMENTO — TEKSYSTEM',
    '='.repeat(40),
    '',
    rows.map(f =>
      `${fmtDate(f.data)} | ${f.paciente.padEnd(20)} | ${f.convenio.padEnd(15)} | ${fmt(f.valor).padStart(12)} | ${f.status}`
    ).join('\n'),
    '',
    `Total Pendente : ${fmt(rows.filter(f => f.status === 'Pendente').reduce((s, f) => s + f.valor, 0))}`,
    `Total Pago     : ${fmt(rows.filter(f => f.status === 'Pago').reduce((s, f) => s + f.valor, 0))}`,
    `Total Cancelado: ${fmt(rows.filter(f => f.status === 'Cancelado').reduce((s, f) => s + f.valor, 0))}`,
  ].join('\n');

  const blob = new Blob([lines], { type: 'text/plain;charset=utf-8' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'relatorio-faturamento.txt';
  a.click();
  toast('Relatório gerado e baixado ✓', 'success');
}

// ── TOAST ──
function toast(msg, type = 'info') {
  const wrap = document.getElementById('toastWrap');
  const el   = document.createElement('div');
  el.className   = `toast ${type}`;
  el.textContent = msg;
  wrap.appendChild(el);
  setTimeout(() => el.remove(), 3500);
}

// ── NAV ──
function setNav(el) {
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
  el.classList.add('active');
}

// ── INIT ──
document.addEventListener('DOMContentLoaded', () => {
  renderTable();

  document.getElementById('modalOverlay').addEventListener('click', function (e) {
    if (e.target === this) closeModal();
  });
});
