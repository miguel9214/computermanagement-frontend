<template>
  <div class="maintenance-management">
    <h1>Gestión de Mantenimientos</h1>

    <!-- Filtro y acciones -->
    <div class="actions">
      <input
        v-model="searchQuery"
        @keyup.enter="loadMaintenances(1)"
        type="text"
        class="form-control mb-2"
        placeholder="Buscar mantenimientos..."
      />
      <select v-model="filterType" @change="loadMaintenances(1)" class="form-control mb-2">
        <option value="">Todos los tipos</option>
        <option value="preventivo">Preventivo</option>
        <option value="correctivo">Correctivo</option>
        <option value="limpieza">Limpieza</option>
        <option value="actualizacion">Actualización</option>
      </select>
      <select v-model="filterStatus" @change="loadMaintenances(1)" class="form-control mb-2">
        <option value="">Todos los estados</option>
        <option value="programado">Programado</option>
        <option value="en proceso">En Proceso</option>
        <option value="completado">Completado</option>
        <option value="cancelado">Cancelado</option>
      </select>
      <button class="btn btn-add" @click="openCreateModal">
        <i class="bi bi-plus-circle"></i> Agregar Mantenimiento
      </button>
      <button class="btn btn-edit" @click="loadMaintenances(currentPage)">
        <i class="bi bi-arrow-repeat"></i> Recargar
      </button>
    </div>

    <!-- Tabla -->
    <div class="table-container">
      <table>
        <thead>
          <tr>
            <th>#</th>
            <th>Entidad</th>
            <th>Tipo</th>
            <th>Fecha Mant.</th>
            <th>Próximo Mant.</th>
            <th>Técnico</th>
            <th>Costo</th>
            <th>Estado</th>
            <th>Imágenes</th>
            <th>Descripción</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="!maintenances.length">
            <td colspan="11">No se encontraron mantenimientos.</td>
          </tr>
          <tr v-else v-for="(m, i) in maintenances" :key="m.id">
            <td>{{ (currentPage - 1) * perPage + i + 1 }}</td>
            <td>
              <span class="entity-badge" :class="getEntityClass(m.maintainable_type)">
                {{ formatEntityType(m.maintainable_type) }}
              </span>
              <br />
              <small>{{ getEntityName(m) }}</small>
            </td>
            <td>
              <span class="type-badge">{{ m.maintenance_type || '—' }}</span>
            </td>
            <td>{{ formatDate(m.maintenance_date) }}</td>
            <td>{{ formatDate(m.next_maintenance_date) }}</td>
            <td>{{ m.technician || '—' }}</td>
            <td>{{ m.cost ? '$' + m.cost : '—' }}</td>
            <td>
              <span :class="getStatusClass(m.status)">
                {{ m.status || '—' }}
              </span>
            </td>
            <td class="images-cell">
              <div v-if="m.images && m.images.length > 0" class="thumbnails-container">
                <div
                  v-for="(img, idx) in m.images.slice(0, 3)"
                  :key="img.id"
                  class="thumbnail"
                  @click="openImageGallery(m.images, idx)"
                  :title="img.description || img.image_type"
                >
                  <img :src="getImageUrl(img.image_path)" :alt="img.image_type" />
                  <span class="image-type-badge">{{ img.image_type }}</span>
                </div>
                <div v-if="m.images.length > 3" class="more-images" @click="openImageGallery(m.images, 0)">
                  +{{ m.images.length - 3 }}
                </div>
              </div>
              <span v-else class="no-images">Sin imágenes</span>
            </td>
            <td class="notes-cell" :title="m.description">
              {{ m.description ? (m.description.length > 30 ? m.description.slice(0, 30) + '…' : m.description) : '—' }}
            </td>
            <td class="action-buttons">
              <button class="btn btn-edit btn-sm" @click="editMaintenance(m)">
                <i class="bi bi-pencil"></i>
              </button>
              <button class="btn btn-delete btn-sm" @click="deleteMaintenance(m.id)">
                <i class="bi bi-trash"></i>
              </button>
              <button class="btn btn-view btn-sm" @click="viewMaintenance(m)">
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
        @click="loadMaintenances(currentPage - 1)"
      >
        <i class="bi bi-arrow-left-circle"></i> Anterior
      </button>
      <span class="mx-2">Página {{ currentPage }} de {{ totalPages }}</span>
      <button
        class="btn btn-secondary btn-sm"
        :disabled="currentPage === totalPages"
        @click="loadMaintenances(currentPage + 1)"
      >
        Siguiente <i class="bi bi-arrow-right-circle"></i>
      </button>
    </div>

    <!-- Modal Crear/Editar -->
    <div class="modal" v-if="modalVisible">
      <div class="modal-content">
        <span class="close" @click="cancelForm">&times;</span>
        <h3>{{ form.id ? 'Editar Mantenimiento' : 'Agregar Mantenimiento' }}</h3>
        <form @submit.prevent="submitForm">
          <div class="form-row">
            <div class="form-group col">
              <label>Tipo de Entidad*</label>
              <select v-model="form.maintainable_type" required @change="loadEntities">
                <option value="">Seleccionar</option>
                <option value="device">Dispositivo</option>
                <option value="printer">Impresora</option>
                <option value="scanner">Escáner</option>
              </select>
            </div>
            <div class="form-group col">
              <label>Entidad*</label>
              <select v-model="form.maintainable_id" required :disabled="!form.maintainable_type">
                <option value="">Seleccionar</option>
                <option v-for="entity in entitiesList" :key="entity.id" :value="entity.id">
                  {{ getEntityDisplayName(entity) }}
                </option>
              </select>
            </div>
          </div>
          <div class="form-row">
            <div class="form-group col">
              <label>Fecha de Mantenimiento*</label>
              <input v-model="form.maintenance_date" type="date" required />
            </div>
            <div class="form-group col">
              <label>Próximo Mantenimiento</label>
              <input v-model="form.next_maintenance_date" type="date" />
            </div>
          </div>
          <div class="form-row">
            <div class="form-group col">
              <label>Tipo de Mantenimiento*</label>
              <select v-model="form.maintenance_type" required>
                <option value="">Seleccionar</option>
                <option value="preventivo">Preventivo</option>
                <option value="correctivo">Correctivo</option>
                <option value="limpieza">Limpieza</option>
                <option value="actualizacion">Actualización</option>
              </select>
            </div>
            <div class="form-group col">
              <label>Estado*</label>
              <select v-model="form.status" required>
                <option value="">Seleccionar</option>
                <option value="programado">Programado</option>
                <option value="en proceso">En Proceso</option>
                <option value="completado">Completado</option>
                <option value="cancelado">Cancelado</option>
              </select>
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
              <label>Descripción</label>
              <textarea v-model="form.description" rows="2"></textarea>
            </div>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label>Tareas Realizadas</label>
              <textarea v-model="form.performed_tasks" rows="3"></textarea>
            </div>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label>Formato Físico (PDF/Imagen)</label>
              <input type="file" @change="handlePhysicalFormat" accept=".pdf,.jpg,.jpeg,.png" />
              <small v-if="form.physical_format">Archivo seleccionado: {{ form.physical_format.name }}</small>
            </div>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label>Imágenes (múltiples)</label>
              <input type="file" ref="imagesInput" @change="handleImages" multiple accept=".jpg,.jpeg,.png" />
              <div v-if="form.imageDetails && form.imageDetails.length" class="selected-images-list">
                <div v-for="(img, idx) in form.imageDetails" :key="idx" class="selected-image-item">
                  <div class="image-preview">
                    <img :src="img.preview" alt="Preview" />
                  </div>
                  <div class="image-info">
                    <input v-model="img.type" type="text" placeholder="Tipo (equipo, antes, despues)" class="form-control form-control-sm mb-1" />
                    <input v-model="img.description" type="text" placeholder="Descripción (opcional)" class="form-control form-control-sm" />
                  </div>
                  <button type="button" class="btn btn-delete btn-xs" @click="removeImage(idx)">
                    <i class="bi bi-x"></i>
                  </button>
                </div>
              </div>
              <small v-else class="text-muted">No hay imágenes seleccionadas</small>
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

    <!-- Modal Galería de Imágenes -->
    <div class="modal image-gallery-modal" v-if="galleryVisible">
      <div class="modal-content gallery-content">
        <span class="close" @click="closeImageGallery">&times;</span>
        <h3>Galería de Imágenes</h3>

        <div class="gallery-main">
          <button class="gallery-nav prev" @click="prevImage" :disabled="currentImageIndex === 0">
            <i class="bi bi-chevron-left"></i>
          </button>

          <div class="main-image-container">
            <img
              :src="getImageUrl(currentGalleryImages[currentImageIndex]?.image_path)"
              :alt="currentGalleryImages[currentImageIndex]?.image_type"
              class="main-image"
            />
            <div class="image-info-overlay">
              <span class="image-type">{{ currentGalleryImages[currentImageIndex]?.image_type }}</span>
              <p v-if="currentGalleryImages[currentImageIndex]?.description" class="image-description">
                {{ currentGalleryImages[currentImageIndex]?.description }}
              </p>
            </div>
          </div>

          <button class="gallery-nav next" @click="nextImage" :disabled="currentImageIndex === currentGalleryImages.length - 1">
            <i class="bi bi-chevron-right"></i>
          </button>
        </div>

        <div class="gallery-counter">
          {{ currentImageIndex + 1 }} / {{ currentGalleryImages.length }}
        </div>

        <div class="gallery-thumbnails">
          <div
            v-for="(img, idx) in currentGalleryImages"
            :key="img.id"
            class="gallery-thumbnail"
            :class="{ active: idx === currentImageIndex }"
            @click="currentImageIndex = idx"
          >
            <img :src="getImageUrl(img.image_path)" :alt="img.image_type" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useApi } from '@/composables/use-api'
