<template>
  <div class="dependency-management">
    <h1>Gestión de Dependencias</h1>

    <!-- Acciones de la vista -->
    <div class="actions">
      <input type="text" v-model="searchQuery" class="form-control mb-4 shadow-sm" placeholder="Buscar dependencia..." />
      <button class="btn btn-add" @click="openCreateModal">
        <i class="bi bi-plus-circle"></i> Crear Dependencia
      </button>
    </div>

    <!-- Tabla de dependencias -->
    <div class="table-container">
      <table class="table">
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
          <tr v-else v-for="(dependency, index) in dependencies" :key="dependency.id">
            <td>{{ calculateIndex(index) }}</td>
            <td>{{ dependency.name }}</td>
            <td>
              <button class="btn btn-edit" @click="openEditModal(dependency)">
                <i class="bi bi-pencil"></i> Editar
              </button>
              <button class="btn btn-delete" @click="confirmDelete(dependency.id)">
                <i class="bi bi-trash"></i> Eliminar
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Paginación -->
    <div class="pagination d-flex align-items-center justify-content-center mt-3">
      <button @click="goToPage(currentPage - 1)" :disabled="currentPage === 1" class="btn btn-secondary btn-sm">
        <i class="bi bi-arrow-left-circle"></i> Anterior
      </button>
      <span class="mx-2">Página {{ currentPage }} de {{ totalPages }}</span>
      <button @click="goToPage(currentPage + 1)" :disabled="currentPage === totalPages" class="btn btn-secondary btn-sm">
        <i class="bi bi-arrow-right-circle"></i> Siguiente
      </button>
    </div>

    <!-- Modal -->
    <div class="modal" v-if="modalVisible">
      <div class="modal-content">
        <span class="close" @click="cancelForm">&times;</span>
        <h2>{{ showEditForm ? 'Editar Dependencia' : 'Crear Dependencia' }}</h2>
        <form @submit.prevent="showEditForm ? updateDependency() : createDependency()">
          <div class="form-row">
            <div class="form-group">
              <label for="name">Nombre</label>
              <input type="text" v-model="form.name" id="name" required />
            </div>
          </div>
          <div class="form-actions">
            <button type="button" class="btn btn-cancel" @click="cancelForm">
              <i class="bi bi-x-circle"></i> Cancelar
            </button>
            <button type="submit" class="btn btn-submit">
              <i class="bi bi-check-circle"></i> {{ showEditForm ? 'Actualizar' : 'Crear' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from "vue";
import { useApi } from "@/composables/use-api";
import Swal from "sweetalert2";

const dependencies = ref([]);
const searchQuery = ref("");
const currentPage = ref(1);
const totalPages = ref(1);
const itemsPerPage = 5;
const modalVisible = ref(false);  // Controla la visibilidad del modal
const showCreateForm = ref(false);
const showEditForm = ref(false);
const form = ref({
  id: null,
  name: ""
});

// Fetch paginated dependencies
const fetchDependencies = async (page = 1, search = "") => {
  try {
    const response = await useApi(
      `dependencies?page=${page}&itemsPerPage=${itemsPerPage}&search=${search}`
    );
   dependencies.value = response.data.data;
    currentPage.value = response.data.current_page;
    totalPages.value = response.data.data.last_page;
  } catch (error) {
    console.error("Error al cargar las dependencias:", error);
  }
};

// Función para abrir el modal de creación
const openCreateModal = () => {
  form.value = { id: null, name: "" }; // Reiniciar el formulario
  showCreateForm.value = true;
  showEditForm.value = false;
  modalVisible.value = true; // Mostrar el modal
};

// Crear dependencia
const createDependency = async () => {
  try {
    await useApi("dependencies", "POST", form.value);
    fetchDependencies(currentPage.value);
    cancelForm();
    Swal.fire("Éxito", "Dependencia creada exitosamente", "success");
  } catch (error) {
    console.error("Error al crear la dependencia:", error);
    Swal.fire("Error", "No se pudo crear la dependencia", "error");
  }
};

// Editar dependencia
const openEditModal = (dependency) => {
  form.value = { ...dependency };
  showEditForm.value = true;
  showCreateForm.value = false;
  modalVisible.value = true;
};

// Actualizar dependencia
const updateDependency = async () => {
  try {
    await useApi(`dependencies/${form.value.id}`, "PUT", form.value);
    fetchDependencies(currentPage.value);
    cancelForm();
    Swal.fire("Éxito", "Dependencia actualizada exitosamente", "success");
  } catch (error) {
    console.error("Error al actualizar la dependencia:", error);
    Swal.fire("Error", "No se pudo actualizar la dependencia", "error");
  }
};

// Eliminar dependencia
const confirmDelete = (id) => {
  Swal.fire({
    title: "¿Estás seguro?",
    text: "No podrás revertir esto",
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#3085d6",
    cancelButtonColor: "#d33",
    confirmButtonText: "Sí, eliminar"
  }).then(async (result) => {
    if (result.isConfirmed) {
      try {
        await useApi(`dependencies/${id}`, "DELETE");
        fetchDependencies(currentPage.value);
        Swal.fire("Eliminada", "Dependencia eliminada exitosamente", "success");
      } catch (error) {
        console.error("Error al eliminar la dependencia:", error);
        Swal.fire("Error", "No se pudo eliminar la dependencia", "error");
      }
    }
  });
};

// Cancelar formulario
const cancelForm = () => {
  form.value = {
    id: null,
    name: ""
  };
  showCreateForm.value = false;
  showEditForm.value = false;
  modalVisible.value = false;  // Cierra el modal
};

// Cambiar de página
const goToPage = (page) => {
  if (page >= 1 && page <= totalPages.value) {
    fetchDependencies(page, searchQuery.value);
  }
};

// Calcular índice global
const calculateIndex = (index) => {
  return (currentPage.value - 1) * itemsPerPage + index + 1;
};

// Cargar dependencias al montar el componente
onMounted(() => {
  fetchDependencies();
});

// Verificar cambios en la búsqueda
watch(searchQuery, (newQuery) => {
  fetchDependencies(1, newQuery); // Reinicia a la página 1 cuando se busca algo nuevo
});
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

.btn i {
  margin-right: 8px; /* Espacio entre el ícono y el texto */
}

h1 {
  color: #3c3c3c;
  margin-bottom: 20px;
}

.actions {
  margin-bottom: 20px;
}

.btn {
  padding: 5px 10px;
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
  overflow-y: auto;
  max-height: 300px; /* Ajusta la altura para mostrar solo 5 registros */
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
.btn-group {
  display: flex;
  gap: 10px;
}
</style>
