import { createRouter, createWebHistory } from 'vue-router'
import LoginView from '../views/LoginView.vue'
import DashboardLayout from '../components/DashboardLayout.vue'
import Devices from '../views/Devices.vue'
import Dependencies from '../views/Dependencies.vue'
import Printers from '../views/Printers.vue'
import Scanners from '../views/Scanners.vue'
import Maintenances from '../views/Maintenances.vue'
import PeripheralChanges from '../views/PeripheralChanges.vue'
import store from '../store'
import RegisterView from '../views/RegisterView.vue'

const routes = [
  { path: '/', component: LoginView },
  { path: '/register', component: RegisterView},
  {
    path: '/dashboard',
    component: DashboardLayout,
    children: [
      { path: 'devices', component: Devices },
      { path: 'dependencies', component: Dependencies },
      { path: 'printers', component: Printers },
      { path: 'scanners', component: Scanners },
      { path: 'maintenances', component: Maintenances },
      { path: 'peripheral-changes', component: PeripheralChanges },
    ],
    meta: { requiresAuth: true }
  }
]

const router = createRouter({ history: createWebHistory(), routes })

router.beforeEach((to, from, next) => {
  if (to.meta.requiresAuth && !store.state.token) {
    next('/')
  } else {
    next()
  }
})

export default router
