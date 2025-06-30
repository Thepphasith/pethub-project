import axiosInstance from "../";

/**
 * Service to handle favorite functionality for pets
 */
const favoritesService = {
  /**
   * Toggle favorite status for a pet
   * @param {string} petId - The pet ID to toggle favorite status
   * @returns {Promise<Object>} - Response from the API
   */
  async togglePetFavorite(petId) {
    try {
      // First check if pet is already a favorite
      const checkResponse = await axiosInstance.get(`/api/favorites/check/${petId}`);
      const isFavorite = checkResponse.data?.isFavorite || false;
      
      // Toggle favorite status based on current state
      if (isFavorite) {
        // Remove from favorites
        return await axiosInstance.delete(`/api/favorites/${petId}`);
      } else {
        // Add to favorites
        return await axiosInstance.post(`/api/favorites`, { petId });
      }
    } catch (error) {
      console.error("Error toggling pet favorite:", error);
      throw error;
    }
  },
  
  /**
   * Check if a pet is in favorites
   * @param {string} petId - The pet ID to check
   * @returns {Promise<boolean>} - Whether the pet is in favorites
   */
  async isPetFavorite(petId) {
    try {
      const response = await axiosInstance.get(`/api/favorites/check/${petId}`);
      return response.data?.isFavorite || false;
    } catch (error) {
      console.error("Error checking favorite status:", error);
      return false;
    }
  },
  
  /**
   * Get all favorite pets for the current user
   * @returns {Promise<Array>} - Array of favorite pets
   */
  async getFavoritePets() {
    try {
      const response = await axiosInstance.get('/api/favorites');
      return response.data || [];
    } catch (error) {
      console.error("Error fetching favorite pets:", error);
      return [];
    }
  }
};

export default favoritesService;