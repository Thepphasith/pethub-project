import React, { ChangeEvent, useState, useEffect } from "react";
import {
  ThemeProvider,
  createTheme,
  CssBaseline,
  Container,
  Box,
  Paper,
  Typography,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Checkbox,
  Stepper,
  Step,
  StepLabel,
  Grid,
  Avatar,
  Divider,
  styled,
  IconButton,
  CircularProgress,
  RadioGroup,
  Radio,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
} from "@mui/material";
import {
  ArrowBack as ArrowBackIcon,
  ArrowForward as ArrowForwardIcon,
  PhotoCamera as PhotoCameraIcon,
  Check as CheckIcon,
  LocationOn as LocationOnIcon,
  Pets as PetsIcon,
  Description as DescriptionIcon,
  Home as HomeIcon,
  Help as HelpIcon,
  Assignment as AssignmentIcon,
  Info as InfoIcon,
  Delete as DeleteIcon,
  CloudUpload as CloudUploadIcon,
} from "@mui/icons-material";
import CircleIcon from "@mui/icons-material/Circle";
import axiosInstance from "../../../../configs/axios";

interface PetFormData {
  email: string;
  firstName: string;
  lastName: string;
  petType: boolean; // true for Dog, false for Cat
  petImages: File[];
  petImagePreviews: string[];
  petDocuments: File[];
  petDocumentPreviews: string[];
  petName: string;
  petAge: string; // yearAge
  monthAge: string;
  petSize: string;
  petGender: string;
  petBreed: string;
  petColors: string;
  shotsUpToDate: string;
  hasSpecialNeeds: string;
  hasBehavioralIssues: string;
  petStory: string; // bio
  areAnimals: string;
  price: string;
  weight: string;
  height: string;
}

interface Breed {
  id: string;
  breedName: string;
  type?: string; // Optional field to filter by pet type (DOG/CAT)
}

// User model interface
interface UserModel {
  email?: string;
  firstName?: string;
  lastName?: string;
  avatar?: string;
}

// ... [rest of the styled components remain the same]
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

// Define theme
const theme = createTheme({
  palette: {
    primary: {
      main: "#6C63FF",
    },
    secondary: {
      main: "#45B26B",
    },
    background: {
      default: "white",
    },
  },
  components: {
    MuiStepIcon: {
      styleOverrides: {
        root: {
          "&.Mui-completed": {
            color: "#45B26B",
          },
          "&.Mui-active": {
            color: "#45B26B",
          },
        },
      },
    },
  },
});
const inactiveColor = "#e0e0e0";

// Custom step connector
const CustomStepConnector = styled("div")(({ theme }) => ({
  top: 22,
  left: "calc(-50% + 16px)",
  right: "calc(50% + 16px)",
  position: "absolute",
  borderTop: `2px dashed ${inactiveColor}`,
  zIndex: 0,
}));

