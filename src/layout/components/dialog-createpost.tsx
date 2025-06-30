import React, { useState, ChangeEvent } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  Typography,
  IconButton,
  Divider,
  CircularProgress,
  Snackbar,
  Alert
} from '@mui/material';
import {
  Close as CloseIcon,
  CloudUpload as CloudUploadIcon
} from '@mui/icons-material';
import axiosInstance from '../../configs/axios';
import { styled } from '@mui/system';

// Type definitions
interface CreatePostDialogProps {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

// Custom styled components
const ImageUploadBox = styled(Box)(() => ({
  border: '2px dashed #ccc',
  borderRadius: '8px',
  padding: '24px',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  backgroundColor: 'rgba(0, 0, 0, 0.02)',
  cursor: 'pointer',
  transition: 'all 0.2s ease',
  '&:hover': {
    borderColor: '#9990DA',
    backgroundColor: 'rgba(153, 144, 218, 0.05)',
  },
}));

const PreviewImage = styled('img')({
  width: '100%',
  height: '200px',
  objectFit: 'cover',
  borderRadius: '8px',
  marginBottom: '8px',
});

const CreatePostDialog: React.FC<CreatePostDialogProps> = ({ open, onClose, onSuccess }) => {
  // State management
  const [postTitle, setPostTitle] = useState<string>('');
  const [postBody, setPostBody] = useState<string>('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [snackbarOpen, setSnackbarOpen] = useState<boolean>(false);
  const [snackbarMessage, setSnackbarMessage] = useState<string>('');
  const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error'>('success');

  // Image upload handling
  const handleImageUpload = (event: ChangeEvent<HTMLInputElement>): void => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      
      // Check file size (20MB max)
      if (file.size > 20 * 1024 * 1024) {
        setError('File size exceeds 20MB limit');
        return;
      }
      
      setImageFile(file);
      
      // Create preview URL
      const previewUrl = URL.createObjectURL(file);
      setImagePreview(previewUrl);
    }
  };

  // Remove uploaded image
  const handleRemoveImage = (): void => {
    if (imagePreview) {
      URL.revokeObjectURL(imagePreview);
    }
    setImageFile(null);
    setImagePreview(null);
  };

