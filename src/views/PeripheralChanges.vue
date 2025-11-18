<template>
  <div class="peripheral-changes-management">
    <h1>Historial de Cambios de Periféricos</h1>

    <!-- Filtro y acciones -->
    <div class="actions">
      <input
        v-model="searchQuery"
        @keyup.enter="loadChanges(1)"
        type="text"
        class="form-control mb-2"
        placeholder="Buscar cambios..."
      />
      <select v-model="filterType" @change="loadChanges(1)" class="form-control mb-2">
        <option value="">Todos los tipos</option>
        <option value="ram">RAM</option>
        <option value="hdd">HDD</option>
        <option value="ssd">SSD</option>
        <option value="teclado">Teclado</option>
        <option value="mouse">Mouse</option>
        <option value="monitor">Monitor</option>
        <option value="impresora">Impresora</option>
        <option value="escaner">Escáner</option>
        <option value="otro">Otro</option>
      </select>
      <button class="btn btn-add" @click="openCreateModal">
        <i class="bi bi-plus-circle"></i> Registrar Cambio
      </button>
      <button class="btn btn-edit" @click="loadChanges(currentPage)">
        <i class="bi bi-arrow-repeat"></i> Recargar
      </button>
      <button class="btn btn-view" @click="viewStats">
        <i class="bi bi-bar-chart"></i> Estadísticas
      </button>
    </div>

    <!-- Tabla -->
    <div class="table-container">
      <table>
        <thead>
          <tr>
            <th>#</th>
            <th>Dispositivo</th>
            <th>Fecha</th>
            <th>Tipo de Cambio</th>
            <th>Componente</th>
            <th>Valor Anterior</th>
            <th>Valor Nuevo</th>
            <th>Razón</th>
            <th>Costo</th>
            <th>Técnico</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="!changes.length">
            <td colspan="11">No se encontraron cambios registrados.</td>
          </tr>
          <tr v-else v-for="(c, i) in changes" :key="c.id">
            <td>{{ (currentPage - 1) * perPage + i + 1 }}</td>
            <td>
              <strong>{{ c.device?.device_name || '—' }}</strong>
            </td>
            <td>{{ formatDate(c.change_date) }}</td>
            <td>
              <span class="type-badge" :class="getTypeClass(c.change_type)">
                {{ c.change_type ? c.change_type.toUpperCase() : '—' }}
              </span>
            </td>
            <td>{{ c.component_name || '—' }}</td>
            <td><code>{{ c.old_value || '—' }}</code></td>
            <td><code>{{ c.new_value || '—' }}</code></td>
            <td class="notes-cell" :title="c.reason">
              {{ c.reason ? (c.reason.length > 30 ? c.reason.slice(0, 30) + '…' : c.reason) : '—' }}
            </td>
            <td>{{ c.cost ? '$' + c.cost : '—' }}</td>
            <td>{{ c.technician || '—' }}</td>
            <td class="action-buttons">
              <button class="btn btn-edit btn-sm" @click="editChange(c)">
                <i class="bi bi-pencil"></i>
              </button>
              <button class="btn btn-delete btn-sm" @click="deleteChange(c.id)">
                <i class="bi bi-trash"></i>
              </button>
              <button class="btn btn-view btn-sm" @click="viewChange(c)">
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
        :disabled="currentPage === 1"
        @click="loadChanges(currentPage - 1)"
      >
        <i class="bi bi-arrow-left-circle"></i> Anterior
      </button>
      <span class="mx-2">Página {{ currentPage }} de {{ totalPages }}</span>
      <button
        class="btn btn-secondary btn-sm"
        :disabled="currentPage === totalPages"
        @click="loadChanges(currentPage + 1)"
      >
        Siguiente <i class="bi bi-arrow-right-circle"></i>
      </button>
    </div>

    <!-- Modal Crear/Editar -->
    <div class="modal" v-if="modalVisible">
      <div class="modal-content">
        <span class="close" @click="cancelForm">&times;</span>
        <h3>{{ form.id ? 'Editar Cambio' : 'Registrar Cambio' }}</h3>
        <form @submit.prevent="submitForm">
          <div class="form-row">
            <div class="form-group col">
              <label>Dispositivo*</label>
              <select v-model="form.device_id" required>
                <option value="">Seleccionar</option>
                <option v-for="device in devicesList" :key="device.id" :value="device.id">
                  {{ device.device_name }}
                </option>
              </select>
            </div>
            <div class="form-group col">
              <label>Fecha de Cambio*</label>
              <input v-model="form.change_date" type="date" required />
            </div>
          </div>
          <div class="form-row">
            <div class="form-group col">
              <label>Tipo de Cambio*</label>
              <select v-model="form.change_type" required>
                <option value="">Seleccionar</option>
                <option value="ram">RAM</option>
                <option value="hdd">HDD</option>
                <option value="ssd">SSD</option>
                <option value="teclado">Teclado</option>
                <option value="mouse">Mouse</option>
                <option value="monitor">Monitor</option>
                <option value="impresora">Impresora</option>
                <option value="escaner">Escáner</option>
                <option value="otro">Otro</option>
              </select>
            </div>
            <div class="form-group col">
              <label>Nombre del Componente*</label>
              <input v-model="form.component_name" type="text" required placeholder="Ej: Kingston DDR4 16GB" />
            </div>
          </div>
          <div class="form-row">
            <div class="form-group col">
              <label>Valor Anterior</label>
              <input v-model="form.old_value" type="text" placeholder="Ej: 8GB" />
            </div>
            <div class="form-group col">
              <label>Valor Nuevo*</label>
              <input v-model="form.new_value" type="text" required placeholder="Ej: 16GB" />
            </div>
          </div>
          <div class="form-row">
            <div class="form-group col">
              <label>Técnico</label>
              <input v-model="form.technician" type="text" />
            </div>
            <div class="form-group col">
              <label>Costo</label>
              <input v-model.number="form.cost" type="number" step="0.01" min="0" />
            </div>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label>Proveedor</label>
              <input v-model="form.supplier" type="text" />
            </div>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label>Razón del Cambio</label>
              <textarea v-model="form.reason" rows="3" placeholder="Describe por qué se realizó el cambio..."></textarea>
            </div>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label>Notas Adicionales</label>
              <textarea v-model="form.notes" rows="2"></textarea>
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

