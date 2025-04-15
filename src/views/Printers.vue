<template>
    <div class="printer-management">
      <h1>Gestión de Impresoras</h1>
      
      <!-- Modal para crear/editar impresora -->
      <div v-if="showModal" class="modal">
        <div class="modal-content">
          <span class="close" @click="closeModal">&times;</span>
          <h2>{{ isEditing ? 'Editar Impresora' : 'Nueva Impresora' }}</h2>
          
          <form @submit.prevent="submitForm">
            <div class="form-group">
              <label for="name">Nombre*</label>
              <input 
                type="text" 
                id="name" 
                v-model="formData.name" 
                required
                placeholder="Ej: Impresora Recepción"
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
                placeholder="Ej: LaserJet Pro M404"
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
      
      <!-- Botón para agregar nueva impresora -->
      <div class="actions">
        <button @click="openCreateModal" class="btn btn-add">
          <i class="fas fa-plus"></i> Agregar Impresora
        </button>
      </div>
      
      <!-- Tabla de impresoras -->
      <div class="table-container">
        <table v-if="printers.length > 0">
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
            <tr v-for="printer in printers" :key="printer.id">
              <td>{{ printer.name }}</td>
              <td>{{ printer.brand || '-' }}</td>
              <td>{{ printer.model || '-' }}</td>
              <td>{{ printer.connection }}</td>
              <td>{{ printer.ip || '-' }}</td>
              <td>{{ printer.mac || '-' }}</td>
              <td class="actions">
                <button @click="openEditModal(printer)" class="btn btn-edit">
                  <i class="fas fa-edit"></i>
                </button>
                <button @click="confirmDelete(printer.id)" class="btn btn-delete">
                  <i class="fas fa-trash"></i>
                </button>
              </td>
            </tr>
          </tbody>
        </table>
        
        <div v-else class="no-data">
          <p>No hay impresoras registradas</p>
        </div>
      </div>
      
      <!-- Confirmación de eliminación -->
      <div v-if="showDeleteConfirm" class="confirm-dialog">
        <div class="confirm-content">
          <p>¿Estás seguro de que deseas eliminar esta impresora?</p>
          <div class="confirm-actions">
            <button @click="showDeleteConfirm = false" class="btn btn-cancel">Cancelar</button>
            <button @click="deletePrinter" class="btn btn-delete">Eliminar</button>
          </div>
        </div>
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref, onMounted } from 'vue';
  import { useApi } from '@/composables/use-api';
  
  // Estado de la vista
  const printers = ref([]);
  const showModal = ref(false);
  const isEditing = ref(false);
  const showDeleteConfirm = ref(false);
  const printerToDelete = ref(null);
  
  // Datos del formulario
  const formData = ref({
    name: '',
    brand: null,
    model: null,
    connection: 'NONE',
    ip: null,
    mac: null
  });
  
  // Cargar impresoras al montar el componente
  onMounted(async () => {
    await fetchPrinters();
  });
  
  // Obtener lista de impresoras
  async function fetchPrinters() {
    try {
      const data = await useApi('printers');
      printers.value = data;
    } catch (error) {
      console.error('Error al obtener impresoras:', error);
      alert('Error al cargar las impresoras');
    }
  }
  
  // Abrir modal para crear nueva impresora
  function openCreateModal() {
    isEditing.value = false;
    resetForm();
    showModal.value = true;
  }
  
  // Abrir modal para editar impresora
  function openEditModal(printer) {
    isEditing.value = true;
    formData.value = {
      id: printer.id,
      name: printer.name,
      brand: printer.brand,
      model: printer.model,
      connection: printer.connection,
      ip: printer.ip,
      mac: printer.mac
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
        // Actualizar impresora existente
        await useApi(`printers/${formData.value.id}`, 'PUT', formData.value);
      } else {
        // Crear nueva impresora
        await useApi('printers', 'POST', formData.value);
      }
      
      await fetchPrinters();
      closeModal();
    } catch (error) {
      console.error('Error al guardar impresora:', error);
      alert('Error al guardar la impresora');
    }
  }
  
  // Confirmar eliminación
  function confirmDelete(id) {
    printerToDelete.value = id;
    showDeleteConfirm.value = true;
  }
  
  // Eliminar impresora
  async function deletePrinter() {
    try {
      await useApi(`printers/${printerToDelete.value}`, 'DELETE');
      await fetchPrinters();
      showDeleteConfirm.value = false;
    } catch (error) {
      console.error('Error al eliminar impresora:', error);
      alert('Error al eliminar la impresora');
    }
  }
  </script>
  
  <style scoped>
  .printer-management {
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
    width: 500px;
    max-width: 90%;
    position: relative;
    box-shadow: 0 4px 12px rgba(0,0,0,0.1);
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
    background-color: #fff;
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
    border-radius: 6px;
    margin-top: 20px;
    color: #666;
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
    border-radius: 8px;
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
  