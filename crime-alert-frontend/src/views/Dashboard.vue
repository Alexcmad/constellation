<template>
  <div class="dashboard-container">
    <div class="page-header">
      <h1>Dashboard</h1>
      <p>Welcome back, {{ user?.name || 'Guest' }}</p>
    </div>
    <div class="dashboard-content">
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-icon">
            <AlertTriangleIcon size="24" />
          </div>
          <div class="stat-content">
            <h3>Total Reports</h3>
            <div class="stat-value">{{ stats.totalReports }}</div>
            <div class="stat-change increase">
              <TrendingUpIcon size="14" />
              <span>{{ stats.reportIncrease }}% from last week</span>
            </div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon">
            <MapPinIcon size="24" />
          </div>
          <div class="stat-content">
            <h3>Nearby Alerts</h3>
            <div class="stat-value">{{ stats.nearbyAlerts }}</div>
            <div class="stat-change" :class="stats.alertChange > 0 ? 'increase' : 'decrease'">
              <TrendingUpIcon v-if="stats.alertChange > 0" size="14" />
              <TrendingDownIcon v-else size="14" />
              <span>{{ Math.abs(stats.alertChange) }}% from last week</span>
            </div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon">
            <FlameIcon size="24" />
          </div>
          <div class="stat-content">
            <h3>Hotspots</h3>
            <div class="stat-value">{{ stats.hotspots }}</div>
            <div class="stat-change increase">
              <TrendingUpIcon size="14" />
              <span>{{ stats.hotspotIncrease }}% from last week</span>
            </div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon">
            <CheckCircleIcon size="24" />
          </div>
          <div class="stat-content">
            <h3>Resolved Cases</h3>
            <div class="stat-value">{{ stats.resolvedCases }}</div>
            <div class="stat-change increase">
              <TrendingUpIcon size="14" />
              <span>{{ stats.resolvedIncrease }}% from last week</span>
            </div>
          </div>
        </div>
      </div>
      <div class="dashboard-row">
        <div class="recent-reports">
          <div class="section-header">
            <h2>Recent Reports</h2>
            <router-link to="/auth/map" class="view-all">
              View All <ChevronRightIcon size="16" />
            </router-link>
          </div>
          <div class="reports-list">
            <div v-for="report in recentReports" :key="report.id" class="report-item">
              <div class="report-type" :class="getSeverityClass(report.severity)">
                <AlertTriangleIcon size="16" />
                <span>{{ getReportTypeFromContent(report.content) }}</span>
              </div>
              <div class="report-details">
                <div class="report-location">
                  
                  <MapPinIcon size="14" />
                  
                  <span>{{ getLocationName(report.location_id) }}</span>
                </div>
                <div class="report-time">
                  <ClockIcon size="14" />
                  <span>{{ formatTimeAgo(report.timestamp || report.created_at) }}</span>
                </div>
              </div>
              <div class="report-actions">
                <button class="action-btn">
                  <router-link to="/auth/map" class="view-all">
                  <EyeIcon size="14" />
                </router-link>
                  <span>View</span>
                </button>
              </div>
            </div>
          </div>
        </div>
        <div class="quick-actions">
          <div class="section-header">
            <h2>Quick Actions</h2>
          </div>
          <div class="actions-grid">
            <router-link to="/auth/report" class="action-card">
              <AlertTriangleIcon size="24" />
              <span>Report Emergency</span>
            </router-link>
            <router-link to="/auth/map" class="action-card">
              <MapIcon size="24" />
              <span>View Map</span>
            </router-link>
            <router-link to="/auth/nearby" class="action-card">
              <NavigationIcon size="24" />
              <span>Nearby Alerts</span>
            </router-link>
            <div class="action-card">
              <BellIcon size="24" />
              <span>Notifications</span>
            </div>
          </div>
          <div class="emergency-card">
            <PhoneCallIcon size="24" />
            <div>
              <h3>Emergency?</h3>
              <p>Call 119 immediately for urgent situations</p>
            </div>
            <a href="tel:119" class="emergency-btn">Call Now</a>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { 
  AlertTriangleIcon, MapPinIcon, FlameIcon, CheckCircleIcon, 
  TrendingUpIcon, TrendingDownIcon, ChevronRightIcon, ClockIcon, 
  EyeIcon, MapIcon, NavigationIcon, BellIcon, PhoneCallIcon 
} from 'lucide-vue-next';
import { useRouter } from 'vue-router';
import { getCrimeReports } from '../services/reportService';
import axios from 'axios';
import {fetchUserProfile} from '../services/authService';

