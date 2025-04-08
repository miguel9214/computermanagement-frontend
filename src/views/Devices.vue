<template>
    <div>
      <h3>Devices</h3>
      <button class="btn btn-primary mb-3" @click="loadDevices">Reload</button>
      <table class="table table-striped">
        <thead>
          <tr>
            <th>Name</th>
            <th>OS</th>
            <th>IP</th>
            <th>Dependency</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="d in devices" :key="d.id">
            <td>{{ d.device_name }}</td>
            <td>{{ d.os }}</td>
            <td>{{ d.ip }}</td>
            <td>{{ d.dependency?.name }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </template>
  
  <script setup>
  import { ref, onMounted } from 'vue'
  import { useStore } from 'vuex'
  import Swal from 'sweetalert2'
  
  const store = useStore()
  const devices = ref([])
  
  const loadDevices = async () => {
    try {
      const res = await fetch('http://computermanagement-backend.test/api/devices', {
        headers: {
          Authorization: `Bearer ${store.state.token}`
        }
      })
      devices.value = await res.json()
    } catch (err) {
      Swal.fire('Error', 'Could not load devices', 'error')
    }
  }
  
  onMounted(loadDevices)
  </script>
  