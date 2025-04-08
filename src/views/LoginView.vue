<template>
    <div class="container mt-5">
      <h2>Login</h2>
      <form @submit.prevent="login">
        <input v-model="email" type="email" class="form-control my-2" placeholder="Email" />
        <input v-model="password" type="password" class="form-control my-2" placeholder="Password" />
        <button class="btn btn-primary">Login</button>
      </form>
    </div>
  </template>
  
  <script setup>
  import { ref } from 'vue'
  import { useRouter } from 'vue-router'
  import { useStore } from 'vuex'
  import Swal from 'sweetalert2'
  
  const router = useRouter()
  const store = useStore()
  const email = ref('')
  const password = ref('')
  
  const login = async () => {
    try {
      const res = await fetch('http://computermanagement-backend.test/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.value, password: password.value })
      })
      const data = await res.json()
      if (res.ok) {
        store.commit('setToken', data.token)
        store.commit('setUser', data.user)
        router.push('/dashboard')
      } else {
        Swal.fire('Error', data.error || 'Login failed', 'error')
      }
    } catch (err) {
      Swal.fire('Error', 'Network error', 'error')
    }
  }
  </script>
  