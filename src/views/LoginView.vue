<template>
  <div class="container mt-5">
    <div class="row justify-content-center">
      <div class="col-md-6 col-lg-4">
        <div class="card shadow-lg p-4">
          <h2 class="text-center mb-4">Login</h2>
          <form @submit.prevent="login">
            <div class="mb-3">
              <label for="email" class="form-label">Email</label>
              <input
                v-model="email"
                type="email"
                id="email"
                class="form-control"
                placeholder="Enter your email"
                required
              />
            </div>

            <div class="mb-3">
              <label for="password" class="form-label">Password</label>
              <input
                v-model="password"
                type="password"
                id="password"
                class="form-control"
                placeholder="Enter your password"
                required
              />
            </div>

            <div class="d-grid gap-2">
              <button type="submit" class="btn btn-primary btn-lg">Login</button>
            </div>

            <div class="mt-3 text-center">
              <p>Don't have an account? <a href="/register">Register here</a></p>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useStore } from 'vuex'
import Swal from 'sweetalert2'
import { useApi } from '@/composables/use-api' // Importar el composable useApi

const router = useRouter()
const store = useStore()
const email = ref('')
const password = ref('')

// Función para el login
const login = async () => {
  try {
    // Usar el composable useApi para enviar la solicitud de login
    const data = await useApi('login', 'POST', {
      email: email.value,
      password: password.value,
    })

    // Si la respuesta es exitosa, guardar el token y usuario en Vuex y localStorage
    store.commit('setToken', data.token)
    store.commit('setUser', data.user)

    localStorage.setItem('access_token', data.token)
    localStorage.setItem('user', JSON.stringify(data.user))

    // Redirigir al dashboard
    router.push('/dashboard')

  } catch (err) {
    // Mostrar un mensaje de error con SweetAlert2
    Swal.fire('Error', err.error || 'Login failed', 'error')
  }
}
</script>

<style scoped>
/* Fondo de pantalla de login */
body {
  background-color: #f8f9fa;
}

/* Agregar sombra a la tarjeta del formulario */
.card {
  border-radius: 12px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

/* Aumentar el tamaño de los botones */
.btn-lg {
  padding: 12px 20px;
  font-size: 18px;
}

h2 {
  font-size: 24px;
  font-weight: bold;
  color: #343a40;
}
</style>
