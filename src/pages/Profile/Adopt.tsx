import React, { useState, useEffect, useMemo } from "react";
import {
  Box,
  Card,
  Typography,
  Grid,
  Button,
  Chip,
  Container,
  Skeleton,
  Paper,
  Avatar,
  Fade,
  Tooltip,
  useMediaQuery,
  useTheme,
  IconButton,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
} from "@mui/material";

// Icons
import LocationOnRoundedIcon from "@mui/icons-material/LocationOnRounded";
import VerifiedRoundedIcon from "@mui/icons-material/VerifiedRounded";
import PetsRoundedIcon from "@mui/icons-material/PetsRounded";
import ErrorOutlineRoundedIcon from "@mui/icons-material/ErrorOutlineRounded";
import ReplayRoundedIcon from "@mui/icons-material/ReplayRounded";
import MaleRoundedIcon from "@mui/icons-material/MaleRounded";
import FemaleRoundedIcon from "@mui/icons-material/FemaleRounded";
import AddCircleOutlineRoundedIcon from "@mui/icons-material/AddCircleOutlineRounded";
import MoreVertRoundedIcon from "@mui/icons-material/MoreVertRounded";
import EditRoundedIcon from "@mui/icons-material/EditRounded";
import DeleteRoundedIcon from "@mui/icons-material/DeleteRounded";
import VisibilityRoundedIcon from "@mui/icons-material/VisibilityRounded";
import ShareRoundedIcon from "@mui/icons-material/ShareRounded";

// Types
import { Gender } from "../../enums/gender";
import axiosInstance from "../../configs/axios";

// Pet data interface
interface PetData {
  id: string;
  petName: string;
  image?: string;
  images?: string[];
  location?: {
    city: string;
    state: string;
  };
  gender: string;
  breed?: {
    breedName: string;
  };
  yearAge: number;
  monthAge: number;
  size: string;
  description?: string;
  isPremium?: boolean;
  petType?: string;
  userId?: string;
}

// User model interface
interface UserModel {
  id: string;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  age: string;
  roles: string;
  avatar: string;
  village: string;
  DOB: string;
  city: string;
  bio: string;
  tel: string;
  gender: Gender;
}

/**
 * Custom hook to fetch user profile
 */
const useUserProfile = (ownerId?: string) => {
  const [user, setUser] = useState<UserModel | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (ownerId) {
      setUser({ id: ownerId } as UserModel);
      return;
    }

    const fetchUserProfile = async () => {
      setLoading(true);
      try {
        const response = await axiosInstance.get('/auth/user/profile');
        setUser(response.data);
        setError(null);
      } catch (error) {
        console.error("Error fetching user profile:", error);
        setError("ບໍ່ສາມາດດຶງຂໍ້ມູນໂປຣໄຟລ໌ຜູ້ໃຊ້ໄດ້");
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, [ownerId]);

  return { user, loading, error };
};

/**
 * Custom hook to fetch pets
 */
const usePets = (userId: string | null, retryTrigger: number) => {
  const [pets, setPets] = useState<PetData[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) return;

    const fetchPets = async () => {
      setLoading(true);
      
      // Endpoints to try in sequence
      const endpoints = [
        { url: `/pets/user/${userId}`, method: 'path' },
        { url: '/pets', method: 'query', params: { userId } },
        { url: '/pet', method: 'query', params: { userId } },
        { url: `/users/${userId}/pets`, method: 'path' }
      ];

      let succeeded = false;
      let lastError = null;

      for (const endpoint of endpoints) {
        if (succeeded) break;
        
        try {
          let response;
          if (endpoint.method === 'path') {
            response = await axiosInstance.get(endpoint.url);
          } else {
            response = await axiosInstance.get(endpoint.url, { params: endpoint.params });
          }
          
          const petsData = response.data.data || response.data;
          setPets(petsData);
          setError(null);
          succeeded = true;
        } catch (error) {
          console.error(`Error with endpoint ${endpoint.url}:`, error);
          lastError = error;
        }
      }
      
      if (!succeeded) {
        setError("ບໍ່ສາມາດດຶງຂໍ້ມູນສັດລ້ຽງໄດ້. ຈຸດເຊື່ອມຕໍ່ API ອາດຈະມີການປ່ຽນແປງ.");
      }
      
      setLoading(false);
    };

    fetchPets();
  }, [userId, retryTrigger]);

  const removePet = (petId: string) => {
    setPets(prev => prev.filter(pet => pet.id !== petId));
  };

  return { pets, loading, error, removePet };
};

