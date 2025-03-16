<template>
  <div class="map-wrapper">
    <div class="map-card">
      <div class="map-container">
        <div ref="mapElement" class="map-element"></div>

        <!-- Loading Spinner -->
        <div v-if="isLoading" class="map-loading">
          <div class="loading-content">
            <span class="loading-spinner"></span>
            <span>Loading map...</span>
          </div>
        </div>

        <!-- Error Message -->
        <div v-if="errorMessage" class="error-message">
          <span>{{ errorMessage }}</span>
        </div>

        <!-- Map Controls -->
        <div v-if="!isLoading && !errorMessage" class="map-controls">
          <div class="control-card">
            <div class="control-header">
              <h3>Emergency Alerts</h3>
              <div class="view-toggle">
                <button 
                  @click="setMapView('dots')" 
                  :class="{ active: mapView === 'dots' }"
                >
                  Dots
                </button>
                <button 
                  @click="setMapView('heatmap')" 
                  :class="{ active: mapView === 'heatmap' }"
                >
                  Heat Map
                </button>
              </div>
            </div>
            
            <div class="filter-section">
              <h4>Emergency Types</h4>
              <div class="filter-options">
                <div 
                  v-for="type in emergencyTypes" 
                  :key="type.value" 
                  class="filter-option"
                >
                  <input 
                    type="checkbox" 
                    :id="type.value" 
                    :value="type.value" 
                    v-model="activeFilters"
                  />
                  <label :for="type.value">
                    <span 
                      class="color-dot" 
                      :style="{ backgroundColor: type.color }"
                    ></span>
                    {{ type.label }}
                  </label>
                </div>
              </div>
            </div>
            
            <div class="filter-section">
              <div class="severity-header">
                <h4>Min Severity</h4>
                <span>{{ minSeverity }}</span>
              </div>
              <input 
                type="range" 
                min="0" 
                max="10" 
                step="1" 
                v-model.number="minSeverity" 
                class="severity-slider"
              />
              <div class="slider-labels">
                <span>Low</span>
                <span>High</span>
              </div>
            </div>
          </div>
          
          <!-- Legend -->
          <div class="legend-card">
            <h4>Legend</h4>
            <div class="legend-items">
              <div 
                v-for="type in emergencyTypes" 
                :key="type.value" 
                class="legend-item"
              >
                <span 
                  class="legend-dot" 
                  :style="{ backgroundColor: type.color }"
                ></span>
                <span>{{ type.label }}</span>
              </div>
            </div>
            
            <div class="severity-legend">
              <h5>Circle Size</h5>
              <div class="severity-dots">
                <span class="severity-dot small"></span>
                <span class="severity-dot medium"></span>
                <span class="severity-dot large"></span>
                <span class="severity-label">Severity Level</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { getCrimeReports } from '@/services/reportService';
