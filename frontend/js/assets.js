// AMS Assets – full CRUD + filters + assign + CSV (fixed & optimized)
$(document).ready(function () {
  console.log("✅ assets.js loaded");

  const $rows = $('#assetRows');
  const $status = $('#fltAssetStatus');
  const $btnAdd = $('#btnAdd');
  const $btnExport = $('#btnExport');

  // ------- Helpers -------
  async function fetchJSON(url, opts) {
    const res = await fetch(url, opts);
    const json = await res.json().catch(() => ({}));
    if (!res.ok && json.message) throw new Error(json.message);
    return json;
  }

  async function fetchLocations() {
    try {
      const { data = [] } = await fetchJSON(`${API}/locations`);
      return data;
    } catch {
      return [];
    }
  }

  async function fetchEmployees() {
    try {
      const { data = [] } = await fetchJSON(`${API}/employees`);
      return data;
    } catch {
      return [];
    }
  }

  // ------- Renderer -------
  function render(items = []) {
    console.log("Rendering", items.length, "assets");
    $rows.empty();

    if (!items.length) {
      $rows.append(`<tr><td colspan="8" style="text-align:center;color:#888;">No assets found</td></tr>`);
      return;
    }

    for (const a of items) {
      $rows.append(`
        <tr data-id="${a.id}">
          <td>${a.id}</td>
          <td contenteditable="true" data-field="name">${a.name ?? ''}</td>
          <td contenteditable="true" data-field="category">${a.category ?? ''}</td>
          <td>${'' /* sub-category not in schema; keep blank for UI */}</td>
          <td contenteditable="true" data-field="location_id">${a.location_id ?? ''}</td>
          <td>
            <select data-field="status" class="statusSel">
              ${['available','in_use','maintenance','damaged'].map(s => `
                <option value="${s}" ${a.status === s ? 'selected' : ''}>${s.replace('_',' ')}</option>
              `).join('')}
            </select>
          </td>
          <td contenteditable="true" data-field="assigned_to">${a.assigned_to ?? ''}</td>
          <td class="actions">
            <button class="save">Save</button>
            <button class="assign">Assign</button>
            <button class="del">Delete</button>
          </td>
        </tr>
      `);
    }
  }

  // ------- Load Assets -------
  async function loadAssets() {
    console.log("🚀 Loading assets...");
    try {
      const params = new URLSearchParams();
      const status = $status.val();
      if (status) params.set('status', status);

      const url = `${API}/assets${params.toString() ? `?${params.toString()}` : ''}`;
      console.log("Fetching from:", url);

      const { data = [] } = await fetchJSON(url);
      console.log("Received assets:", data);
      render(data);
    } catch (e) {
      console.error("❌ loadAssets error:", e);
      Swal.fire('Error', e.message || 'Failed to load assets', 'error');
    }
  }

  // ------- Filters -------
  $status.on('change', loadAssets);

  // ------- CSV Export -------
  $btnExport.on('click', () => {
    const rows = [];
    $('#tblAssets tr').each(function () {
      const cols = [];
      $(this).find('th,td').each(function () {
        cols.push(`"${($(this).text() || '').replace(/"/g, '""')}"`);
      });
      rows.push(cols.join(','));
    });
    const blob = new Blob([rows.join('\n')], { type: 'text/csv' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `assets-export-${Date.now()}.csv`;
    a.click();
  });

// ------- Add Asset (Enhanced Admin UI) -------
$btnAdd.on('click', async () => {
  const locs = await fetchLocations();
  const emps = await fetchEmployees();

  const locOpts = locs.map(l => `<option value="${l.id}">${l.name}</option>`).join('');
  const empOpts = emps.map(e => `<option value="${e.id}">${e.name}</option>`).join('');

  const html = `
  <style>
    .asset-grid {
      display:grid;
      grid-template-columns:1fr 1fr;
      gap:14px 18px;
      text-align:left;
      font-size:14px;
      margin-top:10px;
    }
    .asset-grid label {
      font-weight:600;
      color:#333;
      display:block;
      margin-bottom:4px;
    }
    .asset-grid input, 
    .asset-grid select, 
    .asset-grid textarea {
      width:100%;
      padding:8px 10px;
      border:1px solid #ccc;
      border-radius:6px;
      font-family:inherit;
      font-size:13.5px;
      box-sizing:border-box;
    }
    .asset-grid textarea {height:70px;resize:vertical;}
    .section-title {
      grid-column:1/-1;
      margin-top:12px;
      font-weight:700;
      color:#0052cc;
      border-bottom:2px solid #e0e0e0;
      padding-bottom:3px;
    }
    @media(max-width:600px){.asset-grid{grid-template-columns:1fr}}
  </style>

  <div class="asset-grid">

    <div class="section-title">General Information</div>
    <div>
      <label>Asset / PO Name *</label>
      <input id="a_name" placeholder="e.g. Laptop Procurement">
    </div>
    <div>
      <label>Asset / PO No</label>
      <input id="a_po" placeholder="PO-12345">
    </div>

    <div>
      <label>Category</label>
      <select id="a_category">
        <option value="Hardware">Hardware</option>
        <option value="Software">Software</option>
        <option value="Furniture">Furniture</option>
        <option value="Vehicle">Vehicle</option>
        <option value="Other">Other</option>
      </select>
    </div>
    <div>
      <label>Sub Category</label>
      <input id="a_sub" placeholder="e.g. Laptop, Chair">
    </div>

    <div>
      <label>Asset Model *</label>
      <input id="a_model" placeholder="e.g. Dell Latitude 5420">
    </div>
    <div>
      <label>Requested By</label>
      <select id="a_requested">
        <option value="">(None)</option>${empOpts}
      </select>
    </div>

    <div class="section-title">Acquisition & Vendor</div>
    <div>
      <label>Acquisition Date</label>
      <input id="a_acquired" type="date">
    </div>
    <div>
      <label>Cost (PKR)</label>
      <input id="a_cost" type="number" placeholder="Amount">
    </div>

    <div>
      <label>Vendor Name</label>
      <input id="a_vendor" placeholder="Vendor Company">
    </div>
    <div>
      <label>Vendor SPOC</label>
      <input id="a_vendor_spoc" placeholder="Contact Person">
    </div>

    <div>
      <label>Vendor Email</label>
      <input id="a_vendor_email" type="email" placeholder="contact@example.com">
    </div>
    <div>
      <label>Status</label>
      <select id="a_status">
        <option value="available">Available</option>
        <option value="in_use">In Use</option>
        <option value="maintenance">Maintenance</option>
        <option value="damaged">Damaged</option>
      </select>
    </div>

    <div class="section-title">Assignment & Notes</div>
    <div>
      <label>Location</label>
      <select id="a_loc">
        <option value="">(No location)</option>${locOpts}
      </select>
    </div>
    <div>
      <label>Assigned To</label>
      <select id="a_assigned">
        <option value="">(Not assigned)</option>${empOpts}
      </select>
    </div>

    <div style="grid-column:1/-1">
      <label>Notes / Description</label>
      <textarea id="a_notes" placeholder="Any additional details"></textarea>
    </div>
  </div>
  `;

  const r = await Swal.fire({
    title: 'Add New Asset',
    html,
    width: 720,
    showCancelButton: true,
    confirmButtonText: 'Save Asset',
    focusConfirm: false,
    customClass: { popup: 'swal-wide' },
    preConfirm: () => ({
      name: $('#a_name').val().trim(),
      po_number: $('#a_po').val().trim() || null,
      category: $('#a_category').val(),
      sub_category: $('#a_sub').val().trim() || null,
      model: $('#a_model').val().trim() || null,
      requested_by: $('#a_requested').val() || null,
      purchase_date: $('#a_acquired').val() || null,
      vendor: $('#a_vendor').val().trim() || null,
      vendor_spoc: $('#a_vendor_spoc').val().trim() || null,
      vendor_email: $('#a_vendor_email').val().trim() || null,
      cost: $('#a_cost').val().trim() || null,
      status: $('#a_status').val(),
      location_id: $('#a_loc').val() || null,
      assigned_to: $('#a_assigned').val() || null,
      notes: $('#a_notes').val().trim() || null
    })
  });

  if (!r.isConfirmed) return;

  const payload = r.value;
  if (!payload.name || !payload.model) {
    return Swal.fire('Validation', 'Asset Name and Model are required.', 'info');
  }

  try {
    await fetchJSON(`${API}/assets`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    await loadAssets();
    Swal.fire('Created', 'Asset added successfully.', 'success');
  } catch (e) {
    Swal.fire('Error', e.message || 'Create failed', 'error');
  }
});


  // ------- Inline Save -------
  $rows.on('click', '.save', async function () {
    const $tr = $(this).closest('tr');
    const id = $tr.data('id');
    const payload = {};

    $tr.find('[contenteditable]').each(function () {
      payload[$(this).data('field')] = $(this).text().trim() || null;
    });
    payload.status = $tr.find('.statusSel').val();

    try {
      await fetchJSON(`${API}/assets/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      Swal.fire('Saved', 'Asset updated.', 'success');
    } catch (e) {
      Swal.fire('Error', e.message || 'Update failed', 'error');
    }
  });

  // ------- Assign to Employee -------
  $rows.on('click', '.assign', async function () {
    const id = $(this).closest('tr').data('id');
    const emps = await fetchEmployees();
    if (!emps.length) return Swal.fire('No employees', 'Add employees first.', 'info');

    const options = emps.map(e => `<option value="${e.id}">${e.id} — ${e.name}</option>`).join('');
    const r = await Swal.fire({
      title: 'Assign to Employee',
      html: `<select id="emp_pick" class="swal2-select">${options}</select>`,
      showCancelButton: true
    });
    if (!r.isConfirmed) return;

    const empId = Number($('#emp_pick').val());
    try {
      await fetchJSON(`${API}/assets/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ assigned_to: empId, status: 'in_use' })
      });
      await loadAssets();
      Swal.fire('Assigned', 'Asset assigned successfully.', 'success');
    } catch (e) {
      Swal.fire('Error', e.message || 'Assign failed', 'error');
    }
  });

  // ------- Delete Asset -------
  $rows.on('click', '.del', async function () {
    const id = $(this).closest('tr').data('id');
    const go = await Swal.fire({ title: 'Delete?', icon: 'warning', showCancelButton: true });
    if (!go.isConfirmed) return;

    try {
      await fetchJSON(`${API}/assets/${id}`, { method: 'DELETE' });
      await loadAssets();
      Swal.fire('Deleted', 'Asset removed.', 'success');
    } catch (e) {
      Swal.fire('Error', e.message || 'Delete failed', 'error');
    }
  });

  // ------- Initial Load -------
  // Ensure dropdown starts empty (no filter)
  $status.val('');
  loadAssets();
});