const changes = ref([])
const devicesList = ref([])
const searchQuery = ref('')
const filterType = ref('')
const currentPage = ref(1)
const totalPages = ref(1)
const perPage = 10

const modalVisible = ref(false)
const form = ref({
  id: null,
  device_id: '',
  change_date: '',
  change_type: '',
  component_name: '',
  old_value: '',
  new_value: '',
  reason: '',
  cost: null,
  supplier: '',
  technician: '',
  notes: ''
})

async function loadChanges(page = 1) {
  currentPage.value = page
  try {
    let url = `peripheral-changes?page=${page}&per_page=${perPage}`
    if (searchQuery.value) url += `&search=${encodeURIComponent(searchQuery.value)}`
    if (filterType.value) url += `&change_type=${filterType.value}`

    const resp = await useApi(url)
    changes.value = resp.data.data
    totalPages.value = resp.data.last_page
  } catch (e) {
    console.error(e)
    Swal.fire('Error', 'No se pudo cargar la lista', 'error')
  }
}

async function loadDevices() {
  try {
    const resp = await useApi('devices?per_page=100')
    devicesList.value = resp.data.data
  } catch (e) {
    console.error('Dispositivos:', e)
  }
}

function formatDate(date) {
  if (!date) return '—'
  return new Date(date).toLocaleDateString('es-ES')
}

function getTypeClass(type) {
  const classes = {
    ram: 'type-ram',
    hdd: 'type-hdd',
    ssd: 'type-ssd',
    teclado: 'type-keyboard',
    mouse: 'type-mouse',
    monitor: 'type-monitor',
    impresora: 'type-printer',
    escaner: 'type-scanner',
    otro: 'type-other'
  }
  return classes[type] || 'type-default'
}

function openCreateModal() {
  resetForm()
  modalVisible.value = true
}

function editChange(change) {
  form.value = {
    id: change.id,
    device_id: change.device_id,
    change_date: change.change_date,
    change_type: change.change_type,
    component_name: change.component_name,
    old_value: change.old_value,
    new_value: change.new_value,
    reason: change.reason,
    cost: change.cost,
    supplier: change.supplier,
    technician: change.technician,
    notes: change.notes
  }
  modalVisible.value = true
}

