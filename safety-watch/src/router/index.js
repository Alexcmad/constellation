import { createRouter, createWebHistory } from 'vue-router'
import LoginRegister from '../components/LoginRegister.vue'
import Home from '../views/Home.vue' // Create this component for your home page

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home
  },
  {
    path: '/login',
    name: 'Login',
    component: LoginRegister
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
