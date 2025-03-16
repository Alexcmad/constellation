import axios from 'axios';

export const submitCrimeReport = async (reportData) => {
  try {
    console.log('Submitting report data:', reportData); // Log the report data

    // Submit the report data
    const response = await axios({
      method: 'POST',
      url: 'http://174.129.97.137/reports/', // Replace with your actual API endpoint
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token') || ''}`,
      },
      data: reportData,
    });

    console.log('API Response:', response.data); // Log the API response

    // Handle success
    return response.data; // Return the response data (e.g., report ID)
  } catch (error) {
    // Log the full error for debugging
    console.error('Error submitting report:', error);

    // Handle different types of errors
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      console.error('Error response data:', error.response.data);
      console.error('Error status:', error.response.status);
      console.error('Error headers:', error.response.headers);

      // Log the validation errors (if any)
      if (error.response.data?.detail) {
        console.error('Validation errors:', error.response.data.detail);
      }

      // Throw a more specific error message
      throw new Error(error.response.data?.detail?.[0]?.msg || 'Failed to submit report');
    } else if (error.request) {
      // The request was made but no response was received
      console.error('No response received:', error.request);
      throw new Error('No response received from the server. Please check your network connection.');
    } else {
      // Something happened in setting up the request that triggered an error
      console.error('Request setup error:', error.message);
      throw new Error('Failed to set up the request. Please try again.');
    }
  }
};

export const getCrimeReports = async () => {
  try {
    const response = await axios({
      method: 'GET',
      url: 'http://174.129.97.137/reports/',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token') || ''}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error('Get reports error:', error);
    throw new Error(error.response?.data?.message || 'Failed to fetch reports');
  }
};

export const getNearbyAlerts = async (latitude, longitude) => {
  try {
    const response = await axios({
      method: 'GET',
      url: `http://174.129.97.137/reports`,
      params: {
        lat: latitude,
        lng: longitude,
      },
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error('Get nearby alerts error:', error);
    throw new Error(error.response?.data?.message || 'Failed to fetch nearby alerts');
  }
};

// Calculate distance between two coordinates in km
export const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Radius of the earth in km
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const d = R * c; // Distance in km
  return d;
};

const deg2rad = (deg) => {
  return deg * (Math.PI / 180);
};