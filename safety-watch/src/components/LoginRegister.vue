<template>
  <div class="login-register-container">
    <div class="card-container" ref="cardContainer" :style="{ transform: `translateX(${swipeOffset}px)` }">
     
      <!-------- Login Card -------->
      <div class="card login-card">
        <h2>Login</h2>
        <form @submit.prevent="handleLogin">
          <div class="form-group">
            <label for="login-email">Email</label>
            <input 
              type="email" 
              id="login-email" 
              v-model="loginForm.email" 
              required
              placeholder="Enter your email"
            />
          </div>
          <div class="form-group">
            <label for="login-password">Password</label>
            <input 
              type="password" 
              id="login-password" 
              v-model="loginForm.password" 
              required
              placeholder="Enter your password"
            />
          </div>
          <div class="forgot-password">
            <a href="#">Forgot Password?</a>
          </div>
          <button type="submit" class="btn-primary">Login</button>
          <p v-if="loginError" class="error-message">{{ loginError }}</p>
        </form>
        <div class="card-footer">
          <p>Don't have an account?</p>
          <button @click="showRegister" class="btn-text">Register</button>
        </div>
        <div class="swipe-hint">
          <p>Swipe left to register</p>
          <span class="arrow">→</span>
        </div>
      </div>

      <!----- Registration Card --->
      <div class="card register-card">
        <h2>Create Account</h2>
        <form @submit.prevent="handleRegister">
          <div class="form-group">
            <label for="reg-name">Full Name</label>
            <input 
              type="text" 
              id="reg-name" 
              v-model="registerForm.name" 
              required
              placeholder="Enter your full name"
            />
          </div>
          <div class="form-group">
            <label for="reg-email">Email</label>
            <input 
              type="email" 
              id="reg-email" 
              v-model="registerForm.email" 
              required
              placeholder="Enter your email"
            />
          </div>
          <div class="form-group">
            <label for="reg-password">Password</label>
            <input 
              type="password" 
              id="reg-password" 
              v-model="registerForm.password" 
              required
              placeholder="Create a password"
            />
          </div>
          <div class="form-group">
            <label for="reg-confirm-password">Confirm Password</label>
            <input 
              type="password" 
              id="reg-confirm-password" 
              v-model="registerForm.confirmPassword" 
              required
              placeholder="Confirm your password"
            />
          </div>
          <button type="submit" class="btn-primary">Register</button>
          <p v-if="registerError" class="error-message">{{ registerError }}</p>
        </form>
        <div class="card-footer">
          <p>Already have an account?</p>
          <button @click="showLogin" class="btn-text">Login</button>
        </div>
        <div class="swipe-hint">
          <span class="arrow">←</span>
          <p>Swipe right to login</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

const loginForm = ref({
  email: '',
  password: ''
})

const registerForm = ref({
  name: '',
  email: '',
  password: '',
  confirmPassword: ''
})

const swipeOffset = ref(0)
const startX = ref(0)
const currentX = ref(0)
const cardWidth = ref(0)
const isSwiping = ref(false)
const isRegistrationView = ref(false)
const loginError = ref('')
const registerError = ref('')
const cardContainer = ref(null)

// Temporary storage for registered users
const users = ref([
  // Pre-registered test account
  {
    email: 'test@example.com',
    password: 'password123',
    name: 'Test User'
  }
])

onMounted(() => {
  cardWidth.value = cardContainer.value.offsetWidth / 2
  
  // Add touch event listeners
  cardContainer.value.addEventListener('touchstart', touchStart)
  cardContainer.value.addEventListener('touchmove', touchMove)
  cardContainer.value.addEventListener('touchend', touchEnd)
})

onBeforeUnmount(() => {
  // Remove event listeners
  cardContainer.value.removeEventListener('touchstart', touchStart)
  cardContainer.value.removeEventListener('touchmove', touchMove)
  cardContainer.value.removeEventListener('touchend', touchEnd)
})

const handleLogin = async () => {
  loginError.value = ''
  
  const user = users.value.find(u => u.email === loginForm.value.email)
  
  if (!user) {
    loginError.value = 'User not found'
    return
  }
  
  if (user.password !== loginForm.value.password) {
    loginError.value = 'Invalid password'
    return
  }
  
  // Store user info and redirect
  localStorage.setItem('userName', user.name)
  await router.push('/home')
}

const handleRegister = () => {
  registerError.value = ''
  
  if (registerForm.value.password !== registerForm.value.confirmPassword) {
    registerError.value = 'Passwords do not match'
    return
  }
  
  if (users.value.some(u => u.email === registerForm.value.email)) {
    registerError.value = 'Email already registered'
    return
  }
  
  const newUser = {
    email: registerForm.value.email,
    password: registerForm.value.password,
    name: registerForm.value.name
  }
  
  users.value.push(newUser)
  
  // Clear form and show success message
  alert('Registration successful! Please login.')
  showLogin()
  registerForm.value = {
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  }
}

