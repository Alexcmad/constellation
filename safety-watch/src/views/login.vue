<template>
    <div class="login-register-container">
      <div class="card-container" ref="cardContainer" :style="{ transform: `translateX(${swipeOffset}px)` }">
        <!-- Login Card -->
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
  
        <!-- Registration Card -->
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
  
  <script>
  export default {
    name: 'LoginRegister',
    data() {
      return {
        loginForm: {
          email: '',
          password: ''
        },
        registerForm: {
          name: '',
          email: '',
          password: '',
          confirmPassword: ''
        },
        swipeOffset: 0,
        startX: 0,
        currentX: 0,
        cardWidth: 0,
        isSwiping: false,
        isRegistrationView: false
      }
    },
    mounted() {
      this.cardWidth = this.$refs.cardContainer.offsetWidth / 2;
      
      // Add touch event listeners
      this.$refs.cardContainer.addEventListener('touchstart', this.touchStart);
      this.$refs.cardContainer.addEventListener('touchmove', this.touchMove);
      this.$refs.cardContainer.addEventListener('touchend', this.touchEnd);
    },
    beforeUnmount() {
      // Remove event listeners
      this.$refs.cardContainer.removeEventListener('touchstart', this.touchStart);
      this.$refs.cardContainer.removeEventListener('touchmove', this.touchMove);
      this.$refs.cardContainer.removeEventListener('touchend', this.touchEnd);
    },
    methods: {
      handleLogin() {
        // Authentication logic here
        console.log('Login attempt with:', this.loginForm);
        // API call would go here
      },
      handleRegister() {
        // Registration validation
        if (this.registerForm.password !== this.registerForm.confirmPassword) {
          alert('Passwords do not match');
          return;
        }
        
        console.log('Registration attempt with:', this.registerForm);
        // API call would go here
      },
      showLogin() {
        this.animateSwipe(0);
        this.isRegistrationView = false;
      },
      showRegister() {
        this.animateSwipe(-this.cardWidth);
        this.isRegistrationView = true;
      },
      touchStart(event) {
        this.startX = event.touches[0].clientX;
        this.currentX = this.startX;
        this.isSwiping = true;
      },
      touchMove(event) {
        if (!this.isSwiping) return;
        
        this.currentX = event.touches[0].clientX;
        const diff = this.currentX - this.startX;
        
        // Calculate the new offset but limit it to the card width
        let newOffset = (this.isRegistrationView ? -this.cardWidth : 0) + diff;
        
        // Apply constraints
        if (newOffset > 0) newOffset = 0;
        if (newOffset < -this.cardWidth) newOffset = -this.cardWidth;
        
        this.swipeOffset = newOffset;
      },
      touchEnd() {
        if (!this.isSwiping) return;
        
        const diff = this.currentX - this.startX;
        
        // Determine whether to snap to login or register view
        if (Math.abs(diff) > this.cardWidth / 3) {
          if (diff > 0 && this.isRegistrationView) {
            // Swiped right from registration to login
            this.showLogin();
          } else if (diff < 0 && !this.isRegistrationView) {
            // Swiped left from login to registration
            this.showRegister();
          } else {
            // Stay on current view
            this.animateSwipe(this.isRegistrationView ? -this.cardWidth : 0);
          }
        } else {
          // Not swiped enough, return to current view
          this.animateSwipe(this.isRegistrationView ? -this.cardWidth : 0);
        }
        
        this.isSwiping = false;
      },
      animateSwipe(targetOffset) {
        // Simple animation
        const startOffset = this.swipeOffset;
        const distance = targetOffset - startOffset;
        const duration = 300; // ms
        const startTime = Date.now();
        
        const animate = () => {
          const elapsedTime = Date.now() - startTime;
          
          if (elapsedTime < duration) {
            // Easing function: cubic-bezier(.17,.67,.83,.67)
            const progress = elapsedTime / duration;
            this.swipeOffset = startOffset + distance * progress;
            requestAnimationFrame(animate);
          } else {
            this.swipeOffset = targetOffset;
            this.isRegistrationView = targetOffset < 0;
          }
        };
        
        requestAnimationFrame(animate);
      }
    }
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