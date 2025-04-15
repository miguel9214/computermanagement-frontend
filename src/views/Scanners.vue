<template>
    <div class="scanner-management">
      <h1>Gestión de Scanners</h1>
      
      <!-- Modal para crear/editar scanner -->
      <div v-if="showModal" class="modal">
        <div class="modal-content">
          <span class="close" @click="closeModal">&times;</span>
          <h2>{{ isEditing ? 'Editar Scanner' : 'Nuevo Scanner' }}</h2>
          
          <form @submit.prevent="submitForm">
            <div class="form-group">
              <label for="name">Nombre*</label>
              <input 
                type="text" 
                id="name" 
                v-model="formData.name" 
                required
                placeholder="Ej: Scanner Recepción"
              >
            </div>
            
            <div class="form-group">
              <label for="brand">Marca</label>
              <input 
                type="text" 
                id="brand" 
                v-model="formData.brand" 
                placeholder="Ej: HP, Epson"
              >
            </div>
            
            <div class="form-group">
              <label for="model">Modelo</label>
              <input 
                type="text" 
                id="model" 
                v-model="formData.model" 
                placeholder="Ej: ScanJet Pro 2500"
              >
            </div>
            
            <div class="form-group">
              <label for="connection">Tipo de Conexión*</label>
              <select id="connection" v-model="formData.connection" required>
                <option value="NONE">Seleccione...</option>
                <option value="USB">USB</option>
                <option value="IP">Red (IP)</option>
              </select>
            </div>
            
            <div v-if="formData.connection === 'IP'" class="form-group">
              <label for="ip">Dirección IP</label>
              <input 
                type="text" 
                id="ip" 
                v-model="formData.ip" 
                placeholder="Ej: 192.168.1.100"
              >
            </div>
            
            <div v-if="formData.connection === 'IP'" class="form-group">
              <label for="mac">Dirección MAC</label>
              <input 
                type="text" 
                id="mac" 
                v-model="formData.mac" 
                placeholder="Ej: 00:1A:2B:3C:4D:5E"
              >
            </div>
            
            <div class="form-actions">
              <button type="button" @click="closeModal" class="btn btn-cancel">Cancelar</button>
              <button type="submit" class="btn btn-submit">
                {{ isEditing ? 'Actualizar' : 'Guardar' }}
              </button>
            </div>
          </form>
        </div>
      </div>
      
      <!-- Botón para agregar nuevo scanner -->
      <div class="actions">
        <button @click="openCreateModal" class="btn btn-add">
          <i class="fas fa-plus"></i> Agregar Scanner
        </button>
      </div>
      
      <!-- Tabla de scanners -->
      <div class="table-container">
        <table v-if="scanners.length > 0">
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Marca</th>
              <th>Modelo</th>
              <th>Conexión</th>
              <th>IP</th>
              <th>MAC</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="scanner in scanners" :key="scanner.id">
              <td>{{ scanner.name }}</td>
              <td>{{ scanner.brand || '-' }}</td>
              <td>{{ scanner.model || '-' }}</td>
              <td>{{ scanner.connection }}</td>
              <td>{{ scanner.ip || '-' }}</td>
              <td>{{ scanner.mac || '-' }}</td>
              <td class="actions">
                <button @click="openEditModal(scanner)" class="btn btn-edit">
                  <i class="fas fa-edit"></i>
                </button>
                <button @click="confirmDelete(scanner.id)" class="btn btn-delete">
                  <i class="fas fa-trash"></i>
                </button>
              </td>
            </tr>
          </tbody>
        </table>
        
        <div v-else class="no-data">
          <p>No hay scanners registrados</p>
        </div>
      </div>
      
      <!-- Confirmación de eliminación -->
      <div v-if="showDeleteConfirm" class="confirm-dialog">
        <div class="confirm-content">
          <p>¿Estás seguro de que deseas eliminar este scanner?</p>
          <div class="confirm-actions">
            <button @click="showDeleteConfirm = false" class="btn btn-cancel">Cancelar</button>
            <button @click="deleteScanner" class="btn btn-delete">Eliminar</button>
          </div>
        </div>
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref, onMounted } from 'vue';
  import { useApi } from '@/composables/use-api';
  
  // Estado de la vista
  const scanners = ref([]);
  const showModal = ref(false);
  const isEditing = ref(false);
  const showDeleteConfirm = ref(false);
  const scannerToDelete = ref(null);
  
  // Datos del formulario
  const formData = ref({
    name: '',
    brand: null,
    model: null,
    connection: 'NONE',
    ip: null,
    mac: null
  });
  
  // Cargar scanners al montar el componente
  onMounted(async () => {
    await fetchScanners();
  });
  
  // Obtener lista de scanners
  async function fetchScanners() {
    try {
      const data = await useApi('scanners');
      scanners.value = data;
    } catch (error) {
      console.error('Error al obtener scanners:', error);
      alert('Error al cargar los scanners');
    }
  }
  
  // Abrir modal para crear nuevo scanner
  function openCreateModal() {
    isEditing.value = false;
    resetForm();
    showModal.value = true;
  }
  
  // Abrir modal para editar scanner
  function openEditModal(scanner) {
    isEditing.value = true;
    formData.value = {
      id: scanner.id,
      name: scanner.name,
      brand: scanner.brand,
      model: scanner.model,
      connection: scanner.connection,
      ip: scanner.ip,
      mac: scanner.mac
    };
    showModal.value = true;
  }
  
  // Cerrar modal
  function closeModal() {
    showModal.value = false;
  }
  
  // Resetear formulario
  function resetForm() {
    formData.value = {
      name: '',
      brand: null,
      model: null,
      connection: 'NONE',
      ip: null,
      mac: null
    };
  }
  
  // Enviar formulario (crear/actualizar)
  async function submitForm() {
    try {
      if (isEditing.value) {
        // Actualizar scanner existente
        await useApi(`scanners/${formData.value.id}`, 'PUT', formData.value);
      } else {
        // Crear nuevo scanner
        await useApi('scanners', 'POST', formData.value);
      }
      
      await fetchScanners();
      closeModal();
    } catch (error) {
      console.error('Error al guardar scanner:', error);
      alert('Error al guardar el scanner');
    }
  }
  
  // Confirmar eliminación
  function confirmDelete(id) {
    scannerToDelete.value = id;
    showDeleteConfirm.value = true;
  }
  
  // Eliminar scanner
  async function deleteScanner() {
    try {
      await useApi(`scanners/${scannerToDelete.value}`, 'DELETE');
      await fetchScanners();
      showDeleteConfirm.value = false;
    } catch (error) {
      console.error('Error al eliminar scanner:', error);
      alert('Error al eliminar el scanner');
    }
  }
  </script>
  
  <style scoped>
  .scanner-management {
    padding: 20px;
    max-width: 1200px;
    margin: 0 auto;
  }
  
  h1 {
    color: #333;
    margin-bottom: 20px;
  }
  
  .actions {
    margin-bottom: 20px;
  }
  
  .btn {
    padding: 8px 16px;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-weight: bold;
    display: inline-flex;
    align-items: center;
    gap: 8px;
  }
  
  .btn-add {
    background-color: #4CAF50;
    color: white;
  }
  
  .btn-edit {
    background-color: #2196F3;
    color: white;
  }
  
  .btn-delete {
    background-color: #f44336;
    color: white;
  }
  
  .btn-cancel {
    background-color: #ccc;
    color: #333;
  }
  
  .btn-submit {
    background-color: #4CAF50;
    color: white;
  }
  
  .table-container {
    overflow-x: auto;
  }
  
  table {
    width: 100%;
    border-collapse: collapse;
    margin-top: 20px;
  }
  
  th, td {
    padding: 12px;
    text-align: left;
    border-bottom: 1px solid #ddd;
  }
  
  th {
    background-color: #f2f2f2;
  }
  
  tr:hover {
    background-color: #f5f5f5;
  }
  
  .actions button {
    margin-right: 5px;
    padding: 5px 10px;
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
    background-color: white;
    padding: 20px;
    border-radius: 5px;
    width: 500px;
    max-width: 90%;
    position: relative;
  }
  
  .close {
    position: absolute;
    right: 20px;
    top: 10px;
    font-size: 28px;
    font-weight: bold;
    cursor: pointer;
  }
  
  .form-group {
    margin-bottom: 15px;
  }
  
  .form-group label {
    display: block;
    margin-bottom: 5px;
    font-weight: bold;
  }
  
  .form-group input,
  .form-group select {
    width: 100%;
    padding: 8px;
    border: 1px solid #ddd;
    border-radius: 4px;
  }
  
  .form-actions {
    display: flex;
    justify-content: flex-end;
    gap: 10px;
    margin-top: 20px;
  }
  
  .no-data {
    text-align: center;
    padding: 20px;
    background-color: #f9f9f9;
    border-radius: 4px;
    margin-top: 20px;
  }
  
  .confirm-dialog {
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
  
  .confirm-content {
    background-color: white;
    padding: 20px;
    border-radius: 5px;
    width: 400px;
    max-width: 90%;
  }
  
  .confirm-actions {
    display: flex;
    justify-content: flex-end;
    gap: 10px;
    margin-top: 20px;
  }
  </style>