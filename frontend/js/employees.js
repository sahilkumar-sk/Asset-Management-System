// AMS Employees – full CRUD + filters + CSV export
$(document).ready(function () {
  console.log("✅ employees.js loaded");

  const $rows = $('#empRows');
  const $form = $('#empForm');
  const $btnExport = $('<button class="btn-secondary" id="btnExport" type="button">Export</button>');
  $('.filters-bar .actions').append($btnExport);

  // -------- Helpers --------
  async function fetchJSON(url, opts) {
    const res = await fetch(url, opts);
    const json = await res.json().catch(() => ({}));
    if (!res.ok && json.message) throw new Error(json.message);
    return json;
  }

  function T(v) { return v ?? ''; }

  // -------- Render Table --------
  function render(items = []) {
    console.log("Rendering employees:", items.length);
    $rows.empty();
    if (!items.length) {
      $rows.append('<tr><td colspan="9" style="text-align:center;color:#888;">No employees found</td></tr>');
      return;
    }
    for (const e of items) {
      $rows.append(`
        <tr data-id="${e.id}">
          <td>${e.id}</td>
          <td contenteditable="true" data-field="name">${T(e.name)}</td>
          <td contenteditable="true" data-field="department">${T(e.department)}</td>
          <td contenteditable="true" data-field="location_id">${T(e.location_id)}</td>
          <td>
            <select data-field="status" class="statusSel">
              <option value="active" ${e.status === 'active' ? 'selected' : ''}>active</option>
              <option value="inactive" ${e.status === 'inactive' ? 'selected' : ''}>inactive</option>
            </select>
          </td>
          <td contenteditable="true" data-field="email">${T(e.email)}</td>
          <td contenteditable="true" data-field="phone">${T(e.phone)}</td>
          <td>${e.assigned_count ?? 0}</td>
          <td class="actions">
            <button class="save">Save</button>
            <button class="del">Delete</button>
          </td>
        </tr>
      `);
    }
  }

  // -------- Load Employees --------
  async function loadEmployees() {
    console.log("🚀 Loading employees...");
    try {
      const { data = [] } = await fetchJSON(`${API}/employees`);
      render(data);
    } catch (e) {
      console.error("❌ loadEmployees error:", e);
      Swal.fire('Error', e.message || 'Failed to load employees', 'error');
    }
  }

  // -------- Add Employee --------
  $form.on('submit', async function (e) {
    e.preventDefault();
    const fd = new FormData(this);
    const payload = Object.fromEntries(fd.entries());
    if (!payload.name?.trim()) return Swal.fire('Validation', 'Name is required.', 'info');
    for (const k in payload) if (payload[k]?.trim() === '') payload[k] = null;

    try {
      await fetchJSON(`${API}/employees`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      this.reset();
      Swal.fire('Created', 'Employee added successfully.', 'success');
      await loadEmployees();
    } catch (e) {
      Swal.fire('Error', e.message || 'Create failed', 'error');
    }
  });

  // -------- Inline Save --------
  $rows.on('click', '.save', async function () {
    const $tr = $(this).closest('tr');
    const id = $tr.data('id');
    const payload = {};
    $tr.find('[contenteditable]').each(function () {
      payload[$(this).data('field')] = $(this).text().trim() || null;
    });
    payload.status = $tr.find('.statusSel').val();

    try {
      await fetchJSON(`${API}/employees/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      Swal.fire('Saved', 'Employee updated.', 'success');
    } catch (e) {
      Swal.fire('Error', e.message || 'Update failed', 'error');
    }
  });

  // -------- Delete --------
  $rows.on('click', '.del', async function () {
    const id = $(this).closest('tr').data('id');
    const go = await Swal.fire({ title: 'Delete?', text: 'This cannot be undone.', icon: 'warning', showCancelButton: true });
    if (!go.isConfirmed) return;

    try {
      await fetchJSON(`${API}/employees/${id}`, { method: 'DELETE' });
      Swal.fire('Deleted', 'Employee removed.', 'success');
      await loadEmployees();
    } catch (e) {
      Swal.fire('Error', e.message || 'Delete failed', 'error');
    }
  });

  // -------- Export to CSV --------
  $btnExport.on('click', () => {
    const rows = [];
    $('#tblEmployees tr').each(function () {
      const cols = [];
      $(this).find('th,td').each(function () {
        cols.push(`"${($(this).text() || '').replace(/"/g, '""')}"`);
      });
      rows.push(cols.join(','));
    });
    const blob = new Blob([rows.join('\n')], { type: 'text/csv' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `employees-export-${Date.now()}.csv`;
    a.click();
  });

  // -------- Initial Load --------
  loadEmployees();
});
