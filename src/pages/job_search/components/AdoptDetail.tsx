import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  Box,
  Card,
  Typography,
  Grid,
  Button,
  Container,
  IconButton,
  CircularProgress,
  Chip,
  Paper,
  Skeleton,
  Tooltip,
  Snackbar,
  Alert
} from "@mui/material";

// Icons
import ArrowForwardIosRoundedIcon from "@mui/icons-material/ArrowForwardIosRounded";
import ArrowBackIosRoundedIcon from "@mui/icons-material/ArrowBackIosRounded";
import MaleRoundedIcon from "@mui/icons-material/MaleRounded";
import FemaleRoundedIcon from "@mui/icons-material/FemaleRounded";
import HelpOutlineRoundedIcon from "@mui/icons-material/HelpOutlineRounded";
import PetsRoundedIcon from "@mui/icons-material/PetsRounded";
import AttachMoneyRoundedIcon from "@mui/icons-material/AttachMoneyRounded";
import FavoriteRoundedIcon from "@mui/icons-material/FavoriteRounded";
import FavoriteBorderRoundedIcon from "@mui/icons-material/FavoriteBorderRounded";
import WarningAmberRoundedIcon from "@mui/icons-material/WarningAmberRounded";
import CakeRoundedIcon from "@mui/icons-material/CakeRounded";
import ColorLensRoundedIcon from "@mui/icons-material/ColorLensRounded";
import ScaleRoundedIcon from "@mui/icons-material/ScaleRounded";
import HeightRoundedIcon from "@mui/icons-material/HeightRounded";
import InfoRoundedIcon from "@mui/icons-material/InfoRounded";

import DetailController from "../controllers/pages/detail";
import { Gender } from "../../../enums/gender";
import { Breed } from "../../../models/pet";
import { useNavigate, useParams } from "react-router-dom";
import axiosInstance from "../../../configs/axios";

// Interfaces
interface SimilarPetCardProps {
  pet: {
    id: string;
    petName: string;
    gender: string;
    breedId: string;
    images: string[];
    price?: number;
    breed?: Breed;
  };
  breedName?: string;
}

// Interface for favorite data structure
interface FavoriteData {
  id: string;
  userId: string;
  itemId: string[];
  createdAt: string;
  updatedAt: string;
}

interface FavoriteResponse {
  message: string;
  status: number;
  data: FavoriteData[];
}

