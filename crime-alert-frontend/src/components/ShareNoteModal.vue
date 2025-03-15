<template>
  <div v-if="isOpen" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div class="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
      <div class="flex justify-between items-center mb-4">
        <h2 class="text-xl font-semibold">Share Note</h2>
        <button @click="close" class="text-gray-500 hover:text-gray-700">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      
      <div class="mb-4">
        <label for="user-search" class="block text-sm font-medium text-gray-700 mb-1">
          Search users by email
        </label>
        <div class="relative">
          <input
            id="user-search"
            v-model="searchQuery"
            type="text"
            placeholder="Enter email address"
            class="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            @input="searchUsers"
          />
          <div v-if="isSearching" class="absolute right-3 top-2.5">
            <svg class="animate-spin h-5 w-5 text-indigo-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </div>
        </div>
        
        <div v-if="searchResults.length > 0" class="mt-2 border rounded-md max-h-40 overflow-y-auto">
          <div
            v-for="user in searchResults"
            :key="user.id"
            class="p-2 hover:bg-gray-100 cursor-pointer flex justify-between items-center"
            @click="selectUser(user)"
          >
            <div class="flex items-center">
              <div class="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center mr-2">
                <span class="text-sm font-medium text-indigo-600">{{ getUserInitials(user.name) }}</span>
              </div>
              <div>
                <div class="font-medium">{{ user.name }}</div>
                <div class="text-sm text-gray-500">{{ user.email }}</div>
              </div>
            </div>
          </div>
        </div>
        
        <div v-else-if="searchQuery && !isSearching && searchResults.length === 0" class="mt-2 text-sm text-gray-500">
          No users found
        </div>
      </div>
      
      <div v-if="selectedUsers.length > 0" class="mb-4">
        <h3 class="text-sm font-medium text-gray-700 mb-2">Selected users</h3>
        <div class="space-y-2">
          <div
            v-for="user in selectedUsers"
            :key="user.id"
            class="flex justify-between items-center p-2 border rounded-md"
          >
            <div class="flex items-center">
              <div class="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center mr-2">
                <span class="text-sm font-medium text-indigo-600">{{ getUserInitials(user.name) }}</span>
              </div>
              <div>
                <div class="font-medium">{{ user.name }}</div>
                <div class="text-sm text-gray-500">{{ user.email }}</div>
              </div>
            </div>
            <div class="flex items-center">
              <select
                v-model="userPermissions[user.id]"
                class="mr-2 text-sm border rounded p-1"
              >
                <option value="READ">Can view</option>
                <option value="WRITE">Can edit</option>
              </select>
              <button @click="removeUser(user)" class="text-gray-400 hover:text-gray-600">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
      
      <div class="flex justify-end space-x-2">
        <button
          @click="close"
          class="px-4 py-2 border rounded-md text-gray-700 hover:bg-gray-50"
        >
          Cancel
        </button>
        <button
          @click="shareNote"
          :disabled="selectedUsers.length === 0 || isSharing"
          :class="`px-4 py-2 rounded-md text-white ${selectedUsers.length === 0 || isSharing ? 'bg-indigo-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700'}`"
        >
          <span v-if="isSharing">Sharing...</span>
          <span v-else>Share</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { userApi, notesApi } from '@/services/api';

// Props
const props = defineProps<{
  isOpen: boolean;
  noteId: string;
}>();

// Emits
const emit = defineEmits<{
  (e: 'close'): void;
  (e: 'shared', users: any[]): void;
}>();

// State
const searchQuery = ref('');
const searchResults = ref<any[]>([]);
const selectedUsers = ref<any[]>([]);
const userPermissions = ref<Record<string, 'READ' | 'WRITE'>>({});
const isSearching = ref(false);
const isSharing = ref(false);

// Methods
const close = () => {
  emit('close');
  searchQuery.value = '';
  searchResults.value = [];
  selectedUsers.value = [];
  userPermissions.value = {};
};

const searchUsers = async () => {
  if (!searchQuery.value.trim()) {
    searchResults.value = [];
    return;
  }
  
  isSearching.value = true;
  
  try {
    // In a real app, you would call your API
    // const results = await userApi.searchUsers(searchQuery.value);
    
    // Mock data for demonstration
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const mockResults = [
      { id: '2', name: 'Jane Smith', email: 'jane@example.com' },
      { id: '3', name: 'Bob Johnson', email: 'bob@example.com' },
      { id: '4', name: 'Alice Williams', email: 'alice@example.com' }
    ].filter(user => 
      user.name.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.value.toLowerCase())
    );
    
    // Filter out already selected users
    searchResults.value = mockResults.filter(
      user => !selectedUsers.value.some(selectedUser => selectedUser.id === user.id)
    );
  } catch (error) {
    console.error('Error searching users:', error);
  } finally {
    isSearching.value = false;
  }
};

const selectUser = (user: any) => {
  selectedUsers.value.push(user);
  userPermissions.value[user.id] = 'READ';
  searchResults.value = searchResults.value.filter(u => u.id !== user.id);
};

const removeUser = (user: any) => {
  selectedUsers.value = selectedUsers.value.filter(u => u.id !== user.id);
  delete userPermissions.value[user.id];
  
  // Add back to search results if matches current query
  if (
    searchQuery.value &&
    (user.name.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
    user.email.toLowerCase().includes(searchQuery.value.toLowerCase()))
  ) {
    searchResults.value.push(user);
  }
};

const shareNote = async () => {
  if (selectedUsers.value.length === 0) return;
  
  isSharing.value = true;
  
  try {
    // In a real app, you would call your API for each user
    const sharePromises = selectedUsers.value.map(user => 
      notesApi.shareNote(props.noteId, user.email, userPermissions.value[user.id])
    );
    
    // Mock successful sharing
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Emit shared event
    emit('shared', selectedUsers.value.map(user => ({
      ...user,
      permission: userPermissions.value[user.id]
    })));
    
    // Close modal
    close();
  } catch (error) {
    console.error('Error sharing note:', error);
  } finally {
    isSharing.value = false;
  }
};

const getUserInitials = (name: string) => {
  return name
    .split(' ')
    .map(part => part[0])
    .join('')
    .toUpperCase();
};
</script>