import Swal from 'sweetalert2'

const maintenances = ref([])
const entitiesList = ref([])
const searchQuery = ref('')
const filterType = ref('')
const filterStatus = ref('')
const currentPage = ref(1)
const totalPages = ref(1)
const perPage = 10

const modalVisible = ref(false)
const galleryVisible = ref(false)
const currentGalleryImages = ref([])
const currentImageIndex = ref(0)
const imagesInput = ref(null)

const form = ref({
  id: null,
  maintainable_type: '',
  maintainable_id: '',
  maintenance_date: '',
  next_maintenance_date: '',
  maintenance_type: '',
  description: '',
  performed_tasks: '',
  technician: '',
  cost: null,
  status: '',
  physical_format: null,
  images: [],
  imageDetails: []
})

async function loadMaintenances(page = 1) {
  currentPage.value = page
  try {
    let url = `maintenances?page=${page}&per_page=${perPage}`
    if (searchQuery.value) url += `&search=${encodeURIComponent(searchQuery.value)}`
    if (filterType.value) url += `&type=${filterType.value}`
    if (filterStatus.value) url += `&status=${filterStatus.value}`

    const resp = await useApi(url)
    maintenances.value = resp.data.data
    totalPages.value = resp.data.last_page
  } catch (e) {
    console.error(e)
    Swal.fire('Error', 'No se pudo cargar la lista', 'error')
  }
}

