import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Container,
  Grid,
  Paper,
  ThemeProvider,
  Box,
  createTheme,
  CircularProgress,
  Alert,
  Typography,
  Divider,
  Avatar,
  Button,
  Tabs,
  Tab,
  Card,
  CardContent,
  CardMedia,
  Chip,
  IconButton
} from "@mui/material";
import {
  Person,
  Pets,
  LocationOn,
  Email,
  Phone,
  FavoriteOutlined,
  MoreVert
} from "@mui/icons-material";
import axiosInstance from "../../../configs/axios";

// Define theme with custom colors
const theme = createTheme({
  palette: {
    primary: {
      main: "#7B68EE", // Medium slate blue
    },
    secondary: {
      main: "#FF7F50", // Coral
    },
    background: {
      default: "#f8f9fa",
    },
  },
  typography: {
    fontFamily: '"Poppins", "Roboto", "Helvetica", "Arial", sans-serif',
    h4: {
      fontWeight: 600,
    }
  },
  components: {
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 12,
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          textTransform: "none",
          fontWeight: 600,
        },
      },
    },
  },
});

// Interfaces
interface UserModel {
  id: string;
  username: string;
  firstName: string;
  lastName: string;
  email: string;
  tel: string;
  city: string;
  village: string;
  gender: string;
  DOB: string;
  avatar: string;
  bio: string;
}

interface Pet {
  id: string;
  name: string;
  species: string;
  breed: string;
  age: string; // Changed to string to handle formatted age like "2 years, 2 months"
  image: string;
  description: string;
}

interface Blog {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  publishDate: string;
  image: string;
  tags: string[];
}

interface ProfileData {
  name: string;
  location: string;
  age: string;
  bio: string[];
  email: string;
  phone: string;
  avatar: string;
  city: string;
  village: string;
  DOB: string;
  username: string;
  gender: string; 
}

