import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import {
  Container,
  Box,
  Typography,
  Card,
  CardContent,
  CardMedia,
  Avatar,
  Stack,
  Divider,
  CircularProgress,
  Paper,
  Grid,
  IconButton,
  Button,
  CardHeader,
  CardActions,
  useTheme,
  alpha,
  Snackbar,
  Alert
} from "@mui/material";
import CommentIcon from "@mui/icons-material/Comment";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { useNavigate } from "react-router-dom";
import SaveButton from "../../company_search/components/favoriteButton"; // Make sure this path is correct
import CommentSection from "../components/comment";
import axiosInstance from "../../../configs/axios";

const BlogDetail = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { id } = useParams(); // Get the blog post ID from URL params
  
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [commentsExpanded, setCommentsExpanded] = useState(false);
  
  // Snackbar state
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("success");

  useEffect(() => {
    fetchPostData();
  }, [id]);

  const fetchPostData = async () => {
    if (!id) return;
    
    setLoading(true);
    setError(null);
    
    try {
      // Make API call to fetch the specific blog post by ID
      const response = await axiosInstance.get(`/blog/${id}`);
      
      if (response?.data?.data) {
        // Map API response to post state
        const postData = response.data.data;
        setPost({
          id: postData.id,
          title: postData.title || "Untitled Post",
          body: postData.body || "",
          images: postData.images || [],
          timestamp: postData.createdAt || new Date().toISOString(),
          saved: Boolean(postData.saved),
          comment: Array.isArray(postData.comment) ? postData.comment : [],
          user: postData.user || {
            id: postData.userId || "",
            firstName: postData.user?.firstName || "Anonymous",
            lastName: postData.user?.lastName || "User",
            avatar: postData.user?.avatar || "/api/placeholder/40/40",
            username: postData.user?.username || "anonymous",
          }
        });
      } else {
        setError("Post not found");
      }
    } catch (err) {
      console.error("Error fetching post details:", err);
      setError("Failed to load post details. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  // Handle post save status change - FIXED: Updated to match SaveButton interface
  const handleSaveChange = (itemId, newSavedState) => {
    if (post && post.id === itemId) {
      setPost(prevPost => ({
        ...prevPost,
        saved: newSavedState
      }));
      
      // Show success message
      setSnackbarMessage(
        newSavedState 
          ? "Blog post added to favorites!" 
          : "Blog post removed from favorites!"
      );
      setSnackbarSeverity("success");
      setSnackbarOpen(true);
    }
  };
  
  // Toggle comments visibility
  const toggleComments = () => {
    setCommentsExpanded(!commentsExpanded);
  };
  
  // Go back to previous page
  const handleGoBack = () => {
    navigate(-1);
  };
  
  // Handle comment updates
  const handleCommentsUpdate = async () => {
    await fetchPostData();
  };
  
  // Format date functions
  const formatDate = (timestamp) => {
    try {
      const date = new Date(timestamp);
      return date.toLocaleDateString("en-US", {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch (err) {
      return "Invalid date";
    }
  };

  const getTimeAgo = (timestamp) => {
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

  // Handle snackbar close
  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="60vh">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={handleGoBack}
          sx={{ mb: 3 }}
        >
          Back to posts
        </Button>
        
        <Paper 
          sx={{ 
            p: 3, 
            bgcolor: alpha(theme.palette.error.main, 0.1), 
            color: theme.palette.error.main,
            borderRadius: 2,
            textAlign: "center"
          }}
        >
          <Typography variant="h5" gutterBottom>Error</Typography>
          <Typography>{error}</Typography>
        </Paper>
      </Container>
    );
  }

  if (!post) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={handleGoBack}
          sx={{ mb: 3 }}
        >
          ກັບຄືນ
        </Button>
        
        <Paper 
          sx={{ 
            p: 3, 
            bgcolor: alpha(theme.palette.warning.main, 0.1), 
            color: theme.palette.warning.main,
            borderRadius: 2,
            textAlign: "center"
          }}
        >
          <Typography variant="h5" gutterBottom>Post Not Found</Typography>
          <Typography>The blog post you're looking for doesn't exist or has been removed.</Typography>
        </Paper>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      {/* Back button */}
      <Button
        startIcon={<ArrowBackIcon />}
        onClick={handleGoBack}
        sx={{ mb: 3 }}
      >
        ກັບຄືນໜ້າເກົ່າ
      </Button>
      
      <Card elevation={3} sx={{ borderRadius: 2, overflow: "hidden" }}>
        {/* Post Header */}
        <CardHeader
          avatar={
            <Avatar
              src={post.user.avatar || "/api/placeholder/40/40"}
              alt={`${post.user.firstName} ${post.user.lastName}`}
              sx={{ 
                width: 45, 
                height: 45,
                border: `2px solid ${theme.palette.primary.main}` 
              }}
            />
          }
          title={
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                {post.user.firstName} {post.user.lastName}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                @{post.user.username}
              </Typography>
            </Box>
          }
          subheader={
            <Typography variant="caption" color="text.secondary">
              {getTimeAgo(post.timestamp)}
            </Typography>
          }
        />
        
        {/* Post Content */}
        <CardContent>
          <Typography 
            variant="h5" 
            component="h1" 
            sx={{ 
              fontWeight: 700, 
              mb: 2,
              color: theme.palette.text.primary
            }}
          >
            {post.title}
          </Typography>
          
          <Typography 
            variant="body1" 
            sx={{ 
              mb: 3,
              lineHeight: 1.8,
              whiteSpace: "pre-line" // Preserve line breaks if any
            }}
          >
            {post.body}
          </Typography>
        </CardContent>
        
        {/* Post Images */}
        {post.images && post.images.length > 0 && (
          <Box sx={{ px: 2, pb: 3 }}>
            {post.images.length === 1 ? (
              <CardMedia
                component="img"
                image={post.images[0] || "/api/placeholder/600/400"}
                alt="Post image"
                sx={{ 
                  width: "100%", 
                  borderRadius: 2,
                  maxHeight: 500,
                  objectFit: 'contain'
                }}
              />
            ) : (
              <Grid container spacing={2}>
                {post.images.map((img, index) => (
                  <Grid item xs={12} sm={6} key={index}>
                    <Box
                      sx={{
                        borderRadius: 2,
                        overflow: 'hidden',
                        height: 300
                      }}
                    >
                      <CardMedia
                        component="img"
                        image={img || "/api/placeholder/300/200"}
                        alt={`Post image ${index + 1}`}
                        sx={{ 
                          height: '100%',
                          width: '100%',
                          objectFit: 'cover'
                        }}
                      />
                    </Box>
                  </Grid>
                ))}
              </Grid>
            )}
          </Box>
        )}
        
        <Divider sx={{ mx: 2 }} />
        
        {/* Actions */}
        <CardActions 
          sx={{ 
            justifyContent: "space-between", 
            px: 2,
            py: 1.5,
            bgcolor: alpha(theme.palette.background.default, 0.6)
          }}
        >
          <Button
            startIcon={<CommentIcon fontSize="small" />}
            size="small"
            onClick={toggleComments}
            sx={{
              textTransform: 'none',
              color: commentsExpanded ? theme.palette.primary.main : theme.palette.text.secondary,
              borderRadius: 4,
              px: 2,
              '&:hover': {
                bgcolor: alpha(theme.palette.primary.main, 0.1),
              }
            }}
          >
            {post.comment.length}{" "}
            {post.comment.length === 1 ? "ຄວາມຄິດເຫັນ" : "ຄວາມຄິດເຫັນ"}
          </Button>

          {/* FIXED: Using correct props for SaveButton */}
          <SaveButton
            itemId={post.id}
            itemType="blog"
            initialSaved={post.saved}
            itemName={post.title}
            size="medium"
            onSaveChange={handleSaveChange}
          />
        </CardActions>
        
        {/* Comments Section */}
        <CommentSection 
          postId={post.id}
          comments={post.comment}
          expanded={commentsExpanded}
          onCommentsUpdate={handleCommentsUpdate}
        />
      </Card>
      
      {/* Snackbar Notifications */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={4000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert 
          onClose={handleSnackbarClose} 
          severity={snackbarSeverity} 
          sx={{ width: '100%' }}
          variant="filled"
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default BlogDetail;