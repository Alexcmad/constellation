<template>
    <div class="nearby-alerts-container">
      <div class="page-header">
        <h1>Nearby Alerts</h1>
        <p>Recent emergency reports in your vicinity</p>
      </div>
      
      <div class="alerts-content">
        <div class="alerts-filters">
          <div class="search-box">
            <search-icon size="18" />
            <input 
              type="text" 
              v-model="searchQuery" 
              placeholder="Search alerts..." 
            />
            <button 
              v-if="searchQuery" 
              @click="searchQuery = ''" 
              class="clear-search"
            >
              <x-icon size="16" />
            </button>
          </div>
          
          <div class="filter-options">
            <div class="filter-group">
              <label>Distance</label>
              <select v-model="filters.distance">
                <option value="1">Within 1 km</option>
                <option value="5">Within 5 km</option>
                <option value="10">Within 10 km</option>
                <option value="25">Within 25 km</option>
                <option value="50">Within 50 km</option>
              </select>
            </div>
            
            <div class="filter-group">
              <label>Time</label>
              <select v-model="filters.timeFrame">
                <option value="24">Last 24 hours</option>
                <option value="48">Last 48 hours</option>
                <option value="168">Last week</option>
                <option value="720">Last month</option>
              </select>
            </div>
            
            <div class="filter-group">
              <label>Sort By</label>
              <select v-model="filters.sortBy">
                <option value="distance">Distance</option>
                <option value="time">Most Recent</option>
                <option value="severity">Severity</option>
              </select>
            </div>
          </div>
        </div>
        
        <div class="alerts-list-container">
          <div v-if="isLoading" class="loading-state">
            <loader-icon class="spin" size="32" />
            <p>Loading nearby alerts...</p>
          </div>
          
          <div v-else-if="filteredAlerts.length === 0" class="empty-state">
            <search-x-icon size="48" />
            <h3>No alerts found</h3>
            <p>
              {{ searchQuery ? 'Try adjusting your search or filters' : 'There are no recent alerts in your area' }}
            </p>
          </div>
          
          <div v-else class="alerts-list">
            <transition-group name="alert-item">
              <div 
                v-for="alert in filteredAlerts" 
                :key="alert.id" 
                class="alert-card"
                :class="{ 'high-severity': alert.severityLevel === 'high' }"
                @click="selectAlert(alert)"
              >
                <div class="alert-header">
                  <div class="alert-type">
                    <alert-triangle-icon size="18" />
                    <span>{{ getCrimeTypeLabel(alert.crimeType) }}</span>
                  </div>
                  <div class="alert-time">
                    <clock-icon size="14" />
                    <span>{{ formatTimeAgo(alert.timestamp) }}</span>
                  </div>
                </div>
                
                <div class="alert-location">
                  <map-pin-icon size="16" />
                  <span>{{ alert.location.address }}</span>
                </div>
                
                <div class="alert-details">
                  <p>{{ truncateText(alert.description, 120) }}</p>
                </div>
                
                <div class="alert-footer">
                  <div class="alert-distance">
                    <navigation-icon size="14" />
                    <span>{{ formatDistance(alert.distance) }} away</span>
                  </div>
                  <div class="alert-severity" :class="alert.severityLevel">
                    {{ getSeverityLabel(alert.severityLevel) }}
                  </div>
                </div>
              </div>
            </transition-group>
          </div>
        </div>
      </div>
      
      <!-- Alert Detail Modal -->
      <transition name="fade">
        <div v-if="selectedAlert" class="alert-modal-backdrop" @click="selectedAlert = null">
          <div class="alert-modal" @click.stop>
            <div class="modal-header">
              <h3>Alert Details</h3>
              <button @click="selectedAlert = null" class="close-btn">
                <x-icon size="18" />
              </button>
            </div>
            
            <div class="modal-content">
              <div class="alert-info">
                <div class="info-group">
                  <h4>Crime Type</h4>
                  <div class="info-value">
                    <alert-triangle-icon size="18" />
                    <span>{{ getCrimeTypeLabel(selectedAlert.crimeType) }}</span>
                  </div>
                </div>
                
                <div class="info-group">
                  <h4>Location</h4>
                  <div class="info-value">
                    <map-pin-icon size="18" />
                    <span>{{ selectedAlert.location.address }}</span>
                  </div>
                </div>
                
                <div class="info-group">
                  <h4>Time</h4>
                  <div class="info-value">
                    <clock-icon size="18" />
                    <span>{{ formatDate(selectedAlert.timestamp) }}</span>
                  </div>
                </div>
                
                <div class="info-group">
                  <h4>Severity</h4>
                  <div class="info-value">
                    <thermometer-icon size="18" />
                    <span class="severity-badge" :class="selectedAlert.severityLevel">
                      {{ getSeverityLabel(selectedAlert.severityLevel) }}
                    </span>
                  </div>
                </div>
                
                <div class="info-group">
                  <h4>Distance</h4>
                  <div class="info-value">
                    <navigation-icon size="18" />
                    <span>{{ formatDistance(selectedAlert.distance) }}</span>
                  </div>
                </div>
              </div>
              
              <div class="description-section">
                <h4>Description</h4>
                <p>{{ selectedAlert.description }}</p>
              </div>
              
              <div v-if="selectedAlert.photos && selectedAlert.photos.length > 0" class="photos-section">
                <h4>Photos</h4>
                <div class="photos-grid">
                  <div 
                    v-for="(photo, index) in selectedAlert.photos" 
                    :key="index" 
                    class="photo-item"
                    @click="openPhotoViewer(index)"
                  >
                    <img :src="photo" alt="Crime scene photo" />
                  </div>
                </div>
              </div>
              
              <div v-if="user.role === 'AUTHORITY'" class="reporter-section">
                <h4>Reporter Information</h4>
                <div class="reporter-info">
                  <div class="info-item">
                    <user-icon size="16" />
                    <span>{{ selectedAlert.reporter.name }}</span>
                  </div>
                  <div class="info-item">
                    <mail-icon size="16" />
                    <span>{{ selectedAlert.reporter.email }}</span>
                  </div>
                  <div class="info-item">
                    <phone-icon size="16" />
                    <span>{{ selectedAlert.reporter.phone }}</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div class="modal-actions">
              <button class="action-btn view-on-map" @click="viewOnMap">
                <map-icon size="16" />
                View on Map
              </button>
              <button class="action-btn report-update" v-if="user.role === 'AUTHORITY'">
                <clipboard-edit-icon size="16" />
                Update Status
              </button>
            </div>
          </div>
        </div>
      </transition>
    </div>
  </template>
  
  <script setup>
  import { ref, computed, onMounted, inject, watch } from 'vue';
  import { useRouter } from 'vue-router';
  import { 
    SearchIcon, XIcon, LoaderIcon, SearchXIcon, AlertTriangleIcon,
    ClockIcon, MapPinIcon, NavigationIcon, ThermometerIcon,
    UserIcon, MailIcon, PhoneIcon, MapIcon, ClipboardEditIcon
  } from 'lucide-vue-next';
  import { getNearbyAlerts } from '../services/reportService';
  import { getCurrentLocation } from '../services/locationService';
  
  // Get current user from parent component
  const currentUser = inject('currentUser');
  const user = computed(() => currentUser.value);
  const router = useRouter();
  
  // State
  const isLoading = ref(true);
  const alerts = ref([]);
  const selectedAlert = ref(null);
  const searchQuery = ref('');
  
  // Filters
  const filters = ref({
    distance: '10',
    timeFrame: '168',
    sortBy: 'distance'
  });
  
  // Crime types
  const crimeTypes = [
    { value: 'theft', label: 'Theft' },
    { value: 'assault', label: 'Assault' },
    { value: 'vandalism', label: 'Vandalism' },
    { value: 'burglary', label: 'Burglary' },
    { value: 'suspicious_activity', label: 'Suspicious Activity' },
    { value: 'drug_related', label: 'Drug-Related Activity' },
    { value: 'harassment', label: 'Harassment' },
    { value: 'traffic_incident', label: 'Traffic Incident' },
    { value: 'other', label: 'Other' }
  ];
  
  // Computed
  const filteredAlerts = computed(() => {
    let result = [...alerts.value];
    
    // Filter by distance
    result = result.filter(alert => alert.distance <= parseFloat(filters.value.distance));
    
    // Filter by time
    const timeLimit = new Date();
    timeLimit.setHours(timeLimit.getHours() - parseInt(filters.value.timeFrame));
    result = result.filter(alert => new Date(alert.timestamp) >= timeLimit);
    
    // Filter by search query
    if (searchQuery.value) {
      const query = searchQuery.value.toLowerCase();
      result = result.filter(alert => 
        alert.description.toLowerCase().includes(query) ||
        alert.location.address.toLowerCase().includes(query) ||
        getCrimeTypeLabel(alert.crimeType).toLowerCase().includes(query)
      );
    }
    
    // Sort results
    switch (filters.value.sortBy) {
      case 'distance':
        result.sort((a, b) => a.distance - b.distance);
        break;
      case 'time':
        result.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
        break;
      case 'severity':
        const severityOrder = { high: 0, medium: 1, low: 2 };
        result.sort((a, b) => severityOrder[a.severityLevel] - severityOrder[b.severityLevel]);
        break;
    }
    
    return result;
  });
  
  // Methods
  const fetchAlerts = async () => {
    try {
      isLoading.value = true;
      
      // Get user's current location
      const location = await getCurrentLocation();
      
      // Fetch nearby alerts
      const nearbyAlerts = await getNearbyAlerts(location.latitude, location.longitude);
      alerts.value = nearbyAlerts;
    } catch (error) {
      console.error('Error fetching alerts:', error);
    } finally {
      isLoading.value = false;
    }
  };
  
  const getCrimeTypeLabel = (value) => {
    const crimeType = crimeTypes.find(type => type.value === value);
    return crimeType ? crimeType.label : value;
  };
  
  const getSeverityLabel = (value) => {
    switch (value) {
      case 'low': return 'Low';
      case 'medium': return 'Medium';
      case 'high': return 'High';
      default: return value;
    }
  };
  
  const formatTimeAgo = (timestamp) => {
    const now = new Date();
    const alertTime = new Date(timestamp);
    const diffMs = now - alertTime;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);
    
    if (diffMins < 60) {
      return `${diffMins} min${diffMins !== 1 ? 's' : ''} ago`;
    } else if (diffHours < 24) {
      return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
    } else {
      return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;
    }
  };
  
  const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleString();
  };
  
  const formatDistance = (distance) => {
    if (distance < 1) {
      return `${(distance * 1000).toFixed(0)} m`;
    } else {
      return `${distance.toFixed(1)} km`;
    }
  };
  
  const truncateText = (text, maxLength) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };
  
  const selectAlert = (alert) => {
    selectedAlert.value = alert;
  };
  
  const openPhotoViewer = (index) => {
    // Implement photo viewer functionality
    console.log('Opening photo viewer for index:', index);
  };
  
  const viewOnMap = () => {
    if (!selectedAlert.value) return;
    
    // Navigate to map view and center on this alert
    router.push({
      path: '/map',
      query: {
        lat: selectedAlert.value.location.latitude,
        lng: selectedAlert.value.location.longitude,
        id: selectedAlert.value.id
      }
    });
  };
  
  // Watch for filter changes
  watch([filters, searchQuery], () => {
    // No need to refetch, just let the computed property handle filtering
  }, { deep: true });
  
  onMounted(() => {
    fetchAlerts();
  });
  </script>
  
  <style scoped>
  .nearby-alerts-container {
    height: calc(100vh - 104px);
    display: flex;
    flex-direction: column;
  }
  
  .page-header {
    margin-bottom: 16px;
  }
  
  .page-header h1 {
    font-size: 28px;
    font-weight: 700;
    color: #333;
    margin-bottom: 8px;
  }
  
  .page-header p {
    color: #666;
    font-size: 16px;
  }
  
  .alerts-content {
    display: flex;
    flex-direction: column;
    flex: 1;
    background-color: white;
    border-radius: 12px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
    overflow: hidden;
  }
  
  .alerts-filters {
    padding: 16px;
    border-bottom: 1px solid #eee;
  }
  
  .search-box {
    position: relative;
    margin-bottom: 16px;
  }
  
  .search-box input {
    width: 100%;
    padding: 10px 16px 10px 40px;
    border: 1px solid #ddd;
    border-radius: 6px;
    font-size: 15px;
    transition: border-color 0.3s;
  }
  
  .search-box input:focus {
    border-color: var(--primary-color);
    outline: none;
    box-shadow: 0 0 0 3px rgba(58, 134, 255, 0.1);
  }
  
  .search-box svg {
    position: absolute;
    left: 12px;
    top: 50%;
    transform: translateY(-50%);
    color: #666;
  }
  
  .clear-search {
    position: absolute;
    right: 12px;
    top: 50%;
    transform: translateY(-50%);
    background: none;
    border: none;
    color: #666;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 4px;
    border-radius: 50%;
    transition: background-color 0.2s;
  }
  
  .clear-search:hover {
    background-color: #f0f0f0;
  }
  
  .filter-options {
    display: flex;
    gap: 16px;
  }
  
  .filter-group {
    flex: 1;
  }
  
  .filter-group label {
    display: block;
    font-size: 12px;
    font-weight: 500;
    margin-bottom: 6px;
    color: #666;
  }
  
  .filter-group select {
    width: 100%;
    padding: 8px 12px;
    border: 1px solid #ddd;
    border-radius: 6px;
    font-size: 14px;
    transition: border-color 0.3s;
  }
  
  .filter-group select:focus {
    border-color: var(--primary-color);
    outline: none;
    box-shadow: 0 0 0 3px rgba(58, 134, 255, 0.1);
  }
  
  .alerts-list-container {
    flex: 1;
    overflow-y: auto;
    padding: 16px;
  }
  
  .loading-state, .empty-state {
    height: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    color: #666;
  }
  
  .loading-state svg, .empty-state svg {
    margin-bottom: 16px;
    color: #999;
  }
  
  .empty-state h3 {
    font-size: 18px;
    font-weight: 600;
    margin-bottom: 8px;
    color: #333;
  }
  
  .spin {
    animation: spin 1s linear infinite;
  }
  
  @keyframes spin {
    from {
      transform: rotate(0deg);
    }
    to {
      transform: rotate(360deg);
    }
  }
  
  .alerts-list {
    display: grid;
    gap: 16px;
  }
  
  .alert-card {
    background-color: #f8f9fa;
    border-radius: 8px;
    padding: 16px;
    cursor: pointer;
    transition: all 0.2s;
    border-left: 4px solid #ddd;
  }
  
  .alert-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  }
  
  .alert-card.high-severity {
    border-left-color: var(--danger-color);
  }
  
  .alert-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 12px;
  }
  
  .alert-type {
    display: flex;
    align-items: center;
    gap: 8px;
    font-weight: 600;
    color: #333;
  }
  
  .alert-time {
    display: flex;
    align-items: center;
    gap: 4px;
    font-size: 12px;
    color: #666;
  }
  
  .alert-location {
    display: flex;
    align-items: flex-start;
    gap: 8px;
    margin-bottom: 12px;
    color: #555;
    font-size: 14px;
  }
  
  .alert-details {
    margin-bottom: 12px;
    color: #555;
    font-size: 14px;
    line-height: 1.5;
  }
  
  .alert-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  
  .alert-distance {
    display: flex;
    align-items: center;
    gap: 4px;
    font-size: 12px;
    color: #666;
  }
  
  .alert-severity {
    font-size: 12px;
    font-weight: 500;
    padding: 4px 8px;
    border-radius: 4px;
  }
  
  .alert-severity.low {
    background-color: #e8f5e9;
    color: #2e7d32;
  }
  
  .alert-severity.medium {
    background-color: #fff3e0;
    color: #ef6c00;
  }
  
  .alert-severity.high {
    background-color: #ffebee;
    color: #c62828;
  }
  
  /* Alert Modal */
  .alert-modal-backdrop {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 100;
  }
  
  .alert-modal {
    background-color: white;
    border-radius: 12px;
    width: 90%;
    max-width: 600px;
    max-height: 90vh;
    overflow-y: auto;
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
  }
  
  .modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 16px 20px;
    border-bottom: 1px solid #eee;
  }
  
  .modal-header h3 {
    font-size: 18px;
    font-weight: 600;
    color: #333;
  }
  
  .close-btn {
    background: none;
    border: none;
    color: #666;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 4px;
    border-radius: 4px;
    transition: background-color 0.2s;
  }
  
  .close-btn:hover {
    background-color: #f0f0f0;
  }
  
  .modal-content {
    padding: 20px;
  }
  
  .alert-info {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 20px;
    margin-bottom: 24px;
  }
  
  .info-group h4 {
    font-size: 14px;
    font-weight: 500;
    color: #666;
    margin-bottom: 8px;
  }
  
  .info-value {
    display: flex;
    align-items: center;
    gap: 8px;
    color: #333;
    font-weight: 500;
  }
  
  .severity-badge {
    padding: 4px 8px;
    border-radius: 4px;
    font-size: 12px;
  }
  
  .severity-badge.low {
    background-color: #e8f5e9;
    color: #2e7d32;
  }
  
  .severity-badge.medium {
    background-color: #fff3e0;
    color: #ef6c00;
  }
  
  .severity-badge.high {
    background-color: #ffebee;
    color: #c62828;
  }
  
  .description-section, .photos-section, .reporter-section {
    margin-bottom: 24px;
  }
  
  .description-section h4, .photos-section h4, .reporter-section h4 {
    font-size: 16px;
    font-weight: 600;
    color: #333;
    margin-bottom: 12px;
  }
  
  .description-section p {
    color: #555;
    line-height: 1.6;
  }
  
  .photos-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 12px;
  }
  
  .photo-item {
    aspect-ratio: 1;
    border-radius: 6px;
    overflow: hidden;
    cursor: pointer;
  }
  
  .photo-item img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
  
  .reporter-info {
    background-color: #f8f9fa;
    border-radius: 8px;
    padding: 16px;
  }
  
  .reporter-info .info-item {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 8px;
    color: #555;
  }
  
  .modal-actions {
    display: flex;
    justify-content: flex-end;
    gap: 12px;
    padding: 16px 20px;
    border-top: 1px solid #eee;
  }
  
  .action-btn {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 10px 16px;
    border-radius: 6px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s;
  }
  
  .view-on-map {
    background-color: var(--primary-color);
    color: white;
    border: none;
  }
  
  .view-on-map:hover {
    background-color: #2a75e8;
  }
  
  .report-update {
    background-color: #f0f0f0;
    color: #555;
    border: 1px solid #ddd;
  }
  
  .report-update:hover {
    background-color: #e0e0e0;
  }
  
  /* Transitions */
  .fade-enter-active,
  .fade-leave-active {
    transition: opacity 0.3s;
  }
  
  .fade-enter-from,
  .fade-leave-to {
    opacity: 0;
  }
  
  .alert-item-enter-active,
  .alert-item-leave-active {
    transition: all 0.3s;
  }
  
  .alert-item-enter-from {
    opacity: 0;
    transform: translateY(20px);
  }
  
  .alert-item-leave-to {
    opacity: 0;
    transform: translateY(-20px);
  }
  </style>