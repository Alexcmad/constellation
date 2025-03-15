<template>
  <div class="note-editor h-full flex flex-col">
    <div v-if="note" class="h-full flex flex-col">
      <div class="mb-4 flex justify-between items-center">
        <input
          v-model="localNote.title"
          type="text"
          placeholder="Note title"
          class="text-xl font-bold w-full border-0 focus:outline-none focus:ring-0"
          @input="handleNoteChange"
        />
        <div class="flex items-center space-x-2">
          <div 
            v-for="user in activeCollaborators" 
            :key="user.id" 
            class="h-6 w-6 rounded-full flex items-center justify-center text-xs text-white"
            :style="{ backgroundColor: user.color }"
            :title="user.name"
          >
            {{ user.name.charAt(0) }}
          </div>
          <button 
            @click="openShareModal" 
            class="p-1 rounded-md text-gray-500 hover:bg-gray-100"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
            </svg>
          </button>
        </div>
      </div>
      
      <div class="flex-grow relative">
        <textarea
          ref="editorRef"
          v-model="localNote.content"
          placeholder="Start typing your note..."
          class="w-full h-full p-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500 resize-none"
          @input="handleNoteChange"
          @keyup="handleCursorUpdate"
          @mouseup="handleCursorUpdate"
        ></textarea>
        
        <!-- Collaborator cursors (simplified) -->
        <div 
          v-for="user in activeCollaborators.filter(u => u.id !== currentUser.id && u.cursor)" 
          :key="user.id"
          class="absolute pointer-events-none"
          :style="{
            left: `${getCursorPosition(user).left}px`,
            top: `${getCursorPosition(user).top}px`,
            height: '20px'
          }"
        >
          <div 
            class="w-2 h-5 absolute"
            :style="{ backgroundColor: user.color }"
          ></div>
          <div 
            class="absolute top-0 left-2 text-xs text-white px-1 py-0.5 rounded-sm whitespace-nowrap"
            :style="{ backgroundColor: user.color }"
          >
            {{ user.name }}
          </div>
        </div>
      </div>
      
      <div class="mt-4 text-sm text-gray-500 flex justify-between items-center">
        <span>Last updated: {{ formatDate(localNote.updatedAt) }}</span>
        <span v-if="isSaving">Saving...</span>
        <span v-else-if="lastSaved">Saved at {{ formatTime(lastSaved) }}</span>
      </div>
    </div>
    
    <div v-else class="h-full flex items-center justify-center text-gray-400">
      <div class="text-center">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
        </svg>
        <p>Select a note or create a new one</p>
        <button 
          @click="$emit('create-note')" 
          class="mt-2 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
        >
          Create New Note
        </button>
      </div>
    </div>
    
    <!-- Share Note Modal -->
    <ShareNoteModal
      :is-open="isShareModalOpen"
      :note-id="note?.id || ''"
      @close="isShareModalOpen = false"
      @shared="handleNoteShared"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted, nextTick } from 'vue';
import { connectToNote, disconnectFromNote, getActiveCollaborators, updateCursorPosition, sendNoteUpdate } from '@/services/realtime';
import { useNotesStore, type Note, type User } from '@/stores/notes';
import ShareNoteModal from './ShareNoteModal.vue';

const props = defineProps<{
  note: Note | null;
}>();

const emit = defineEmits<{
  (e: 'update:note', note: Note): void;
  (e: 'create-note'): void;
}>();

const notesStore = useNotesStore();
const localNote = ref<Note | null>(null);
const isSaving = ref(false);
const lastSaved = ref<Date | null>(null);
const saveTimeout = ref<number | null>(null);
const editorRef = ref<HTMLTextAreaElement | null>(null);
const isShareModalOpen = ref(false);

// Mock current user
const currentUser = ref({
  id: '1',
  name: 'John Doe'
});

