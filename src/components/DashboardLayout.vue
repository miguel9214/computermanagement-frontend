<template>
  <div :class="`d-flex flex-column vh-100 ${isDark ? 'bg-dark text-light' : 'bg-light text-dark'}`">
    <!-- Header -->
    <header class="px-4 py-3 d-flex justify-content-between align-items-center header">
      <router-link to="/dashboard" class="text-decoration-none text-reset d-flex align-items-center">
        <h5 class="mb-0 fw-semibold">Computer Management</h5>
      </router-link>
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
            <li class="nav-item mb-2">
              <router-link class="nav-link sidebar-link" to="/dashboard/maintenances">
                <i class="bi bi-tools me-2"></i> Mantenimientos
              </router-link>
            </li>
            <li class="nav-item mb-2">
              <router-link class="nav-link sidebar-link" to="/dashboard/peripheral-changes">
                <i class="bi bi-arrow-repeat me-2"></i> Cambios
              </router-link>
            </li>
          </ul>
        </nav>
      </aside>

      <!-- Main content -->
      <main class="flex-grow-1 p-4 d-flex flex-column overflow-auto" :style="{ backgroundColor: isDark ? '#1e1e1e' : '#ffffff' }">
        <button class="btn btn-sm btn-outline-success d-md-none mb-3" @click="toggleSidebar">
          <i class="bi bi-list"></i> Menu
        </button>

        <!-- Dashboard Cards -->
        <div v-if="isDashboardHome" class="dashboard-cards">
          <div
            v-for="card in cards"
            :key="card.title"
            class="card card-dashboard text-center"
          >
            <router-link :to="card.link" class="text-decoration-none text-reset h-100 d-flex flex-column">
              <div class="card-body d-flex flex-column align-items-center justify-content-center flex-grow-1">
                <div class="icon-circle mb-3">
                  <i :class="card.icon + ' card-icon'"></i>
                </div>
                <h6 class="card-title mb-1">{{ card.title }}</h6>
                <p class="card-count mb-0">{{ card.count }}</p>
              </div>
            </router-link>
          </div>
        </div>

        <!-- Nested Views -->
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
import { ref, reactive, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useApi } from '@/composables/use-api'

const router = useRouter()
const route = useRoute()

const showSidebar = ref(false)
const isDark = ref(false)

const toggleSidebar = () => showSidebar.value = !showSidebar.value
const logout = () => {
  localStorage.removeItem('access_token')
  localStorage.removeItem('user')
  router.push('/')
}

const isDashboardHome = computed(() => route.path === '/dashboard')

const counts = reactive({ devices: 0, dependencies: 0, printers: 0, scanners: 0, maintenances: 0, peripheralChanges: 0 })

async function fetchCount(resource) {
  try {
    const resp = await useApi(`${resource}?page=1&per_page=1`)
    return resp.data.total
  } catch {
    return 0
  }
}

async function loadCounts() {
  counts.devices          = await fetchCount('devices')
  counts.dependencies     = await fetchCount('dependencies')
  counts.printers         = await fetchCount('printers')
  counts.scanners         = await fetchCount('scanners')
  counts.maintenances     = await fetchCount('maintenances')
  counts.peripheralChanges = await fetchCount('peripheral-changes')
}

const cards = [
  { title: 'Dispositivos',   icon: 'bi bi-hdd-stack', count: computed(() => counts.devices),           link: '/dashboard/devices' },
  { title: 'Dependencias',   icon: 'bi bi-diagram-3',  count: computed(() => counts.dependencies),      link: '/dashboard/dependencies' },
  { title: 'Impresoras',     icon: 'bi bi-printer',    count: computed(() => counts.printers),          link: '/dashboard/printers' },
  { title: 'Escáneres',      icon: 'bi bi-upc-scan',   count: computed(() => counts.scanners),          link: '/dashboard/scanners' },
  { title: 'Mantenimientos', icon: 'bi bi-tools',      count: computed(() => counts.maintenances),      link: '/dashboard/maintenances' },
  { title: 'Cambios',        icon: 'bi bi-arrow-repeat', count: computed(() => counts.peripheralChanges), link: '/dashboard/peripheral-changes' },
]

