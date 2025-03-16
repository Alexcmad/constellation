<template>
  <div class="login-container">
    <div class="login-card">
      <div class="login-header">
        <div class="logo">
          <shield-alert-icon size="32" class="logo-icon" />
          <h1>Danger Zone</h1>
        </div>
        <p>Community Safety Reporting System</p>
      </div>
      
      <div class="tabs">
        <button 
          :class="{ active: activeTab === 'login' }" 
          @click="activeTab = 'login'"
        >
          Login
        </button>
        <button 
          :class="{ active: activeTab === 'register' }" 
          @click="activeTab = 'register'"
        >
          Register
        </button>
      </div>
      
      <transition name="fade" mode="out-in">
        <form v-if="activeTab === 'login'" @submit.prevent="handleLogin" class="login-form">
          <div class="form-group">
            <label for="email">Email</label>
            <input 
              type="email" 
              id="email" 
              v-model="loginForm.email" 
              required 
              placeholder="Enter your email"
            />
          </div>
          
          <div class="form-group">
            <label for="password">Password</label>
            <div class="password-input">
              <input 
                :type="showPassword ? 'text' : 'password'" 
                id="password" 
                v-model="loginForm.password" 
                required 
                placeholder="Enter your password"
              />
              <button 
                type="button" 
                class="toggle-password" 
                @click="showPassword = !showPassword"
              >
                <eye-icon v-if="!showPassword" size="18" />
                <eye-off-icon v-else size="18" />
              </button>
            </div>
          </div>
          
          <div class="form-group remember-me">
            <label class="checkbox">
              <input type="checkbox" v-model="loginForm.remember" />
              <span>Remember me</span>
            </label>
            <a href="#" class="forgot-password">Forgot password?</a>
          </div>
          
          <button 
            type="submit" 
            class="submit-btn" 
            :disabled="isLoading"
          >
            <loader-icon v-if="isLoading" class="spin" size="18" />
            <span v-else>Login</span>
          </button>
          
          <div v-if="error" class="error-message">
            {{ error }}
          </div>
        </form>
        
        <form v-else @submit.prevent="handleRegister" class="register-form">
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
            <label for="reg-phone">Phone Number</label>
            <input 
              type="tel" 
              id="reg-phone" 
              v-model="registerForm.phone" 
              required 
              placeholder="Enter your phone number"
            />
          </div>
          
          <div class="form-group">
            <label for="reg-password">Password</label>
            <div class="password-input">
              <input 
                :type="showPassword ? 'text' : 'password'" 
                id="reg-password" 
                v-model="registerForm.password" 
                required 
                placeholder="Create a password"
              />
              <button 
                type="button" 
                class="toggle-password" 
                @click="showPassword = !showPassword"
              >
                <eye-icon v-if="!showPassword" size="18" />
                <eye-off-icon v-else size="18" />
              </button>
            </div>
          </div>
          
          <div class="form-group">
            <label for="user-type">Register as</label>
            <select id="user-type" v-model="registerForm.userType" required>
              <option value="CITIZEN">Citizen</option>
              <option value="AUTHORITY">Authority (Requires Verification)</option>
            </select>
          </div>
          
          <div class="form-group terms">
            <label class="checkbox">
              <input type="checkbox" v-model="registerForm.agreeTerms" required />
              <span>I agree to the <a href="#">Terms of Service</a> and <a href="#">Privacy Policy</a></span>
            </label>
          </div>
          
          <button 
            type="submit" 
            class="submit-btn" 
            :disabled="isLoading || !registerForm.agreeTerms"
          >
            <loader-icon v-if="isLoading" class="spin" size="18" />
            <span v-else>Register</span>
          </button>
          
          <div v-if="error" class="error-message">
            {{ error }}
          </div>
        </form>
      </transition>
    </div>
  </div>
</template>
  
<script setup>
import { ref, reactive } from 'vue';
import { ShieldAlertIcon, EyeIcon, EyeOffIcon, LoaderIcon } from 'lucide-vue-next';
import { login, register } from '../services/authService';
import { useRouter } from 'vue-router';

// Router
const router = useRouter();

// Tabs
const activeTab = ref('login');

// Password visibility
const showPassword = ref(false);

// Loading state
const isLoading = ref(false);

// Error message
const error = ref('');

// Login form
const loginForm = reactive({
  email: '',
  password: '',
  remember: false
});

// Register form
const registerForm = reactive({
  name: '',
  email: '',
  phone: '',
  password: '',
  userType: 'CITIZEN',
  agreeTerms: false
});

// Handle login
const handleLogin = async () => {
  try {
    isLoading.value = true;
    error.value = '';

    const response = await login(loginForm.email, loginForm.password);

    // Store token in localStorage
    localStorage.setItem('access_token', response.access_token);
    console.log(response);

    // Redirect to dashboard
    router.push('/auth/dashboard');
  } catch (err) {
    error.value = err.message || 'Login failed. Please try again.';
  } finally {
    isLoading.value = false;
  }
};