async function submitForm() {
  const url = form.value.id ? `peripheral-changes/${form.value.id}` : 'peripheral-changes'
  const method = form.value.id ? 'PUT' : 'POST'

  try {
    await useApi(url, method, form.value)
    Swal.fire('Éxito', 'Cambio registrado correctamente', 'success')
    cancelForm()
    loadChanges(currentPage.value)
  } catch (err) {
    const msg = err?.errors
      ? Object.values(err.errors).flat().join('<br>')
      : err.message || 'Error al guardar'
    Swal.fire({ icon: 'error', title: 'Error', html: msg })
  }
}

async function deleteChange(id) {
  const { isConfirmed } = await Swal.fire({
    title: '¿Eliminar?',
    text: 'Esto no se puede deshacer',
    icon: 'warning',
    showCancelButton: true
  })
  if (!isConfirmed) return

  try {
    await useApi(`peripheral-changes/${id}`, 'DELETE')
    Swal.fire('Eliminado', '', 'success')
    loadChanges(currentPage.value)
  } catch {
    Swal.fire('Error', 'No se pudo eliminar', 'error')
  }
}

function viewChange(c) {
  const html = `
    <div style="text-align:left; font-size: 14px;">
      <p><strong>Dispositivo:</strong> ${c.device?.device_name || '—'}</p>
      <p><strong>Fecha:</strong> ${formatDate(c.change_date)}</p>
      <p><strong>Tipo de Cambio:</strong> ${c.change_type ? c.change_type.toUpperCase() : '—'}</p>
      <p><strong>Componente:</strong> ${c.component_name || '—'}</p>
      <p><strong>Valor Anterior:</strong> ${c.old_value || '—'}</p>
      <p><strong>Valor Nuevo:</strong> ${c.new_value || '—'}</p>
      <p><strong>Razón:</strong><br/>${c.reason ? c.reason.replace(/\n/g, '<br/>') : '—'}</p>
      <p><strong>Costo:</strong> ${c.cost ? '$' + c.cost : '—'}</p>
      <p><strong>Proveedor:</strong> ${c.supplier || '—'}</p>
      <p><strong>Técnico:</strong> ${c.technician || '—'}</p>
      <p><strong>Notas:</strong><br/>${c.notes ? c.notes.replace(/\n/g, '<br/>') : '—'}</p>
    </div>
  `

  Swal.fire({
    title: 'Detalles del Cambio',
    html,
    width: '800px',
    showCloseButton: true,
    focusConfirm: false,
    confirmButtonText: 'Cerrar'
  })
}

async function viewStats() {
  try {
    const resp = await useApi('peripheral-changes-stats')
    const stats = resp.data

    const html = `
      <div style="text-align:left; font-size: 14px;">
        <h4>Estadísticas Generales</h4>
        <p><strong>Total de Cambios:</strong> ${stats.total_changes || 0}</p>
        <p><strong>Costo Total:</strong> $${stats.total_cost || 0}</p>
        <hr/>
        <h4>Por Tipo de Cambio</h4>
        <ul>
          ${stats.by_type ? stats.by_type.map(t => `<li><strong>${t.change_type.toUpperCase()}:</strong> ${t.count} cambios ($${t.total_cost || 0})</li>`).join('') : '<li>Sin datos</li>'}
        </ul>
        <hr/>
        <h4>Por Dispositivo (Top 5)</h4>
        <ul>
          ${stats.by_device ? stats.by_device.slice(0, 5).map(d => `<li><strong>${d.device?.device_name || 'Sin nombre'}:</strong> ${d.count} cambios</li>`).join('') : '<li>Sin datos</li>'}
        </ul>
      </div>
    `

    Swal.fire({
      title: 'Estadísticas de Cambios',
      html,
      width: '900px',
      showCloseButton: true,
      focusConfirm: false,
      confirmButtonText: 'Cerrar'
    })
  } catch (e) {
    console.error(e)
    Swal.fire('Error', 'No se pudieron cargar las estadísticas', 'error')
  }
}

function cancelForm() {
  modalVisible.value = false
  resetForm()
}

