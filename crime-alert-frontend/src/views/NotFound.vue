<template>
    <div class="not-found-container">
      <div class="not-found-content">
        <div class="error-code">404</div>
        <h1>Page Not Found</h1>
        <p>The page you are looking for doesn't exist or has been moved.</p>
        <router-link to="/dashboard" class="back-btn">
          <home-icon size="16" />
          Back to Dashboard
        </router-link>
      </div>
    </div>
  </template>
  
  <script setup>
  import { HomeIcon } from 'lucide-vue-next';
  </script>
  
  <style scoped>
  .not-found-container {
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: calc(100vh - 104px);
    text-align: center;
  }
  
  .not-found-content {
    max-width: 400px;
    padding: 40px;
  }
  
  .error-code {
    font-size: 120px;
    font-weight: 700;
    color: var(--primary-color);
    line-height: 1;
    margin-bottom: 24px;
    opacity: 0.5;
  }
  
  h1 {
    font-size: 32px;
    font-weight: 700;
    margin-bottom: 16px;
    color: #333;
  }
  
  p {
    color: #666;
    margin-bottom: 32px;
  }
  
  .back-btn {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 12px 24px;
    background-color: var(--primary-color);
    color: white;
    border-radius: 6px;
    text-decoration: none;
    font-weight: 500;
    transition: background-color 0.2s;
  }
  
  .back-btn:hover {
    background-color: #2a75e8;
  }
  </style>