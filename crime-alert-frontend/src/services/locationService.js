// Keep API key in an environment variable or configuration file
const apiKey = "AIzaSyD8aepW-FrtXxQB64FKXS2JKp9QabST0dY";

export const getCurrentLocation = () => {
  return new Promise((resolve, reject) => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          });
        },
        (error) => {
          console.error('Error getting location:', error);
          // Fallback to Kingston, Jamaica coordinates
          resolve({
            latitude: 18.7128,
            longitude: 77.0060
          });
        },
        { timeout: 10000, enableHighAccuracy: true }
      );
    } else {
      console.error('Geolocation is not supported by this browser');
      // Fallback to Kingston, Jamaica coordinates
      resolve({
        latitude: 18.7128,
        longitude: 77.0060
      });
    }
  });
};

export const getLocationName = async (latitude, longitude) => {
  try {
    // Add error handling for empty coordinates
    if (!latitude || !longitude) {
      console.error('Invalid coordinates provided');
      return 'Unknown Location';
    }
    
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${apiKey}`
    );
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('Geocoding API error:', errorData);
      throw new Error('Failed to fetch location data');
    }
    
    const data = await response.json();
    
    if (data.status !== 'OK' || !data.results || data.results.length === 0) {
      console.error('No results found in geocoding response:', data);
      throw new Error('No location found');
    }
    
    // Extract city and state from the address components
    const addressComponents = data.results[0].address_components || [];
    let city = '';
    let state = '';
    
    for (const component of addressComponents) {
      if (component.types && component.types.includes('locality')) {
        city = component.long_name;
      } else if (component.types && component.types.includes('administrative_area_level_1')) {
        state = component.short_name;
      }
    }
    
    return city && state ? `${city}, ${state}` : (data.results[0].formatted_address || 'Unknown Location');
  } catch (error) {
    console.error('Error getting location name:', error);
    return 'Unknown Location';
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