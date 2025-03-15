import { createRouter, createWebHistory } from 'vue-router';
import Dashboard from '../views/Dashboard.vue';
import ReportCrime from '../views/ReportCrime.vue';
import CrimeMap from '../views/CrimeMap.vue';
import NearbyAlerts from '../views/NearbyAlerts.vue';
import LoginPage from '../views/LoginPage.vue';
import NotFound from '../views/NotFound.vue';

const routes = [
  {
    path: '/',
    name: 'Login',
    component: LoginPage,
    meta: { requiresAuth: false }
  },
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: Dashboard,
    meta: { requiresAuth: true }
  },
  {
    path: '/report',
    name: 'ReportCrime',
    component: ReportCrime,
    meta: { requiresAuth: true }
  },
  {
    path: '/map',
    name: 'CrimeMap',
    component: CrimeMap,
    meta: { requiresAuth: true }
  },
  {
    path: '/nearby',
    name: 'NearbyAlerts',
    component: NearbyAlerts,
    meta: { requiresAuth: true }
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: NotFound
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

// Navigation guard for authentication
router.beforeEach((to, from, next) => {
  const isAuthenticated = localStorage.getItem('token') !== null;
  
  if (to.matched.some(record => record.meta.requiresAuth) && !isAuthenticated) {
    next('/');
  } else if (to.path === '/' && isAuthenticated) {
    next('/dashboard');
  } else {
    next();
  }
});

export default router;