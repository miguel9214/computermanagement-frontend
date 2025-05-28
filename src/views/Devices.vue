<template>
  <div class="dependency-management">
    <h1>Gestión de Dispositivos</h1>

    <div class="actions">
      <button class="btn btn-add" @click="openCreateModal">
        <i class="fas fa-plus"></i> Agregar Dispositivo
      </button>
      <button class="btn btn-edit" @click="loadDevices">
        <i class="fas fa-sync-alt"></i> Recargar
      </button>
    </div>

    <div class="table-container">
      <table>
        <thead>
          <tr>
            <th>#</th>
            <th>Nombre</th>
            <th>Propiedad</th>
            <th>Estado</th>
            <th>SO</th>
            <th>Marca</th>
            <th>Modelo</th>
            <th>CPU</th>
            <th>Office</th>
            <th>Activo fijo</th>
            <th>RAM (GB)</th>
            <th>HDD (GB)</th>
            <th>IP</th>
            <th>MAC</th>
            <th>Serial</th>
            <th>AnyDesk</th>
            <th>Operador</th>
            <th>Dependencia</th>
            <th>Notas</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="!devices.length">
            <td colspan="20">No se encontraron dispositivos.</td>
          </tr>
          <tr v-else v-for="(device, index) in devices" :key="device.id">
            <td>{{ index + 1 }}</td>
            <td>{{ device.device_name }}</td>
            <td>{{ device.property || '-' }}</td>
            <td>
              <span :class="getStatusClass(device.status)">
                {{ device.status || 'Sin estado' }}
              </span>
            </td>
            <td>{{ device.os || '-' }}</td>
            <td>{{ device.brand || '-' }}</td>
            <td>{{ device.model || '-' }}</td>
            <td>{{ device.cpu || '-' }}</td>
            <td>{{ device.office_package || '-' }}</td>
            <td>{{ device.asset_tag || '-' }}</td>
            <td>{{ device.ram || '-' }}</td>
            <td>{{ device.hdd || '-' }}</td>
            <td>
              <span class="ip-address">{{ device.ip || '-' }}</span>
            </td>
            <td>
              <code class="mac-address">{{ device.mac || '-' }}</code>
            </td>
            <td>
              <code class="serial-number">{{ device.serial || '-' }}</code>
            </td>
            <td>{{ device.anydesk || '-' }}</td>
            <td>{{ device.operator || '-' }}</td>
            <td>
              <span class="dependency-badge">
                {{ device.dependency?.name || 'Sin asignar' }}
              </span>
            </td>
            <td>
              <div class="notes-cell" :title="device.notes">
                {{ device.notes ? (device.notes.length > 30 ? device.notes.substring(0, 30) + '...' : device.notes) : '-' }}
              </div>
            </td>
            <td>
              <div class="action-buttons">
                <button @click="editDevice(device)" class="btn btn-edit" title="Editar dispositivo">
                  <i class="fas fa-edit"></i>
                </button>
                <button @click="deleteDevice(device.id)" class="btn btn-delete" title="Eliminar dispositivo">
                  <i class="fas fa-trash"></i>
                </button>
                <button @click="viewDevice(device)" class="btn btn-view" title="Ver detalles">
                  <i class="fas fa-eye"></i>
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Modal para agregar o editar -->
    <div v-if="showAddModal" class="modal">
      <div class="modal-content">
        <span class="close" @click="cancelForm">&times;</span>
        <h3>{{ form.id ? 'Editar Dispositivo' : 'Agregar Dispositivo' }}</h3>

        <div class="form-row">
          <div class="form-group col">
            <label>Nombre del dispositivo *</label>
            <input v-model="form.device_name" type="text" required />
          </div>

          <div class="form-group col">
            <label>Dependencia *</label>
            <select v-model="form.dependency_id" required>
              <option value="">Seleccionar dependencia</option>
              <option v-for="dep in dependencies" :key="dep.id" :value="dep.id">
                {{ dep.name }}
              </option>
            </select>
          </div>
        </div>

        <div class="form-row">
          <div class="form-group col">
            <label>Sistema Operativo</label>
            <input v-model="form.os" type="text" />
          </div>

          <div class="form-group col">
            <label>IP</label>
            <input v-model="form.ip" type="text" />
          </div>
        </div>

        <div class="form-row">
          <div class="form-group col">
            <label>Propiedad</label>
            <input v-model="form.property" type="text" />
          </div>

          <div class="form-group col">
            <label>Estado</label>
            <input v-model="form.status" type="text" />
          </div>
        </div>

        <div class="form-row">
          <div class="form-group col">
            <label>Marca</label>
            <input v-model="form.brand" type="text" />
          </div>

          <div class="form-group col">
            <label>Modelo</label>
            <input v-model="form.model" type="text" />
          </div>
        </div>

        <div class="form-row">
          <div class="form-group col">
            <label>CPU</label>
            <input v-model="form.cpu" type="text" />
          </div>

          <div class="form-group col">
            <label>Paquete Office</label>
            <input v-model="form.office_package" type="text" />
          </div>
        </div>

        <div class="form-row">
          <div class="form-group col">
            <label>RAM (GB)</label>
            <input v-model="form.ram" type="number" min="0" />
          </div>

          <div class="form-group col">
            <label>HDD (GB)</label>
            <input v-model="form.hdd" type="number" min="0" />
          </div>
        </div>

        <div class="form-row">
          <div class="form-group col">
            <label>MAC</label>
            <input v-model="form.mac" type="text" />
          </div>

          <div class="form-group col">
            <label>Serial</label>
            <input v-model="form.serial" type="text" />
          </div>
        </div>

        <div class="form-row">
          <div class="form-group col">
            <label>AnyDesk</label>
            <input v-model="form.anydesk" type="text" />
          </div>

          <div class="form-group col">
            <label>Operador</label>
            <input v-model="form.operator" type="text" />
          </div>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label>Notas</label>
            <textarea v-model="form.notes" rows="3"></textarea>
          </div>
        </div>

        <div class="form-actions">
          <button type="button" class="btn btn-cancel" @click="cancelForm">
            <i class="fas fa-times"></i> Cancelar
          </button>
          <button type="button" class="btn btn-submit" @click="submitForm">
            <i class="fas fa-check"></i> {{ form.id ? 'Actualizar' : 'Guardar' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useApi } from '@/composables/use-api'
import Swal from 'sweetalert2'

const devices = ref([])
const dependencies = ref([])
const showAddModal = ref(false)
const form = ref({
  id: '',
  dependency_id: '',
  device_name: '',
  os: '',
  ip: '',
  property: '',
  status: '',
  brand: '',
  model: '',
  cpu: '',
  office_package: '',
  asset_tag: '',
  printer_asset: '',
  scanner_asset: '',
  ram: '',
  hdd: '',
  mac: '',
  serial: '',
  anydesk: '',
  operator: '',
  notes: '',
})

const loadDevices = async () => {
  try {
    const response = await useApi('devices')
    devices.value = response.data
  } catch (error) {
    console.error('Error al cargar dispositivos:', error)
    Swal.fire('Error', 'No se pudieron cargar los dispositivos', 'error')
  }
}

const loadDependencies = async () => {
  try {
    const response = await useApi('dependencies')
    dependencies.value = response.data.data // Ajustar según la estructura de tu API
  } catch (error) {
    console.error('Error al cargar dependencias:', error)
  }
}

const openCreateModal = () => {
  resetForm()
  showAddModal.value = true
}

const submitForm = async () => {
  if (!form.value.device_name || !form.value.dependency_id) {
    Swal.fire('Error', 'El nombre del dispositivo y la dependencia son obligatorios', 'error')
    return
  }

  try {
    const method = form.value.id ? 'PUT' : 'POST'
    const url = form.value.id ? `devices/${form.value.id}` : 'devices'
    
    // Limpiar valores vacíos
    const formData = { ...form.value }
    Object.keys(formData).forEach(key => {
      if (formData[key] === '') {
        formData[key] = null
      }
    })

    await useApi(url, method, formData)
    Swal.fire('Éxito', 'Dispositivo guardado correctamente', 'success')
    cancelForm()
    loadDevices()
  } catch (error) {
    console.error('Error al guardar dispositivo:', error)
    const msg = error?.errors
      ? Object.values(error.errors).flat().join('<br>')
      : error.message || 'Error al guardar el dispositivo'
    Swal.fire({ icon: 'error', title: 'Error', html: msg })
  }
}

const editDevice = (device) => {
  form.value = { ...device }
  showAddModal.value = true
}

const deleteDevice = async (id) => {
  const confirmDelete = await Swal.fire({
    title: '¿Estás seguro?',
    text: 'Este dispositivo se eliminará permanentemente.',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'Sí, eliminar',
    cancelButtonText: 'Cancelar',
  })

  if (confirmDelete.isConfirmed) {
    try {
      await useApi(`devices/${id}`, 'DELETE')
      Swal.fire('Eliminado', 'Dispositivo eliminado correctamente', 'success')
      loadDevices()
    } catch (error) {
      console.error('Error al eliminar dispositivo:', error)
      Swal.fire('Error', 'No se pudo eliminar el dispositivo', 'error')
    }
  }
}

const viewDevice = (device) => {
  const deviceInfo = `
    <div style="text-align: left; max-height: 400px; overflow-y: auto;">
      <h4 style="color: #333; margin-bottom: 15px;">${device.device_name}</h4>
      
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 15px;">
        <div><strong>Propiedad:</strong> ${device.property || 'No especificada'}</div>
        <div><strong>Estado:</strong> ${device.status || 'Sin estado'}</div>
        <div><strong>Sistema Operativo:</strong> ${device.os || 'No especificado'}</div>
        <div><strong>Marca:</strong> ${device.brand || 'No especificada'}</div>
        <div><strong>Modelo:</strong> ${device.model || 'No especificado'}</div>
        <div><strong>CPU:</strong> ${device.cpu || 'No especificado'}</div>
        <div><strong>Office:</strong> ${device.office_package || 'No instalado'}</div>
        <div><strong>Asset Tag:</strong> ${device.asset_tag || 'No asignado'}</div>
        <div><strong>RAM:</strong> ${device.ram ? device.ram + ' GB' : 'No especificada'}</div>
        <div><strong>HDD:</strong> ${device.hdd ? device.hdd + ' GB' : 'No especificado'}</div>
        <div><strong>IP:</strong> ${device.ip || 'No asignada'}</div>
        <div><strong>MAC:</strong> ${device.mac || 'No especificada'}</div>
        <div><strong>Serial:</strong> ${device.serial || 'No especificado'}</div>
        <div><strong>AnyDesk:</strong> ${device.anydesk || 'No configurado'}</div>
        <div><strong>Operador:</strong> ${device.operator || 'No asignado'}</div>
        <div><strong>Dependencia:</strong> ${device.dependency?.name || 'Sin asignar'}</div>
      </div>
      
      ${device.notes ? `
        <div style="margin-top: 15px; padding: 10px; background-color: #f9f9f9; border-radius: 5px;">
          <strong>Notas:</strong><br>
          ${device.notes}
        </div>
      ` : ''}
    </div>
  `

  Swal.fire({
    title: 'Detalles del Dispositivo',
    html: deviceInfo,
    icon: 'info',
    confirmButtonText: 'Cerrar',
    width: '800px',
    customClass: {
      popup: 'device-details-modal'
    }
  })
}

const getStatusClass = (status) => {
  if (!status) return 'status-unknown'
  
  const statusLower = status.toLowerCase()
  if (statusLower.includes('activo') || statusLower.includes('funcionando')) return 'status-active'
  if (statusLower.includes('inactivo') || statusLower.includes('apagado')) return 'status-inactive'
  if (statusLower.includes('mantenimiento') || statusLower.includes('reparación')) return 'status-maintenance'
  if (statusLower.includes('dañado') || statusLower.includes('error')) return 'status-damaged'
  
  return 'status-default'
}

const cancelForm = () => {
  resetForm()
  showAddModal.value = false
}

const resetForm = () => {
  form.value = {
    id: '',
    dependency_id: '',
    device_name: '',
    os: '',
    ip: '',
    property: '',
    status: '',
    brand: '',
    model: '',
    cpu: '',
    office_package: '',
    asset_tag: '',
    printer_asset: '',
    scanner_asset: '',
    ram: '',
    hdd: '',
    mac: '',
    serial: '',
    anydesk: '',
    operator: '',
    notes: '',
  }
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
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
}

h1 {
  color: #3c3c3c;
  margin-bottom: 20px;
}

.actions {
  margin-bottom: 20px;
}

.btn {
  padding: 8px 16px;
  margin: 3px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: bold;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  transition: background-color 0.3s ease;
}

.btn-add {
  background-color: #C6D6A3;
  color: #333;
}

.btn-add:hover {
  background-color: #B2C691;
}

.btn-edit {
  background-color: #a1c2f0;
  color: #fff;
}

.btn-edit:hover {
  background-color: #89b4eb;
}

.btn-delete {
  background-color: #f28b82;
  color: white;
}

.btn-delete:hover {
  background-color: #e57373;
}

.btn-cancel {
  background-color: #e0e0e0;
  color: #333;
}

.btn-submit {
  background-color: #81c784;
  color: white;
}

.btn-submit:hover {
  background-color: #66bb6a;
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
  background-color: #fff;
  min-width: 1800px; /* Ancho mínimo para acomodar todas las columnas */
}

th, td {
  padding: 8px 6px;
  text-align: left;
  border-bottom: 1px solid #ddd;
  font-size: 12px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 120px;
}

th {
  background-color: #f8f9fa;
  font-weight: bold;
  position: sticky;
  top: 0;
  z-index: 10;
}

tr:hover {
  background-color: #f5f5f5;
}

/* Estilos para diferentes tipos de datos */
.ip-address {
  font-family: 'Courier New', monospace;
  background-color: #e3f2fd;
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 11px;
}

.mac-address, .serial-number {
  font-family: 'Courier New', monospace;
  background-color: #f3e5f5;
  padding: 2px 4px;
  border-radius: 3px;
  font-size: 10px;
  display: inline-block;
}

.dependency-badge {
  background-color: #e8f5e8;
  color: #2e7d32;
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 500;
}

.notes-cell {
  max-width: 150px;
  cursor: help;
  font-size: 11px;
}

/* Estilos para estados */
.status-active {
  color: #2e7d32;
  background-color: #e8f5e8;
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 500;
}

.status-inactive {
  color: #d32f2f;
  background-color: #ffebee;
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 500;
}

.status-maintenance {
  color: #f57c00;
  background-color: #fff3e0;
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 500;
}

.status-damaged {
  color: #c62828;
  background-color: #ffebee;
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 500;
}

.status-default {
  color: #757575;
  background-color: #f5f5f5;
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 500;
}

.status-unknown {
  color: #9e9e9e;
  font-style: italic;
  font-size: 11px;
}

/* Botones de acción compactos */
.action-buttons {
  display: flex;
  gap: 4px;
  justify-content: center;
}

.action-buttons .btn {
  padding: 4px 8px;
  font-size: 11px;
  min-width: auto;
}

.action-buttons .btn i {
  margin: 0;
  font-size: 12px;
}

.btn-view {
  background-color: #6c757d;
  color: white;
}

.btn-view:hover {
  background-color: #5a6268;
}

.modal {
  position: fixed;
  z-index: 1000;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0,0,0,0.4);
  display: flex;
  justify-content: center;
  align-items: center;
  overflow-y: auto;
}

