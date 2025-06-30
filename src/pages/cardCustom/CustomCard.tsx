import React, { useState, useCallback, useEffect } from "react";
import { Box, Button, Card, Chip, IconButton, Typography, CircularProgress } from "@mui/material";
import FavoriteIcon from "@mui/icons-material/Favorite";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import VerifiedIcon from "@mui/icons-material/Verified";
import MaleIcon from "@mui/icons-material/Male";
import FemaleIcon from "@mui/icons-material/Female";
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";
import { motion } from "framer-motion";
import axiosInstance from "../../configs/axios";

// Animation variants
const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (index) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: index * 0.1,
      duration: 0.3,
    },
  }),
};

// Interface for favorite data structure (same as PetAdoptionPage)
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

interface PetDataProps {
  id: string;
  name: string;
  image: string;
  gender: string;
  breed: string;
  age: string;
  size: string;
  description: string;
  isPremium?: boolean;
  index?: number;
}

interface CustomCardProps {
  petData: PetDataProps;
  onNotification?: (message: string, type: "success" | "error") => void;
  index?: number;
}

const CustomCard: React.FC<CustomCardProps> = ({
  petData,
  onNotification,
  index = 0,
}) => {
  // State management exactly like PetAdoptionPage
  const [favoriteIds, setFavoriteIds] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState<{ [key: string]: boolean }>({});
  const [favoritesLoaded, setFavoritesLoaded] = useState(false);

  // Fetch favorites function (same as PetAdoptionPage)
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

  // Handle favorite toggle (exactly like PetAdoptionPage)
  const handleFavoriteToggle = async (petId: string) => {
    try {
      const isFavorited = favoriteIds.includes(petId);
      setIsLoading((prev) => ({ ...prev, [petId]: true }));

      if (isFavorited) {
        // If already favorited, remove from favorites
        const response = await axiosInstance.delete("/favorite/delete", {
          data: { itemId: petId }
        });
        
        console.log("Remove favorite response:", response.data);
        
        // Check if deletion was successful - response structure may vary
        // Based on the original code, we're expecting a success property
        if (response.data && (response.data.success || response.data.status === 200)) {
          // Immediately update local state
          setFavoriteIds((prev) => prev.filter((id) => id !== petId));
          
          onNotification?.("Removed from favorites", "success");
        } else {
          throw new Error("Failed to remove from favorites");
        }
      } else {
        // If not favorited, add to favorites
        const response = await axiosInstance.post("/favorite", { itemId: petId });
        
        console.log("Add favorite response:", response.data);
        
        // Check if addition was successful
        if (response.data && (response.data.success || response.data.status === 200)) {
          // Immediately update local state
          setFavoriteIds((prev) => [...prev, petId]);
          
          onNotification?.("Added to favorites", "success");
        } else {
          throw new Error("Failed to add to favorites");
        }
      }
    } catch (error) {
      console.error("Error toggling favorite:", error);
      onNotification?.("Error updating favorites. Please try again.", "error");
    } finally {
      // Clear loading state
      setIsLoading((prev) => ({ ...prev, [petId]: false }));
      // Refresh favorites to ensure server and UI state are in sync
      fetchFavorites();
    }
  };

  // Check if pet is favorited (same as PetAdoptionPage)
  const isPetFavorited = (petId: string) => {
    return Array.isArray(favoriteIds) && favoriteIds.includes(petId);
  };

  // Limit description text
  const truncateDescription = (text: string, maxLength: number = 120) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + "...";
  };

  // Determine gender icon and colors
  const getGenderIcon = () => {
    if (petData.gender.toLowerCase() === "male") {
      return <MaleIcon sx={{ color: "#5b8def", fontSize: 16 }} />;
    } else if (petData.gender.toLowerCase() === "female") {
      return <FemaleIcon sx={{ color: "#ff6b95", fontSize: 16 }} />;
    } else {
      return <HelpOutlineIcon sx={{ color: "gray", fontSize: 16 }} />;
    }
  };

  const getGenderStyle = () => {
    if (petData.gender.toLowerCase() === "male") {
      return {
        bg: 'rgba(91, 141, 239, 0.1)',
        border: '1px solid rgba(91, 141, 239, 0.2)'
      };
    } else if (petData.gender.toLowerCase() === "female") {
      return {
        bg: 'rgba(255, 107, 149, 0.1)',
        border: '1px solid rgba(255, 107, 149, 0.2)'
      };
    } else {
      return {
        bg: 'rgba(180, 180, 180, 0.1)',
        border: '1px solid rgba(180, 180, 180, 0.2)'
      };
    }
  };

  const genderStyle = getGenderStyle();

  return (
    <motion.div
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      custom={index}
      whileHover={{ y: -5, transition: { duration: 0.2 } }}
    >
      <Card
        sx={{
          borderRadius: 3,
          overflow: 'hidden',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 8px 24px rgba(149, 157, 165, 0.1)',
          transition: 'all 0.3s ease',
          '&:hover': {
            boxShadow: '0 16px 32px rgba(149, 157, 165, 0.2)',
          },
          maxWidth: "100%",
          mx: 0,
        }}
      >
        <Box 
          sx={{ 
            position: 'relative',
            height: 220,
            overflow: 'hidden',
          }}
        >
          <Box
            component="img"
            src={petData.image}
            alt={petData.name}
            sx={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              transition: 'transform 0.5s ease',
              '&:hover': {
                transform: 'scale(1.05)',
              },
            }}
          />
          
          {/* Favorite button - exactly like PetAdoptionPage */}
          <IconButton
            size="medium"
            onClick={() => handleFavoriteToggle(petData.id)}
            disabled={isLoading[petData.id]}
            sx={{
              position: "absolute",
              right: 12,
              top: 12,
              backgroundColor: "rgba(255,255,255,0.9)",
              "&:hover": {
                backgroundColor: "white",
                transform: "scale(1.1)",
              },
              width: 40,
              height: 40,
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
              transition: 'all 0.2s ease',
            }}
          >
            {isLoading[petData.id] ? (
              <CircularProgress size={20} />
            ) : isPetFavorited(petData.id) ? (
              <FavoriteIcon fontSize="small" sx={{ color: '#ff3d71' }} />
            ) : (
              <FavoriteBorderIcon fontSize="small" />
            )}
          </IconButton>
          
          {/* Premium Badge if applicable */}
          {petData.isPremium && (
            <Box
              sx={{
                position: "absolute",
                top: 10,
                left: 10,
                backgroundColor: "#9990DA",
                color: "white",
                px: 1,
                py: 0.5,
                borderRadius: "4px",
                display: "flex",
                alignItems: "center",
                gap: 0.5,
                fontSize: "0.75rem",
                zIndex: 1,
              }}
            >
              <VerifiedIcon sx={{ fontSize: 16 }} />
              Premium
            </Box>
          )}
        </Box>

        <Box sx={{ p: 3, flexGrow: 1, display: "flex", flexDirection: "column" }}>
          {/* Name and Location Section */}
          <Box sx={{ mb: 1.5 }}>
            <Typography
              variant="h6"
              fontWeight={600}
              sx={{ mb: 0.5 }}
            >
              {petData.name}
            </Typography>
          </Box>

          {/* Pet characteristics */}
          <Box
            display="flex"
            flexWrap="wrap"
            gap={1}
            mb={2}
          >
            {/* Gender */}
            <Chip
              size="small"
              label={
                <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                  {getGenderIcon()}
                  <Typography variant="caption" fontWeight={500}>
                    {petData.gender}
                  </Typography>
                </Box>
              }
              sx={{
                height: 28,
                borderRadius: 4,
                backgroundColor: genderStyle.bg,
                border: genderStyle.border,
                '& .MuiChip-label': { px: 1 },
              }}
            />

            {/* Age */}
            <Chip
              size="small"
              label={
                <Typography variant="caption" fontWeight={500}>
                  {petData.age}
                </Typography>
              }
              sx={{
                height: 28,
                borderRadius: 4,
                backgroundColor: 'rgba(155, 89, 182, 0.1)',
                border: '1px solid rgba(155, 89, 182, 0.2)',
                '& .MuiChip-label': { px: 1 },
              }}
            />

            {/* Breed */}
            <Chip
              size="small"
              label={
                <Typography variant="caption" fontWeight={500}>
                  {petData.breed}
                </Typography>
              }
              sx={{
                height: 28,
                borderRadius: 4,
                backgroundColor: 'rgba(52, 152, 219, 0.1)',
                border: '1px solid rgba(52, 152, 219, 0.2)',
                '& .MuiChip-label': { px: 1 },
              }}
            />

            {/* Size */}
            <Chip
              size="small"
              label={
                <Typography variant="caption" fontWeight={500}>
                  {petData.size}
                </Typography>
              }
              sx={{
                height: 28,
                borderRadius: 4,
                backgroundColor: 'rgba(46, 204, 113, 0.1)',
                border: '1px solid rgba(46, 204, 113, 0.2)',
                '& .MuiChip-label': { px: 1 },
              }}
            />
          </Box>

          {/* Pet Bio */}
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{
              mb: 2,
              overflow: "hidden",
              textOverflow: "ellipsis",
              display: "-webkit-box",
              WebkitLineClamp: 3,
              WebkitBoxOrient: "vertical",
              lineHeight: 1.5,
              flexGrow: 1,
            }}
          >
            {truncateDescription(petData.description)}
          </Typography>

          {/* More Info Button */}
          <Button
            fullWidth
            href={`/adopt-detail/${petData.id}`}
            sx={{
              textTransform: "none",
              fontWeight: 600,
              py: 1.2,
              borderRadius: 2,
              background: 'linear-gradient(90deg, #9990DA 0%, #7B68EE 100%)',
              color: 'white',
              '&:hover': {
                background: 'linear-gradient(90deg, #8a82c8 0%, #6f5ee0 100%)',
                boxShadow: '0 4px 12px rgba(123, 104, 238, 0.3)',
              },
              transition: 'all 0.3s ease',
            }}
          >
            ທຳຄວາມຮູ້ຈັກ {petData.name}
          </Button>
        </Box>
      </Card>
    </motion.div>
  );
};

export default CustomCard;