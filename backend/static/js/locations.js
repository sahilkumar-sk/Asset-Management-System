// AMS Locations – full CRUD + filters + add modal + CSV export
$(function () {
  const $rows = $('#locRows');
  const $fltName = $('#fltName');
  const $fltFloor = $('#fltFloor');
  const $fltRoom = $('#fltRoom');
  const $btnAdd = $('#btnAdd');
  const $btnExport = $('#btnExport');

  async function fetchJSON(url, opts) {
    const res = await fetch(url, opts);
    const json = await res.json().catch(() => ({}));
    if (!res.ok && json.message) throw new Error(json.message);
    return json;
  }

  const T = (v) => (v ?? '');

  function rowHTML(r) {
    return `
      <tr data-id="${r.id}">
        <td>${r.id}</td>
        <td contenteditable="true" data-field="name">${T(r.name)}</td>
        <td contenteditable="true" data-field="address">${T(r.address)}</td>
        <td contenteditable="true" data-field="floor">${T(r.floor)}</td>
        <td contenteditable="true" data-field="room">${T(r.room)}</td>
        <td class="actions">
          <button class="btn-view view"     title="View"><i class="fa-solid fa-eye"></i></button>
          <button class="btn-edit edit"     title="Edit"><i class="fa-solid fa-pen-to-square"></i></button>
          <button class="btn-assign assign" title="Assign"><i class="fa-solid fa-user-check"></i></button>
          <button class="btn-delete del"    title="Delete"><i class="fa-solid fa-trash"></i></button>
        </td>
      </tr>
    `;
  }

  function render(items = []) {
    $rows.empty();
    for (const r of items) $rows.append(rowHTML(r));
  }

  async function loadLocations() {
    const { data = [] } = await fetchJSON(`${API}/locations?t=${Date.now()}`);
    const name = $fltName.val().toLowerCase();
    const floor = $fltFloor.val().toLowerCase();
    const room = $fltRoom.val().toLowerCase();

    // Apply client-side filters
    const filtered = data.filter(r =>
      (!name || (r.name || '').toLowerCase().includes(name)) &&
      (!floor || (r.floor || '').toLowerCase().includes(floor)) &&
      (!room || (r.room || '').toLowerCase().includes(room))
    );

    render(filtered);
  }

  // Filter triggers reload
  $fltName.on('input', loadLocations);
  $fltFloor.on('input', loadLocations);
  $fltRoom.on('input', loadLocations);

  // CSV Export
  $btnExport.on('click', () => {
    const rows = [];
    $('#tblLocations tr').each(function () {
      const cols = [];
      $(this).find('th,td').each(function () {
        cols.push(`"${($(this).text() || '').replace(/"/g, '""')}"`);
      });
      rows.push(cols.join(','));
    });
    const blob = new Blob([rows.join('\n')], { type: 'text/csv' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `locations-export-${Date.now()}.csv`;
    a.click();
  });

  // Add New (SweetAlert modal)
  $btnAdd.on('click', async () => {
    const html = `
      <input id="l_name" class="swal2-input" placeholder="Location Name *">
      <input id="l_address" class="swal2-input" placeholder="Address">
      <input id="l_floor" class="swal2-input" placeholder="Floor">
      <input id="l_room" class="swal2-input" placeholder="Room">
    `;
    const r = await Swal.fire({
      title: 'Add Location',
      html,
      focusConfirm: false,
      showCancelButton: true,
      preConfirm: () => ({
        name: $('#l_name').val().trim(),
        address: $('#l_address').val().trim() || null,
        floor: $('#l_floor').val().trim() || null,
        room: $('#l_room').val().trim() || null
      })
    });
    if (!r.isConfirmed) return;
    const payload = r.value;
    if (!payload.name) return Swal.fire('Validation', 'Name is required.', 'info');

    try {
      await fetchJSON(`${API}/locations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      await loadLocations();
      Swal.fire('Created', 'Location added successfully.', 'success');
    } catch (e) {
      Swal.fire('Error', e.message || 'Create failed', 'error');
    }
  });

  // Inline Save
  $rows.on('click', '.save', async function () {
    const $tr = $(this).closest('tr');
    const id = $tr.data('id');
    const payload = {};
    $tr.find('[contenteditable]').each(function () {
      payload[$(this).data('field')] = $(this).text().trim() || null;
    });

    try {
      await fetchJSON(`${API}/locations/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      Swal.fire('Saved', 'Location updated.', 'success');
    } catch (e) {
      Swal.fire('Error', e.message || 'Update failed', 'error');
    }
  });

  // Delete
  $rows.on('click', '.del', async function () {
    const id = $(this).closest('tr').data('id');
    const go = await Swal.fire({ title: 'Delete?', icon: 'warning', showCancelButton: true });
    if (!go.isConfirmed) return;
    try {
      await fetchJSON(`${API}/locations/${id}`, { method: 'DELETE' });
      await loadLocations();
      Swal.fire('Deleted', 'Location removed.', 'success');
    } catch (e) {
      Swal.fire('Error', e.message || 'Delete failed', 'error');
    }
  });

  // Initial load
  loadLocations();
});
s