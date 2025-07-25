<template>
  <div class="dependency-management">
    <h1>Gestión de Dependencias</h1>

    <!-- Filtro y acciones -->
    <div class="actions">
      <input
        v-model="searchQuery"
        @keyup.enter="fetchDependencies(1)"
        type="text"
        class="form-control mb-2"
        placeholder="Buscar por nombre..."
      />
      <button class="btn btn-add" @click="openCreateModal">
        <i class="bi bi-plus-circle"></i> Agregar Dependencia
      </button>
      <button class="btn btn-edit" @click="fetchDependencies(currentPage)">
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
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="!dependencies.length">
            <td colspan="3">No se encontraron dependencias.</td>
          </tr>
          <tr v-else v-for="(dep, idx) in dependencies" :key="dep.id">
            <td>{{ (currentPage - 1) * perPage + idx + 1 }}</td>
            <td>{{ dep.name }}</td>
            <td class="action-buttons">
              <button class="btn btn-edit btn-sm" @click="editDependency(dep)">
                <i class="bi bi-pencil"></i>
              </button>
              <button class="btn btn-delete btn-sm" @click="deleteDependency(dep.id)">
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
        @click="fetchDependencies(currentPage - 1)"
      >
        <i class="bi bi-arrow-left-circle"></i> Anterior
      </button>
      <span class="mx-2">Página {{ currentPage }} de {{ totalPages }}</span>
      <button
        class="btn btn-secondary btn-sm"
        :disabled="currentPage === totalPages"
        @click="fetchDependencies(currentPage + 1)"
      >
        Siguiente <i class="bi bi-arrow-right-circle"></i>
      </button>
    </div>

    <!-- Modal Crear/Editar -->
    <div class="modal" v-if="modalVisible">
      <div class="modal-content">
        <span class="close" @click="cancelForm">&times;</span>
        <h3>{{ isEditing ? 'Editar Dependencia' : 'Agregar Dependencia' }}</h3>

        <form @submit.prevent="isEditing ? updateDependency() : createDependency()">
          <div class="form-row">
            <div class="form-group col">
              <label>Nombre *</label>
              <input v-model="form.name" type="text" required />
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

const dependencies = ref([])
const searchQuery = ref('')
const currentPage = ref(1)
const totalPages = ref(1)
const perPage = 10      // <-- Mostrar 10 por página

const modalVisible = ref(false)
const isEditing     = ref(false)
const form          = ref({ id: null, name: '' })

// Obtiene la página y aplica búsqueda
async function fetchDependencies(page = 1) {
  currentPage.value = page
  try {
    // Cambiado a itemsPerPage para coincidir con el controlador
    const resp = await useApi(
      `dependencies?page=${page}&itemsPerPage=${perPage}&search=${encodeURIComponent(searchQuery.value)}`
    )
    const pageData = resp.data      // aquí resp.data es el objeto paginado
    dependencies.value = pageData.data
    totalPages.value    = pageData.last_page
  } catch (e) {
    console.error(e)
    Swal.fire('Error', 'No se pudo cargar las dependencias', 'error')
  }
}

// Abre modal en modo "crear"
function openCreateModal() {
  form.value      = { id: null, name: '' }
  isEditing.value = false
  modalVisible.value = true
}

// Prepara modal en modo "editar"
function editDependency(dep) {
  form.value      = { ...dep }
  isEditing.value = true
  modalVisible.value = true
}

// Envía creación
async function createDependency() {
  try {
    await useApi('dependencies', 'POST', { name: form.value.name })
    Swal.fire('¡Éxito!', 'Dependencia creada.', 'success')
    cancelForm()
    fetchDependencies(currentPage.value)
  } catch {
    Swal.fire('Error', 'No se pudo crear la dependencia', 'error')
  }
}

// Envía actualización
async function updateDependency() {
  try {
    await useApi(`dependencies/${form.value.id}`, 'PUT', { name: form.value.name })
    Swal.fire('¡Éxito!', 'Dependencia actualizada.', 'success')
    cancelForm()
    fetchDependencies(currentPage.value)
  } catch {
    Swal.fire('Error', 'No se pudo actualizar la dependencia', 'error')
  }
}

// Elimina con confirmación
async function deleteDependency(id) {
  const { isConfirmed } = await Swal.fire({
    title: '¿Eliminar dependencia?',
    text: 'No podrás revertirlo',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'Sí, eliminar'
  })
  if (!isConfirmed) return

  try {
    await useApi(`dependencies/${id}`, 'DELETE')
    Swal.fire('Eliminada', '', 'success')
    fetchDependencies(currentPage.value)
  } catch {
    Swal.fire('Error', 'No se pudo eliminar la dependencia', 'error')
  }
}

// Cierra modal y resetea
function cancelForm() {
  modalVisible.value = false
  isEditing.value    = false
  form.value         = { id: null, name: '' }
}

// Reejecuta al cambiar la búsqueda
watch(searchQuery, () => fetchDependencies(1))

onMounted(() => {
  fetchDependencies(1)
})
</script>

<style scoped>
.dependency-management {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
}

h1 {
  color: #3c3c3c;
  margin-bottom: 20px;
}

.actions {
  margin-bottom: 20px;
  gap: 8px;
}

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

.btn-add { background: #C6D6A3; color: #333; }
.btn-add:hover { background: #B2C691; }

.btn-edit { background: #a1c2f0; color: #fff; }
.btn-edit:hover { background: #89b4eb; }

.btn-delete { background: #f28b82; color: #fff; }
.btn-delete:hover { background: #e57373; }

.btn-cancel { background: #e0e0e0; color: #333; }
.btn-submit { background: #81c784; color: #fff; }
.btn-submit:hover { background: #66bb6a; }

.table-container {
  overflow-x: auto;
  border: 1px solid #ddd;
  border-radius: 8px;
  margin-top: 10px;
  max-height: 1200px;
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

tr:hover {
  background: #f5f5f5;
}

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

.form-row {
  margin-bottom: 15px;
}

.form-group label {
  font-weight: bold;
  display: block;
  margin-bottom: 5px;
}

input[type="text"] {
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
