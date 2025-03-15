import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { websocketService } from '@/services/websocket';
import { notesApi } from '@/services/api';

export interface User {
  id: string;
  name: string;
}

export interface Note {
  id: string;
  title: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
  activeUsers: User[];
}

export const useNotesStore = defineStore('notes', () => {
  const notes = ref<Note[]>([]);
  const currentNote = ref<Note | null>(null);
  const isLoading = ref(false);
  const error = ref<string | null>(null);
  
  // Get all notes
  const fetchNotes = async () => {
    isLoading.value = true;
    error.value = null;
    
    try {
      // In a real app, you would fetch notes from your API
      // const response = await notesApi.getAllNotes();
      // notes.value = response;
      
      // Mock data for demonstration
      notes.value = [
        {
          id: '1',
          title: 'Welcome to CollabNotes',
          content: 'This is a collaborative note-taking application. You can create, edit, and share notes in real-time with your team.',
          createdAt: new Date('2023-01-01'),
          updatedAt: new Date('2023-01-02'),
          activeUsers: [{ id: '1', name: 'John Doe' }]
        },
        {
          id: '2',
          title: 'Project Ideas',
          content: 'List of project ideas for the upcoming hackathon:\n- Real-time chat application\n- Task management system\n- E-commerce platform',
          createdAt: new Date('2023-01-03'),
          updatedAt: new Date('2023-01-04'),
          activeUsers: [{ id: '1', name: 'John Doe' }]
        }
      ];
    } catch (err) {
      error.value = 'Failed to fetch notes';
      console.error(err);
    } finally {
      isLoading.value = false;
    }
  };
  
  // Get a single note
  const fetchNote = async (id: string) => {
    isLoading.value = true;
    error.value = null;
    
    try {
      // In a real app, you would fetch the note from your API
      // const note = await notesApi.getNote(id);
      
      // Mock data for demonstration
      const note = notes.value.find(n => n.id === id);
      
      if (note) {
        currentNote.value = { ...note };
        
        // Connect to WebSocket for real-time updates
        // In a real app, you would connect to your WebSocket server
        // websocketService.connect(`wss://your-api-url/notes/${id}`);
        
        // For demonstration, we'll just log a message
        console.log(`Connected to real-time updates for note ${id}`);
      } else {
        error.value = 'Note not found';
      }
    } catch (err) {
      error.value = 'Failed to fetch note';
      console.error(err);
    } finally {
      isLoading.value = false;
    }
  };
  
  // Create a new note
  const createNote = async (title: string, content: string) => {
    isLoading.value = true;
    error.value = null;
    
    try {
      // In a real app, you would create the note via your API
      // const newNote = await notesApi.createNote(title, content);
      
      // Mock data for demonstration
      const newNote: Note = {
        id: Date.now().toString(),
        title,
        content,
        createdAt: new Date(),
        updatedAt: new Date(),
        activeUsers: [{ id: '1', name: 'John Doe' }]
      };
      
      notes.value.unshift(newNote);
      currentNote.value = { ...newNote };
      
      return newNote;
    } catch (err) {
      error.value = 'Failed to create note';
      console.error(err);
      throw err;
    } finally {
      isLoading.value = false;
    }
  };
  
  // Update a note
  const updateNote = async (id: string, data: Partial<Note>) => {
    if (!currentNote.value || currentNote.value.id !== id) {
      return;
    }
    
    try {
      // In a real app, you would update the note via your API
      // const updatedNote = await notesApi.updateNote(id, data);
      
      // Update the current note
      currentNote.value = {
        ...currentNote.value,
        ...data,
        updatedAt: new Date()
      };
      
      // Update the note in the list
      const index = notes.value.findIndex(n => n.id === id);
      if (index !== -1) {
        notes.value[index] = { ...currentNote.value };
      }
      
      // In a real app, you would broadcast the changes via WebSocket
      // websocketService.send('note:update', { id, ...data });
      
      // For demonstration, we'll just log a message
      console.log(`Broadcasting changes for note ${id}`);
      
      return currentNote.value;
    } catch (err) {
      error.value = 'Failed to update note';
      console.error(err);
      throw err;
    }
  };
  
  // Delete a note
  const deleteNote = async (id: string) => {
    isLoading.value = true;
    error.value = null;
    
    try {
      // In a real app, you would delete the note via your API
      // await notesApi.deleteNote(id);
      
      // Remove the note from the list
      notes.value = notes.value.filter(n => n.id !== id);
      
      // Clear current note if it's the one being deleted
      if (currentNote.value && currentNote.value.id === id) {
        currentNote.value = null;
      }
    } catch (err) {
      error.value = 'Failed to delete note';
      console.error(err);
      throw err;
    } finally {
      isLoading.value = false;
    }
  };
  
  // Search notes
  const searchNotes = async (query: string) => {
    if (!query) return notes.value;
    
    try {
      // In a real app, you would search notes via your API
      // const results = await notesApi.searchNotes(query);
      // return results;
      
      // Mock search for demonstration
      const lowerQuery = query.toLowerCase();
      return notes.value.filter(note => 
        note.title.toLowerCase().includes(lowerQuery) || 
        note.content.toLowerCase().includes(lowerQuery)
      );
    } catch (err) {
      error.value = 'Failed to search notes';
      console.error(err);
      return notes.value;
    }
  };
  
  return {
    notes,
    currentNote,
    isLoading,
    error,
    fetchNotes,
    fetchNote,
    createNote,
    updateNote,
    deleteNote,
    searchNotes
  };
});