async function loadEntities() {
  if (!form.value.maintainable_type) {
    entitiesList.value = []
    return
  }
  try {
    const type = form.value.maintainable_type
    const endpoint = type === 'device' ? 'devices' : type === 'printer' ? 'printers' : 'scanners'
    const resp = await useApi(`${endpoint}?per_page=100`)
    entitiesList.value = resp.data.data
  } catch (e) {
    console.error('Entidades:', e)
    Swal.fire('Error', 'No se pudieron cargar las entidades', 'error')
  }
}

function getEntityDisplayName(entity) {
  return entity.device_name || entity.printer_name || entity.scanner_name || entity.name || 'Sin nombre'
}

function getEntityName(maintenance) {
  const entity = maintenance.maintainable
  if (!entity) return '—'
  return entity.device_name || entity.printer_name || entity.scanner_name || entity.name || '—'
}

function formatEntityType(type) {
  const types = {
    device: 'Dispositivo',
    printer: 'Impresora',
    scanner: 'Escáner'
  }
  return types[type] || type
}

function getEntityClass(type) {
  const classes = {
    device: 'entity-device',
    printer: 'entity-printer',
    scanner: 'entity-scanner'
  }
  return classes[type] || 'entity-default'
}

function formatDate(date) {
  if (!date) return '—'
  return new Date(date).toLocaleDateString('es-ES')
}

function openCreateModal() {
  resetForm()
  modalVisible.value = true
}

