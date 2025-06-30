import { useEffect, useState } from "react";
import {
  Box, 
  Typography,
  IconButton,
  Grid,
  CircularProgress,
  Skeleton,
  Card,
  CardContent,
  CardMedia,
  Alert,
  Button,
  useTheme,
} from "@mui/material";
import DeleteOutlineRoundedIcon from "@mui/icons-material/DeleteOutlineRounded";
import AutoStoriesIcon from "@mui/icons-material/AutoStories";
import BookmarkIcon from "@mui/icons-material/Bookmark";
import NavigateNextIcon from "@mui/icons-material/NavigateNext";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import axios from "axios";
import { BlogPostModel } from "../../models/blog";


// Styled components using motion
const MotionGrid = motion(Grid);
const MotionCard = motion(Card);

const BlogFavorites = () => {
  const theme = useTheme();
  
  // Blog favorites state
  const [favoriteBlogs, setFavoriteBlogs] = useState<BlogPostModel[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState<{[key: string]: boolean}>({});
  const [error, setError] = useState<string | null>(null);
  const [selectedTag, setSelectedTag] = useState<string | null>(null);

   const fetchFavoriteBlogs = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await axios.get('/favorite');

      if (response.data && Array.isArray(response.data)) {
        const blogFavorites = response.data.filter(
          (item: BlogPostModel) => item.title || item.body
        );
        setFavoriteBlogs(blogFavorites);
      } else {
        setFavoriteBlogs([]);
      }
    } catch (error) {
      console.error('Error fetching favorite blogs:', error);
      setError('Unable to load your favorite blog posts. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Format date helper
  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric'
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Truncate text helper
  const truncateText = (text: string, maxLength: number) => {
    if (!text) return '';
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  // Function to remove a blog from favorites
  const handleRemoveFavorite = async (blogId: string) => {
    try {
      setIsDeleting(prev => ({ ...prev, [blogId]: true }));
      
      // Call the delete endpoint
      await axios.delete('/favorite/delete', {
        data: { itemId: blogId }
      });
      
      // Update UI by removing the blog from the list
      setFavoriteBlogs(prev => prev.filter(blog => blog.id !== blogId));
      
    } catch (error) {
      console.error('Error removing blog favorite:', error);
    } finally {
      setIsDeleting(prev => ({ ...prev, [blogId]: false }));
    }
  };

  // Filter blogs by selected tag
  const getFilteredBlogs = () => {
    if (!selectedTag) return favoriteBlogs;
    
    return favoriteBlogs.filter(blog => 
      blog.title && Array.isArray(blog.title) && blog.title.includes(selectedTag)
    );
  };
  

  useEffect(() => {
    fetchFavoriteBlogs();
  }, []);

  // Card skeleton for loading state
  const renderSkeletons = () => {
    return Array(3).fill(0).map((_, index) => (
      <Grid item xs={12} key={`skeleton-${index}`}>
        <Card sx={{
          display: 'flex',
          flexDirection: { xs: 'column', sm: 'row' },
          borderRadius: 3,
          height: '100%',
          boxShadow: '0 8px 24px rgba(0,0,0,0.05)',
          overflow: 'hidden',
          mb: 2
        }}>
          <Skeleton variant="rectangular" width={220} height={180} animation="wave" />
          <CardContent sx={{ flex: '1 0 auto', p: 3, width: '100%' }}>
            <Skeleton variant="text" width="60%" height={32} animation="wave" />
            <Skeleton variant="text" width="90%" animation="wave" sx={{ mt: 1 }} />
            <Skeleton variant="text" width="90%" animation="wave" />
            <Skeleton variant="text" width="40%" animation="wave" sx={{ mt: 2 }} />
          </CardContent>
        </Card>
      </Grid>
    ));
  };

  const filteredBlogs = getFilteredBlogs();

  return (
    <>
      {error && (
        <Alert 
          severity="error" 
          sx={{ 
            mb: 3, 
            borderRadius: 2,
            boxShadow: '0 2px 10px rgba(0,0,0,0.08)'
          }}
          onClose={() => setError(null)}
        >
          {error}
        </Alert>
      )}
      
      {isLoading ? (
        <Grid container spacing={3}>
          {renderSkeletons()}
        </Grid>
      ) : favoriteBlogs.length === 0 ? (
        <Box 
          sx={{ 
            textAlign: 'center', 
            py: 8, 
            px: 2,
            backgroundColor: theme.palette.background.paper,
            borderRadius: 4,
            boxShadow: '0 4px 20px rgba(0,0,0,0.03)',
            border: `1px solid ${theme.palette.divider}`
          }}
        >
          <BookmarkIcon 
            sx={{ 
              fontSize: 70, 
              color: "#9990DA",
              opacity: 0.4,
              mb: 2
            }} 
          />
          <Typography variant="h6" sx={{ mb: 1, fontWeight: 600 }}>
            No favorite blog posts yet
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
            Bookmark posts you want to read later or refer to again!
          </Typography>
          <Button
            variant="contained"
            component={Link}
            to="/blog"
            startIcon={<AutoStoriesIcon />}
            sx={{
              textTransform: 'none',
              px: 4,
              py: 1.5,
              fontSize: '1rem',
              fontWeight: 600,
              color: "white",
              bgcolor: "#9990DA",
              borderRadius: 6,
              boxShadow: '0 8px 16px rgba(153, 144, 218, 0.2)',
              '&:hover': {
                bgcolor: "#8076C8",
                transform: 'translateY(-2px)',
                boxShadow: '0 10px 20px rgba(153, 144, 218, 0.3)',
                transition: 'all 0.3s ease'
              },
            }}
          >
            Browse Blog Posts
          </Button>
        </Box>
      ) : (
        <>

          <Typography variant="h5" fontWeight={600} sx={{ mb: 3, color: "#9990DA" }}>
            Your Favorite Posts {selectedTag && `- ${selectedTag}`}
            <Typography component="span" color="text.secondary" sx={{ ml: 1, fontSize: '1rem' }}>
              ({filteredBlogs.length})
            </Typography>
          </Typography>

          <Grid container spacing={3}>
            {filteredBlogs.map((blog, index) => (
              <MotionGrid
                item
                xs={12}
                key={blog.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                layout
              >
                <MotionCard
                  whileHover={{ y: -4, transition: { duration: 0.2 } }}
                  sx={{ 
                    display: 'flex', 
                    flexDirection: { xs: 'column', sm: 'row' },
                    borderRadius: 3,
                    overflow: 'hidden',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                    transition: 'all 0.3s ease'
                  }}
                >
                  {blog.images && blog.images.length > 0 && (
                    <CardMedia
                      component="img"
                      sx={{ 
                        width: { xs: '100%', sm: 220 },
                        height: { xs: 200, sm: 'auto' },
                        objectFit: 'cover'
                      }}
                      image={blog.images[0]}
                      alt={blog.title}
                    />
                  )}
                  <CardContent sx={{ flex: '1 0 auto', p: 3, width: '100%' }}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                        <Typography variant="h6" component="h2" fontWeight="600">
                          {blog.title}
                        </Typography>
                        <IconButton
                          onClick={() => handleRemoveFavorite(blog.id)}
                          disabled={isDeleting[blog.id]}
                          sx={{
                            color: "#9990DA",
                            '&:hover': { 
                              bgcolor: theme.palette.error.light + '20',
                              color: theme.palette.error.main
                            }
                          }}
                        >
                          {isDeleting[blog.id] ? (
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
                        <Box sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
                          <Typography variant="body2" color="text.secondary">
                            By {blog.user.firstName} {blog.user.lastName}
                            {blog.user.username && ` (@${blog.user.username})`}
                          </Typography>
                        </Box>
                      )}
                      
                      <Box sx={{ mt: 'auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
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
                            color: '#9990DA',
                            fontWeight: 600,
                            '&:hover': {
                              backgroundColor: 'rgba(153, 144, 218, 0.08)',
                            }
                          }}
                        >
                          Read More
                        </Button>
                      </Box>
                    </Box>
                  </CardContent>
                </MotionCard>
              </MotionGrid>
            ))}
          </Grid>
          
          {/* Show when no results after filtering */}
          {filteredBlogs.length === 0 && selectedTag && (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Typography variant="body1" color="text.secondary">
                No posts found with the tag "{selectedTag}".
              </Typography>
              <Button
                variant="text"
                onClick={() => setSelectedTag(null)}
                sx={{ mt: 2, color: '#9990DA' }}
              >
                Clear filter
              </Button>
            </Box>
          )}
        </>
      )}
    </>
  );
};

export default BlogFavorites;