<template>
    <div class="crime-map-container">
      <div class="page-header">
        <h1>Emergency Map</h1>
        <p>View reported incidents and hotspots in your area</p>
      </div>
      
      <div class="map-controls">
        <div class="filter-controls">
          <button 
            class="filter-toggle" 
            @click="showFilters = !showFilters"
          >
            <filter-icon size="16" />
            Filters
            <chevron-down-icon 
              size="16" 
              :class="{ 'rotate': showFilters }"
            />
          </button>
          
          <transition name="slide-down">
            <div v-if="showFilters" class="filters-panel">
              <div class="filter-group">
                <label>Crime Types</label>
                <div class="checkbox-group">
                  <label v-for="type in crimeTypes" :key="type.value" class="checkbox">
                    <input 
                      type="checkbox" 
                      :value="type.value" 
                      v-model="filters.crimeTypes"
                    />
                    <span>{{ type.label }}</span>
                  </label>
                </div>
              </div>
              
              <div class="filter-group">
                <label>Time Period</label>
                <div class="radio-group">
                  <label v-for="period in timePeriods" :key="period.value" class="radio">
                    <input 
                      type="radio" 
                      :value="period.value" 
                      v-model="filters.timePeriod"
                    />
                    <span>{{ period.label }}</span>
                  </label>
                </div>
              </div>
              
              <div class="filter-group">
                <label>Severity</label>
                <div class="checkbox-group">
                  <label v-for="level in severityLevels" :key="level.value" class="checkbox">
                    <input 
                      type="checkbox" 
                      :value="level.value" 
                      v-model="filters.severityLevels"
                    />
                    <span>{{ level.label }}</span>
                  </label>
                </div>
              </div>
              
              <div class="filter-actions">
                <button @click="resetFilters" class="reset-btn">
                  <refresh-cw-icon size="14" />
                  Reset
                </button>
                <button @click="applyFilters" class="apply-btn">
                  <check-icon size="14" />
                  Apply
                </button>
              </div>
            </div>
          </transition>
        </div>
        
        <div class="view-controls">
          <button 
            class="view-btn" 
            style="background-color: #8A0BB8;"
            :class="{ 'active': mapView === 'all' }"
            @click="mapView = 'all'"
          >
            <map-icon size="16" />
            All Reports
          </button>
          <button 
            class="view-btn" 
            :class="{ 'active': mapView === 'hotspots' }"
            @click="mapView = 'hotspots'"
          >
            <flame-icon size="16" />
            Hotspots
          </button>
        </div>
      </div>
      
      <div class="map-container">
        <div class="map-legend">
          <h4>Legend</h4>
          <div class="legend-item">
            <span class="legend-color" style="background-color: #ffeb3b;"></span>
            <span>1-5 reports</span>
          </div>
          <div class="legend-item">
            <span class="legend-color" style="background-color: #ff9800;"></span>
            <span>5-10 reports</span>
          </div>
          <div class="legend-item">
            <span class="legend-color" style="background-color: #f44336;"></span>
            <span>10+ reports</span>
          </div>
        </div>
        
        <div ref="mapElement" class="map-element"></div>
        
        <div v-if="isLoading" class="map-loading">
          <loader-icon class="spin" size="32" />
          <span>Loading map data...</span>
        </div>
      </div>
      
      <div class="report-details" v-if="selectedReport">
        <div class="report-header">
          <h3>Report Details</h3>
          <button @click="selectedReport = null" class="close-btn">
            <x-icon size="16" />
          </button>
        </div>
        
        <div class="report-content">
          <div class="report-info">
            <div class="info-item">
              <alert-triangle-icon size="16" />
              <span>{{ getCrimeTypeLabel(selectedReport.crimeType) }}</span>
            </div>
            <div class="info-item">
              <map-pin-icon size="16" />
              <span>{{ selectedReport.location.address }}</span>
            </div>
            <div class="info-item">
              <clock-icon size="16" />
              <span>{{ formatDate(selectedReport.timestamp) }}</span>
            </div>
            <div class="info-item">
              <thermometer-icon size="16" />
              <span>Severity: {{ getSeverityLabel(selectedReport.severityLevel) }}</span>
            </div>
          </div>
          
          <div class="report-description">
            <h4>Description</h4>
            <p>{{ selectedReport.description }}</p>
          </div>
          
          <div v-if="selectedReport.photos && selectedReport.photos.length > 0" class="report-photos">
            <h4>Photos</h4>
            <div class="photos-grid">
              <div 
                v-for="(photo, index) in selectedReport.photos" 
                :key="index" 
                class="photo-item"
                @click="openPhotoViewer(index)"
              >
                <img :src="photo" alt="Crime scene photo" />
              </div>
            </div>
          </div>
          
          <div v-if="user.role === 'AUTHORITY'" class="reporter-info">
            <h4>Reporter Information</h4>
            <div class="info-item">
              <user-icon size="16" />
              <span>{{ selectedReport.reporter.name }}</span>
            </div>
            <div class="info-item">
              <mail-icon size="16" />
              <span>{{ selectedReport.reporter.email }}</span>
            </div>
            <div class="info-item">
              <phone-icon size="16" />
              <span>{{ selectedReport.reporter.phone }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref, onMounted, computed, inject, watch } from 'vue';
  import { 
    FilterIcon, ChevronDownIcon, RefreshCwIcon, CheckIcon, 
    MapIcon, FlameIcon, LoaderIcon, XIcon, AlertTriangleIcon,
    MapPinIcon, ClockIcon, ThermometerIcon, UserIcon,
    MailIcon, PhoneIcon
  } from 'lucide-vue-next';
  import { getCrimeReports } from '../services/reportService';
  import { getCurrentLocation } from '../services/locationService';
  
  // Get current user from parent component
  const currentUser = inject('currentUser');
  const user = computed(() => currentUser.value);
  
  // Map state
  const mapElement = ref(null);
  const isLoading = ref(true);
  const mapView = ref('all');
  const showFilters = ref(false);
  const selectedReport = ref(null);
  
  // Filter options
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
  
  const timePeriods = [
    { value: 'today', label: 'Today' },
    { value: 'week', label: 'Past Week' },
    { value: 'month', label: 'Past Month' },
    { value: 'year', label: 'Past Year' },
    { value: 'all', label: 'All Time' }
  ];
  
  const severityLevels = [
    { value: 'low', label: 'Low' },
    { value: 'medium', label: 'Medium' },
    { value: 'high', label: 'High' }
  ];
  
  // Filter state
  const filters = ref({
    crimeTypes: crimeTypes.map(type => type.value),
    timePeriod: 'month',
    severityLevels: severityLevels.map(level => level.value)
  });
  
  // Reports data
  const allReports = ref([]);
  const filteredReports = ref([]);
  const hotspots = ref([]);
  
  // Methods
  const resetFilters = () => {
    filters.value = {
      crimeTypes: crimeTypes.map(type => type.value),
      timePeriod: 'month',
      severityLevels: severityLevels.map(level => level.value)
    };
  };
  
  const applyFilters = () => {
    showFilters.value = false;
    filterReports();
  };
  
  const filterReports = () => {
    // Apply filters to reports
    filteredReports.value = allReports.value.filter(report => {
      // Filter by crime type
      if (!filters.value.crimeTypes.includes(report.crimeType)) {
        return false;
      }
      
      // Filter by severity
      if (!filters.value.severityLevels.includes(report.severityLevel)) {
        return false;
      }
      
      // Filter by time period
      const reportDate = new Date(report.timestamp);
      const now = new Date();
      
      switch (filters.value.timePeriod) {
        case 'today':
          return reportDate.toDateString() === now.toDateString();
        case 'week':
          const weekAgo = new Date();
          weekAgo.setDate(now.getDate() - 7);
          return reportDate >= weekAgo;
        case 'month':
          const monthAgo = new Date();
          monthAgo.setMonth(now.getMonth() - 1);
          return reportDate >= monthAgo;
        case 'year':
          const yearAgo = new Date();
          yearAgo.setFullYear(now.getFullYear() - 1);
          return reportDate >= yearAgo;
        default:
          return true;
      }
    });
    
    // Update map
    updateMap();
  };
  
  const getCrimeTypeLabel = (value) => {
    const crimeType = crimeTypes.find(type => type.value === value);
    return crimeType ? crimeType.label : value;
  };
  
  const getSeverityLabel = (value) => {
    const severity = severityLevels.find(level => level.value === value);
    return severity ? severity.label : value;
  };
  
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };
  
  const calculateHotspots = () => {
    // Group reports by location (simplified for demo)
    const locationGroups = {};
    
    filteredReports.value.forEach(report => {
      const locationKey = `${report.location.latitude.toFixed(3)},${report.location.longitude.toFixed(3)}`;
      
      if (!locationGroups[locationKey]) {
        locationGroups[locationKey] = {
          latitude: report.location.latitude,
          longitude: report.location.longitude,
          count: 0,
          reports: []
        };
      }
      
      locationGroups[locationKey].count++;
      locationGroups[locationKey].reports.push(report);
    });
    
    // Convert to array and add color based on count
    hotspots.value = Object.values(locationGroups).map(spot => {
      let color;
      if (spot.count >= 10) {
        color = '#f44336'; // Red for 10+
      } else if (spot.count >= 5) {
        color = '#ff9800'; // Orange for 5-10
      } else {
        color = '#ffeb3b'; // Yellow for 1-5
      }
      
      return {
        ...spot,
        color
      };
    });
  };
  
  const initMap = async () => {
    if (!mapElement.value) return;
    
    try {
      isLoading.value = true;
      
      // Get user's current location
      const userLocation = await getCurrentLocation();
      
      // Fetch crime reports
      const reports = await getCrimeReports();
      allReports.value = reports;
      
      // Apply initial filters
      filterReports();
      
      // Initialize Google Maps (simulated)
      console.log('Map would be initialized here with user location:', 
        userLocation.latitude, 
        userLocation.longitude
      );
      
      // Simulate map with a colored div
      const mapDiv = document.createElement('div');
      mapDiv.style.width = '100%';
      mapDiv.style.height = '100%';
      mapDiv.style.backgroundColor = '#e0e0e0';
      mapDiv.style.display = 'flex';
      mapDiv.style.alignItems = 'center';
      mapDiv.style.justifyContent = 'center';
      mapDiv.style.color = '#666';
      mapDiv.style.fontWeight = 'bold';
      mapDiv.textContent = 'Google Maps would display here with crime data';
      
      mapElement.value.innerHTML = '';
      mapElement.value.appendChild(mapDiv);
      
      isLoading.value = false;
    } catch (error) {
      console.error('Error initializing map:', error);
      isLoading.value = false;
    }
  };
  
  const updateMap = () => {
    // Calculate hotspots
    calculateHotspots();
    
    // Update map markers (simulated)
    console.log('Map would be updated with:', 
      mapView.value === 'all' ? filteredReports.value : hotspots.value
    );
  };
  
  const openPhotoViewer = (index) => {
    // Implement photo viewer functionality
    console.log('Opening photo viewer for index:', index);
  };
  
  // Watch for changes in map view
  watch(() => mapView.value, () => {
    updateMap();
  });
  
  onMounted(() => {
    initMap();
  });
  </script>
  
  <style scoped>
  .crime-map-container {
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
  
  .map-controls {
    display: flex;
    justify-content: space-between;
    margin-bottom: 16px;
  }
  
  .filter-controls {
    position: relative;
  }
  
  .filter-toggle {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px 16px;
    background-color: white;
    border: 1px solid #ddd;
    border-radius: 6px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s;
  }
  
  .filter-toggle:hover {
    background-color: #f5f5f5;
  }
  
  .filter-toggle .rotate {
    transform: rotate(180deg);
  }
  
  .filters-panel {
    position: absolute;
    top: 100%;
    left: 0;
    margin-top: 8px;
    background-color: white;
    border-radius: 8px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
    width: 300px;
    z-index: 10;
    padding: 16px;
  }
  
  .filter-group {
    margin-bottom: 16px;
  }
  
  .filter-group label {
    display: block;
    font-weight: 500;
    margin-bottom: 8px;
    color: #333;
  }
  
  .checkbox-group, .radio-group {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 8px;
  }
  
  .checkbox, .radio {
    display: flex;
    align-items: center;
    gap: 6px;
    cursor: pointer;
  }
  
  .filter-actions {
    display: flex;
    justify-content: flex-end;
    gap: 8px;
    margin-top: 16px;
  }
  
  .reset-btn, .apply-btn {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 6px 12px;
    border-radius: 4px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s;
    border: none;
  }
  
  .reset-btn {
    background-color: #f0f0f0;
    color: #555;
  }
  
  .reset-btn:hover {
    background-color: #e0e0e0;
  }
  
  .apply-btn {
    background-color: var(--primary-color);
    color: white;
  }
  
  .apply-btn:hover {
    background-color: #2a75e8;
  }
  
  .view-controls {
    display: flex;
    gap: 8px;
  }
  
  .view-btn {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px 16px;
    background-color: white;
    border: 1px solid #ddd;
    border-radius: 6px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s;
  }
  
  .view-btn:hover {
    background-color: #f5f5f5;
  }
  
  .view-btn.active {
    background-color: var(--primary-color);
    color: white;
    border-color: var(--primary-color);
  }
  
  .map-container {
    flex: 1;
    position: relative;
    background-color: white;
    border-radius: 12px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
    overflow: hidden;
  }
  
  .map-element {
    width: 100%;
    height: 100%;
  }
  
  .map-legend {
    position: absolute;
    top: 16px;
    right: 16px;
    background-color: white;
    border-radius: 8px;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
    padding: 12px;
    z-index: 5;
  }
  
  .map-legend h4 {
    font-size: 14px;
    font-weight: 600;
    margin-bottom: 8px;
    color: #333;
  }
  
  .legend-item {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 6px;
    font-size: 12px;
  }
  
  .legend-color {
    width: 16px;
    height: 16px;
    border-radius: 4px;
  }
  
  .map-loading {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(255, 255, 255, 0.8);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 12px;
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
  
  .report-details {
    position: absolute;
    top: 16px;
    left: 16px;
    background-color: white;
    border-radius: 8px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
    width: 350px;
    max-height: calc(100% - 32px);
    overflow-y: auto;
    z-index: 5;
  }
  
  .report-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 16px;
    border-bottom: 1px solid #eee;
  }
  
  .report-header h3 {
    font-size: 16px;
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
  
  .report-content {
    padding: 16px;
  }
  
  .report-info {
    margin-bottom: 16px;
  }
  
  .info-item {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 8px;
    color: #555;
  }
  
  .report-description h4, .report-photos h4, .reporter-info h4 {
    font-size: 14px;
    font-weight: 600;
    margin-bottom: 8px;
    color: #333;
  }
  
  .report-description {
    margin-bottom: 16px;
  }
  
  .report-description p {
    color: #555;
    line-height: 1.5;
  }
  
  .report-photos {
    margin-bottom: 16px;
  }
  
  .photos-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 8px;
  }
  
  .photo-item {
    aspect-ratio: 1;
    border-radius: 4px;
    overflow: hidden;
    cursor: pointer;
  }
  
  .photo-item img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
  
  .reporter-info {
    padding-top: 16px;
    border-top: 1px solid #eee;
  }
  
  /* Transitions */
  .slide-down-enter-active,
  .slide-down-leave-active {
    transition: all 0.3s ease;
  }
  
  .slide-down-enter-from,
  .slide-down-leave-to {
    opacity: 0;
    transform: translateY(-10px);
  }
  </style>