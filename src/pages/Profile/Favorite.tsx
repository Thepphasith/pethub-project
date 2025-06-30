import React, { useEffect, useState, useCallback } from "react";
import {
  Box,
  Typography,
  IconButton,
  Grid,
  Container,
  CircularProgress,
  Skeleton,
  Chip,
  Card,
  CardContent,
  CardMedia,
  Alert,
  Snackbar,
  Fade,
  useTheme,
  Tabs,
  Tab,
  Button,
  Paper,
} from "@mui/material";
import DeleteOutlineRoundedIcon from "@mui/icons-material/DeleteOutlineRounded";
import MaleRoundedIcon from "@mui/icons-material/MaleRounded";
import FemaleRoundedIcon from "@mui/icons-material/FemaleRounded";
import HelpOutlineRoundedIcon from "@mui/icons-material/HelpOutlineRounded";
import PetsRoundedIcon from "@mui/icons-material/PetsRounded";
import FavoriteIcon from "@mui/icons-material/Favorite";
import AutoStoriesIcon from "@mui/icons-material/AutoStories";
import HomeIcon from "@mui/icons-material/Home";
import BookmarkIcon from "@mui/icons-material/Bookmark";
import NavigateNextIcon from "@mui/icons-material/NavigateNext";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Gender } from "../../enums/gender";
import axiosInstance from "../../configs/axios";

// Interfaces for type definitions
interface PetModel {
  id: string;
  petName: string;
  gender: Gender;
  breedId: string;
  price: number;
  yearAge: number;
  monthAge: number;
  color: string;
  bio: string;
  images?: string[];
  petType?: string;
  size?: string;
  breed?: {
    breedName: string;
  };
}

interface BlogPostModel {
  id: string;
  title: string;
  body: string;
  images?: string[];
  user?: {
    firstName: string;
    lastName: string;
    username?: string;
  };
  createdAt: string;
}

// Styled components using motion
const MotionContainer = motion(Container);
const MotionGrid = motion(Grid);
const MotionCard = motion(Card);

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