/**
 * Common UI components
 */
const EmptyState: React.FC<{ isOwner: boolean }> = ({ isOwner }) => (
  <Paper 
    elevation={0} 
    sx={{ 
      p: 4, 
      textAlign: "center", 
      borderRadius: 3,
      border: "1px solid rgba(0,0,0,0.08)",
      maxWidth: 600, 
      mx: "auto",
      transition: "transform 0.3s ease, box-shadow 0.3s ease",
      "&:hover": {
        transform: "translateY(-5px)",
        boxShadow: "0 8px 24px rgba(0,0,0,0.08)",
      }
    }}
  >
    <Box sx={{ 
      mb: 3, 
      width: 120, 
      height: 120, 
      borderRadius: '50%', 
      backgroundColor: 'rgba(153, 144, 218, 0.1)', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center', 
      margin: '0 auto' 
    }}>
      <PetsRoundedIcon sx={{ fontSize: 60, color: "#9990DA" }} />
    </Box>
    <Typography variant="h5" fontWeight={600} gutterBottom>
      ບໍ່ພົບສັດລ້ຽງ
    </Typography>
    <Typography variant="body1" color="text.secondary" sx={{ mb: 3, maxWidth: 400, mx: "auto" }}>
      {isOwner ? 
        "ເຈົ້າຍັງບໍ່ໄດ້ເພີ່ມສັດລ້ຽງໃດໆໃສ່ໂປຣໄຟລ໌ຂອງເຈົ້າເທື່ອ. ເພີ່ມໝູ່ສັດລ້ຽງຂອງເຈົ້າເພື່ອເລີ່ມຕົ້ນ!" : 
        "ຜູ້ໃຊ້ນີ້ຍັງບໍ່ມີສັດລ້ຽງລາຍຊື່ຢູ່ໃນໂປຣໄຟລ໌ຂອງເຂົາເຈົ້າເທື່ອ."
      }
    </Typography>
  </Paper>
);

const ErrorState: React.FC<{ error: string, onRetry: () => void }> = ({ error, onRetry }) => (
  <Paper 
    elevation={0} 
    sx={{ 
      p: 4, 
      textAlign: "center", 
      borderRadius: 3,
      border: "1px solid rgba(255,107,107,0.2)",
      maxWidth: 600, 
      mx: "auto",
      backgroundColor: "#FFF8F8",
      transition: "transform 0.3s ease",
      "&:hover": {
        transform: "translateY(-5px)",
      }
    }}
  >
    <Box sx={{ 
      mb: 3, 
      width: 120, 
      height: 120, 
      borderRadius: '50%', 
      backgroundColor: 'rgba(255,107,107,0.1)', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center', 
      margin: '0 auto' 
    }}>
      <ErrorOutlineRoundedIcon sx={{ fontSize: 60, color: "#ff6b6b" }} />
    </Box>
    <Typography variant="h5" color="error" fontWeight={600} gutterBottom>
      ມີບາງຢ່າງຜິດພາດ
    </Typography>
    <Typography variant="body1" color="text.secondary" sx={{ mb: 3, maxWidth: 450, mx: "auto" }}>
      {error || "ມີບັນຫາໃນການເຊື່ອມຕໍ່ກັບເຊີບເວີ. ນີ້ອາດຈະເປັນຍ້ອນບັນຫາເຄືອຂ່າຍ."}
    </Typography>
    <Button
      variant="contained"
      startIcon={<ReplayRoundedIcon />}
      onClick={onRetry}
      sx={{
        backgroundColor: "#9990DA",
        borderRadius: "20px",
        py: 1.5,
        px: 4,
        textTransform: "none",
        fontWeight: 600,
        "&:hover": {
          backgroundColor: "#8278c7",
        },
      }}
    >
      ລອງໃໝ່ອີກຄັ້ງ
    </Button>
  </Paper>
);