  // Snackbar handling
  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };

  // Show notification
  const showNotification = (message: string, severity: 'success' | 'error') => {
    setSnackbarMessage(message);
    setSnackbarSeverity(severity);
    setSnackbarOpen(true);
  };

  // Post submission
  const handleSubmitPost = async (): Promise<void> => {
    // Validation checks
    if (!postTitle.trim()) {
      setError('Please add a title for your post');
      return;
    }
    
    if (!postBody.trim()) {
      setError('Please add content to your post');
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);
      
      // Create FormData for the API request
      const formData = new FormData();
      formData.append('title', postTitle);
      formData.append('body', postBody);
      
      // Add image if selected (optional)
      if (imageFile) {
        formData.append('images', imageFile);
      }
      
      // Send the request to the API
      const response = await axiosInstance.post('/blog', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        // Add timeout to prevent hanging requests
        timeout: 30000,
      });
      
      // Handle successful response
      console.log('Post created successfully:', response.data);
      
      // Show success notification
      showNotification('Post created successfully!', 'success');
      
      // Clear form and close dialog
      resetForm();
      
      // Call onSuccess callback if provided
      if (onSuccess) {
        onSuccess();
      }
      
      onClose();
      
    } catch (err: any) {
      console.error('Error creating post:', err);
      const errorMessage = err.response?.data?.message || 'Failed to create post. Please try again.';
      setError(errorMessage);
      showNotification(errorMessage, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Reset form 
  const resetForm = (): void => {
    setPostTitle('');
    setPostBody('');
    if (imagePreview) {
      URL.revokeObjectURL(imagePreview);
    }
    setImageFile(null);
    setImagePreview(null);
    setError(null);
  };

  // Close dialog handler
  const handleClose = (): void => {
    resetForm();
    onClose();
  };

  return (
    <>
      <Dialog 
        open={open} 
        onClose={handleClose} 
        maxWidth="md" 
        fullWidth
        PaperProps={{
          sx: { 
            borderRadius: 2,
            width: { xs: '100%', sm: '600px' }  
          }
        }}
      >
        <DialogTitle sx={{ px: 3, py: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6" fontWeight={600}>ສ້າງບົດຄວາມ</Typography>
            <IconButton onClick={handleClose} size="small">
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        
        <Divider />
        
        <DialogContent sx={{ p: 0 }}>
          <Box sx={{ p: 3 }}>
            {/* Post Title */}
            <TextField
              fullWidth
              placeholder="ຫົວຂໍ້ບົດຄວາມ"
              value={postTitle}
              onChange={(e) => setPostTitle(e.target.value)}
              variant="outlined"
              size="small"
              sx={{ mb: 2 }}
              inputProps={{ maxLength: 300 }}
            />
            
            {/* Post Content */}
            <TextField
              fullWidth
              placeholder="ຂຽນເນື້ອໃນໂພສຂອງທ່ານທີ່ນີ້..."
              value={postBody}
              onChange={(e) => setPostBody(e.target.value)}
              variant="outlined"
              multiline
              rows={6}
              sx={{ mb: 2 }}
            />
            
            {/* Image Upload (Optional) */}
            <Box sx={{ mb: 2 }}>
              <Typography variant="body2" sx={{ mb: 1 }}>
                ເພີ່ມຮູບພາບ 
              </Typography>
              
              {imagePreview ? (
                <Box sx={{ position: 'relative' }}>
                  <PreviewImage src={imagePreview} alt="Upload preview" />
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2" color="text.secondary">
                      {imageFile?.name}
                    </Typography>
                    <Button 
                      size="small" 
                      color="error" 
                      onClick={handleRemoveImage}
                      sx={{ textTransform: 'none' }}
                    >
                      ລົບຮູບພາບ
                    </Button>
                  </Box>
                </Box>
              ) : (
                <>
                  <input
                    accept="image/*"
                    style={{ display: 'none' }}
                    id="image-upload-input"
                    type="file"
                    onChange={handleImageUpload}
                  />
                  <label htmlFor="image-upload-input">
                    <ImageUploadBox>
                      <CloudUploadIcon sx={{ fontSize: 48, color: '#9990DA', mb: 2 }} />
                      <Typography variant="body1" sx={{ mb: 1, fontWeight: 500 }}>
                        ອັບໂຫຼດຮູບພາບ
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        PNG, JPG, GIF up to 20MB
                      </Typography>
                    </ImageUploadBox>
                  </label>
                </>
              )}
            </Box>
            
            {/* Error Message */}
            {error && (
              <Typography variant="body2" color="error" sx={{ mb: 2 }}>
                {error}
              </Typography>
            )}
          </Box>
        </DialogContent>
        
        <Divider />
        
        <DialogActions sx={{ p: 2 }}>
          <Button 
            onClick={handleClose} 
            sx={{ 
              color: '#9e9e9e',
              textTransform: 'none',
              fontWeight: 500
            }}
          >
            ຍົກເລິກ
          </Button>
          <Button
            variant="contained"
            onClick={handleSubmitPost}
            disabled={isSubmitting}
            startIcon={isSubmitting ? <CircularProgress size={20} /> : null}
            sx={{ 
              bgcolor: '#9990DA',
              '&:hover': {
                bgcolor: '#8278c7',
              },
              textTransform: 'none',
              fontWeight: 500,
              px: 3,
              borderRadius: '20px'
            }}
          >
            {isSubmitting ? 'ກຳລັງອັບໂຫຼດ...' : 'ອັບໂຫຼດ'}
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Success/Error Notification */}
      <Snackbar 
        open={snackbarOpen} 
        autoHideDuration={6000} 
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={handleSnackbarClose} 
          severity={snackbarSeverity} 
          sx={{ width: '100%' }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </>
  );
};

export default CreatePostDialog;