const showLogin = () => {
  animateSwipe(0)
  isRegistrationView.value = false
}

const showRegister = () => {
  animateSwipe(-cardWidth.value)
  isRegistrationView.value = true
}

const touchStart = (event) => {
  startX.value = event.touches[0].clientX
  currentX.value = startX.value
  isSwiping.value = true
}

const touchMove = (event) => {
  if (!isSwiping.value) return
  
  currentX.value = event.touches[0].clientX
  const diff = currentX.value - startX.value
  
  // Calculate the new offset but limit it to the card width
  let newOffset = (isRegistrationView.value ? -cardWidth.value : 0) + diff
  
  // Apply constraints
  if (newOffset > 0) newOffset = 0
  if (newOffset < -cardWidth.value) newOffset = -cardWidth.value
  
  swipeOffset.value = newOffset
}

const touchEnd = () => {
  if (!isSwiping.value) return
  
  const diff = currentX.value - startX.value
  
  // Determine whether to snap to login or register view
  if (Math.abs(diff) > cardWidth.value / 3) {
    if (diff > 0 && isRegistrationView.value) {
      // Swiped right from registration to login
      showLogin()
    } else if (diff < 0 && !isRegistrationView.value) {
      // Swiped left from login to registration
      showRegister()
    } else {
      // Stay on current view
      animateSwipe(isRegistrationView.value ? -cardWidth.value : 0)
    }
  } else {
    // Not swiped enough, return to current view
    animateSwipe(isRegistrationView.value ? -cardWidth.value : 0)
  }
  
  isSwiping.value = false
}

const animateSwipe = (targetOffset) => {
  // Simple animation
  const startOffset = swipeOffset.value
  const distance = targetOffset - startOffset
  const duration = 300 // ms
  const startTime = Date.now()
  
  const animate = () => {
    const elapsedTime = Date.now() - startTime
    
    if (elapsedTime < duration) {
      // Easing function: cubic-bezier(.17,.67,.83,.67)
      const progress = elapsedTime / duration
      swipeOffset.value = startOffset + distance * progress
      requestAnimationFrame(animate)
    } else {
      swipeOffset.value = targetOffset
      isRegistrationView.value = targetOffset < 0
    }
  }
  
  requestAnimationFrame(animate)
}
</script>

<style scoped>
.login-register-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background-color: #f5f5f5;
  overflow: hidden;
  font-family: 'Roboto', sans-serif;
}

.card-container {
  display: flex;
  transition: transform 0.3s ease;
  width: 200%; /* Double width to contain both cards */
  will-change: transform;
}

.card {
  width: 50%; /* Each card takes half of container width */
  background-color: #ffffff;
  border-radius: 10px;
  padding: 2rem;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  box-sizing: border-box;
}

.login-card, .register-card {
  flex-shrink: 0;
}

h2 {
  text-align: center;
  color: #333;
  margin-bottom: 1.5rem;
}

.form-group {
  margin-bottom: 1rem;
}

label {
  display: block;
  margin-bottom: 0.5rem;
  color: #555;
  font-size: 0.9rem;
}

input {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
  transition: border-color 0.3s;
}

input:focus {
  outline: none;
  border-color: #4a90e2;
}

.forgot-password {
  text-align: right;
  margin-bottom: 1rem;
}

.forgot-password a {
  color: #4a90e2;
  text-decoration: none;
  font-size: 0.8rem;
}

.btn-primary {
  width: 100%;
  padding: 0.75rem;
  background-color: #4a90e2;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 1rem;
  cursor: pointer;
  transition: background-color 0.3s;
}

.btn-primary:hover {
  background-color: #3a80d2;
}

.card-footer {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-top: 1.5rem;
}

.card-footer p {
  margin: 0;
  margin-right: 0.5rem;
  color: #666;
}

.btn-text {
  background: none;
  border: none;
  color: #4a90e2;
  font-weight: bold;
  cursor: pointer;
  padding: 0;
}

.swipe-hint {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-top: 1.5rem;
  color: #999;
  font-size: 0.8rem;
}

.arrow {
  margin: 0 0.5rem;
  font-size: 1.2rem;
}

.error-message {
  color: #dc3545;
  margin-top: 1rem;
  text-align: center;
  font-size: 0.9rem;
}

/* Media Queries for Responsiveness */
@media (min-width: 768px) {
  .card {
    max-width: 400px;
    padding: 2.5rem;
  }
}

@media (max-width: 480px) {
  .card {
    padding: 1.5rem;
  }
}
</style>