function editMaintenance(maintenance) {
  form.value = {
    id: maintenance.id,
    maintainable_type: maintenance.maintainable_type,
    maintainable_id: maintenance.maintainable_id,
    maintenance_date: maintenance.maintenance_date,
    next_maintenance_date: maintenance.next_maintenance_date,
    maintenance_type: maintenance.maintenance_type,
    description: maintenance.description,
    performed_tasks: maintenance.performed_tasks,
    technician: maintenance.technician,
    cost: maintenance.cost,
    status: maintenance.status,
    physical_format: null,
    images: [],
    imageDetails: []
  }
  loadEntities()
  modalVisible.value = true
}

function handlePhysicalFormat(event) {
  form.value.physical_format = event.target.files[0] || null
}

function handleImages(event) {
  const files = Array.from(event.target.files)
  form.value.images = files
  form.value.imageDetails = files.map((file, index) => ({
    file: file,
    preview: URL.createObjectURL(file),
    type: 'equipo',
    description: ''
  }))
}

function removeImage(index) {
  // Liberar el URL del objeto
  URL.revokeObjectURL(form.value.imageDetails[index].preview)
  form.value.imageDetails.splice(index, 1)
  form.value.images.splice(index, 1)

  // Resetear el input file
  if (imagesInput.value) {
    imagesInput.value.value = ''
  }
}

function getImageUrl(path) {
  if (!path) return ''
  return `http://computermanagement-backend.test/storage/${path}`
}

function openImageGallery(images, startIndex = 0) {
  currentGalleryImages.value = images
  currentImageIndex.value = startIndex
  galleryVisible.value = true
}

function closeImageGallery() {
  galleryVisible.value = false
  currentGalleryImages.value = []
  currentImageIndex.value = 0
}

function prevImage() {
  if (currentImageIndex.value > 0) {
    currentImageIndex.value--
  }
}

function nextImage() {
  if (currentImageIndex.value < currentGalleryImages.value.length - 1) {
    currentImageIndex.value++
  }
}

async function submitForm() {
  const url = form.value.id ? `maintenances/${form.value.id}` : 'maintenances'
  const method = form.value.id ? 'PUT' : 'POST'

  try {
    // Para archivos, necesitamos usar FormData
    const formData = new FormData()
    formData.append('maintainable_type', form.value.maintainable_type)
    formData.append('maintainable_id', form.value.maintainable_id)
    formData.append('maintenance_date', form.value.maintenance_date)
    if (form.value.next_maintenance_date) formData.append('next_maintenance_date', form.value.next_maintenance_date)
    formData.append('maintenance_type', form.value.maintenance_type)
    if (form.value.description) formData.append('description', form.value.description)
    if (form.value.performed_tasks) formData.append('performed_tasks', form.value.performed_tasks)
    if (form.value.technician) formData.append('technician', form.value.technician)
    if (form.value.cost) formData.append('cost', form.value.cost)
    formData.append('status', form.value.status)

    if (form.value.physical_format) {
      formData.append('physical_format', form.value.physical_format)
    }

    if (form.value.imageDetails && form.value.imageDetails.length > 0) {
      form.value.imageDetails.forEach((imgDetail, index) => {
        formData.append(`images[${index}]`, imgDetail.file)
        formData.append(`image_types[${index}]`, imgDetail.type || 'equipo')
        if (imgDetail.description) {
          formData.append(`image_descriptions[${index}]`, imgDetail.description)
        }
      })
    }

    await useApi(url, method, formData)
    Swal.fire('Éxito', 'Mantenimiento guardado', 'success')
    cancelForm()
    loadMaintenances(currentPage.value)
  } catch (err) {
    const msg = err?.errors
      ? Object.values(err.errors).flat().join('<br>')
      : err.message || 'Error al guardar'
    Swal.fire({ icon: 'error', title: 'Error', html: msg })
  }
}

async function deleteMaintenance(id) {
  const { isConfirmed } = await Swal.fire({
    title: '¿Eliminar?',
    text: 'Esto no se puede deshacer',
    icon: 'warning',
    showCancelButton: true
  })
  if (!isConfirmed) return

  try {
    await useApi(`maintenances/${id}`, 'DELETE')
    Swal.fire('Eliminado', '', 'success')
    loadMaintenances(currentPage.value)
  } catch {
    Swal.fire('Error', 'No se pudo eliminar', 'error')
  }
}

