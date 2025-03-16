<template>
    <div class="report-crime-container">
      <div class="page-header">
        <h1>Report an Emergency</h1>
        <p>Help keep Jamaica safe by reporting emergencies!</p>
      </div>
      
      <div class="report-card">
        <div v-if="!reportSubmitted">
          <div class="steps-indicator">
            <div 
              v-for="(step, index) in steps" 
              :key="index"
              class="step" 
              :class="{ 
                'active': currentStep === index,
                'completed': currentStep > index 
              }"
            >
              <div class="step-number">
                <check-icon v-if="currentStep > index" size="16" />
                <span v-else>{{ index + 1 }}</span>
              </div>
              <div class="step-label">{{ step }}</div>
            </div>
          </div>
          
          <transition name="slide-fade" mode="out-in">
            <!-- Step 1: Location and Time -->
            <div v-if="currentStep === 0" class="step-content">
              <div class="location-time-info">
                <div class="info-card">
                  <map-pin-icon size="20" />
                  <div>
                    <h3>Current Location</h3>
                    <p>{{ locationInfo.address || 'Fetching location...' }}</p>
                    <div class="coordinates">
                      <span>Lat: {{ locationInfo.latitude?.toFixed(6) || '...' }}</span>
                      <span>Lng: {{ locationInfo.longitude?.toFixed(6) || '...' }}</span>
                    </div>
                  </div>
                </div>
                
                <div class="info-card">
                  <clock-icon size="20" />
                  <div>
                    <h3>Current Time</h3>
                    <p>{{ formattedDateTime }}</p>
                  </div>
                </div>
              </div>
              
              <div class="location-map">
                <div ref="mapContainer" class="map-container"></div>
              </div>
              
              <div class="step-actions">
                <p class="note">
                  <info-icon size="16" />
                  Location and time are automatically captured and cannot be modified for accuracy purposes.
                </p>
                <button 
                  @click="goToNextStep" 
                  class="next-btn"
                  :disabled="!locationInfo.latitude || !locationInfo.longitude"
                >
                  Continue
                  <arrow-right-icon size="16" />
                </button>
              </div>
            </div>

            
            <!-- Step 2: Crime Details -->
            <div v-else-if="currentStep === 1" class="step-content">
              <div class="form-group">
                <label for="crime-type">Type of Emergency</label>
                <select id="crime-type" v-model="crimeReport.crimeType" required>
                  <option value="" disabled>Select emergency type</option>
                  <option v-for="type in crimeTypes" :key="type.value" :value="type.value">
                    {{ type.label }}
                  </option>
                </select>
              </div>
              
              <div class="form-group">
                <label for="crime-description">Description</label>
                <textarea 
                  id="crime-description" 
                  v-model="crimeReport.description" 
                  rows="5" 
                  placeholder="Provide details about what you observed..."
                  required
                ></textarea>
                <div class="char-count" :class="{ 'warning': descriptionCharsLeft < 50 }">
                  {{ descriptionCharsLeft }} characters left
                </div>
              </div>
              
              <div class="form-group">
                <label>Severity Level</label>
                <div class="severity-selector">
                  <button 
                    v-for="level in severityLevels" 
                    :key="level.value"
                    type="button"
                    class="severity-btn"
                    :class="{ 'active': crimeReport.severityLevel === level.value }"
                    @click="crimeReport.severityLevel = level.value"
                  >
                    <span class="severity-indicator" :style="{ backgroundColor: level.color }"></span>
                    {{ level.label }}
                  </button>
                </div>
              </div>
              
              <div class="form-group">
                <label>Add Photos (Optional)</label>
                <div class="photo-upload">
                  <label for="photo-input" class="upload-btn">
                    <upload-icon size="20" />
                    <span>Upload Photos</span>
                  </label>
                  <input 
                    type="file" 
                    id="photo-input" 
                    accept="image/*" 
                    multiple 
                    @change="handlePhotoUpload"
                    class="hidden-input"
                  />
                  <p class="upload-note">Up to 3 photos, max 5MB each</p>
                </div>
                
                <div v-if="photos.length > 0" class="photo-preview">
                  <div 
                    v-for="(photo, index) in photos" 
                    :key="index" 
                    class="photo-item"
                  >
                    <img :src="photo.url" alt="Emergency scene photo" />
                    <button type="button" class="remove-photo" @click="removePhoto(index)">
                      <x-icon size="16" />
                    </button>
                  </div>
                </div>
              </div>
              
              <div class="step-actions">
                <button @click="goToPreviousStep" class="back-btn">
                  <arrow-left-icon size="16" />
                  Back
                </button>
                <button 
                  @click="goToNextStep" 
                  class="next-btn"
                  :disabled="!isStep2Valid"
                >
                  Continue
                  <arrow-right-icon size="16" />
                </button>
              </div>
            </div>
            
            <!-- Step 3: Review and Submit -->
            <div v-else class="step-content">
              <h2>Review Your Report</h2>
              
              <div class="review-section">
                <h3>Location & Time</h3>
                <div class="review-item">
                  <map-pin-icon size="16" />
                  <span>{{ locationInfo.address }}</span>
                </div>
                <div class="review-item">
                  <clock-icon size="16" />
                  <span>{{ formattedDateTime }}</span>
                </div>
              </div>
              
              <div class="review-section">
                <h3>Emergency Details</h3>
                <div class="review-item">
                  <alert-triangle-icon size="16" />
                  <span>{{ getCrimeTypeLabel(crimeReport.crimeType) }}</span>
                </div>
                <div class="review-item">
                  <thermometer-icon size="16" />
                  <span>Severity: {{ getSeverityLabel(crimeReport.severityLevel) }}</span>
                </div>
                <div class="review-item description">
                  <file-text-icon size="16" />
                  <p>{{ crimeReport.description }}</p>
                </div>
              </div>
              
              <div v-if="photos.length > 0" class="review-section">
                <h3>Photos</h3>
                <div class="photos-grid">
                  <div v-for="(photo, index) in photos" :key="index" class="photo-thumbnail">
                    <img :src="photo.url" alt="Crime scene photo" />
                  </div>
                </div>
              </div>
              
              <div class="form-group terms-checkbox">
                <label class="checkbox">
                  <input type="checkbox" v-model="termsAgreed" required />
                  <span>I confirm that this report is accurate to the best of my knowledge and understand that filing a false report may lead to legal consequences.</span>
                </label>
              </div>
              
              <div class="step-actions">
                <button @click="goToPreviousStep" class="back-btn">
                  <arrow-left-icon size="16" />
                  Back
                </button>
                <button 
                  @click="submitReport" 
                  class="submit-btn"
                  :disabled="!termsAgreed || isSubmitting"
                >
                  <loader-icon v-if="isSubmitting" class="spin" size="16" />
                  <span v-else>Submit Report</span>
                </button>
              </div>
            </div>
          </transition>
        </div>
        
        <!-- Success Message -->
        <div v-else class="success-message">
          <div class="success-icon">
            <check-circle-icon size="64" />
          </div>
          <h2>Report Submitted Successfully</h2>
          <p>Thank you for helping to keep your community safe. Your report has been recorded.</p>
          <p class="report-id">Report ID: {{ submittedReportId }}</p>
          <div class="success-actions">
            <button @click="resetForm" class="new-report-btn">
              <plus-icon size="16" />
              New Report
            </button>
            <router-link to="/map" class="view-map-btn">
              <map-icon size="16" />
              View on Map
            </router-link>
          </div>
        </div>
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref, computed, onMounted, watch } from 'vue';
  import { 
    CheckIcon, MapPinIcon, ClockIcon, InfoIcon, ArrowRightIcon, 
    ArrowLeftIcon, UploadIcon, XIcon, AlertTriangleIcon, 
    ThermometerIcon, FileTextIcon, CheckCircleIcon, 
    PlusIcon, MapIcon, LoaderIcon
  } from 'lucide-vue-next';
  import { getCurrentLocation, getLocationName } from '../services/locationService';
  import { submitCrimeReport } from '../services/reportService';
  
  // Steps
  const steps = ['Location & Time', 'Emergency Details', 'Review & Submit'];
  const currentStep = ref(0);
  
  // Location and time data
  const locationInfo = ref({
    latitude: null,
    longitude: null,
    address: 'Fetching your location...'
  });
  
  const currentDateTime = ref(new Date());
  const formattedDateTime = computed(() => {
    const options = { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    return currentDateTime.value.toLocaleDateString(undefined, options);
  });
  
  // Crime report form data
  const crimeReport = ref({
    crimeType: '',
    description: '',
    severityLevel: 'medium',
  });
  
  const photos = ref([]);
  const termsAgreed = ref(false);
  const isSubmitting = ref(false);
  const reportSubmitted = ref(false);
  const submittedReportId = ref('');
  const mapContainer = ref(null);
  let map = null;
  
  // Crime types
  const crimeTypes = [
    { value: 'theft', label: 'Theft' },
    { value: 'assault', label: 'Assault' },
    { value: 'suspicious_activity', label: 'Suspicious Activity' },
    { value: 'traffic_incident', label: 'Traffic Incident' },
     { value: 'fire', label: 'Fire' },
    { value: 'medical_emergency', label: 'Medical Emergency' }, // Accidents, sudden illness
    { value: 'missing_person', label: 'Missing Person' }, // Report missing individuals
    { value: 'child_endangerment', label: 'Child Endangerment' }, // Child in danger
    { value: 'elderly_assistance', label: 'Elderly Assistance' }, // Elderly person in distress
   { value: 'public_disturbance', label: 'Public Disturbance' }, // Riots, protests, loud noise complaints
     { value: 'other', label: 'Other' }
];

  
  // Severity levels
  const severityLevels = [
    { value: 'low', label: 'Low', color: '#4caf50' },
    { value: 'medium', label: 'Medium', color: '#ff9800' },
    { value: 'high', label: 'High', color: '#f44336' }
  ];
  
  // Computed properties
  const descriptionCharsLeft = computed(() => {
    return 500 - crimeReport.value.description.length;
  });
  
  const isStep2Valid = computed(() => {
    return crimeReport.value.crimeType && 
           crimeReport.value.description.length >= 20 &&
           crimeReport.value.severityLevel;
  });
  
  // Methods
  const goToNextStep = () => {
    if (currentStep.value < steps.length - 1) {
      currentStep.value++;
    }
  };
  
  const goToPreviousStep = () => {
    if (currentStep.value > 0) {
      currentStep.value--;
    }
  };
  
  const handlePhotoUpload = (event) => {
    const files = event.target.files;
    
    if (!files.length) return;
    
    // Limit to 3 photos
    if (photos.value.length + files.length > 3) {
      alert('You can upload a maximum of 3 photos');
      return;
    }
    
    // Process each file
    Array.from(files).forEach(file => {
      // Check file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        alert(`File ${file.name} exceeds the 5MB size limit`);
        return;
      }
      
      const reader = new FileReader();
      reader.onload = (e) => {
        photos.value.push({
          file: file,
          url: e.target.result
        });
      };
      reader.readAsDataURL(file);
    });
    
    // Reset the input
    event.target.value = '';
  };
  
  const removePhoto = (index) => {
    photos.value.splice(index, 1);
  };
  
  const getCrimeTypeLabel = (value) => {
    const crimeType = crimeTypes.find(type => type.value === value);
    return crimeType ? crimeType.label : value;
  };
  
  const getSeverityLabel = (value) => {
    const severity = severityLevels.find(level => level.value === value);
    return severity ? severity.label : value;
  };
  
  const submitReport = async () => {
    if (!termsAgreed.value) return;
    
    isSubmitting.value = true;
    
    try {
      // Prepare report data
      const reportData = {
        location: {
          latitude: locationInfo.value.latitude,
          longitude: locationInfo.value.longitude,
          address: locationInfo.value.address
        },
        timestamp: currentDateTime.value.toISOString(),
        crimeType: crimeReport.value.crimeType,
        description: crimeReport.value.description,
        severityLevel: crimeReport.value.severityLevel,
        photos: photos.value.map(photo => photo.file)
      };
      
      // Submit report to API
      const response = await submitCrimeReport(reportData);
      
      // Show success message
      submittedReportId.value = response.reportId;
      reportSubmitted.value = true;
    } catch (error) {
      console.error('Error submitting report:', error);
      alert('Failed to submit report. Please try again.');
    } finally {
      isSubmitting.value = false;
    }
  };
  
  const resetForm = () => {
    currentStep.value = 0;
    crimeReport.value = {
      crimeType: '',
      description: '',
      severityLevel: 'medium',
    };
    photos.value = [];
    termsAgreed.value = false;
    reportSubmitted.value = false;
    submittedReportId.value = '';
  };
  
  const initMap = () => {
    if (!mapContainer.value) return;
    
    // Initialize Google Maps
    // Note: In a real application, you would use the actual Google Maps API
    // This is a placeholder for demonstration purposes
    console.log('Map would be initialized here with coordinates:', 
      locationInfo.value.latitude, 
      locationInfo.value.longitude
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
    mapDiv.textContent = 'Google Maps would display here';
    
    mapContainer.value.innerHTML = '';
    mapContainer.value.appendChild(mapDiv);
  };
  
  onMounted(async () => {
    try {
      // Get current location
      const position = await getCurrentLocation();
      locationInfo.value.latitude = position.latitude;
      locationInfo.value.longitude = position.longitude;
      
      // Get address from coordinates
      locationInfo.value.address = await getLocationName(
        position.latitude,
        position.longitude
      );
      
      // Initialize map
      initMap();
    } catch (error) {
      console.error('Error getting location:', error);
      locationInfo.value.address = 'Location unavailable';
    }
  });
  
  watch(() => currentStep.value, (newStep) => {
    if (newStep === 0) {
      // Re-initialize map when returning to step 1
      setTimeout(initMap, 100);
    }
  });
  </script>
  
  <style scoped>
  .report-crime-container {
    max-width: 800px;
    margin: 0 auto;
  }
  
  .page-header {
    margin-bottom: 24px;
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
  
  .report-card {
    background-color: white;
    border-radius: 12px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
    overflow: hidden;
  }
  
  .steps-indicator {
    display: flex;
    padding: 24px;
    border-bottom: 1px solid #eee;
  }
  
  .step {
    display: flex;
    align-items: center;
    flex: 1;
    position: relative;
  }
  
  .step:not(:last-child)::after {
    content: '';
    position: absolute;
    top: 16px;
    left: 32px;
    right: 0;
    height: 2px;
    background-color: #e0e0e0;
    z-index: 1;
  }
  
  .step.active:not(:last-child)::after,
  .step.completed:not(:last-child)::after {
    background-color: var(--primary-color);
    
  }
  
  .step-number {
    width: 32px;
    height: 32px;
    border-radius: 50%;
    background-color: #e0e0e0;
    color: #666;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 600;
    margin-right: 12px;
    z-index: 2;
    transition: all 0.3s;
  }
  
  .step.active .step-number {
    background-color: var(--primary-color);
    color: white;
  }
  
  .step.completed .step-number {
    background-color: var(--success-color);
    color: white;
  }
  
  .step-label {
    font-size: 14px;
    font-weight: 500;
    color: #666;
    padding-bottom: 10%;
  }
  
  .step.active .step-label {
    color: var(--primary-color);
    font-weight: 600;
  }
  
  .step.completed .step-label {
    color: var(--success-color);
  }
  
  .step-content {
    padding: 24px;
  }
  
  .location-time-info {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 16px;
    margin-bottom: 20px;
  }
  
  @media (max-width: 600px) {
    .location-time-info {
      grid-template-columns: 1fr;
    }
  }
  
  .info-card {
    background-color: #f8f9fa;
    border-radius: 8px;
    padding: 16px;
    display: flex;
    gap: 12px;
    align-items: flex-start;
  }
  
  .info-card h3 {
    font-size: 16px;
    font-weight: 600;
    margin-bottom: 4px;
    color: #333;
  }
  
  .info-card p {
    color: #555;
    font-size: 14px;
  }
  
  .coordinates {
    display: flex;
    gap: 12px;
    margin-top: 4px;
    font-size: 12px;
    color: #666;
  }
  
  .location-map {
    margin-bottom: 20px;
  }
  
  .map-container {
    height: 250px;
    border-radius: 8px;
    overflow: hidden;
    border: 1px solid #eee;
  }
  
  .step-actions {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-top: 24px;
  }
  
  .note {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 14px;
    color: #666;
    max-width: 60%;
  }
  
  .next-btn, .back-btn, .submit-btn {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 10px 20px;
    border-radius: 6px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s;
    border: none;
  }
  
  .next-btn {
    background-color: var(--primary-color);
    color: white;
  }
  
  .next-btn:hover {
    background-color: #2a75e8;
  }
  
  .next-btn:disabled {
    background-color: #a0a0a0;
    cursor: not-allowed;
  }
  
  .back-btn {
    background-color: #f0f0f0;
    color: #555;
  }
  
  .back-btn:hover {
    background-color: #e0e0e0;
  }
  
  .submit-btn {
    background-color: var(--success-color);
    color: white;
  }
  
  .submit-btn:hover {
    background-color: #05b589;
  }
  
  .submit-btn:disabled {
    background-color: #a0a0a0;
    cursor: not-allowed;
  }
  
  .form-group {
    margin-bottom: 20px;
  }
  
  .form-group label {
    display: block;
    margin-bottom: 8px;
    font-weight: 500;
    color: #333;
  }
  
  select, textarea {
    width: 100%;
    padding: 12px;
    border: 1px solid #ddd;
    border-radius: 6px;
    font-size: 15px;
    transition: border-color 0.3s;
  }
  
  select:focus, textarea:focus {
    border-color: var(--primary-color);
    outline: none;
    box-shadow: 0 0 0 3px rgba(58, 134, 255, 0.1);
  }
  
  .char-count {
    text-align: right;
    font-size: 12px;
    color: #666;
    margin-top: 4px;
  }
  
  .char-count.warning {
    color: var(--danger-color);
  }
  
  .severity-selector {
    display: flex;
    gap: 10px;
  }
  
  .severity-btn {
    flex: 1;
    padding: 10px;
    border: 1px solid #ddd;
    border-radius: 6px;
    background-color: white;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    cursor: pointer;
    transition: all 0.2s;
  }
  
  .severity-btn:hover {
    background-color: #f5f5f5;
  }
  
  .severity-btn.active {
    border-color: var(--primary-color);
    background-color: #f0f7ff;
  }
  
  .severity-indicator {
    width: 12px;
    height: 12px;
    border-radius: 50%;
  }
  
  .photo-upload {
    margin-bottom: 12px;
  }
  
  .upload-btn {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 10px 16px;
    background-color: #f0f0f0;
    border-radius: 6px;
    cursor: pointer;
    transition: background-color 0.2s;
  }
  
  .upload-btn:hover {
    background-color: #e0e0e0;
  }
  
  .hidden-input {
    display: none;
  }
  
  .upload-note {
    font-size: 12px;
    color: #666;
    margin-top: 8px;
  }
  
  .photo-preview {
    display: flex;
    gap: 12px;
    flex-wrap: wrap;
  }
  
  .photo-item {
    position: relative;
    width: 100px;
    height: 100px;
    border-radius: 8px;
    overflow: hidden;
  }
  
  .photo-item img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
  
  .remove-photo {
    position: absolute;
    top: 4px;
    right: 4px;
    width: 24px;
    height: 24px;
    border-radius: 50%;
    background-color: rgba(0, 0, 0, 0.5);
    color: white;
    display: flex;
    align-items: center;
    justify-content: center;
    border: none;
    cursor: pointer;
    transition: background-color 0.2s;
  }
  
  .remove-photo:hover {
    background-color: rgba(0, 0, 0, 0.7);
  }
  
  .review-section {
    margin-bottom: 24px;
    padding-bottom: 16px;
    border-bottom: 1px solid #eee;
  }
  
  .review-section h3 {
    font-size: 16px;
    font-weight: 600;
    margin-bottom: 12px;
    color: #333;
  }
  
  .review-item {
    display: flex;
    align-items: flex-start;
    gap: 10px;
    margin-bottom: 8px;
    color: #555;
  }
  
  .review-item.description {
    align-items: flex-start;
  }
  
  .photos-grid {
    display: flex;
    gap: 10px;
    flex-wrap: wrap;
  }
  
  .photo-thumbnail {
    width: 80px;
    height: 80px;
    border-radius: 6px;
    overflow: hidden;
  }
  
  .photo-thumbnail img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
  
  .terms-checkbox {
    display: flex;
    align-items: flex-start;
    gap: 10px;
  }
  
  .checkbox {
    display: flex;
    align-items: flex-start;
    cursor: pointer;
  }
  
  .checkbox input {
    margin-top: 3px;
    margin-right: 8px;
  }
  
  .success-message {
    padding: 40px 24px;
    text-align: center;
  }
  
  .success-icon {
    color: var(--success-color);
    margin-bottom: 20px;
  }
  
  .success-message h2 {
    font-size: 24px;
    font-weight: 700;
    margin-bottom: 12px;
    color: #333;
  }
  
  .success-message p {
    color: #555;
    margin-bottom: 8px;
  }
  
  .report-id {
    font-family: monospace;
    background-color: #f5f5f5;
    padding: 8px 16px;
    border-radius: 4px;
    display: inline-block;
    margin: 16px 0;
  }
  
  .success-actions {
    display: flex;
    justify-content: center;
    gap: 16px;
    margin-top: 24px;
  }
  
  .new-report-btn, .view-map-btn {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 12px 20px;
    border-radius: 6px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s;
    text-decoration: none;
  }
  
  .new-report-btn {
    background-color: var(--primary-color);
    color: white;
    border: none;
  }
  
  .new-report-btn:hover {
    background-color: #2a75e8;
  }
  
  .view-map-btn {
    background-color: #f0f0f0;
    color: #555;
    border: 1px solid #ddd;
  }
  
  .view-map-btn:hover {
    background-color: #e0e0e0;
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
  
  /* Transitions */
  .slide-fade-enter-active,
  .slide-fade-leave-active {
    transition: all 0.3s ease;
  }
  
  .slide-fade-enter-from {
    opacity: 0;
    transform: translateX(30px);
  }
  
  .slide-fade-leave-to {
    opacity: 0;
    transform: translateX(-30px);
  }
  </style>