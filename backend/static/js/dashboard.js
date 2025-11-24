/* Dashboard Logic — KPIs + Charts (Enhanced Version) */
$(function () {
  const $kpi = {
    total: $('#kpiTotal'),
    assigned: $('#kpiAssigned'),
    unassigned: $('#kpiUnassigned'),
    maint: $('#kpiMaint'),
    damaged: $('#kpiDamaged')
  };

  let barChart, doughnutChart;

  // ---- Load Summary ----
  async function loadSummary() {
    const res = await fetch(`${API}/dashboard/summary`);
    const json = await res.json();
    if (!res.ok) throw new Error(json.message || 'Failed to load summary.');
    const s = json.data || {};

    // Update KPI values (clean numbers only)
    $kpi.total.text(s.total_assets ?? 0);
    $kpi.assigned.text(s.assigned_assets ?? 0);
    $kpi.unassigned.text(s.unassigned_assets ?? 0);
    $kpi.maint.text(s.under_maintenance ?? 0);
    $kpi.damaged.text(s.damaged ?? 0);

    return s;
  }

  // ---- Load Category Data ----
  async function loadByCategory() {
    const res = await fetch(`${API}/dashboard/by-category`);
    const json = await res.json();
    if (!res.ok) throw new Error(json.message || 'Failed to load by-category.');
    return json.data || [];
  }

  // ---- Bar Chart: Assets by Category ----
  function renderBarByCategory(rows) {
    const labels = rows.map(r => r.category);
    const total       = rows.map(r => r.total ?? 0);
    const in_use      = rows.map(r => r.in_use ?? 0);
    const available   = rows.map(r => r.available ?? 0);
    const maintenance = rows.map(r => r.maintenance ?? 0);
    const damaged     = rows.map(r => r.damaged ?? 0);

    const ctx = document.getElementById('chartByCategory');
    if (barChart) barChart.destroy();

    barChart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels,
        datasets: [
          { label: 'Total',       data: total,       backgroundColor: '#007bff' },
          { label: 'In Use',      data: in_use,      backgroundColor: '#6610f2' },
          { label: 'Available',   data: available,   backgroundColor: '#28a745' },
          { label: 'Maintenance', data: maintenance, backgroundColor: '#ffc107' },
          { label: 'Damaged',     data: damaged,     backgroundColor: '#dc3545' }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'bottom',
            labels: { usePointStyle: true, boxWidth: 10, font: { size: 12 } }
          },
          title: { display: false }
        },
        scales: {
          x: { grid: { display: false } },
          y: { beginAtZero: true, ticks: { precision: 0 } }
        }
      }
    });
  }

  // ---- Doughnut Chart: Overall Status ----
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
      data: {
        labels,
        datasets: [{
          data,
          backgroundColor: ['#6610f2', '#28a745', '#ffc107', '#dc3545'],
          borderWidth: 1,
          hoverOffset: 6
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'bottom',
            labels: { usePointStyle: true, boxWidth: 12, font: { size: 12 } }
          },
          tooltip: {
            callbacks: {
              label: ctx => `${ctx.label}: ${ctx.parsed}`
            }
          }
        },
        cutout: '55%'
      }
    });
  }

  // ---- Refresh Dashboard ----
  async function refresh() {
    try {
      $('#btnRefresh').text('Refreshing...').prop('disabled', true);
      const [summary, byCat] = await Promise.all([loadSummary(), loadByCategory()]);
      renderBarByCategory(byCat);
      renderDoughnutFromSummary(summary);
    } catch (e) {
      Swal.fire('Error', e.message || 'Failed to load dashboard.', 'error');
    } finally {
      $('#btnRefresh').text('Refresh').prop('disabled', false);
    }
  }

  // ---- Bind Actions ----
  $('#btnRefresh').on('click', refresh);

  // ---- Initial Load ----
  refresh();
});
