<template>
  <div class="app-container" :class="{ 'auth-user': isAuthenticated }">
    <router-view v-slot="{ Component }">
      <transition name="fade" mode="out-in">
        <component :is="Component" :user="currentUser" />
      </transition>
    </router-view>
  </div>
</template>

<script setup>
import { ref, onMounted, provide, watch } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { fetchUserProfile } from './services/authService';

const isAuthenticated = ref(false);
const currentUser = ref(null);
const router = useRouter();
const route = useRoute();

// Provide authentication state to child components
provide('isAuthenticated', isAuthenticated);
provide('currentUser', currentUser);

const checkAuth = async () => {
  const token = localStorage.getItem('access_token') || sessionStorage.getItem('access_token');
  if (token) {
    try {
      const userData = await fetchUserProfile(token);
      currentUser.value = userData;
      isAuthenticated.value = true;
      
      // Only redirect if we're on a public route
      if (route.path === '/' || route.path === '/login' || route.path === '/register') {
        router.push('/auth/dashboard');
      }
    } catch (error) {
      console.error('Authentication failed:', error);
      localStorage.removeItem('access_token');
      sessionStorage.removeItem('access_token');
      isAuthenticated.value = false;
      currentUser.value = null;
      router.push('/');
    }
  } else {
    isAuthenticated.value = false;
    currentUser.value = null;
    if (route.meta.requiresAuth) {
      router.push('/');
    }
  }
};

// Watch for token changes
watch(() => localStorage.getItem('access_token') || sessionStorage.getItem('access_token'), 
  (newToken) => {
    if (!newToken) {
      isAuthenticated.value = false;
      currentUser.value = null;
      if (route.meta.requiresAuth) {
        router.push('/');
      }
    } else {
      checkAuth();
    }
  }
);

onMounted(() => {
  checkAuth();
});
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