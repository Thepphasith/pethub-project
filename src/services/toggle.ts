import axiosInstance from "../configs/axios";

export const toggleFavoritePet = async (
    petId: string,
    currentFavoriteStatus: boolean
  ): Promise<boolean> => {
    try {
      const response = await axiosInstance.post('/favorite', { itemId: petId });
      
      return response.data.isFavorite ?? !currentFavoriteStatus;
    } catch (error) {
      console.error('Error toggling favorite status:', error);
      
      return currentFavoriteStatus;
    }
  };