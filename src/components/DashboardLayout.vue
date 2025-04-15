<template>
  <div :class="`d-flex flex-column vh-100 ${isDark ? 'bg-dark text-light' : 'bg-light text-dark'}`">
    <!-- Header -->
    <header class="px-4 py-3 d-flex justify-content-between align-items-center header">
      <h5 class="mb-0 fw-semibold">Computer Management</h5>

      <div class="dropdown">
        <button class="btn btn-outline-light btn-sm dropdown-toggle" type="button" data-bs-toggle="dropdown">
          <i class="bi bi-person-circle me-1"></i> Admin
        </button>
        <ul class="dropdown-menu dropdown-menu-end">
          <li><a class="dropdown-item" href="#">Profile</a></li>
          <li><hr class="dropdown-divider" /></li>
          <li><button class="dropdown-item text-danger" @click="logout">Logout</button></li>
        </ul>
      </div>
    </header>

    <div class="d-flex flex-grow-1 overflow-hidden">
      <!-- Sidebar -->
      <aside :class="`sidebar p-3 ${showSidebar ? 'd-block' : 'd-none'} d-md-block`">
        <nav>
          <ul class="nav flex-column">
            <li class="nav-item mb-2">
              <router-link class="nav-link sidebar-link" to="/dashboard/devices">
                <i class="bi bi-hdd-stack me-2"></i> Devices
              </router-link>
            </li>
            <li class="nav-item mb-2">
              <router-link class="nav-link sidebar-link" to="/dashboard/dependencies">
                <i class="bi bi-diagram-3 me-2"></i> Dependencies
              </router-link>
            </li>
            <li class="nav-item mb-2">
              <router-link class="nav-link sidebar-link" to="/dashboard/printers">
                <i class="bi bi-printer me-2"></i> Printers
              </router-link>
            </li>
            <li class="nav-item mb-2">
              <router-link class="nav-link sidebar-link" to="/dashboard/scanners">
                <i class="bi bi-upc-scan me-2"></i> Scanners
              </router-link>
            </li>
          </ul>
        </nav>
      </aside>

      <!-- Main content -->
      <main class="flex-grow-1 p-4 overflow-auto" :style="{ backgroundColor: isDark ? '#1e1e1e' : '#ffffff' }">
        <button class="btn btn-sm btn-outline-success d-md-none mb-3" @click="toggleSidebar">
          <i class="bi bi-list"></i> Menu
        </button>
        <router-view />
      </main>
    </div>

    <!-- Footer -->
    <footer class="text-center py-2 footer">
      <small>&copy; 2025 Computer Management System</small>
    </footer>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const showSidebar = ref(false)
const isDark = ref(false) // Cambia a true para modo oscuro por defecto

const toggleSidebar = () => {
  showSidebar.value = !showSidebar.value
}

const logout = () => {
  localStorage.removeItem('access_token') // Elimina el token del almacenamiento local
  localStorage.removeItem('user') // Elimina el usuario del almacenamiento local                             
  router.push('/')
}
</script>

<style scoped>
/* Sidebar */
.sidebar {
  background-color: #328E6E;
  width: 250px;
  min-height: 100%;
  box-shadow: 2px 0 8px rgba(0, 0, 0, 0.1);
}

/* Header y footer */
.header {
  background-color: #67AE6E;
  color: #fff;
  border-bottom: 1px solid #90C67C;
}

.footer {
  background-color: #67AE6E;
  color: #fff;
  border-top: 1px solid #90C67C;
}

/* Sidebar links */
.sidebar-link {
  color: #ffffff;
  padding: 0.5rem 0.75rem;
  border-radius: 0.375rem;
  transition: all 0.3s ease;
  font-weight: 500;
}
.sidebar-link:hover,
.sidebar-link.router-link-exact-active {
  background-color: #90C67C;
  color: #1e293b;
  padding-left: 1rem;
}

/* Botón de menú responsive */
.btn-outline-success {
  border-color: #81c784;
  color: #81c784;
  font-weight: bold;
  border-radius: 6px;
}
.btn-outline-success:hover {
  background-color: #66bb6a;
  color: white;
  border-color: #66bb6a;
}

/* Ajustes responsive */
@media (max-width: 768px) {
  main {
    padding: 1.5rem 1rem;
  }
}
</style>
