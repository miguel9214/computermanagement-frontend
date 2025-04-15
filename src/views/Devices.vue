<template>
  <div class="dependency-management">
    <h1>Gestión de Dispositivos</h1>

    <div class="actions">
      <button class="btn btn-add" @click="showAddModal = true">
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
            <th>Nombre</th>
            <th>Sistema Operativo</th>
            <th>IP</th>
            <th>Dependencia</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="d in devices" :key="d.id">
            <td>{{ d.device_name }}</td>
            <td>{{ d.os }}</td>
            <td>{{ d.ip }}</td>
            <td>{{ d.dependency?.name }}</td>
            <td>
              <button @click="editDevice(d)" class="btn btn-edit">Editar</button>
              <button @click="deleteDevice(d.id)" class="btn btn-delete">Eliminar</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Modal para agregar o editar -->
    <div v-if="showAddModal" class="modal">
      <div class="modal-content">
        <span class="close" @click="showAddModal = false">&times;</span>
        <h3>{{ form.id ? 'Editar Dispositivo' : 'Agregar Dispositivo' }}</h3>

        <div class="form-row">
          <div class="form-group col">
            <label>Nombre del dispositivo</label>
            <input v-model="form.device_name" type="text" />
          </div>

          <div class="form-group col">
            <label>Sistema Operativo</label>
            <input v-model="form.os" type="text" />
          </div>
        </div>

        <div class="form-row">
          <div class="form-group col">
            <label>IP</label>
            <input v-model="form.ip" type="text" />
          </div>

          <div class="form-group col">
            <label>ID de dependencia</label>
            <input v-model="form.dependency_id" type="number" />
          </div>
        </div>

        <div class="form-row">
          <div class="form-group col">
            <label>Propiedad</label>
            <input v-model="form.property" type="text" />
          </div>

          <div class="form-group col">
            <label>Marca</label>
            <input v-model="form.brand" type="text" />
          </div>
        </div>

        <div class="form-row">
          <div class="form-group col">
            <label>Modelo</label>
            <input v-model="form.model" type="text" />
          </div>

          <div class="form-group col">
            <label>RAM</label>
            <input v-model="form.ram" type="number" />
          </div>
        </div>

        <div class="form-row">
          <div class="form-group col">
            <label>HDD</label>
            <input v-model="form.hdd" type="number" />
          </div>

          <div class="form-group col">
            <label>MAC</label>
            <input v-model="form.mac" type="text" />
          </div>
        </div>

        <div class="form-row">
          <div class="form-group col">
            <label>Serial</label>
            <input v-model="form.serial" type="text" />
          </div>
        </div>

        <div class="form-actions">
          <button class="btn btn-cancel" @click="showAddModal = false">Cancelar</button>
          <button class="btn btn-submit" @click="submitForm">{{ form.id ? 'Actualizar' : 'Guardar' }}</button>
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
const showAddModal = ref(false)
const form = ref({
  id: '',
  dependency_id: '',
  device_name: '',
  os: '',
  ip: '',
  property: '',
  brand: '',
  model: '',
  ram: '',
  hdd: '',
  mac: '',
  serial: '',
})

const loadDevices = async () => {
  try {
    devices.value = await useApi('devices')
  } catch (error) {
    Swal.fire('Error', error.message || 'No se pudieron cargar los dispositivos', 'error')
  }
}

const submitForm = async () => {
  try {
    const method = form.value.id ? 'PUT' : 'POST'
    const url = form.value.id ? `devices/${form.value.id}` : 'devices'
    await useApi(url, method, form.value)
    Swal.fire('Éxito', 'Dispositivo guardado correctamente', 'success')
    showAddModal.value = false
    resetForm()
    loadDevices()
  } catch (error) {
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
      Swal.fire('Error', error.message || 'No se pudo eliminar el dispositivo', 'error')
    }
  }
}

const resetForm = () => {
  form.value = {
    id: '',
    dependency_id: '',
    device_name: '',
    os: '',
    ip: '',
    property: '',
    brand: '',
    model: '',
    ram: '',
    hdd: '',
    mac: '',
    serial: '',
  }
}

onMounted(loadDevices)
</script>

<style scoped>
/* Pega aquí directamente todos los estilos que me diste */
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
}

table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 20px;
  background-color: #fff;
}

th, td {
  padding: 12px;
  text-align: left;
  border-bottom: 1px solid #ddd;
}

th {
  background-color: #f9f9f9;
}

tr:hover {
  background-color: #f5f5f5;
}

.modal {
  position: fixed;
  z-index: 1;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0,0,0,0.4);
  display: flex;
  justify-content: center;
  align-items: center;
}

.modal-content {
  background-color: #fff;
  padding: 20px;
  border-radius: 8px;
  width: 700px;
  max-width: 90%;
  position: relative;
}

.close {
  position: absolute;
  top: 10px;
  right: 10px;
  font-size: 24px;
  cursor: pointer;
}

.form-row {
  display: flex;
  gap: 20px;
  margin-bottom: 15px;
}

.form-group {
  flex: 1;
}

.form-group label {
  font-weight: bold;
}

input {
  width: 100%;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 14px;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}
</style>
