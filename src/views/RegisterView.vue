<template>
    <div class="container mt-5">
      <div class="row justify-content-center">
        <div class="col-md-6 col-lg-4">
          <div class="card shadow-lg p-4">
            <h2 class="text-center mb-4">Register</h2>
            <form @submit.prevent="register">
              <div class="mb-3">
                <label for="name" class="form-label">Name</label>
                <input
                  v-model="name"
                  type="text"
                  id="name"
                  class="form-control"
                  placeholder="Enter your name"
                  required
                />
              </div>
  
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
  
              <div class="mb-3">
                <label for="password_confirmation" class="form-label">Confirm Password</label>
                <input
                  v-model="password_confirmation"
                  type="password"
                  id="password_confirmation"
                  class="form-control"
                  placeholder="Confirm your password"
                  required
                />
              </div>
  
              <div class="d-grid gap-2">
                <button type="submit" class="btn btn-primary btn-lg">Register</button>
              </div>
  
              <div class="mt-3 text-center">
                <p>Already have an account? <a href="/login">Login here</a></p>
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
  import Swal from 'sweetalert2'
  import { useApi } from '@/composables/use-api' // Importar el composable useApi
  
  const router = useRouter()
  const name = ref('')
  const email = ref('')
  const password = ref('')
  const password_confirmation = ref('')
  
  // Función para el registro
  const register = async () => {
    try {
      // Usar el composable useApi para enviar la solicitud de registro
      const data = await useApi('register', 'POST', {
        name: name.value,
        email: email.value,
        password: password.value,
        password_confirmation: password_confirmation.value,
      })
  
      // Si la respuesta es exitosa, redirigir al login
      Swal.fire('Success', 'Registration successful. You can now log in.', 'success')
      router.push('/login')
  
    } catch (err) {
      // Mostrar un mensaje de error con SweetAlert2
      Swal.fire('Error', err.error || 'Registration failed', 'error')
    }
  }
  </script>
  
  <style scoped>
  /* Fondo de pantalla de registro */
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
  