// Get active collaborators
const activeCollaborators = computed(() => {
  if (!props.note) return [];
  return getActiveCollaborators(props.note.id);
});

// Initialize local note when props change
watch(() => props.note, async (newNote) => {
  if (newNote) {
    localNote.value = { ...newNote };
    
    // Connect to real-time updates
    await nextTick();
    await connectToNote(newNote.id, currentUser.value);
    
    // Set initial cursor position
    if (editorRef.value) {
      handleCursorUpdate();
    }
  } else {
    if (localNote.value) {
      // Disconnect from real-time updates
      disconnectFromNote(localNote.value.id, currentUser.value.id);
    }
    
    localNote.value = null;
  }
}, { immediate: true });

// Handle note changes
const handleNoteChange = () => {
  if (!localNote.value) return;
  
  // Debounce saving
  if (saveTimeout.value) {
    clearTimeout(saveTimeout.value);
  }
  
  isSaving.value = true;
  
  saveTimeout.value = window.setTimeout(async () => {
    try {
      // Update the note in the store
      if (localNote.value) {
        await notesStore.updateNote(localNote.value.id, {
          title: localNote.value.title,
          content: localNote.value.content
        });
        
        // Emit the updated note
        emit('update:note', localNote.value);
        
        // Send real-time update
        sendNoteUpdate({
          id: localNote.value.id,
          title: localNote.value.title,
          content: localNote.value.content,
          updatedAt: new Date().toISOString(),
          updatedBy: currentUser.value.id
        });
      }
    } catch (error) {
      console.error('Error saving note:', error);
    } finally {
      isSaving.value = false;
      lastSaved.value = new Date();
    }
  }, 1000);
};

// Handle cursor updates
const handleCursorUpdate = () => {
  if (!editorRef.value || !localNote.value) return;
  
  const textarea = editorRef.value;
  const position = textarea.selectionStart;
  
  let selection;
  if (textarea.selectionStart !== textarea.selectionEnd) {
    selection = {
      start: textarea.selectionStart,
      end: textarea.selectionEnd
    };
  }
  
  // Update cursor position
  updateCursorPosition(localNote.value.id, currentUser.value.id, position, selection);
};

// Get cursor position for display
const getCursorPosition = (user: any) => {
  if (!editorRef.value || !user.cursor) {
    return { left: 0, top: 0 };
  }
  
  const textarea = editorRef.value;
  const text = textarea.value;
  
  // This is a simplified approach - in a real app, you'd need more complex logic
  // to accurately position cursors based on text content and line wrapping
  const lines = text.substring(0, user.cursor.position).split('\n');
  const lineNumber = lines.length - 1;
  const charPosition = lines[lineNumber].length;
  
  // Approximate position based on character width and line height
  // This is very simplified and would need improvement in a real app
  const charWidth = 8; // Approximate character width in pixels
  const lineHeight = 20; // Approximate line height in pixels
  
  return {
    left: charPosition * charWidth + 10, // +10 for padding
    top: lineNumber * lineHeight + 10 // +10 for padding
  };
};

// Open share modal
const openShareModal = () => {
  isShareModalOpen.value = true;
};

// Handle note shared
const handleNoteShared = (users: any[]) => {
  console.log('Note shared with:', users);
  
  // In a real app, you would update the note's collaborators
  // For now, we'll just show a success message
  alert(`Note shared with ${users.length} user(s)`);
};

// Format date
const formatDate = (date: Date) => {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  }).format(new Date(date));
};

// Format time
const formatTime = (date: Date | null) => {
  if (!date) return '';
  
  return new Intl.DateTimeFormat('en-US', {
    hour: '2-digit',
    minute: '2-digit'
  }).format(date);
};

// Clean up on component unmount
onUnmounted(() => {
  if (saveTimeout.value) {
    clearTimeout(saveTimeout.value);
  }
  
  if (localNote.value) {
    disconnectFromNote(localNote.value.id, currentUser.value.id);
  }
});
</script>