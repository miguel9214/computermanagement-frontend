<template>
  <div class="scanner-management">
    <h1>Gestión de Escáneres</h1>

    <!-- Filtro y acciones -->
    <div class="actions">
      <input
        v-model="searchQuery"
        @keyup.enter="fetchScanners(1)"
        type="text"
        class="form-control mb-2"
        placeholder="Buscar por nombre..."
      />
      <button class="btn btn-add" @click="openCreateModal">
        <i class="bi bi-plus-circle"></i> Agregar Escáner
      </button>
      <button class="btn btn-edit" @click="fetchScanners(currentPage)">
        <i class="bi bi-arrow-repeat"></i> Recargar
      </button>
    </div>

    <!-- Tabla -->
    <div class="table-container">
      <table>
        <thead>
          <tr>
            <th>#</th>
            <th>Nombre</th>
            <th>Marca</th>
            <th>Modelo</th>
            <th>Conexión</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="!scanners.length">
            <td colspan="6">No se encontraron escáneres.</td>
          </tr>
          <tr v-else v-for="(scanner, idx) in scanners" :key="scanner.id">
            <td>{{ (currentPage - 1) * perPage + idx + 1 }}</td>
            <td>{{ scanner.name }}</td>
            <td>{{ scanner.brand || '-' }}</td>
            <td>{{ scanner.model || '-' }}</td>
            <td>
              <span v-if="scanner.connection === 'USB'">USB</span>
              <span v-else-if="scanner.connection === 'IP'">IP</span>
              <span v-else>Ninguna</span>
            </td>
            <td class="action-buttons">
              <button class="btn btn-edit btn-sm" @click="openEditModal(scanner)">
                <i class="bi bi-pencil"></i>
              </button>
              <button class="btn btn-delete btn-sm" @click="confirmDelete(scanner.id)">
                <i class="bi bi-trash"></i>
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Paginación -->
    <div class="pagination my-3 d-flex align-items-center justify-content-center">
      <button
        class="btn btn-secondary btn-sm"
        :disabled="currentPage === 1"
        @click="fetchScanners(currentPage - 1)"
      >
        <i class="bi bi-arrow-left-circle"></i> Anterior
      </button>
      <span class="mx-2">Página {{ currentPage }} de {{ totalPages }}</span>
      <button
        class="btn btn-secondary btn-sm"
        :disabled="currentPage === totalPages"
        @click="fetchScanners(currentPage + 1)"
      >
        Siguiente <i class="bi bi-arrow-right-circle"></i>
      </button>
    </div>

    <!-- Modal Crear/Editar -->
    <div class="modal" v-if="modalVisible">
      <div class="modal-content">
        <span class="close" @click="cancelForm">&times;</span>
        <h3>{{ isEditing ? 'Editar Escáner' : 'Agregar Escáner' }}</h3>
        <form @submit.prevent="submitForm">
          <div class="form-row">
            <div class="form-group col">
              <label>Nombre *</label>
              <input v-model="formData.name" type="text" required />
            </div>
            <div class="form-group col">
              <label>Marca</label>
              <input v-model="formData.brand" type="text" />
            </div>
          </div>
          <div class="form-row">
            <div class="form-group col">
              <label>Modelo</label>
              <input v-model="formData.model" type="text" />
            </div>
            <div class="form-group col">
              <label>Conexión *</label>
              <select v-model="formData.connection" required>
                <option value="" disabled>Seleccione</option>
                <option value="USB">USB</option>
                <option value="IP">IP</option>
                <option value="NONE">Ninguna</option>
              </select>
            </div>
          </div>
          <div class="form-actions">
            <button type="button" class="btn btn-cancel" @click="cancelForm">
              <i class="bi bi-x-circle"></i> Cancelar
            </button>
            <button type="submit" class="btn btn-submit">
              <i class="bi bi-check-circle"></i>
              {{ isEditing ? 'Actualizar' : 'Guardar' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { useApi } from '@/composables/use-api'
import Swal from 'sweetalert2'

const scanners    = ref([])
const searchQuery = ref('')
const currentPage = ref(1)
const totalPages  = ref(1)
const perPage     = 10

const modalVisible = ref(false)
const isEditing    = ref(false)
const formData     = ref({ id: null, name: '', brand: '', model: '', connection: '' })

async function fetchScanners(page = 1) {
  currentPage.value = page
  try {
    const resp = await useApi(`scanners?page=${page}&per_page=${perPage}&search=${encodeURIComponent(searchQuery.value)}`)
    const p     = resp.data
    scanners.value   = p.data
    totalPages.value = p.last_page
  } catch (e) {
    console.error(e)
    Swal.fire('Error', 'No se pudo cargar los escáneres', 'error')
  }
}

function openCreateModal() {
  formData.value = { id: null, name: '', brand: '', model: '', connection: '' }
  isEditing.value = false
  modalVisible.value = true
}

function openEditModal(scanner) {
  formData.value = { ...scanner }
  isEditing.value = true
  modalVisible.value = true
}

async function submitForm() {
  const url    = formData.value.id ? `scanners/${formData.value.id}` : 'scanners'
  const method = formData.value.id ? 'PUT' : 'POST'
  try {
    await useApi(url, method, formData.value)
    Swal.fire('Éxito', `Escáner ${isEditing.value ? 'actualizado' : 'creado'} exitosamente`, 'success')
    cancelForm()
    fetchScanners(currentPage.value)
  } catch {
    Swal.fire('Error', 'No se pudo guardar el escáner', 'error')
  }
}

async function confirmDelete(id) {
  const { isConfirmed } = await Swal.fire({
    title: '¿Eliminar escáner?',
    text: 'No podrás revertirlo',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'Sí, eliminar'
  })
  if (!isConfirmed) return

  try {
    await useApi(`scanners/${id}`, 'DELETE')
    Swal.fire('Eliminado', '', 'success')
    fetchScanners(currentPage.value)
  } catch {
    Swal.fire('Error', 'No se pudo eliminar el escáner', 'error')
  }
}

function cancelForm() {
  modalVisible.value = false
  isEditing.value    = false
  formData.value     = { id: null, name: '', brand: '', model: '', connection: '' }
}

watch(searchQuery, () => fetchScanners(1))
onMounted(() => fetchScanners(1))
</script>

<style scoped>
.scanner-management {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
}

h1 { color: #3c3c3c; margin-bottom: 20px; }

.actions { margin-bottom: 20px; }

.btn {
  padding: 8px 16px;
  margin: 0 4px;
  border: none;
  border-radius: 6px;
  font-weight: bold;
  display: inline-flex;
  align-items: center;
  gap: 6px;
}
.btn i { margin-right: 4px; }

.btn-add   { background: #C6D6A3; color: #333; }
.btn-add:hover { background: #B2C691; }

.btn-edit  { background: #a1c2f0; color: #fff; }
.btn-edit:hover { background: #89b4eb; }

.btn-delete { background: #f28b82; color: #fff; }
.btn-delete:hover { background: #e57373; }

.btn-cancel { background: #e0e0e0; color: #333; }
.btn-submit { background: #81c784; color: #fff; }
.btn-submit:hover { background: #66bb6a; }

.action-buttons { display: flex; gap: 8px; }

.table-container {
  overflow-x: auto;
  border: 1px solid #ddd;
  border-radius: 8px;
  margin-top: 10px;
  max-height: 300px;
}

table {
  width: 100%;
  border-collapse: collapse;
  background: #fff;
}

th, td {
  padding: 10px;
  text-align: left;
  border-bottom: 1px solid #ddd;
}

th {
  background: #f9f9f9;
  position: sticky;
  top: 0;
  z-index: 1;
}

tr:hover { background: #f5f5f5; }

.pagination {
  display: flex;
  gap: 10px;
  align-items: center;
  justify-content: center;
}

.modal {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.4);
  display: flex;
  justify-content: center;
  align-items: center;
}

.modal-content {
  background: #fff;
  padding: 20px;
  border-radius: 8px;
  width: 500px;
  max-width: 90%;
  position: relative;
}

.close {
  position: absolute;
  top: 12px;
  right: 12px;
  font-size: 24px;
  cursor: pointer;
}

.form-row { margin-bottom: 15px; }

.form-group label {
  font-weight: bold;
  display: block;
  margin-bottom: 5px;
}

input, select {
  width: 100%;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}
</style>