const props = defineProps({
  user: {
    type: Object,
    default: () => ({})
  }
});

const router = useRouter();
const user = ref(props.user);
// Dashboard data
const stats = ref({
  totalReports: 0,
  reportIncrease: 0,
  nearbyAlerts: 0,
  alertChange: 0,
  hotspots: 0,
  hotspotIncrease: 0,
  resolvedCases: 0,
  resolvedIncrease: 0
});

const recentReports = ref([]);

// Locations mapping (you should replace this with actual location data)
const locations = {
  1: 'Downtown',
  2: 'Northside',
  3: 'Westend',
  4: 'Eastside',
  5: 'Southside',
  6: 'Central Park',
  7: 'Industrial Zone',
  8: 'Riverside',
  9: 'Hillside',
  10: 'Harbor District'
};

// Helper functions
const getLocationName = (locationId) => {
  return locations[locationId] || `Location ${locationId}`;
};

const getSeverityClass = (severity) => {
  switch(severity) {
    case 3: return 'critical';
    case 2: return 'high';
    case 1: return 'medium';
    case 0:
    default: return 'low';
  }
};

const getReportTypeFromContent = (content) => {
  if (content.includes('Fire') || content.includes('fire') || content.includes('Smoke')) {
    return 'Fire';
  } else if (content.includes('flood') || content.includes('Water levels')) {
    return 'Flood';
  } else if (content.includes('traffic') || content.includes('vehicle') || content.includes('Road blocked')) {
    return 'Traffic';
  } else if (content.includes('chemical') || content.includes('Toxic')) {
    return 'Hazardous';
  } else {
    return 'Alert';
  }
};