// Enhanced SimilarPetCard Component
const SimilarPetCard: React.FC<SimilarPetCardProps> = ({ pet }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  // Get gender icon and color
  const GenderIcon = pet.gender === Gender.MALE ? MaleRoundedIcon : FemaleRoundedIcon;
  const genderColor = pet.gender === Gender.MALE ? '#2196f3' : '#e91e63';

  return (
    <Card
      elevation={0}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      sx={{
        borderRadius: 3,
        overflow: "hidden",
        transition: "all 0.3s ease",
        transform: isHovered ? "translateY(-8px)" : "translateY(0)",
        boxShadow: isHovered
          ? "0 12px 20px rgba(0,0,0,0.1)"
          : "0 4px 12px rgba(0,0,0,0.05)",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        border: "1px solid rgba(0,0,0,0.05)",
        position: "relative",
      }}
    >
      {/* Image Container */}
      <Box sx={{ position: "relative", pt: "100%", overflow: "hidden" }}>
        {!imageLoaded && (
          <Skeleton
            variant="rectangular"
            animation="wave"
            sx={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%"
            }}
          />
        )}
        <Box
          component="img"
          src={pet.images[0] || "/api/placeholder/250/250"}
          alt={pet.petName}
          onLoad={() => setImageLoaded(true)}
          sx={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
            transition: "transform 0.5s ease",
            transform: isHovered ? "scale(1.1)" : "scale(1)",
            display: imageLoaded ? "block" : "none",
          }}
        />

        {/* Gender badge */}
        <Chip
          icon={<GenderIcon style={{ color: "white" }} />}
          label={pet.gender === Gender.MALE ? "MALE" : "FEMALE"}
          size="small"
          sx={{
            position: "absolute",
            top: 12,
            right: 12,
            backgroundColor: genderColor,
            color: "white",
            fontWeight: 600,
            fontSize: "0.7rem",
            height: 24,
            "& .MuiChip-icon": {
              fontSize: 16,
              marginLeft: 0.5,
            }
          }}
        />
      </Box>

      {/* Content */}
      <Box sx={{ p: 2, flexGrow: 1, display: "flex", flexDirection: "column" }}>
        <Typography
          variant="h6"
          sx={{
            fontSize: "1rem",
            fontWeight: 700,
            mb: 0.5,
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap"
          }}
        >
          {pet.petName}
        </Typography>

        <Typography
          variant="body2"
          color="text.secondary"
          sx={{
            mb: 0.5,
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap"
          }}
        >
          {pet.breed?.breedName || "ພັນບໍ່ຮູ້ຈັກ"}
        </Typography>

        {/* Price tag */}
        {pet.price && (
          <Typography
            variant="body1"
            sx={{
              color: "#9990DA",
              fontWeight: 700,
              mb: 1.5,
              mt: 0.5
            }}
          >
            ${pet.price.toFixed(2)}
          </Typography>
        )}

        <Box sx={{ mt: "auto" }}>
          <Button
            variant="outlined"
            fullWidth
            href={`/adopt-detail/${pet.id}`}
            sx={{
              mt: 1,
              borderRadius: 6,
              textTransform: "none",
              borderColor: "#9990DA",
              color: "#9990DA",
              fontWeight: 600,
              "&:hover": {
                borderColor: "#8278c7",
                backgroundColor: "rgba(153, 144, 218, 0.08)"
              }
            }}
          >
            ເບິ່ງລາຍລະອຽດ
          </Button>
        </Box>
      </Box>
    </Card>
  );
};

// Property item component for pet characteristics
const PropertyItem: React.FC<{
  icon: React.ReactNode,
  label: string,
  value: React.ReactNode
}> = ({ icon, label, value }) => (
  <Box
    sx={{
      display: "flex",
      alignItems: "center",
      p: 1.5,
      borderRadius: 2,
      backgroundColor: "rgba(153, 144, 218, 0.08)",
      mb: 2
    }}
  >
    <Box
      sx={{
        mr: 1.5,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        width: 40,
        height: 40,
        borderRadius: "50%",
        backgroundColor: "rgba(153, 144, 218, 0.15)",
        color: "#9990DA"
      }}
    >
      {icon}
    </Box>
    <Box>
      <Typography variant="caption" color="text.secondary" fontWeight={500}>
        {label}
      </Typography>
      <Typography variant="body1" fontWeight={600}>
        {value}
      </Typography>
    </Box>
  </Box>
);

