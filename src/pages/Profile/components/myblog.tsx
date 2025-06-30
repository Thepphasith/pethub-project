import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Box,
  Typography,
  Card,
  Avatar,
  IconButton,
  Button,
  TextField,
  Stack,
  alpha,
  useTheme,
  Divider,
  CircularProgress,
  Container,
  Paper,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  DialogContentText,
  Snackbar,
  Alert,
  Backdrop,
} from "@mui/material";
import { 
  ChatBubbleOutline, 
  MoreVert, 
  Edit, 
  Delete, 
  Close,
  Warning,
} from "@mui/icons-material";
import { RootState } from "../../../store";
import { useSelector } from "react-redux";

// Interfaces
interface BlogPostModel {
  id: string;
  userId: string;
  title: string;
  body: string;
  images?: string[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  comment: Comment[];
  user?: UserInfo;
}

interface UserInfo {
  id: string;
  firstName: string;
  lastName: string;
  avatar: string;
  username: string;
}

interface Comment {
  id: number;
  userId: string;
  commentText: string;
  user: UserInfo;
}

interface BlogResponse {
  data: BlogPostModel[];
  message: string;
  status: number;
}

// Utility function to get authentication token
const getAuthToken = (authState?: any) => {
  let token = null;
  
  console.log('=== TOKEN SEARCH DEBUG ===');
  console.log('Auth State:', authState);
  
  // Method 1: Check Redux state first
  if (authState) {
    const possibleTokens = [
      authState.token,
      authState.accessToken, 
      authState.authToken,
      authState.data?.token,
      authState.data?.accessToken,
      authState.data?.authToken
    ];
    
    for (const possibleToken of possibleTokens) {
      if (possibleToken && typeof possibleToken === 'string' && possibleToken.length > 10) {
        console.log('Token found in Redux state:', possibleToken.substring(0, 20) + '...');
        token = possibleToken;
        break;
      }
    }
  }
  
  // Method 2: localStorage/sessionStorage with common keys
  if (!token) {
    const storageKeys = ['authToken', 'token', 'accessToken', 'access_token', 'jwt', 'bearerToken'];
    for (const key of storageKeys) {
      const storageToken = localStorage.getItem(key) || sessionStorage.getItem(key);
      if (storageToken) {
        console.log(`Token found with key "${key}":`, storageToken.substring(0, 20) + '...');
        token = storageToken;
        break;
      }
    }
  }
  
  // Method 3: Check localStorage["auth"] - might be JSON object
  if (!token) {
    const authData = localStorage.getItem('auth');
    if (authData) {
      console.log('Found localStorage["auth"]:', authData);
      try {
        // Try to parse as JSON first
        const parsed = JSON.parse(authData);
        console.log('Parsed auth data:', parsed);
        
        // Look for token in parsed object
        const possibleTokens = [
          parsed.token,
          parsed.accessToken,
          parsed.authToken,
          parsed.access_token,
          parsed.data?.token,
          parsed.data?.accessToken
        ];
        
        for (const possibleToken of possibleTokens) {
          if (possibleToken && typeof possibleToken === 'string' && possibleToken.length > 10) {
            console.log('Token extracted from localStorage["auth"]:', possibleToken.substring(0, 20) + '...');
            token = possibleToken;
            break;
          }
        }
      } catch (e) {
        // If not JSON, maybe it's the token directly
        if (authData.length > 50 && (authData.includes('.') || authData.startsWith('ey'))) {
          console.log('localStorage["auth"] appears to be direct token:', authData.substring(0, 20) + '...');
          token = authData;
        }
      }
    }
  }
  
  // Method 4: Scan all localStorage for JWT-like strings
  if (!token) {
    console.log('Scanning all localStorage keys...');
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      const value = localStorage.getItem(key);
      if (value && value.length > 50 && (value.includes('.') || value.startsWith('ey'))) {
        console.log(`Possible JWT token found in localStorage["${key}"]:`, value.substring(0, 30) + '...');
        
        // Try to parse if it looks like JSON
        try {
          const parsed = JSON.parse(value);
          if (parsed.token || parsed.accessToken) {
            token = parsed.token || parsed.accessToken;
            console.log('Extracted token from JSON:', token.substring(0, 20) + '...');
            break;
          }
        } catch (e) {
          // Use as direct token
          token = value;
          break;
        }
      }
    }
  }
  
