// This is the final version of your PetBlog component with the updated BlogCardWithLink
// Save this to your existing PetBlog file location

import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Box, 
  Typography, 
  Container,
  Avatar,
  Button,
  Chip
} from '@mui/material';
import {
  ArrowForward as ArrowForwardIcon,
  Comment as CommentIcon,
} from '@mui/icons-material';
import axiosInstance from '../../../configs/axios';
import BlogCardSkeleton from '../../cardCustom/cardCopanies';

// Updated BlogPost interface that correctly maps to API response
export interface BlogPost {
  id: string;
  title: string;
  body: string;
  images?: string[];
  createdAt: string;
  user: {
    id: string;
    username: string;
    firstName: string;
    lastName: string;
    avatar: string | null;
  };
  comment?: Array<{
    id: string;
    commentText: string;
    createdAt: string;
    user: {
      id: string;
      username: string;
      avatar: string | null;
    }
  }>;
}

// Helper function to generate avatar colors
const generateAvatarColor = (username: string) => {
  const colors = ['#FF5733', '#33FF57', '#3357FF', '#F333FF', '#FF33A8', '#33FFF5'];
  const index = username.charCodeAt(0) % colors.length;
  return colors[index];
};

// Helper function to format dates
const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric' 
  });
};

// Updated BlogCard component with routing to detailed post page
const BlogCardWithLink = ({ post }: { post: BlogPost }) => {
  const navigate = useNavigate();
  const avatarColor = generateAvatarColor(post.user.username);
  
  const handlePostClick = () => {
    // Navigate to the post detail page using the post ID
    // IMPORTANT: Updated to use the correct route path that matches your routes configuration
    navigate(`/blog-detail/${post.id}`);
  };
  
  return (
    <Box 
      sx={{
        minWidth: 300,
        maxWidth: 300,
        mx: 1,
        borderRadius: 2,
        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
        overflow: 'hidden',
        transition: 'transform 0.3s, box-shadow 0.3s',
        cursor: 'pointer',
        '&:hover': {
          transform: 'translateY(-5px)',
          boxShadow: '0 12px 20px rgba(0,0,0,0.15)',
        },
        bgcolor: 'background.paper',
        display: 'flex',
        flexDirection: 'column',
      }}
      onClick={handlePostClick}
    >
      {/* Post Image */}
      {post.images && post.images.length > 0 ? (
        <Box 
          sx={{
            height: 180,
            backgroundImage: `url(${post.images[0]})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        />
      ) : (
        <Box 
          sx={{
            height: 180,
            bgcolor: 'grey.200',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center'
          }}
        >
          <Typography color="text.secondary">No Image</Typography>
        </Box>
      )}
      
      {/* Content */}
      <Box sx={{ p: 2, flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
        {/* Title */}
        <Typography 
          variant="h6" 
          component="h2" 
          gutterBottom 
          sx={{ 
            fontWeight: 'bold',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            height: 48
          }}
        >
          {post.title}
        </Typography>
        
        {/* Body Text */}
        <Typography 
          color="text.secondary" 
          sx={{ 
            mb: 2,
            display: '-webkit-box',
            WebkitLineClamp: 3,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            height: 60
          }}
        >
          {post.body}
        </Typography>
        
        {/* Author and Date Info */}
        <Box sx={{ mt: 'auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Avatar
              src={post.user.avatar || undefined}
              sx={{ 
                width: 36, 
                height: 36, 
                bgcolor: post.user.avatar ? undefined : avatarColor,
                mr: 1
              }}
            >
              {!post.user.avatar && post.user.username.charAt(0).toUpperCase()}
            </Avatar>
            <Box>
              <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                {post.user.username}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {formatDate(post.createdAt)}
              </Typography>
            </Box>
          </Box>
          
          {/* Comment Count */}
          <Chip
            size="small"
            icon={<CommentIcon fontSize="small" />}
            label={post.comment ? post.comment.length : "0"}
            sx={{ height: 24, fontSize: '0.75rem' }}
          />
        </Box>
      </Box>
      
      {/* Enhanced Read More button with better clickability */}
      <Box 
        component="button"
        onClick={(e) => {
          e.stopPropagation(); // Prevent the card's click event from also firing
          handlePostClick(); // Use the same navigation function
        }}
        sx={{ 
          borderTop: '1px solid rgba(0,0,0,0.05)',
          p: 1.5,
          display: 'flex',
          justifyContent: 'center',
          color: '#9990DA',
          fontWeight: 'medium',
          fontSize: '0.875rem',
          alignItems: 'center',
          width: '100%',
          border: 'none',
          background: 'none',
          cursor: 'pointer',
          '&:hover': {
            backgroundColor: 'rgba(153, 144, 218, 0.05)'
          },
          transition: 'background-color 0.2s'
        }}
      >
        <Typography variant="button" sx={{ mr: 0.5, fontWeight: 500 }}>
          Read More
        </Typography>
        <ArrowForwardIcon fontSize="small" />
      </Box>
    </Box>
  );
};

// Main PetBlog component with horizontal carousel
const PetBlog = () => {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [slidePosition, setSlidePosition] = useState(0);
  const autoSlideRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        setIsLoading(true);
        const response = await axiosInstance.get('/blog');
        
        // Process the response data to ensure it's an array of blog posts
        let processedData = response.data;
        
        // If the response is not an array, check if it has a data property that is an array
        if (!Array.isArray(processedData)) {
          if (processedData && Array.isArray(processedData.data)) {
            processedData = processedData.data;
          } else {
            // If still not an array, create an empty array
            processedData = [];
            console.error('API response is not in the expected format:', response.data);
          }
        }
        
        setPosts(processedData);
        setError(null);
      } catch (err) {
        console.error('Error fetching blog posts:', err);
        setError('Failed to load blog posts');
        // Set an empty array to avoid "posts.map is not a function" error
        setPosts([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPosts();
  }, []);

  useEffect(() => {
    // Start auto-sliding when component loads and content is ready
    if (!isLoading && posts.length > 0) {
      // Start with a delay to give the cards time to render
      setTimeout(() => {
        // Start the auto-sliding
        autoSlideRef.current = setInterval(() => {
          setSlidePosition(prev => {
            // If we've reached the end, go back to the beginning
            if (prev >= (posts.length - 1) * 320) {
              return 0;
            }
            // Otherwise, move to the next card
            return prev + 320;
          });
        }, 3000); // Slide every 3 seconds
      }, 1000);
    }
    
    // Cleanup function
    return () => {
      if (autoSlideRef.current) {
        clearInterval(autoSlideRef.current);
      }
    };
  }, [isLoading, posts.length]);
  
  // Update the scroll position whenever slidePosition changes
  useEffect(() => {
    const container = document.getElementById('slide-container');
    if (container) {
      container.scrollTo({
        left: slidePosition,
        behavior: 'smooth'
      });
    }
  }, [slidePosition]);

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography
          variant="h4"
          component="h1"
          fontWeight="bold"
          sx={{ color: '#333', fontSize: { xs: '1.75rem', md: '2.25rem' } }}
        >
          ບົດຄວາມ<span style={{ color: '#9990DA' }}>ສັດລ້ຽງ</span>
        </Typography>
        
        <Link to="/blog" style={{ textDecoration: 'none' }}>
          <Button 
            variant="outlined"
            endIcon={<ArrowForwardIcon />}
            sx={{ 
              borderColor: '#9990DA',
              color: '#9990DA',
              '&:hover': {
                borderColor: '#7B74AE',
                backgroundColor: 'rgba(153, 144, 218, 0.05)'
              },
              borderRadius: 8
            }}
          >
            ເບິ່ງບົດຄວາມທັງໝົດ
          </Button>
        </Link>
      </Box>
      
      <Box sx={{ position: 'relative', overflow: 'hidden' }}>
        <Box
          id="slide-container"
          sx={{
            display: 'flex',
            overflowX: 'hidden', // Hide scrollbar but allow programmatic scrolling
            py: 2,
            px: 1,
          }}
        >
          {isLoading ? (
            // Show skeletons while loading
            Array.from(new Array(4)).map((_, index) => (
              <BlogCardSkeleton key={index} />
            ))
          ) : error ? (
            // Show error message
            <Box sx={{ p: 3, textAlign: 'center', width: '100%' }}>
              <Typography color="error">{error}</Typography>
              <Button 
                variant="outlined" 
                onClick={() => window.location.reload()}
                sx={{ mt: 2 }}
              >
                ລອງໃໝ່ອີກຄັ້ງ
              </Button>
            </Box>
          ) : posts.length === 0 ? (
            // No posts found
            <Box sx={{ p: 3, textAlign: 'center', width: '100%' }}>
              <Typography>No blog posts found.</Typography>
            </Box>
          ) : (
            // Show actual blog posts - using our BlogCardWithLink component for routing
            posts.map((post, index) => (
              <BlogCardWithLink key={post.id || index} post={post} />
            ))
          )}
        </Box>
        
        {/* Pagination Indicators */}
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
          {!isLoading && posts.length > 0 && posts.map((_, index) => (
            <Box
              key={index}
              onClick={() => setSlidePosition(index * 320)}
              sx={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                mx: 0.5,
                cursor: 'pointer',
                bgcolor: Math.round(slidePosition / 320) === index ? '#9990DA' : '#E0E0E0',
                transition: 'background-color 0.3s'
              }}
            />
          ))}
        </Box>
      </Box>
    </Container>
  );
};

export default PetBlog;