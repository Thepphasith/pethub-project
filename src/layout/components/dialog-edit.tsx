import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  TextField,
  Button,
  Dialog,
  IconButton,
  styled,
  CircularProgress,
  Snackbar,
  Alert
} from "@mui/material";
import {
  Close as CloseIcon,
  AddPhotoAlternate,
  Save,
  Delete
} from "@mui/icons-material";

// Interface for blog data
interface Blog {
  id: string;
  userId: string;
  title: string;
  body: string;
  images: string[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface EditBlogDialogProps {
  open: boolean;
  onClose: () => void;
  blogId: string | null;
  onSuccess: (updatedBlog: Blog) => void;
  initialBlogData?: Blog; // Added to provide initial data for UI-only version
}

// Custom styled components with blog theme
const BlogDialogContent = styled(Box)(({ theme }) => ({
  padding: theme.spacing(3),
  backgroundColor: '#ffffff',
  borderRadius: '0 0 12px 12px',
}));

const BlogTextField = styled(TextField)(({ theme }) => ({
  marginBottom: theme.spacing(2.5),
  '& .MuiOutlinedInput-root': {
    borderRadius: 8,
    '&:hover fieldset': {
      borderColor: '#6d9eeb',
    },
    '&.Mui-focused fieldset': {
      borderColor: '#4285f4',
    },
  },
  '& .MuiInputLabel-root.Mui-focused': {
    color: '#4285f4',
  },
}));

const BlogButton = styled(Button)(({ theme }) => ({
  borderRadius: 8,
  textTransform: 'none',
  padding: '8px 20px',
  fontWeight: 600,
  boxShadow: 'none',
  '&.MuiButton-contained': {
    backgroundColor: '#4285f4',
    color: 'white',
    '&:hover': {
      backgroundColor: '#3367d6',
      boxShadow: '0 4px 8px rgba(66, 133, 244, 0.25)',
    },
  },
  '&.MuiButton-outlined': {
    borderColor: '#4285f4',
    color: '#4285f4',
    '&:hover': {
      borderColor: '#3367d6',
      color: '#3367d6',
      backgroundColor: 'rgba(66, 133, 244, 0.08)',
    },
  },
}));

const HeaderBar = styled(Box)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: '16px 24px',
  borderBottom: '1px solid #e0e0e0',
  backgroundColor: '#4285f4',
  borderRadius: '12px 12px 0 0',
}));

const ImagePreview = styled(Box)(({ theme }) => ({
  borderRadius: 8,
  padding: 2,
  border: '1px dashed #c4c4c4',
  backgroundColor: '#f9f9f9',
  marginBottom: theme.spacing(2),
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  position: 'relative',
}));

const ImageGrid = styled(Box)(({ theme }) => ({
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
  gap: theme.spacing(2),
  marginBottom: theme.spacing(2),
}));