  if (token) {
    console.log('Final token to use:', token.substring(0, 30) + '...');
    // Validate token format (basic JWT check)
    if (token.split('.').length === 3) {
      console.log('Token appears to be valid JWT format');
    } else {
      console.warn('Token does not appear to be JWT format');
    }
  } else {
    console.error('No token found anywhere');
    console.log('All localStorage keys:', Object.keys(localStorage));
    console.log('All sessionStorage keys:', Object.keys(sessionStorage));
  }
  
  return token;
};

// Create authenticated axios instance
const createAuthenticatedAxios = (token: string) => {
  return axios.create({
    baseURL: 'https://pet-hub-backend-iu23.onrender.com',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    timeout: 30000,
  });
};

// Blog Edit Dialog Component
interface BlogEditDialogProps {
  open: boolean;
  onClose: () => void;
  blogId: string | null;
  onSuccess: (updatedBlog: BlogPostModel) => void;
  currentBlog?: BlogPostModel | null;
}

const BlogEditDialog = ({ open, onClose, blogId, onSuccess, currentBlog }: BlogEditDialogProps) => {
  const [loading, setLoading] = useState<boolean>(false);
  const [title, setTitle] = useState<string>("");
  const [body, setBody] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [previewImages, setPreviewImages] = useState<string[]>([]);
  
  const authState = useSelector((state: RootState) => state.auth);

  // Reset form when dialog opens/closes
  useEffect(() => {
    if (open && currentBlog) {
      setTitle(currentBlog.title || "");
      setBody(currentBlog.body || "");
      setSelectedImages([]);
      setPreviewImages([]);
      setError(null);
    } else if (!open) {
      setTitle("");
      setBody("");
      setSelectedImages([]);
      setPreviewImages([]);
      setError(null);
    }
  }, [open, currentBlog]);

  // Handle image selection
  const handleImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    const newFiles = Array.from(files);
    setSelectedImages(prev => [...prev, ...newFiles]);

    const newPreviews = newFiles.map(file => URL.createObjectURL(file));
    setPreviewImages(prev => [...prev, ...newPreviews]);
  };

  // Remove selected image
  const removeSelectedImage = (index: number) => {
    setSelectedImages(prev => prev.filter((_, i) => i !== index));
    URL.revokeObjectURL(previewImages[index]);
    setPreviewImages(prev => prev.filter((_, i) => i !== index));
  };

  // Clean up preview URLs
  useEffect(() => {
    return () => {
      previewImages.forEach(url => URL.revokeObjectURL(url));
    };
  }, [previewImages]);

  // Handle form submission
  const handleSubmit = async () => {
    if (!blogId || !title.trim() || !body.trim()) {
      setError("Blog ID, title, and body are required");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      console.log('=== BLOG UPDATE ATTEMPT ===');
      console.log('Blog ID:', blogId);
      console.log('Auth State:', authState);
      
      // Get authentication token
      const token = getAuthToken(authState);
      
      if (!token) {
        console.error('No authentication token found');
        console.log('Available localStorage keys:', Object.keys(localStorage));
        console.log('Available sessionStorage keys:', Object.keys(sessionStorage));
        setError("Authentication token not found. Please log in again.");
        return;
      }

      console.log('Token found:', token.substring(0, 20) + '...');

      // Create FormData
      const formData = new FormData();
      formData.append('title', title.trim());
      formData.append('body', body.trim());
      
      // Add images if any
      selectedImages.forEach((file, index) => {
        formData.append('images', file);
        console.log(`Added image ${index}:`, file.name, file.type, file.size);
      });

      console.log('Making PATCH request to:', `/blog/${blogId}`);

      // Make API request
      const response = await axios.patch(
        `https://pet-hub-backend-iu23.onrender.com/blog/${blogId}`,
        formData,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            // Don't set Content-Type for FormData - let axios handle it
          },
          timeout: 30000,
        }
      );

      console.log('=== UPDATE SUCCESS ===');
      console.log('Response status:', response.status);
      console.log('Response data:', response.data);

      // Handle response
      let updatedBlog = null;
      if (response.data?.data) {
        updatedBlog = response.data.data;
      } else if (response.data?.id) {
        updatedBlog = response.data;
      } else {
        // Create updated blog from current data
        updatedBlog = {
          ...currentBlog,
          title: title.trim(),
          body: body.trim(),
          updatedAt: new Date().toISOString(),
          images: response.data?.images || currentBlog?.images || []
        };
      }

      if (updatedBlog?.id) {
        onSuccess(updatedBlog);
        onClose();
      } else {
        setError("Blog updated but received invalid response");
      }

    } catch (err: any) {
      console.error('=== UPDATE ERROR ===');
      console.error('Error:', err);
      console.error('Response:', err.response?.data);
      
      let errorMessage = "Failed to update blog post.";
      
      if (err.response?.status === 401) {
        const responseMessage = err.response.data?.message || '';
        if (responseMessage.includes('Invalid token') || responseMessage.includes('user not found')) {
          errorMessage = "Your session has expired or your account is inactive. Please log out and log in again.";
        } else {
          errorMessage = "Authentication failed. Please log in again.";
        }
      } else if (err.response?.status) {
        switch (err.response.status) {
          case 403:
            errorMessage = "You don't have permission to edit this blog.";
            break;
          case 404:
            errorMessage = "Blog post not found.";
            break;
          case 413:
            errorMessage = "Images are too large. Please use smaller images.";
            break;
          default:
            errorMessage = err.response.data?.message || `Error ${err.response.status}`;
        }
      } else if (err.code === 'ECONNABORTED') {
        errorMessage = "Request timeout. Please try again.";
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle>
        ແກ້ໄຂບົດຄວາມ
        <IconButton
          aria-label="close"
          onClick={onClose}
          disabled={loading}
          sx={{ position: "absolute", right: 8, top: 8 }}
        >
          <Close />
        </IconButton>
      </DialogTitle>
      <DialogContent>
        {error && (
          <Alert 
            severity="error" 
            sx={{ mb: 2 }}
            action={
              error.includes('session has expired') || error.includes('Authentication failed') ? (
                <Button 
                  color="inherit" 
                  size="small" 
                  onClick={() => {
                    // Clear all possible token storage locations
                    localStorage.clear();
                    sessionStorage.clear();
                    window.location.reload();
                  }}
                  sx={{ ml: 1 }}
                >
                  Log Out & Refresh
                </Button>
              ) : null
            }
          >
            {error}
          </Alert>
        )}
        
        <Box component="form" sx={{ mt: 2 }}>
          <TextField
            fullWidth
            label="ຫົວຂໍ້"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            margin="normal"
            required
            disabled={loading}
          />
          <TextField
            fullWidth
            label="ເນື້ອໃນບົດຄວາມ"
            value={body}
            onChange={(e) => setBody(e.target.value)}
            margin="normal"
            required
            multiline
            rows={6}
            disabled={loading}
          />

          {/* Image Upload Section */}
          <Box sx={{ mt: 3 }}>
            <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600 }}>
              ຮູບພາບ
            </Typography>
            
            {/* Current Images Display */}
            {currentBlog?.images && currentBlog.images.length > 0 && (
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" sx={{ mb: 1, color: 'text.secondary' }}>
                  ຮູບປັດຈຸບັນ:
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {currentBlog.images.map((imageUrl, index) => (
                    <Box
                      key={index}
                      sx={{
                        width: 100,
                        height: 100,
                        borderRadius: 1,
                        overflow: 'hidden',
                        border: '1px solid #ddd'
                      }}
                    >
                      <img
                        src={imageUrl}
                        alt={`Current ${index + 1}`}
                        style={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover'
                        }}
                      />
                    </Box>
                  ))}
                </Box>
              </Box>
            )}

            {/* New Image Previews */}
            {previewImages.length > 0 && (
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" sx={{ mb: 1, color: 'text.secondary' }}>
                  ຮູບໃໝ່:
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {previewImages.map((previewUrl, index) => (
                    <Box
                      key={index}
                      sx={{
                        position: 'relative',
                        width: 100,
                        height: 100,
                        borderRadius: 1,
                        overflow: 'hidden',
                        border: '2px solid #9990DA'
                      }}
                    >
                      <img
                        src={previewUrl}
                        alt={`Preview ${index + 1}`}
                        style={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover'
                        }}
                      />
                      <IconButton
                        size="small"
                        onClick={() => removeSelectedImage(index)}
                        disabled={loading}
                        sx={{
                          position: 'absolute',
                          top: 4,
                          right: 4,
                          backgroundColor: 'rgba(255,255,255,0.8)',
                          width: 24,
                          height: 24,
                        }}
                      >
                        <Close fontSize="small" />
                      </IconButton>
                    </Box>
                  ))}
                </Box>
              </Box>
            )}

            {/* Image Upload Button */}
            <input
              accept="image/*"
              style={{ display: 'none' }}
              id="image-upload-input"
              multiple
              type="file"
              onChange={handleImageSelect}
              disabled={loading}
            />
            <label htmlFor="image-upload-input">
              <Button
                variant="outlined"
                component="span"
                disabled={loading}
                sx={{
                  borderColor: '#9990DA',
                  color: '#9990DA',
                  '&:hover': {
                    borderColor: '#7a70c0',
                    backgroundColor: 'rgba(153, 144, 218, 0.04)',
                  },
                }}
              >
                ເພີ່ມຮູບພາບ
              </Button>
            </label>
          </Box>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="inherit" disabled={loading}>
          ຍົກເລີກ
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={loading || !title.trim() || !body.trim()}
          sx={{
            bgcolor: "#9990DA",
            "&:hover": {
              bgcolor: "#7a70c0",
            },
          }}
        >
          {loading ? (
            <>
              <CircularProgress size={20} sx={{ mr: 1, color: 'white' }} />
              ກຳລັງບັນທຶກ...
            </>
          ) : (
            'ບັນທຶກ'
          )}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

