import React, { useState, ChangeEvent, useEffect } from "react";
import {
  Box,
  Stepper,
  Step,
  StepLabel,
  Typography,
  Button,
  Paper,
  Container,
  StepIconProps,
  styled,
  Grid,
  Avatar,
  Link,
  Checkbox,
  FormControlLabel,
  TextField,
  Radio,
  RadioGroup,
  FormControl,
  FormLabel,
  Select,
  MenuItem,
  InputLabel,
  SelectChangeEvent,
  IconButton,
  Divider,
  CircularProgress,
  Alert,
  Snackbar,
} from "@mui/material";
import HomeIcon from "@mui/icons-material/Home";
import PetsIcon from "@mui/icons-material/Pets";
import PersonIcon from "@mui/icons-material/Person";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import PhotoCameraIcon from "@mui/icons-material/PhotoCamera";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import DeleteIcon from "@mui/icons-material/Delete";
import axiosInstance from "../../../configs/axios";
import { UserModel } from "../../../models/user";
import { useParams, useNavigate } from "react-router-dom";

// Define interfaces for type safety
interface FormData {
  email: string;
  firstName: string;
  lastName: string;
  village: string;
  city: string;
  homeDescription: string;
  homeImages: File[];
  homeImagePreviews: string[];
  numAdults: number;
  numChildren: number;
  ageOfYoungestChild: string;
  visitingChildren: boolean;
  flatmatesOrLodgers: boolean;
  petAllergies: boolean;
  otherAnimals: boolean;
  otherAnimalsDetails: string;
  areAnimalsNeutered: string;
  previousPetExperience: string;
  areAnimalsAllergies: boolean;
  acceptTerms: boolean;
}

// Define custom colors
const activeColor = "#B9B3E5";
const completedColor = "#B9B3E5";
const inactiveColor = "#e0e0e0";

// Define the steps for the pet adoption process
const steps = [
  { label: "ເລີ່ມຕົ້ນ", icon: PetsIcon }, // Start
  { label: "ເຮືອນ", icon: HomeIcon }, // Home
  { label: "ຄູ່ຮ່ວມຫ້ອງ", icon: PersonIcon }, // Roommate
  { label: "ສັດອື່ນໆ", icon: PetsIcon }, // Other Animals
  { label: "ຢືນຢັນ", icon: CheckCircleIcon }, // Confirm
];

// Custom styled component for the stepper connector
const CustomStepConnector = styled("div")(({ theme }) => ({
  top: 22,
  left: "calc(-50% + 16px)",
  right: "calc(50% + 16px)",
  position: "absolute",
  borderTop: `2px dashed ${inactiveColor}`,
  zIndex: 0,
}));

// Custom StepIcon component
const CustomStepIcon = (props: StepIconProps) => {
  const { active, completed, icon, className } = props;
  const stepIndex = Number(icon) - 1;
  const IconComponent = steps[stepIndex].icon;

  return (
    <Box
      className={className}
      sx={{
        backgroundColor: completed
          ? completedColor
          : active
          ? activeColor
          : inactiveColor,
        zIndex: 1,
        color: "#fff",
        width: 50,
        height: 50,
        display: "flex",
        borderRadius: "80%",
        justifyContent: "center",
        alignItems: "center",
        transition: "all 0.3s ease",
      }}
    >
      <IconComponent />
    </Box>
  );
};

// Styled components
const StyledButton = styled(Button)(({ theme }) => ({
  padding: "10px 24px",
  borderRadius: "4px",
}));

const BackButton = styled(StyledButton)({
  color: "#9990DA",
  textTransform: "none",
  border: "1px solid #ddd",
  "&:hover": {
    backgroundColor: "#f5f5f5",
  },
});

const ContinueButton = styled(StyledButton)({
  backgroundColor: "#9990DA",
  color: "white",
  textTransform: "none",
  "&:hover": {
    backgroundColor: "#8470C0",
  },
});

const SubmitButton = styled(StyledButton)({
  backgroundColor: "#9990DA",
  color: "white",
  textTransform: "none",
  "&:hover": {
    backgroundColor: "#8470C0",
  },
  marginLeft: "auto",
});

