<template>
  <div class="login-container">
    <div class="card shadow-lg p-4 bg-light-green">
      <h2 class="text-center mb-4 text-dark">Login</h2>
      <form @submit.prevent="login">
        <div class="mb-3">
          <label for="email" class="form-label text-dark">Email</label>
          <div class="input-group">
            <span class="input-group-text"><i class="bi bi-envelope"></i></span>
            <input
              v-model="email"
              type="email"
              id="email"
              class="form-control"
              placeholder="Enter your email"
              required
            />
          </div>
        </div>

        <div class="mb-3">
          <label for="password" class="form-label text-dark">Password</label>
          <div class="input-group">
            <span class="input-group-text"><i class="bi bi-lock"></i></span>
            <input
              v-model="password"
              type="password"
              id="password"
              class="form-control"
              placeholder="Enter your password"
              required
            />
          </div>
        </div>

        <div class="d-grid gap-2">
          <button type="submit" class="btn btn-submit">
            <i class="bi bi-box-arrow-in-right"></i> Login
          </button>
        </div>

        <div class="mt-3 text-center">
          <p>Don't have an account? <a href="/register" class="text-primary">Register here</a></p>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useStore } from 'vuex'
import Swal from 'sweetalert2'
import { useApi } from '@/composables/use-api'

const router = useRouter()
const store = useStore()
const email = ref('')
const password = ref('')

// Función para el login
const login = async () => {
  try {
    const data = await useApi('login', 'POST', {
      email: email.value,
      password: password.value,
    })

    store.commit('setToken', data.token)
    store.commit('setUser', data.user)

    localStorage.setItem('access_token', data.token)
    localStorage.setItem('user', JSON.stringify(data.user))

    router.push('/dashboard')

  } catch (err) {
    Swal.fire('Error', err.error, 'error')
  }
}
</script>

<style scoped>
.login-container {
  padding: 20px;
  max-width: 450px; /* Ajusté el tamaño máximo */
  margin: 0 auto;
}

.card {
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
}

.btn {
  padding: 10px 20px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: bold;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: background-color 0.3s ease;
}

.btn-submit {
  background-color: #81c784; /* Color similar al de la dependencia */
  color: white;
}

.btn-submit:hover {
  background-color: #66bb6a;
}

.input-group-text {
  background-color: #f0f0f0;
  border-color: #ddd;
}

.form-control {
  border-radius: 4px;
}

.form-label {
  font-weight: bold;
}

.text-dark {
  color: #333;
}

.text-center {
  text-align: center;
}

.mt-3 {
  margin-top: 20px;
}

.d-grid {
  display: grid;
  gap: 10px;
}

@media (max-width: 768px) {
  .login-container {
    padding: 15px;
  }

  .card {
    padding: 20px;
  }

  .form-control {
    padding: 12px;
  }

  .btn {
    padding: 12px 24px;
  }

  .text-dark {
    font-size: 18px;
  }
}

@media (max-width: 576px) {
  .login-container {
    padding: 10px;
  }

  .card {
    padding: 15px;
  }

  .form-control {
    padding: 10px;
  }

  .btn {
    padding: 10px 20px;
  }

  .text-dark {
    font-size: 16px;
  }
}
</style>
