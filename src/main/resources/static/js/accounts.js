(() => {
  const ACCOUNTS_API = 'http://localhost:8080/api/accounts';
  const CARDS_API = 'http://localhost:8080/api/cards';

  const accountForm = document.getElementById('accountForm');
  const cardForm = document.getElementById('cardForm');
  const accountsTableBody = document.querySelector('#accountsTable tbody');
  const cardsTableBody = document.querySelector('#cardsTable tbody');
  const cardAccountSelect = document.getElementById('cardAccount');

  let accounts = [];
  let cards = [];

  function escapeHtml(str) {
    const map = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
    return String(str || '').replace(/[&<>"']/g, s => map[s]);
  }

  async function fetchAccounts() {
    const resp = await fetch(ACCOUNTS_API);
    if (!resp.ok) throw new Error('Falha ao carregar contas');
    accounts = await resp.json();
    renderAccounts();
    fillAccountOptions();
    // fetch cards for each account nested (optional) or fetch all cards
    await fetchCards();
  }

  async function fetchCards() {
    const resp = await fetch(CARDS_API);
    if (!resp.ok) throw new Error('Falha ao carregar cartões');
    cards = await resp.json();
    renderCards();
  }

  function fillAccountOptions() {
    cardAccountSelect.innerHTML = '<option value="" disabled selected>Selecione...</option>';
    accounts.forEach(acc => {
      const opt = document.createElement('option');
      opt.value = acc.id;
      opt.textContent = `${acc.bankName} (${acc.accountNumber})`;
      cardAccountSelect.appendChild(opt);
    });
  }

  function renderAccounts() {
    accountsTableBody.innerHTML = '';
    accounts.forEach(acc => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${escapeHtml(acc.bankName)}</td>
        <td>${escapeHtml(acc.accountNumber)}</td>
        <td>${escapeHtml(acc.description)}</td>
        <td class="actions-col">
          <button class="icon-btn edit" data-id="${acc.id}" title="Editar">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
              <path d="M12 20h9" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
              <path d="M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4 12.5-12.5z" stroke="currentColor" stroke-width="2" fill="none" stroke-linejoin="round"/>
            </svg>
          </button>
          <button class="icon-btn delete" data-id="${acc.id}" title="Remover">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
              <path d="M3 6h18" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
              <path d="M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2" stroke="currentColor" stroke-width="2"/>
              <path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6" stroke="currentColor" stroke-width="2"/>
              <path d="M10 11v6M14 11v6" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
            </svg>
          </button>
        </td>`;
      accountsTableBody.appendChild(tr);
    });
  }

  function renderCards() {
    cardsTableBody.innerHTML = '';
    cards.forEach(card => {
      const acc = accounts.find(a => a.id === card.bankAccount?.id) || accounts.find(a => a.id === card.bankAccountId);
      const accLabel = acc ? `${acc.bankName}` : '—';
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${escapeHtml(card.description)}</td>
        <td>${escapeHtml(accLabel)}</td>
        <td>${escapeHtml(card.lastDigits)}</td>
        <td class="actions-col">
          <button class="icon-btn edit" data-id="${card.id}" data-type="card" title="Editar">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
              <path d="M12 20h9" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
              <path d="M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4 12.5-12.5z" stroke="currentColor" stroke-width="2" fill="none" stroke-linejoin="round"/>
            </svg>
          </button>
          <button class="icon-btn delete" data-id="${card.id}" data-type="card" title="Remover">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
              <path d="M3 6h18" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
              <path d="M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2" stroke="currentColor" stroke-width="2"/>
              <path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6" stroke="currentColor" stroke-width="2"/>
              <path d="M10 11v6M14 11v6" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
            </svg>
          </button>
        </td>`;
      cardsTableBody.appendChild(tr);
    });
  }

  accountForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const fd = new FormData(accountForm);
    const payload = {
      bankName: fd.get('bankName'),
      accountNumber: fd.get('accountNumber'),
      description: fd.get('description')
    };
    try {
      const method = accountForm.dataset.editId ? 'PUT' : 'POST';
      const url = accountForm.dataset.editId ? `${ACCOUNTS_API}/${accountForm.dataset.editId}` : ACCOUNTS_API;
      const resp = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      if (!resp.ok) throw new Error('Falha ao salvar conta');
      exitAccountEdit();
      await fetchAccounts();
    } catch (err) {
      console.error(err);
      alert('Erro ao salvar conta');
    }
  });

  cardForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const fd = new FormData(cardForm);
    const payload = {
      description: fd.get('description'),
      lastDigits: fd.get('lastDigits')
    };
    const accountId = fd.get('accountId');
    if (!accountId) { alert('Selecione a conta'); return; }
    try {
      const method = cardForm.dataset.editId ? 'PUT' : 'POST';
      let url;
      if (method === 'POST') {
        url = `${ACCOUNTS_API}/${accountId}/cards`;
      } else {
        url = `${CARDS_API}/${cardForm.dataset.editId}?accountId=${accountId}`;
      }
      const resp = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      if (!resp.ok) throw new Error('Falha ao salvar cartão');
      exitCardEdit();
      await fetchCards();
    } catch (err) {
      console.error(err);
      alert('Erro ao salvar cartão');
    }
  });

  accountsTableBody.addEventListener('click', async (e) => {
    const editBtn = e.target.closest('.icon-btn.edit');
    const delBtn = e.target.closest('.icon-btn.delete');
    if (!editBtn && !delBtn) return;
    const id = editBtn?.dataset.id || delBtn?.dataset.id;
    if (delBtn) {
      if (!confirm('Remover conta? Isso não remove cartões (associação permanece).')) return;
      try {
        const resp = await fetch(`${ACCOUNTS_API}/${id}`, { method: 'DELETE' });
        if (!resp.ok) throw new Error('Falha ao remover');
        await fetchAccounts();
      } catch (err) { console.error(err); alert('Erro ao remover conta'); }
      return;
    }
    if (editBtn) {
      const acc = accounts.find(a => String(a.id) === String(id));
      if (acc) enterAccountEdit(acc);
    }
  });

  cardsTableBody.addEventListener('click', async (e) => {
    const editBtn = e.target.closest('.icon-btn.edit');
    const delBtn = e.target.closest('.icon-btn.delete');
    if (!editBtn && !delBtn) return;
    const id = editBtn?.dataset.id || delBtn?.dataset.id;
    if (delBtn) {
      if (!confirm('Remover cartão?')) return;
      try {
        const resp = await fetch(`${CARDS_API}/${id}`, { method: 'DELETE' });
        if (!resp.ok) throw new Error('Falha ao remover');
        await fetchCards();
      } catch (err) { console.error(err); alert('Erro ao remover cartão'); }
      return;
    }
    if (editBtn) {
      const card = cards.find(c => String(c.id) === String(id));
      if (card) enterCardEdit(card);
    }
  });

  function enterAccountEdit(acc) {
    accountForm.dataset.editId = acc.id;
    accountForm.querySelector('button[type="submit"]').textContent = 'Atualizar';
    accountForm.querySelector('#bankName').value = acc.bankName || '';
    accountForm.querySelector('#accountNumber').value = acc.accountNumber || '';
    accountForm.querySelector('#accountDescription').value = acc.description || '';
  }
  function exitAccountEdit() {
    delete accountForm.dataset.editId;
    accountForm.reset();
    accountForm.querySelector('button[type="submit"]').textContent = 'Salvar';
  }
  document.getElementById('accountClear').addEventListener('click', exitAccountEdit);

  function enterCardEdit(card) {
    cardForm.dataset.editId = card.id;
    cardForm.querySelector('button[type="submit"]').textContent = 'Atualizar';
    cardForm.querySelector('#cardDescription').value = card.description || '';
    cardForm.querySelector('#lastDigits').value = card.lastDigits || '';
    const accountId = card.bankAccount?.id || card.bankAccountId;
    if (accountId) cardAccountSelect.value = accountId;
  }
  function exitCardEdit() {
    delete cardForm.dataset.editId;
    cardForm.reset();
    cardForm.querySelector('button[type="submit"]').textContent = 'Salvar';
  }
  document.getElementById('cardClear').addEventListener('click', exitCardEdit);

  // Inicialização
  (async () => {
    try {
      await fetchAccounts();
    } catch (err) {
      console.error(err);
      alert('Falha ao carregar dados iniciais.');
    }
  })();
})();
