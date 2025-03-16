import { createRouter, createWebHistory } from 'vue-router'
import LoginRegister from '../components/LoginRegister.vue'
import Home from '../views/Home.vue' // Ensure you have this component for your home page

const routes = [
  {
    path: '/',
    redirect: '/login' // Redirect to login when visiting the root path
  },
  {
    path: '/login',
    name: 'Login',
    component: LoginRegister,
    beforeEnter: (to, from, next) => {
      // If user is already logged in, redirect to Home page
      if (localStorage.getItem('userName')) {
        next('/home');
      } else {
        next(); // Proceed with the login page if not logged in
      }
    }
  },
  {
    path: '/home',
    name: 'Home',
    component: Home,
    beforeEnter: (to, from, next) => {
      // Check if the user is logged in, else redirect to login
      if (!localStorage.getItem('userName')) {
        next('/login');
      } else {
        next();
      }
    }
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

export default router;
