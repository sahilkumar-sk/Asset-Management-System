/* Dashboard logic — KPIs + 2 charts */
$(function () {
  const $kpi = {
    total: $('#kpiTotal'),
    assigned: $('#kpiAssigned'),
    unassigned: $('#kpiUnassigned'),
    maint: $('#kpiMaint'),
    damaged: $('#kpiDamaged')
  };

  let barChart, doughnutChart;

  // ---- Data loaders ----
  async function loadSummary() {
    const res = await fetch(`${API}/dashboard/summary`);
    const json = await res.json();
    if (!res.ok) throw new Error(json.message || 'Failed to load summary.');
    const s = json.data || {};

    // KPIs
    $kpi.total.text(`Total: ${s.total_assets ?? 0}`);
    $kpi.assigned.text(`Assigned: ${s.assigned_assets ?? 0}`);
    $kpi.unassigned.text(`Unassigned: ${s.unassigned_assets ?? 0}`);
    $kpi.maint.text(`Maintenance: ${s.under_maintenance ?? 0}`);
    $kpi.damaged.text(`Damaged: ${s.damaged ?? 0}`);

    return s;
  }

  async function loadByCategory() {
    const res = await fetch(`${API}/dashboard/by-category`);
    const json = await res.json();
    if (!res.ok) throw new Error(json.message || 'Failed to load by-category.');
    return json.data || [];
  }

  // ---- Charts ----
  function renderBarByCategory(rows) {
    const labels = rows.map(r => r.category);
    const total      = rows.map(r => r.total ?? 0);
    const in_use     = rows.map(r => r.in_use ?? 0);
    const available  = rows.map(r => r.available ?? 0);
    const maintenance= rows.map(r => r.maintenance ?? 0);
    const damaged    = rows.map(r => r.damaged ?? 0);

    const ctx = document.getElementById('chartByCategory');
    if (barChart) barChart.destroy();
    barChart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels,
        datasets: [
          { label: 'Total',       data: total },
          { label: 'In Use',      data: in_use },
          { label: 'Available',   data: available },
          { label: 'Maintenance', data: maintenance },
          { label: 'Damaged',     data: damaged }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        aspectRatio: 1.8,
        plugins: { legend: { position: 'top' } },
        scales: { y: { beginAtZero: true, ticks: { precision: 0 } } }
      }
    });
  }

  function renderDoughnutFromSummary(summary) {
    const data = [
      summary.assigned_assets ?? 0,
      summary.unassigned_assets ?? 0,
      summary.under_maintenance ?? 0,
      summary.damaged ?? 0
    ];
    const labels = ['Assigned', 'Unassigned', 'Maintenance', 'Damaged'];

    const ctx = document.getElementById('chartStatus');
    if (doughnutChart) doughnutChart.destroy();
    doughnutChart = new Chart(ctx, {
      type: 'doughnut',
      data: { labels, datasets: [{ data }] },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        aspectRatio: 1.2,
        plugins: { legend: { position: 'bottom' } },
        cutout: '55%'
      }
    });
  }

  // ---- Orchestration ----
  async function refresh() {
    try {
      const [summary, byCat] = await Promise.all([loadSummary(), loadByCategory()]);
      renderBarByCategory(byCat);
      renderDoughnutFromSummary(summary);
    } catch (e) {
      alert(e.message || 'Failed to load dashboard.');
    }
  }

  $('#btnRefresh').on('click', refresh);
  refresh();
});
