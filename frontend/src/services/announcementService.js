/**
 * Announcement API Service
 * Handles all API calls related to announcements with proper authentication
 */

const API_BASE_URL = '/api';

// Helper function to get auth token
const getAuthToken = () => {
  return localStorage.getItem('authToken');
};

// Helper function to make authenticated requests
const makeRequest = async (url, options = {}) => {
  const token = getAuthToken();
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token && token !== 'demo-token') {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (!response.ok) {
    if (response.status === 401) {
      // Keep browsing available without forcing a hard redirect for public reads.
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Unauthorized');
    }
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `HTTP ${response.status}`);
  }

  return response.json();
};

/**
 * Fetch all announcements with optional filters
 * @param {number} page - Page number (default: 1)
 * @param {number} limit - Items per page (default: 10)
 * @param {string} type - Filter by type (important|event|course|system)
 * @param {string} sort - Sort order (newest|oldest|pinned)
 * @returns {Promise<Object>} Announcements data with pagination
 */
export const fetchAnnouncements = async (page = 1, limit = 10, type = null, sort = 'newest') => {
  try {
    const params = new URLSearchParams();
    params.append('page', page);
    params.append('limit', limit);
    if (type) params.append('type', type);
    params.append('sort', sort);

    const response = await makeRequest(`${API_BASE_URL}/announcements?${params}`);
    return response;
  } catch (error) {
    console.error('Error fetching announcements:', error);
    throw error;
  }
};

/**
 * Fetch single announcement details
 * @param {string} id - Announcement ID
 * @returns {Promise<Object>} Announcement data
 */
export const fetchAnnouncementById = async (id) => {
  try {
    const response = await makeRequest(`${API_BASE_URL}/announcements/${id}`);
    return response;
  } catch (error) {
    console.error('Error fetching announcement:', error);
    throw error;
  }
};

/**
 * Create new announcement (Admin/Trainer only)
 * @param {Object} announcementData - Announcement data
 * @returns {Promise<Object>} Created announcement
 */
export const createAnnouncement = async (announcementData) => {
  try {
    const response = await makeRequest(`${API_BASE_URL}/announcements`, {
      method: 'POST',
      body: JSON.stringify(announcementData),
    });
    return response;
  } catch (error) {
    console.error('Error creating announcement:', error);
    throw error;
  }
};

/**
 * Update announcement (Admin/Trainer only)
 * @param {string} id - Announcement ID
 * @param {Object} announcementData - Updated announcement data
 * @returns {Promise<Object>} Updated announcement
 */
export const updateAnnouncement = async (id, announcementData) => {
  try {
    const response = await makeRequest(`${API_BASE_URL}/announcements/${id}`, {
      method: 'PUT',
      body: JSON.stringify(announcementData),
    });
    return response;
  } catch (error) {
    console.error('Error updating announcement:', error);
    throw error;
  }
};

/**
 * Delete announcement (Admin/Trainer only)
 * @param {string} id - Announcement ID
 * @returns {Promise<Object>} Delete response
 */
export const deleteAnnouncement = async (id) => {
  try {
    const response = await makeRequest(`${API_BASE_URL}/announcements/${id}`, {
      method: 'DELETE',
    });
    return response;
  } catch (error) {
    console.error('Error deleting announcement:', error);
    throw error;
  }
};

/**
 * Toggle pin status for announcement
 * @param {string} id - Announcement ID
 * @param {boolean} pinned - Pin status
 * @returns {Promise<Object>} Updated announcement
 */
export const toggleAnnouncementPin = async (id, pinned) => {
  try {
    const response = await makeRequest(`${API_BASE_URL}/announcements/${id}/pin`, {
      method: 'PATCH',
      body: JSON.stringify({ pinned }),
    });
    return response;
  } catch (error) {
    console.error('Error toggling pin:', error);
    throw error;
  }
};

/**
 * Get announcement read statistics (Admin only)
 * @param {string} id - Announcement ID
 * @returns {Promise<Object>} Stats data
 */
export const getAnnouncementStats = async (id) => {
  try {
    const response = await makeRequest(`${API_BASE_URL}/announcements/${id}/stats`);
    return response;
  } catch (error) {
    console.error('Error fetching announcement stats:', error);
    throw error;
  }
};

export default {
  fetchAnnouncements,
  fetchAnnouncementById,
  createAnnouncement,
  updateAnnouncement,
  deleteAnnouncement,
  toggleAnnouncementPin,
  getAnnouncementStats,
};