// Tab panel component
function TabPanel(props: { children?: React.ReactNode; index: number; value: number }) {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`profile-tabpanel-${index}`}
      aria-labelledby={`profile-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  );
}

// Utility functions
const calculateAge = (dateOfBirth: string): string => {
  if (!dateOfBirth || dateOfBirth === "Not specified") return "Not specified";
  
  try {
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return age.toString();
  } catch (error) {
    return "Not specified";
  }
};

const formatDate = (dateString: string): string => {
  if (!dateString || dateString === "Not specified") return "Not specified";
  
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  } catch (error) {
    return "Not specified";
  }
};

const getTimeAgo = (timestamp: string): string => {
  try {
    const now = new Date();
    const pastDate = new Date(timestamp);
    const diffMs = now.getTime() - pastDate.getTime();

    const diffSecs = Math.floor(diffMs / 1000);
    if (diffSecs < 60) return `${diffSecs}s ago`;

    const diffMins = Math.floor(diffSecs / 60);
    if (diffMins < 60) return `${diffMins}m ago`;

    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;

    const diffDays = Math.floor(diffHours / 24);
    if (diffDays < 7) return `${diffDays}d ago`;

    return formatDate(timestamp);
  } catch (err) {
    return "Unknown time";
  }
};

// Profile Content Component (exactly like second image)
const ProfileContent = ({ profileData }: { profileData: ProfileData }) => {
  return (
    <Paper elevation={1} sx={{ p: 3, mb: 3, borderRadius: 4, bgcolor: 'white' }}>
      {/* Header Section */}
      <Box display="flex" alignItems="flex-start" mb={3}>
        <Avatar
          src={profileData.avatar}
          alt={profileData.name}
          sx={{ 
            width: 60, 
            height: 60, 
            mr: 2,
            border: "2px solid #f0f0f0"
          }}
        />
        <Box flex={1}>
          <Typography variant="h6" fontWeight={600} sx={{ mb: 0.5 }}>
            {profileData.name}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {profileData.city}
          </Typography>
        </Box>
      </Box>

      {/* Bio Section */}
      <Typography variant="body1" sx={{ mb: 3, lineHeight: 1.6 }}>
        {profileData.bio.join(' ')}
      </Typography>

      <Divider sx={{ my: 3 }} />

      {/* Contact Information */}
      <Grid container spacing={2}>
        <Grid item xs={12} md={6}>
          <Box display="flex" alignItems="center" mb={1}>
            <Email fontSize="small" color="action" sx={{ mr: 1 }} />
            <Typography variant="body2" color="text.secondary">
              {profileData.email}
            </Typography>
          </Box>
          <Box display="flex" alignItems="center">
            <LocationOn fontSize="small" color="action" sx={{ mr: 1 }} />
            <Typography variant="body2" color="text.secondary">
              {profileData.city}{profileData.village && `, ${profileData.village}`}
            </Typography>
          </Box>
        </Grid>
        <Grid item xs={12} md={6}>
          <Box display="flex" alignItems="center">
            <Phone fontSize="small" color="action" sx={{ mr: 1 }} />
            <Typography variant="body2" color="text.secondary">
              {profileData.phone}
            </Typography>
          </Box>
        </Grid>
      </Grid>
    </Paper>
  );
};

// Blog Post Card Component (like second image style)
const BlogPostCard = ({ blog, profileData }: { blog: Blog; profileData: ProfileData }) => {
  return (
    <Paper elevation={1} sx={{ mb: 3, borderRadius: 3, overflow: 'hidden' }}>
      {/* Post Header */}
      <Box sx={{ p: 3, pb: 2 }}>
        <Box display="flex" alignItems="center" mb={2}>
          <Avatar
            src={profileData.avatar}
            alt={profileData.name}
            sx={{ width: 40, height: 40, mr: 2 }}
          />
          <Box flex={1}>
            <Typography variant="subtitle2" fontWeight={600}>
              {profileData.name}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              @{profileData.username}
            </Typography>
          </Box>
          <Typography variant="caption" color="text.secondary">
            {getTimeAgo(blog.publishDate)}
          </Typography>
        </Box>

        {/* Post Content */}
        <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
          {blog.title}
        </Typography>
        
        <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
          {blog.content || blog.excerpt}
        </Typography>
      </Box>

      {/* Post Image */}
      {blog.image && (
        <CardMedia
          component="img"
          image={blog.image}
          alt={blog.title}
          sx={{ maxHeight: 400, objectFit: 'cover' }}
        />
      )}

      {/* Post Footer */}
      <Box sx={{ p: 2 }}>

      </Box>
    </Paper>
  );
};

// Pet Card Component 
const PetCard = ({ pet }: { pet: Pet & { size?: string; color?: string; gender?: string; weight?: number; height?: number; price?: number } }) => {
  return (
    <Card sx={{ borderRadius: 3, transition: 'transform 0.2s', '&:hover': { transform: 'translateY(-4px)' } }}>
      <CardMedia
        component="img"
        height="200"
        image={pet.image || "https://via.placeholder.com/300x200?text=Pet+Photo"}
        alt={pet.name}
      />
      <CardContent>
        <Typography variant="h6" gutterBottom>
          {pet.name}
        </Typography>
        <Box display="flex" gap={1} mb={2} flexWrap="wrap">
          <Chip label={pet.species} size="small" color="primary" />
          <Chip label={pet.age} size="small" variant="outlined" />
          {pet.gender && (
            <Chip label={pet.gender} size="small" variant="outlined" color="secondary" />
          )}
        </Box>
        
        {pet.breed && (
          <Typography variant="body2" color="text.secondary" gutterBottom>
            {pet.breed}
          </Typography>
        )}
        
        <Typography variant="body2" sx={{ mb: 2 }}>
          {pet.description}
        </Typography>
        
        {/* Additional pet info */}
        {(pet.size || pet.color || pet.weight) && (
          <Box sx={{ mb: 2 }}>
            {pet.size && (
              <Typography variant="caption" display="block" color="text.secondary">
                Size: {pet.size}
              </Typography>
            )}
            {pet.color && (
              <Typography variant="caption" display="block" color="text.secondary">
                Color: {pet.color}
              </Typography>
            )}
            {pet.weight && (
              <Typography variant="caption" display="block" color="text.secondary">
                Weight: {pet.weight}kg
              </Typography>
            )}
          </Box>
        )}
        
        <Box display="flex" justifyContent="space-between" alignItems="center" mt={2}>
          <IconButton size="small" color="primary">
          </IconButton>
          <IconButton size="small">
          </IconButton>
        </Box>
      </CardContent>
    </Card>
  );
};

// Main Profile Page component
const UserProfilePage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [tabValue, setTabValue] = useState(0);
  const [profileData, setProfileData] = useState(null);
  const [pets, setPets] = useState([]);
  const [blogs, setBlogs] = useState([]);
  
  const [loading, setLoading] = useState({
    profile: true,
    pets: false,
    blogs: false
  });
  
  const [error, setError] = useState({
    profile: null,
    pets: null,
    blogs: null
  });

  console.log("User ID from URL:", id);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
    
    // Load blogs when switching to profile tab (if not already loaded)
    if (newValue === 0 && blogs.length === 0 && !loading.blogs) {
      fetchUserBlogs();
    }
    
    // Load pets when switching to pets tab (if not already loaded)
    if (newValue === 1 && pets.length === 0 && !loading.pets) {
      fetchUserPets();
    }
  };

  // Fetch user profile
  const fetchUserProfile = async () => {
    if (!id) return;
    
    setLoading(prev => ({ ...prev, profile: true }));
    setError(prev => ({ ...prev, profile: null }));
    
    try {
      console.log(`Fetching profile for user: ${id}`);
      const response = await axiosInstance.get(`/user/${id}`);
      
      console.log("Profile API Response:", response.data);
      
      const userData = response.data?.data || response.data;
      
      const processedData = {
        name: `${userData?.firstName || ''} ${userData?.lastName || ''}`.trim() || "Unknown User",
        location: `${userData?.city || ''}${userData?.village ? `, ${userData.village}` : ''}`.trim() || "Location not specified",
        age: calculateAge(userData?.DOB || ''),
        bio: userData?.bio ? userData.bio.split("\n").filter(p => p.trim()) : ["Hi, I'm A"],
        email: userData?.email || "Email not provided",
        city: userData?.city || "Not specified",
        village: userData?.village || "",
        phone: userData?.tel || userData?.phone || "Phone not provided",
        avatar: userData?.avatar || "/default-avatar.jpg",
        DOB: formatDate(userData?.DOB || ''),
        username: userData?.username || "Not specified",
        gender: userData?.gender || "Not specified",
      };
      
      console.log("Processed profile data:", processedData);
      setProfileData(processedData);
      
    } catch (err) {
      console.error("Error fetching profile:", err);
      setError(prev => ({ ...prev, profile: "Failed to load user profile" }));
    } finally {
      setLoading(prev => ({ ...prev, profile: false }));
    }
  };

  // Fetch user pets - with better field mapping
  const fetchUserPets = async () => {
    if (!id) return;
    
    setLoading(prev => ({ ...prev, pets: true }));
    setError(prev => ({ ...prev, pets: null }));
    
    try {
      console.log(`Fetching pets for user: ${id}`);
      const response = await axiosInstance.get(`/user/pet/${id}`);
      
      console.log("=== PETS DEBUG ===");
      console.log("Full Pets Response:", response);
      console.log("Response Data:", response.data);
      console.log("Response Status:", response.status);
      
      let petsData = [];
      
      // Handle different response structures
      if (Array.isArray(response.data)) {
        petsData = response.data;
      } else if (response.data?.data && Array.isArray(response.data.data)) {
        petsData = response.data.data;
      } else if (response.data?.pets && Array.isArray(response.data.pets)) {
        petsData = response.data.pets;
      } else if (response.data) {
        // If response.data is an object but not an array, wrap it
        petsData = [response.data];
      }
      
      console.log("Extracted pets array:", petsData);
      
      const mappedPets = petsData.map((pet, index) => {
        console.log(`Mapping pet ${index}:`, pet);
        
        // Use the correct field names from your API
        const name = pet?.petName || pet?.name || "Unnamed Pet";
        const species = pet?.petType || pet?.species || pet?.type || "Unknown Species";
        
        // For breed, we have breedId but need to fetch breed name separately
        // For now, we'll show a more user-friendly message
        let breed = "Breed Info Unavailable";
        if (pet?.breed) {
          breed = pet.breed;
        } else if (pet?.breedName) {
          breed = pet.breedName;
        } else if (pet?.breedId) {
          // You could make an API call here to get breed name by breedId
          // For now, we'll show a placeholder
          breed = "Mixed Breed";
        }
        
        // Calculate age from yearAge and monthAge
        let ageText = "Unknown Age";
        if (pet?.yearAge !== undefined || pet?.monthAge !== undefined) {
          const years = pet?.yearAge || 0;
          const months = pet?.monthAge || 0;
          
          if (years > 0 && months > 0) {
            ageText = `${years} years, ${months} months`;
          } else if (years > 0) {
            ageText = `${years} ${years === 1 ? 'year' : 'years'}`;
          } else if (months > 0) {
            ageText = `${months} ${months === 1 ? 'month' : 'months'}`;
          } else {
            ageText = "Less than 1 month";
          }
        }
        
        // Get first image from images array
        const image = pet?.images?.[0] || pet?.image || pet?.photo || null;
        
        // Use bio field for description
        const description = pet?.bio || pet?.description || "No description available";
        
        // Additional info we can show
        const additionalInfo = {
          size: pet?.size,
          color: pet?.color,
          gender: pet?.gender,
          weight: pet?.weight,
          height: pet?.height,
          price: pet?.price
        };
        
        console.log(`Mapped pet ${index}:`, { name, species, breed, ageText, image, description, additionalInfo });
        
        return {
          id: pet?.id || `pet-${index}`,
          name,
          species,
          breed, // This now uses the corrected breed logic
          age: ageText, // Use the formatted age text instead of number
          image,
          description,
          // Store additional pet info
          size: pet?.size,
          color: pet?.color,
          gender: pet?.gender,
          weight: pet?.weight,
          height: pet?.height,
          price: pet?.price
        };
      });
      
      console.log("Final mapped pets:", mappedPets);
      setPets(mappedPets);
      
    } catch (err) {
      console.error("Error fetching pets:", err);
      console.error("Error response:", err.response);
      setError(prev => ({ ...prev, pets: `Failed to load pets: ${err.response?.status || 'Network error'}` }));
    } finally {
      setLoading(prev => ({ ...prev, pets: false }));
    }
  };

  // Fetch user blogs
  const fetchUserBlogs = async () => {
    if (!id) return;
    
    setLoading(prev => ({ ...prev, blogs: true }));
    setError(prev => ({ ...prev, blogs: null }));
    
    try {
      console.log(`Fetching blogs for user: ${id}`);
      const response = await axiosInstance.get(`/user/blog/${id}`);
      
      console.log("=== BLOGS DEBUG ===");
      console.log("Full Blogs Response:", response);
      console.log("Response Data:", response.data);
      
      let blogsData = [];
      
      // Handle different response structures
      if (Array.isArray(response.data)) {
        blogsData = response.data;
      } else if (response.data?.data && Array.isArray(response.data.data)) {
        blogsData = response.data.data;
      } else if (response.data?.blogs && Array.isArray(response.data.blogs)) {
        blogsData = response.data.blogs;
      } else if (response.data) {
        blogsData = [response.data];
      }
      
      console.log("Extracted blogs array:", blogsData);
      
      // Log each blog object to see its structure
      blogsData.forEach((blog, index) => {
        console.log(`Blog ${index}:`, blog);
        console.log(`Blog ${index} keys:`, Object.keys(blog || {}));
      });
      
      const mappedBlogs = blogsData.map((blog, index) => {
        const title = blog?.title || blog?.blogTitle || blog?.heading || "Untitled Post";
        const content = blog?.content || blog?.body || blog?.text || blog?.description || "";
        const excerpt = blog?.excerpt || blog?.summary || (content.length > 150 ? content.substring(0, 150) + "..." : content) || "No excerpt available";
        const publishDate = blog?.publishDate || blog?.createdAt || blog?.created_at || blog?.datePosted || blog?.timestamp || new Date().toISOString();
        const image = blog?.image || blog?.featuredImage || blog?.thumbnail || blog?.photo || blog?.picture || blog?.images?.[0] || null;
        const tags = blog?.tags || blog?.categories || blog?.labels || [];
        
        return {
          id: blog?.id || blog?._id || `blog-${index}`,
          title,
          excerpt,
          content,
          publishDate,
          image,
          tags
        };
      });
      
      console.log("Final mapped blogs:", mappedBlogs);
      setBlogs(mappedBlogs);
      
    } catch (err) {
      console.error("Error fetching blogs:", err);
      console.error("Error response:", err.response);
      setError(prev => ({ ...prev, blogs: `Failed to load blogs: ${err.response?.status || 'Network error'}` }));
    } finally {
      setLoading(prev => ({ ...prev, blogs: false }));
    }
  };

  // Load profile and blogs on mount (for profile tab)
  useEffect(() => {
    if (id) {
      fetchUserProfile();
      fetchUserBlogs(); // Load blogs immediately for profile tab
    }
  }, [id]);

  if (!id) {
    return (
      <ThemeProvider theme={theme}>
        <Container maxWidth="lg" sx={{ py: 4 }}>
          <Alert severity="error">
            No user ID provided in URL
          </Alert>
        </Container>
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider theme={theme}>
      <Container maxWidth="lg" sx={{ py: 4 }}>
        
        <Grid container spacing={3}>
          {/* Tab navigation */}
          <Grid item xs={12}>
            <Paper elevation={1} sx={{ mb: 3, borderRadius: 4 }}>
              <Tabs
                value={tabValue}
                onChange={handleTabChange}
                variant="fullWidth"
                aria-label="profile navigation tabs"
              >
                <Tab label="ໂປຣໄຟລ" icon={<Person />} iconPosition="start" />
                <Tab label={`ສັດ (${pets.length})`} icon={<Pets />} iconPosition="start" />
              </Tabs>
            </Paper>
          </Grid>
          
          {/* Main Content */}
          <Grid item xs={12}>
            {/* Profile Tab - Contains Profile Info + Blogs (like second image) */}
            <TabPanel value={tabValue} index={0}>
              {loading.profile ? (
                <Paper elevation={1} sx={{ p: 5, textAlign: "center", borderRadius: 4 }}>
                  <CircularProgress size={60} thickness={4} />
                  <Box mt={3}>
                    <Typography variant="h6">Loading profile...</Typography>
                    <Typography variant="body2" color="text.secondary">
                      Please wait while we fetch the information
                    </Typography>
                  </Box>
                </Paper>
              ) : error.profile ? (
                <Paper elevation={1} sx={{ p: 4, borderRadius: 4 }}>
                  <Alert severity="error" sx={{ mb: 2 }}>
                    {error.profile}
                  </Alert>
                  <Button 
                    variant="contained"
                    onClick={fetchUserProfile}
                    sx={{ mt: 2 }}
                  >
                    Try Again
                  </Button>
                </Paper>
              ) : profileData ? (
                <>
                  <ProfileContent profileData={profileData} />
                  
                  {/* Blog Posts Section (like second image) */}
                  <Box>
                    {loading.blogs ? (
                      <Paper elevation={1} sx={{ p: 4, borderRadius: 4, textAlign: 'center' }}>
                        <CircularProgress size={40} thickness={4} />
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                          Loading blog posts...
                        </Typography>
                      </Paper>
                    ) : error.blogs ? (
                      <Paper elevation={1} sx={{ p: 4, borderRadius: 4 }}>
                        <Alert severity="error" sx={{ mb: 2 }}>
                          {error.blogs}
                        </Alert>
                        <Button 
                          variant="outlined" 
                          onClick={fetchUserBlogs} 
                          size="small"
                        >
                          Retry
                        </Button>
                      </Paper>
                    ) : blogs.length === 0 ? (
                      <Paper elevation={1} sx={{ p: 4, borderRadius: 4 }}>
                        <Alert severity="info">
                          This user hasn't published any blog posts yet.
                        </Alert>
                      </Paper>
                    ) : (
                      <Box>
                        {blogs.map((blog) => (
                          <BlogPostCard key={blog.id} blog={blog} profileData={profileData} />
                        ))}
                      </Box>
                    )}
                  </Box>
                </>
              ) : (
                <Paper elevation={1} sx={{ p: 4, borderRadius: 4 }}>
                  <Alert severity="warning">No profile data available</Alert>
                </Paper>
              )}
            </TabPanel>

            {/* Pets Tab - Contains Only Pets */}
            <TabPanel value={tabValue} index={1}>
              <Paper elevation={1} sx={{ p: 4, borderRadius: 4 }}>
                <Typography variant="h5" gutterBottom sx={{ fontWeight: 600, mb: 3 }}>
                  ສັັດ ({pets.length})
                </Typography>
                
                {loading.pets ? (
                  <Box display="flex" justifyContent="center" py={4}>
                    <CircularProgress size={60} thickness={4} />
                    <Box ml={2}>
                      <Typography variant="body2" color="text.secondary">
                        Loading pets...
                      </Typography>
                    </Box>
                  </Box>
                ) : error.pets ? (
                  <Alert severity="error" sx={{ mb: 2 }}>
                    {error.pets}
                    <Button 
                      variant="outlined" 
                      onClick={fetchUserPets} 
                      sx={{ mt: 2, ml: 2 }}
                      size="small"
                    >
                      Retry
                    </Button>
                  </Alert>
                ) : pets.length === 0 ? (
                  <Alert severity="info">
                    This user hasn't added any pets yet.
                  </Alert>
                ) : (
                  <Grid container spacing={3}>
                    {pets.map((pet) => (
                      <Grid item xs={12} sm={6} md={4} key={pet.id}>
                        <PetCard pet={pet} />
                      </Grid>
                    ))}
                  </Grid>
                )}
              </Paper>
            </TabPanel>
          </Grid>
        </Grid>
      </Container>
    </ThemeProvider>
  );
};

export default UserProfilePage;