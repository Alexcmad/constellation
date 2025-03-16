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
          
          <!-- Enhanced Legend -->
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
              <h5>Severity Levels</h5>
              <div class="severity-color-scale">
                <div class="severity-color-item">
                  <span class="severity-color-dot" style="background-color: #22c55e;"></span>
                  <span>Low (0-3)</span>
                </div>
                <div class="severity-color-item">
                  <span class="severity-color-dot" style="background-color: #f97316;"></span>
                  <span>Moderate (4-7)</span>
                </div>
                <div class="severity-color-item">
                  <span class="severity-color-dot" style="background-color: #dc2626;"></span>
                  <span>High (8-10)</span>
                </div>
              </div>
              
              <h5>Dot Size</h5>
              <div class="severity-dots">
                <span class="severity-dot small"></span>
                <span class="severity-dot medium"></span>
                <span class="severity-dot large"></span>
                <span class="severity-label">Impact Radius</span>
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

export default {
  data() {
    return {
      isLoading: true,
      errorMessage: null,
      map: null,
      mapView: 'dots', // 'dots' or 'heatmap'
      minSeverity: 0,
      activeFilters: ['fire', 'medical', 'crime', 'natural_disaster', 'other'],
      emergencyTypes: [
        { value: 'fire', label: 'Fire', color: '#ef4444' },
        { value: 'medical', label: 'Medical', color: '#3b82f6' },
        { value: 'crime', label: 'Crime', color: '#6366f1' },
        { value: 'natural_disaster', label: 'Natural Disaster', color: '#eab308', isWarning: true },
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
      try {
        // In a real implementation, this would come from your API
        const reports = getCrimeReports();
        this.emergencyReports = reports;
        if (this.map) {
          this.updateMapVisualization();
        }
      } catch (error) {
        this.errorMessage = 'Failed to load emergency data';
        console.error('Error loading emergency data:', error);
      }
    },
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
        
        // Determine color based on severity and emergency type
        let color;
        if (typeInfo && typeInfo.isWarning) {
          // Special warning color for natural disasters regardless of severity
          color = typeInfo.color;
        } else {
          // Color based on severity level
          if (report.severity <= 3) {
            color = '#22c55e'; // Green for low severity
          } else if (report.severity <= 7) {
            color = '#f97316'; // Orange for moderate severity
          } else {
            color = '#dc2626'; // Red for high severity
          }
        }
        
        // Create a darker shade for the stroke
        const strokeColor = this.darkenColor(color, 20);
        
        // Radius based on severity and potentially affected area
        const radius = report.severity * 100 + (report.impactRadius || 0);
        
        return new google.maps.Circle({
          map: this.map,
          center: report.location,
          radius: radius,
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
      
      // Custom gradient for heatmap based on severity levels
      const gradient = [
        'rgba(0, 255, 0, 0)',  // transparent
        'rgba(34, 197, 94, 1)', // green - low severity
        'rgba(249, 115, 22, 1)', // orange - moderate severity
        'rgba(220, 38, 38, 1)'   // red - high severity
      ];
      
      this.heatmap = new google.maps.visualization.HeatmapLayer({
        data: this.heatmapData,
        map: this.map,
        radius: 20,
        opacity: 0.7,
        gradient: gradient
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
    },
    getSeverityColor(severity) {
      if (severity <= 3) return '#22c55e'; // Green for low severity
      if (severity <= 7) return '#f97316'; // Orange for moderate severity
      return '#dc2626'; // Red for high severity
    }
  },
  beforeDestroy() {
    this.clearVisualization();
  }
};
</script>

<style scoped>
.map-wrapper {
  width: 100%;
  height: 100%;
  position: relative;
}

.map-card {
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  height: 100%;
}

.map-container {
  position: relative;
  height: 100%;
  min-height: 500px;
}

.map-element {
  height: 100%;
  width: 100%;
}

.map-loading {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: rgba(255, 255, 255, 0.8);
}

.loading-spinner {
  display: inline-block;
  width: 24px;
  height: 24px;
  border: 3px solid rgba(0, 0, 0, 0.1);
  border-radius: 50%;
  border-top-color: #3b82f6;
  animation: spin 1s linear infinite;
  margin-right: 8px;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.error-message {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: rgba(255, 255, 255, 0.9);
  color: #ef4444;
  font-weight: 500;
}

.map-controls {
  position: absolute;
  top: 16px;
  right: 16px;
  width: 280px;
  z-index: 1;
}

.control-card,
.legend-card {
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  padding: 16px;
  margin-bottom: 16px;
}

.control-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.control-header h3 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: black;
}

.view-toggle {
  display: flex;
}

.view-toggle button {
  padding: 4px 8px;
  border: 1px solid #e5e7eb;
  background-color: white;
  font-size: 12px;
  cursor: pointer;
}

.view-toggle button:first-child {
  border-radius: 4px 0 0 4px;
}

.view-toggle button:last-child {
  border-radius: 0 4px 4px 0;
}

h4{
  color: black;
}

.view-toggle button.active {
  background-color: #3b82f6;
  color: white;
  border-color: #3b82f6;
}

.filter-section {
  margin-bottom: 16px;
}

.filter-section h4 {
  font-size: 14px;
  margin: 0 0 8px 0;
  font-weight: 500;
  color: black;
}

.filter-options {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.filter-option {
  display: flex;
  align-items: center;
}

.filter-option label {
  display: flex;
  align-items: center;
  font-size: 13px;
  cursor: pointer;
  color: black;
}

.color-dot {
  display: inline-block;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  margin-right: 6px;
}

.severity-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
  color: black;
}

.severity-slider {
  width: 100%;
  margin-bottom: 4px;
}

.slider-labels {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  color: #4b5563;
}

.legend-items {
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-bottom: 12px;
  color: black;
}

.legend-item {
  display: flex;
  align-items: center;
  color: black;
}

.legend-dot {
  display: inline-block;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  margin-right: 6px;
}

.severity-legend h5 {
  font-size: 13px;
  margin: 12px 0 8px 0;
  font-weight: 500;
  color: black;
}

.severity-color-scale {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.severity-color-item {
  display: flex;
  align-items: center;
  font-size: 12px;
  color: black;
}

.severity-color-dot {
  display: inline-block;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  margin-right: 6px;
}

.severity-dots {
  display: flex;
  align-items: center;
  gap: 4px;
}

.severity-dot {
  display: inline-block;
  background-color: rgba(59, 130, 246, 0.7);
  border: 1px solid #2563eb;
  border-radius: 50%;
}

.severity-dot.small {
  width: 8px;
  height: 8px;
}

.severity-dot.medium {
  width: 12px;
  height: 12px;
}

.severity-dot.large {
  width: 16px;
  height: 16px;
}

.severity-label {
  font-size: 12px;
  margin-left: 4px;
  color: black;

}

/* Additional styles for natural disaster warning highlights */
.warning-alert {
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0% {
    opacity: 0.7;
  }
  50% {
    opacity: 1;
  }
  100% {
    opacity: 0.7;
  }
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .map-controls {
    width: 90%;
    max-width: 280px;
    right: 5%;
  }
}
</style>