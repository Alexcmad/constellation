import { createRouter, createWebHistory } from 'vue-router';
import Dashboard from '../views/Dashboard.vue';
import ReportCrime from '../views/ReportCrime.vue';
import CrimeMap from '../views/CrimeMap.vue';
import NearbyAlerts from '../views/NearbyAlerts.vue';
import LoginPage from '../views/LoginPage.vue';
import NotFound from '../views/NotFound.vue';
import AuthenticatedLayout from '../layouts/AuthenticatedLayout.vue';

const routes = [
  {
    path: '/',
    name: 'Login',
    component: LoginPage,
    meta: { requiresAuth: false }
  },
  {
    path: '/auth',
    component: AuthenticatedLayout,
    meta: { requiresAuth: true },
    children: [
      {
        path: '',
        redirect: { name: 'Dashboard' }
      },
      {
        path: 'dashboard',
        name: 'Dashboard',
        component: Dashboard
      },
      {
        path: 'report',
        name: 'ReportCrime',
        component: ReportCrime
      },
      {
        path: 'map',
        name: 'CrimeMap',
        component: CrimeMap
      },
      {
        path: 'nearby',
        name: 'NearbyAlerts',
        component: NearbyAlerts
      }
    ]
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
  const publicRoutes = ['/', '/login', '/register'];
  const requiresAuth = !publicRoutes.includes(to.path);
  
  const hasToken = localStorage.getItem('access_token') || sessionStorage.getItem('access_token');
  
  if (requiresAuth && !hasToken) {
    console.log('Unauthorized access attempt, redirecting to login');
    return next('/');
  } else if (!requiresAuth && hasToken) {
    console.log('Authenticated user accessing public route');
    return next('/auth/dashboard');
  } else {
    return next();
  }
});

export default router;