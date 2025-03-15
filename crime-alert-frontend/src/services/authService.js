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
  // In a real app, this would be an API call
  try {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Find user
    const user = mockUsers.find(u => u.email === email);
    
    if (!user || user.password !== password) {
      throw new Error('Invalid email or password');
    }
    
    // Create mock token
    const token = `mock-jwt-token-${Date.now()}`;
    
    // Return user data without password
    const { password: _, ...userData } = user;
    
    return {
      token,
      user: userData
    };
  } catch (error) {
    throw new Error(error.message || 'Login failed');
  }
};

export const register = async (userData) => {
  // In a real app, this would be an API call
  try {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Check if email already exists
    if (mockUsers.some(u => u.email === userData.email)) {
      throw new Error('Email already in use');
    }
    
    // In a real app, we would save the user to the database
    console.log('User registered:', userData);
    
    return { success: true };
  } catch (error) {
    throw new Error(error.message || 'Registration failed');
  }
};

export const fetchUserProfile = async (token) => {
  // In a real app, this would validate the token and return user data
  try {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 800));
    
    // For demo, return the first mock user
    const { password: _, ...userData } = mockUsers[0];
    return userData;
  } catch (error) {
    throw new Error('Failed to fetch user profile');
  }
};