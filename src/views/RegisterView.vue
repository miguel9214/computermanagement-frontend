<template>
  <div class="register-container">
    <div class="card p-4">
      <h2 class="text-center mb-4 text-dark">Register</h2>
      <form @submit.prevent="register">
        <div class="mb-3">
          <label for="name" class="form-label text-dark">Name</label>
          <input v-model="name" type="text" id="name" class="form-control" placeholder="Enter your name" required />
        </div>

        <div class="mb-3">
          <label for="email" class="form-label text-dark">Email</label>
          <input v-model="email" type="email" id="email" class="form-control" placeholder="Enter your email" required />
        </div>

        <div class="mb-3">
          <label for="password" class="form-label text-dark">Password</label>
          <input v-model="password" type="password" id="password" class="form-control" placeholder="Enter your password" required />
        </div>

        <div class="mb-3">
          <label for="password_confirmation" class="form-label text-dark">Confirm Password</label>
          <input v-model="password_confirmation" type="password" id="password_confirmation" class="form-control" placeholder="Confirm your password" required />
        </div>

        <div class="d-grid gap-2">
          <button type="submit" class="btn btn-submit">
            <i class="bi bi-person-plus"></i> Register
          </button>
        </div>

        <div class="mt-3 text-center">
          <p>Already have an account? <a href="/" class="text-primary">Login here</a></p>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import Swal from 'sweetalert2'
import { useApi } from '@/composables/use-api'

const router = useRouter()
const name = ref('')
const email = ref('')
const password = ref('')
const password_confirmation = ref('')

const register = async () => {
  try {
    await useApi('register', 'POST', {
      name: name.value,
      email: email.value,
      password: password.value,
      password_confirmation: password_confirmation.value,
    })

    Swal.fire('Success', 'Registration successful. You can now log in.', 'success')
    router.push('/')
  } catch (err) {
    Swal.fire('Error', err.error || 'Registration failed', 'error')
  }
}
</script>

<style scoped>
.register-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background-color: #f4f4f4; /* Fondo gris claro */
}

.card {
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 450px; /* Tamaño máximo ajustado */
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
  .register-container {
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
  .register-container {
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