// Delete Confirmation Dialog Component
interface DeleteConfirmDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  blogTitle: string;
  loading: boolean;
}

const DeleteConfirmDialog = ({ 
  open, 
  onClose, 
  onConfirm, 
  blogTitle, 
  loading 
}: DeleteConfirmDialogProps) => {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Warning sx={{ color: 'error.main' }} />
        ຢືນຢັນການລົບ
      </DialogTitle>
      <DialogContent>
        <DialogContentText>
          ທ່ານໝັ້ນໃຈແລ້ວບໍວ່າທ່ານຕ້ອງການລົບບົດຄວາມ "{blogTitle}"?
          <br />
          ການກະທຳນີ້ບໍ່ສາມາດຍົກເລີກໄດ້.
        </DialogContentText>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose} disabled={loading}>
          ຍົກເລີກ
        </Button>
        <Button
          onClick={onConfirm}
          variant="contained"
          color="error"
          disabled={loading}
          startIcon={loading ? <CircularProgress size={16} /> : <Delete />}
        >
          {loading ? 'ກຳລັງລົບ...' : 'ລົບ'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

// Main MyBlog Component
const MyBlog = () => {
  const theme = useTheme();
  const [blogs, setBlogs] = useState<BlogPostModel[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedPostId, setExpandedPostId] = useState<string | null>(null);
  const [menuAnchorEl, setMenuAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedPostId, setSelectedPostId] = useState<string | null>(null);
  
  // Dialog states
  const [editDialogOpen, setEditDialogOpen] = useState<boolean>(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState<boolean>(false);
  const [deleteLoading, setDeleteLoading] = useState<boolean>(false);
  
  // Notification state
  const [notification, setNotification] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error' | 'info' | 'warning';
  }>({
    open: false,
    message: '',
    severity: 'success'
  });

  const currentUser = useSelector((state: RootState) => state.auth.data);
  const authState = useSelector((state: RootState) => state.auth);

  // Show notification
  const showNotification = (message: string, severity: 'success' | 'error' | 'info' | 'warning') => {
    setNotification({ open: true, message, severity });
  };

  // Close notification
  const handleCloseNotification = () => {
    setNotification(prev => ({ ...prev, open: false }));
  };

  // Format relative time
  const formatRelativeTime = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return `${diffInSeconds} seconds ago`;
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
    return `${Math.floor(diffInSeconds / 86400)} days ago`;
  };

  // Fetch blogs from API
  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        setLoading(true);
        setError(null);

        if (!currentUser?.id) {
          setError("User information not available");
          return;
        }

        console.log('Fetching blogs for user:', currentUser.id);
        console.log('Auth state:', authState);

        const token = getAuthToken(authState);
        if (!token) {
          setError("Authentication token not found. Please log in again.");
          return;
        }

        const authAxios = createAuthenticatedAxios(token);
        const response = await authAxios.get<BlogResponse>(`/blog/user/${currentUser.id}`);

        console.log("Fetch blogs response:", response.data);

        if (response.data.status === 200) {
          const processedPosts = response.data.data.map((post) => ({
            ...post,
            comment: (post.comment || []).map((comment) => ({
              id: comment.id,
              userId: comment.userId,
              commentText: comment.commentText,
              user: comment.user,
            })),
            user: {
              id: currentUser.id,
              firstName: currentUser.firstName,
              lastName: currentUser.lastName,
              avatar: currentUser.avatar,
              username: currentUser.username,
            },
          }));

          setBlogs(processedPosts);
        } else {
          setError(response.data.message || "Failed to fetch blog posts");
        }
      } catch (err: any) {
        console.error("Error fetching blogs:", err);
        const message = err.response?.data?.message || "Failed to fetch blog posts. Please try again later.";
        setError(message);
      } finally {
        setLoading(false);
      }
    };

    fetchBlogs();
  }, [currentUser, authState]);

  // Handle expanding post to show comments
  const handleExpandPost = (postId: string) => {
    setExpandedPostId(expandedPostId === postId ? null : postId);
  };

  // Handle post menu
  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, postId: string) => {
    setMenuAnchorEl(event.currentTarget);
    setSelectedPostId(postId);
  };

  const handleMenuClose = () => {
    setMenuAnchorEl(null);
  };

  // Handle edit post
  const handleEditPost = () => {
    if (!selectedPostId) return;
    setEditDialogOpen(true);
    handleMenuClose();
  };

  // Handle delete post
  const handleDeletePost = () => {
    if (!selectedPostId) return;
    setDeleteDialogOpen(true);
    handleMenuClose();
  };

  // Handle confirmed delete
  const handleConfirmDelete = async () => {
    if (!selectedPostId) return;

    try {
      setDeleteLoading(true);

      const blogToDelete = blogs.find(blog => blog.id === selectedPostId);
      const blogTitle = blogToDelete?.title || "Blog post";

      if (blogToDelete && blogToDelete.userId !== currentUser?.id) {
        showNotification("You can only delete your own blog posts.", 'error');
        return;
      }

      const token = getAuthToken(authState);
      if (!token) {
        showNotification("Authentication token not found. Please log in again.", 'error');
        return;
      }

      const authAxios = createAuthenticatedAxios(token);
      await authAxios.delete(`/blog/${selectedPostId}`);

      setBlogs(prevBlogs => prevBlogs.filter((blog) => blog.id !== selectedPostId));
      showNotification(`Blog post "${blogTitle}" deleted successfully!`, 'success');

    } catch (err: any) {
      console.error("Error deleting post:", err);
      console.error("Error response:", err.response?.data);
      
      let errorMessage = "Failed to delete blog post.";
      
      if (err.response?.status === 401) {
        const responseMessage = err.response.data?.message || '';
        if (responseMessage.includes('Invalid token') || responseMessage.includes('user not found')) {
          errorMessage = "Your session has expired or your account is inactive. Please log out and log in again.";
        } else {
          errorMessage = "Authentication failed. Please log in again.";
        }
      } else if (err.response?.status === 403) {
        errorMessage = "You don't have permission to delete this post.";
      } else if (err.response?.status === 404) {
        errorMessage = "Blog post not found.";
      } else if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      }
      
      showNotification(errorMessage, 'error');
    } finally {
      setDeleteLoading(false);
      setDeleteDialogOpen(false);
      setSelectedPostId(null);
    }
  };

  // Handle successful blog update
  const handleBlogUpdateSuccess = (updatedBlog: BlogPostModel) => {
    setBlogs(prevBlogs => 
      prevBlogs.map(blog => 
        blog.id === updatedBlog.id 
          ? { ...updatedBlog, user: blog.user, comment: blog.comment }
          : blog
      )
    );
    showNotification("Blog post updated successfully!", 'success');
  };

  // Get selected blog
  const selectedBlog = blogs.find(blog => blog.id === selectedPostId);

  if (loading) {
    return (
      <Container maxWidth="md">
        <Box sx={{ display: "flex", justifyContent: "center", my: 4 }}>
          <CircularProgress sx={{ color: "#9990DA" }} />
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="md">
      {/* Header */}
      <Box sx={{ mb: 4, display: "flex", flexDirection: "column", alignItems: "center" }}>
        <Typography
          variant="h4"
          component="h1"
          fontWeight="bold"
          sx={{
            textAlign: "center",
            color: "#333",
            fontSize: { xs: "1.75rem", md: "2.25rem" },
            mb: 2,
          }}
        >
          ບົດ<span style={{ color: "#9990DA" }}>ຄວາມ</span>
        </Typography>

        {currentUser && (
          <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
            <Avatar src={currentUser.avatar} sx={{ width: 60, height: 60, mr: 2 }} />
            <Box>
              <Typography variant="h6" sx={{ fontWeight: "bold" }}>
                {currentUser.firstName} {currentUser.lastName}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                @{currentUser.username}
              </Typography>
            </Box>
          </Box>
        )}
      </Box>

      {/* Content */}
      {error ? (
        <Paper
          elevation={0}
          sx={{
            my: 4,
            textAlign: "center",
            p: 4,
            bgcolor: alpha(theme.palette.primary.light, 0.05),
            borderRadius: 2,
          }}
        >
          <Alert 
            severity="error" 
            sx={{ mb: 2 }}
            action={
              error.includes('session has expired') || error.includes('Authentication') || error.includes('token') ? (
                <Button 
                  variant="contained"
                  color="primary"
                  size="small"
                  onClick={() => {
                    // Clear all possible token storage locations
                    localStorage.clear();
                    sessionStorage.clear();
                    window.location.reload();
                  }}
                  sx={{
                    bgcolor: "#9990DA",
                    "&:hover": { bgcolor: "#7a70c0" },
                  }}
                >
                  Log Out & Refresh
                </Button>
              ) : (
                <Button 
                  variant="contained"
                  color="primary"
                  size="small"
                  onClick={() => window.location.reload()}
                  sx={{
                    bgcolor: "#9990DA",
                    "&:hover": { bgcolor: "#7a70c0" },
                  }}
                >
                  Refresh Page
                </Button>
              )
            }
          >
            {error}
          </Alert>
        </Paper>
      ) : blogs.length === 0 ? (
        <Paper
          elevation={0}
          sx={{
            my: 4,
            textAlign: "center",
            p: 4,
            bgcolor: alpha(theme.palette.primary.light, 0.05),
            borderRadius: 2,
          }}
        >
          <Typography variant="h6" sx={{ mb: 2, color: "text.secondary" }}>
            ເຈົ້າຍັງບໍ່ມີບົດຄວາມໃນໂປຣໄຟລ໌ນີ້. ສ້າງບົດຄວາມໃໝ່!
          </Typography>
        </Paper>
      ) : (
        <Stack spacing={3}>
          {blogs.map((post) => (
            <Card
              key={post.id}
              sx={{
                borderRadius: 2,
                transition: "all 0.3s ease",
                boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
                "&:hover": {
                  boxShadow: "0 6px 12px rgba(0,0,0,0.15)",
                },
              }}
            >
              <Box sx={{ p: 3 }}>
                {/* Post Header */}
                <Box sx={{ display: "flex", justifyContent: "space-between", mb: 3 }}>
                  <Box sx={{ display: "flex", alignItems: "center" }}>
                    <Avatar src={currentUser?.avatar} sx={{ width: 40, height: 40, mr: 1.5 }} />
                    <Box>
                      <Typography variant="subtitle2" sx={{ fontWeight: "bold" }}>
                        {currentUser?.firstName} {currentUser?.lastName} (You)
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {formatRelativeTime(post.createdAt)}
                      </Typography>
                    </Box>
                  </Box>
                  {post.userId === currentUser?.id && (
                    <IconButton size="small" onClick={(e) => handleMenuOpen(e, post.id)}>
                      <MoreVert fontSize="small" />
                    </IconButton>
                  )}
                </Box>

                {/* Post Content */}
                <Typography variant="h6" component="h2" sx={{ mb: 2, fontWeight: "bold" }}>
                  {post.title}
                </Typography>
                <Typography variant="body1" sx={{ mb: 3 }}>
                  {post.body}
                </Typography>

                {/* Post Images */}
                {post.images && post.images.length > 0 && (
                  <Box sx={{ mb: 3 }}>
                    {post.images.length === 1 ? (
                      <Box sx={{ borderRadius: 2, overflow: "hidden", maxHeight: 400 }}>
                        <img
                          src={post.images[0]}
                          alt={post.title}
                          style={{
                            width: "100%",
                            height: "auto",
                            objectFit: "contain",
                            maxHeight: 400,
                          }}
                        />
                      </Box>
                    ) : (
                      <Box
                        sx={{
                          display: "grid",
                          gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
                          gap: 2,
                        }}
                      >
                        {post.images.map((image, index) => (
                          <Box key={index} sx={{ borderRadius: 2, overflow: "hidden", height: 200 }}>
                            <img
                              src={image}
                              alt={`${post.title} ${index + 1}`}
                              style={{ width: "100%", height: "100%", objectFit: "cover" }}
                            />
                          </Box>
                        ))}
                      </Box>
                    )}
                  </Box>
                )}

                {/* Post Actions */}
                <Box sx={{ display: "flex", alignItems: "center" }}>
                  <Button
                    startIcon={<ChatBubbleOutline />}
                    size="small"
                    onClick={() => handleExpandPost(post.id)}
                    sx={{ color: "text.secondary" }}
                  >
                    ສະແດງບົດຄວາມ
                  </Button>
                </Box>

                {/* Comments Section */}
                {expandedPostId === post.id && (
                  <Box sx={{ mt: 3 }}>
                    <Divider sx={{ my: 2 }} />
                    {post.comment && post.comment.length > 0 ? (
                      <Stack spacing={2} sx={{ mt: 2 }}>
                        {post.comment.map((comment) => (
                          <Box
                            key={comment.id}
                            sx={{
                              p: 2,
                              bgcolor: alpha(theme.palette.background.default, 0.5),
                              borderRadius: 1,
                            }}
                          >
                            <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                              <Avatar src={comment.user.avatar} sx={{ width: 24, height: 24, mr: 1 }} />
                              <Typography variant="body2" sx={{ fontWeight: "bold", mr: 1 }}>
                                {comment.user.firstName} {comment.user.lastName}
                              </Typography>
                            </Box>
                            <Typography variant="body2">{comment.commentText}</Typography>
                          </Box>
                        ))}
                      </Stack>
                    ) : (
                      <Typography variant="body2" color="text.secondary" sx={{ textAlign: "center", py: 2 }}>
                        ຍັງບໍ່ມີຄຳເຫັນເທື່ອ. ເປັນຄົນທຳອິດທີ່ສະແດງຄວາມຄິດເຫັນ!
                      </Typography>
                    )}
                  </Box>
                )}
              </Box>
            </Card>
          ))}
        </Stack>
      )}

      {/* Post Menu */}
      <Menu
        anchorEl={menuAnchorEl}
        open={Boolean(menuAnchorEl)}
        onClose={handleMenuClose}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        transformOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <MenuItem onClick={handleEditPost}>
          <Edit fontSize="small" sx={{ mr: 1 }} />
          ແກ້ໄຂບົດຄວາມ
        </MenuItem>
        {selectedPostId && 
         blogs.find(blog => blog.id === selectedPostId)?.userId === currentUser?.id && (
          <MenuItem onClick={handleDeletePost} sx={{ color: 'error.main' }}>
            <Delete fontSize="small" sx={{ mr: 1 }} />
            ລົບບົດຄວາມ
          </MenuItem>
        )}
      </Menu>

      {/* Edit Dialog */}
      <BlogEditDialog 
        open={editDialogOpen}
        onClose={() => setEditDialogOpen(false)}
        blogId={selectedPostId}
        onSuccess={handleBlogUpdateSuccess}
        currentBlog={selectedBlog}
      />

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmDialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        onConfirm={handleConfirmDelete}
        blogTitle={selectedBlog?.title || ""}
        loading={deleteLoading}
      />

      {/* Loading Backdrop */}
      <Backdrop
        sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }}
        open={deleteLoading}
      >
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <CircularProgress color="inherit" />
          <Typography sx={{ mt: 2 }}>ກຳລັງລົບບົດຄວາມ...</Typography>
        </Box>
      </Backdrop>

      {/* Notification Snackbar */}
      <Snackbar
        open={notification.open}
        autoHideDuration={6000}
        onClose={handleCloseNotification}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
      >
        <Alert
          onClose={handleCloseNotification}
          severity={notification.severity}
          sx={{ width: '100%' }}
          variant="filled"
        >
          {notification.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default MyBlog;