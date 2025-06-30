import React from 'react';
import {
  Button,
  Dialog,
  DialogContent,
  Typography,
  Box,
  Fade,
  Backdrop,
  Stack,
  Divider,
  alpha
} from '@mui/material';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import CloseIcon from '@mui/icons-material/Close';

interface HidePostConfirmDialogProps {
  open: boolean;
  postTitle: string;
  onClose: () => void;
  onConfirm: () => void;
}

const HidePostConfirmDialog: React.FC<HidePostConfirmDialogProps> = ({
  open,
  postTitle,
  onClose,
  onConfirm
}) => {
  const handleConfirm = () => {
    onConfirm();
    onClose();
  };
  
  return (
    <Dialog
      open={open}
      onClose={onClose}
      aria-labelledby="hide-post-dialog-title"
      aria-describedby="hide-post-dialog-description"
      maxWidth="sm"
      fullWidth
      TransitionComponent={Fade}
      TransitionProps={{ timeout: 300 }}
      BackdropComponent={Backdrop}
      BackdropProps={{ timeout: 500 }}
      PaperProps={{
        elevation: 8,
        sx: {
          borderRadius: 2,
          overflow: 'hidden',
          backgroundColor: (theme) => 
            theme.palette.mode === 'dark' 
              ? alpha(theme.palette.background.paper, 0.9) 
              : theme.palette.background.paper
        }
      }}
    >
      {/* Header */}
      <Box 
        sx={{ 
          p: 2.5,
          display: 'flex', 
          alignItems: 'center',
          justifyContent: 'space-between'
        }}
      >
        <Stack direction="row" spacing={1.5} alignItems="center">
          <Box
            sx={{
              backgroundColor: (theme) => alpha(theme.palette.primary.main, 0.1),
              borderRadius: '50%',
              p: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <VisibilityOffIcon 
              sx={{ 
                color: 'primary.main'
              }} 
            />
          </Box>
          <Typography variant="h6" fontWeight="600">
            Hide Post
          </Typography>
        </Stack>
        
        <Button
          sx={{
            minWidth: 'auto',
            p: 1,
            borderRadius: '50%',
            color: 'text.secondary',
            '&:hover': {
              backgroundColor: (theme) => alpha(theme.palette.text.secondary, 0.1)
            }
          }}
          onClick={onClose}
        >
          <CloseIcon fontSize="small" />
        </Button>
      </Box>
      
      <Divider />
      
      {/* Content */}
      <DialogContent sx={{ p: 3 }}>
        <Typography variant="body1" color="text.primary" sx={{ mb: 1 }}>
          Are you sure you want to hide this post?
        </Typography>
        
        <Typography 
          variant="body2" 
          color="text.secondary"
          sx={{
            fontStyle: 'italic',
            mb: 2,
            maxWidth: '100%',
            overflow: 'hidden',
            textOverflow: 'ellipsis'
          }}
        >
          "{postTitle}"
        </Typography>
        
        <Typography variant="body2" color="text.secondary">
          This post will no longer appear in your feed. You can manage hidden posts anytime in your account settings.
        </Typography>
      </DialogContent>
      
      {/* Actions */}
      <Box sx={{ p: 3, pt: 2, display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
        <Button 
          onClick={onClose} 
          variant="outlined"
          sx={{
            borderRadius: 1.5,
            px: 3,
            textTransform: 'none',
            fontWeight: 600
          }}
        >
          Cancel
        </Button>
        <Button 
          onClick={handleConfirm} 
          color="primary"
          variant="contained"
          startIcon={<VisibilityOffIcon />}
          sx={{
            borderRadius: 1.5,
            px: 3,
            boxShadow: 2,
            textTransform: 'none',
            fontWeight: 600
          }}
        >
          Hide Post
        </Button>
      </Box>
    </Dialog>
  );
};

export default HidePostConfirmDialog;