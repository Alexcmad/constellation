<template>
  <div class="app-container" :class="{ 'auth-user': isAuthenticated }">
    <transition name="fade" mode="out-in">
      <login-page v-if="!isAuthenticated" @login-success="handleLoginSuccess" />
      <authenticated-layout v-else :user="currentUser" @logout="handleLogout">
        <router-view />
      </authenticated-layout>
    </transition>
  </div>
</template>

<script setup>
import { ref, onMounted, provide } from 'vue';
import { useRouter } from 'vue-router';
import LoginPage from './views/LoginPage.vue';
import AuthenticatedLayout from './layouts/AuthenticatedLayout.vue';
import { fetchUserProfile } from './services/authService';

const isAuthenticated = ref(false);
const currentUser = ref(null);
const router = useRouter();

// Provide authentication state to child components
provide('isAuthenticated', isAuthenticated);
provide('currentUser', currentUser);

onMounted(async () => {
  // Check if user is already logged in (token in localStorage)
  const token = localStorage.getItem('token');
  if (token) {
    try {
      const userData = await fetchUserProfile(token);
      currentUser.value = userData;
      isAuthenticated.value = true;
      router.push('/dashboard');
    } catch (error) {
      console.error('Authentication failed:', error);
      localStorage.removeItem('token');
    }
  }
});

const handleLoginSuccess = (userData) => {
  currentUser.value = userData;
  isAuthenticated.value = true;
  router.push('/dashboard');
};

const handleLogout = () => {
  localStorage.removeItem('token');
  isAuthenticated.value = false;
  currentUser.value = null;
  router.push('/');
};
</script>

<style>
.app-container {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

/* Transitions */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>