function viewMaintenance(m) {
  const html = `
    <div style="text-align:left; font-size: 14px;">
      <p><strong>Entidad:</strong> ${formatEntityType(m.maintainable_type)} - ${getEntityName(m)}</p>
      <p><strong>Tipo:</strong> ${m.maintenance_type || '—'}</p>
      <p><strong>Fecha Mantenimiento:</strong> ${formatDate(m.maintenance_date)}</p>
      <p><strong>Próximo Mantenimiento:</strong> ${formatDate(m.next_maintenance_date)}</p>
      <p><strong>Técnico:</strong> ${m.technician || '—'}</p>
      <p><strong>Costo:</strong> ${m.cost ? '$' + m.cost : '—'}</p>
      <p><strong>Estado:</strong> ${m.status || '—'}</p>
      <p><strong>Descripción:</strong><br/>${m.description ? m.description.replace(/\n/g, '<br/>') : '—'}</p>
      <p><strong>Tareas Realizadas:</strong><br/>${m.performed_tasks ? m.performed_tasks.replace(/\n/g, '<br/>') : '—'}</p>
    </div>
  `

  Swal.fire({
    title: 'Detalles del Mantenimiento',
    html,
    width: '800px',
    showCloseButton: true,
    focusConfirm: false,
    confirmButtonText: 'Cerrar'
  })
}

function cancelForm() {
  modalVisible.value = false
  resetForm()
}

function resetForm() {
  // Liberar URLs de objetos
  if (form.value.imageDetails) {
    form.value.imageDetails.forEach(img => {
      if (img.preview) URL.revokeObjectURL(img.preview)
    })
  }

  form.value = {
    id: null,
    maintainable_type: '',
    maintainable_id: '',
    maintenance_date: '',
    next_maintenance_date: '',
    maintenance_type: '',
    description: '',
    performed_tasks: '',
    technician: '',
    cost: null,
    status: '',
    physical_format: null,
    images: [],
    imageDetails: []
  }
  entitiesList.value = []

  // Resetear inputs de archivos
  if (imagesInput.value) {
    imagesInput.value.value = ''
  }
}

function getStatusClass(status) {
  if (!status) return 'status-unknown'
  const s = status.toLowerCase()
  if (s.includes('completado')) return 'status-completed'
  if (s.includes('proceso')) return 'status-progress'
  if (s.includes('programado')) return 'status-scheduled'
  if (s.includes('cancelado')) return 'status-cancelled'
  return 'status-default'
}

onMounted(() => {
  loadMaintenances()
})
</script>