import { ref } from 'vue';
const reports_data=ref(getCrimeReports());
export default {
  data() {
    return {
      isLoading: true,
      errorMessage: null,
      map: null,
      mapView: 'dots', // 'dots' or 'heatmap'
      minSeverity: 0,
      activeFilters: ['fire', 'medical', 'crime', 'natural disaster', 'other'],
      emergencyTypes: [
        { value: 'fire', label: 'Fire', color: '#ef4444' },
        { value: 'medical', label: 'Medical', color: '#3b82f6' },
        { value: 'crime', label: 'Crime', color: '#6366f1' },
        { value: 'natural disaster', label: 'Natural disaster', color: '#65a30d' },
        { value: 'other', label: 'Other', color: '#9333ea' },
      ],
      emergencyReports: [],
      circles: [],
      heatmap: null,
    };
  },
  computed: {
    filteredReports() {
      return this.emergencyReports.filter(report => 
        this.activeFilters.includes(report.type) && 
        report.severity >= this.minSeverity
      );
    },
    heatmapData() {
      if (!window.google) return [];
      return this.filteredReports.map(report => ({
        location: new google.maps.LatLng(report.location.lat, report.location.lng),
        weight: report.severity,
      }));
    }
  },
  watch: {
    filteredReports() {
      this.updateMapVisualization();
    },
    mapView() {
      this.updateMapVisualization();
    }
  },
  mounted() {
    this.loadGoogleMap();
    this.loadEmergencyData();
  },
  methods: {
    loadGoogleMap() {
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=AIzaSyD8aepW-FrtXxQB64FKXS2JKp9QabST0dY&libraries=visualization`;
      script.async = true;
      script.defer = true;
      script.onload = this.initMap;
      script.onerror = () => {
        this.errorMessage = 'Failed to load Google Maps';
        this.isLoading = false;
      };
      document.head.appendChild(script);
    },
    initMap() {
      this.isLoading = false;
      const mapElement = this.$refs.mapElement;
      this.map = new google.maps.Map(mapElement, {
        center: { lat: 18.1096, lng: -77.2975 },
        zoom: 12,
        fullscreenControl: false,
        streetViewControl: false,
        mapTypeControl: false,
      });
      
      // Initialize visualization after map is loaded
      if (this.emergencyReports.length > 0) {
        this.updateMapVisualization();
      }
    },
    loadEmergencyData() {
    // Mock data - in a real app, this would be fetched from an API
    this.emergencyReports =[];  },

    setMapView(view) {
      this.mapView = view;
    },
    updateMapVisualization() {
      if (!this.map || !window.google) return;
      
      // Clear existing visualizations
      this.clearVisualization();
      
      if (this.mapView === 'dots') {
        this.renderDots();
      } else {
        this.renderHeatmap();
      }
    },
    renderDots() {
      this.circles = this.filteredReports.map(report => {
        const typeInfo = this.emergencyTypes.find(t => t.value === report.type);
        const color = typeInfo ? typeInfo.color : '#9333ea';
        
        // Create a darker shade for the stroke
        const strokeColor = this.darkenColor(color, 20);
        
        return new google.maps.Circle({
          map: this.map,
          center: report.location,
          radius: report.severity * 100,
          fillColor: color,
          fillOpacity: 0.7,
          strokeColor: strokeColor,
          strokeOpacity: 1,
          strokeWeight: 1,
        });
      });
    },
    renderHeatmap() {
      if (this.heatmapData.length === 0) return;
      
      this.heatmap = new google.maps.visualization.HeatmapLayer({
        data: this.heatmapData,
        map: this.map,
        radius: 20,
        opacity: 0.7,
      });
    },
    clearVisualization() {
      // Clear circles
      if (this.circles.length) {
        this.circles.forEach(circle => circle.setMap(null));
        this.circles = [];
      }
      
      // Clear heatmap
      if (this.heatmap) {
        this.heatmap.setMap(null);
        this.heatmap = null;
      }
    },
    darkenColor(hex, percent) {
      // Convert hex to RGB
      let r = parseInt(hex.substring(1, 3), 16);
      let g = parseInt(hex.substring(3, 5), 16);
      let b = parseInt(hex.substring(5, 7), 16);
      
      // Darken
      r = Math.floor(r * (100 - percent) / 100);
      g = Math.floor(g * (100 - percent) / 100);
      b = Math.floor(b * (100 - percent) / 100);
      
      // Convert back to hex
      return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
    }
  },
  beforeDestroy() {
    this.clearVisualization();
  }
};
</script>

<style scoped>
.map-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100vh;
  background-color: #f3f4f6;
}

.map-card {
  background-color: #ffffff;
  border-radius: 8px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  width: 80%;
  max-width: 800px;
}

.map-container {
  height: 700px;
  position: relative;
}

.map-element {
  width: 100%;
  height: 100%;
}

.map-loading {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(255, 255, 255, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2;
}

.loading-content {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 16px;
  color: #374151;
}

.loading-spinner {
  display: inline-block;
  width: 24px;
  height: 24px;
  border: 3px solid #e5e7eb;
  border-radius: 50%;
  border-top-color: #3b82f6;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.error-message {
  position: absolute;
  top: 10px;
  left: 10px;
  padding: 10px;
  background-color: #f8d7da;
  color: #721c24;
  border: 1px solid #f5c6cb;
  border-radius: 5px;
  z-index: 3;
}

/* Map Controls */
.map-controls {
  position: absolute;
  top: 10px;
  left: 10px;
  z-index: 2;
  display: flex;
  flex-direction: column;
  gap: 10px;
  max-width: 250px;
}

.control-card, .legend-card {
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  padding: 12px;
  width: 100%;
}

.control-header {
  margin-bottom: 12px;
}

.control-header h3 {
  font-size: 16px;
  font-weight: 600;
  margin: 0 0 8px 0;
}

.view-toggle {
  display: flex;
  border: 1px solid #e5e7eb;
  border-radius: 4px;
  overflow: hidden;
}

.view-toggle button {
  flex: 1;
  padding: 6px 12px;
  background-color: #f9fafb;
  border: none;
  cursor: pointer;
  font-size: 14px;
  transition: background-color 0.2s;
}

.view-toggle button.active {
  background-color: #3b82f6;
  color: white;
}

.filter-section {
  margin-bottom: 16px;
}

.filter-section h4 {
  font-size: 14px;
  font-weight: 500;
  margin: 0 0 8px 0;
}

.filter-options {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.filter-option {
  display: flex;
  align-items: center;
  gap: 8px;
}

.filter-option label {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
  cursor: pointer;
  color:black;
}

.color-dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  display: inline-block;
}

.severity-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.severity-slider {
  width: 100%;
  margin-bottom: 4px;
}

.slider-labels {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  color: #6b7280;
}

/* Legend */
.legend-card h4 {
  font-size: 14px;
  font-weight: 500;
  margin: 0 0 8px 0;
}

.legend-items {
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-bottom: 12px;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color:black;

}

.legend-dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  display: inline-block;
}

.severity-legend h5 {
  font-size: 12px;
  font-weight: 500;
  margin: 0 0 6px 0;
}

.severity-dots {
  display: flex;
  align-items: center;
  gap: 6px;
}

.severity-dot {
  background-color: #6b7280;
  border-radius: 50%;
  display: inline-block;
}

.severity-dot.small {
  width: 6px;
  height: 6px;
}

.severity-dot.medium {
  width: 10px;
  height: 10px;
}

.severity-dot.large {
  width: 14px;
  height: 14px;
}

.severity-label {
  font-size: 12px;
  color: #6b7280;
  margin-left: 4px;
}
</style>