import React, { useState, useEffect } from "react";
import {
  Box,
  Card,
  Typography,
  Grid,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Container,
  IconButton,
  Chip,
  InputAdornment,
  Alert,
  Skeleton,
  Divider,
  Snackbar,
  CircularProgress,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import axiosInstance from "../../configs/axios";

// Icons
import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import SaveRoundedIcon from "@mui/icons-material/SaveRounded";
import PhotoCameraRoundedIcon from "@mui/icons-material/PhotoCameraRounded";
import DeleteRoundedIcon from "@mui/icons-material/DeleteRounded";
import AddPhotoAlternateRoundedIcon from "@mui/icons-material/AddPhotoAlternateRounded";
import MaleRoundedIcon from "@mui/icons-material/MaleRounded";
import FemaleRoundedIcon from "@mui/icons-material/FemaleRounded";
import PetsRoundedIcon from "@mui/icons-material/PetsRounded";
import AttachMoneyRoundedIcon from "@mui/icons-material/AttachMoneyRounded";
import ScaleRoundedIcon from "@mui/icons-material/ScaleRounded";
import HeightRoundedIcon from "@mui/icons-material/HeightRounded";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import ErrorRoundedIcon from "@mui/icons-material/ErrorRounded";
import { useParams, useNavigate } from "react-router-dom";

// Types matching your API
interface PetFormData {
  id?: string;
  userId?: string;
  breedId?: string;
  petType: "DOG" | "CAT";
  petName: string;
  size: "SMALL" | "MEDIUM" | "LARGE";
  bio?: string;
  images?: File[];
  documentImages?: File[];
  price?: number;
  yearAge: number;
  monthAge: number;
  color?: string;
  weight?: number;
  height?: number;
  status: "AVAILABLE" | "SOLD";
  gender: "MALE" | "FEMALE";
  isActive: boolean;
}

interface PetApiResponse {
  id: string;
  userId: string;
  breedId?: string;
  petType: "DOG" | "CAT";
  petName: string;
  size: "SMALL" | "MEDIUM" | "LARGE";
  bio?: string;
  images: string[];
  documentImages: string[];
  price: number;
  yearAge: number;
  monthAge: number;
  color?: string;
  weight?: number;
  height?: number;
  status: "AVAILABLE" | "SOLD";
  gender: "MALE" | "FEMALE";
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// Image state for better tracking
interface ImageState {
  url: string;
  isExisting: boolean;
  file?: File;
  toDelete?: boolean;
}

// Styled Components
const StyledCard = styled(Card)(() => ({
  borderRadius: "24px",
  background: "linear-gradient(145deg, #ffffff, #f8faff)",
  boxShadow: "0 8px 32px rgba(90, 55, 187, 0.08)",
  border: "1px solid rgba(240, 240, 255, 0.8)",
  overflow: "hidden",
}));

const ImageUploadBox = styled(Box)(() => ({
  width: "100%",
  height: 200,
  border: "2px dashed #9990DA",
  borderRadius: "16px",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  cursor: "pointer",
  transition: "all 0.3s ease",
  background:
    "linear-gradient(145deg, rgba(153, 144, 218, 0.02), rgba(153, 144, 218, 0.05))",
  "&:hover": {
    borderColor: "#8278c7",
    background:
      "linear-gradient(145deg, rgba(153, 144, 218, 0.05), rgba(153, 144, 218, 0.08))",
    transform: "translateY(-2px)",
  },
}));

const StyledTextField = styled(TextField)({
  "& .MuiOutlinedInput-root": {
    borderRadius: "12px",
    "&:hover fieldset": { borderColor: "#9990DA" },
    "&.Mui-focused fieldset": { borderColor: "#9990DA" },
  },
});

const StyledSelect = styled(Select)({
  borderRadius: "12px",
  "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: "#9990DA" },
  "&.Mui-focused .MuiOutlinedInput-notchedOutline": { borderColor: "#9990DA" },
});

interface PetEditPageProps {
  onSave?: (petData: PetFormData) => Promise<void>;
  onCancel?: () => void;
}

const PetEditPage: React.FC<PetEditPageProps> = ({ onSave, onCancel }) => {
  const { id } = useParams();
  const navigate = useNavigate(); // Add navigation hook
  
  const [formData, setFormData] = useState<PetFormData>({
    petType: "String" as "DOG" | "CAT",
    petName: "String",
    size: "String" as "SMALL" | "MEDIUM" | "LARGE",
    yearAge: 0,
    monthAge: 0,
    gender: "String" as "MALE" | "FEMALE",
    status: "String" as "AVAILABLE" | "SOLD",
    isActive: true,
  });

  const [loading, setLoading] = useState<boolean>(!!id);
  const [saving, setSaving] = useState<boolean>(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Better image state management
  const [images, setImages] = useState<ImageState[]>([]);
  const [documentImages, setDocumentImages] = useState<ImageState[]>([]);

  // Store original data for comparison
  const [originalData, setOriginalData] = useState<PetApiResponse | null>(null);
  const [showOriginalInfo, setShowOriginalInfo] = useState<boolean>(false);

  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: "success" | "error" | "info" | "warning";
  }>({
    open: false,
    message: "",
    severity: "info",
  });

  // Handle back navigation
  const handleGoBack = () => {
    if (onCancel) {
      onCancel(); // Use the provided onCancel function if available
    } else {
      // Check if we came from pets display page
      const referrer = document.referrer;
      const currentOrigin = window.location.origin;
      
      // If referrer contains pets/profile/dashboard, go back there
      if (referrer && referrer.includes(currentOrigin) && 
          (referrer.includes('/profile') || referrer.includes('/pets') || referrer.includes('/dashboard'))) {
        navigate(-1); // Go back to the previous page
      } else {
        // Default fallback to profile page which should show OwnerPetsDisplay
        navigate('/Blog-profile'); 
      }
    }
  };

  const fetchPetData = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get<{ data: PetApiResponse }>(
        `/pets/${id}`
      );
      const petData = response.data.data;

      // Store original data for reference
      setOriginalData(petData);

      setFormData({
        id: petData.id,
        userId: petData.userId,
        breedId: petData.breedId,
        petType: petData.petType,
        petName: petData.petName,
        size: petData.size,
        bio: petData.bio,
        price: petData.price,
        yearAge: petData.yearAge,
        monthAge: petData.monthAge,
        color: petData.color,
        weight: petData.weight,
        height: petData.height,
        status: petData.status,
        gender: petData.gender,
        isActive: petData.isActive,
      });

      // Set existing images with proper state tracking
      if (petData.images && petData.images.length > 0) {
        const existingImages: ImageState[] = petData.images.map((url) => ({
          url,
          isExisting: true,
        }));
        setImages(existingImages);
      }

      // Set existing document images
      if (petData.documentImages && petData.documentImages.length > 0) {
        const existingDocImages: ImageState[] = petData.documentImages.map(
          (url) => ({
            url,
            isExisting: true,
          })
        );
        setDocumentImages(existingDocImages);
      }
    } catch (error) {
      console.error("Error fetching pet data:", error);
      showSnackbar("ບໍ່ສາມາດດຶງຂໍ້ມູນສັດລ້ຽງໄດ້", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange =
    (field: keyof PetFormData) =>
    (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const value =
        event.target.type === "number"
          ? Number(event.target.value)
          : event.target.value;
      setFormData((prev) => ({
        ...prev,
        [field]: value,
      }));
      // Clear error when user starts typing
      if (errors[field]) {
        setErrors((prev) => ({ ...prev, [field]: "" }));
      }
    };

  const handleImageUpload = (
    event: React.ChangeEvent<HTMLInputElement>,
    type: "images" | "documentImages" = "images"
  ) => {
    const files = event.target.files;
    if (files) {
      const newFileArray = Array.from(files);

      newFileArray.forEach((file) => {
        const reader = new FileReader();
        reader.onload = (e) => {
          const newImageState: ImageState = {
            url: e.target?.result as string,
            isExisting: false,
            file: file,
          };

          if (type === "images") {
            setImages((prev) => [...prev, newImageState]);
          } else {
            setDocumentImages((prev) => [...prev, newImageState]);
          }
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const removeImage = (
    index: number,
    type: "images" | "documentImages" = "images"
  ) => {
    if (type === "images") {
      setImages((prev) => prev.filter((_, i) => i !== index));
    } else {
      setDocumentImages((prev) => prev.filter((_, i) => i !== index));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.petName.trim()) {
      newErrors.petName = "ກະລຸນາໃສ່ຊື່ສັດລ້ຽງ";
    }

    if (formData.yearAge < 0 || formData.monthAge < 0) {
      newErrors.age = "ອາຍຸຕ້ອງບໍ່ໃຫ້ຕິດລົບ";
    }

    if (formData.yearAge === 0 && formData.monthAge === 0) {
      newErrors.age = "ກະລຸນາໃສ່ອາຍຸສັດລ້ຽງ";
    }

    if (formData.monthAge > 11) {
      newErrors.monthAge = "ເດືອນຕ້ອງບໍ່ເກີນ 11";
    }

    if (formData.price && formData.price < 0) {
      newErrors.price = "ລາຄາຕ້ອງບໍ່ຕິດລົບ";
    }

    if (formData.weight && formData.weight < 0) {
      newErrors.weight = "ນ້ຳໜັກຕ້ອງບໍ່ຕິດລົບ";
    }

    if (formData.height && formData.height < 0) {
      newErrors.height = "ຄວາມສູງຕ້ອງບໍ່ຕິດລົບ";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const showSnackbar = (
    message: string,
    severity: "success" | "error" | "info" | "warning"
  ) => {
    setSnackbar({ open: true, message, severity });
  };

  const resetToOriginal = () => {
    if (originalData) {
      setFormData({
        id: originalData.id,
        userId: originalData.userId,
        breedId: originalData.breedId,
        petType: originalData.petType,
        petName: originalData.petName,
        size: originalData.size,
        bio: originalData.bio,
        price: originalData.price,
        yearAge: originalData.yearAge,
        monthAge: originalData.monthAge,
        color: originalData.color,
        weight: originalData.weight,
        height: originalData.height,
        status: originalData.status,
        gender: originalData.gender,
        isActive: originalData.isActive,
      });

      // Reset images
      if (originalData.images && originalData.images.length > 0) {
        const existingImages: ImageState[] = originalData.images.map((url) => ({
          url,
          isExisting: true,
        }));
        setImages(existingImages);
      } else {
        setImages([]);
      }

      // Reset document images
      if (
        originalData.documentImages &&
        originalData.documentImages.length > 0
      ) {
        const existingDocImages: ImageState[] = originalData.documentImages.map(
          (url) => ({
            url,
            isExisting: true,
          })
        );
        setDocumentImages(existingDocImages);
      } else {
        setDocumentImages([]);
      }

      // Clear errors
      setErrors({});
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("lo-LA", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "AVAILABLE":
        return "ພ້ອມຂາຍ";
      case "SOLD":
        return "ຂາຍແລ້ວ";
      default:
        return status;
    }
  };

  const getSizeText = (size: string) => {
    switch (size) {
      case "SMALL":
        return "ນ້ອຍ";
      case "MEDIUM":
        return "ກາງ";
      case "LARGE":
        return "ໃຫຍ່";
      default:
        return size;
    }
  };

  const hasChanged = (field: keyof PetFormData) => {
    if (!originalData || !id) return false;
    return formData[field] !== originalData[field as keyof PetApiResponse];
  };

  const getFieldProps = (field: keyof PetFormData) => {
    const changed = hasChanged(field);
    return {
      sx: changed
        ? {
            "& .MuiOutlinedInput-root": {
              backgroundColor: "rgba(255, 193, 7, 0.1)",
              "& fieldset": { borderColor: "#ffc107" },
            },
          }
        : {},
    };
  };

  const prepareFormData = (): FormData => {
    const formDataToSend = new FormData();

    // Add basic fields
    formDataToSend.append("petName", formData.petName);
    formDataToSend.append("size", formData.size);
    formDataToSend.append("gender", formData.gender);
    formDataToSend.append("yearAge", formData.yearAge.toString());
    formDataToSend.append("monthAge", formData.monthAge.toString());
    formDataToSend.append("status", formData.status);
    formDataToSend.append("isActive", formData.isActive.toString());

    // Add optional fields if they exist
    if (formData.bio) formDataToSend.append("bio", formData.bio);
    if (formData.price)
      formDataToSend.append("price", formData.price.toString());
    if (formData.color) formDataToSend.append("color", formData.color);
    if (formData.weight)
      formDataToSend.append("weight", formData.weight.toString());
    if (formData.height)
      formDataToSend.append("height", formData.height.toString());
    if (formData.breedId) formDataToSend.append("breedId", formData.breedId);

    // Handle images properly
    const existingImageUrls: string[] = [];
    const newImageFiles: File[] = [];

    images.forEach((img) => {
      if (img.isExisting && !img.toDelete) {
        existingImageUrls.push(img.url);
      } else if (!img.isExisting && img.file) {
        newImageFiles.push(img.file);
      }
    });

    // Add new image files
    newImageFiles.forEach((file) => {
      formDataToSend.append("images", file);
    });

    // For updates, we need to tell the API which existing images to keep
    if (id && existingImageUrls.length > 0) {
      existingImageUrls.forEach((url) => {
        formDataToSend.append("images", url);
      });
    }

    return formDataToSend;
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!validateForm()) {
      showSnackbar("ກະລຸນາກວດສອບຂໍ້ມູນທີ່ປ້ອນ", "error");
      return;
    }

    setSaving(true);
    try {
      const formDataToSend = prepareFormData();

      let response;

      response = await axiosInstance.patch(`/pets/${id}`, formDataToSend, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      console.log(response);

      if (onSave) {
        await onSave(formData);
      }

      // Show success message and provide option to go back
      showSnackbar("ບັນທຶກຂໍ້ມູນສັດລ້ຽງສຳເລັດແລ້ວ! ກົດ 'ກັບໄປ' ເພື່ອກັບໄປໜ້າສັດລ້ຽງ", "success");
      
      // Refresh data to show updated information
      await fetchPetData();
      
    } catch (error: any) {
      console.error("Error saving pet:", error);
      const errorMessage =
        error.response?.data?.message || "ເກີດຂໍ້ຜິດພາດໃນການບັນທຶກ";
      showSnackbar(errorMessage, "error");
    } finally {
      setSaving(false);
    }
  };

  // Fetch pet data when editing
  useEffect(() => {
    if (id) {
      fetchPetData();
    }
  }, [id]);

  if (loading) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Skeleton
          variant="rectangular"
          height={60}
          sx={{ mb: 3, borderRadius: 2 }}
        />
        <StyledCard sx={{ p: 3 }}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={4}>
              <Skeleton
                variant="rectangular"
                height={200}
                sx={{ borderRadius: 2 }}
              />
            </Grid>
            <Grid item xs={12} md={8}>
              <Skeleton variant="text" height={40} sx={{ mb: 2 }} />
              <Skeleton variant="text" height={60} sx={{ mb: 2 }} />
              <Skeleton variant="text" height={60} sx={{ mb: 2 }} />
              <Skeleton
                variant="rectangular"
                height={120}
                sx={{ borderRadius: 2 }}
              />
            </Grid>
          </Grid>
        </StyledCard>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ display: "flex", alignItems: "center", mb: 4 }}>
        <IconButton
          onClick={handleGoBack} // Updated to use the new handleGoBack function
          sx={{
            mr: 2,
            bgcolor: "rgba(153, 144, 218, 0.1)",
            color: "#9990DA",
            "&:hover": {
              bgcolor: "rgba(153, 144, 218, 0.2)",
            },
          }}
        >
          <ArrowBackRoundedIcon />
        </IconButton>
        <Box sx={{ flexGrow: 1 }}>
          <Typography variant="h4" fontWeight={700} color="#3f3d56">
            {id ? "ກັບຄືນ" : "ເພີ່ມສັດລ້ຽງໃໝ່"}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {id ? "ອັບເດດຂໍ້ມູນຂອງສັດລ້ຽງຂອງທ່ານ" : "ເພີ່ມສັດລ້ຽງຂອງທ່ານເຂົ້າໃນລະບົບ"}
          </Typography>
        </Box>

        {/* Show/Hide Original Info Toggle for Edit Mode */}
        {id && originalData && (
          <Box sx={{ display: "flex", gap: 1 }}>
            <Button
              variant="outlined"
              size="small"
              onClick={() => setShowOriginalInfo(!showOriginalInfo)}
              sx={{
                borderColor: "#9990DA",
                color: "#9990DA",
                "&:hover": { borderColor: "#8278c7" },
              }}
            >
              {showOriginalInfo ? "ເຊື່ອງຂໍ້ມູນເດີມ" : "ສະແດງຂໍ້ມູນເດີມ"}
            </Button>
          </Box>
        )}
      </Box>

      {/* Original Pet Information Card - Only show in edit mode */}
      {id && originalData && showOriginalInfo && (
        <StyledCard
          sx={{
            p: 3,
            mb: 4,
            bgcolor: "rgba(76, 175, 80, 0.05)",
            border: "1px solid rgba(76, 175, 80, 0.2)",
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
            <CheckCircleRoundedIcon sx={{ color: "#4caf50", mr: 1 }} />
            <Typography variant="h6" fontWeight={600} color="#4caf50">
              ຂໍ້ມູນປັດຈຸບັນ (ກ່ອນແກ້ໄຂ)
            </Typography>
          </Box>

          <Grid container spacing={3}>
            {/* Original Images */}
            <Grid item xs={12} md={4}>
              <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 2 }}>
                ຮູບພາບປະຈຸບັນ
              </Typography>
              {originalData.images && originalData.images.length > 0 ? (
                <Grid container spacing={1}>
                  {originalData.images.slice(0, 4).map((img, index) => (
                    <Grid item xs={6} key={`original-img-${index}`}>
                      <img
                        src={img}
                        alt={`Original ${index + 1}`}
                        style={{
                          width: "100%",
                          height: 60,
                          objectFit: "cover",
                          borderRadius: 8,
                          border: "2px solid rgba(76, 175, 80, 0.3)",
                        }}
                      />
                    </Grid>
                  ))}
                  {originalData.images.length > 4 && (
                    <Grid item xs={12}>
                      <Typography variant="caption" color="text.secondary">
                        ແລະ ອີກ {originalData.images.length - 4} ຮູບ...
                      </Typography>
                    </Grid>
                  )}
                </Grid>
              ) : (
                <Typography variant="body2" color="text.secondary">
                  ບໍ່ມີຮູບພາບ
                </Typography>
              )}
            </Grid>

            {/* Original Basic Info */}
            <Grid item xs={12} md={8}>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      ຊື່ສັດລ້ຽງ
                    </Typography>
                    <Typography variant="body1" fontWeight={600}>
                      {originalData.petName}
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      ປະເພດ
                    </Typography>
                    <Typography variant="body1">
                      {originalData.petType === "DOG" ? "ໝາ" : "ແມວ"}
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      ເພດ
                    </Typography>
                    <Typography variant="body1">
                      {originalData.gender === "MALE" ? "ຜູ້" : "ຍິງ"}
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      ຂະໜາດ
                    </Typography>
                    <Typography variant="body1">
                      {getSizeText(originalData.size)}
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      ອາຍຸ
                    </Typography>
                    <Typography variant="body1">
                      {originalData.yearAge} ປີ {originalData.monthAge} ເດືອນ
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      ລາຄາ
                    </Typography>
                    <Typography variant="body1">
                      {originalData.price
                        ? `${originalData.price.toLocaleString()} $`
                        : "ບໍ່ລະບຸ"}
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      ສະຖານະ
                    </Typography>
                    <Chip
                      label={getStatusText(originalData.status)}
                      size="small"
                      color={
                        originalData.status === "AVAILABLE"
                          ? "success"
                          : originalData.status === "SOLD"
                          ? "warning"
                          : "default"
                      }
                    />
                  </Box>
                </Grid>
                {originalData.bio && (
                  <Grid item xs={12}>
                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        ລາຍລະອຽດ
                      </Typography>
                      <Typography variant="body2" sx={{ mt: 0.5 }}>
                        {originalData.bio.length > 100
                          ? `${originalData.bio.substring(0, 100)}...`
                          : originalData.bio}
                      </Typography>
                    </Box>
                  </Grid>
                )}
              </Grid>

              {/* Timestamps */}
              <Box
                sx={{ mt: 2, pt: 2, borderTop: "1px solid rgba(0,0,0,0.1)" }}
              >
                <Typography variant="caption" color="text.secondary">
                  ສ້າງເມື່ອ: {formatDate(originalData.createdAt)} |
                  ແກ້ໄຂຄັ້ງສຸດທ້າຍ: {formatDate(originalData.updatedAt)}
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </StyledCard>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit}>
        <StyledCard sx={{ p: 4 }}>
          {/* Changes Indicator */}
          {id && originalData && (
            <Box
              sx={{
                mb: 3,
                p: 2,
                bgcolor: "rgba(255, 193, 7, 0.1)",
                borderRadius: 2,
                border: "1px solid rgba(255, 193, 7, 0.3)",
              }}
            >
              <Typography variant="body2" color="#f57c00">
                💡 ຟິວທີ່ມີການປ່ຽນແປງຈະມີສີເຫຼືອງ | ກົດ "ກູ້ຄືນຂໍ້ມູນເດີມ"
                ເພື່ອຍົກເລີກການແກ້ໄຂທັງໝົດ
              </Typography>
            </Box>
          )}

          <Grid container spacing={4}>
            {/* Image Upload Section */}
            <Grid item xs={12} md={4}>
              <Typography
                variant="h6"
                fontWeight={600}
                sx={{ mb: 2, color: "#3f3d56" }}
              >
                ຮູບພາບສັດລ້ຽງ
              </Typography>

              {/* Current Images */}
              {images.length > 0 && (
                <Box sx={{ mb: 3 }}>
                  <Typography
                    variant="subtitle2"
                    sx={{ mb: 1, color: "#3f3d56" }}
                  >
                    ຮູບພາບ ({images.length})
                  </Typography>
                  <Grid container spacing={1}>
                    {images.map((img, index) => (
                      <Grid item xs={6} key={`img-${index}`}>
                        <Box sx={{ position: "relative" }}>
                          <img
                            src={img.url}
                            alt={`Pet ${index + 1}`}
                            style={{
                              width: "100%",
                              height: 80,
                              objectFit: "cover",
                              borderRadius: 8,
                              border: img.isExisting
                                ? "2px solid rgba(76, 175, 80, 0.3)"
                                : "2px solid rgba(153, 144, 218, 0.3)",
                            }}
                          />
                          <IconButton
                            size="small"
                            sx={{
                              position: "absolute",
                              top: 2,
                              right: 2,
                              bgcolor: "rgba(0,0,0,0.6)",
                              color: "white",
                              width: 24,
                              height: 24,
                              "&:hover": { bgcolor: "rgba(0,0,0,0.8)" },
                            }}
                            onClick={() => removeImage(index, "images")}
                          >
                            <DeleteRoundedIcon sx={{ fontSize: 16 }} />
                          </IconButton>
                          {img.isExisting && (
                            <Chip
                              label="ເກົ່າ"
                              size="small"
                              sx={{
                                position: "absolute",
                                bottom: 2,
                                left: 2,
                                bgcolor: "rgba(76, 175, 80, 0.8)",
                                color: "white",
                                fontSize: "10px",
                                height: 16,
                              }}
                            />
                          )}
                        </Box>
                      </Grid>
                    ))}
                  </Grid>
                </Box>
              )}

              {/* Upload New Images */}
              <Box sx={{ mb: 3 }}>
                <input
                  accept="image/*"
                  type="file"
                  id="images-upload"
                  style={{ display: "none" }}
                  multiple
                  onChange={(e) => handleImageUpload(e, "images")}
                />
                <label htmlFor="images-upload">
                  <ImageUploadBox sx={{ height: 120 }}>
                    <PhotoCameraRoundedIcon
                      sx={{ fontSize: 32, color: "#9990DA", mb: 1 }}
                    />
                    <Typography
                      variant="body2"
                      color="#9990DA"
                      fontWeight={600}
                    >
                      ເພີ່ມຮູບພາບສັດລ້ຽງ
                    </Typography>
                  </ImageUploadBox>
                </label>
              </Box>

              {/* Document Images Section */}
              <Typography
                variant="h6"
                fontWeight={600}
                sx={{ mb: 2, color: "#3f3d56" }}
              >
                ເອກະສານ/ໃບຢັ້ງຢືນ
              </Typography>

              {documentImages.length > 0 && (
                <Box sx={{ mb: 2 }}>
                  <Typography
                    variant="subtitle2"
                    sx={{ mb: 1, color: "#3f3d56" }}
                  >
                    ເອກະສານ ({documentImages.length})
                  </Typography>
                  <Grid container spacing={1}>
                    {documentImages.map((img, index) => (
                      <Grid item xs={6} key={`doc-${index}`}>
                        <Box sx={{ position: "relative" }}>
                          <img
                            src={img.url}
                            alt={`Document ${index + 1}`}
                            style={{
                              width: "100%",
                              height: 60,
                              objectFit: "cover",
                              borderRadius: 8,
                              border: img.isExisting
                                ? "2px solid rgba(255, 152, 0, 0.3)"
                                : "2px solid rgba(153, 144, 218, 0.3)",
                            }}
                          />
                          <IconButton
                            size="small"
                            sx={{
                              position: "absolute",
                              top: 2,
                              right: 2,
                              bgcolor: "rgba(0,0,0,0.6)",
                              color: "white",
                              width: 20,
                              height: 20,
                              "&:hover": { bgcolor: "rgba(0,0,0,0.8)" },
                            }}
                            onClick={() => removeImage(index, "documentImages")}
                          >
                            <DeleteRoundedIcon sx={{ fontSize: 12 }} />
                          </IconButton>
                        </Box>
                      </Grid>
                    ))}
                  </Grid>
                </Box>
              )}

              <Box>
                <input
                  accept="image/*"
                  type="file"
                  id="document-images-upload"
                  style={{ display: "none" }}
                  multiple
                  onChange={(e) => handleImageUpload(e, "documentImages")}
                />
                <label htmlFor="document-images-upload">
                  <ImageUploadBox sx={{ height: 100 }}>
                    <AddPhotoAlternateRoundedIcon
                      sx={{ fontSize: 28, color: "#9990DA", mb: 1 }}
                    />
                    <Typography
                      variant="body2"
                      color="#9990DA"
                      fontWeight={600}
                    >
                      ເພີ່ມເອກະສານ
                    </Typography>
                  </ImageUploadBox>
                </label>
              </Box>
            </Grid>

            {/* Form Fields */}
            <Grid item xs={12} md={8}>
              <Grid container spacing={3}>
                {/* Basic Information */}
                <Grid item xs={12}>
                  <Typography
                    variant="h6"
                    fontWeight={600}
                    sx={{ mb: 2, color: "#3f3d56" }}
                  >
                    ຂໍ້ມູນພື້ນຖານ
                  </Typography>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <StyledTextField
                    fullWidth
                    label="ຊື່ສັດລ້ຽງ *"
                    value={formData.petName}
                    onChange={handleInputChange("petName")}
                    error={!!errors.petName}
                    helperText={
                      errors.petName ||
                      (hasChanged("petName") ? "ຖືກແກ້ໄຂແລ້ວ" : "")
                    }
                    {...getFieldProps("petName")}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <PetsRoundedIcon sx={{ color: "#9990DA" }} />
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth>
                    <InputLabel>ປະເພດສັດ *</InputLabel>
                    <StyledSelect
                      disabled
                      value={formData.petType}
                      label="ປະເພດສັດ *"
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          petType: e.target.value as "DOG" | "CAT",
                        }))
                      }
                    >
                      <MenuItem value="DOG">ໝາ</MenuItem>
                      <MenuItem value="CAT">ແມວ</MenuItem>
                    </StyledSelect>
                  </FormControl>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth>
                    <InputLabel>ເພດ *</InputLabel>
                    <StyledSelect
                      value={formData.gender}
                      label="ເພດ *"
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          gender: e.target.value as "MALE" | "FEMALE",
                        }))
                      }
                    >
                      <MenuItem value="MALE">
                        <Box sx={{ display: "flex", alignItems: "center" }}>
                          <MaleRoundedIcon sx={{ mr: 1, color: "#2196f3" }} />
                          ຜູ້
                        </Box>
                      </MenuItem>
                      <MenuItem value="FEMALE">
                        <Box sx={{ display: "flex", alignItems: "center" }}>
                          <FemaleRoundedIcon sx={{ mr: 1, color: "#e91e63" }} />
                          ຍິງ
                        </Box>
                      </MenuItem>
                    </StyledSelect>
                  </FormControl>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth>
                    <InputLabel>ຂະໜາດ *</InputLabel>
                    <StyledSelect
                      value={formData.size}
                      label="ຂະໜາດ *"
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          size: e.target.value as "SMALL" | "MEDIUM" | "LARGE",
                        }))
                      }
                    >
                      <MenuItem value="SMALL">ນ້ອຍ (ຕ່ຳກວ່າ 10kg)</MenuItem>
                      <MenuItem value="MEDIUM">ກາງ (10-25kg)</MenuItem>
                      <MenuItem value="LARGE">ໃຫຍ່ (ເກີນ 25kg)</MenuItem>
                    </StyledSelect>
                  </FormControl>
                </Grid>

                {/* Age Section */}
                <Grid item xs={12}>
                  <Divider sx={{ my: 2 }} />
                  <Typography
                    variant="subtitle1"
                    fontWeight={600}
                    sx={{ mb: 2, color: "#3f3d56" }}
                  >
                    ອາຍຸ *
                  </Typography>
                </Grid>

                <Grid item xs={6} sm={3}>
                  <StyledTextField
                    fullWidth
                    type="number"
                    label="ປີ"
                    value={formData.yearAge}
                    onChange={handleInputChange("yearAge")}
                    inputProps={{ min: 0, max: 30 }}
                    error={!!errors.age}
                  />
                </Grid>

                <Grid item xs={6} sm={3}>
                  <StyledTextField
                    fullWidth
                    type="number"
                    label="ເດືອນ"
                    value={formData.monthAge}
                    onChange={handleInputChange("monthAge")}
                    inputProps={{ min: 0, max: 11 }}
                    error={!!errors.age || !!errors.monthAge}
                    helperText={errors.age || errors.monthAge}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <StyledTextField
                    fullWidth
                    label="ສີ"
                    value={formData.color || ""}
                    onChange={handleInputChange("color")}
                    placeholder="ເຊັ່ນ: ສີນ້ຳຕານທອງ"
                  />
                </Grid>

                {/* Physical Characteristics */}
                <Grid item xs={12}>
                  <Divider sx={{ my: 2 }} />
                  <Typography
                    variant="subtitle1"
                    fontWeight={600}
                    sx={{ mb: 2, color: "#3f3d56" }}
                  >
                    ລັກສະນະທາງກາຍ
                  </Typography>
                </Grid>

                <Grid item xs={6} sm={6}>
                  <StyledTextField
                    fullWidth
                    type="number"
                    label="ນ້ຳໜັກ (kg)"
                    value={formData.weight || ""}
                    onChange={handleInputChange("weight")}
                    error={!!errors.weight}
                    helperText={errors.weight}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <ScaleRoundedIcon sx={{ color: "#9990DA" }} />
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>

                <Grid item xs={6} sm={6}>
                  <StyledTextField
                    fullWidth
                    type="number"
                    label="ສູງ (cm)"
                    value={formData.height || ""}
                    onChange={handleInputChange("height")}
                    error={!!errors.height}
                    helperText={errors.height}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <HeightRoundedIcon sx={{ color: "#9990DA" }} />
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>

                {/* Price and Status */}
                <Grid item xs={12}>
                  <Divider sx={{ my: 2 }} />
                  <Typography
                    variant="subtitle1"
                    fontWeight={600}
                    sx={{ mb: 2, color: "#3f3d56" }}
                  >
                    ລາຄາ & ສະຖານະ
                  </Typography>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <StyledTextField
                    fullWidth
                    disabled={formData.status === "SOLD"}
                    type="number"
                    label="ລາຄາ ($)"
                    value={formData.price || ""}
                    onChange={handleInputChange("price")}
                    error={!!errors.price}
                    helperText={
                      errors.price ||
                      (hasChanged("price") ? "ຖືກແກ້ໄຂແລ້ວ" : "")
                    }
                    {...getFieldProps("price")}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <AttachMoneyRoundedIcon sx={{ color: "#9990DA" }} />
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth>
                    <InputLabel>ສະຖານະ</InputLabel>
                    <StyledSelect
                      disabled
                      value={formData.status}
                      label="ສະຖານະ"
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          status: e.target.value as "AVAILABLE" | "SOLD",
                        }))
                      }
                    >
                      <MenuItem value="AVAILABLE">ພ້ອມຂາຍ</MenuItem>
                      <MenuItem value="SOLD">ຂາຍແລ້ວ</MenuItem>
                    </StyledSelect>
                  </FormControl>
                </Grid>

                {/* Description */}
                <Grid item xs={12}>
                  <Divider sx={{ my: 2 }} />
                  <Typography
                    variant="subtitle1"
                    fontWeight={600}
                    sx={{ mb: 2, color: "#3f3d56" }}
                  >
                    ລາຍລະອຽດ
                  </Typography>
                  <StyledTextField
                    fullWidth
                    multiline
                    rows={4}
                    label="ເລົ່າເຖິງສັດລ້ຽງຂອງທ່ານ"
                    value={formData.bio || ""}
                    onChange={handleInputChange("bio")}
                    placeholder="ບອກລາຍລະອຽດກ່ຽວກັບບຸກຄະລິກ, ນິໄສ, ການຝຶກຊ້ອມ, ສຸຂະພາບ ແລະ ຂໍ້ມູນອື່ນໆທີ່ສຳຄັນ..."
                    inputProps={{ maxLength: 1000 }}
                    helperText={`${formData.bio?.length || 0}/1000 ຕົວອັກສອນ${
                      hasChanged("bio") ? " (ຖືກແກ້ໄຂແລ້ວ)" : ""
                    }`}
                    {...getFieldProps("bio")}
                  />
                </Grid>
              </Grid>
            </Grid>
          </Grid>

          {/* Action Buttons */}
          <Box
            sx={{
              display: "flex",
              gap: 2,
              mt: 4,
              justifyContent: "flex-end",
              pt: 3,
              borderTop: "1px solid rgba(0,0,0,0.08)",
            }}
          >
            <Button
              variant="outlined"
              onClick={handleGoBack} // Updated to use the new handleGoBack function
              disabled={saving}
              sx={{
                borderRadius: "12px",
                px: 3,
                py: 1.5,
                borderColor: "#9990DA",
                color: "#9990DA",
                minWidth: 120,
                "&:hover": {
                  borderColor: "#8278c7",
                  bgcolor: "rgba(153, 144, 218, 0.04)",
                },
              }}
            >
              ຍົກເລີກ
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={saving}
              startIcon={
                saving ? (
                  <CircularProgress size={20} sx={{ color: "white" }} />
                ) : (
                  <SaveRoundedIcon />
                )
              }
              sx={{
                borderRadius: "12px",
                px: 4,
                py: 1.5,
                minWidth: 150,
                background: saving
                  ? "linear-gradient(135deg, #ccc, #aaa)"
                  : "linear-gradient(135deg, #9990DA, #8278c7)",
                "&:hover": {
                  background: saving
                    ? "linear-gradient(135deg, #ccc, #aaa)"
                    : "linear-gradient(135deg, #8278c7, #7066b3)",
                },
                "&:disabled": {
                  color: "white",
                },
              }}
            >
              {saving ? "ກຳລັງບັນທຶກ..." : "ບັນທຶກ"}
            </Button>
          </Box>
        </StyledCard>
      </form>

      {/* Success/Error Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={snackbar.severity === "success" && snackbar.message.includes("ກັບໄປ") ? 8000 : 4000}
        onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
          severity={snackbar.severity}
          variant="filled"
          sx={{
            borderRadius: "12px",
            "& .MuiAlert-icon": {
              color: "white",
            },
          }}
          icon={
            snackbar.severity === "success" ? (
              <CheckCircleRoundedIcon />
            ) : snackbar.severity === "error" ? (
              <ErrorRoundedIcon />
            ) : undefined
          }
          action={
            snackbar.severity === "success" && snackbar.message.includes("ກັບໄປ") ? (
              <Button 
                color="inherit" 
                size="small" 
                onClick={() => {
                  setSnackbar((prev) => ({ ...prev, open: false }));
                  handleGoBack();
                }}
                sx={{ 
                  fontWeight: 600,
                  ml: 1,
                  bgcolor: "rgba(255,255,255,0.2)",
                  "&:hover": {
                    bgcolor: "rgba(255,255,255,0.3)",
                  }
                }}
              >
                ກັບໄປ
              </Button>
            ) : undefined
          }
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default PetEditPage;