// Mock crime report data for demonstration
const Reports = [
    
  ];
  
  
  
  export const submitCrimeReport = async (reportData) => {
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // In a real app, this would send the data to the server
      console.log('Submitting report:', reportData);
      
      // Generate a random report ID
      const reportId = `REP-${Date.now().toString().slice(-6)}`;
      
      return { success: true, reportId };
    } catch (error) {
      throw new Error('Failed to submit report');
    }
  };
  
  export const getCrimeReports = async () => {
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1200));
      
      return mockReports;
    } catch (error) {
      throw new Error('Failed to fetch crime reports');
    }
  };
  
  export const getNearbyAlerts = async (latitude, longitude) => {
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Calculate distance for each report
      const reportsWithDistance = mockReports.map(report => {
        const distance = calculateDistance(
          latitude, longitude,
          report.location.latitude, report.location.longitude
        );
        
        return {
          ...report,
          distance
        };
      });
      
      // Sort by distance
      return reportsWithDistance.sort((a, b) => a.distance - b.distance);
    } catch (error) {
      throw new Error('Failed to fetch nearby alerts');
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