// Handle registration
const handleRegister = async () => {
  try {
    isLoading.value = true;
    error.value = '';

    const response = await register(registerForm);

    // After successful registration, switch to login tab
    activeTab.value = 'login';

    // Pre-fill email for convenience
    loginForm.email = registerForm.email;

    // Reset register form
    registerForm.name = '';
    registerForm.email = '';
    registerForm.phone = '';
    registerForm.password = '';
    registerForm.userType = 'CITIZEN';
    registerForm.agreeTerms = false;

    // Show success message
    error.value = 'Registration successful! Please login.';
  } catch (err) {
    error.value = err.message || 'Registration failed. Please try again.';
  } finally {
    isLoading.value = false;
  }
};
</script>
  
  <style scoped>
  .login-container {
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 100vh;
    background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
    padding: 20px;
  }
  
  .login-card {
    width: 100%;
    max-width: 450px;
    background-color: white;
    border-radius: 12px;
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
    overflow: hidden;
    animation: card-appear 0.5s ease-out;
  }
  
  @keyframes card-appear {
    from {
      opacity: 0;
      transform: translateY(20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
  
  .login-header {
    padding: 30px;
    background: linear-gradient(135deg, var(--primary-color) 0%, #0043ce 100%);
    color: white;
    text-align: center;
  }
  
  .logo {
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 10px;
  }
  
  .logo-icon {
    margin-right: 10px;
    animation: pulse 2s infinite;
  }
  
  @keyframes pulse {
    0% {
      transform: scale(1);
    }
    50% {
      transform: scale(1.1);
    }
    100% {
      transform: scale(1);
    }
  }
  
  .logo h1 {
    font-size: 24px;
    font-weight: 700;
  }
  
  .tabs {
    display: flex;
    border-bottom: 1px solid #eee;
  }
  
  .tabs button {
    flex: 1;
    padding: 15px;
    background: none;
    border: none;
    font-size: 16px;
    font-weight: 600;
    color: #666;
    cursor: pointer;
    transition: all 0.3s;
    position: relative;
  }
  
  .tabs button.active {
    color: var(--primary-color);
  }
  
  .tabs button.active::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 0;
    width: 100%;
    height: 3px;
    background-color: var(--primary-color);
    animation: slide-in 0.3s ease-out;
  }
  
  @keyframes slide-in {
    from {
      transform: scaleX(0);
    }
    to {
      transform: scaleX(1);
    }
  }
  
  .login-form, .register-form {
    padding: 30px;
  }
  
  .form-group {
    margin-bottom: 20px;
  }
  
  label {
    display: block;
    margin-bottom: 8px;
    font-weight: 500;
    color: #333;
  }
  
  input, select {
    width: 100%;
    padding: 12px 15px;
    border: 1px solid #ddd;
    border-radius: 6px;
    font-size: 15px;
    transition: border-color 0.3s;
  }
  
  input:focus, select:focus {
    border-color: var(--primary-color);
    outline: none;
    box-shadow: 0 0 0 3px rgba(58, 134, 255, 0.1);
  }
  
  .password-input {
    position: relative;
  }
  
  .toggle-password {
    position: absolute;
    right: 12px;
    top: 50%;
    transform: translateY(-50%);
    background: none;
    border: none;
    color: #666;
    cursor: pointer;
  }
  
  .remember-me {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  
  .checkbox {
    display: flex;
    align-items: center;
    cursor: pointer;
  }
  
  .checkbox input {
    width: auto;
    margin-right: 8px;
  }
  
  .forgot-password {
    color: var(--primary-color);
    text-decoration: none;
    font-size: 14px;
  }
  
  .forgot-password:hover {
    text-decoration: underline;
  }
  
  .submit-btn {
    width: 100%;
    padding: 14px;
    background-color: var(--primary-color);
    color: white;
    border: none;
    border-radius: 6px;
    font-size: 16px;
    font-weight: 600;
    cursor: pointer;
    transition: background-color 0.3s;
    display: flex;
    justify-content: center;
    align-items: center;
  }
  
  .submit-btn:hover {
    background-color: #2a75e8;
  }
  
  .submit-btn:disabled {
    background-color: #a0a0a0;
    cursor: not-allowed;
  }
  
  .error-message {
    margin-top: 15px;
    padding: 10px;
    background-color: #fff0f0;
    border-left: 3px solid var(--danger-color);
    color: #d32f2f;
    font-size: 14px;
    border-radius: 4px;
  }
  
  .terms a {
    color: var(--primary-color);
    text-decoration: none;
  }
  
  .terms a:hover {
    text-decoration: underline;
  }
  
  .spin {
    animation: spin 1s linear infinite;
  }
  
  @keyframes spin {
    from {
      transform: rotate(0deg);
    }
    to {
      transform: rotate(360deg);
    }
  }
  </style>