// PetCard component to display pet information
const PetCard = ({ pet, onRemove, isDeleting, index }) => {
  const theme = useTheme();

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
            src={pet?.images?.[0] || "/api/placeholder/300/220"}
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
            onClick={() => onRemove(pet.id, pet.petName)}
            disabled={isDeleting}
            sx={{
              position: "absolute",
              right: 12,
              top: 12,
              backgroundColor: "rgba(255,255,255,0.9)",
              "&:hover": {
                backgroundColor: theme.palette.error.light,
                color: "white",
                transform: "scale(1.1)",
              },
              width: 40,
              height: 40,
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
              transition: 'all 0.2s ease',
            }}
          >
            {isDeleting ? (
              <CircularProgress size={20} color="error" />
            ) : (
              <DeleteOutlineRoundedIcon fontSize="small" />
            )}
          </IconButton>
          
          {/* Price badge */}
          {pet.price !== undefined && (
            <Chip
              label={pet.price > 0 ? `$${pet.price.toLocaleString()}` : "Free"}
              size="small"
              sx={{
                position: "absolute",
                left: 12,
                top: 12,
                fontWeight: 600,
                backgroundColor: pet.price > 0
                  ? "rgba(255,255,255,0.9)"
                  : theme.palette.success.light,
                color: pet.price > 0
                  ? theme.palette.text.primary
                  : "white",
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
              }}
            />
          )}
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
                    <MaleRoundedIcon sx={{ color: "#5b8def", fontSize: 16 }} />
                  ) : pet?.gender === Gender.FEMALE ? (
                    <FemaleRoundedIcon sx={{ color: "#ff6b95", fontSize: 16 }} />
                  ) : (
                    <HelpOutlineRoundedIcon sx={{ color: "gray", fontSize: 16 }} />
                  )}
                  <Typography variant="caption" fontWeight={500}>
                    {pet?.gender === Gender.MALE ? "MALE" : "FEMALE"}
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
                  {pet?.yearAge > 0 && `${pet?.yearAge} ${pet?.yearAge > 1 ? "years" : "year"}`}
                  {pet?.yearAge > 0 && pet?.monthAge > 0 && ", "}
                  {pet?.monthAge > 0 && `${pet?.monthAge} ${pet?.monthAge > 1 ? "months" : "month"}`}
                  {!pet?.yearAge && !pet?.monthAge && "Unknown"}
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
                  {pet?.breed?.breedName || pet?.breedId || "Unknown"}
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
            {pet?.size && (
              <Chip
                size="small"
                label={
                  <Typography variant="caption" fontWeight={500}>
                    {pet?.size}
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
            )}
            
            {/* Color */}
            <Chip
              size="small"
              label={
                <Typography variant="caption" fontWeight={500}>
                  {pet?.color || "Unknown"}
                </Typography>
              }
              sx={{
                height: 28,
                borderRadius: 4,
                backgroundColor: 'rgba(230, 126, 34, 0.1)',
                border: '1px solid rgba(230, 126, 34, 0.2)',
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
            {pet?.bio || `${pet?.petName} is a lovable pet looking for a forever home.`}
          </Typography>

          {/* More Info Button */}
          <Button
            fullWidth
            component={Link}
            to={`/adopt-detail/${pet.id}`}
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
  );
};

// PetCardSkeleton component
const PetCardSkeleton = () => {
  return (
    <Card
      sx={{
        borderRadius: 3,
        height: '100%',
        boxShadow: '0 8px 24px rgba(149, 157, 165, 0.1)',
        overflow: 'hidden',
      }}
    >
      <Skeleton variant="rectangular" height={220} animation="wave" />
      <CardContent sx={{ p: 3 }}>
        <Skeleton variant="text" width="60%" height={32} animation="wave" />
        <Box 
          display="flex" 
          flexWrap="wrap" 
          gap={1} 
          mb={2} 
          mt={2}
        >
          {[1, 2, 3, 4].map((chip) => (
            <Skeleton 
              key={chip} 
              variant="rectangular" 
              width={60} 
              height={28} 
              animation="wave" 
              sx={{ borderRadius: 4 }} 
            />
          ))}
        </Box>
        <Skeleton variant="text" width="100%" height={20} animation="wave" />
        <Skeleton variant="text" width="100%" height={20} animation="wave" />
        <Skeleton variant="text" width="80%" height={20} animation="wave" />
        <Skeleton 
          variant="rectangular" 
          width="100%" 
          height={46} 
          animation="wave" 
          sx={{ borderRadius: 2, mt: 2 }} 
        />
      </CardContent>
    </Card>
  );
};

// Main FavoritesPage Component
const FavoritesPage = () => {
  const theme = useTheme();
  const [tabValue, setTabValue] = useState(0);

  // Pet favorites state
  const [favoritePets, setFavoritePets] = useState<PetModel[]>([]);
  const [isPetLoading, setIsPetLoading] = useState(true);
  const [isPetDeleting, setIsPetDeleting] = useState<{
    [key: string]: boolean;
  }>({});
  const [petError, setPetError] = useState<string | null>(null);

  // Blog favorites state
  const [favoriteBlogs, setFavoriteBlogs] = useState<BlogPostModel[]>([]);
  const [isBlogLoading, setIsBlogLoading] = useState(true);
  const [isBlogDeleting, setIsBlogDeleting] = useState<{
    [key: string]: boolean;
  }>({});
  const [blogError, setBlogError] = useState<string | null>(null);
  const [selectedTag, setSelectedTag] = useState<string | null>(null);

  // General state
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success" as "success" | "error",
  });

  // Handle closing snackbar
  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  // Truncate text helper
  const truncateText = (text: string, maxLength: number) => {
    if (!text) return "";
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + "...";
  };

  // Format date helper
  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = {
      year: "numeric",
      month: "short",
      day: "numeric",
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Check if item is a pet with more complete checking
  const isPet = (item: any): item is PetModel => {
    return (
      item && 
      typeof item.petName === 'string' && 
      item.gender !== undefined && 
      typeof item.id === 'string'
    );
  };

  // Check if item is a blog
  const isBlog = (item: any): item is BlogPostModel => {
    return item && item.title !== undefined && item.body !== undefined;
  };

  // Process pet data to ensure it has all required fields
  const processPetData = (pet: any): PetModel => {
    return {
      id: pet.id || '',
      petName: pet.petName || '',
      gender: pet.gender !== undefined ? pet.gender : Gender.MALE,
      breedId: pet.breedId || '',
      breed: pet.breed || { breedName: pet.breedId ? 'Unknown' : '' },
      price: pet.price !== undefined ? pet.price : 0,
      yearAge: pet.yearAge !== undefined ? pet.yearAge : 0,
      monthAge: pet.monthAge !== undefined ? pet.monthAge : 0,
      color: pet.color || '',
      bio: pet.bio || '',
      images: pet.images || [],
      petType: pet.petType || '',
      size: pet.size || '',
    };
  };

  // Fetch favorites implementation
  const fetchFavorites = useCallback(async () => {
    try {
      setIsPetLoading(true);
      setIsBlogLoading(true);
      setPetError(null);
      setBlogError(null);

      const favoriteResponse = await axiosInstance.get("/favorite");

      if (
        favoriteResponse.data &&
        favoriteResponse.data.data &&
        Array.isArray(favoriteResponse.data.data) &&
        favoriteResponse.data.data.length > 0
      ) {
        // Each favorite document has an array of items
        const allPets: PetModel[] = [];
        const allBlogs: BlogPostModel[] = [];

        // Process each favorite document
        favoriteResponse.data.data.forEach((favorite: any) => {
          if (favorite.items && Array.isArray(favorite.items)) {
            // Process each item in the items array
            favorite.items.forEach((item: any) => {
              if (isPet(item)) {
                // Process pet data to ensure it has all necessary fields
                allPets.push(processPetData(item));
              } else if (isBlog(item)) {
                allBlogs.push(item as BlogPostModel);
              }
            });
          }
        });

        setFavoritePets(allPets);
        setFavoriteBlogs(allBlogs);
      } else {
        // Empty or invalid response
        setFavoritePets([]);
        setFavoriteBlogs([]);
      }
    } catch (error) {
      console.error("Error fetching favorites:", error);
      setPetError("ບໍ່ສາມາດໂຫລດສັດລ້ຽງທີ່ທ່ານມັກໄດ້. ກະລຸນາລອງໃໝ່ອີກຄັ້ງ.");
      setBlogError(
        "ບໍ່ສາມາດໂຫລດບົດຄວາມ blog ທີ່ທ່ານມັກໄດ້. ກະລຸນາລອງໃໝ່ອີກຄັ້ງ."
      );
    } finally {
      setIsPetLoading(false);
      setIsBlogLoading(false);
    }
  }, []);

  // Function to remove a pet from favorites
  const handleRemovePetFavorite = async (petId: string, petName: string) => {
    try {
      setIsPetDeleting((prev) => ({ ...prev, [petId]: true }));

      // Find the favorite document that contains this pet
      const response = await axiosInstance.delete("/favorite/delete", {
        data: { itemId: petId },
      });

      if (response.data.success || response.status === 200) {
        setFavoritePets((prev) => prev.filter((pet) => pet.id !== petId));
        setSnackbar({
          open: true,
          message: `${petName} removed from favorites`,
          severity: "success",
        });
      } else {
        throw new Error("Failed to remove from favorites");
      }
    } catch (error) {
      console.error("Error removing favorite:", error);
      setSnackbar({
        open: true,
        message: `Unable to remove ${petName} from favorites`,
        severity: "error",
      });
    } finally {
      setIsPetDeleting((prev) => ({ ...prev, [petId]: false }));
    }
  };

  // Function to remove a blog from favorites
  const handleRemoveBlogFavorite = async (
    blogId: string,
    blogTitle: string = "Blog post"
  ) => {
    try {
      setIsBlogDeleting((prev) => ({ ...prev, [blogId]: true }));

      // Call the delete endpoint
      const response = await axiosInstance.delete("/favorite/delete", {
        data: { itemId: blogId },
      });

      if (response.data.success || response.status === 200) {
        // Update UI by removing the blog from the list
        setFavoriteBlogs((prev) => prev.filter((blog) => blog.id !== blogId));

        setSnackbar({
          open: true,
          message: `"${blogTitle}" removed from favorites`,
          severity: "success",
        });
      } else {
        throw new Error("Failed to remove from favorites");
      }
    } catch (error) {
      console.error("Error removing blog favorite:", error);
      setSnackbar({
        open: true,
        message: "Unable to remove blog from favorites",
        severity: "error",
      });
    } finally {
      setIsBlogDeleting((prev) => ({ ...prev, [blogId]: false }));
    }
  };

  // Filter blogs by selected tag
  const getFilteredBlogs = useCallback(() => {
    if (!selectedTag) return favoriteBlogs;

    return favoriteBlogs.filter(
      (blog) =>
        blog.title &&
        (typeof blog.title === "string" && blog.title.includes(selectedTag))
    );
  }, [favoriteBlogs, selectedTag]);

  // Handle tab change
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  // Load data when component mounts
  useEffect(() => {
    fetchFavorites();
  }, [fetchFavorites]);

  const filteredBlogs = getFilteredBlogs();

  return (
    <MotionContainer
      maxWidth="lg"
      sx={{ mt: 4, mb: 8, px: { xs: 2, sm: 3 } }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Page Header */}
      <Box
        sx={{
          position: "relative",
          mb: 4,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <Box
          sx={{
            width: "80px",
            height: "4px",
            bgcolor: "#9990DA",
            mb: 2,
          }}
        />
        <Typography
          variant="h4"
          component="h1"
          align="center"
          fontWeight="700"
          sx={{ mb: 1 }}
        >
          ລາຍການທີ່ຖືກໃຈ
        </Typography>
        <Typography
          variant="subtitle1"
          align="center"
          color="text.secondary"
          sx={{ mb: 2, maxWidth: "600px" }}
        >
          ຈັດການສັດລ້ຽງໂຕໂປດ ແລະ ບົດຄວາມຂອງທ່ານໄດ້ໃນບ່ອນດຽວ
        </Typography>
        <FavoriteIcon sx={{ color: "#9990DA", fontSize: 28, mb: 2 }} />
      </Box>

      {/* Tab Navigation */}
      <Paper
        elevation={0}
        sx={{
          borderRadius: 3,
          boxShadow: "0 8px 24px rgba(0,0,0,0.05)",
          border: `1px solid ${theme.palette.divider}`,
          overflow: "hidden",
          mb: 4,
        }}
      >
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          variant="fullWidth"
          sx={{
            borderBottom: `1px solid ${theme.palette.divider}`,
            "& .MuiTab-root": {
              textTransform: "none",
              fontSize: "1rem",
              fontWeight: 600,
              py: 2,
            },
            "& .Mui-selected": {
              color: "#9990DA !important",
            },
            "& .MuiTabs-indicator": {
              backgroundColor: "#9990DA",
            },
          }}
        >
          <Tab
            label="ລາຍການສັດລ້ຽງທີ່ຖືກໃຈ"
            icon={<PetsRoundedIcon />}
            iconPosition="start"
          />
          <Tab
            label="ລາຍການບົດຄວາມທີ່ຖືກໃຈ"
            icon={<AutoStoriesIcon />}
            iconPosition="start"
          />
        </Tabs>
      </Paper>

      {/* Pet Favorites Tab */}
      {tabValue === 0 && (
        <>
          {petError && (
            <Alert
              severity="error"
              sx={{
                mb: 3,
                borderRadius: 2,
                boxShadow: "0 2px 10px rgba(0,0,0,0.08)",
              }}
              onClose={() => setPetError(null)}
            >
              {petError}
            </Alert>
          )}

          {isPetLoading ? (
            <Box sx={{ width: '100%' }}>
              <Grid container spacing={3}>
                {[1, 2, 3, 4, 5, 6].map((skeleton) => (
                  <Grid item xs={12} sm={6} md={4} key={`skeleton-${skeleton}`}>
                    <PetCardSkeleton />
                  </Grid>
                ))}
              </Grid>
            </Box>
          ) : favoritePets.length === 0 ? (
            <Box
              sx={{
                textAlign: "center",
                py: 8,
                px: 2,
                backgroundColor: theme.palette.background.paper,
                borderRadius: 4,
                boxShadow: "0 4px 20px rgba(0,0,0,0.03)",
                border: `1px solid ${theme.palette.divider}`,
              }}
            >
              <PetsRoundedIcon
                sx={{
                  fontSize: 70,
                  color: "#9990DA",
                  opacity: 0.4,
                  mb: 2,
                }}
              />
              <Typography variant="h6" sx={{ mb: 1, fontWeight: 600 }}>
                ຍັງບໍ່ມີລາຍການທີ່ຖືກໃຈ
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                ເລີ່ມເພີ່ມສັດລ້ຽງທີ່ທ່ານມັກເຂົ້າໃນລາຍການໂປດຂອງທ່ານໄດ້ເລີຍ!
              </Typography>
              <Button
                variant="contained"
                component={Link}
                to="/pet"
                startIcon={<HomeIcon />}
                sx={{
                  textTransform: "none",
                  px: 4,
                  py: 1.5,
                  fontSize: "1rem",
                  fontWeight: 600,
                  color: "white",
                  background: 'linear-gradient(90deg, #9990DA 0%, #7B68EE 100%)',
                  borderRadius: 6,
                  boxShadow: "0 8px 16px rgba(153, 144, 218, 0.2)",
                  "&:hover": {
                    background: 'linear-gradient(90deg, #8a82c8 0%, #6f5ee0 100%)',
                    transform: "translateY(-2px)",
                    boxShadow: "0 10px 20px rgba(153, 144, 218, 0.3)",
                    transition: "all 0.3s ease",
                  },
                }}
              >
                ເບິ່ງສັດລ້ຽງ
              </Button>
            </Box>
          ) : (
            <Grid container spacing={3}>
              {favoritePets.map((pet, index) => (
                <Grid
                  item
                  xs={12}
                  sm={6}
                  md={4}
                  key={pet.id}
                >
                  <PetCard 
                    pet={pet} 
                    onRemove={handleRemovePetFavorite} 
                    isDeleting={isPetDeleting[pet.id]}
                    index={index}
                  />
                </Grid>
              ))}
            </Grid>
          )}
        </>
      )}

      {/* Blog Favorites Tab */}
      {tabValue === 1 && (
        <>
          {blogError && (
            <Alert
              severity="error"
              sx={{
                mb: 3,
                borderRadius: 2,
                boxShadow: "0 2px 10px rgba(0,0,0,0.08)",
              }}
              onClose={() => setBlogError(null)}
            >
              {blogError}
            </Alert>
          )}

          {isBlogLoading ? (
            <Grid container spacing={3}>
              {[1, 2, 3].map((skeleton) => (
                <Grid item xs={12} key={`blog-skeleton-${skeleton}`}>
                  <Card
                    sx={{
                      display: "flex",
                      flexDirection: { xs: "column", sm: "row" },
                      borderRadius: 3,
                      height: "100%",
                      boxShadow: "0 8px 24px rgba(0,0,0,0.05)",
                      overflow: "hidden",
                      mb: 2,
                    }}
                  >
                    <Skeleton variant="rectangular" width={220} height={180} animation="wave" />
                    <CardContent sx={{ flex: "1 0 auto", p: 3, width: "100%" }}>
                      <Skeleton variant="text" width="60%" height={32} animation="wave" />
                      <Skeleton variant="text" width="90%" animation="wave" sx={{ mt: 1 }} />
                      <Skeleton variant="text" width="90%" animation="wave" />
                      <Skeleton variant="text" width="40%" animation="wave" sx={{ mt: 2 }} />
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          ) : favoriteBlogs.length === 0 ? (
            <Box
              sx={{
                textAlign: "center",
                py: 8,
                px: 2,
                backgroundColor: theme.palette.background.paper,
                borderRadius: 4,
                boxShadow: "0 4px 20px rgba(0,0,0,0.03)",
                border: `1px solid ${theme.palette.divider}`,
              }}
            >
              <BookmarkIcon
                sx={{
                  fontSize: 70,
                  color: "#9990DA",
                  opacity: 0.4,
                  mb: 2,
                }}
              />
              <Typography variant="h6" sx={{ mb: 1, fontWeight: 600 }}>
                ຍັງບໍ່ມີບົດຄວາມທີ່ຖືກໃຈ
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                ບັນທຶກບົດຄວາມທີ່ທ່ານຕ້ອງການອ່ານທີຫຼັງຫຼືອ້າງອີງໃນພາຍຫຼັງ!
              </Typography>
              <Button
                variant="contained"
                component={Link}
                to="/blog"
                startIcon={<AutoStoriesIcon />}
                sx={{
                  textTransform: "none",
                  px: 4,
                  py: 1.5,
                  fontSize: "1rem",
                  fontWeight: 600,
                  color: "white",
                  background: 'linear-gradient(90deg, #9990DA 0%, #7B68EE 100%)',
                  borderRadius: 6,
                  boxShadow: "0 8px 16px rgba(153, 144, 218, 0.2)",
                  "&:hover": {
                    background: 'linear-gradient(90deg, #8a82c8 0%, #6f5ee0 100%)',
                    transform: "translateY(-2px)",
                    boxShadow: "0 10px 20px rgba(153, 144, 218, 0.3)",
                    transition: "all 0.3s ease",
                  },
                }}
              >
                ເບິ່ງບົດຄວາມ
              </Button>
            </Box>
          ) : (
            <>
              <Typography
                variant="h5"
                fontWeight={600}
                sx={{ mb: 3, color: "#9990DA" }}
              >
                ບົດຄວາມທີ່ທ່ານຖືກໃຈ {selectedTag && `- ${selectedTag}`}
                <Typography
                  component="span"
                  color="text.secondary"
                  sx={{ ml: 1, fontSize: "1rem" }}
                >
                  ({filteredBlogs.length})
                </Typography>
              </Typography>

              <Grid container spacing={3}>
                {filteredBlogs.map((blog, index) => (
                  <Grid
                    item
                    xs={12}
                    key={blog.id}
                  >
                    <motion.div
                      variants={cardVariants}
                      initial="hidden"
                      animate="visible"
                      custom={index}
                      whileHover={{ y: -4, transition: { duration: 0.2 } }}
                    >
                      <Card
                        sx={{
                          display: "flex",
                          flexDirection: { xs: "column", sm: "row" },
                          borderRadius: 3,
                          overflow: "hidden",
                          boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
                          transition: "all 0.3s ease",
                          '&:hover': {
                            boxShadow: "0 8px 24px rgba(0,0,0,0.1)",
                          },
                        }}
                      >
                        {blog.images && blog.images.length > 0 && (
                          <CardMedia
                            component="img"
                            sx={{
                              width: { xs: "100%", sm: 220 },
                              height: { xs: 200, sm: "auto" },
                              objectFit: "cover",
                            }}
                            image={blog.images[0]}
                            alt={typeof blog.title === "string" ? blog.title : "Blog post"}
                          />
                        )}
                        <CardContent sx={{ flex: "1 0 auto", p: 3, width: "auto" }}>
                          <Box sx={{ display: "flex", flexDirection: "column", height: "100%" }}>
                            <Box
                              sx={{
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "flex-start",
                                mb: 1,
                              }}
                            >
                              <Typography variant="h6" component="h2" fontWeight="600">
                                {blog.title}
                              </Typography>
                              <IconButton
                                onClick={() =>
                                  handleRemoveBlogFavorite(
                                    blog.id,
                                    typeof blog.title === "string" ? blog.title : "Blog post"
                                  )
                                }
                                disabled={isBlogDeleting[blog.id]}
                                sx={{
                                  color: "#9990DA",
                                  "&:hover": {
                                    bgcolor: theme.palette.error.light + "20",
                                    color: theme.palette.error.main,
                                  },
                                }}
                              >
                                {isBlogDeleting[blog.id] ? (
                                  <CircularProgress size={20} sx={{ color: "#9990DA" }} />
                                ) : (
                                  <DeleteOutlineRoundedIcon />
                                )}
                              </IconButton>
                            </Box>
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                              {truncateText(blog.body, 200)}
                            </Typography>

                            {/* Author info if available */}
                            {blog.user && (
                              <Box sx={{ mb: 2, display: "flex", alignItems: "center" }}>
                                <Typography variant="body2" color="text.secondary">
                                  By {blog.user.firstName} {blog.user.lastName}
                                  {blog.user.username && ` (@${blog.user.username})`}
                                </Typography>
                              </Box>
                            )}

                            <Box sx={{ mt: "auto", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                              <Typography variant="caption" color="text.secondary">
                                Saved on: {formatDate(blog.createdAt)}
                              </Typography>
                              <Button
                                variant="text"
                                size="small"
                                component={Link}
                                to={`/blog/${blog.id}`}
                                endIcon={<NavigateNextIcon />}
                                sx={{
                                  color: "#9990DA",
                                  fontWeight: 600,
                                  "&:hover": {
                                    backgroundColor: "rgba(153, 144, 218, 0.08)",
                                  },
                                }}
                              >
                                ອ່ານເພີ່ມເຕີມ
                              </Button>
                            </Box>
                          </Box>
                        </CardContent>
                      </Card>
                    </motion.div>
                  </Grid>
                ))}
              </Grid>

              {/* Show when no results after filtering */}
              {filteredBlogs.length === 0 && selectedTag && (
                <Box sx={{ textAlign: "center", py: 4 }}>
                  <Typography variant="body1" color="text.secondary">
                    ບໍ່ພົບບົດຄວາມທີ່ມີເເທັກ "{selectedTag}".
                  </Typography>
                  <Button
                    variant="text"
                    onClick={() => setSelectedTag(null)}
                    sx={{ mt: 2, color: '#9990DA' }}
                  >
                    ລຶບການກັ່ນຕອງ
                  </Button>
                </Box>
              )}
            </>
          )}
        </>
      )}

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        TransitionComponent={Fade}
        anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          sx={{ width: "100%", borderRadius: 2 }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </MotionContainer>
  );
};

export default FavoritesPage;