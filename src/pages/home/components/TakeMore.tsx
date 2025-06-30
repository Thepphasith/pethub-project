import {
  Box,
  Button,
  Container,
  Grid,
  Typography,
  CircularProgress,
  Snackbar,
  Alert,
  useTheme,
  useMediaQuery,
  Fade,
} from "@mui/material";
import { useState, useEffect } from "react";
import CustomCard from "../../cardCustom/CustomCard";
import axiosInstance from "../../../configs/axios";
import { PetModel } from "../../../models/pet";
import PetsIcon from "@mui/icons-material/Pets";

// Interface for favorite data structure
interface FavoriteData {
  id: string;
  userId: string;
  itemId: string[];
  createdAt: string;
  updatedAt: string;
  items: PetModel[];
}

interface FavoriteResponse {
  message: string;
  status: number;
  data: FavoriteData[];
}

const PetShowcasePage: React.FC = () => {
  const theme = useTheme();
  const [pets, setPets] = useState<PetModel[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [favoriteIds, setFavoriteIds] = useState<string[]>([]);
  const [notification, setNotification] = useState<{
    open: boolean;
    message: string;
    type: "success" | "error";
  }>({
    open: false,
    message: "",
    type: "success",
  });

  // Fetch pets data from API
  const handleGetAllData = async () => {
    try {
      setLoading(true);
      const res = await axiosInstance.get("/pets/all");
      // Sort pets by creation date (newest first) and take only the first 4
      const sortedPets = [...(res.data?.data || [])]
        .sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        )
        .slice(0, 6); // Show 6 pets instead of 4 for better grid layout

      setPets(sortedPets);
    } catch (error) {
      console.error("Error fetching pet data:", error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch favorites from API
  const fetchFavorites = async () => {
    try {
      const response = await axiosInstance.get<FavoriteResponse>("/favorite");
      
      // Check if we have favorites data
      if (response.data.data && response.data.data.length > 0) {
        const favoriteData = response.data.data[0];
        // Store the document ID for later use in updates
        setFavoriteDocId(favoriteData.id);
        // Store the array of favorited pet IDs
        setFavoriteIds(favoriteData.itemId || []);
      } else {
        setFavoriteIds([]);
      }
    } catch (error) {
      console.error("Error fetching favorites:", error);
      setFavoriteIds([]);
    }
  };

  useEffect(() => {
    handleGetAllData();
    fetchFavorites();
  }, []);

  // Helper function to format age from yearAge and monthAge
  const formatAge = (yearAge: number, monthAge: number) => {
    if (yearAge > 0) {
      return `${yearAge} ${yearAge === 1 ? "year" : "years"}`;
    } else {
      return `${monthAge} months`;
    }
  };

  const handleFavoriteToggle = async (petId: string) => {
    try {
      // Set loading state for this specific pet
      setIsLoading((prev) => ({ ...prev, [petId]: true }));

      // Check if this pet is already in favorites
      const isFavorited = favoriteIds.includes(petId);

      if (isFavorited) {
        // If already favorited, remove from favorites
        const response = await axiosInstance.delete("/favorite/delete", {
          data: { itemId: petId }
        });
        
        if (response.data.success) {
          // Update local state by removing this pet from favorites
          setFavoriteIds(prev => prev.filter(id => id !== petId));
          
          setNotification({
            open: true,
            message: "Removed from favorites",
            type: "success"
          });
        }
      } else {
        // If not favorited, add to favorites
        const response = await axiosInstance.post("/favorite", { itemId: petId });
        
        if (response.data.success) {
          // Update local state by adding this pet to favorites
          setFavoriteIds(prev => [...prev, petId]);
          
          setNotification({
            open: true,
            message: "Added to favorites",
            type: "success"
          });
        }
      }

      fetchFavorites();
    } catch (error) {
      console.error("Error toggling favorite status:", error);
      setNotification({
        open: true,
        message: "Error updating favorites. Please try again.",
        type: "error"
      });
      
      // Refresh favorites from server to ensure UI is in sync
      fetchFavorites();
    } finally {
      // Clear loading state
      setIsLoading((prev) => ({ ...prev, [petId]: false }));
    }
  };

  const handleCloseNotification = () => {
    setNotification({ ...notification, open: false });
  };

  return (
    <Container maxWidth="lg" sx={{ py: 6 }}>
      {/* Section Header with decorative elements */}
      <Box 
        sx={{ 
          position: 'relative', 
          mb: 6, 
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center'
        }}
      >
        <Box 
          sx={{ 
            width: '80px', 
            height: '4px', 
            bgcolor: '#9990DA', 
            mb: 2 
          }} 
        />
        <Typography
          variant="h3"
          component="h2"
          align="center"
          fontWeight="700"
          sx={{ mb: 1 }}
        >
          ສັດລ້ຽງຂອງພວກເຮົາ 
        </Typography>
        <Typography
          variant="subtitle1"
          align="center"
          color="text.secondary"
          sx={{ mb: 2, maxWidth: '600px' }}
        >
          ສັດທີ່ໜ້າຮັກເຫຼົ່ານີ້ແຕ່ລະໂຕກຳລັງຊອກຫາເຮືອນຖາວອນຂອງພວກເຂົາ. ໂຕໃດໂຕໜຶ່ງໃນນັ້ນອາດເປັນເພື່ອນທີ່ດີທີ່ສຸດຄົນໃໝ່ຂອງເຈົ້າບໍ່?
        </Typography>
        <PetsIcon sx={{ color: '#9990DA', fontSize: 28, mb: 2 }} />
      </Box>

      {/* Pet Cards Grid */}
      {loading ? (
        <Box display="flex" justifyContent="center" my={8}>
          <CircularProgress sx={{ color: '#9990DA' }} />
        </Box>
      ) : (
        <Fade in={!loading} timeout={800}>
          <Box sx={{ px: { xs: 0, sm: 2, md: 4 } }}>
            <Grid container spacing={{ xs: 3, sm: 4 }} justifyContent="center">
              {pets.map((pet, index) => (
                <Grid
                  item
                  xs={12}
                  sm={6}
                  md={4}
                  key={pet.id}
                  sx={{
                    display: "flex",
                    justifyContent: "center",
                    transform: `translateY(${index % 2 === 0 ? '0' : '20px'})`,
                    transition: 'transform 0.5s ease-in-out',
                  }}
                >
                  <CustomCard
                    petData={{
                      id: pet.id,
                      name: pet.petName,
                      image: pet.images[0] || "/path/to/placeholder.jpg",
                      location: {
                        city: "Local Area",
                        state: "USA",
                      },
                      gender: pet.gender,
                      breed: pet.breed?.breedName || pet.breedId,
                      age: formatAge(pet.yearAge, pet.monthAge),
                      size: pet.size,
                      description: pet.bio || "No description available",
                      isPremium: false,
                      isFavorite: favoriteIds.includes(pet.id),
                    }}
                    onFavoriteToggle={() => handleFavoriteToggle(pet.id)}
                  />
                </Grid>
              ))}

              {pets.length === 0 && !loading && (
                <Grid item xs={12}>
                  <Box 
                    sx={{ 
                      p: 6, 
                      textAlign: 'center',
                      border: '1px dashed #9990DA',
                      borderRadius: 2,
                      bgcolor: 'rgba(153, 144, 218, 0.05)'
                    }}
                  >
                    <PetsIcon sx={{ fontSize: 48, color: '#9990DA', opacity: 0.7, mb: 2 }} />
                    <Typography variant="h6" color="text.secondary" gutterBottom>
                     ປະຈຸບັນນີ້ຍັງບໍ່ມີສັດລ້ຽງໃດໆພ້ອມໃຫ້ຮັບລ້ຽງ
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      ກະລຸນາກັບມາເບິ່ງໃໝ່ໃນພາຍຫຼັງ ເພື່ອພົບກັບເພື່ອນທີ່ມີຂົນໜ້າຮັກໂຕໃໝ່ທີ່ກຳລັງຊອກຫາບ້ານ.
                    </Typography>
                  </Box>
                </Grid>
              )}
            </Grid>
          </Box>
        </Fade>
      )}

      {/* See More Button */}
      {pets.length > 0 && (
        <Box display="flex" justifyContent="center" mt={8}>
          <Button
            variant="contained"
            href="/pet"
            sx={{
              textTransform: "none",
              px: 6,
              py: 1.5,
              fontSize: '1rem',
              fontWeight: 600,
              color: "white",
              bgcolor: "#9990DA",
              borderRadius: 6,
              boxShadow: '0 8px 16px rgba(153, 144, 218, 0.2)',
              "&:hover": {
                bgcolor: "#8076C8",
                transform: 'translateY(-2px)',
                boxShadow: '0 10px 20px rgba(153, 144, 218, 0.3)',
                transition: 'all 0.3s ease'
              },
            }}
          >
           ເບິ່ງສັດລ້ຽງທັງໝົດ
          </Button>
        </Box>
      )}

      {/* Notification for favorite actions */}
      <Snackbar 
        open={notification.open} 
        autoHideDuration={3000} 
        onClose={handleCloseNotification}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={handleCloseNotification} 
          severity={notification.type} 
          sx={{ 
            width: '100%',
            borderRadius: 2,
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
          }}
        >
          {notification.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default PetShowcasePage;