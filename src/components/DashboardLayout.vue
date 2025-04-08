<template>
    <div class="d-flex">
      <!-- Sidebar -->
      <div class="bg-dark text-white p-3 vh-100" style="width: 250px;">
        <h4>Admin Panel</h4>
        <ul class="nav flex-column">
          <li class="nav-item"><router-link class="nav-link text-white" to="/dashboard/devices">Devices</router-link></li>
          <li class="nav-item"><router-link class="nav-link text-white" to="/dashboard/dependencies">Dependencies</router-link></li>
          <li class="nav-item"><router-link class="nav-link text-white" to="/dashboard/printers">Printers</router-link></li>
          <li class="nav-item"><router-link class="nav-link text-white" to="/dashboard/scanners">Scanners</router-link></li>
          <li class="nav-item"><button class="btn btn-sm btn-danger mt-3" @click="logout">Logout</button></li>
        </ul>
      </div>
  
      <!-- Main content -->
      <div class="flex-grow-1 p-4">
        <router-view />
      </div>
    </div>
  </template>
  
  <script setup>
  import { useStore } from 'vuex'
  import { useRouter } from 'vue-router'
  
  const store = useStore()
  const router = useRouter()
  
  const logout = () => {
    store.commit('logout')
    router.push('/')
  }
  </script>
  