<style scoped>
.maintenance-management {
  padding: 20px;
  max-width: 1400px;
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
  min-width: 1200px;
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
.entity-badge {
  padding: 3px 8px;
  border-radius: 12px;
  font-size: 11px;
  font-weight: bold;
}
.entity-device {
  background: #c6d6a3;
  color: #333;
}
.entity-printer {
  background: #f28b82;
  color: #fff;
}
.entity-scanner {
  background: #81c784;
  color: #fff;
}
.type-badge {
  background: #e3f2fd;
  color: #1976d2;
  padding: 3px 8px;
  border-radius: 12px;
  font-size: 11px;
}
.status-completed {
  color: #2e7d32;
  background: #e8f5e8;
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 11px;
}
.status-progress {
  color: #f57c00;
  background: #fff3e0;
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 11px;
}
.status-scheduled {
  color: #1976d2;
  background: #e3f2fd;
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 11px;
}
.status-cancelled {
  color: #d32f2f;
  background: #ffebee;
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 11px;
}
.status-default {
  color: #757575;
  background: #f5f5f5;
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 11px;
}
.status-unknown {
  color: #9e9e9e;
  font-style: italic;
  font-size: 11px;
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
/* Thumbnails and Images */
.images-cell {
  min-width: 120px;
  max-width: 200px;
}
.thumbnails-container {
  display: flex;
  gap: 5px;
  flex-wrap: wrap;
  align-items: center;
}
.thumbnail {
  position: relative;
  width: 50px;
  height: 50px;
  border-radius: 6px;
  overflow: hidden;
  cursor: pointer;
  border: 2px solid #e0e0e0;
  transition: all 0.3s;
}
.thumbnail:hover {
  border-color: #a1c2f0;
  transform: scale(1.1);
  z-index: 10;
}
.thumbnail img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.image-type-badge {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: rgba(0, 0, 0, 0.7);
  color: #fff;
  font-size: 8px;
  padding: 2px;
  text-align: center;
  text-transform: uppercase;
}
.more-images {
  width: 50px;
  height: 50px;
  border-radius: 6px;
  background: #f5f5f5;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  color: #666;
  cursor: pointer;
  border: 2px solid #e0e0e0;
  transition: all 0.3s;
}
.more-images:hover {
  background: #e0e0e0;
  border-color: #a1c2f0;
}
.no-images {
  font-size: 11px;
  color: #999;
  font-style: italic;
}

/* Selected Images List in Form */
.selected-images-list {
  margin-top: 15px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  max-height: 400px;
  overflow-y: auto;
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  padding: 10px;
  background: #f9f9f9;
}
.selected-image-item {
  display: flex;
  gap: 10px;
  align-items: center;
  background: #fff;
  padding: 10px;
  border-radius: 6px;
  border: 1px solid #e0e0e0;
}
.image-preview {
  width: 80px;
  height: 80px;
  border-radius: 6px;
  overflow: hidden;
  flex-shrink: 0;
  border: 2px solid #ddd;
}
.image-preview img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.image-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 5px;
}
.btn-xs {
  padding: 4px 8px;
  font-size: 12px;
}

/* Image Gallery Modal */
.image-gallery-modal {
  z-index: 1100;
}
.gallery-content {
  width: 90vw;
  max-width: 1200px;
  max-height: 95vh;
  padding: 30px;
}
.gallery-main {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 20px;
  margin: 20px 0;
  min-height: 500px;
}
.main-image-container {
  position: relative;
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  background: #000;
  border-radius: 8px;
  overflow: hidden;
  max-height: 600px;
}
.main-image {
  max-width: 100%;
  max-height: 600px;
  object-fit: contain;
}
.image-info-overlay {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: linear-gradient(to top, rgba(0, 0, 0, 0.8), transparent);
  color: #fff;
  padding: 20px;
}
.image-type {
  display: inline-block;
  background: rgba(255, 255, 255, 0.2);
  padding: 5px 15px;
  border-radius: 20px;
  font-size: 14px;
  font-weight: bold;
  text-transform: uppercase;
  margin-bottom: 10px;
}
.image-description {
  margin: 0;
  font-size: 14px;
  line-height: 1.5;
}
.gallery-nav {
  background: #fff;
  border: 2px solid #e0e0e0;
  border-radius: 50%;
  width: 50px;
  height: 50px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s;
  font-size: 24px;
  color: #333;
}
.gallery-nav:hover:not(:disabled) {
  background: #a1c2f0;
  border-color: #a1c2f0;
  color: #fff;
}
.gallery-nav:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}
.gallery-counter {
  text-align: center;
  font-size: 18px;
  font-weight: bold;
  color: #666;
  margin: 15px 0;
}
.gallery-thumbnails {
  display: flex;
  gap: 10px;
  justify-content: center;
  flex-wrap: wrap;
  margin-top: 20px;
  padding: 15px;
  background: #f5f5f5;
  border-radius: 8px;
  max-height: 150px;
  overflow-y: auto;
}
.gallery-thumbnail {
  width: 80px;
  height: 80px;
  border-radius: 6px;
  overflow: hidden;
  cursor: pointer;
  border: 3px solid #e0e0e0;
  transition: all 0.3s;
}
.gallery-thumbnail:hover {
  border-color: #a1c2f0;
  transform: scale(1.05);
}
.gallery-thumbnail.active {
  border-color: #a1c2f0;
  box-shadow: 0 0 10px rgba(161, 194, 240, 0.5);
}
.gallery-thumbnail img {
  width: 100%;
  height: 100%;
  object-fit: cover;
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
  .gallery-content {
    width: 95vw;
    padding: 15px;
  }
  .gallery-main {
    min-height: 300px;
    gap: 10px;
  }
  .main-image-container {
    max-height: 400px;
  }
  .gallery-nav {
    width: 40px;
    height: 40px;
    font-size: 18px;
  }
  .thumbnails-container {
    justify-content: center;
  }
  .selected-image-item {
    flex-direction: column;
  }
}
</style>
