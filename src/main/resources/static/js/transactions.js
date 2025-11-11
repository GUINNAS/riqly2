(() => {
  const API_URL = 'http://localhost:8080/api/transactions';

  function $ (selector) {
    return document.querySelector(selector);
  }

  const form = $('#transactionForm');
  const tableBody = $('#transactionsTable tbody');
  let currentTransactions = [];

  function renderTransactions(transactions) {
    const emptyState = document.getElementById('emptyState');
    tableBody.innerHTML = '';

    if (!transactions || transactions.length === 0) {
      if (emptyState) emptyState.hidden = false;
      return;
    }
    if (emptyState) emptyState.hidden = true;

    transactions.forEach(tx => {
      const row = document.createElement('tr');
      const isExpense = String(tx.type).toUpperCase() === 'DESPESA';
      row.className = isExpense ? 'expense' : 'income';

      const amount = Number(tx.amount || 0);
      const amountFmt = isFinite(amount)
        ? amount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
        : '-';

      const dateStr = tx.date ? new Date(tx.date).toLocaleDateString('pt-BR') : '';

      row.innerHTML = `
        <td>${isExpense ? 'Despesa' : 'Receita'}</td>
        <td class="amount">${amountFmt}</td>
        <td>${tx.description ? escapeHtml(tx.description) : ''}</td>
        <td>${dateStr}</td>
        <td>${tx.category || ''}</td>
        <td>${tx.recurring ? 'Sim' : 'Não'}</td>
        <td class="actions-col">
          <button class="icon-btn edit" title="Editar" data-id="${tx.id}">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
              <path d="M12 20h9" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
              <path d="M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4 12.5-12.5z" stroke="currentColor" stroke-width="2" fill="none" stroke-linejoin="round"/>
            </svg>
          </button>
          <button class="icon-btn delete" title="Remover" data-id="${tx.id}">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
              <path d="M3 6h18" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
              <path d="M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2" stroke="currentColor" stroke-width="2"/>
              <path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6" stroke="currentColor" stroke-width="2"/>
              <path d="M10 11v6M14 11v6" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
            </svg>
          </button>
        </td>
      `;
      tableBody.appendChild(row);
    });
  }

  function escapeHtml(str) {
    const map = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
    return String(str).replace(/[&<>"']/g, s => map[s]);
  }

  async function fetchTransactions() {
    try {
      const response = await fetch(API_URL);
      if (!response.ok) {
        throw new Error('Erro ao buscar transações');
      }
      const transactions = await response.json();
      currentTransactions = Array.isArray(transactions) ? transactions : [];
      renderTransactions(currentTransactions);
    } catch (error) {
      console.error(error);
      alert('Não foi possível carregar as transações.');
    }
  }

  form.addEventListener('submit', async (event) => {
    event.preventDefault();

    const formData = new FormData(form);
    const transaction = {
      type: formData.get('type'),
      amount: formData.get('amount'),
      description: formData.get('description'),
      date: formData.get('date'),
      category: formData.get('category'),
      recurring: formData.get('recurring') === 'true'
    };

    try {
      const editId = form.dataset.editId;
      const url = editId ? `${API_URL}/${editId}` : API_URL;
      const method = editId ? 'PUT' : 'POST';
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(transaction)
      });

      if (!response.ok) {
        throw new Error(editId ? 'Erro ao atualizar transação' : 'Erro ao salvar transação');
      }

      exitEditMode();
      await fetchTransactions();
      alert(editId ? 'Transação atualizada com sucesso!' : 'Transação salva com sucesso!');
    } catch (error) {
      console.error(error);
      alert('Não foi possível salvar a transação.');
    }
  });

  // Delegação de eventos para ações de editar e remover
  tableBody.addEventListener('click', async (e) => {
    const editBtn = e.target.closest && e.target.closest('.icon-btn.edit');
    const delBtn = e.target.closest && e.target.closest('.icon-btn.delete');
    if (editBtn) {
      const id = editBtn.dataset.id;
      const tx = currentTransactions.find(t => String(t.id) === String(id));
      if (tx) enterEditMode(tx);
    }
    if (delBtn) {
      const id = delBtn.dataset.id;
      const ok = confirm('Deseja remover esta transação?');
      if (!ok) return;
      try {
        const resp = await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
        if (!resp.ok) throw new Error('Falha ao remover');
        await fetchTransactions();
      } catch (err) {
        console.error(err);
        alert('Não foi possível remover a transação.');
      }
    }
  });

  function enterEditMode(tx) {
    form.dataset.editId = tx.id;
    const submitBtn = form.querySelector('button[type="submit"]');
    if (submitBtn) submitBtn.textContent = 'Atualizar';

    const typeInput = form.querySelector(`input[name="type"][value="${String(tx.type).toUpperCase()}"]`);
    if (typeInput) typeInput.checked = true;
    form.querySelector('#amount').value = tx.amount;
    form.querySelector('#description').value = tx.description || '';
    form.querySelector('#date').value = tx.date || '';
    form.querySelector('#category').value = tx.category || 'outros';
    form.querySelector('#recurring').value = tx.recurring ? 'true' : 'false';
  }

  function exitEditMode() {
    form.reset();
    delete form.dataset.editId;
    const submitBtn = form.querySelector('button[type="submit"]');
    if (submitBtn) submitBtn.textContent = 'Salvar';
    // reset tipo e data conforme inicialização
    const typeDesp = form.querySelector('input[name="type"][value="DESPESA"]');
    if (typeDesp) typeDesp.checked = true;
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    const dateInput = document.getElementById('date');
    if (dateInput) dateInput.value = `${yyyy}-${mm}-${dd}`;
  }

  // Utilitário: Define data padrão como hoje
  const dateInput = document.getElementById('date');
  if (dateInput && !dateInput.value) {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    dateInput.value = `${yyyy}-${mm}-${dd}`;
  }

  // Botão limpar
  const clearBtn = document.getElementById('clearBtn');
  if (clearBtn) {
    clearBtn.addEventListener('click', () => {
      form.reset();
      // volta tipo para DESPESA e data para hoje
      const typeDesp = form.querySelector('input[name="type"][value="DESPESA"]');
      if (typeDesp) typeDesp.checked = true;
      if (dateInput) {
        const today = new Date();
        const yyyy = today.getFullYear();
        const mm = String(today.getMonth() + 1).padStart(2, '0');
        const dd = String(today.getDate()).padStart(2, '0');
        dateInput.value = `${yyyy}-${mm}-${dd}`;
      }
    });
  }

  // Carregar transações ao iniciar
  fetchTransactions();
})();
