// Mock crime report data for demonstration
const mockReports = [
    {
      id: 1,
      crimeType: 'theft',
      description: 'Witnessed someone stealing a bicycle outside the mall. The suspect was wearing a black hoodie and jeans.',
      severityLevel: 'medium',
      location: {
        latitude: 40.7128,
        longitude: -74.0060,
        address: '123 Broadway, New York, NY'
      },
      timestamp: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
      reporter: {
        name: 'John Doe',
        email: 'john@example.com',
        phone: '555-123-4567'
      },
      photos: [
        '/placeholder.svg?height=300&width=400',
        '/placeholder.svg?height=300&width=400'
      ]
    },
    {
      id: 2,
      crimeType: 'vandalism',
      description: 'Graffiti on the wall of the public library. Tags appear to be gang-related.',
      severityLevel: 'low',
      location: {
        latitude: 40.7138,
        longitude: -74.0070,
        address: '456 Park Ave, New York, NY'
      },
      timestamp: new Date(Date.now() - 7200000).toISOString(), // 2 hours ago
      reporter: {
        name: 'Jane Smith',
        email: 'jane@example.com',
        phone: '555-987-6543'
      },
      photos: [
        '/placeholder.svg?height=300&width=400'
      ]
    },
    {
      id: 3,
      crimeType: 'suspicious_activity',
      description: 'Group of individuals loitering around the ATM for over an hour, appearing to watch people withdraw money.',
      severityLevel: 'high',
      location: {
        latitude: 40.7148,
        longitude: -74.0080,
        address: '789 Main St, New York, NY'
      },
      timestamp: new Date(Date.now() - 10800000).toISOString(), // 3 hours ago
      reporter: {
        name: 'Robert Johnson',
        email: 'robert@example.com',
        phone: '555-456-7890'
      },
      photos: []
    },
    {
      id: 4,
      crimeType: 'assault',
      description: 'Physical altercation between two individuals outside the nightclub. One person appeared to be injured.',
      severityLevel: 'high',
      location: {
        latitude: 40.7158,
        longitude: -74.0090,
        address: '101 Club Ave, New York, NY'
      },
      timestamp: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
      reporter: {
        name: 'Sarah Williams',
        email: 'sarah@example.com',
        phone: '555-234-5678'
      },
      photos: [
        '/placeholder.svg?height=300&width=400',
        '/placeholder.svg?height=300&width=400',
        '/placeholder.svg?height=300&width=400'
      ]
    },
    {
      id: 5,
      crimeType: 'burglary',
      description: 'Home broken into while residents were away. Electronics and jewelry were stolen.',
      severityLevel: 'medium',
      location: {
        latitude: 40.7168,
        longitude: -74.0100,
        address: '222 Residential St, New York, NY'
      },
      timestamp: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
      reporter: {
        name: 'Michael Brown',
        email: 'michael@example.com',
        phone: '555-345-6789'
      },
      photos: [
        '/placeholder.svg?height=300&width=400',
        '/placeholder.svg?height=300&width=400'
      ]
    }
  ];
  
  // Generate more mock reports for hotspots
  for (let i = 0; i < 15; i++) {
    mockReports.push({
      id: 6 + i,
      crimeType: ['theft', 'vandalism', 'suspicious_activity', 'assault', 'burglary'][Math.floor(Math.random() * 5)],
      description: 'Additional crime report for hotspot demonstration.',
      severityLevel: ['low', 'medium', 'high'][Math.floor(Math.random() * 3)],
      location: {
        latitude: 40.7128 + (Math.random() * 0.01 - 0.005),
        longitude: -74.0060 + (Math.random() * 0.01 - 0.005),
        address: `${100 + i} Hotspot St, New York, NY`
      },
      timestamp: new Date(Date.now() - Math.random() * 604800000).toISOString(), // Random time within last week
      reporter: {
        name: `Reporter ${i}`,
        email: `reporter${i}@example.com`,
        phone: `555-${100 + i}-${200 + i}`
      },
      photos: []
    });
  }
  
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