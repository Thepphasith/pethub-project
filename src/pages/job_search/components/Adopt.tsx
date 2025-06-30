import React, { useEffect, useState, useCallback } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  IconButton,
  Chip,
  Grid,
  Button,
  Container,
  CircularProgress,
  Snackbar,
  Alert,
  Skeleton,
  Paper,
  Divider,
  useMediaQuery,
  useTheme,
  Backdrop,
} from "@mui/material";
import FavoriteIcon from "@mui/icons-material/Favorite";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import MaleIcon from "@mui/icons-material/Male";
import FemaleIcon from "@mui/icons-material/Female";
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";
import FilterAltIcon from "@mui/icons-material/FilterAlt";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import VolunteerActivismIcon from "@mui/icons-material/VolunteerActivism";
import RefreshIcon from "@mui/icons-material/Refresh";
import ClearIcon from "@mui/icons-material/Clear";
import useMainController from "../controllers";
import { Gender } from "../../../enums/gender";
import axiosInstance from "../../../configs/axios";
import { motion } from "framer-motion";
import FilterComponent from "./filterAdopt";

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

interface Pet {
  id: string;
  petName: string;
  type: string;
  breed: { breedName: string };
  color: string;
  gender: string;
  yearAge: number;
  size: string;
  bio: string;
  images: string[];
  // other properties...
}

interface FilterState {
  animalType: string;
  breeds: string[];
  colors: string[];
  genders: string[];
  ages: string[];
  sizes: string[];
}

interface PetApiResponse {
  message: string;
  status: number;
  data: Pet[];
}