const LoadingState: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  return (
    <Container maxWidth="lg" sx={{ py: 2 }}>
      <Skeleton width="60px" height="60px" sx={{ mb: 4 }} />
      
      <Grid container spacing={3}>
        {[1, 2, 3].map((index) => (
          <Grid item xs={12} sm={6} md={4} key={index}>
            <Card sx={{ 
              borderRadius: 4, 
              overflow: 'hidden',
              height: '100%',
              boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
            }}>
              <Skeleton variant="rectangular" height={180} animation="wave" />
              <Box sx={{ p: 2 }}>
                <Skeleton variant="text" width="70%" height={32} sx={{ mb: 1 }} />
                <Skeleton variant="text" width="40%" height={24} sx={{ mb: 2 }} />
                <Skeleton variant="text" width="100%" height={20} sx={{ mb: 1 }} />
                <Skeleton variant="text" width="100%" height={20} sx={{ mb: 1 }} />
                <Skeleton variant="text" width="100%" height={20} sx={{ mb: 2 }} />
                <Skeleton variant="rectangular" height={36} width="100%" sx={{ borderRadius: 16 }} />
              </Box>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
};

/**
 * Pet Actions Menu Component
 */
interface PetActionsMenuProps {
  pet: PetData;
  isOwner: boolean;
  onEdit: (petId: string) => void;
  onDelete: (petId: string) => void;
  onShare: (petId: string) => void;
}

const PetActionsMenu: React.FC<PetActionsMenuProps> = ({ 
  pet, 
  isOwner, 
  onEdit, 
  onDelete, 
  onShare 
}) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
  };

  const handleClose = (event?: React.MouseEvent) => {
    event?.stopPropagation();
    setAnchorEl(null);
  };

  const handleAction = (action: () => void) => (event: React.MouseEvent) => {
    event.stopPropagation();
    action();
    handleClose();
  };

  return (
    <>
      <IconButton
        onClick={handleClick}
        sx={{
          position: "absolute",
          top: 8,
          right: 8,
          bgcolor: "rgba(255, 255, 255, 0.9)",
          backdropFilter: "blur(8px)",
          color: "#666",
          width: 36,
          height: 36,
          zIndex: 3,
          "&:hover": {
            bgcolor: "rgba(255, 255, 255, 0.95)",
            color: "#9990DA",
          },
        }}
      >
        <MoreVertRoundedIcon fontSize="small" />
      </IconButton>

      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        PaperProps={{
          sx: {
            borderRadius: "12px",
            boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
            border: "1px solid rgba(0,0,0,0.08)",
            minWidth: 180,
          },
        }}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
       
        {isOwner && (
          <>
            <MenuItem onClick={handleAction(() => window.open(`/edit-pet/${pet.id}`, '_blank'))}>
              <ListItemIcon>
                <EditRoundedIcon fontSize="small" sx={{ color: "#ff9800" }} />
              </ListItemIcon>
              <ListItemText>ແກ້ໄຂ</ListItemText>
            </MenuItem>

            <MenuItem onClick={handleAction(() => onDelete(pet.id))}>
              <ListItemIcon>
                <DeleteRoundedIcon fontSize="small" sx={{ color: "#f44336" }} />
              </ListItemIcon>
              <ListItemText sx={{ color: "#f44336" }}>ລຶບ</ListItemText>
            </MenuItem>
          </>
        )}
      </Menu>
    </>
  );
};

/**
 * Delete Confirmation Dialog
 */
interface DeleteConfirmDialogProps {
  open: boolean;
  petName: string;
  onConfirm: () => void;
  onCancel: () => void;
}

const DeleteConfirmDialog: React.FC<DeleteConfirmDialogProps> = ({
  open,
  petName,
  onConfirm,
  onCancel,
}) => {
  return (
    <Dialog
      open={open}
      onClose={onCancel}
      PaperProps={{
        sx: {
          borderRadius: "16px",
          p: 1,
        },
      }}
    >
      <DialogTitle sx={{ pb: 1 }}>
        <Typography variant="h6" fontWeight={600}>
          ຢືນຢັນການລຶບ
        </Typography>
      </DialogTitle>
      <DialogContent>
        <DialogContentText>
          ທ່ານແນ່ໃຈບໍ່ວ່າຕ້ອງການລຶບ <strong>{petName}</strong>? 
          ການກະທຳນີ້ບໍ່ສາມາດຍົກເລີກໄດ້.
        </DialogContentText>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button
          onClick={onCancel}
          sx={{
            borderRadius: "8px",
            color: "#666",
          }}
        >
          ຍົກເລີກ
        </Button>
        <Button
          onClick={onConfirm}
          variant="contained"
          color="error"
          sx={{
            borderRadius: "8px",
            fontWeight: 600,
          }}
        >
          ລຶບ
        </Button>
      </DialogActions>
    </Dialog>
  );
};

/**
 * Pet Card Component
 */
interface PetCardProps {
  pet: PetData;
  isOwner: boolean;
  onEdit: (petId: string) => void;
  onDelete: (petId: string) => void;
}

const PetCard: React.FC<PetCardProps> = ({ pet, isOwner, onEdit, onDelete }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [imageLoaded, setImageLoaded] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  // Get gender icon
  const GenderIcon = pet.gender?.toLowerCase() === 'male' ? MaleRoundedIcon : FemaleRoundedIcon;
  const genderColor = pet.gender?.toLowerCase() === 'male' ? '#2196f3' : '#e91e63';

  // Format age
  const formattedAge = useMemo(() => {
    if (pet.yearAge > 0) {
      return pet.monthAge > 0 
        ? `${pet.yearAge}year ${pet.monthAge}months` 
        : `${pet.yearAge} ${pet.yearAge === 1 ? 'ປີ' : 'ປີ'}`;
    }
    return `${pet.monthAge} ${pet.monthAge === 1 ? 'ເດືອນ' : 'ເດືອນ'}`;
  }, [pet.yearAge, pet.monthAge]);

  const handleEdit = (petId: string) => {
    onEdit(petId);
  };

  const handleDelete = (petId: string) => {
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    onDelete(pet.id);
    setDeleteDialogOpen(false);
  };

  const handleShare = (petId: string) => {
    // Handle share functionality
    if (navigator.share) {
      navigator.share({
        title: `${pet.petName} - ຫາບ້ານໃໝ່`,
        text: `ເບິ່ງສັດລ້ຽງທີ່ໜ້າຮັກນີ້! ${pet.petName} ກຳລັງຫາບ້ານໃໝ່`,
        url: `${window.location.origin}/adopt-detail/${petId}`,
      });
    } else {
      // Fallback to copying link
      navigator.clipboard.writeText(`${window.location.origin}/adopt-detail/${petId}`);
      // You could show a toast notification here
    }
  };

  return (
    <>
      <Fade in={true} timeout={500}>
        <Card
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          sx={{
            borderRadius: "20px",
            overflow: "hidden",
            display: "flex",
            flexDirection: "column",
            height: "90%",
            background: "linear-gradient(145deg, #ffffff, #f5f8ff)",
            boxShadow: isHovered 
              ? "0 16px 32px rgba(90, 55, 187, 0.1), 0 4px 10px rgba(90, 55, 187, 0.05), inset 0 1px 2px rgba(255, 255, 255, 0.9)" 
              : "0 8px 20px rgba(90, 55, 187, 0.07), inset 0 1px 2px rgba(255, 255, 255, 0.9)",
            border: "1px solid rgba(240, 240, 255, 0.8)",
            transition: "all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)",
            transform: isHovered ? "translateY(-10px) scale(1.02)" : "translateY(0) scale(1)",
            position: "relative",
            "&::after": {
              content: '""',
              position: "absolute",
              top: 0,
              left: 0,
              width: "60%",
              height: "60%",
              borderRadius: "20px",
              background: isHovered ? "linear-gradient(120deg, rgba(255,255,255,0.3), rgba(255,255,255,0))" : "none",
              zIndex: 1,
              opacity: 0.6,
              pointerEvents: "none",
            },
            backdropFilter: "blur(10px)",
          }}
        >
          <Box position="relative" sx={{ overflow: "hidden" }}>
            {/* Pet Image with loading state and gradient overlay */}
            <Box 
              sx={{ 
                backgroundColor: "#f0f4ff", 
                position: "relative",
                height: 240,
                "&::after": {
                  content: '""',
                  position: "absolute",
                  bottom: 0,
                  left: 0,
                  width: "100%",
                  height: "30%",
                  background: "linear-gradient(to top, rgba(0,0,0,0.5), rgba(0,0,0,0))",
                  zIndex: 1,
                }
              }}
            >
              {!imageLoaded && (
                <Skeleton 
                  variant="rectangular" 
                  width="100%" 
                  height={240} 
                  animation="wave" 
                  sx={{ position: "absolute", top: 0, left: 0 }} 
                />
              )}
              <img
                style={{
                  width: "100%",
                  height: 240,
                  objectFit: "cover",
                  display: imageLoaded ? "block" : "none",
                  transition: "transform 0.5s ease-out",
                  transform: isHovered ? "scale(1.05)" : "scale(1)",
                }}
                src={pet.image || (pet.images && pet.images.length > 0 ? pet.images[0] : "https://via.placeholder.com/300x240?text=No+Image")}
                alt={pet.petName}
                onLoad={() => setImageLoaded(true)}
              />
            </Box>

            {/* Pet Name overlay on image */}
            <Box 
              sx={{ 
                position: "absolute", 
                bottom: 0, 
                left: 0, 
                width: "100%",
                padding: "12px 16px",
                zIndex: 2,
              }}
            >
              <Typography
                variant="h5"
                component="h2"
                fontWeight={700}
                sx={{ 
                  color: "#ffffff",
                  fontSize: { xs: "1.25rem", md: "1.4rem" },
                  textShadow: "0 2px 4px rgba(0,0,0,0.3)",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {pet.petName}
              </Typography>
            </Box>

            {/* Actions Menu */}
            <PetActionsMenu
              pet={pet}
              isOwner={isOwner}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onShare={handleShare}
            />

            {/* Premium Badge with glow effect */}
            {pet.isPremium && (
              <Chip
                icon={<VerifiedRoundedIcon sx={{ fontSize: 16, color: "white" }} />}
                label="ພຣີມຽມ"
                size="small"
                sx={{
                  position: "absolute",
                  top: 16,
                  left: 16,
                  background: "linear-gradient(135deg, #9990DA, #8278c7)",
                  color: "white",
                  fontWeight: 600,
                  borderRadius: "16px",
                  boxShadow: "0 2px 8px rgba(153, 144, 218, 0.5)",
                  zIndex: 3,
                  border: "1px solid rgba(255,255,255,0.2)",
                  backdropFilter: "blur(4px)",
                  animation: isHovered ? "pulseGlow 2s infinite ease-in-out" : "none",
                  "@keyframes pulseGlow": {
                    "0%": { boxShadow: "0 0 8px rgba(153, 144, 218, 0.5)" },
                    "50%": { boxShadow: "0 0 16px rgba(153, 144, 218, 0.8)" },
                    "100%": { boxShadow: "0 0 8px rgba(153, 144, 218, 0.5)" }
                  }
                }}
              />
            )}

            {/* Pet Type Badge with animated border */}
            {pet.petType && (
              <Chip
                label={pet.petType}
                size="small"
                sx={{
                  position: "absolute",
                  top: pet.isPremium ? 58 : 16,
                  left: 16,
                  background: "linear-gradient(135deg, #5B5FEF, #4347e5)",
                  color: "white",
                  fontWeight: 600,
                  borderRadius: "16px",
                  zIndex: 3,
                  border: "1px solid rgba(255,255,255,0.2)",
                  boxShadow: "0 2px 8px rgba(91, 95, 239, 0.3)",
                }}
              />
            )}
          </Box>

          <Box 
            sx={{ 
              p: 2.5, 
              pt: 2, 
              flexGrow: 1, 
              display: "flex", 
              flexDirection: "column",
              background: "linear-gradient(180deg, rgba(255,255,255,0.9) 0%, rgba(247,249,255,0.9) 100%)",
            }}
          >
            {/* Gender and Location row */}
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                mb: 2,
              }}
            >
              {/* Gender Badge */}
              <Tooltip title={`${pet.gender}`}>
                <Box sx={{ display: "flex", alignItems: "center" }}>
                  <Avatar
                    sx={{ 
                      bgcolor: `${genderColor}10`, 
                      color: genderColor,
                      width: 28, 
                      height: 28,
                      boxShadow: `0 2px 8px ${genderColor}20`,
                      border: `1px solid ${genderColor}30`,
                    }}
                  >
                    <GenderIcon fontSize="small" />
                  </Avatar>
                  <Typography
                    sx={{
                      ml: 1,
                      fontWeight: 600,
                      fontSize: "0.875rem",
                      color: genderColor,
                    }}
                  >
                    {pet.gender}
                  </Typography>
                </Box>
              </Tooltip>
              
              {/* Location */}
              {pet.location && (
                <Box sx={{ display: "flex", alignItems: "center" }}>
                  <LocationOnRoundedIcon
                    sx={{
                      color: "#9990DA",
                      fontSize: 20,
                    }}
                  />
                  <Typography
                    color="text.secondary"
                    sx={{
                      fontWeight: 500,
                      fontSize: "0.875rem",
                      ml: 0.5,
                    }}
                  >
                    {pet.location.city}, {pet.location.state}
                  </Typography>
                </Box>
              )}
            </Box>

            {/* Details Table-like Cards with improved styling */}
            <Box 
              sx={{ 
                display: "grid", 
                gridTemplateColumns: "1fr 1fr", 
                gap: 1.5, 
                mb: 2.5,
                flexGrow: 1,
              }}
            >
              {/* Age */}
              <Box 
                sx={{ 
                  p: 1.5, 
                  borderRadius: 2, 
                  background: isHovered 
                    ? "linear-gradient(145deg, rgba(153, 144, 218, 0.12), rgba(153, 144, 218, 0.08))"
                    : "rgba(153, 144, 218, 0.08)",
                  display: "flex",
                  flexDirection: "column",
                  transition: "all 0.3s ease",
                  border: "1px solid rgba(153, 144, 218, 0.12)",
                  boxShadow: isHovered 
                    ? "0 4px 12px rgba(153, 144, 218, 0.1)" 
                    : "none",
                }}
              >
                <Typography variant="caption" color="text.secondary" fontWeight={500} sx={{ opacity: 0.8 }}>
                  ອາຍຸ
                </Typography>
                <Typography variant="body2" fontWeight={700} color="#3f3d56">
                  {formattedAge}
                </Typography>
              </Box>
              
              {/* Size - with enhanced table-like styling */}
              <Box 
                sx={{ 
                  p: 1.5, 
                  borderRadius: 2, 
                  background: isHovered 
                    ? "linear-gradient(145deg, rgba(153, 144, 218, 0.12), rgba(153, 144, 218, 0.08))"
                    : "rgba(153, 144, 218, 0.08)",
                  display: "flex",
                  flexDirection: "column",
                  transition: "all 0.3s ease",
                  border: "1px solid rgba(153, 144, 218, 0.12)",
                  boxShadow: isHovered 
                    ? "0 4px 12px rgba(153, 144, 218, 0.1)" 
                    : "none",
                  position: "relative",
                  "&::after": {
                    content: '""',
                    position: "absolute",
                    bottom: 0,
                    left: 0,
                    width: "100%",
                    height: "2px",
                    background: "linear-gradient(90deg, rgba(153, 144, 218, 0.4), rgba(153, 144, 218, 0.1))",
                    borderRadius: "0 0 8px 8px",
                  }
                }}
              >
                <Typography variant="caption" color="text.secondary" fontWeight={500} sx={{ opacity: 0.8 }}>
                  ຂະໜາດ
                </Typography>
                <Typography 
                  variant="body2" 
                  fontWeight={700} 
                  color="#3f3d56"
                  sx={{
                    padding: "4px 0",
                    borderRadius: "4px",
                    textAlign: "left",
                  }}
                >
                  {pet.size}
                </Typography>
              </Box>
              
              {/* Breed - takes full width */}
              <Box 
                sx={{ 
                  p: 1.5, 
                  borderRadius: 2, 
                  background: isHovered 
                    ? "linear-gradient(145deg, rgba(153, 144, 218, 0.12), rgba(153, 144, 218, 0.08))"
                    : "rgba(153, 144, 218, 0.08)",
                  gridColumn: "1 / span 2",
                  display: "flex",
                  flexDirection: "column",
                  transition: "all 0.3s ease",
                  border: "1px solid rgba(153, 144, 218, 0.12)",
                  boxShadow: isHovered 
                    ? "0 4px 12px rgba(153, 144, 218, 0.1)" 
                    : "none",
                }}
              >
                <Typography variant="caption" color="text.secondary" fontWeight={500} sx={{ opacity: 0.8 }}>
                  ສາຍພັນ
                </Typography>
                <Typography 
                  variant="body2" 
                  fontWeight={700} 
                  color="#3f3d56"
                  sx={{
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {pet.breed?.breedName || "ບໍ່ຮູ້ຈັກ"}
                </Typography>
              </Box>
            </Box>

            {/* Description with styled blockquote effect */}
            {pet.description && (
              <Box 
                sx={{ 
                  mb: 2.5,
                  position: "relative",
                  pl: 1.5,
                  "&::before": {
                    content: '""',
                    position: "absolute",
                    left: 0,
                    top: 0,
                    bottom: 0,
                    width: "4px",
                    borderRadius: "4px",
                    background: "linear-gradient(180deg, #9990DA, rgba(153, 144, 218, 0.4))",
                  }
                }}
              >
                <Typography
                  color="text.secondary"
                  sx={{
                    fontSize: "0.95rem",
                    display: "-webkit-box",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: "vertical",
                    lineHeight: 1.5,
                    fontStyle: "italic",
                    opacity: 0.9,
                  }}
                >
                  {pet.description.length > 65 ? `${pet.description.substring(0, 65)}...` : pet.description}
                </Typography>
              </Box>
            )}

            {/* View Profile Button with improved animation */}
            <Button
              variant="contained"
              fullWidth
              href={`/adopt-detail/${pet.id}`}
              sx={{
                background: isHovered 
                  ? "linear-gradient(135deg, #8278c7, #9990DA)"
                  : "linear-gradient(135deg, #9990DA, #8278c7)",
                borderRadius: "16px",
                textTransform: "none",
                py: 1.2,
                fontSize: "1rem",
                fontWeight: 700,
                letterSpacing: "0.5px",
                boxShadow: isHovered 
                  ? "0 8px 20px rgba(153, 144, 218, 0.5), 0 2px 6px rgba(153, 144, 218, 0.3)" 
                  : "0 4px 12px rgba(153, 144, 218, 0.3)",
                border: "1px solid rgba(255,255,255,0.2)",
                position: "relative",
                overflow: "hidden",
                transition: "all 0.3s ease",
                "&:hover": {
                  boxShadow: "0 10px 24px rgba(153, 144, 218, 0.6), 0 4px 8px rgba(153, 144, 218, 0.4)",
                  transform: "translateY(-2px)",
                },
                "&::before": {
                  content: '""',
                  position: "absolute",
                  top: 0,
                  left: "-100%",
                  width: "100%",
                  height: "100%",
                  background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)",
                  transition: "all 0.6s ease",
                  transform: isHovered ? "translateX(200%)" : "translateX(0)",
                }
              }}
            >
              ເບິ່ງໂປຣໄຟລ໌
            </Button>
          </Box>
        </Card>
      </Fade>

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmDialog
        open={deleteDialogOpen}
        petName={pet.petName}
        onConfirm={confirmDelete}
        onCancel={() => setDeleteDialogOpen(false)}
      />
    </>
  );
};

/**
 * Main Component
 */
interface OwnerPetsDisplayProps {
  ownerId?: string;
  onEditPet?: (petId: string) => void;
}

const OwnerPetsDisplay: React.FC<OwnerPetsDisplayProps> = ({ ownerId, onEditPet }) => {
  const [retryCount, setRetryCount] = useState<number>(0);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  // Custom hooks for data fetching
  const { user, loading: userLoading, error: userError } = useUserProfile(ownerId);
  const { pets, loading: petsLoading, error: petsError, removePet } = usePets(user?.id || null, retryCount);

  // Handle retry
  const handleRetry = () => setRetryCount(prev => prev + 1);

  // Handle pet edit
  const handleEditPet = (petId: string) => {
    if (onEditPet) {
      onEditPet(petId);
    } else {
      // Default behavior - navigate to edit page
      window.location.href = `/pets/edit/${petId}`;
    }
  };

  // Handle pet delete
  const handleDeletePet = async (petId: string) => {
    try {
      // Make API call to delete pet
      await axiosInstance.delete(`/pets/${petId}`);
      
      // Remove pet from local state
      removePet(petId);
      
      // You could show a success message here
      console.log("Pet deleted successfully");
    } catch (error) {
      console.error("Error deleting pet:", error);
      // You could show an error message here
    }
  };

  // Determine loading, error and empty states
  const isLoading = userLoading || (user?.id && petsLoading);
  const error = userError || petsError;
  const isEmpty = !isLoading && !error && pets.length === 0;
  const isOwner = !ownerId;

  // Show loading state
  if (isLoading) {
    return <LoadingState />;
  }

  // Show error state
  if (error) {
    return <ErrorState error={error} onRetry={handleRetry} />;
  }

  // Show empty state
  if (isEmpty) {
    return <EmptyState isOwner={isOwner} />;
  }

  // Show pets grid with exactly 3 cards per row
  return (
    <Container maxWidth="lg" sx={{ py: { xs: 3, md: 4 } }}>
      <Box sx={{ 
        display: "flex", 
        justifyContent: "space-between", 
        alignItems: "center", 
        mb: { xs: 3, md: 4 } 
      }}>
        <Typography
          variant="h4"
          component="h1"
          sx={{ 
            fontWeight: 700, 
            color: "#3f3d56",
            fontSize: { xs: "1.5rem", md: "2rem" }
          }}
        >
          {isOwner ? "ສັດລ້ຽງຂອງຂ້ອຍ" : "ສັດລ້ຽງຂອງຜູ້ໃຊ້"}
        </Typography>
        
        {isOwner && (
          <Button
            variant="outlined"
            startIcon={<AddCircleOutlineRoundedIcon />}
            href="/Sell"
            sx={{
              color: "#9990DA",
              borderColor: "#9990DA",
              borderRadius: "20px",
              textTransform: "none",
              fontWeight: 600,
              "&:hover": {
                borderColor: "#8278c7",
                backgroundColor: "rgba(153, 144, 218, 0.04)",
              },
            }}
          >
            ເພີ່ມສັດລ້ຽງ
          </Button>
        )}
      </Box>

      <Grid container spacing={3}>
        {pets.map((pet) => (
          <Grid item xs={12} sm={6} md={4} key={pet.id}>
            <PetCard 
              pet={pet} 
              isOwner={isOwner}
              onEdit={handleEditPet}
              onDelete={handleDeletePet}
            />
          </Grid>
        ))}
      </Grid>
    </Container>
  );
};

export default OwnerPetsDisplay;