onMounted(loadCounts)
</script>

<style scoped>
/* Sidebar */
.sidebar {
  background-color: #328E6E;
  width: 250px;
  min-height: 100%;
  box-shadow: 2px 0 8px rgba(0,0,0,0.1);
}

/* Header & Footer */
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
  color: #fff;
  padding: .5rem .75rem;
  border-radius: .375rem;
  transition: all .3s ease;
  font-weight: 500;
}
.sidebar-link:hover,
.sidebar-link.router-link-exact-active {
  background-color: #90C67C;
  color: #1e293b;
  padding-left: 1rem;
}

/* Responsive menu button */
.btn-outline-success {
  border-color: #81c784;
  color: #81c784;
  font-weight: bold;
  border-radius: 6px;
}
.btn-outline-success:hover {
  background-color: #66bb6a;
  color: #fff;
  border-color: #66bb6a;
}

/* Centered dashboard cards container */
.dashboard-cards {
  flex: 1;
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  align-items: center;
  gap: 1.5rem;
  margin: 0; /* elimina margen inferior */
}

/* Card base */
.card-dashboard {
  flex: 1 1 180px;
  max-width: 220px;
  height: 180px;
  border: none;
  border-left: 6px solid transparent;
  border-radius: .75rem;
  box-shadow: 0 8px 20px rgba(0,0,0,0.05);
  transition: transform .2s, box-shadow .2s;
  background: #fff;
}
.card-dashboard:hover {
  transform: translateY(-6px);
  box-shadow: 0 12px 28px rgba(0,0,0,0.1);
}

/* Colored left border per card */
.dashboard-cards .card-dashboard:nth-child(1) { border-color: #C6D6A3; }
.dashboard-cards .card-dashboard:nth-child(2) { border-color: #a1c2f0; }
.dashboard-cards .card-dashboard:nth-child(3) { border-color: #f28b82; }
.dashboard-cards .card-dashboard:nth-child(4) { border-color: #81c784; }
.dashboard-cards .card-dashboard:nth-child(5) { border-color: #ffd54f; }
.dashboard-cards .card-dashboard:nth-child(6) { border-color: #ba68c8; }

/* Icon circle */
.icon-circle {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: rgba(50,142,110,0.1);
  display: flex;
  align-items: center;
  justify-content: center;
}
.card-dashboard:nth-child(1) .icon-circle { background: rgba(198,214,163,0.2); }
.card-dashboard:nth-child(2) .icon-circle { background: rgba(161,194,240,0.2); }
.card-dashboard:nth-child(3) .icon-circle { background: rgba(242,139,130,0.2); }
.card-dashboard:nth-child(4) .icon-circle { background: rgba(129,199,132,0.2); }
.card-dashboard:nth-child(5) .icon-circle { background: rgba(255,213,79,0.2); }
.card-dashboard:nth-child(6) .icon-circle { background: rgba(186,104,200,0.2); }

.card-icon {
  font-size: 1.75rem;
}
.card-dashboard:nth-child(1) .card-icon { color: #C6D6A3; }
.card-dashboard:nth-child(2) .card-icon { color: #a1c2f0; }
.card-dashboard:nth-child(3) .card-icon { color: #f28b82; }
.card-dashboard:nth-child(4) .card-icon { color: #81c784; }
.card-dashboard:nth-child(5) .card-icon { color: #ffd54f; }
.card-dashboard:nth-child(6) .card-icon { color: #ba68c8; }

.card-title {
  font-size: 1rem;
  font-weight: 600;
  color: #3c3c3c;
}
.card-count {
  font-size: 2rem;
  font-weight: bold;
  color: #333;
}

/* Responsive */
@media (max-width: 768px) {
  main {
    padding: 1.5rem 1rem;
  }
  .dashboard-cards {
    gap: 1rem;
  }
}
</style>
