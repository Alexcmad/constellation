<template>
  <div class="home-container">
    <h1>Welcome {{ userName }}!</h1>
    <div class="map-container">
      <GoogleMap
        api-key="YOUR_GOOGLE_MAPS_API_KEY"
        style="width: 100%; height: 500px"
        mapTypeId="terrain"
        :center="center"
        :zoom="4"
      >
        <Circle v-for="(circle, key) in circles" :key="key" :options="circle" />
      </GoogleMap>
    </div>
    <button @click="handleLogout" class="btn-primary">Logout</button>
  </div>
</template>

<script setup>
import { GoogleMap, Circle } from 'vue3-google-map'

const center = { lat: 37.09, lng: -95.712 }
const cities = {
  chicago: {
    center: { lat: 41.878, lng: -87.629 },
    population: 2714856,
  },
  newyork: {
    center: { lat: 40.714, lng: -74.005 },
    population: 8405837,
  },
  losangeles: {
    center: { lat: 34.052, lng: -118.243 },
    population: 3857799,
  },
  vancouver: {
    center: { lat: 49.25, lng: -123.1 },
    population: 603502,
  },
}

const circles = {}

for (const key in cities) {
  circles[key] = {
    center: cities[key].center,
    radius: Math.sqrt(cities[key].population) * 100,
    strokeColor: '#FF0000',
    strokeOpacity: 0.8,
    strokeWeight: 2,
    fillColor: '#FF0000',
    fillOpacity: 0.35,
  }
}

// Get username from localStorage
const userName = localStorage.getItem('userName') || 'User'

const handleLogout = () => {
  localStorage.removeItem('userName')
  window.location.href = '/login'
}
</script>

<style scoped>
.home-container {
  padding: 2rem;
  text-align: center;
}

.map-container {
  margin: 2rem 0;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.btn-primary {
  margin-top: 1rem;
  padding: 0.75rem 2rem;
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
</style>