// Enhanced Image Gallery component
const ImageGallery: React.FC<{
  images: string[],
  currentImageIndex: number,
  onPrevImage: () => void,
  onNextImage: () => void,
  onSelectImage: (index: number) => void
}> = ({
  images,
  currentImageIndex,
  onPrevImage,
  onNextImage,
  onSelectImage
}) => {
  const [mainImageLoaded, setMainImageLoaded] = useState(false);
  const [thumbnailsLoaded, setThumbnailsLoaded] = useState<boolean[]>(new Array(images.length).fill(false));

  const handleThumbnailLoad = (index: number) => {
    setThumbnailsLoaded(prev => {
      const newState = [...prev];
      newState[index] = true;
      return newState;
    });
  };

  const handleImageSelect = (index: number) => {
    onSelectImage(index);
    setMainImageLoaded(false); // Trigger loading state for smooth transition
  };

  return (
    <Box sx={{ position: "relative" }}>
      {/* Main Image Container */}
      <Box 
        sx={{ 
          position: "relative", 
          borderRadius: 3, 
          overflow: "hidden",
          backgroundColor: "#f8f9fa",
          boxShadow: "0 4px 20px rgba(0,0,0,0.08)"
        }}
      >
        {/* Main Image Display */}
        <Box sx={{ 
          position: "relative", 
          height: { xs: 350, sm: 400, md: 500 },
          width: "100%"
        }}>
          {!mainImageLoaded && (
            <Skeleton
              variant="rectangular"
              width="100%"
              height="100%"
              animation="wave"
              sx={{ borderRadius: 3 }}
            />
          )}
          <Box
            component="img"
            src={images[currentImageIndex] || "/api/placeholder/600/500"}
            alt="Pet main image"
            onLoad={() => setMainImageLoaded(true)}
            sx={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              display: mainImageLoaded ? "block" : "none",
              transition: "opacity 0.3s ease-in-out"
            }}
          />

          {/* Navigation Arrows - Only show if more than 1 image */}
          {images.length > 1 && (
            <>
              <IconButton
                sx={{
                  position: "absolute",
                  left: 16,
                  top: "50%",
                  backgroundColor: "rgba(255,255,255,0.95)",
                  transform: "translateY(-50%)",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                  width: 44,
                  height: 44,
                  "&:hover": { 
                    backgroundColor: "white",
                    transform: "translateY(-50%) scale(1.05)"
                  },
                  "&:disabled": {
                    opacity: 0.5
                  },
                  transition: "all 0.2s ease"
                }}
                onClick={onPrevImage}
                disabled={currentImageIndex === 0}
              >
                <ArrowBackIosRoundedIcon fontSize="small" />
              </IconButton>
              
              <IconButton
                sx={{
                  position: "absolute",
                  right: 16,
                  top: "50%",
                  backgroundColor: "rgba(255,255,255,0.95)",
                  transform: "translateY(-50%)",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                  width: 44,
                  height: 44,
                  "&:hover": { 
                    backgroundColor: "white",
                    transform: "translateY(-50%) scale(1.05)"
                  },
                  "&:disabled": {
                    opacity: 0.5
                  },
                  transition: "all 0.2s ease"
                }}
                onClick={onNextImage}
                disabled={currentImageIndex === images.length - 1}
              >
                <ArrowForwardIosRoundedIcon fontSize="small" />
              </IconButton>
            </>
          )}

          {/* Dot Indicators */}
          {images.length > 1 && (
            <Box
              sx={{
                position: "absolute",
                bottom: 16,
                left: "50%",
                transform: "translateX(-50%)",
                display: "flex",
                gap: 1,
                alignItems: "center"
              }}
            >
              {images.map((_, index) => (
                <Box
                  key={index}
                  onClick={() => handleImageSelect(index)}
                  sx={{
                    width: 12,
                    height: 12,
                    borderRadius: "50%",
                    backgroundColor: currentImageIndex === index 
                      ? "rgba(255,255,255,0.9)" 
                      : "rgba(255,255,255,0.5)",
                    cursor: "pointer",
                    transition: "all 0.3s ease",
                    border: currentImageIndex === index 
                      ? "2px solid rgba(255,255,255,0.9)" 
                      : "2px solid transparent",
                    "&:hover": {
                      backgroundColor: "rgba(255,255,255,0.8)",
                      transform: "scale(1.2)"
                    }
                  }}
                />
              ))}
            </Box>
          )}

          {/* Image Counter */}
          {images.length > 1 && (
            <Box
              sx={{
                position: "absolute",
                top: 16,
                right: 16,
                backgroundColor: "rgba(0,0,0,0.7)",
                color: "white",
                px: 2,
                py: 0.5,
                borderRadius: 20,
                fontSize: "0.875rem",
                fontWeight: 500
              }}
            >
              {currentImageIndex + 1} / {images.length}
            </Box>
          )}
        </Box>
      </Box>

      {/* Thumbnails Strip - Always show, create more if needed */}
      <Box
        sx={{
          mt: 2,
          display: "flex",
          gap: 1,
          overflowX: "auto",
          pb: 1,
          px: 0.5,
          justifyContent: images.length <= 5 ? "center" : "flex-start",
          "&::-webkit-scrollbar": {
            height: 6
          },
          "&::-webkit-scrollbar-track": {
            backgroundColor: "#f0f0f0",
            borderRadius: 3
          },
          "&::-webkit-scrollbar-thumb": {
            backgroundColor: "#9990DA",
            borderRadius: 3,
            "&:hover": {
              backgroundColor: "#8278c7"
            }
          }
        }}
      >
        {/* Show actual images if available */}
        {images.length > 0 ? (
          images.map((img, index) => (
            <Box
              key={index}
              sx={{
                flexShrink: 0,
                position: "relative",
                width: { xs: 70, sm: 85, md: 95 },
                height: { xs: 70, sm: 85, md: 95 },
                borderRadius: 2,
                overflow: "hidden",
                border: currentImageIndex === index
                  ? "3px solid #9990DA"
                  : "2px solid #e0e0e0",
                cursor: "pointer",
                transition: "all 0.3s ease",
                transform: currentImageIndex === index ? "scale(1.02)" : "scale(1)",
                boxShadow: currentImageIndex === index 
                  ? "0 4px 12px rgba(153, 144, 218, 0.4)"
                  : "0 2px 8px rgba(0,0,0,0.08)",
                "&:hover": {
                  transform: "scale(1.05)",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                  border: "2px solid #9990DA"
                }
              }}
              onClick={() => handleImageSelect(index)}
            >
              {!thumbnailsLoaded[index] && (
                <Skeleton
                  variant="rectangular"
                  width="100%"
                  height="100%"
                  animation="wave"
                />
              )}
              <Box
                component="img"
                src={img}
                alt={`Pet image ${index + 1}`}
                onLoad={() => handleThumbnailLoad(index)}
                sx={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  display: thumbnailsLoaded[index] ? "block" : "none",
                  transition: "all 0.2s ease"
                }}
              />
              
              {/* Active indicator */}
              {currentImageIndex === index && (
                <Box
                  sx={{
                    position: "absolute",
                    top: 4,
                    right: 4,
                    width: 12,
                    height: 12,
                    borderRadius: "50%",
                    backgroundColor: "#9990DA",
                    border: "2px solid white",
                    boxShadow: "0 2px 4px rgba(0,0,0,0.2)"
                  }}
                />
              )}
            </Box>
          ))
        ) : (
          // Show placeholder thumbnails if no images
          Array.from({ length: 4 }).map((_, index) => (
            <Box
              key={`placeholder-${index}`}
              sx={{
                flexShrink: 0,
                width: { xs: 70, sm: 85, md: 95 },
                height: { xs: 70, sm: 85, md: 95 },
                borderRadius: 2,
                backgroundColor: "#f5f5f5",
                border: "2px solid #e0e0e0",
                display: "flex",
                alignItems: "center",
                justifyContent: "center"
              }}
            >
              <PetsRoundedIcon sx={{ fontSize: 24, color: "#ccc" }} />
            </Box>
          ))
        )}
        
        {/* Add more placeholder thumbnails to show more options */}
        {images.length > 0 && images.length < 6 && (
          Array.from({ length: 6 - images.length }).map((_, index) => (
            <Box
              key={`extra-${index}`}
              sx={{
                flexShrink: 0,
                width: { xs: 70, sm: 85, md: 95 },
                height: { xs: 70, sm: 85, md: 95 },
                borderRadius: 2,
                backgroundColor: "#f8f9fa",
                border: "2px dashed #dee2e6",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                opacity: 0.6
              }}
            >
              <Box sx={{ textAlign: "center", color: "#adb5bd" }}>
                <PetsRoundedIcon sx={{ fontSize: 20, mb: 0.5 }} />
                <Typography variant="caption" sx={{ fontSize: "0.7rem" }}>
                  +{index + 1}
                </Typography>
              </Box>
            </Box>
          ))
        )}
      </Box>

      {/* No Images Placeholder */}
      {images.length === 0 && (
        <Box
          sx={{
            height: { xs: 350, sm: 400, md: 500 },
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "#f8f9fa",
            borderRadius: 3,
            border: "2px dashed #dee2e6"
          }}
        >
          <Box sx={{ textAlign: "center", color: "text.secondary" }}>
            <PetsRoundedIcon sx={{ fontSize: 48, mb: 1, opacity: 0.5 }} />
            <Typography variant="body1">
              ບໍ່ມີຮູບພາບ
            </Typography>
          </Box>
        </Box>
      )}
    </Box>
  );
};

