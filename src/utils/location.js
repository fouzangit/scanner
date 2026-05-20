/**
 * Geolocation utility for validating employee location
 */

export const getCurrentLocation = () => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation is not supported by your browser.'));
      return;
    }

    // Try high accuracy first (5-second timeout)
    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude
        });
      },
      (error) => {
        console.warn("High accuracy GPS failed, attempting low accuracy fallback:", error.message);
        // Fallback to low accuracy (5-second timeout)
        navigator.geolocation.getCurrentPosition(
          (fallbackPosition) => {
            resolve({
              latitude: fallbackPosition.coords.latitude,
              longitude: fallbackPosition.coords.longitude
            });
          },
          (fallbackError) => {
            reject(new Error(`Location error: ${fallbackError.message} (Fallback failed: ${error.message})`));
          },
          { enableHighAccuracy: false, timeout: 5000, maximumAge: 60000 }
        );
      },
      { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
    );
  });
};

/**
 * Calculates distance between two points in meters using Haversine formula
 */
export const getDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371e3; // Earth radius in meters
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  const a = 
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) *
    Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c; // in meters
};

/**
 * Validates if the user is within the allowed radius
 */
export const validateLocation = async (officeLat, officeLon, allowedRadius) => {
  try {
    const userLoc = await getCurrentLocation();
    const distance = getDistance(
      userLoc.latitude, 
      userLoc.longitude, 
      officeLat, 
      officeLon
    );
    
    return {
      isValid: distance <= allowedRadius,
      distance: Math.round(distance),
      coords: userLoc
    };
  } catch (error) {
    throw error;
  }
};
