<template>
  <div class="dependency-management">
    <h1>Gestión de Dispositivos</h1>

    <!-- Filtro y acciones -->
    <div class="actions">
      <input
        v-model="searchQuery"
        @keyup.enter="loadDevices(1)"
        type="text"
        class="form-control mb-2"
        placeholder="Buscar por nombre, IP o MAC..."
      />
      <button class="btn btn-add" @click="openCreateModal">
        <i class="bi bi-plus-circle"></i> Agregar Dispositivo
      </button>
      <button class="btn btn-edit" @click="loadDevices(currentPage)">
        <i class="bi bi-arrow-repeat"></i> Recargar
      </button>
    </div>

    <!-- Tabla -->
    <div class="table-container">
      <table>
        <thead>
          <tr>
            <th>#</th><th>Nombre</th><th>Propiedad</th><th>Estado</th><th>SO</th>
            <th>Marca</th><th>Modelo</th><th>CPU</th><th>Office</th><th>Asset Tag</th>
            <th>Printer Asset</th><th>Scanner Asset</th><th>RAM</th><th>HDD</th>
            <th>IP</th><th>MAC</th><th>Serial</th><th>AnyDesk</th><th>Operador</th>
            <th>Dependencia</th><th>Notas</th><th>Historial</th><th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="!devices.length">
            <td colspan="23">No se encontraron dispositivos.</td>
          </tr>
          <tr v-else v-for="(d,i) in devices" :key="d.id">
            <td>{{ (currentPage-1)*perPage + i + 1 }}</td>
            <td>{{ d.device_name }}</td>
            <td>{{ d.property || '—' }}</td>
            <td>
              <span :class="getStatusClass(d.status)">
                {{ d.status || '—' }}
              </span>
            </td>
            <td>{{ d.os || '—' }}</td>
            <td>{{ d.brand || '—' }}</td>
            <td>{{ d.model || '—' }}</td>
            <td>{{ d.cpu || '—' }}</td>
            <td>{{ d.office_package || '—' }}</td>
            <td>{{ d.asset_tag || '—' }}</td>
            <td>{{ d.printer_asset || '—' }}</td>
            <td>{{ d.scanner_asset || '—' }}</td>
            <td>{{ d.ram != null ? d.ram + ' GB' : '—' }}</td>
            <td>{{ d.hdd != null ? d.hdd + ' GB' : '—' }}</td>
            <td><code>{{ d.ip || '—' }}</code></td>
            <td><code>{{ d.mac || '—' }}</code></td>
            <td><code>{{ d.serial || '—' }}</code></td>
            <td>{{ d.anydesk || '—' }}</td>
            <td>{{ d.operator || '—' }}</td>
            <td>{{ d.dependency?.name || '—' }}</td>
            <td class="notes-cell" :title="d.notes">
              {{ d.notes ? (d.notes.length>20? d.notes.slice(0,20)+'…': d.notes) : '—' }}
            </td>
            <td class="notes-cell" :title="d.history">
              {{ d.history ? (d.history.length>20? d.history.slice(0,20)+'…': d.history) : '—' }}
            </td>
            <td class="action-buttons">
              <button class="btn btn-edit btn-sm" @click="editDevice(d)">
                <i class="bi bi-pencil"></i>
              </button>
              <button class="btn btn-delete btn-sm" @click="deleteDevice(d.id)">
                <i class="bi bi-trash"></i>
              </button>
              <button class="btn btn-view btn-sm" @click="viewDevice(d)">
                <i class="bi bi-eye"></i>
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Paginación -->
    <div class="pagination my-3">
      <button
        class="btn btn-secondary btn-sm"
        :disabled="currentPage===1"
        @click="loadDevices(currentPage-1)"
      ><i class="bi bi-arrow-left-circle"></i> Anterior</button>
      <span class="mx-2">Página {{currentPage}} de {{totalPages}}</span>
      <button
        class="btn btn-secondary btn-sm"
        :disabled="currentPage===totalPages"
        @click="loadDevices(currentPage+1)"
      >Siguiente <i class="bi bi-arrow-right-circle"></i></button>
    </div>

    <!-- Modal Crear/Editar -->
    <div class="modal" v-if="modalVisible">
      <div class="modal-content">
        <span class="close" @click="cancelForm">&times;</span>
        <h3>{{ form.id ? 'Editar Dispositivo' : 'Agregar Dispositivo' }}</h3>
        <form @submit.prevent="submitForm">
          <div class="form-row">
            <div class="form-group col"><label>Nombre*</label>
              <input v-model="form.device_name" type="text" required />
            </div>
            <div class="form-group col"><label>Dependencia*</label>
              <select v-model="form.dependency_id" required>
                <option value="">—</option>
                <option v-for="dep in dependenciesList" :key="dep.id" :value="dep.id">
                  {{ dep.name }}
                </option>
              </select>
            </div>
          </div>
          <div class="form-row">
            <div class="form-group col"><label>Propiedad</label>
              <input v-model="form.property" type="text" />
            </div>
            <div class="form-group col"><label>Estado</label>
              <input v-model="form.status" type="text" />
            </div>
          </div>
          <div class="form-row">
            <div class="form-group col"><label>SO</label>
              <input v-model="form.os" type="text" />
            </div>
            <div class="form-group col"><label>IP</label>
              <input v-model="form.ip" type="text" />
            </div>
          </div>
          <div class="form-row">
            <div class="form-group col"><label>MAC</label>
              <input v-model="form.mac" type="text" />
            </div>
            <div class="form-group col"><label>Serial</label>
              <input v-model="form.serial" type="text" />
            </div>
          </div>
          <div class="form-row">
            <div class="form-group col"><label>Marca</label>
              <input v-model="form.brand" type="text" />
            </div>
            <div class="form-group col"><label>Modelo</label>
              <input v-model="form.model" type="text" />
            </div>
          </div>
          <div class="form-row">
            <div class="form-group col"><label>CPU</label>
              <input v-model="form.cpu" type="text" />
            </div>
            <div class="form-group col"><label>Office Package</label>
              <input v-model="form.office_package" type="text" />
            </div>
          </div>
          <div class="form-row">
            <div class="form-group col"><label>Asset Tag</label>
              <input v-model="form.asset_tag" type="text" />
            </div>
            <div class="form-group col"><label>Printer Asset</label>
              <input v-model="form.printer_asset" type="text" />
            </div>
          </div>
          <div class="form-row">
            <div class="form-group col"><label>Scanner Asset</label>
              <input v-model="form.scanner_asset" type="text" />
            </div>
            <div class="form-group col"><label>RAM (GB)</label>
              <input v-model.number="form.ram" type="number" min="0" />
            </div>
          </div>
          <div class="form-row">
            <div class="form-group col"><label>HDD (GB)</label>
              <input v-model.number="form.hdd" type="number" min="0" />
            </div>
            <div class="form-group col"><label>AnyDesk</label>
              <input v-model="form.anydesk" type="text" />
            </div>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label>Notas</label>
              <textarea v-model="form.notes" rows="2"></textarea>
            </div>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label>Historial de mejoras</label>
              <textarea v-model="form.history" rows="2" placeholder="Teclado cambiado…"></textarea>
            </div>
          </div>
          <div class="form-actions">
            <button type="button" class="btn btn-cancel" @click="cancelForm">
              <i class="bi bi-x-circle"></i> Cancelar
            </button>
            <button type="submit" class="btn btn-submit">
              <i class="bi bi-check-circle"></i>
              {{ form.id ? 'Actualizar' : 'Guardar' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useApi } from '@/composables/use-api'
import Swal from 'sweetalert2'

const devices = ref([])
const dependenciesList = ref([])
const searchQuery = ref('')
const currentPage = ref(1)
const totalPages = ref(1)
const perPage = 10

const modalVisible = ref(false)
const form = ref({
  id: null,
  device_name: '',
  property: '',
  status: '',
  os: '',
  brand: '',
  model: '',
  cpu: '',
  office_package: '',
  asset_tag: '',
  printer_asset: '',
  scanner_asset: '',
  ram: null,
  hdd: null,
  ip: '',
  mac: '',
  serial: '',
  anydesk: '',
  operator: '',
  notes: '',
  history: '',
  dependency_id: '',
})

async function loadDevices(page = 1) {
  currentPage.value = page
  try {
    const resp = await useApi(
      `devices?page=${page}&per_page=${perPage}&search=${encodeURIComponent(searchQuery.value)}`
    )
    devices.value    = resp.data.data
    totalPages.value = resp.data.last_page
  } catch (e) {
    console.error(e)
    Swal.fire('Error', 'No se pudo cargar la lista', 'error')
  }
}

async function loadDependencies() {
  try {
    const resp = await useApi(`dependencies?per_page=100`)
    dependenciesList.value = resp.data.data
  } catch (e) {
    console.error('Dependencias:', e)
  }
}

function openCreateModal() {
  resetForm()
  modalVisible.value = true
}

function editDevice(dev) {
  form.value = { ...dev }
  modalVisible.value = true
}

async function submitForm() {
  const url    = form.value.id ? `devices/${form.value.id}` : 'devices'
  const method = form.value.id ? 'PUT' : 'POST'
  try {
    await useApi(url, method, form.value)
    Swal.fire('Éxito', 'Dispositivo guardado', 'success')
    cancelForm()
    loadDevices(currentPage.value)
  } catch (err) {
    const msg = err?.errors
      ? Object.values(err.errors).flat().join('<br>')
      : err.message || 'Error al guardar'
    Swal.fire({ icon: 'error', title: 'Error', html: msg })
  }
}

async function deleteDevice(id) {
  const { isConfirmed } = await Swal.fire({
    title: '¿Eliminar?',
    text: 'Esto no se puede deshacer',
    icon: 'warning',
    showCancelButton: true
  })
  if (!isConfirmed) return

  try {
    await useApi(`devices/${id}`, 'DELETE')
    Swal.fire('Eliminado','', 'success')
    loadDevices(currentPage.value)
  } catch {
    Swal.fire('Error','No se pudo eliminar','error')
  }
}

function viewDevice(d) {
  const html = `
    <div style="text-align:left; font-size: 14px;">
      <p><strong>Nombre:</strong> ${d.device_name}</p>
      <p><strong>Dependencia:</strong> ${d.dependency?.name || '–'}</p>
      <p><strong>Propiedad:</strong> ${d.property || '–'}</p>
      <p><strong>Estado:</strong> ${d.status || '–'}</p>
      <p><strong>Sistema Operativo:</strong> ${d.os || '–'}</p>
      <p><strong>Marca:</strong> ${d.brand || '–'}</p>
      <p><strong>Modelo:</strong> ${d.model || '–'}</p>
      <p><strong>CPU:</strong> ${d.cpu || '–'}</p>
      <p><strong>Office Package:</strong> ${d.office_package || '–'}</p>
      <p><strong>Asset Tag:</strong> ${d.asset_tag || '–'}</p>
      <p><strong>Printer Asset:</strong> ${d.printer_asset || '–'}</p>
      <p><strong>Scanner Asset:</strong> ${d.scanner_asset || '–'}</p>
      <p><strong>RAM:</strong> ${d.ram != null ? d.ram + ' GB' : '–'}</p>
      <p><strong>HDD:</strong> ${d.hdd != null ? d.hdd + ' GB' : '–'}</p>
      <p><strong>IP:</strong> ${d.ip || '–'}</p>
      <p><strong>MAC:</strong> ${d.mac || '–'}</p>
      <p><strong>Serial:</strong> ${d.serial || '–'}</p>
      <p><strong>AnyDesk:</strong> ${d.anydesk || '–'}</p>
      <p><strong>Operador:</strong> ${d.operator || '–'}</p>
      <p><strong>Notas:</strong><br/>${d.notes ? d.notes.replace(/\n/g,'<br/>') : '–'}</p>
      <p><strong>Historial de mejoras:</strong><br/>${d.history ? d.history.replace(/\n/g,'<br/>') : '–'}</p>
    </div>
  `;

  Swal.fire({
    title: 'Detalles del Dispositivo',
    html,
    width: '800px',
    showCloseButton: true,
    focusConfirm: false,
    confirmButtonText: 'Cerrar',
    customClass: {
      popup: 'device-details-modal'
    }
  });
}


function cancelForm() {
  modalVisible.value = false
  resetForm()
}

function resetForm() {
  form.value = {
    id: null, device_name: '', property: '', status: '',
    os: '', brand: '', model: '', cpu: '',
    office_package: '', asset_tag: '', printer_asset: '',
    scanner_asset: '', ram: null, hdd: null,
    ip: '', mac: '', serial: '', anydesk: '',
    operator: '', notes: '', history: '',
    dependency_id: '',
  }
}

function getStatusClass(status) {
  if (!status) return 'status-unknown'
  const s = status.toLowerCase()
  if (s.includes('activo')) return 'status-active'
  if (s.includes('mantenimiento')) return 'status-maintenance'
  if (s.includes('inactivo')) return 'status-inactive'
  return 'status-default'
}

onMounted(() => {
  loadDevices()
  loadDependencies()
})
</script>

<style scoped>
.dependency-management {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
}
.actions { margin-bottom:20px; }
.btn { padding:8px 16px; margin:3px; border:none; border-radius:6px; font-weight:bold; display:inline-flex; align-items:center; gap:8px; transition:background 0.3s; }
.btn-add { background:#C6D6A3; color:#333; }
.btn-edit { background:#a1c2f0; color:#fff; }
.btn-delete { background:#f28b82; color:#fff; }
.btn-cancel { background:#e0e0e0; color:#333; }
.btn-submit { background:#81c784; color:#fff; }
.table-container { overflow-x:auto; margin-top:20px; border:1px solid #ddd; border-radius:8px; }
table { width:100%; border-collapse:collapse; min-width:1800px; }
th,td { padding:8px; text-align:left; border-bottom:1px solid #ddd; font-size:12px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
th { background:#f8f9fa; position:sticky; top:0; z-index:10; }
tr:hover { background:#f5f5f5; }
.notes-cell { max-width:150px; cursor:help; font-size:11px; }
.status-active { color:#2e7d32; background:#e8f5e8; padding:2px 8px; border-radius:12px; font-size:11px; }
.status-inactive { color:#d32f2f; background:#ffebee; padding:2px 8px; border-radius:12px; font-size:11px; }
.status-maintenance { color:#f57c00; background:#fff3e0; padding:2px 8px; border-radius:12px; font-size:11px; }
.status-default { color:#757575; background:#f5f5f5; padding:2px 8px; border-radius:12px; font-size:11px; }
.status-unknown { color:#9e9e9e; font-style:italic; font-size:11px; }
.action-buttons { display:flex; gap:4px; justify-content:center; }
.action-buttons .btn { padding:4px 8px; font-size:11px; }
.modal { position:fixed; z-index:1000; inset:0; background:rgba(0,0,0,0.4); display:flex; justify-content:center; align-items:center; overflow-y:auto; }
.modal-content { background:#fff; padding:20px; border-radius:8px; width:900px; max-width:95%; max-height:90vh; overflow-y:auto; position:relative; margin:20px; }
.close { position:absolute; top:15px; right:20px; font-size:24px; cursor:pointer; color:#999; }
.form-row { display:flex; gap:20px; margin-bottom:15px; }
.form-group { flex:1; }
label { font-weight:bold; margin-bottom:5px; display:block; color:#333; }
input, select, textarea { width:100%; padding:8px; border:1px solid #ddd; border-radius:6px; font-size:14px; box-sizing:border-box; }
input:focus, select:focus, textarea:focus { outline:none; border-color:#a1c2f0; box-shadow:0 0 0 2px rgba(161,194,240,0.2); }
textarea { resize:vertical; min-height:80px; }
.form-actions { display:flex; justify-content:flex-end; gap:10px; margin-top:20px; padding-top:20px; border-top:1px solid #eee; }
@media (max-width:768px){
  .form-row{flex-direction:column;}
  .modal-content{width:95%; margin:10px; padding:15px;}
  th,td{padding:6px;font-size:10px;}
}
</style>