const formatTimeAgo = (timestamp) => {
  if (!timestamp) return 'Recently';
  
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

const fetchDashboardData = async () => {
  try {
    // Fetch crime reports
    const reports = await getCrimeReports();
    
    // Get recent reports (last 5)
    recentReports.value = reports
      .sort((a, b) => new Date(b.timestamp || b.created_at) - new Date(a.timestamp || a.created_at))
      .slice(0, 5);
    
    // Calculate stats
    stats.value = {
      totalReports: reports.length,
      reportIncrease: 12,
      nearbyAlerts: 8,
      alertChange: -5,
      hotspots: 3,
      hotspotIncrease: 20,
      resolvedCases: 15,
      resolvedIncrease: 8
    };
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
  }
};

onMounted(async () => {
  fetchDashboardData();
  
  try {
    const token = localStorage.getItem('token');
    if (token) {
      const userData = await fetchUserProfile(token);
      user.value = userData;
    }
  } catch (error) {
    console.error('Error fetching user profile:', error);
  }
});
</script>
  <style scoped>
  .dashboard-container {
    max-width: 1200px;
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
  
  .dashboard-content {
    display: flex;
    flex-direction: column;
    gap: 24px;
  }
  
  .stats-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 16px;
  }
  
  @media (max-width: 1024px) {
    .stats-grid {
      grid-template-columns: repeat(2, 1fr);
    }
  }
  
  @media (max-width: 640px) {
    .stats-grid {
      grid-template-columns: 1fr;
    }
  }
  
  .stat-card {
    background-color: white;
    border-radius: 12px;
    padding: 20px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
    display: flex;
    align-items: center;
    gap: 16px;
  }
  
  .stat-icon {
    width: 48px;
    height: 48px;
    border-radius: 12px;
    background-color: #eef3ff;
    color: var(--primary-color);
    display: flex;
    align-items: center;
    justify-content: center;
  }
  
  .stat-content {
    flex: 1;
  }
  
  .stat-content h3 {
    font-size: 14px;
    font-weight: 500;
    color: #666;
    margin-bottom: 4px;
  }
  
  .stat-value {
    font-size: 24px;
    font-weight: 700;
    color: #333;
    margin-bottom: 4px;
  }
  
  .stat-change {
    display: flex;
    align-items: center;
    gap: 4px;
    font-size: 12px;
  }
  
  .stat-change.increase {
    color: #4caf50;
  }
  
  .stat-change.decrease {
    color: #f44336;
  }
  
  .dashboard-row {
    display: grid;
    grid-template-columns: 2fr 1fr;
    gap: 24px;
  }
  
  @media (max-width: 768px) {
    .dashboard-row {
      grid-template-columns: 1fr;
    }
  }
  
  .section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;
  }
  
  .section-header h2 {
    font-size: 18px;
    font-weight: 600;
    color: #333;
  }
  
  .view-all {
    display: flex;
    align-items: center;
    gap: 4px;
    color: var(--primary-color);
    text-decoration: none;
    font-size: 14px;
    font-weight: 500;
  }
  
  .recent-reports, .quick-actions {
    background-color: white;
    border-radius: 12px;
    padding: 20px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
  }
  
  .reports-list {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }
  
  .report-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 12px;
    border-radius: 8px;
    background-color: #f8f9fa;
    transition: background-color 0.2s;
  }
  
  .report-item:hover {
    background-color: #f0f0f0;
  }
  
  .report-type {
    display: flex;
    align-items: center;
    gap: 8px;
    font-weight: 500;
    min-width: 120px;
  }
  
  .report-type.low {
    color: #4caf50;
  }
  
  .report-type.medium {
    color: #ff9800;
  }
  
  .report-type.high {
    color: #f44336;
  }
  
  .report-details {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 4px;
  }
  
  .report-location, .report-time {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 12px;
    color: #666;
  }
  
  .report-actions {
    display: flex;
    gap: 8px;
  }
  
  .action-btn {
    display: flex;
    align-items: center;
    gap: 4px;
    padding: 6px 12px;
    border-radius: 4px;
    background-color: #eef3ff;
    color: var(--primary-color);
    border: none;
    font-size: 12px;
    cursor: pointer;
    transition: background-color 0.2s;
  }
  
  .action-btn:hover {
    background-color: #dce6ff;
  }
  
  .actions-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 12px;
    margin-bottom: 16px;
  }
  
  .action-card {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 8px;
    padding: 16px;
    background-color: #f8f9fa;
    border-radius: 8px;
    text-decoration: none;
    color: #333;
    transition: all 0.2s;
  }
  
  .action-card:hover {
    background-color: #eef3ff;
    color: var(--primary-color);
    transform: translateY(-2px);
  }
  
  .emergency-card {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 16px;
    background-color: #fff0f0;
    border-radius: 8px;
    color: var(--danger-color);
  }
  
  .emergency-card h3 {
    font-size: 16px;
    font-weight: 600;
    margin-bottom: 4px;
  }
  
  .emergency-card p {
    font-size: 12px;
    color: #666;
  }
  
  .emergency-btn {
    margin-left: auto;
    padding: 8px 16px;
    background-color: var(--danger-color);
    color: white;
    border-radius: 4px;
    text-decoration: none;
    font-weight: 500;
    font-size: 14px;
    transition: background-color 0.2s;
  }
  
  .emergency-btn:hover {
    background-color: #d32f2f;
  }
  </style>