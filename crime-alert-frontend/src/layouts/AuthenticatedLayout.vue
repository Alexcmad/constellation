<template>
    <div class="app-layout">
      <header class="app-header">
        <div class="header-left">
          <button class="menu-toggle" @click="isSidebarOpen = !isSidebarOpen">
            <menu-icon v-if="!isSidebarOpen" />
            <x-icon v-else />
          </button>
          <div class="logo">
            <shield-alert-icon size="24" class="logo-icon" />
            <h1>Danger Zone</h1>
          </div>
        </div>
        
        <div class="header-right">
          <div class="location-info" v-if="currentLocation">
            <map-pin-icon size="16" />
            <span>{{ locationName }}</span>
          </div>
          
          <div class="user-menu">
            <button class="user-button" @click="isUserMenuOpen = !isUserMenuOpen">
              <div class="avatar" :class="{ 'authority': user.role === 'AUTHORITY' }">
                {{ userInitials }}
              </div>
              <span class="user-name">{{ user.name }}</span>
              <chevron-down-icon size="16" />
            </button>
            
            <div class="dropdown-menu" v-if="isUserMenuOpen" v-click-outside="closeUserMenu">
              <div class="user-info">
                <div class="avatar" :class="{ 'authority': user.role === 'AUTHORITY' }">
                  {{ userInitials }}
                </div>
                <div>
                  <div class="user-name">{{ user.name }}</div>
                  <div class="user-email">{{ user.email }}</div>
                  <div class="user-role">{{ user.role === 'AUTHORITY' ? 'Authority' : 'Citizen' }}</div>
                </div>
              </div>
              <div class="menu-items">
                <router-link to="/profile" class="menu-item">
                  <user-icon size="16" />
                  <span>Profile</span>
                </router-link>
                <router-link to="/settings" class="menu-item">
                  <settings-icon size="16" />
                  <span>Settings</span>
                </router-link>
                <button @click="handleLogout" class="menu-item logout">
                  <log-out-icon size="16" />
                  <span>Logout</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>
      
      <div class="app-body">
        <aside class="sidebar" :class="{ 'open': isSidebarOpen }">
          <nav class="sidebar-nav">
            <router-link to="/dashboard" class="nav-item" active-class="active">
              <layout-dashboard-icon size="20" />
              <span>Dashboard</span>
            </router-link>
            <router-link to="/report" class="nav-item" active-class="active">
              <alert-triangle-icon size="20" />
              <span>Report an Emergency</span>
            </router-link>
            <router-link to="/map" class="nav-item" active-class="active">
              <map-icon size="20" />
              <span>View Map</span>
            </router-link>
            <router-link to="/nearby" class="nav-item" active-class="active">
              <navigation-icon size="20" />
              <span>Nearby Alerts</span>
            </router-link>
          </nav>
          
          <div class="sidebar-footer">
            <div class="emergency-call">
              <phone-call-icon size="20" />
              <span>Emergency: 119</span>
            </div>
          </div>
        </aside>
        
        <main class="main-content">
          <transition name="fade" mode="out-in">
            <slot></slot>
          </transition>
        </main>
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref, computed, onMounted, onUnmounted, watch } from 'vue';
  import { useRouter } from 'vue-router';
  import { 
    ShieldAlertIcon, MenuIcon, XIcon, MapPinIcon, ChevronDownIcon,
    UserIcon, SettingsIcon, LogOutIcon
  } from 'lucide-vue-next';
  import { getCurrentLocation, getLocationName } from '../services/locationService';
  
  const props = defineProps({
    user: {
      type: Object,
      required: true
    }
  });
  
  const emit = defineEmits(['logout']);
  const router = useRouter();
  const isSidebarOpen = ref(false);
  const isUserMenuOpen = ref(false);
  const currentLocation = ref(null);
  const locationName = ref('Fetching location...');
  
  const userInitials = computed(() => {
    if (!props.user.name) return '';
    return props.user.name.split(' ').map(name => name[0]).join('').toUpperCase().substring(0, 2);
  });
  
  const toggleUserMenu = () => {
    isUserMenuOpen.value = !isUserMenuOpen.value;
  };
  
  const closeUserMenu = () => {
    isUserMenuOpen.value = false;
  };
  
  const handleClickOutside = (e) => {
    if (!e.target.closest('.user-menu')) {
      isUserMenuOpen.value = false;
    }
  };
  
  onMounted(async () => {
    try {
      currentLocation.value = await getCurrentLocation();
      if (currentLocation.value) {
        locationName.value = await getLocationName(
          currentLocation.value.latitude,
          currentLocation.value.longitude
        );
      }
    } catch (error) {
      console.error('Error getting location:', error);
      locationName.value = 'Location unavailable';
    }
    isSidebarOpen.value = window.innerWidth >= 768;
    document.addEventListener('click', handleClickOutside);
  });
  
  onUnmounted(() => {
    document.removeEventListener('click', handleClickOutside);
  });
  </script>
  
  
  <style scoped>
  .app-layout {
    display: flex;
    flex-direction: column;
    min-height: 100vh;
  }
  
  .app-header {
    height: 64px;
    background: radial-gradient(y);
    border-bottom: 1px solid #6b5d23;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 20px;
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    z-index: 100;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  }
  
  .header-left {
    display: flex;
    align-items: center;
  }
  
  .menu-toggle {
    background: none;
    border: none;
    color: #333;
    margin-right: 15px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 8px;
    border-radius: 8px;
    transition: background-color 0.2s;
  }
  
  .menu-toggle:hover {
    background-color: #f5f5f5;
  }
  
  .logo {
    display: flex;
    align-items: center;
  }
  
  .logo-icon {
    color: var(--primary-color);
    margin-right: 10px;
  }
  
  .logo h1 {
    font-size: 18px;
    font-weight: 700;
    color: #333;
  }
  
  .header-right {
    display: flex;
    align-items: center;
    gap: 20px;
  }
  
  .location-info {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 14px;
    color: #666;
    background-color: #f5f7fa;
    padding: 6px 12px;
    border-radius: 20px;
  }
  
  .user-menu {
    position: relative;
  }
  
  .user-button {
    display: flex;
    align-items: center;
    gap: 8px;
    background: none;
    border: none;
    cursor: pointer;
    padding: 6px 10px;
    border-radius: 20px;
    transition: background-color 0.2s;
  }
  
  .user-button:hover {
    background-color: #f5f5f5;
  }
  
  .avatar {
    width: 32px;
    height: 32px;
    border-radius: 50%;
    background-color: var(--primary-color);
    color: white;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 600;
    font-size: 14px;
  }
  
  .avatar.authority {
    background-color: var(--secondary-color);
  }
  
  .user-name {
    font-size: 14px;
    font-weight: 500;
  }
  
  .dropdown-menu {
    position: absolute;
    top: 100%;
    right: 0;
    margin-top: 10px;
    background-color: white;
    border-radius: 8px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
    width: 250px;
    z-index: 10;
    overflow: hidden;
    animation: dropdown-appear 0.2s ease-out;
  }
  
  @keyframes dropdown-appear {
    from {
      opacity: 0;
      transform: translateY(-10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
  
  .user-info {
    padding: 15px;
    display: flex;
    gap: 12px;
    border-bottom: 1px solid #eee;
  }
  
  .user-info .avatar {
    width: 40px;
    height: 40px;
    font-size: 16px;
  }
  
  .user-email {
    font-size: 12px;
    color: #666;
    margin-top: 2px;
  }
  
  .user-role {
    font-size: 12px;
    color: #666;
    margin-top: 2px;
    font-weight: 500;
  }
  
  .menu-items {
    padding: 8px;
  }
  
  .menu-item {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 10px 12px;
    color: #333;
    text-decoration: none;
    border-radius: 6px;
    transition: background-color 0.2s;
    font-size: 14px;
  }
  
  .menu-item:hover {
    background-color: #f5f5f5;
  }
  
  .menu-item.logout {
    color: var(--danger-color);
  }
  
  .app-body {
    display: flex;
    flex: 1;
    margin-top: 64px;
  }
  
  .sidebar {
    width: 250px;
    background-color: white;
    border-right: 1px solid #eaeaea;
    height: calc(100vh - 64px);
    position: fixed;
    left: 0;
    top: 64px;
    z-index: 90;
    display: flex;
    flex-direction: column;
    transition: transform 0.3s ease;
  }
  
  @media (max-width: 768px) {
    .sidebar {
      transform: translateX(-100%);
    }
    
    .sidebar.open {
      transform: translateX(0);
    }
  }
  
  .sidebar-nav {
    flex: 1;
    padding: 20px 0;
  }
  
  .nav-item {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 12px 20px;
    color: #555;
    text-decoration: none;
    transition: all 0.2s;
    position: relative;
  }
  
  .nav-item:hover {
    background-color: #f5f7fa;
    color: var(--primary-color);
  }
  
  .nav-item.active {
    color: var(--primary-color);
    background-color: #eef3ff;
    font-weight: 500;
  }
  
  .nav-item.active::before {
    content: '';
    position: absolute;
    left: 0;
    top: 0;
    bottom: 0;
    width: 4px;
    background-color: var(--primary-color);
  }
  
  .sidebar-footer {
    padding: 15px 20px;
    border-top: 1px solid #eaeaea;
  }
  
  .emergency-call {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 10px;
    background-color: #fff0f0;
    color: var(--danger-color);
    border-radius: 8px;
    font-weight: 500;
  }
  
  .main-content {
    flex: 1;
    padding: 20px;
    margin-left: 250px;
    min-height: calc(100vh - 64px);
  }
  
  @media (max-width: 768px) {
    .main-content {
      margin-left: 0;
    }
  }
  </style>