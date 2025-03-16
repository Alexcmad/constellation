import axios from 'axios';

export const submitCrimeReport = async (reportData) => {
  try {
    const response = await axios({
      method: 'POST',
      url: 'http://174.129.97.137/report',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token') || ''}`
      },
      data: reportData
    });
    
    return response.data;
  } catch (error) {
    console.error('Submit report error:', error);
    throw new Error(error.response?.data?.message || 'Failed to submit report');
  }
};

export const getCrimeReports = async () => {
  try {
    const response = await axios({
      method: 'GET',
      url: 'http://174.129.97.137/reports/',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token') || ''}`
      }
    });
    console.log(response.data);
    return response.data;

  } catch (error) {
    console.error('Get reports error:', error);
    throw new Error(error.response?.data?.message);
  }
};

export const getNearbyAlerts = async (latitude, longitude) => {
  try {
    const response = await axios({
      method: 'GET',
      url: `http://174.129.97.137/reports`,
      params: {
        lat: latitude,
        lng: longitude
      },
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });
    
    return response.data;
  } catch (error) {
    console.error('Get nearby alerts error:', error);
    throw new Error(error.response?.data?.message || 'Failed to fetch nearby alerts');
  }
};
  
  // Calculate distance between two coordinates in km
  function calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Radius of the earth in km
    const dLat = deg2rad(lat2 - lat1);
    const dLon = deg2rad(lon2 - lon1);
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * 
      Math.sin(dLon/2) * Math.sin(dLon/2); 
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
    const d = R * c; // Distance in km
    return d;
  }
  
  function deg2rad(deg) {
    return deg * (Math.PI/180);
  }