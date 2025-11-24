// AMS Employees – full CRUD + view/edit modals + assign + CSV + "Add" modal (no inline edit)
$(document).ready(function () {
  console.log("employees.js loaded");

  const $rows     = $('#empRows');
  const $btnAdd   = $('#btnAdd');
  const $btnExport = $('<button class="btn-secondary" id="btnExport" type="button">Export</button>');
  $('.filters-bar .actions').append($btnExport);

  // -------- Helpers --------
  async function fetchJSON(url, opts) {
    const res = await fetch(url, opts);
    const json = await res.json().catch(() => ({}));
    if (!res.ok && json.message) throw new Error(json.message);
    return json;
  }

  const T = v => v ?? '';

  function escapeHtml(str) {
    return String(str ?? '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function formatStatus(s) {
    return s === 'active' ? 'Active' :
           s === 'inactive' ? 'Inactive' :
           (s || '');
  }

  // -------- Render Table (no inline edit) --------
  function render(items = []) {
    $rows.empty();

    if (!items.length) {
      $rows.append('<tr><td colspan="9" style="text-align:center;color:#888;">No employees found</td></tr>');
      return;
    }

    for (const e of items) {
      const row = $(`
        <tr data-id="${e.id}">
          <td>${e.id}</td>
          <td>${escapeHtml(e.name)}</td>
          <td>${escapeHtml(e.department)}</td>
          <td>${T(e.location_id)}</td>
          <td>
            <span class="emp-status-${e.status || 'unknown'} status-badge">
              ${formatStatus(e.status)}
            </span>
          </td>
          <td>${escapeHtml(e.email)}</td>
          <td>${escapeHtml(e.phone)}</td>
          <td>${e.assigned_count ?? 0}</td>
          <td class="actions">
            <button class="btn-view view"     title="View"><i class="fa-solid fa-eye"></i></button>
            <button class="btn-edit edit"     title="Edit"><i class="fa-solid fa-pen-to-square"></i></button>
            <button class="btn-assign assign" title="Assign asset"><i class="fa-solid fa-user-check"></i></button>
            <button class="btn-delete del"    title="Delete"><i class="fa-solid fa-trash"></i></button>
          </td>
        </tr>
      `);

      row.data('emp', e);      // keep full object on row
      $rows.append(row);
    }
  }

  // -------- Load Employees --------
  async function loadEmployees() {
    try {
      const { data = [] } = await fetchJSON(`${API}/employees`);
      render(data);
    } catch (e) {
      Swal.fire('Error', e.message || 'Failed to load employees', 'error');
    }
  }

  // -------- Add Employee via SweetAlert modal --------
  $btnAdd.on('click', async () => {
    const html = `
      <style>
        .emp-add-grid {
          display:grid;
          grid-template-columns:1fr 1fr;
          gap:14px 18px;
          text-align:left;
          font-size:14px;
          margin-top:10px;
        }
        .emp-add-grid label {
          font-weight:600;
          color:#333;
          display:block;
          margin-bottom:4px;
        }
        .emp-add-grid input,
        .emp-add-grid select {
          width:100%;
          padding:8px 10px;
          border:1px solid #ccc;
          border-radius:6px;
          font-family:inherit;
          font-size:13.5px;
          box-sizing:border-box;
        }
        @media(max-width:600px){
          .emp-add-grid{grid-template-columns:1fr}
        }
      </style>

      <div class="emp-add-grid">
        <div>
          <label>Name *</label>
          <input id="n_name" placeholder="Employee Name">
        </div>
        <div>
          <label>Department</label>
          <input id="n_dept" placeholder="e.g. IT, Finance">
        </div>

        <div>
          <label>Email</label>
          <input id="n_email" type="email" placeholder="name@example.com">
        </div>
        <div>
          <label>Phone</label>
          <input id="n_phone" placeholder="Phone number">
        </div>

        <div>
          <label>Location ID</label>
          <input id="n_location" placeholder="e.g. 3">
        </div>
        <div>
          <label>Status</label>
          <select id="n_status">
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
      </div>
    `;

    const r = await Swal.fire({
      title: 'Add Employee',
      html,
      width: 650,
      showCancelButton: true,
      confirmButtonText: 'Save',
      focusConfirm: false,
      preConfirm: () => {
        const name = $('#n_name').val().trim();
        if (!name) {
          Swal.showValidationMessage('Name is required');
          return false;
        }
        return {
          name,
          department: $('#n_dept').val().trim() || null,
          email: $('#n_email').val().trim() || null,
          phone: $('#n_phone').val().trim() || null,
          location_id: $('#n_location').val().trim() || null,
          status: $('#n_status').val()
        };
      }
    });

    if (!r.isConfirmed) return;
    const payload = r.value;

    try {
      await fetchJSON(`${API}/employees`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      Swal.fire('Created', 'Employee added successfully.', 'success');
      await loadEmployees();
    } catch (e) {
      Swal.fire('Error', e.message || 'Create failed', 'error');
    }
  });

  // -------- View Employee --------
  $rows.on('click', '.view', function () {
    const emp = $(this).closest('tr').data('emp');
    if (!emp) return;

    Swal.fire({
      title: `Employee #${emp.id}`,
      html: `
        <div style="text-align:left;font-size:14px;">
          <p><strong>Name:</strong> ${escapeHtml(emp.name) || '-'}</p>
          <p><strong>Department:</strong> ${escapeHtml(emp.department) || '-'}</p>
          <p><strong>Location ID:</strong> ${emp.location_id ?? '-'}</p>
          <p><strong>Status:</strong> ${formatStatus(emp.status) || '-'}</p>
          <p><strong>Email:</strong> ${escapeHtml(emp.email) || '-'}</p>
          <p><strong>Phone:</strong> ${escapeHtml(emp.phone) || '-'}</p>
          <p><strong>Assigned Assets:</strong> ${emp.assigned_count ?? 0}</p>
        </div>
      `,
      width: 500,
      showCloseButton: true,
      confirmButtonText: 'Close'
    });
  });

  // -------- Edit Employee (orange button, no inline edit) --------
  $rows.on('click', '.edit', async function () {
    const emp = $(this).closest('tr').data('emp');
    if (!emp) return;

    const html = `
      <style>
        .emp-edit-grid {
          display:grid;
          grid-template-columns:1fr 1fr;
          gap:12px 16px;
          text-align:left;
          font-size:14px;
          margin-top:10px;
        }
        .emp-edit-grid label {
          font-weight:600;
          color:#333;
          display:block;
          margin-bottom:4px;
        }
        .emp-edit-grid input,
        .emp-edit-grid select {
          width:100%;
          padding:7px 9px;
          border-radius:6px;
          border:1px solid #d1d5db;
          font-size:13px;
          box-sizing:border-box;
        }
        @media(max-width:600px){.emp-edit-grid{grid-template-columns:1fr}}
      </style>

      <div class="emp-edit-grid">
        <div>
          <label>Name</label>
          <input id="e_name" value="${escapeHtml(emp.name)}" />
        </div>
        <div>
          <label>Department</label>
          <input id="e_dept" value="${escapeHtml(emp.department || '')}" />
        </div>
        <div>
          <label>Location ID</label>
          <input id="e_loc" value="${emp.location_id ?? ''}" />
        </div>
        <div>
          <label>Status</label>
          <select id="e_status">
            <option value="active"   ${emp.status === 'active' ? 'selected' : ''}>Active</option>
            <option value="inactive" ${emp.status === 'inactive' ? 'selected' : ''}>Inactive</option>
          </select>
        </div>
        <div>
          <label>Email</label>
          <input id="e_email" value="${escapeHtml(emp.email || '')}" />
        </div>
        <div>
          <label>Phone</label>
          <input id="e_phone" value="${escapeHtml(emp.phone || '')}" />
        </div>
      </div>
    `;

    const r = await Swal.fire({
      title: `Edit Employee #${emp.id}`,
      html,
      width: 650,
      showCancelButton: true,
      confirmButtonText: 'Save',
      focusConfirm: false,
      preConfirm: () => {
        const name = $('#e_name').val().trim();
        if (!name) {
          Swal.showValidationMessage('Name is required');
          return false;
        }
        return {
          name,
          department: $('#e_dept').val().trim() || null,
          location_id: $('#e_loc').val().trim() || null,
          status: $('#e_status').val(),
          email: $('#e_email').val().trim() || null,
          phone: $('#e_phone').val().trim() || null
        };
      }
    });

    if (!r.isConfirmed) return;
    const payload = r.value;

    try {
      await fetchJSON(`${API}/employees/${emp.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      Swal.fire('Saved', 'Employee updated.', 'success');
      await loadEmployees();
    } catch (e) {
      Swal.fire('Error', e.message || 'Update failed', 'error');
    }
  });

  // -------- Assign Asset to Employee --------
  $rows.on('click', '.assign', async function () {
    const emp = $(this).closest('tr').data('emp');
    if (!emp) return;

    try {
      const { data: assets = [] } = await fetchJSON(`${API}/assets`);
      const available = assets.filter(a => !a.assigned_to);

      if (!available.length) {
        return Swal.fire('No Assets', 'All assets are already assigned.', 'info');
      }

      const options = available
        .map(a => `<option value="${a.id}">${a.id} — ${escapeHtml(a.name)}</option>`)
        .join('');

      const r = await Swal.fire({
        title: `Assign Asset to ${escapeHtml(emp.name)}`,
        html: `<select id="asset_pick" class="swal2-select">${options}</select>`,
        showCancelButton: true,
        confirmButtonText: 'Assign'
      });
      if (!r.isConfirmed) return;

      const assetId = Number($('#asset_pick').val());

      await fetchJSON(`${API}/assets/${assetId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ assigned_to: emp.id, status: 'in_use' })
      });

      Swal.fire('Assigned', 'Asset assigned successfully.', 'success');
      await loadEmployees();
    } catch (e) {
      Swal.fire('Error', e.message || 'Assign failed', 'error');
    }
  });

  // -------- Delete Employee --------
  $rows.on('click', '.del', async function () {
    const emp = $(this).closest('tr').data('emp');
    if (!emp) return;

    const go = await Swal.fire({
      title: 'Delete Employee?',
      text: `Employee #${emp.id} – ${emp.name}`,
      icon: 'warning',
      showCancelButton: true
    });
    if (!go.isConfirmed) return;

    try {
      await fetchJSON(`${API}/employees/${emp.id}`, { method: 'DELETE' });
      Swal.fire('Deleted', 'Employee removed.', 'success');
      await loadEmployees();
    } catch (e) {
      Swal.fire('Error', e.message || 'Delete failed', 'error');
    }
  });

  // -------- CSV Export --------
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