// Main component
const BlogEditDialog: React.FC<EditBlogDialogProps> = ({
  open,
  onClose,
  blogId,
  onSuccess,
  initialBlogData,
}) => {
  const [blog, setBlog] = useState<Blog | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [fetchingData, setFetchingData] = useState<boolean>(false);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: "success" | "error";
  }>({
    open: false,
    message: "",
    severity: "success",
  });
  const [error, setError] = useState<string | null>(null);
  
  // Set initial blog data or mock data
  useEffect(() => {
    if (open && blogId) {
      setFetchingData(true);
      setError(null);
      
      // Simulate API loading with timeout
      setTimeout(() => {
        if (initialBlogData) {
          setBlog(initialBlogData);
        } else {
          // Provide mock data if no initialBlogData is provided
          setBlog({
            id: blogId,
            userId: "user123",
            title: "ຫົວຂໍ້ບລັອກຕົວຢ່າງ", // Sample Blog Title
            body: "ນີ້​ຄື​ເນື້ອ​ໃນ​ບລັອກ​ຕົວ​ຢ່າງ. ທ່ານ​ສາ​ມາດ​ແກ້​ໄຂ​ໄດ້!", // This is a sample blog content. Edit me!
            images: [
              "https://via.placeholder.com/300",
              "https://via.placeholder.com/300"
            ],
            isActive: true,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          });
        }
        setFetchingData(false);
      }, 800);
    }
  }, [open, blogId, initialBlogData]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    if (blog) {
      setBlog({
        ...blog,
        [name]: value,
      });
    }
  };

  const handleSave = async () => {
    if (blog && blogId) {
      setLoading(true);
      
      // Simulate API call with timeout
      setTimeout(() => {
        try {
          // Process images if needed
          
          // UI-only logic for new images
          if (imageFiles.length > 0) {
            console.log("Would upload these images:", imageFiles);
          }
          
          // Update the blog with current time as updatedAt
          const updatedBlog = {
            ...blog,
            updatedAt: new Date().toISOString()
          };
          
          // Show success message
          setSnackbar({
            open: true,
            message: "ອັບເດດບລັອກສຳເລັດແລ້ວ", // Blog updated successfully
            severity: "success",
          });
          
          // Pass the updated blog data to parent component
          onSuccess(updatedBlog);
          
          // Don't close immediately to show confirmation to the user
          setTimeout(() => onClose(), 1500);
        } catch (error) {
          // Handle errors in UI-only version
          console.error('Error in UI simulation:', error);
          setSnackbar({
            open: true,
            message: "ບໍ່ສາມາດອັບເດດບົດຄວາມບລັອກໄດ້", // Failed to update blog post
            severity: "error",
          });
        } finally {
          setLoading(false);
        }
      }, 1000);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      // Add new files to existing files
      setImageFiles(prev => [...prev, ...Array.from(files)]);
      
      // Create preview URLs for immediate display
      if (blog) {
        const newImageUrls = Array.from(files).map(file => URL.createObjectURL(file));
        setBlog({
          ...blog,
          images: [...blog.images, ...newImageUrls],
        });
      }
    }
  };

  const removeImage = (index: number) => {
    if (blog) {
      const updatedImages = [...blog.images];
      updatedImages.splice(index, 1);
      
      // Also remove from imageFiles if it's a new file
      if (index >= blog.images.length - imageFiles.length) {
        const newImageFiles = [...imageFiles];
        newImageFiles.splice(index - (blog.images.length - imageFiles.length), 1);
        setImageFiles(newImageFiles);
      }
      
      setBlog({
        ...blog,
        images: updatedImages,
      });
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  // If data is still loading
  if (fetchingData) {
    return (
      <Dialog 
        open={open} 
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: '12px',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            padding: 4
          }
        }}
      >
        <CircularProgress />
        <Typography sx={{ ml: 2 }}>ກຳລັງໂຫຼດຂໍ້ມູນບລັອກ...</Typography> {/* Loading blog data... */}
      </Dialog>
    );
  }

  // If there was an error loading data
  if (error) {
    return (
      <Dialog 
        open={open} 
        onClose={onClose} 
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: '12px',
            overflow: 'hidden',
          }
        }}
      >
        <HeaderBar>
          <Typography variant="h6" sx={{ color: 'white', fontWeight: 600 }}>
            ແກ້ໄຂບົດຄວາມບລັອກ
          </Typography>
          <IconButton 
            onClick={onClose} 
            aria-label="close"
            sx={{ 
              color: 'white',
              '&:hover': {
                backgroundColor: 'rgba(255, 255, 255, 0.15)',
              }
            }}
          >
            <CloseIcon />
          </IconButton>
        </HeaderBar>
        
        <BlogDialogContent>
          <Box sx={{ 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center',
            justifyContent: 'center',
            py: 4 
          }}>
            <Typography variant="body1" color="error" sx={{ mb: 2 }}>
              ບໍ່ສາມາດໂຫຼດລາຍລະອຽດບລັອກໄດ້. ກະລຸນາລອງໃໝ່ອີກຄັ້ງ.
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              {error}
            </Typography>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <BlogButton 
                onClick={onClose} 
                variant="outlined"
              >
                ປິດ
              </BlogButton>
              <BlogButton 
                onClick={() => {
                  // Simulate retry in UI-only version
                  setError(null);
                  setFetchingData(true);
                  
                  setTimeout(() => {
                    if (initialBlogData) {
                      setBlog(initialBlogData);
                    } else {
                      // Mock data
                      setBlog({
                        id: blogId || "blog123",
                        userId: "user123",
                        title: "ຫົວຂໍ້ບລັອກຕົວຢ່າງ",
                        body: "ນີ້​ຄື​ເນື້ອ​ໃນ​ບລັອກ​ຕົວ​ຢ່າງ. ທ່ານ​ສາ​ມາດ​ແກ້​ໄຂ​ໄດ້!",
                        images: [
                          "https://via.placeholder.com/300",
                          "https://via.placeholder.com/300"
                        ],
                        isActive: true,
                        createdAt: new Date().toISOString(),
                        updatedAt: new Date().toISOString(),
                      });
                    }
                    setFetchingData(false);
                  }, 800);
                }} 
                variant="contained"
                startIcon={fetchingData ? <CircularProgress size={20} sx={{ color: 'white' }} /> : null}
                disabled={fetchingData}
              >
                ລອງໃໝ່
              </BlogButton>
            </Box>
          </Box>
        </BlogDialogContent>
      </Dialog>
    );
  }

  // If no blog is loaded yet
  if (!blog) {
    return null;
  }

  return (
    <>
      <Dialog 
        open={open} 
        onClose={onClose} 
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: '12px',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.15)',
            overflow: 'hidden',
          }
        }}
      >
        <HeaderBar>
          <Typography variant="h6" sx={{ color: 'white', fontWeight: 600 }}>
            ແກ້ໄຂບົດຄວາມບລັອກ
          </Typography>
          <IconButton 
            onClick={onClose} 
            aria-label="close"
            sx={{ 
              color: 'white',
              '&:hover': {
                backgroundColor: 'rgba(255, 255, 255, 0.15)',
              }
            }}
          >
            <CloseIcon />
          </IconButton>
        </HeaderBar>
        
        <BlogDialogContent>
          <Box sx={{ pt: 1, pb: 2 }}>
            <BlogTextField
              fullWidth
              label="ຫົວຂໍ້ບລັອກ" // Blog Title
              name="title"
              value={blog.title}
              onChange={handleInputChange}
              placeholder="ໃສ່ຫົວຂໍ້ບລັອກຂອງທ່ານ" // Enter your blog title
              variant="outlined"
              InputProps={{
                sx: { fontSize: '16px' }
              }}
            />
            
            <BlogTextField
              fullWidth
              label="ເນື້ອໃນບລັອກ" // Blog Content
              name="body"
              multiline
              rows={8}
              value={blog.body}
              onChange={handleInputChange}
              placeholder="ຂຽນເນື້ອໃນບລັອກຂອງທ່ານທີ່ນີ້..." // Write your blog content here...
              variant="outlined"
              InputProps={{
                sx: { fontSize: '15px' }
              }}
            />
            
            {/* Images preview and management */}
            {blog.images.length > 0 && (
              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 500 }}>
                  ຮູບພາບ
                </Typography>
                <ImageGrid>
                  {blog.images.map((image, index) => (
                    <ImagePreview key={index}>
                      <Box sx={{ position: 'absolute', top: 4, right: 4, zIndex: 1 }}>
                        <IconButton 
                          onClick={() => removeImage(index)} 
                          size="small"
                          sx={{
                            backgroundColor: 'rgba(255,255,255,0.9)',
                            '&:hover': {
                              backgroundColor: 'rgba(255,255,255,1)',
                            },
                          }}
                        >
                          <Delete fontSize="small" />
                        </IconButton>
                      </Box>
                      <img
                        src={image}
                        alt={`ຮູບພາບບລັອກ ${index + 1}`} 
                        style={{
                          width: '100%',
                          height: 120,
                          objectFit: 'cover',
                          borderRadius: 4
                        }}
                      />
                    </ImagePreview>
                  ))}
                </ImageGrid>
              </Box>
            )}
            
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
              <input
                accept="image/*"
                id="blog-image-input"
                type="file"
                multiple
                style={{ display: 'none' }}
                onChange={handleImageChange}
              />
              <label htmlFor="blog-image-input">
                <BlogButton
                  variant="outlined"
                  component="span"
                  startIcon={<AddPhotoAlternate />}
                >
                  ເພີ່ມຮູບພາບ
                </BlogButton>
              </label>
              
              <Box>
                <BlogButton 
                  onClick={onClose} 
                  variant="outlined"
                  sx={{ mr: 2 }}
                  disabled={loading}
                >
                  ຍົກເລີກ
                </BlogButton>
                <BlogButton 
                  onClick={handleSave} 
                  variant="contained" 
                  startIcon={loading ? <CircularProgress size={20} sx={{ color: 'white' }} /> : <Save />}
                  disabled={loading}
                >
                  {loading ? "ກຳລັງບັນທຶກ..." : "ບັນທຶກການປ່ຽນແປງ"}
                </BlogButton>
              </Box>
            </Box>
          </Box>
        </BlogDialogContent>
      </Dialog>
      
      <Snackbar 
        open={snackbar.open} 
        autoHideDuration={6000} 
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={handleCloseSnackbar} 
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
};

export default BlogEditDialog;