const PetAdoptionPage: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));
  const ctrl = useMainController();
  
  // State management
  const [allPets, setAllPets] = useState<Pet[]>([]);
  const [displayedPets, setDisplayedPets] = useState<Pet[]>([]);
  const [favoriteIds, setFavoriteIds] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState<{ [key: string]: boolean }>({});
  const [isLoadingPets, setIsLoadingPets] = useState<boolean>(false);
  const [petsError, setPetsError] = useState<string>("");
  const [currentFilters, setCurrentFilters] = useState<FilterState>({
    animalType: "",
    breeds: [],
    colors: [],
    genders: [],
    ages: [],
    sizes: [],
  });
  const [hasActiveFilters, setHasActiveFilters] = useState<boolean>(false);
  const [isInitialLoad, setIsInitialLoad] = useState<boolean>(true);
  
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
  const [showFilters, setShowFilters] = useState(!isMobile);

  // Fetch all pets (default view)
  const fetchAllPets = useCallback(async () => {
    try {
      setIsLoadingPets(true);
      setPetsError("");
      
      console.log("Fetching all pets...");
      const response = await axiosInstance.get<PetApiResponse>("/pets/all");
      
      if (response.data && response.data.data) {
        setAllPets(response.data.data);
        setDisplayedPets(response.data.data);
        console.log("Fetched all pets:", response.data.data.length);
      } else {
        setAllPets([]);
        setDisplayedPets([]);
      }
    } catch (error) {
      console.error("Error fetching pets:", error);
      setPetsError("Failed to load pets. Please try again.");
      setAllPets([]);
      setDisplayedPets([]);
    } finally {
      setIsLoadingPets(false);
      setIsInitialLoad(false);
    }
  }, []);

  // Fetch filtered pets based on query parameters
  const fetchFilteredPets = useCallback(async (queryParams: URLSearchParams) => {
    try {
      setIsLoadingPets(true);
      setPetsError("");
      
      const queryString = queryParams.toString();
      const url = `/pets/all${queryString ? `?${queryString}` : ''}`;
      
      console.log("Fetching filtered pets with URL:", url);
      
      const response = await axiosInstance.get<PetApiResponse>(url);
      
      if (response.data && response.data.data) {
        setDisplayedPets(response.data.data);
        console.log("Fetched filtered pets:", response.data.data.length);
        
        setNotification({
          open: true,
          message: `Found ${response.data.data.length} pets matching your criteria`,
          type: "success"
        });
      } else {
        setDisplayedPets([]);
        setNotification({
          open: true,
          message: "No pets found matching your criteria",
          type: "error"
        });
      }
    } catch (error) {
      console.error("Error fetching filtered pets:", error);
      setPetsError("Failed to load filtered pets. Please try again.");
      setDisplayedPets([]);
      setNotification({
        open: true,
        message: "Error loading filtered results. Please try again.",
        type: "error"
      });
    } finally {
      setIsLoadingPets(false);
    }
  }, []);

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
    fetchAllPets();
    fetchFavorites();
  }, [fetchAllPets, fetchFavorites]);

  // Toggle mobile filters
  useEffect(() => {
    setShowFilters(!isMobile);
  }, [isMobile]);

  // Check if there are active filters
  useEffect(() => {
    const hasFilters = 
      currentFilters.animalType !== "" ||
      currentFilters.breeds.length > 0 ||
      currentFilters.colors.length > 0 ||
      currentFilters.genders.length > 0 ||
      currentFilters.ages.length > 0 ||
      currentFilters.sizes.length > 0;
    
    setHasActiveFilters(hasFilters);
  }, [currentFilters]);

  const handleToggleFilters = () => {
    setShowFilters(prev => !prev);
  };

  // Handle filter application
  const handleApplyFilters = useCallback(async ({ 
    filters, 
    queryParams 
  }: { 
    filters: FilterState; 
    queryParams: URLSearchParams;
  }) => {
    console.log("Applying filters:", filters);
    console.log("Query params:", queryParams.toString());
    
    setCurrentFilters(filters);
    
    // If no meaningful filters are applied, show all pets
    if (!filters.animalType && 
        filters.breeds.length === 0 && 
        filters.colors.length === 0 && 
        filters.genders.length === 0 && 
        filters.ages.length === 0 && 
        filters.sizes.length === 0) {
      setDisplayedPets(allPets);
      setNotification({
        open: true,
        message: `Showing all ${allPets.length} pets`,
        type: "success"
      });
    } else {
      await fetchFilteredPets(queryParams);
    }
  }, [allPets, fetchFilteredPets]);

  // Handle filter state changes (for real-time updates if needed)
  const handleFilterStateChange = useCallback((filters: FilterState) => {
    setCurrentFilters(filters);
  }, []);

  // Clear all filters
  const handleClearAllFilters = useCallback(async () => {
    setCurrentFilters({
      animalType: "",
      breeds: [],
      colors: [],
      genders: [],
      ages: [],
      sizes: [],
    });
    setDisplayedPets(allPets);
    setNotification({
      open: true,
      message: "All filters cleared",
      type: "success"
    });
  }, [allPets]);

  // Refresh pets data
  const handleRefreshPets = useCallback(async () => {
    if (hasActiveFilters) {
      // If filters are active, re-apply them
      const queryParams = new URLSearchParams();
      
      if (currentFilters.animalType) {
        const petTypeMap = { "cat": "CAT", "dog": "DOG" };
        queryParams.append("petType", petTypeMap[currentFilters.animalType as keyof typeof petTypeMap]);
      }
      
      currentFilters.breeds.forEach(breedId => queryParams.append("breedId", breedId)); // Use breedId parameter name
      currentFilters.colors.forEach(color => queryParams.append("color", color));
      currentFilters.genders.forEach(gender => queryParams.append("gender", gender));
      currentFilters.ages.forEach(age => queryParams.append("yearAge", age));
      currentFilters.sizes.forEach(size => queryParams.append("size", size));
      
      await fetchFilteredPets(queryParams);
    } else {
      await fetchAllPets();
    }
  }, [hasActiveFilters, currentFilters, fetchFilteredPets, fetchAllPets]);

  const handleFavoriteToggle = async (petId: string) => {
    try {
      const isFavorited = favoriteIds.includes(petId);
      setIsLoading((prev) => ({ ...prev, [petId]: true }));

      if (isFavorited) {
        const response = await axiosInstance.delete("/favorite/delete", {
          data: { itemId: petId }
        });
        
        console.log("Remove favorite response:", response.data);
        
        if (response.data && (response.data.success || response.data.status === 200)) {
          setFavoriteIds((prev) => prev.filter((id) => id !== petId));
          setNotification({
            open: true,
            message: "Removed from favorites",
            type: "success"
          });
        } else {
          throw new Error("Failed to remove from favorites");
        }
      } else {
        const response = await axiosInstance.post("/favorite", { itemId: petId });
        
        console.log("Add favorite response:", response.data);
        
        if (response.data && (response.data.success || response.data.status === 200)) {
          setFavoriteIds((prev) => [...prev, petId]);
          setNotification({
            open: true,
            message: "Added to favorites",
            type: "success"
          });
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
      setIsLoading((prev) => ({ ...prev, [petId]: false }));
      fetchFavorites();
    }
  };

  const handleCloseNotification = () => {
    setNotification({ ...notification, open: false });
  };  

  const isPetFavorited = (petId: string) => {
    return Array.isArray(favoriteIds) && favoriteIds.includes(petId);
  };

  // Card animation variants
  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (index: number) => ({
      opacity: 1,
      y: 0,
      transition: { 
        delay: index * 0.1,
        duration: 0.5,
        ease: "easeOut"
      }
    })
  };

  // Loading skeleton
  const PetCardSkeleton = () => (
    <Card sx={{ 
      borderRadius: 3, 
      overflow: 'hidden',
      boxShadow: '0 8px 24px rgba(149, 157, 165, 0.1)',
      height: '100%'
    }}>
      <Skeleton variant="rectangular" height={200} animation="wave" />
      <CardContent>
        <Skeleton variant="text" width="60%" height={24} animation="wave" />
        <Box sx={{ display: 'flex', gap: 1, mt: 1, mb: 2 }}>
          <Skeleton variant="rounded" width={60} height={24} animation="wave" />
          <Skeleton variant="rounded" width={50} height={24} animation="wave" />
          <Skeleton variant="rounded" width={70} height={24} animation="wave" />
        </Box>
        <Skeleton variant="text" width="100%" height={20} animation="wave" />
        <Skeleton variant="text" width="90%" height={20} animation="wave" />
        <Skeleton variant="rectangular" width="100%" height={36} sx={{ mt: 2 }} animation="wave" />
      </CardContent>
    </Card>
  );

  // Show initial loading state
  if (isInitialLoad) {
    return (
      <Container maxWidth="lg" sx={{ pt: 4, pb: 6 }}>
        <Backdrop
          sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }}
          open={true}
        >
          <Box sx={{ textAlign: 'center' }}>
            <CircularProgress color="inherit" size={60} />
            <Typography variant="h6" sx={{ mt: 2 }}>
              Loading pets...
            </Typography>
          </Box>
        </Backdrop>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ pt: 4, pb: 6 }}>
      {/* Loading Backdrop */}
      <Backdrop
        sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }}
        open={isLoadingPets && !isInitialLoad}
      >
        <Box sx={{ textAlign: 'center' }}>
          <CircularProgress color="inherit" size={60} />
          <Typography variant="h6" sx={{ mt: 2 }}>
            {hasActiveFilters ? 'Applying filters...' : 'Loading pets...'}
          </Typography>
        </Box>
      </Backdrop>

      {/* Header section with controls */}
      <Box sx={{ mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h4" component="h1" sx={{ fontWeight: 600, color: '#333' }}>
            Pet Adoption
          </Typography>
          
          <Box sx={{ display: 'flex', gap: 1 }}>
            {/* Refresh button */}
            <Button
              variant="outlined"
              startIcon={<RefreshIcon />}
              onClick={handleRefreshPets}
              disabled={isLoadingPets}
              sx={{ minWidth: 'auto', px: 2 }}
            >
              {isMobile ? '' : 'Refresh'}
            </Button>
            
            {/* Clear filters button - only show if filters are active */}
            {hasActiveFilters && (
              <Button
                variant="outlined"
                color="error"
                startIcon={<ClearIcon />}
                onClick={handleClearAllFilters}
                disabled={isLoadingPets}
                sx={{ minWidth: 'auto', px: 2 }}
              >
                {isMobile ? '' : 'Clear Filters'}
              </Button>
            )}
          </Box>
        </Box>

        {/* Filter status */}
        {hasActiveFilters && (
          <Alert severity="info" sx={{ mb: 2 }}>
            <Typography variant="body2">
              Showing {displayedPets.length} pets matching your filters
              {currentFilters.animalType && ` for ${currentFilters.animalType}s`}
            </Typography>
          </Alert>
        )}

        {/* Error display */}
        {petsError && (
          <Alert 
            severity="error" 
            sx={{ mb: 2 }}
            action={
              <Button size="small" onClick={handleRefreshPets}>
                Retry
              </Button>
            }
          >
            {petsError}
          </Alert>
        )}
      </Box>

      {/* Mobile Filter Toggle */}
      {isMobile && (
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Button
            variant="outlined"
            startIcon={<FilterAltIcon />}
            onClick={handleToggleFilters}
            sx={{ mb: 2 }}
          >
            {showFilters ? 'Hide Filters' : 'Show Filters'}
          </Button>
          <Button
            variant="contained"
            startIcon={<VolunteerActivismIcon />}
            href="/Sell"
            sx={{
              mb: 2,
              bgcolor: "#9990DA",
              "&:hover": {
                backgroundColor: "#7B68EE",
              },
            }}
          >
            Rehome
          </Button>
        </Box>
      )}

      <Grid container spacing={3}>
        {/* Filters Column */}
        {(showFilters || !isMobile) && (
          <Grid item xs={12} md={3}>
            <Paper 
              elevation={0} 
              sx={{ 
                borderRadius: 3, 
                p: 2,
                border: '1px solid #f0f0f0',
                position: 'sticky',
                top: 20,
                maxHeight: isMobile ? 'auto' : 'calc(100vh - 40px)',
                overflowY: isMobile ? 'visible' : 'auto',
                mb: isMobile ? 3 : 0,
                boxShadow: '0 8px 24px rgba(149, 157, 165, 0.1)',
              }}
            >
              {!isMobile && (
                <Button
                  sx={{
                    width: "100%",
                    mb: 2,
                    p: 2,
                    borderRadius: 2,
                    background: 'linear-gradient(90deg, #9990DA 0%, #7B68EE 100%)',
                    color: 'white',
                    fontWeight: 600,
                    textTransform: 'none',
                    fontSize: '1rem',
                    "&:hover": {
                      background: 'linear-gradient(90deg, #8a82c8 0%, #6f5ee0 100%)',
                      boxShadow: '0 4px 12px rgba(123, 104, 238, 0.3)',
                    },
                    transition: 'all 0.3s ease',
                  }}
                  variant="contained"
                  href="/Sell"
                  startIcon={<VolunteerActivismIcon />}
                >
                  ຫາບ້ານໃໝ່ໃຫ້ສັດລ້ຽງ
                </Button>
              )}
              <Divider sx={{ mb: 2 }} />
              <FilterComponent 
                onApplyFilters={handleApplyFilters}
                onFilterStateChange={handleFilterStateChange}
              />
            </Paper>
          </Grid>
        )}

        {/* Pet Cards Column */}
        <Grid item xs={12} md={showFilters ? 9 : 12}>
          {isLoadingPets && !isInitialLoad ? (
            <Box sx={{ width: '100%' }}>
              <Grid container spacing={3}>
                {[1, 2, 3, 4, 5, 6].map((skeleton) => (
                  <Grid item xs={12} sm={6} md={4} key={`skeleton-${skeleton}`}>
                    <PetCardSkeleton />
                  </Grid>
                ))}
              </Grid>
            </Box>
          ) : displayedPets && displayedPets.length > 0 ? (
            <Grid container spacing={3}>
              {displayedPets.map((pet, index) => (
                <Grid
                  item
                  xs={12}
                  sm={6}
                  md={4}
                  key={pet.id}
                >
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
                          src={pet?.images[0]}
                          alt={pet?.petName}
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
                        
                        <IconButton
                          size="medium"
                          onClick={() => handleFavoriteToggle(pet.id)}
                          disabled={isLoading[pet.id]}
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
                          {isLoading[pet.id] ? (
                            <CircularProgress size={20} />
                          ) : isPetFavorited(pet.id) ? (
                            <FavoriteIcon fontSize="small" sx={{ color: '#ff3d71' }} />
                          ) : (
                            <FavoriteBorderIcon fontSize="small" />
                          )}
                        </IconButton>
                      </Box>

                      <CardContent sx={{ p: 3, flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                        <Typography
                          variant="h6"
                          fontWeight={600}
                          sx={{ mb: 1.5 }}
                        >
                          {pet?.petName}
                        </Typography>

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
                                {pet?.gender === Gender.MALE ? (
                                  <MaleIcon sx={{ color: "#5b8def", fontSize: 16 }} />
                                ) : pet?.gender === Gender.FEMALE ? (
                                  <FemaleIcon sx={{ color: "#ff6b95", fontSize: 16 }} />
                                ) : (
                                  <HelpOutlineIcon sx={{ color: "gray", fontSize: 16 }} />
                                )}
                                <Typography variant="caption" fontWeight={500}>
                                  {pet?.gender}
                                </Typography>
                              </Box>
                            }
                            sx={{
                              height: 28,
                              borderRadius: 4,
                              backgroundColor: pet?.gender === Gender.MALE ? 
                                'rgba(91, 141, 239, 0.1)' : 
                                pet?.gender === Gender.FEMALE ? 
                                'rgba(255, 107, 149, 0.1)' : 
                                'rgba(180, 180, 180, 0.1)',
                              border: pet?.gender === Gender.MALE ? 
                                '1px solid rgba(91, 141, 239, 0.2)' : 
                                pet?.gender === Gender.FEMALE ? 
                                '1px solid rgba(255, 107, 149, 0.2)' : 
                                '1px solid rgba(180, 180, 180, 0.2)',
                              '& .MuiChip-label': { px: 1 },
                            }}
                          />

                          {/* Age */}
                          <Chip
                            size="small"
                            label={
                              <Typography variant="caption" fontWeight={500}>
                                {pet?.yearAge} {pet?.yearAge > 1 ? "years" : "year"}
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
                                {pet?.breed?.breedName}
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
                                {pet?.size || "Small"}
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
                          {pet?.bio ||
                            "This pet is looking for a loving home. They would make a wonderful companion!"}
                        </Typography>

                        {/* More Info Button */}
                        <Button
                          fullWidth
                          onClick={() => ctrl?.handleNaVigate(`/adopt-detail/${pet.id}`)}
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
                          ທຳຄວາມຮູ້ຈັກ {pet?.petName}
                        </Button>
                      </CardContent>
                    </Card>
                  </motion.div>
                </Grid>
              ))}
            </Grid>
          ) : (
            <Paper
              elevation={0}
              sx={{
                borderRadius: 3,
                p: 6,
                textAlign: 'center',
                border: '1px dashed #e0e0e0',
                bgcolor: '#fafafa',
              }}
            >
              <Typography variant="h6" color="text.secondary" gutterBottom>
                {hasActiveFilters ? "No pets match your current filters" : "ບໍ່ພົບສັດລ້ຽງໃນລະບົບ"}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                {hasActiveFilters 
                  ? "Try adjusting your filters to see more results" 
                  : "ລອງປັບຕົວກອງຂອງທ່ານ ຫຼື ກັບມາເບິ່ງໃໝ່ໃນພາຍຫຼັງສຳລັບສັດໃໝ່"
                }
              </Typography>
              {hasActiveFilters ? (
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleClearAllFilters}
                  sx={{ mr: 2 }}
                >
                  Clear All Filters
                </Button>
              ) : (
                <Button
                  variant="outlined"
                  color="primary"
                  onClick={handleRefreshPets}
                >
                  Refresh
                </Button>
              )}
            </Paper>
          )}
        </Grid>
      </Grid>
      
      <Snackbar 
        open={notification.open} 
        autoHideDuration={4000} 
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

export default PetAdoptionPage;