// Step icon component
const CustomStepIcon = (props: any) => {
  const { active, completed, icon } = props;

  const icons: { [index: string]: React.ReactElement } = {
    1: <HomeIcon />,
    2: <HelpIcon />,
    3: <PhotoCameraIcon />,
    4: <PetsIcon />,
    5: <InfoIcon />,
    6: <LocationOnIcon />,
    7: <DescriptionIcon />,
    8: <AssignmentIcon />,
    9: <CheckIcon />,
  };

  return (
    <Box
      sx={{
        backgroundColor: active || completed ? "#B9B3E5" : "#E0E0E0",
        color: "#fff",
        width: 50,
        height: 50,
        display: "flex",
        borderRadius: "80%",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      {icons[String(icon)]}
    </Box>
  );
};

// Main application component
const PetRehomingApp: React.FC = () => {
  // State for the stepper
  const [activeStep, setActiveStep] = useState<number>(0);
  const [termsAgreed, setTermsAgreed] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [userData, setUserData] = useState<UserModel | null>(null);
  const [formSubmitted, setFormSubmitted] = useState<boolean>(false);
  const [submissionSuccess, setSubmissionSuccess] = useState<boolean>(false);
  const [breeds, setBreeds] = useState<Breed[]>([]);
  const [selectedBreedName, setSelectedBreedName] = useState<string>("");

  // Form data
  const [formData, setFormData] = useState<PetFormData>({
    email: "",
    firstName: "",
    lastName: "",
    petType: false,
    petImages: [] as File[],
    petImagePreviews: [] as string[],
    petDocuments: [] as File[],
    petDocumentPreviews: [] as string[],
    petName: "",
    petAge: "0", // yearAge
    monthAge: "0",
    petSize: "",
    petGender: "",
    petBreed: "",
    petColors: "All",
    shotsUpToDate: "",
    hasSpecialNeeds: "",
    hasBehavioralIssues: "",
    petStory: "",
    areAnimals: "",
    price: "0",
    weight: "0",
    height: "0",
  });

  console.log(formData);

  const fetchBreeds = async (): Promise<void> => {
    try {
      setLoading(true);
      setError(null);
      const response = await axiosInstance.get("/breed");

      // Assuming the API returns data in a standard format
      // Adjust according to your actual API response structure
      const breedsData = response.data?.data || response.data || [];

      setBreeds(breedsData);
    } catch (error) {
      console.error("Error fetching breeds:", error);
      setError("Failed to load breed information. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  // Fetch user data when component mounts
  useEffect(() => {
    handleGetAllData();
    fetchBreeds();
  }, []);

  // Helper function to filter breeds based on current pet type (if needed)
  const getFilteredBreeds = (): Breed[] => {
    if (breeds.length === 0) return [];

    // If the API provides petType field, filter breeds based on the current selection
    const petTypeValue = formData.petType ? "DOG" : "CAT";

    // Filter by pet type if breeds have petType field, otherwise return all breeds
    return breeds.filter(
      (breed) => !breed.type || breed.type === petTypeValue
    );
  };

  // Modified handleSelectChange to handle breed selection specially
  const handleSelectChangeBreed = (e: any) => {
    const { name, value } = e.target;

    // If this is a breed selection
    if (name === "petBreed") {
      // Find the breed object based on selected name
      const selectedBreed = breeds.find((breed) => breed.breedName === value);

      if (selectedBreed) {
        // Store breed name for display
        setSelectedBreedName(value);

        // Store breed ID in the form data
        setFormData((prev) => ({
          ...prev,
          petBreed: selectedBreed.id,
        }));
      } else {
        // If no breed found, reset both
        setSelectedBreedName("");
        setFormData((prev) => ({
          ...prev,
          petBreed: "",
        }));
      }
    } else {
      // Handle other select changes normally
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const getBreedNameById = (breedId: string): string => {
    if (!breedId) return "";
    const breed = breeds.find((b) => b.id === breedId);
    return breed ? breed.breedName : "";
  };

  // Update form data when user data is loaded
  useEffect(() => {
    if (userData) {
      setFormData((prevFormData) => ({
        ...prevFormData,
        email: userData.email || "",
        firstName: userData.firstName || "",
        lastName: userData.lastName || "",
      }));
    }
  }, [userData]);

  // Cleanup URLs when component unmounts
  useEffect(() => {
    return () => {
      // Clean up preview URLs to prevent memory leaks
      formData.petImagePreviews.forEach(URL.revokeObjectURL);
      formData.petDocumentPreviews.forEach(URL.revokeObjectURL);
    };
  }, []);

  // Function to fetch user data from API
  const handleGetAllData = async (): Promise<void> => {
    try {
      setLoading(true);
      setError(null);
      const res = await axiosInstance.get("/auth/user/profile");
      setUserData(res.data?.data || res.data);
    } catch (error) {
      console.error("Error fetching user data:", error);
      setError("Failed to load user profile. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  // Cleanup URLs when component unmounts
  useEffect(() => {
    return () => {
      // Clean up preview URLs to prevent memory leaks
      formData.petImagePreviews.forEach(URL.revokeObjectURL);
      formData.petDocumentPreviews.forEach(URL.revokeObjectURL);
    };
  }, []);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>): void => {
    if (e.target.files && e.target.files.length > 0) {
      const newFiles = Array.from(e.target.files);

      // Create preview URLs for the images
      const newPreviews = newFiles.map((file) => URL.createObjectURL(file));

      setFormData((prevFormData) => ({
        ...prevFormData,
        petImages: [...prevFormData.petImages, ...newFiles],
        petImagePreviews: [
          ...(prevFormData.petImagePreviews || []),
          ...newPreviews,
        ],
      }));

      // Reset the input value to allow uploading the same file again
      e.target.value = "";
    }
  };

  const handleSubmitPet = async () => {
    try {
      setLoading(true);
      setError(null);
      setFormSubmitted(true);

      // Create a new FormData instance
      const petFormData = new FormData();

      // Map form data to API expected keys
      petFormData.append("petName", formData.petName);
      petFormData.append("petType", formData.petType ? "DOG" : "CAT");
      petFormData.append("size", formData.petSize);
      petFormData.append("yearAge", formData.petAge);
      petFormData.append("monthAge", formData.monthAge);
      petFormData.append("gender", formData.petGender);
      petFormData.append("color", formData.petColors);
      petFormData.append("bio", formData.petStory);
      petFormData.append("breedId", formData.petBreed);
      petFormData.append("price", formData.price);
      petFormData.append("weight", formData.weight);
      petFormData.append("height", formData.height);
      petFormData.append("status", "AVAILABLE");

      // Append images
      formData.petImages.forEach((image: File) => {
        petFormData.append("images", image);
      });

      // Append documents
      formData.petDocuments.forEach((doc: File) => {
        petFormData.append("documentImages", doc);
      });

      // Submit the form data
      const response = await axiosInstance.post("/pets", petFormData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      // Handle successful response
      console.log("Pet created successfully:", response.data);
      setSubmissionSuccess(true);

      // Move to the final step or show success message
      setActiveStep(steps.length - 1);

      return response.data;
    } catch (error) {
      console.error("Error creating pet:", error);
      setError("Failed to create pet. Please try again.");
      setFormSubmitted(false);
      setSubmissionSuccess(false);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const handleDocumentUpload = (
    e: React.ChangeEvent<HTMLInputElement>
  ): void => {
    if (e.target.files && e.target.files.length > 0) {
      const newFiles = Array.from(e.target.files);

      // Create preview URLs for the documents
      const newPreviews = newFiles.map((file) => URL.createObjectURL(file));

      setFormData((prevFormData) => ({
        ...prevFormData,
        petDocuments: [...prevFormData.petDocuments, ...newFiles],
        petDocumentPreviews: [
          ...(prevFormData.petDocumentPreviews || []),
          ...newPreviews,
        ],
      }));

      // Reset the input value to allow uploading the same file again
      e.target.value = "";
    }
  };

  const handleDeleteImage = (index: number) => {
    // Create a copy of the arrays
    const newImages = [...formData.petImages];
    const newPreviews = [...formData.petImagePreviews];

    // Revoke the URL to prevent memory leaks
    URL.revokeObjectURL(newPreviews[index]);

    // Remove the item at the specified index
    newImages.splice(index, 1);
    newPreviews.splice(index, 1);

    // Update state
    setFormData({
      ...formData,
      petImages: newImages,
      petImagePreviews: newPreviews,
    });
  };

  const handleDeleteDocument = (index: number) => {
    // Create a copy of the arrays
    const newDocuments = [...formData.petDocuments];
    const newPreviews = [...formData.petDocumentPreviews];

    // Revoke the URL to prevent memory leaks
    URL.revokeObjectURL(newPreviews[index]);

    // Remove the item at the specified index
    newDocuments.splice(index, 1);
    newPreviews.splice(index, 1);

    // Update state
    setFormData({
      ...formData,
      petDocuments: newDocuments,
      petDocumentPreviews: newPreviews,
    });
  };
  // Handle radio changes
  const handleRadioChange = (e: ChangeEvent<HTMLInputElement>): void => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value === "true" ? true : value === "false" ? false : value,
    });
  };

  const isFormValid = (): boolean => {
    // Check basic required fields
    const basicFieldsValid =
      formData.petName.trim() !== "" &&
      formData.petSize !== "" &&
      formData.petGender !== "" &&
      formData.petBreed !== "" &&
      formData.petImages.length > 0;

    // Check additional required fields
    const additionalFieldsValid =
      formData.petAge !== "" &&
      formData.monthAge !== "" &&
      formData.petColors !== "" &&
      formData.petStory.trim() !== "";

    // Check numeric fields have valid values
    const numericFieldsValid =
      !isNaN(parseFloat(formData.price)) &&
      !isNaN(parseFloat(formData.weight)) &&
      !isNaN(parseFloat(formData.height)) &&
      parseFloat(formData.price) >= 0 &&
      parseFloat(formData.weight) >= 0 &&
      parseFloat(formData.height) >= 0;

    return basicFieldsValid && additionalFieldsValid && numericFieldsValid;
  };

  // Handle input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  // Handle select changes
  const handleSelectChange = (e: any) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handle next step
  const handleNext = () => {
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  // Handle back step
  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  // Steps for the application process
  const steps = [
    "ເລີ່ມຫາບ້ານ",
    "ຮູບສັດລ້ຽງ",
    "ລັກສະນະ ",
    "ເລື່ອງລາວຂອງສັດ",
    "ເອກກະສານ",
    "ຢືນຢັນ",
  ];

  // Check if this is the final step
  const isLastStep = activeStep === steps.length - 1;

  // Form content for each step
  const getStepContent = (step: number) => {
    // Show loading for the first step while fetching user data
    if (step === 0 && loading) {
      return (
        <Box
          sx={{
            p: 4,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            height: "300px",
          }}
        >
          <CircularProgress sx={{ color: "#9990DA", mb: 2 }} />
          <Typography>Loading your profile information...</Typography>
        </Box>
      );
    }

    // Show error if there was a problem loading user data
    if (step === 0 && error) {
      return (
        <Box
          sx={{
            p: 4,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            height: "300px",
          }}
        >
          <Typography color="error" sx={{ mb: 2 }}>
            {error}
          </Typography>
          <Button
            variant="outlined"
            onClick={handleGetAllData}
            sx={{ color: "#9990DA", borderColor: "#9990DA" }}
          >
            Retry
          </Button>
        </Box>
      );
    }

    switch (step) {
      case 0:
        return (
          <Box
            sx={{
              p: 4,
              borderRadius: 2,
              bgcolor: "white",
              maxWidth: "800px",
              margin: "0 auto",
            }}
          >
            <Box sx={{ display: "flex", alignItems: "flex-start", mb: 3 }}>
              <Avatar
                sx={{
                  width: 80,
                  height: 80,
                  mr: 4,
                  bgcolor: "#f0f0f0",
                }}
                src={userData?.avatar || "/api/placeholder/80/80"}
              />
              <Grid container spacing={3}>
                <Grid item xs={12} sm={4}>
                  <Typography variant="h6" color="text.secondary">
                    ອີເມລ/ບັນຊີ
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={8}>
                  <Typography variant="h6">{formData.email}</Typography>
                </Grid>

                <Grid item xs={12} sm={4}>
                  <Typography variant="h6" color="text.secondary">
                    ຊື່ແທ້ຂອງທ່ານ
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={8}>
                  <Typography variant="h6">{formData.firstName}</Typography>
                </Grid>

                <Grid item xs={12} sm={4}>
                  <Typography variant="h6" color="text.secondary">
                    ນາມສະກຸນຂອງທ່ານ
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={8}>
                  <Typography variant="h6">{formData.lastName}</Typography>
                </Grid>
              </Grid>
            </Box>

            <FormControlLabel
              control={
                <Checkbox
                  name="agreeToTerms"
                  checked={termsAgreed}
                  onChange={(e) => setTermsAgreed(e.target.checked)}
                />
              }
              label={
                <Typography>
                  ຂ້ອຍໄດ້ອ່ານ ແລະ ເຫັນດີກັບຂໍ້ກຳນົດ ແລະ{" "}
                  <span style={{ color: theme.palette.primary.main }}>
                    ນະໂຍບາຍຄວາມເປັນສ່ວນຕົວ
                  </span>
                </Typography>
              }
              sx={{ mt: 2 }}
            />

            <Box sx={{ mt: 2 }}>
              <Typography>
                ເພື່ອສະໝັກຮັບລ້ຽງສັດລ້ຽງ, ທ່ານຕ້ອງຕື່ມຂໍ້ມູນໃສ່ບາງຊ່ອງ. ກົດ ເລີ່ມຕົ້ນ...
              </Typography>
            </Box>
            <Box
              sx={{ mt: 3, display: "flex", justifyContent: "flex-end" }}
            ></Box>
          </Box>
        );

      // ... [all other cases remain the same] ...
      case 1:
        return (
          <Box sx={{ p: 3 }}>
            <Typography variant="body2" sx={{ mb: 1 }}>
              ຮູບແບບຂອງຮູບຄວນເປັນ (.jpg, .png, .jpeg )
            </Typography>
            <Typography variant="body2" sx={{ mb: 1 }}>
              ຂະໜາດຂອງຮູບພາບຕ້ອງເປັນສີ່ຫຼ່ຽມມົນທົນ, ໂດຍມີຂະໜາດ 600 × 600 ພິກເຊວ.
            </Typography>
            <Typography variant="body2" sx={{ mb: 2 }}>
             ຂະໜາດສູງສຸດ ແລະ ໜ້ອຍສຸດຂອງຮູບພາບແມ່ນ 1024 ແລະ 240 KB.
            </Typography>

            <Grid container spacing={2} sx={{ mt: 1 }}>
              {/* Display images that are already uploaded */}
              {formData.petImagePreviews.map((preview, index) => (
                <Grid item xs={12} sm={6} md={4} key={`preview-${index}`}>
                  <PreviewBox>
                    <img
                      src={preview}
                      alt={`Pet preview ${index + 1}`}
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                      }}
                    />
                    <DeleteButton
                      onClick={() => handleDeleteImage(index)}
                      aria-label="delete image"
                    >
                      <DeleteIcon style={{ color: "#ff5252" }} />
                    </DeleteButton>
                  </PreviewBox>
                </Grid>
              ))}

              {/* Upload button */}
              {formData.petImages.length < 5 && (
                <Grid item xs={12} sm={6} md={4}>
                  <input
                    accept="image/*"
                    style={{ display: "none" }}
                    id="image-upload"
                    type="file"
                    onChange={handleImageUpload}
                    multiple
                  />
                  <label htmlFor="image-upload">
                    <ImageUploadBox>
                      <Typography variant="body2" sx={{ mb: 1 }}>
                        ເພີ່ມຮູບພາບ
                      </Typography>
                      <PhotoCameraIcon
                        sx={{ fontSize: 40, color: "#aaa", mb: 1 }}
                      />
                      <Typography variant="caption" color="textSecondary">
                        ກົດເພື່ອອັບໂຫຼດ (ສູງສຸດ 5 ຮູບ)
                      </Typography>
                    </ImageUploadBox>
                  </label>
                </Grid>
              )}
            </Grid>

            {formData.petImages.length === 0 && (
              <Typography variant="body2" color="error" sx={{ mt: 2 }}>
                ກະລຸນາອັບໂຫຼດຮູບສັດລ້ຽງຂອງທ່ານຢ່າງໜ້ອຍໜຶ່ງຮູບ
              </Typography>
            )}
          </Box>
        );

      case 2:
        return (
          <Box sx={{ p: 3 }}>
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="ຊື່ສັດ"
                  name="petName"
                  value={formData.petName}
                  onChange={handleInputChange}
                  required
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      "&:hover fieldset": {
                        borderColor: "#B9B3E5",
                      },
                      "&.Mui-focused fieldset": {
                        borderColor: "#6C63FF",
                      },
                    },
                  }}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <FormControl fullWidth required>
                  <InputLabel id="pet-age-label">ອາຍຸ (ປີເກີດ)</InputLabel>
                  <Select
                    labelId="pet-age-label"
                    name="petAge"
                    value={formData.petAge}
                    onChange={handleSelectChange}
                    label=" ອາຍຸ(Years)"
                  >
                    <MenuItem value="0">0</MenuItem>
                    <MenuItem value="1">1</MenuItem>
                    <MenuItem value="2">2</MenuItem>
                    <MenuItem value="3">3</MenuItem>
                    <MenuItem value="4">4</MenuItem>
                    <MenuItem value="5">5</MenuItem>
                    <MenuItem value="6">6</MenuItem>
                    <MenuItem value="7">7</MenuItem>
                    <MenuItem value="8">8</MenuItem>
                    <MenuItem value="9">9</MenuItem>
                    <MenuItem value="10">10+</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              {/* Enhanced Pet Type Selector */}
              <Grid item xs={12}>
                <Box
                  sx={{
                    mt: 1,
                    mb: 1,
                    width: "100%",
                    borderRadius: "10px",
                    padding: "20px",
                    backgroundColor: "#f8f8ff",
                  }}
                >
                  <Typography
                    variant="subtitle1"
                    sx={{
                      mb: 2,
                      fontWeight: 500,
                      color: "text.primary",
                    }}
                  >
                    ຈົ່ງເລືອກໝາ ຫຼື ແມວ
                  </Typography>

                  <FormControl component="fieldset" fullWidth>
                    <RadioGroup
                      name="petType"
                      value={formData.petType === true ? "true" : "false"}
                      onChange={handleRadioChange}
                    >
                      <Grid container spacing={2}>
                        <Grid item xs={12} sm={6}>
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              padding: "12px 16px",
                              border: "2px solid",
                              borderColor:
                                formData.petType === true
                                  ? "#6C63FF"
                                  : "#e0e0e0",
                              borderRadius: "8px",
                              backgroundColor:
                                formData.petType === true
                                  ? "rgba(108, 99, 255, 0.05)"
                                  : "white",
                              cursor: "pointer",
                              transition: "all 0.2s ease",
                              "&:hover": {
                                borderColor: "#9990DA",
                                backgroundColor: "rgba(108, 99, 255, 0.05)",
                              },
                            }}
                            onClick={() => {
                              setFormData({
                                ...formData,
                                petType: true,
                              });
                            }}
                          >
                            <Radio
                              checked={formData.petType === true}
                              value="true"
                              name="pet-type-radio"
                              sx={{
                                "&.Mui-checked": {
                                  color: "#9990DA",
                                },
                              }}
                            />
                            <Box
                              sx={{
                                display: "flex",
                                alignItems: "center",
                                ml: 1,
                              }}
                            >
                              <PetsIcon
                                sx={{
                                  fontSize: "32px",
                                  color:
                                    formData.petType === true
                                      ? "#9990DA"
                                      : "#757575",
                                  mr: 1,
                                }}
                              />
                              <Typography
                                variant="body1"
                                sx={{
                                  fontWeight:
                                    formData.petType === true ? 500 : 400,
                                  color:
                                    formData.petType === true
                                      ? "#6C63FF"
                                      : "text.primary",
                                }}
                              >
                                ໝາ
                              </Typography>
                            </Box>
                          </Box>
                        </Grid>

                        <Grid item xs={12} sm={6}>
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              padding: "12px 16px",
                              border: "2px solid",
                              borderColor:
                                formData.petType === false
                                  ? "#9990DA"
                                  : "#e0e0e0",
                              borderRadius: "8px",
                              backgroundColor:
                                formData.petType === false
                                  ? "rgba(108, 99, 255, 0.05)"
                                  : "white",
                              cursor: "pointer",
                              transition: "all 0.2s ease",
                              "&:hover": {
                                borderColor: "#9990DA",
                                backgroundColor: "rgba(108, 99, 255, 0.05)",
                              },
                            }}
                            onClick={() => {
                              setFormData({
                                ...formData,
                                petType: false,
                              });
                            }}
                          >
                            <Radio
                              checked={formData.petType === false}
                              value="false"
                              name="pet-type-radio"
                              sx={{
                                "&.Mui-checked": {
                                  color: "#9990DA",
                                },
                              }}
                            />
                            <Box
                              sx={{
                                display: "flex",
                                alignItems: "center",
                                ml: 1,
                              }}
                            >
                              <PetsIcon
                                sx={{
                                  fontSize: "32px",
                                  color:
                                    formData.petType === false
                                      ? "#9990DA"
                                      : "#757575",
                                  mr: 1,
                                }}
                              />
                              <Typography
                                variant="body1"
                                sx={{
                                  fontWeight:
                                    formData.petType === false ? 500 : 400,
                                  color:
                                    formData.petType === false
                                      ? "#6C63FF"
                                      : "text.primary",
                                }}
                              >
                                ແມວ
                              </Typography>
                            </Box>
                          </Box>
                        </Grid>
                      </Grid>
                    </RadioGroup>
                  </FormControl>
                </Box>
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth required>
                  <InputLabel id="pet-size-label">ຂະໜາດ</InputLabel>
                  <Select
                    labelId="pet-size-label"
                    name="petSize"
                    value={formData.petSize}
                    onChange={handleSelectChange}
                    label="Size"
                  >
                    <MenuItem value="">
                      <em>ຈົ່ງເລືອກ</em>
                    </MenuItem>
                    <MenuItem value="SMALL">ນ້ອຍ</MenuItem>
                    <MenuItem value="MEDIUM">ກາງ</MenuItem>
                    <MenuItem value="LARGE">ໃຫຍ່</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} sm={6}>
                <FormControl fullWidth required>
                  <InputLabel id="pet-gender-label">ເພດ</InputLabel>
                  <Select
                    labelId="pet-gender-label"
                    name="petGender"
                    value={formData.petGender}
                    onChange={handleSelectChange}
                    label="Gender"
                  >
                    <MenuItem value="">
                      <em>ຈົ່ງເລືອກ</em>
                    </MenuItem>
                    <MenuItem value="MALE">ຊາຍ</MenuItem>
                    <MenuItem value="FEMALE">ຍິງ</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} sm={6}>
                <FormControl fullWidth required>
                  <InputLabel id="pet-breed-label">ສາຍພັນ</InputLabel>
                  <Select
                    labelId="pet-breed-label"
                    name="petBreed"
                    value={selectedBreedName} // Display the breed name
                    onChange={handleSelectChangeBreed}
                    label="Breed(s)"
                  >
                    <MenuItem value="">
                      <em>ເລືອກສາຍພັນ</em>
                    </MenuItem>
                    {loading ? (
                      <MenuItem disabled>ກຳລັງໂຫຼດສາຍພັນ...</MenuItem>
                    ) : (
                      getFilteredBreeds().map((breed) => (
                        <MenuItem key={breed.id} value={breed.breedName}>
                          {breed.breedName}
                        </MenuItem>
                      ))
                    )}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} sm={6}>
                <FormControl fullWidth required>
                  <InputLabel id="pet-colors-label">ສີ</InputLabel>
                  <Select
                    labelId="pet-colors-label"
                    name="petColors"
                    value={formData.petColors}
                    onChange={handleSelectChange}
                    label="Colors"
                  >
                    <MenuItem value="ALL">All</MenuItem>
                    <MenuItem value="BLACK">Black</MenuItem>
                    <MenuItem value="WHITE">White</MenuItem>
                    <MenuItem value="BROWN">Brown</MenuItem>
                    {/* Add more color options as needed */}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} sm={6}>
                <FormControl fullWidth required>
                  <InputLabel id="pet-month-age-label">ອາຍຸ (ເດືອນ)</InputLabel>
                  <Select
                    labelId="pet-month-age-label"
                    name="monthAge"
                    value={formData.monthAge}
                    onChange={handleSelectChange}
                    label="Age (Months)"
                  >
                    <MenuItem value="0">0</MenuItem>
                    <MenuItem value="1">1</MenuItem>
                    <MenuItem value="2">2</MenuItem>
                    <MenuItem value="3">3</MenuItem>
                    <MenuItem value="4">4</MenuItem>
                    <MenuItem value="5">5</MenuItem>
                    <MenuItem value="6">6</MenuItem>
                    <MenuItem value="7">7</MenuItem>
                    <MenuItem value="8">8</MenuItem>
                    <MenuItem value="9">9</MenuItem>
                    <MenuItem value="10">10</MenuItem>
                    <MenuItem value="11">11</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="ລາຄາ ($)"
                  name="price"
                  type="number"
                  value={formData.price}
                  onChange={handleInputChange}
                  InputProps={{ inputProps: { min: 0 } }}
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      "&:hover fieldset": {
                        borderColor: "#B9B3E5",
                      },
                      "&.Mui-focused fieldset": {
                        borderColor: "#6C63FF",
                      },
                    },
                  }}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="ນໍ້າໜັກ (lbs)"
                  name="weight"
                  type="number"
                  value={formData.weight}
                  onChange={handleInputChange}
                  InputProps={{ inputProps: { min: 0 } }}
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      "&:hover fieldset": {
                        borderColor: "#B9B3E5",
                      },
                      "&.Mui-focused fieldset": {
                        borderColor: "#6C63FF",
                      },
                    },
                  }}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="ຄວາມສູງ (inches)"
                  name="height"
                  type="number"
                  value={formData.height}
                  onChange={handleInputChange}
                  InputProps={{ inputProps: { min: 0 } }}
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      "&:hover fieldset": {
                        borderColor: "#B9B3E5",
                      },
                      "&.Mui-focused fieldset": {
                        borderColor: "#6C63FF",
                      },
                    },
                  }}
                />
              </Grid>
            </Grid>
          </Box>
        );
      case 3:
        return (
          <Box sx={{ p: 3 }}>
            <Paper
              elevation={0}
              sx={{
                p: 3,
                mb: 3,
                borderRadius: 2,
                backgroundColor: "#f8f8ff",
              }}
            >
              <Typography variant="body1" sx={{ mb: 2 }}>
                ແບ່ງປັນຂໍ້ມູນກ່ຽວກັບສັດລ້ຽງຂອງທ່ານຢູ່ບ່ອນນີ້. (ຂໍ້ມູນປະຫວັດສັດລ້ຽງຂອງທ່ານຈະເປີດເຜີຍຕໍ່ສາທາລະນະ. ເພື່ອຄວາມປອດໄພຂອງທ່ານ, ຢ່າໃສ່ລາຍລະອຽດສ່ວນຕົວ ຫຼື ຂໍ້ມູນຕິດຕໍ່). ປະກອບມີຂໍ້ມູນເຊັ່ນ:</Typography>

              <List dense disablePadding>
                <ListItem alignItems="flex-start">
                  <ListItemIcon sx={{ minWidth: "24px", mt: 0.5 }}>
                    <CircleIcon sx={{ fontSize: "8px" }} />
                  </ListItemIcon>
                  <ListItemText primary="ປະຫວັດສັດລ້ຽງຂອງທ່ານ: ທ່ານລ້ຽງເຂົາດົນປານໃດແລ້ວ, ໄດ້ມາຈາກໃສ ແລະ ເປັນຫຍັງຈຶ່ງຕ້ອງການຫາເຮືອນໃໝ່ໃຫ້ເຂົາເຈົ້າ" />
                </ListItem>

                <ListItem alignItems="flex-start">
                  <ListItemIcon sx={{ minWidth: "24px", mt: 0.5 }}>
                    <CircleIcon sx={{ fontSize: "8px" }} />
                  </ListItemIcon>
                  <ListItemText primary="ລາຍລະອຽດກ່ຽວກັບວ່າສັດລ້ຽງຂອງທ່ານເຄີຍຢູ່ກັບໃຜແດ່, ເຊັ່ນ: ເດັກນ້ອຍ ແລະ ສັດລ້ຽງອື່ນໆ" />
                </ListItem>

                <ListItem alignItems="flex-start">
                  <ListItemIcon sx={{ minWidth: "24px", mt: 0.5 }}>
                    <CircleIcon sx={{ fontSize: "8px" }} />
                  </ListItemIcon>
                  <ListItemText primary="ກິດຈະກຳທີ່ສັດລ້ຽງຂອງທ່ານມັກ" />
                </ListItem>

                <ListItem alignItems="flex-start">
                  <ListItemIcon sx={{ minWidth: "24px", mt: 0.5 }}>
                    <CircleIcon sx={{ fontSize: "8px" }} />
                  </ListItemIcon>
                  <ListItemText primary="ລາຍລະອຽດຂອງບຸກຄະລິກກະພາບ, ຄວາມມັກ ແລະ ນິໄສຂອງເຂົາເຈົ້າ" />
                </ListItem>

                <ListItem alignItems="flex-start">
                  <ListItemIcon sx={{ minWidth: "24px", mt: 0.5 }}>
                    <CircleIcon sx={{ fontSize: "8px" }} />
                  </ListItemIcon>
                  <ListItemText primary="ສິ່ງທີ່ເຂົາເຈົ້າຢ້ານ ເຊັ່ນ: ດອກໄມ້ໄຟ, ຄົນໃນເຄື່ອງແບບ, ສັດອື່ນໆ" />
                </ListItem>

                <ListItem alignItems="flex-start">
                  <ListItemIcon sx={{ minWidth: "24px", mt: 0.5 }}>
                    <CircleIcon sx={{ fontSize: "8px" }} />
                  </ListItemIcon>
                  <ListItemText primary="ປະເພດອາຫານທີ່ເຂົາເຈົ້າກິນ ລວມທັງຍີ່ຫໍ້ ແລະ ປະລິມານ" />
                </ListItem>

                <ListItem alignItems="flex-start">
                  <ListItemIcon sx={{ minWidth: "24px", mt: 0.5 }}>
                    <CircleIcon sx={{ fontSize: "8px" }} />
                  </ListItemIcon>
                  <ListItemText primary="ອາການແພ້, ພາວະສຸຂະພາບ ແລະ ຢາໃດໆທີ່ສັດລ້ຽງຂອງທ່ານກິນ" />
                </ListItem>

                <ListItem alignItems="flex-start">
                  <ListItemIcon sx={{ minWidth: "24px", mt: 0.5 }}>
                    <CircleIcon sx={{ fontSize: "8px" }} />
                  </ListItemIcon>
                  <ListItemText primary="ຖ້າທ່ານກໍາລັງລົງລາຍຊື່ສັດລ້ຽງທີ່ຕິດພັນກັນເປັນຄູ່, ໃຫ້ແນ່ໃຈວ່າໄດ້ລວມລາຍລະອຽດຂອງສັດລ້ຽງທັງສອງໂຕ" />
                </ListItem>
              </List>
            </Paper>

            <TextField
              fullWidth
              multiline
              rows={8}
              name="petStory"
              onChange={handleInputChange}
              placeholder="ຂຽນຢູ່ບ່ອນນີ້ ..."
              variant="outlined"
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: 1.5,
                  "&:hover fieldset": {
                    borderColor: "#B9B3E5",
                  },
                  "&.Mui-focused fieldset": {
                    borderColor: "#6C63FF",
                  },
                },
              }}
            />
          </Box>
        );

      case 4:
        return (
          <Box sx={{ p: 3 }}>
            <Typography variant="body1" sx={{ mb: 2 }}>
             ຂໍ້ມູນນີ້ຈະບໍ່ເປີດເຜີຍຕໍ່ສາທາລະນະ ແລະ ຈະຖືກແບ່ງປັນກັບຜູ້ຮັບລ້ຽງເມື່ອທ່ານສຳເລັດຂັ້ນຕອນການປ່ຽນເຮືອນໃຫ້ສັດລ້ຽງເທົ່ານັ້ນ. ເພື່ອຄວາມປອດໄພຂອງທ່ານ, ພວກເຮົາແນະນຳໃຫ້ທ່ານປິດບັງຂໍ້ມູນສ່ວນຕົວໃດໆໃນເອກະສານ.
            </Typography>

            <Typography variant="body1" sx={{ mb: 3 }}>
             ຖ້າທ່ານມີປະຫວັດການສັກຢາວັກຊີນ, ຫຼັກຖານການເຮັດໝັນ, ແລະ ຂໍ້ມູນໄມໂຄຣຊິບ, ກະລຸນາອັບໂຫຼດລົງຂ້າງລຸ່ມນີ້.
            </Typography>

            <Typography variant="body2" sx={{ mb: 1 }}>
              ຮູບແບບເອກະສານຄວນເປັນ  (.jpg, .png, .jpeg, .pdf)
            </Typography>
            <Typography variant="body2" sx={{ mb: 2 }}>
             ຂະໜາດໄຟລ໌ສູງສຸດແມ່ນ 5MB 
            </Typography>

            <Grid container spacing={2}>
              {/* Display documents that are already uploaded */}
              {formData.petDocumentPreviews.map((preview, index) => (
                <Grid item xs={12} sm={6} key={`doc-preview-${index}`}>
                  <Paper
                    variant="outlined"
                    sx={{
                      p: 2,
                      height: 200,
                      position: "relative",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <DeleteButton
                      onClick={() => handleDeleteDocument(index)}
                      aria-label="delete document"
                      sx={{ position: "absolute", top: 8, right: 8 }}
                    >
                      <DeleteIcon style={{ color: "#ff5252" }} />
                    </DeleteButton>

                    {formData.petDocuments[index].type.includes("image") ? (
                      <img
                        src={preview}
                        alt={`Document ${index + 1}`}
                        style={{
                          maxWidth: "100%",
                          maxHeight: "140px",
                          objectFit: "contain",
                        }}
                      />
                    ) : (
                      <>
                        <DescriptionIcon fontSize="large" color="primary" />
                        <Typography variant="body2" sx={{ mt: 1 }}>
                          {formData.petDocuments[index].name}
                        </Typography>
                      </>
                    )}
                  </Paper>
                </Grid>
              ))}

              {/* Upload button */}
              {formData.petDocuments.length < 4 && (
                <Grid item xs={12} sm={6}>
                  <input
                    accept="image/*,.pdf"
                    style={{ display: "none" }}
                    id="document-upload"
                    type="file"
                    onChange={handleDocumentUpload}
                  />
                  <label htmlFor="document-upload">
                    <Paper
                      variant="outlined"
                      sx={{
                        p: 2,
                        height: 200,
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "center",
                        borderStyle: "dashed",
                        cursor: "pointer",
                      }}
                    >
                      <CloudUploadIcon
                        fontSize="large"
                        color="disabled"
                        sx={{ mb: 2 }}
                      />
                      <Typography variant="body1" color="textSecondary">
                        ອັບໂຫຼດເອກະສານ
                      </Typography>
                      <Typography variant="caption" color="textSecondary">
                        ກົດເພື່ອເລືອກເອກະສານ
                      </Typography>
                    </Paper>
                  </label>
                </Grid>
              )}
            </Grid>

            {/* Submit and status area */}
            <Box sx={{ mt: 4, textAlign: "center" }}>
              {/* Show submit button if not yet submitted successfully */}
              {!submissionSuccess && (
                <Button
                  variant="contained"
                  onClick={handleSubmitPet}
                  disabled={loading || !isFormValid()}
                  startIcon={
                    loading ? <CircularProgress size={20} /> : <CheckIcon />
                  }
                  sx={{
                    borderRadius: 2,
                    textTransform: "none",
                    bgcolor: "#45B26B",
                    "&:hover": {
                      backgroundColor: "#3a9559",
                    },
                    px: 4,
                    py: 1.5,
                  }}
                >
                  {loading ? "Submitting..." : "ສົ່ງສັດລ້ຽງເພື່ອຫາບ້ານໃໝ່"}
                </Button>
              )}

              {/* Show success message if submitted successfully */}
              {submissionSuccess && (
                <Box sx={{ mt: 2, mb: 4 }}>
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      mb: 2,
                    }}
                  >
                    <CheckIcon sx={{ color: "#45B26B", mr: 1 }} />
                    <Typography variant="h6" color="#45B26B">
                      ສົ່ງສັດລ້ຽງເພື່ອຫາບ້ານໃໝ່ສຳເລັດ
                    </Typography>
                  </Box>
                  <Typography variant="body1">
                    ຂໍ້ມູນສັດລ້ຽງຂອງທ່ານໄດ້ຖືກສົ່ງສຳເລັດແລ້ວ. ກະລຸນາກົດ ສືບຕໍ່ ເພື່ອສຳເລັດຂັ້ນຕອນ.
                  </Typography>
                </Box>
              )}

              {/* Show error if submission failed */}
              {error && (
                <Typography color="error" sx={{ mt: 2, textAlign: "center" }}>
                  {error}
                </Typography>
              )}
            </Box>
          </Box>
        );

      case 5:
        return (
          <Box sx={{ p: 3, textAlign: "center" }}>
            <CheckIcon sx={{ fontSize: 60, color: "#45B26B", mb: 2 }} />

            <Typography variant="h5" sx={{ mb: 2, fontWeight: "bold" }}>
              {formData.petName} has been submitted successfully!
            </Typography>

            <Typography variant="body1" sx={{ mb: 3 }}>
              ພວກເຮົາຈະກວດສອບໂປຣໄຟລ໌ຂອງ {formData.petName} ແລະເຜີຍແຜ່ມັນເພື່ອໃຫ້ຜູ້ທີ່ຕ້ອງການຮັບລ້ຽງໄດ້ເຫັນ.
            </Typography>

            <Box
              sx={{
                mt: 3,
                mb: 4,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
              }}
            >
              <Paper
                elevation={0}
                sx={{
                  p: 3,
                  maxWidth: 500,
                  width: "100%",
                  bgcolor: "#f8f8ff",
                  borderRadius: 2,
                }}
              >
                <Typography variant="h6" sx={{ mb: 2, color: "#6C63FF" }}>
                  ຂໍ້ສັງລວມສັດລ້ຽງ 
                </Typography>

                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">
                      ປະເພດ:
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2">
                      {formData.petType ? "Dog" : "Cat"}
                    </Typography>
                  </Grid>

                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">
                      ຊື່ສັດລ້ຽງ:
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2">{formData.petName}</Typography>
                  </Grid>

                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">
                      ອາຍຸ:
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2">
                      {formData.petAge}{" "}
                      {parseInt(formData.petAge) === 1 ? "year" : "years"}{" "}
                      {parseInt(formData.monthAge) > 0 &&
                        `${formData.monthAge} ${
                          parseInt(formData.monthAge) === 1 ? "month" : "months"
                        }`}
                    </Typography>
                  </Grid>

                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">
                      ສາຍພັນ:
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2">
                      {getBreedNameById(formData.petBreed)}
                    </Typography>
                  </Grid>

                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">
                      ລາຄາ:
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2">${formData.price}</Typography>
                  </Grid>
                </Grid>
              </Paper>
            </Box>

            <Box sx={{ display: "flex", justifyContent: "center", mb: 4 }}>
              <Box
                component="img"
                src="/src/assets/icons/Dog paw-rafiki 1.png"
                alt="Pet illustration"
                sx={{ maxWidth: "250px" }}
              />
            </Box>

            <Box sx={{ display: "flex", justifyContent: "center", gap: 2 }}>
              <Button
                variant="contained"
                href="/pet"
                sx={{ borderRadius: 2, bgcolor: "#9990DA" }}
              >
               ກັບໄປໜ້າສັດລ້ຽງ
              </Button>

            </Box>
          </Box>
        );
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Container>
        <Box sx={{ py: 4 }}>
          <Stepper
            activeStep={activeStep}
            alternativeLabel
            connector={<CustomStepConnector />}
          >
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel StepIconComponent={CustomStepIcon}>
                  {label}
                </StepLabel>
              </Step>
            ))}
          </Stepper>

          <Paper sx={{ mt: 2, borderRadius: 2, overflow: "hidden" }}>
            {getStepContent(activeStep)}

            <Divider />

            <Box
              sx={{ display: "flex", justifyContent: "space-between", p: 2 }}
            >
              {activeStep > 0 && (
                <Button
                  variant="outlined"
                  startIcon={<ArrowBackIcon />}
                  onClick={handleBack}
                  disabled={activeStep === 0}
                  sx={{
                    borderRadius: 2,
                    textTransform: "none",
                    color: "#9990DA",
                  }}
                >
                  ກັບໄປສູ່ໜ້າເກົ່າ
                </Button>
              )}

              {/* Control Continue button visibility */}
              {!isLastStep && (activeStep !== 4 || submissionSuccess) && (
                <Button
                  variant="contained"
                  endIcon={<ArrowForwardIcon />}
                  onClick={handleNext}
                  disabled={activeStep === 0 && !termsAgreed}
                  sx={{
                    borderRadius: 2,
                    textTransform: "none",
                    bgcolor: "#9990DA",
                    "&:hover": {
                      backgroundColor: "#D5D1F0",
                    },
                  }}
                >
                  {activeStep === 0 ? "ເລີ່ມ" : "ສືບຕໍ່"}
                </Button>
              )}
            </Box>
          </Paper>
        </Box>
      </Container>
    </ThemeProvider>
  );
};

export default PetRehomingApp;
