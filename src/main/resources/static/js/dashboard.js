(() => {
  const SUMMARY_API = 'http://localhost:8080/api/transactions/summary';
  const incomeEl = document.getElementById('incomeValue');
  const expenseEl = document.getElementById('expenseValue');
  const netEl = document.getElementById('netValue');
  const countEl = document.getElementById('countValue');
  const monthInput = document.getElementById('monthSelect');
  const categoryTableBody = document.querySelector('#categoryTable tbody');

  let categoryChart, incomeExpenseChart;

  function formatCurrency(v){
    if (v == null) return '—';
    try { return Number(v).toLocaleString('pt-BR',{style:'currency',currency:'BRL'}); } catch { return v; }
  }

  function defaultMonth(){
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`;
  }

  async function loadSummary(month){
    const url = `${SUMMARY_API}?month=${month}`;
    const resp = await fetch(url);
    if(!resp.ok) throw new Error('Falha ao carregar resumo');
    return resp.json();
  }

  function updateCards(summary){
    incomeEl.textContent = formatCurrency(summary.totalIncome);
    expenseEl.textContent = formatCurrency(summary.totalExpenses);
    netEl.textContent = formatCurrency(summary.netBalance);
    countEl.textContent = summary.totalTransactions;
    netEl.style.color = (summary.netBalance||0) >= 0 ? 'var(--success)' : 'var(--danger)';
  }

  function renderCategoryTable(breakdown){
    categoryTableBody.innerHTML = '';
    const total = breakdown.reduce((acc,b)=>acc + Number(b.amount||0),0);
    breakdown.forEach(cat => {
      const tr = document.createElement('tr');
      const perc = total > 0 ? (Number(cat.amount)/total*100).toFixed(1)+'%' : '—';
      tr.innerHTML = `<td>${cat.category}</td><td>${formatCurrency(cat.amount)}</td><td>${perc}</td>`;
      categoryTableBody.appendChild(tr);
    });
  }

  function renderCharts(summary){
    const ctxCat = document.getElementById('categoryChart').getContext('2d');
    const ctxIE = document.getElementById('incomeExpenseChart').getContext('2d');
    const labels = summary.categoryBreakdown.map(c=>c.category);
    const values = summary.categoryBreakdown.map(c=>Number(c.amount));
    if(categoryChart) categoryChart.destroy();
    categoryChart = new Chart(ctxCat, {
      type:'doughnut',
      data:{labels, datasets:[{data:values, backgroundColor: palette(values.length)}]},
      options:{plugins:{legend:{position:'bottom'}}}
    });
    if(incomeExpenseChart) incomeExpenseChart.destroy();
    incomeExpenseChart = new Chart(ctxIE, {
      type:'bar',
      data:{labels:['Receitas','Despesas','Saldo'], datasets:[{label:'Valores', data:[Number(summary.totalIncome||0), Number(summary.totalExpenses||0), Number(summary.netBalance||0)], backgroundColor:[ 'var(--success)','var(--danger)', Number(summary.netBalance||0)>=0?'var(--success)':'var(--danger)']}]},
      options:{scales:{y:{beginAtZero:true}}, plugins:{legend:{display:false}}}
    });
  }

  function palette(n){
    const base=['#2563eb','#0ea5e9','#6366f1','#f59e0b','#ef4444','#10b981','#8b5cf6','#ec4899','#14b8a6','#84cc16'];
    const out=[]; for(let i=0;i<n;i++){ out.push(base[i%base.length]); } return out;
  }

  async function refresh(){
    const month = monthInput.value || defaultMonth();
    try {
      const summary = await loadSummary(month);
      updateCards(summary);
      renderCategoryTable(summary.categoryBreakdown || []);
      renderCharts(summary);
    } catch (e){
      console.error(e);
      alert('Não foi possível carregar o dashboard.');
    }
  }

  monthInput.addEventListener('change', refresh);
  monthInput.value = defaultMonth();
  refresh();
})();