function resetForm() {
  form.value = {
    id: null,
    device_id: '',
    change_date: '',
    change_type: '',
    component_name: '',
    old_value: '',
    new_value: '',
    reason: '',
    cost: null,
    supplier: '',
    technician: '',
    notes: ''
  }
}

onMounted(() => {
  loadChanges()
  loadDevices()
})
</script>

<style scoped>
.peripheral-changes-management {
  padding: 20px;
  max-width: 1600px;
  margin: 0 auto;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}
.actions {
  margin-bottom: 20px;
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}
.actions .form-control {
  flex: 1;
  min-width: 200px;
}
.btn {
  padding: 8px 16px;
  margin: 3px;
  border: none;
  border-radius: 6px;
  font-weight: bold;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  transition: background 0.3s;
  cursor: pointer;
}
.btn-add {
  background: #c6d6a3;
  color: #333;
}
.btn-edit {
  background: #a1c2f0;
  color: #fff;
}
.btn-delete {
  background: #f28b82;
  color: #fff;
}
.btn-cancel {
  background: #e0e0e0;
  color: #333;
}
.btn-submit {
  background: #81c784;
  color: #fff;
}
.btn-view {
  background: #ffd54f;
  color: #333;
}
.table-container {
  overflow-x: auto;
  margin-top: 20px;
  border: 1px solid #ddd;
  border-radius: 8px;
}
table {
  width: 100%;
  border-collapse: collapse;
  min-width: 1400px;
}
th,
td {
  padding: 10px;
  text-align: left;
  border-bottom: 1px solid #ddd;
  font-size: 13px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
th {
  background: #f8f9fa;
  position: sticky;
  top: 0;
  z-index: 10;
}
tr:hover {
  background: #f5f5f5;
}
.notes-cell {
  max-width: 200px;
  cursor: help;
  font-size: 12px;
}
.type-badge {
  padding: 3px 10px;
  border-radius: 12px;
  font-size: 11px;
  font-weight: bold;
}
.type-ram {
  background: #e1bee7;
  color: #4a148c;
}
.type-hdd {
  background: #ffccbc;
  color: #bf360c;
}
.type-ssd {
  background: #b3e5fc;
  color: #01579b;
}
.type-keyboard {
  background: #c5e1a5;
  color: #33691e;
}
.type-mouse {
  background: #f8bbd0;
  color: #880e4f;
}
.type-monitor {
  background: #b2dfdb;
  color: #004d40;
}
.type-printer {
  background: #ffe0b2;
  color: #e65100;
}
.type-scanner {
  background: #d1c4e9;
  color: #311b92;
}
.type-other {
  background: #f5f5f5;
  color: #616161;
}
.type-default {
  background: #e0e0e0;
  color: #424242;
}
.action-buttons {
  display: flex;
  gap: 4px;
  justify-content: center;
}
.action-buttons .btn {
  padding: 4px 8px;
  font-size: 11px;
}
.modal {
  position: fixed;
  z-index: 1000;
  inset: 0;
  background: rgba(0, 0, 0, 0.4);
  display: flex;
  justify-content: center;
  align-items: center;
  overflow-y: auto;
}
.modal-content {
  background: #fff;
  padding: 20px;
  border-radius: 8px;
  width: 900px;
  max-width: 95%;
  max-height: 90vh;
  overflow-y: auto;
  position: relative;
  margin: 20px;
}
.close {
  position: absolute;
  top: 15px;
  right: 20px;
  font-size: 24px;
  cursor: pointer;
  color: #999;
}
.form-row {
  display: flex;
  gap: 20px;
  margin-bottom: 15px;
}
.form-group {
  flex: 1;
}
label {
  font-weight: bold;
  margin-bottom: 5px;
  display: block;
  color: #333;
}
input,
select,
textarea {
  width: 100%;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 14px;
  box-sizing: border-box;
}
input:focus,
select:focus,
textarea:focus {
  outline: none;
  border-color: #a1c2f0;
  box-shadow: 0 0 0 2px rgba(161, 194, 240, 0.2);
}
textarea {
  resize: vertical;
  min-height: 80px;
}
.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid #eee;
}
@media (max-width: 768px) {
  .form-row {
    flex-direction: column;
  }
  .modal-content {
    width: 95%;
    margin: 10px;
    padding: 15px;
  }
  th,
  td {
    padding: 6px;
    font-size: 10px;
  }
}
</style>
