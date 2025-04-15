<template>
    <div class="dependency-management">
      <h1>Gestión de Dependencias</h1>
      
      <!-- Modal para crear/editar dependencia -->
      <div v-if="showModal" class="modal">
        <div class="modal-content">
          <span class="close" @click="closeModal">&times;</span>
          <h2>{{ isEditing ? 'Editar Dependencia' : 'Nueva Dependencia' }}</h2>
          
          <form @submit.prevent="submitForm">
            <div class="form-group">
              <label for="name">Nombre*</label>
              <input 
                type="text" 
                id="name" 
                v-model="formData.name" 
                required
                placeholder="Ej: Departamento de TI"
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
      
      <!-- Botón para agregar nueva dependencia -->
      <div class="actions">
        <button @click="openCreateModal" class="btn btn-add">
          <i class="fas fa-plus"></i> Agregar Dependencia
        </button>
      </div>
      
      <!-- Tabla de dependencias -->
      <div class="table-container">
        <table v-if="dependencies.length > 0">
          <thead>
            <tr>
              <th>ID</th>
              <th>Nombre</th>
              <th>Creado por</th>
              <th>Actualizado por</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="dependency in dependencies" :key="dependency.id">
              <td>{{ dependency.id }}</td>
              <td>{{ dependency.name }}</td>
              <td>{{ dependency.created_by_user ? getUserName(dependency.created_by_user) : '-' }}</td>
              <td>{{ dependency.updated_by_user ? getUserName(dependency.updated_by_user) : '-' }}</td>
              <td class="actions">
                <button @click="openEditModal(dependency)" class="btn btn-edit">
                  <i class="fas fa-edit"></i>
                </button>
                <button @click="confirmDelete(dependency.id)" class="btn btn-delete">
                  <i class="fas fa-trash"></i>
                </button>
              </td>
            </tr>
          </tbody>
        </table>
        
        <div v-else class="no-data">
          <p>No hay dependencias registradas</p>
        </div>
      </div>
      
      <!-- Confirmación de eliminación -->
      <div v-if="showDeleteConfirm" class="confirm-dialog">
        <div class="confirm-content">
          <p>¿Estás seguro de que deseas eliminar esta dependencia?</p>
          <div class="confirm-actions">
            <button @click="showDeleteConfirm = false" class="btn btn-cancel">Cancelar</button>
            <button @click="deleteDependency" class="btn btn-delete">Eliminar</button>
          </div>
        </div>
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref, onMounted } from 'vue';
  import { useApi } from '@/composables/use-api';
  
  // Estado de la vista
  const dependencies = ref([]);
  const users = ref({}); // Cache de usuarios
  const showModal = ref(false);
  const isEditing = ref(false);
  const showDeleteConfirm = ref(false);
  const dependencyToDelete = ref(null);
  
  // Datos del formulario
  const formData = ref({
    name: '',
  });
  
  // Cargar dependencias al montar el componente
  onMounted(async () => {
    await fetchDependencies();
  });
  
  // Obtener lista de dependencias
  async function fetchDependencies() {
    try {
      const data = await useApi('dependencies');
      dependencies.value = data;
      
      // Obtener IDs únicos de usuarios para caché
      const userIds = new Set();
      data.forEach(dep => {
        if (dep.created_by_user) userIds.add(dep.created_by_user);
        if (dep.updated_by_user) userIds.add(dep.updated_by_user);
      });
      
      // Obtener información de usuarios (si hay alguno)
      if (userIds.size > 0) {
        await fetchUsers([...userIds]);
      }
    } catch (error) {
      console.error('Error al obtener dependencias:', error);
      alert('Error al cargar las dependencias');
    }
  }
  
  // Obtener información de usuarios
  async function fetchUsers(userIds) {
    try {
      const response = await useApi('users', 'GET', { ids: userIds.join(',') });
      response.forEach(user => {
        users.value[user.id] = user.name || user.email;
      });
    } catch (error) {
      console.error('Error al obtener usuarios:', error);
    }
  }
  
  // Obtener nombre de usuario
  function getUserName(userId) {
    return users.value[userId] || `Usuario #${userId}`;
  }
  
  // Abrir modal para crear nueva dependencia
  function openCreateModal() {
    isEditing.value = false;
    resetForm();
    showModal.value = true;
  }
  
  // Abrir modal para editar dependencia
  function openEditModal(dependency) {
    isEditing.value = true;
    formData.value = {
      id: dependency.id,
      name: dependency.name
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
      name: ''
    };
  }
  
  // Enviar formulario (crear/actualizar)
  async function submitForm() {
    try {
      if (isEditing.value) {
        // Actualizar dependencia existente
        await useApi(`dependencies/${formData.value.id}`, 'PUT', formData.value);
      } else {
        // Crear nueva dependencia
        await useApi('dependencies', 'POST', formData.value);
      }
      
      await fetchDependencies();
      closeModal();
    } catch (error) {
      console.error('Error al guardar dependencia:', error);
      alert('Error al guardar la dependencia');
    }
  }
  
  // Confirmar eliminación
  function confirmDelete(id) {
    dependencyToDelete.value = id;
    showDeleteConfirm.value = true;
  }
  
  // Eliminar dependencia
  async function deleteDependency() {
    try {
      await useApi(`dependencies/${dependencyToDelete.value}`, 'DELETE');
      await fetchDependencies();
      showDeleteConfirm.value = false;
    } catch (error) {
      console.error('Error al eliminar dependencia:', error);
      alert('Error al eliminar la dependencia');
    }
  }
  </script>
  
  <style scoped>
  .dependency-management {
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