.modal-content {
  background-color: #fff;
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

.close:hover {
  color: #333;
}

.form-row {
  display: flex;
  gap: 20px;
  margin-bottom: 15px;
}

.form-group {
  flex: 1;
}

.form-group.col {
  flex: 1;
}

.form-group label {
  display: block;
  font-weight: bold;
  margin-bottom: 5px;
  color: #333;
}

input, select, textarea {
  width: 100%;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 14px;
  box-sizing: border-box;
}

input:focus, select:focus, textarea:focus {
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

/* Responsive */
@media (max-width: 768px) {
  .form-row {
    flex-direction: column;
  }
  
  .modal-content {
    width: 95%;
    margin: 10px;
    padding: 15px;
  }
  
  .table-container {
    font-size: 10px;
  }
  
  th, td {
    padding: 6px 4px;
    font-size: 10px;
  }
  
  .action-buttons {
    flex-direction: column;
  }
}

/* Estilo para el modal de detalles */
:global(.device-details-modal) {
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

:global(.device-details-modal .swal2-html-container) {
  text-align: left !important;
}

/* Estilo para scrollbar en la tabla */
.table-container::-webkit-scrollbar {
  height: 8px;
}

.table-container::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 4px;
}

.table-container::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 4px;
}

.table-container::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}
</style>