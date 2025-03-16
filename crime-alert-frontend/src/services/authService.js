import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';

// For demo purposes, we'll use a mock implementation
const mockUsers = [
  {
    id: 1,
    name: 'John Citizen',
    email: 'john@example.com',
    password: 'password123',
    phone: '555-123-4567',
    role: 'CITIZEN'
  },
  {
    id: 2,
    name: 'Officer Smith',
    email: 'smith@police.gov',
    password: 'police123',
    phone: '555-987-6543',
    role: 'AUTHORITY'
  }
];

export const login = async (email, password) => {
  try {
    // Create form data
    const formData = new FormData();
    formData.append('username', email);
    formData.append('password', password);
    
    // Send request with form data
    const response = await axios.post('http://174.129.97.137/token', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    
    // Store the token in localStorage
    if (response.data.access_token) {
      localStorage.setItem('token', response.data.access_token);
    } else if (response.data.token) {
      localStorage.setItem('token', response.data.token);
    }
    
    console.log('Token stored:', localStorage.getItem('token'));
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Login failed');
  }
};

export const register = async (userData) => {
  try {
    const response = await axios.post('http://174.129.97.137/users/', userData);
    return response.data; // Expected to contain success status
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Registration failed');
  }
};

export const fetchUserProfile = async (token) => {
  try {
    const response = await axios.get('http://174.129.97.137/users/me', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to fetch user profile');
  }
};