const ImageUploadBox = styled(Box)({
  border: "2px dashed #ccc",
  borderRadius: "4px",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  padding: "40px",
  cursor: "pointer",
  height: "200px",
});

const PreviewBox = styled(Box)({
  position: "relative",
  borderRadius: "4px",
  overflow: "hidden",
  height: "200px",
  boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
});

const DeleteButton = styled(IconButton)({
  position: "absolute",
  top: "5px",
  right: "5px",
  backgroundColor: "rgba(255,255,255,0.8)",
  "&:hover": {
    backgroundColor: "rgba(255,255,255,0.9)",
  },
});

const PetAdoptionForm: React.FC = () => {
  const [activeStep, setActiveStep] = useState<number>(0);
  const [termsAgreed, setTermsAgreed] = useState<boolean>(false);
  const [userData, setUserData] = useState<UserModel | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [openSnackbar, setOpenSnackbar] = useState<boolean>(false);

  const {id} = useParams();
  const navigate = useNavigate();
  const [paymentId, setPaymentId] = useState<string>("");

  const [formData, setFormData] = useState<FormData>({
    email: "",
    firstName: "",
    lastName: "",
    village: "",
    city: "",
    homeDescription: "",
    homeImages: [],
    homeImagePreviews: [],
    numAdults: 0,
    numChildren: 0,
    ageOfYoungestChild: "",
    visitingChildren: false,
    flatmatesOrLodgers: false,
    petAllergies: false,
    otherAnimals: false,
    otherAnimalsDetails: "",
    areAnimalsNeutered: "not_applicable",
    previousPetExperience: "",
    areAnimalsAllergies: false,
    acceptTerms: false,
  });

  // Fetch user data when component mounts
  useEffect(() => {
    fetchUserData();
  }, []);

  // Update formData when userData changes
  useEffect(() => {
    if (userData) {
      setFormData((prevFormData) => ({
        ...prevFormData,
        email: userData.email || "",
        firstName: userData.firstName || "",
        lastName: userData.lastName || "",
        village: userData.village || "",
        city: userData.city || "",
      }));
    }
  }, [userData]);

  // Cleanup preview URLs on component unmount
  useEffect(() => {
    return () => {
      // Revoke all object URLs when component unmounts to prevent memory leaks
      formData.homeImagePreviews.forEach(URL.revokeObjectURL);
    };
  }, []);

  const fetchUserData = async (): Promise<void> => {
    try {
      setLoading(true);
      setError(null);
      const response = await axiosInstance.get("/auth/user/profile");
      setUserData(response.data?.data || response.data); // Adjust based on your API response structure
    } catch (error) {
      console.error("Error fetching user data:", error);
      setError("ລົ້ມເຫຼວໃນການໂຫຼດຂໍ້ມູນຜູ້ໃຊ້. ກະລຸນາລອງໃໝ່ອີກຄັ້ງພາຍຫຼັງ."); // Failed to load user profile. Please try again later.
    } finally {
      setLoading(false);
    }
  };

  const handleNext = (): void => {
    if (activeStep === 0 && !termsAgreed) {
      alert("ກະລຸນາເຫັນດີນໍາຂໍ້ກຳນົດ ແລະ ນະໂຍບາຍຄວາມເປັນສ່ວນຕົວ"); // Please agree to the Terms and Privacy Policy
      return;
    }
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  const handleBack = (): void => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const handleInputChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ): void => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSelectChange = (e: SelectChangeEvent): void => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleRadioChange = (e: ChangeEvent<HTMLInputElement>): void => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value === "true" ? true : value === "false" ? false : value,
    });
  };

  const handlePaymentIdChange = (e: ChangeEvent<HTMLInputElement>): void => {
    setPaymentId(e.target.value);
  };

  const handleImageUpload = (e: ChangeEvent<HTMLInputElement>): void => {
    if (e.target.files && e.target.files.length > 0) {
      const newFiles = Array.from(e.target.files);

      // Create preview URLs for the images
      const newPreviews = newFiles.map((file) => URL.createObjectURL(file));

      setFormData((prevState) => ({
        ...prevState,
        homeImages: [...prevState.homeImages, ...newFiles],
        homeImagePreviews: [...prevState.homeImagePreviews, ...newPreviews],
      }));

      // Reset the input value to allow uploading the same file again
      e.target.value = "";
    }
  };

  const handleDeleteImage = (index: number): void => {
    // Create a copy of the arrays
    const newImages = [...formData.homeImages];
    const newPreviews = [...formData.homeImagePreviews];

    // Revoke the URL to prevent memory leaks
    URL.revokeObjectURL(newPreviews[index]);

    // Remove the item at the specified index
    newImages.splice(index, 1);
    newPreviews.splice(index, 1);

    // Update state
    setFormData({
      ...formData,
      homeImages: newImages,
      homeImagePreviews: newPreviews,
    });
  };

  // UPDATED SUBMIT FUNCTION WITH VALIDATION
  const handleSubmit = async (): Promise<void> => {
    try {
      // Validate required fields before submission
      if (!formData.homeDescription.trim()) {
        setError("ກະລຸນາອະທິບາຍກ່ຽວກັບເຮືອນຂອງທ່ານ"); // Please describe your house
        setOpenSnackbar(true);
        return;
      }

      if (formData.homeImages.length === 0) {
        setError("ກະລຸນາອັບໂຫຼດຮູບເຮືອນຢ່າງໜ້ອຍໜຶ່ງຮູບ"); // Please upload at least one home photo
        setOpenSnackbar(true);
        return;
      }

      if (formData.numAdults <= 0) {
        setError("ກະລຸນາເລືອກຈໍານວນຜູ້ໃຫຍ່ໃນຄົວເຮືອນຂອງທ່ານ"); // Please select the number of adults in your household
        setOpenSnackbar(true);
        return;
      }

      // Explicitly check if otherAnimals question has been answered
      if (formData.otherAnimals === undefined) {
        setError("ກະລຸນາລະບຸວ່າທ່ານມີສັດອື່ນໆຢູ່ເຮືອນບໍ່"); // Please specify if you have other animals at home
        setOpenSnackbar(true);
        return;
      }

      // Additional validation for other animals details
      if (formData.otherAnimals && !formData.otherAnimalsDetails.trim()) {
        setError("ກະລຸນາໃຫ້ລາຍລະອຽດກ່ຽວກັບສັດອື່ນໆຂອງທ່ານ"); // Please provide details about your other animals
        setOpenSnackbar(true);
        return;
      }

      // Check if neutered status is answered when other animals are present
      if (formData.otherAnimals && formData.areAnimalsNeutered === "not_applicable") {
        setError("ກະລຸນາລະບຸວ່າສັດອື່ນໆຂອງທ່ານຖືກໝັນແລ້ວບໍ"); // Please specify if your other animals are neutered
        setOpenSnackbar(true);
        return;
      }

      // Check if allergies question is answered
      if (formData.areAnimalsAllergies === undefined) {
        setError("ກະລຸນາລະບຸວ່າມີໃຜໃນຄົວເຮືອນມີອາການແພ້ສັດລ້ຽງບໍ່"); // Please specify if anyone in the household has pet allergies
        setOpenSnackbar(true);
        return;
      }

      setSubmitting(true);
      setError(null);
      if (!id) {
        setError("ບໍ່ພົບ ID ສັດລ້ຽງ. ບໍ່ສາມາດສົ່ງຄໍາຮ້ອງຂໍໄດ້."); // Pet ID is missing. Cannot submit application.
        setOpenSnackbar(true);
        setSubmitting(false);
        return;
      }
      
      // Create a new FormData object for the file upload
      const apiFormData = new FormData();
      // Append the pet ID
      apiFormData.append("petId", id);
      // Append payment ID if provided (optional)
      if (paymentId.trim() !== "") {
        apiFormData.append("paymentId", paymentId);
      }
      // Append house details
      apiFormData.append("houseDetails", formData.homeDescription);
      // Append household information
      apiFormData.append("adults", formData.numAdults.toString());
      apiFormData.append("children", formData.numChildren.toString());
      // Append allergies status
      apiFormData.append("allergies", formData.areAnimalsAllergies.toString());
      // Append other pets information
      apiFormData.append("otherPets", formData.otherAnimals.toString());
      apiFormData.append("otherPetsDetails", formData.otherAnimalsDetails || "ບໍ່ມີສັດລ້ຽງອື່ນໆ"); // No other pets
      
      // Append neutered status - convert string to boolean
      let neuteredValue = false;
      if (formData.areAnimalsNeutered === "true") {
        neuteredValue = true;
      }
      apiFormData.append("neutered", neuteredValue.toString());
      
      // Append acceptance status
      apiFormData.append("acceptStatus", "PENDING");
      
      // Append house images
      formData.homeImages.forEach((image) => {
        apiFormData.append("houseImages", image);
      });
      
      // Send the data to the API
      const response = await axiosInstance.post("/adopt", apiFormData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      
      // Handle successful submission
      setSuccessMessage("ຄໍາຮ້ອງຂໍການຮັບລ້ຽງຂອງທ່ານໄດ້ຖືກສົ່ງສໍາເລັດແລ້ວ!"); // Your adoption application has been submitted successfully!
      setOpenSnackbar(true);
      // Move to the confirmation step
      setActiveStep(steps.length - 1);
    } catch (error: any) {
      console.error("Error submitting adoption application:", error);
      setError(
        error.response?.data?.message ||
        "ລົ້ມເຫຼວໃນການສົ່ງຄໍາຮ້ອງຂໍ. ກະລຸນາລອງໃໝ່ອີກຄັ້ງ." // Failed to submit application. Please try again.
      );
      setOpenSnackbar(true);
    } finally {
      setSubmitting(false);
    }
  };

  const handleSnackbarClose = () => {
    setOpenSnackbar(false);
  };

  // Render different form content based on the active step
  const getStepContent = (step: number): React.ReactNode => {
    // Show loading indicator while fetching user data for first step
    if (step === 0 && loading) {
      return (
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: "200px",
          }}
        >
          <CircularProgress sx={{ color: "#9990DA" }} />
        </Box>
      );
    }

    // Show error message if user data couldn't be loaded
    if (step === 0 && error) {
      return (
        <Box sx={{ mt: 2, mb: 2, textAlign: "center" }}>
          <Typography color="error">{error}</Typography>
          <Button
            variant="outlined"
            sx={{ mt: 2, color: "#9990DA", borderColor: "#9990DA" }}
            onClick={fetchUserData}
          >
            ລອງໃໝ່ອີກຄັ້ງ {/* Try Again */}
          </Button>
        </Box>
      );
    }

    switch (step) {
      case 0: // Start
        return (
          <>
            <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
              <Avatar
                sx={{
                  width: 80,
                  height: 80,
                  mr: 4,
                  bgcolor: "#f0f0f0",
                  "& img": { objectFit: "cover" },
                }}
                src={userData?.avatar || "/api/placeholder/80/80"}
              />
              <Box sx={{ flexGrow: 1 }}>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={4}>
                    <Typography variant="h6" color="textSecondary">
                      ອີເມວ/ຊື່ຜູ້ໃຊ້ {/* Email/Username */}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={8}>
                    <Typography variant="h6">{formData.email}</Typography>
                  </Grid>

                  <Grid item xs={12} sm={4}>
                    <Typography variant="h6" color="textSecondary">
                      ຊື່ຕົ້ນ {/* First name */}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={8}>
                    <Typography variant="h6">{formData.firstName}</Typography>
                  </Grid>

                  <Grid item xs={12} sm={4}>
                    <Typography variant="h6" color="textSecondary">
                      ນາມສະກຸນ {/* Last name */}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={8}>
                    <Typography variant="h6">{formData.lastName}</Typography>
                  </Grid>
                </Grid>
              </Box>
            </Box>

            <FormControlLabel
              control={
                <Checkbox
                  checked={termsAgreed}
                  onChange={(e) => setTermsAgreed(e.target.checked)}
                  color="primary"
                />
              }
              label={
                <Typography variant="body2">
                  ຂ້າພະເຈົ້າໄດ້ອ່ານ ແລະ ເຫັນດີກັບຂໍ້ກຳນົດ ແລະ{" "} {/* I have read and agree to the Terms and */}
                  <Link href="#" underline="hover">
                    ນະໂຍບາຍຄວາມເປັນສ່ວນຕົວ {/* Privacy Policy */}
                  </Link>
                </Typography>
              }
            />

            <Box sx={{ mt: 2 }}>
              <Typography variant="body2">
                ເພື່ອສະໝັກ{" "} {/* To apply for */}
                <Link href="#" underline="hover">
                  ຮັບລ້ຽງສັດລ້ຽງ {/* Adopt a pet */}
                </Link>{" "}
                ທ່ານຈຳເປັນຕ້ອງຕື່ມຂໍ້ມູນບາງຊ່ອງ. ກົດເລີ່ມຕົ້ນ... {/* you need to complete some fields. Click Start... */}
              </Typography>
            </Box>

            {/* Optional Payment ID Field */}
            <Box sx={{ mt: 3 }}>
              <TextField
                id="paymentId"
                name="paymentId"
                label="ລະຫັດການຊໍາລະເງິນ (ທາງເລືອກ)" // Payment ID (Optional)
                fullWidth
                variant="outlined"
                value={paymentId}
                onChange={handlePaymentIdChange}
                placeholder="ປ້ອນລະຫັດການຊໍາລະເງິນຖ້າທ່ານມີ" // Enter payment ID if you have one
              />
              <Typography variant="caption" color="textSecondary">
                ຖ້າທ່ານໄດ້ຊໍາລະເງິນແລ້ວ, ໃຫ້ປ້ອນລະຫັດການຊໍາລະເງິນຢູ່ບ່ອນນີ້ {/* If you've already made a payment, enter the payment ID here */}
              </Typography>
            </Box>
          </>
        );

      case 1: // Home
        return (
          <>
            <Typography variant="body1" gutterBottom>
              ກະລຸນາອະທິບາຍກ່ຽວກັບເຮືອນຂອງທ່ານ {/* Please describe about your house */}
            </Typography>

            <TextField
              id="homeDescription"
              name="homeDescription"
              fullWidth
              multiline
              rows={4}
              variant="outlined"
              value={formData.homeDescription}
              onChange={handleInputChange}
              placeholder="ພິມທີ່ນີ້..." // Type here...
              sx={{ mb: 3 }}
              required
            />

            <Typography variant="body1" gutterBottom>
              ກະລຸນາເພີ່ມຮູບ 2 ຮູບຂອງເຮືອນຂອງທ່ານ ແລະ ພື້ນທີ່ພາຍນອກ ເພື່ອຊ່ວຍໃຫ້ເຈົ້າຂອງສັດລ້ຽງປັດຈຸບັນສາມາດເບິ່ງເຫັນເຮືອນທີ່ທ່ານສະເໜີ. {/* Please add 2 photos of your home and any outside space as it helps the pet's current owner to visualize the home you are offering. */}
            </Typography>

            <Grid container spacing={2} sx={{ mt: 1 }}>
              {/* Display images that are already uploaded */}
              {formData.homeImagePreviews.map((preview, index) => (
                <Grid item xs={12} sm={6} key={`preview-${index}`}>
                  <PreviewBox>
                    <img
                      src={preview}
                      alt={`Home preview ${index + 1}`}
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                      }}
                    />
                    <DeleteButton
                      onClick={() => handleDeleteImage(index)}
                      aria-label="ລຶບຮູບພາບ" // delete image
                    >
                      <DeleteIcon style={{ color: "#ff5252" }} />
                    </DeleteButton>
                  </PreviewBox>
                </Grid>
              ))}

              {/* Only show upload boxes if less than 2 images are uploaded */}
              {formData.homeImages.length < 2 && (
                <Grid item xs={12} sm={6}>
                  <input
                    accept="image/*"
                    style={{ display: "none" }}
                    id="image-upload"
                    type="file"
                    onChange={handleImageUpload}
                  />
                  <label htmlFor="image-upload">
                    <ImageUploadBox>
                      <Typography variant="body2" sx={{ mb: 1 }}>
                        ເພີ່ມຮູບເຮືອນ {/* Add Home Photo */}
                      </Typography>
                      <PhotoCameraIcon
                        sx={{ fontSize: 40, color: "#aaa", mb: 1 }}
                      />
                      <Typography variant="caption" color="textSecondary">
                        ຄລິກເພື່ອອັບໂຫຼດ {/* Click to upload */}
                      </Typography>
                    </ImageUploadBox>
                  </label>
                </Grid>
              )}
            </Grid>

            <Typography variant="body2" sx={{ mt: 2, color: "#666" }}>
              ຮູບແບບຮູບພາບຄວນຈະເປັນ (.jpg, .png, .jpeg). {/* The image format should be (.jpg, .png, .jpeg). */}
              <br />
              ການວັດແທກຮູບພາບຕ້ອງເປັນຮູບສີ່ຫຼ່ຽມ, ມີຂະໜາດ 600 × 600 ພິກເຊວ. {/* The image measurements must be square in shape, with dimensions of 600 × 600 pixels. */}
              <br />
              ຂະໜາດໄຟລ໌ຮູບພາບສູງສຸດທີ່ອະນຸຍາດແມ່ນ 1024 ແລະ 240 KB. {/* The maximum allowed file image size is 1024 and 240 KB. */}
            </Typography>
          </>
        );

      case 2: // Roommate
        return (
          <>
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel id="num-adults-label">
                    ຈໍານວນຜູ້ໃຫຍ່ {/* Number of adults */}
                  </InputLabel>
                  <Select
                    labelId="num-adults-label"
                    id="numAdults"
                    name="numAdults"
                    value={formData.numAdults.toString()}
                    label="ຈໍານວນຜູ້ໃຫຍ່" // Number of adults
                    onChange={handleSelectChange}
                    required
                  >
                    {[0, 1, 2, 3, 4, 5].map((num) => (
                      <MenuItem key={num} value={num}>
                        {num}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel id="num-children-label">
                    ຈໍານວນເດັກນ້ອຍ * {/* Number of children * */}
                  </InputLabel>
                  <Select
                    labelId="num-children-label"
                    id="numChildren"
                    name="numChildren"
                    value={formData.numChildren.toString()}
                    label="ຈໍານວນເດັກນ້ອຍ *" // Number of children *
                    onChange={handleSelectChange}
                    required
                  >
                    {[0, 1, 2, 3, 4, 5].map((num) => (
                      <MenuItem key={num} value={num}>
                        {num}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel id="age-youngest-child-label">
                    ອາຍຸຂອງເດັກນ້ອຍສຸດທ້ອງ {/* Age of youngest children */}
                  </InputLabel>
                  <Select
                    labelId="age-youngest-child-label"
                    id="ageOfYoungestChild"
                    name="ageOfYoungestChild"
                    value={formData.ageOfYoungestChild}
                    label="ອາຍຸຂອງເດັກນ້ອຍສຸດທ້ອງ" // Age of youngest children
                    onChange={handleSelectChange}
                    displayEmpty
                  >
                    <MenuItem value="" disabled></MenuItem>
                    <MenuItem value="0-2">0-2 ປີ</MenuItem> {/* 0-2 years */}
                    <MenuItem value="3-5">3-5 ປີ</MenuItem> {/* 3-5 years */}
                    <MenuItem value="6-10">6-10 ປີ</MenuItem> {/* 6-10 years */}
                    <MenuItem value="11-17">11-17 ປີ</MenuItem> {/* 11-17 years */}
                    <MenuItem value="18+">18+ ປີ</MenuItem> {/* 18+ years */}
                  </Select>
                </FormControl>
              </Grid>
            </Grid>

            <Typography variant="body2" sx={{ my: 2, color: "#666" }}>
              ຕ້ອງມີຜູ້ໃຫຍ່ຢ່າງໜ້ອຍໜຶ່ງຄົນອາໄສຢູ່ໃນຄົວເຮືອນຂອງທ່ານ {/* At least one adult must be living in your household */}
            </Typography>

            <FormControl component="fieldset" sx={{ mb: 3, width: "100%" }}>
              <FormLabel component="legend">ມີເດັກນ້ອຍມາຢ້ຽມຢາມບໍ່?</FormLabel> {/* Any visiting children? */}
              <RadioGroup
                row
                name="visitingChildren"
                value={formData.visitingChildren.toString()}
                onChange={handleRadioChange}
              >
                <FormControlLabel
                  value="true"
                  control={<Radio />}
                  label="ແມ່ນ" // Yes
                />
                <FormControlLabel
                  value="false"
                  control={<Radio />}
                  label="ບໍ່" // No
                />
              </RadioGroup>
            </FormControl>

            <FormControl component="fieldset" sx={{ width: "100%" }}>
              <FormLabel component="legend">
                ທ່ານມີຄູ່ຮ່ວມຫ້ອງ ຫຼື ຜູ້ເຊົ່າບໍ່? {/* Do you have any flatmates or lodgers? */}
              </FormLabel>
              <RadioGroup
                row
                name="flatmatesOrLodgers"
                value={formData.flatmatesOrLodgers.toString()}
                onChange={handleRadioChange}
              >
                <FormControlLabel
                  value="true"
                  control={<Radio />}
                  label="ແມ່ນ" // Yes
                />
                <FormControlLabel
                  value="false"
                  control={<Radio />}
                  label="ບໍ່" // No
                />
              </RadioGroup>
            </FormControl>

          </>
        );

      case 3: // Other Animals
        return (
          <>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <FormControl component="fieldset" sx={{ width: "100%" }}>
                  <FormLabel component="legend">
                    ມີສັດອື່ນໆຢູ່ເຮືອນຂອງທ່ານບໍ່? {/* Are there any other animals at your home? */}
                  </FormLabel>
                  <RadioGroup
                    row
                    name="otherAnimals"
                    value={formData.otherAnimals.toString()}
                    onChange={handleRadioChange}
                  >
                    <FormControlLabel
                      value="true"
                      control={<Radio />}
                      label="ແມ່ນ" // Yes
                    />
                    <FormControlLabel
                      value="false"
                      control={<Radio />}
                      label="ບໍ່" // No
                    />
                  </RadioGroup>
                </FormControl>
              </Grid>

              {formData.otherAnimals && (
                <Grid item xs={12}>
                  <TextField
                    id="otherAnimalsDetails"
                    name="otherAnimalsDetails"
                    label="ຖ້າແມ່ນ, ກະລຸນາລະບຸຊະນິດ, ອາຍຸ ແລະ ເພດ" // If yes, please state their species, age and gender
                    fullWidth
                    multiline
                    rows={3}
                    variant="outlined"
                    value={formData.otherAnimalsDetails}
                    onChange={handleInputChange}
                    required
                  />
                </Grid>
              )}

              <Grid item xs={12}>
                <FormControl component="fieldset" sx={{ width: "100%" }}>
                  <FormLabel component="legend">
                    ຖ້າແມ່ນ, ພວກມັນຖືກໝັນແລ້ວບໍ? {/* If yes, are they neutered? */}
                  </FormLabel>
                  <RadioGroup
                    row
                    name="areAnimalsNeutered"
                    value={formData.areAnimalsNeutered}
                    onChange={handleRadioChange}
                  >
                    <FormControlLabel
                      value="true"
                      control={<Radio />}
                      label="ແມ່ນ" // Yes
                    />
                    <FormControlLabel
                      value="false"
                      control={<Radio />}
                      label="ບໍ່" // No
                    />
                    <FormControlLabel
                      value="not_applicable"
                      control={<Radio />}
                      label="ບໍ່ກ່ຽວຂ້ອງ" // Not Applicable
                    />
                  </RadioGroup>
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <FormControl component="fieldset" sx={{ width: "100%" }}>
                  <FormLabel component="legend">
                    ມີໃຜໃນຄົວເຮືອນມີອາການແພ້ສັດລ້ຽງບໍ່? {/* Does anyone in the household have any allergies to pets? */}
                  </FormLabel>
                  <RadioGroup
                    row
                    name="areAnimalsAllergies"
                    value={formData.areAnimalsAllergies.toString()}
                    onChange={handleRadioChange}
                  >
                    <FormControlLabel
                      value="true"
                      control={<Radio />}
                      label="ແມ່ນ" // Yes
                    />
                    <FormControlLabel
                      value="false"
                      control={<Radio />}
                      label="ບໍ່" // No
                    />
                  </RadioGroup>
                </FormControl>
              </Grid>
            </Grid>

            <Box sx={{ mt: 4, display: "flex", justifyContent: "flex-end" }}>
              <SubmitButton
                onClick={handleSubmit}
                disabled={submitting}
                endIcon={submitting ? <CircularProgress size={20} /> : null}
              >
                {submitting ? "ກໍາລັງສົ່ງ..." : "ສົ່ງຄໍາຮ້ອງຂໍ"} {/* Submitting... : Submit Application */}
              </SubmitButton>
            </Box>
          </>
        );

      case 4: // Confirm
        return (
          <>
            <Typography
              variant="h6"
              sx={{
                fontWeight: "bold",
                mb: 2,
                display: "flex",
                justifyContent: "center",
              }}
            >
              ຂໍຂອບໃຈສໍາລັບການສົ່ງຄໍາຮ້ອງຂໍ {/* Thanks For Submitting */}
            </Typography>

            <Typography variant="body1" sx={{ mb: 4, textAlign: "center" }}>
              ເຈົ້າຂອງສັດລ້ຽງປັດຈຸບັນຈະໄດ້ຮັບລິ້ງໄປຫາໂປຣໄຟລ໌ຂອງທ່ານ ເມື່ອຄໍາຮ້ອງຂໍຂອງທ່ານໄດ້ຮັບການອະນຸມັດໂດຍ Furry Friends. {/* The pet's current owner will be sent a link to your profile when your application has been approved by Furry Friends. */}
            </Typography>

            <Box sx={{ display: "flex", justifyContent: "center", mb: 4 }}>
              <img
                src="/src/assets/icons/Dog paw-rafiki 1.png"
                alt="ຮູບປະກອບສັດລ້ຽງທີ່ໜ້າຮັກ" // Cute pet illustration
              />
            </Box>

            <Box sx={{ display: "flex", justifyContent: "center" }}>
              <Button
                variant="contained"
                onClick={() => navigate("/pet")}
                sx={{
                  bgcolor: "#9990DA",
                  "&:hover": { bgcolor: "#8470C0" },
                  px: 3,
                  py: 1,
                  borderRadius: "4px",
                }}
              >
                ໄປທີ່ໂປຣໄຟລ໌ຂອງຂ້ອຍ {/* Go To My Profile */}
              </Button>
            </Box>
          </>
        );

      default:
        return "";
    }
  };

  const isLastStep = activeStep === steps.length - 1;
  const isSecondLastStep = activeStep === steps.length - 2;

  return (
    <Container maxWidth="md">
      <Box sx={{ width: "100%", my: 4 }}>
        <Stepper
          activeStep={activeStep}
          alternativeLabel
          connector={<CustomStepConnector />}
          sx={{ mb: 4 }}
        >
          {steps.map((step, index) => (
            <Step key={step.label} completed={activeStep > index}>
              <StepLabel StepIconComponent={CustomStepIcon}>
                <Typography
                  variant="body2"
                  sx={{
                    color: activeStep >= index ? activeColor : "text.secondary",
                    fontWeight: activeStep === index ? "medium" : "normal",
                  }}
                >
                  {step.label}
                </Typography>
              </StepLabel>
            </Step>
          ))}
        </Stepper>

        <Paper elevation={2} sx={{ p: 3, borderRadius: 2, bgcolor: "#fff" }}>
          {getStepContent(activeStep)}

          <Box>
            <Divider sx={{ mt: 5 }} />

            <Box
              sx={{ display: "flex", justifyContent: "space-between", mt: 4 }}
            >
              {activeStep > 0 && !isLastStep && (
                <BackButton
                  startIcon={<ArrowBackIcon />}
                  onClick={handleBack}
                  sx={{ color: "#9990DA" }}
                >
                  ກັບຄືນ {/* Back */}
                </BackButton>
              )}
              {!isLastStep && !isSecondLastStep && (
                <ContinueButton
                  endIcon={<ArrowForwardIcon />}
                  onClick={handleNext}
                  sx={{ ml: "auto" }}
                >
                  ສືບຕໍ່ {/* Continue */}
                </ContinueButton>
              )}
            </Box>
          </Box>
        </Paper>
      </Box>

      {/* Snackbar for alerts */}
      <Snackbar open={openSnackbar} autoHideDuration={6000} onClose={handleSnackbarClose}>
        <Alert
          onClose={handleSnackbarClose}
          severity={error ? "error" : "success"}
          sx={{ width: '100%' }}
        >
          {error || successMessage}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default PetAdoptionForm;