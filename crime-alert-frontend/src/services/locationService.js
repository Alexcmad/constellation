// Mock location data for demonstration
const Locations = {
    
  };
  
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
            // Fallback to a default location 
            resolve({
              latitude: 18.000,
              longitude: 77.0040
            });
          },
          { timeout: 10000, enableHighAccuracy: true }
        );
      } else {
        console.error('Geolocation is not supported by this browser');
        // Fallback to a default location
        resolve({
          latitude: 40.7128,
          longitude: -74.0060
        });
      }
    });
  };
  
  export const getLocationName = async (latitude, longitude) => {
    try {
      const apiKey = "AIzaSyD8aepW-FrtXxQB64FKXS2JKp9QabST0dY"; // Replace with your actual API key
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${apiKey}`
      );
      const data = await response.json();
  
      if (data.status === "OK" && data.results.length > 0) {
        return data.results[0].formatted_address; // ✅ Returns the real location name
      } else {
        console.error("Geocoding API error:", data.status);
        return "Unknown Location";
      }
    } catch (error) {
      console.error("Error fetching location:", error);
      return "Unknown Location";
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