// Main PetDetail Component
const PetDetail: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  // Favorite state management (same as PetAdoptionPage)
  const [favoriteIds, setFavoriteIds] = useState<string[]>([]);
  const [isFavoriteLoading, setIsFavoriteLoading] = useState(false);
  const [notification, setNotification] = useState<{
    open: boolean;
    message: string;
    type: "success" | "error";
  }>({
    open: false,
    message: "",
    type: "success",
  });
  const [favoritesLoaded, setFavoritesLoaded] = useState(false);
  
  // Add ref to track if favorite request is in progress
  const favoriteRequestInProgress = useRef(false);

  const {
    latestPets,
    data,
    loading,
    error,
    currentImageIndex,
    handleNextImage,
    handlePrevImage,
    handleSelectImage,
    getAgeString,
    getWeightString,
    getHeightString,
  } = DetailController();

  // Fetch favorites with useCallback to prevent unnecessary recreations
  const fetchFavorites = useCallback(async () => {
    try {
      setFavoritesLoaded(false);
      const response = await axiosInstance.get<FavoriteResponse>("/favorite");
      
      if (response.data.data && response.data.data.length > 0) {
        const favoriteData = response.data.data[0];
        setFavoriteIds(favoriteData.itemId || []);
        console.log("Fetched favorites:", favoriteData.itemId);
      } else {
        setFavoriteIds([]);
        console.log("No favorites found");
      }
      setFavoritesLoaded(true);
    } catch (error) {
      console.error("Error fetching favorites:", error);
      setFavoriteIds([]);
      setFavoritesLoaded(true);
    }
  }, []);

  // Initial fetch on component mount
  useEffect(() => {
    fetchFavorites();
  }, [fetchFavorites]);

  // Handle favorite toggle (GUARANTEED single call)
  const handleFavoriteToggle = async (petId: string) => {
    // Multiple layers of protection against duplicate calls
    if (!petId || isFavoriteLoading || favoriteRequestInProgress.current) {
      console.log("Favorite toggle blocked - already in progress");
      return;
    }
    
    try {
      // Set both state and ref to prevent any duplicate calls
      favoriteRequestInProgress.current = true;
      setIsFavoriteLoading(true);
      
      const isFavorited = favoriteIds.includes(petId);
      console.log(`Starting favorite toggle for petId: ${petId}, currently favorited: ${isFavorited}`);

      if (isFavorited) {
        // If already favorited, remove from favorites
        const response = await axiosInstance.delete("/favorite/delete", {
          data: { itemId: petId }
        });
        
        console.log("Remove favorite response:", response.data);
        
        // Check if deletion was successful
        if (response.data && (response.data.success || response.data.status === 200 || response.status === 200)) {
          // Immediately update local state
          setFavoriteIds((prev) => prev.filter((id) => id !== petId));
          
          setNotification({
            open: true,
            message: "Removed from favorites",
            type: "success"
          });
          console.log("Successfully removed from favorites");
        } else {
          throw new Error("Failed to remove from favorites");
        }
      } else {
        // If not favorited, add to favorites
        const response = await axiosInstance.post("/favorite", { itemId: petId });
        
        console.log("Add favorite response:", response.data);
        
        // Check if addition was successful
        if (response.data && (response.data.success || response.data.status === 200 || response.status === 200)) {
          // Immediately update local state
          setFavoriteIds((prev) => [...prev, petId]);
          
          setNotification({
            open: true,
            message: "Added to favorites",
            type: "success"
          });
          console.log("Successfully added to favorites");
        } else {
          throw new Error("Failed to add to favorites");
        }
      }
    } catch (error) {
      console.error("Error toggling favorite:", error);
      setNotification({
        open: true,
        message: "Error updating favorites. Please try again.",
        type: "error"
      });
    } finally {
      // Reset both state and ref
      setIsFavoriteLoading(false);
      favoriteRequestInProgress.current = false;
      console.log("Favorite toggle completed");
    }
  };

  const handleCloseNotification = () => {
    setNotification({ ...notification, open: false });
  };

  const isPetFavorited = (petId: string) => {
    return Array.isArray(favoriteIds) && favoriteIds.includes(petId);
  };

  // Show loading state
  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "70vh" }}>
          <CircularProgress sx={{ color: "#9990DA" }} />
        </Box>
      </Container>
    );
  }

  // Show error state
  if (error) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Paper
          elevation={0}
          sx={{
            p: 4,
            textAlign: "center",
            borderRadius: 3,
            border: "1px solid rgba(255,107,107,0.2)",
            maxWidth: 600,
            mx: "auto",
            backgroundColor: "#FFF8F8",
          }}
        >
          <Box sx={{ mb: 3 }}>
            <WarningAmberRoundedIcon sx={{ fontSize: 60, color: "#ff6b6b" }} />
          </Box>
          <Typography variant="h5" color="error" fontWeight={600} gutterBottom>
            ມີບາງຢ່າງຜິດພາດ
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
            {error}
          </Typography>
          <Button
            variant="contained"
            onClick={() => navigate("/adopt")}
            sx={{
              backgroundColor: "#9990DA",
              borderRadius: "20px",
              py: 1,
              px: 3,
              textTransform: "none",
              fontWeight: 600,
              "&:hover": {
                backgroundColor: "#8278c7",
              },
            }}
          >
            ກັບຄືນໜ້າການຮັບລ້ຽງ
          </Button>
        </Paper>
      </Container>
    );
  }

  // Show error if no data
  if (!data) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Paper
          elevation={0}
          sx={{
            p: 4,
            textAlign: "center",
            borderRadius: 3,
            border: "1px solid rgba(255,190,0,0.2)",
            maxWidth: 600,
            mx: "auto",
            backgroundColor: "#FFFDF5",
          }}
        >
          <Box sx={{ mb: 3 }}>
            <InfoRoundedIcon sx={{ fontSize: 60, color: "#ffbe00" }} />
          </Box>
          <Typography variant="h5" color="warning.dark" fontWeight={600} gutterBottom>
            ບໍ່ພົບສັດລ້ຽງ
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
            ພວກເຮົາບໍ່ພົບສັດລ້ຽງທີ່ທ່ານກຳລັງຊອກຫາ. ມັນອາດຈະຖືກຮັບລ້ຽງໄປແລ້ວ ຫຼື ຖືກຍ້າຍອອກ.
          </Typography>
          <Button
            variant="contained"
            onClick={() => navigate("/adopt")}
            sx={{
              backgroundColor: "#9990DA",
              borderRadius: "20px",
              py: 1,
              px: 3,
              textTransform: "none",
              fontWeight: 600,
              "&:hover": {
                backgroundColor: "#8278c7",
              },
            }}
          >
            ເບິ່ງສັດລ້ຽງທີ່ມີໃຫ້ຮັບລ້ຽງ
          </Button>
        </Paper>
      </Container>
    );
  }

  // Format price properly
  const formattedPrice = data.price
    ? `${data.price.toFixed(2)}`
    : "ຕິດຕໍ່ສອບຖາມລາຄາ";

  return (
    <Container maxWidth="lg" sx={{ py: { xs: 3, md: 5 } }}>
      <Grid container spacing={4}>
        {/* Left Column - Images */}
        <Grid item xs={12} md={7}>
          <Box sx={{ mb: 3 }}>
            <ImageGallery
              images={data.images || []}
              currentImageIndex={currentImageIndex}
              onPrevImage={handlePrevImage}
              onNextImage={handleNextImage}
              onSelectImage={handleSelectImage}
            />
          </Box>

          {/* Description Card */}
          <Card
            elevation={0}
            sx={{
              borderRadius: 3,
              p: 3,
              mb: 3,
              border: "1px solid rgba(0,0,0,0.05)",
              boxShadow: "0 4px 20px rgba(0,0,0,0.03)"
            }}
          >
            <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>
              ກ່ຽວກັບ {data.petName}
            </Typography>
            <Typography
              variant="body1"
              color="text.secondary"
              sx={{
                lineHeight: 1.7,
                whiteSpace: "pre-line"
              }}
            >
              {data?.bio || `${data.petName} ເປັນສັດລ້ຽງທີ່ໜ້າຮັກ (ພັນ ${data.breed?.breedName || "ບໍ່ຮູ້ຈັກ"}) ກຳລັງຊອກຫາເຮືອນຖາວອນ. ${data.gender === Gender.MALE ? 'ລາວ' : 'ມັນ'} ເປັນມິດຫຼາຍ ແລະ ຈະເປັນເພື່ອນທີ່ດີເລີດ.`}
            </Typography>
          </Card>
        </Grid>

        {/* Right Column - Info */}
        <Grid item xs={12} md={5}>
          <Card
            elevation={0}
            sx={{
              borderRadius: 3,
              p: 3,
              mb: 3,
              position: "sticky",
              top: 20,
              border: "1px solid rgba(0,0,0,0.05)",
              boxShadow: "0 4px 20px rgba(0,0,0,0.03)"
            }}
          >
            {/* Header with actions */}
            <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
              <Box>
                <Typography variant="h4" component="h1" fontWeight={700} sx={{ mb: 0.5 }}>
                  {data.petName}
                </Typography>

                {data.breed && (
                  <Chip
                    label={data.breed.breedName}
                    size="small"
                    sx={{
                      backgroundColor: "rgba(153, 144, 218, 0.1)",
                      color: "#9990DA",
                      fontWeight: 500
                    }}
                  />
                )}
              </Box>

              {/* Updated Favorite button with GUARANTEED single call */}
              <Box>
                <Tooltip title={isPetFavorited(data.id) ? "Remove from favorites" : "Add to favorites"}>
                  <IconButton
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      // Additional check before calling the function
                      if (!isFavoriteLoading && !favoriteRequestInProgress.current) {
                        handleFavoriteToggle(data.id);
                      }
                    }}
                    disabled={isFavoriteLoading || favoriteRequestInProgress.current}
                    sx={{
                      color: isPetFavorited(data.id) ? "#f44336" : "text.secondary",
                      "&:hover": { 
                        backgroundColor: "rgba(0,0,0,0.04)",
                        transform: "scale(1.1)"
                      },
                      "&:disabled": {
                        opacity: 0.6,
                        transform: "none",
                        cursor: "not-allowed"
                      },
                      width: 48,
                      height: 48,
                      transition: 'all 0.2s ease',
                    }}
                  >
                    {(isFavoriteLoading || favoriteRequestInProgress.current) ? (
                      <CircularProgress size={24} />
                    ) : isPetFavorited(data.id) ? (
                      <FavoriteRoundedIcon />
                    ) : (
                      <FavoriteBorderRoundedIcon />
                    )}
                  </IconButton>
                </Tooltip>
              </Box>
            </Box>

            {/* Price */}
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                p: 2,
                my: 3,
                backgroundColor: "rgba(153, 144, 218, 0.1)",
                borderRadius: 2,
                border: "1px dashed rgba(153, 144, 218, 0.3)"
              }}
            >
              <AttachMoneyRoundedIcon sx={{ fontSize: 28, color: "#9990DA", mr: 1 }} />
              <Typography variant="h5" fontWeight={700} color="#9990DA">
                {formattedPrice}
              </Typography>
            </Box>

            {/* Characteristics */}
            <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>
              ລັກສະນະ
            </Typography>

            <Grid container spacing={2}>
              <Grid item xs={12}>
                <PropertyItem
                  icon={data?.gender === Gender.MALE ?
                    <MaleRoundedIcon /> :
                    data?.gender === Gender.FEMALE ?
                      <FemaleRoundedIcon /> :
                      <HelpOutlineRoundedIcon />
                  }
                  label="ເພດ"
                  value={data?.gender === Gender.MALE ? "MALE" : "FEMALE"}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <PropertyItem
                  icon={<CakeRoundedIcon />}
                  label="ອາຍຸ"
                  value={getAgeString()}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <PropertyItem
                  icon={<ColorLensRoundedIcon />}
                  label="ສີ"
                  value={data.color || "ສີປະສົມ"}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <PropertyItem
                  icon={<ScaleRoundedIcon />}
                  label="ນ້ຳໜັກ"
                  value={getWeightString()}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <PropertyItem
                  icon={<HeightRoundedIcon />}
                  label="ລວງສູງ"
                  value={getHeightString()}
                />
              </Grid>
            </Grid>

            {/* Adoption Action */}
            <Box sx={{ mt: 3 }}>
              <Button
                onClick={() => navigate(`/Adopt-information/${id}`)}
                variant="contained"
                size="large"
                fullWidth
                sx={{
                  borderRadius: 6,
                  py: 1.5,
                  backgroundColor: "#9990DA",
                  fontWeight: 700,
                  textTransform: "none",
                  fontSize: "1.1rem",
                  boxShadow: "0 4px 14px rgba(153, 144, 218, 0.4)",
                  "&:hover": {
                    backgroundColor: "#8278c7",
                    boxShadow: "0 6px 20px rgba(153, 144, 218, 0.5)",
                  },
                }}
                startIcon={<PetsRoundedIcon />}
              >
                ຮັບລ້ຽງ {data.petName}
              </Button>

              <Typography
                variant="caption"
                align="center"
                color="text.secondary"
                sx={{
                  display: "block",
                  mt: 1.5,
                  textAlign: "center"
                }}
              >
                ການກົດ "ຮັບລ້ຽງ" ທ່ານຈະເລີ່ມຂັ້ນຕອນການສະໝັກເພື່ອຮັບລ້ຽງ {data.petName}.
              </Typography>
            </Box>
          </Card>
        </Grid>
      </Grid>

      {/* Similar Pets Section */}
      <Box sx={{ mt: 5, mb: 2 }}>
        <Typography
          variant="h5"
          component="h2"
          fontWeight={700}
          sx={{ mb: 1 }}
        >
          ທ່ານອາດຈະມັກ
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
          ກວດເບິ່ງສັດລ້ຽງອື່ນໆເຫຼົ່ານີ້ທີ່ກຳລັງຊອກຫາເຮືອນທີ່ອົບອຸ່ນ
        </Typography>

        <Grid container spacing={3}>
          {latestPets.slice(0, 4).map((pet) => (
            <Grid item xs={6} sm={6} md={3} key={pet.id}>
              <SimilarPetCard pet={pet} breedName={pet?.breed?.breedName} />
            </Grid>
          ))}
        </Grid>
      </Box>

      {/* Notification Snackbar */}
      <Snackbar 
        open={notification.open} 
        autoHideDuration={3000} 
        onClose={handleCloseNotification}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        sx={{ 
          '& .MuiAlert-root': {
            borderRadius: 2,
            boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
          }
        }}
      >
        <Alert 
          onClose={handleCloseNotification} 
          severity={notification.type} 
          sx={{ width: '100%' }}
          variant="filled"
        >
          {notification.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default PetDetail;