import React, { useState, useRef } from "react";
import {
  Dialog,
  DialogContent,
  Typography,
  TextField,
  Button,
  IconButton,
  Box,
  InputAdornment,
  Alert,
  Snackbar,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  FormHelperText,
  Grid,
  CircularProgress,
  Divider,
  Fade,
  Slide,
  Paper,
} from "@mui/material";
import { 
  Visibility, 
  VisibilityOff, 
  Person,
  Email,
  Lock,
  Phone,
  CalendarToday,
  Wc,
  Close,
  CheckCircle,
  ArrowForward,
} from "@mui/icons-material";
import bgImage from "../../assets/icons/Register Now with Logo.png";
import axiosInstance from "../../configs/axios";
import { Gender } from "../../enums/gender";
import Swal from "sweetalert2";
import RegistrationCompleteDialog from "../components/dialogComplete-rsg";

interface RegisterDialogProps {
  open: boolean;
  onClose: () => void;
  onLoginClick: () => void;
}

interface FormData {
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  password: string;
  gender: Gender;
  dateOfBirth: string;
  telephone: string;
}

interface FormErrors {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  gender: string;
  dateOfBirth: string;
  telephone: string;
  username: string;
}

const RegisterDialog: React.FC<RegisterDialogProps> = ({
  open,
  onClose,
  onLoginClick,
}) => {
  // Form refs
  const firstNameRef = useRef<HTMLInputElement>(null);
  const lastNameRef = useRef<HTMLInputElement>(null);
  const emailRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);
  const dateOfBirthRef = useRef<HTMLInputElement>(null);
  const telephoneRef = useRef<HTMLInputElement>(null);
  const userNameRef = useRef<HTMLInputElement>(null);

  // State management
  const [formData, setFormData] = useState<FormData>({
    firstName: "",
    lastName: "",
    username: "",
    email: "",
    password: "",
    gender: Gender.OTHER,
    dateOfBirth: "",
    telephone: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [completionDialogOpen, setCompletionDialogOpen] = useState(false);
  const [registeredUserName, setRegisteredUserName] = useState("");
  const [currentStep, setCurrentStep] = useState(1);
  const [formErrors, setFormErrors] = useState<FormErrors>({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    gender: "",
    dateOfBirth: "",
    telephone: "",
    username: "",
  });

  const handleTogglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const validateStep1 = (): boolean => {
    const errors: Partial<FormErrors> = {};
    let isValid = true;

    const firstName = firstNameRef.current?.value.trim() || "";
    const lastName = lastNameRef.current?.value.trim() || "";
    const username = userNameRef.current?.value.trim() || "";

    if (!firstName) {
      errors.firstName = "First name is required";
      isValid = false;
    } else if (firstName.length < 2) {
      errors.firstName = "First name must be at least 2 characters";
      isValid = false;
    }

    if (!lastName) {
      errors.lastName = "Last name is required";
      isValid = false;
    } else if (lastName.length < 2) {
      errors.lastName = "Last name must be at least 2 characters";
      isValid = false;
    }

    if (!username) {
      errors.username = "Username is required";
      isValid = false;
    } else if (username.length < 3) {
      errors.username = "Username must be at least 3 characters";
      isValid = false;
    } else if (!/^[a-zA-Z0-9_]+$/.test(username)) {
      errors.username = "Username can only contain letters, numbers, and underscores";
      isValid = false;
    }

    setFormErrors(prev => ({ ...prev, ...errors }));
    return isValid;
  };

  const validateStep2 = (): boolean => {
    const errors: Partial<FormErrors> = {};
    let isValid = true;

    const email = emailRef.current?.value.trim() || "";
    const password = passwordRef.current?.value || "";

    if (!email) {
      errors.email = "Email is required";
      isValid = false;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errors.email = "Please enter a valid email address";
      isValid = false;
    }

    if (!password) {
      errors.password = "Password is required";
      isValid = false;
    } else if (password.length < 8) {
      errors.password = "Password must be at least 8 characters";
      isValid = false;
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password)) {
      errors.password = "Password must contain uppercase, lowercase, and number";
      isValid = false;
    }

    setFormErrors(prev => ({ ...prev, ...errors }));
    return isValid;
  };

  const validateStep3 = (): boolean => {
    const errors: Partial<FormErrors> = {};
    let isValid = true;

    const dateOfBirth = dateOfBirthRef.current?.value || "";
    const telephone = telephoneRef.current?.value.trim() || "";

    if (!dateOfBirth) {
      errors.dateOfBirth = "Date of birth is required";
      isValid = false;
    } else {
      const birthDate = new Date(dateOfBirth);
      const today = new Date();
      const age = today.getFullYear() - birthDate.getFullYear();
      if (age < 13) {
        errors.dateOfBirth = "You must be at least 13 years old";
        isValid = false;
      }
    }

    if (!formData.gender) {
      errors.gender = "Please select your gender";
      isValid = false;
    }

    if (telephone && !/^\+?[\d\s\-()]+$/.test(telephone)) {
      errors.telephone = "Please enter a valid phone number";
      isValid = false;
    }

    setFormErrors(prev => ({ ...prev, ...errors }));
    return isValid;
  };

  const handleNextStep = () => {
    let isValid = false;
    
    if (currentStep === 1) {
      isValid = validateStep1();
    } else if (currentStep === 2) {
      isValid = validateStep2();
    }

    if (isValid && currentStep < 3) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleRegister = async () => {
    if (!validateStep3()) return;

    const formValues = {
      username: userNameRef.current?.value || "",
      firstName: firstNameRef.current?.value || "",
      lastName: lastNameRef.current?.value || "",
      password: passwordRef.current?.value || "",
      email: emailRef.current?.value || "",
      tel: telephoneRef.current?.value || "",
      gender: formData.gender,
      DOB: dateOfBirthRef.current?.value || "",
    };

    setRegisteredUserName(formValues.username);

    const result = await Swal.fire({
      title: "Create Your Account?",
      text: "We're ready to set up your Pet-Hub account!",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Create Account",
      cancelButtonText: "Review Details",
      confirmButtonColor: "#9990DA",
      cancelButtonColor: "#6b7280",
      customClass: {
        popup: "rounded-lg",
      },
    });

    if (result.isConfirmed) {
      try {
        setIsLoading(true);
        onClose();

        const formDataToSend = new FormData();
        Object.entries(formValues).forEach(([key, value]) => {
          formDataToSend.append(key, value);
        });
        formDataToSend.append("city", "NULL");
        formDataToSend.append("village", "Example Village");
        formDataToSend.append("avatar", "null");

        await axiosInstance.post("/user", formDataToSend, {
          headers: { "Content-Type": "multipart/form-data" },
        });

        setCompletionDialogOpen(true);
        clearForm();
      } catch (err) {
        Swal.fire({
          title: "Registration Failed",
          text: err instanceof Error ? err.message : "Something went wrong. Please try again.",
          icon: "error",
          confirmButtonText: "Try Again",
          confirmButtonColor: "#ef4444",
        });
        setError(err instanceof Error ? err.message : "Registration failed");
      } finally {
        setIsLoading(false);
      }
    }
  };

  const clearForm = () => {
    if (userNameRef.current) userNameRef.current.value = "";
    if (firstNameRef.current) firstNameRef.current.value = "";
    if (lastNameRef.current) lastNameRef.current.value = "";
    if (passwordRef.current) passwordRef.current.value = "";
    if (emailRef.current) emailRef.current.value = "";
    if (telephoneRef.current) telephoneRef.current.value = "";
    if (dateOfBirthRef.current) dateOfBirthRef.current.value = "";
    setFormData(prev => ({ ...prev, gender: Gender.OTHER }));
    setCurrentStep(1);
  };

  const handleClose = () => {
    clearForm();
    onClose();
  };

  const renderStepIndicator = () => (
    <Box sx={{ display: "flex", justifyContent: "center", mb: 3 }}>
      {[1, 2, 3].map((step) => (
        <Box key={step} sx={{ display: "flex", alignItems: "center" }}>
          <Box
            sx={{
              width: 32,
              height: 32,
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              bgcolor: currentStep >= step ? "#9990DA" : "#e5e7eb",
              color: currentStep >= step ? "white" : "#6b7280",
              fontWeight: "bold",
              fontSize: "14px",
            }}
          >
            {currentStep > step ? <CheckCircle sx={{ fontSize: 18 }} /> : step}
          </Box>
          {step < 3 && (
            <Box
              sx={{
                width: 40,
                height: 2,
                bgcolor: currentStep > step ? "#9990DA" : "#e5e7eb",
                mx: 1,
              }}
            />
          )}
        </Box>
      ))}
    </Box>
  );

  const renderStep1 = () => (
    <Fade in={currentStep === 1}>
      <Box>
        <Typography variant="h6" sx={{ mb: 2, color: "#374151", fontWeight: 600 }}>
         ຂໍ້ມູນສ່ວນຕົວ
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              placeholder="ຊື່ແທ້ຂອງທ່ານ"
              variant="outlined"
              inputRef={firstNameRef}
              error={!!formErrors.firstName}
              helperText={formErrors.firstName}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Person sx={{ color: "#9990DA" }} />
                  </InputAdornment>
                ),
              }}
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: "12px",
                  "&:hover fieldset": { borderColor: "#9990DA" },
                  "&.Mui-focused fieldset": { borderColor: "#9990DA" },
                },
              }}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              placeholder="ນາມສະກຸນຂອງທ່ານ"
              variant="outlined"
              inputRef={lastNameRef}
              error={!!formErrors.lastName}
              helperText={formErrors.lastName}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Person sx={{ color: "#9990DA" }} />
                  </InputAdornment>
                ),
              }}
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: "12px",
                  "&:hover fieldset": { borderColor: "#9990DA" },
                  "&.Mui-focused fieldset": { borderColor: "#9990DA" },
                },
              }}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              placeholder="ຊື່ບັນຊີ"
              variant="outlined"
              inputRef={userNameRef}
              error={!!formErrors.username}
              helperText={formErrors.username}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Person sx={{ color: "#9990DA" }} />
                  </InputAdornment>
                ),
              }}
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: "12px",
                  "&:hover fieldset": { borderColor: "#9990DA" },
                  "&.Mui-focused fieldset": { borderColor: "#9990DA" },
                },
              }}
            />
          </Grid>
        </Grid>
      </Box>
    </Fade>
  );

  const renderStep2 = () => (
    <Fade in={currentStep === 2}>
      <Box>
        <Typography variant="h6" sx={{ mb: 2, color: "#374151", fontWeight: 600 }}>
         ຄວາມປອດໄພ
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <TextField
              fullWidth
              placeholder="ອີເມລ"
              type="email"
              variant="outlined"
              inputRef={emailRef}
              error={!!formErrors.email}
              helperText={formErrors.email}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Email sx={{ color: "#9990DA" }} />
                  </InputAdornment>
                ),
              }}
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: "12px",
                  "&:hover fieldset": { borderColor: "#9990DA" },
                  "&.Mui-focused fieldset": { borderColor: "#9990DA" },
                },
              }}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              placeholder="ລະຫັດຜ່ານ"
              type={showPassword ? "text" : "password"}
              variant="outlined"
              inputRef={passwordRef}
              error={!!formErrors.password}
              helperText={formErrors.password}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Lock sx={{ color: "#9990DA" }} />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={handleTogglePasswordVisibility} edge="end">
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: "12px",
                  "&:hover fieldset": { borderColor: "#9990DA" },
                  "&.Mui-focused fieldset": { borderColor: "#9990DA" },
                },
              }}
            />
          </Grid>
        </Grid>
      </Box>
    </Fade>
  );

  const renderStep3 = () => (
    <Fade in={currentStep === 3}>
      <Box>
        <Typography variant="h6" sx={{ mb: 2, color: "#374151", fontWeight: 600 }}>
          ລາຍລະອຽດເພີ່ມເຕີມ
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <FormControl
              fullWidth
              error={!!formErrors.gender}
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: "12px",
                  "&:hover fieldset": { borderColor: "#9990DA" },
                  "&.Mui-focused fieldset": { borderColor: "#9990DA" },
                },
              }}
            >
              <InputLabel>ເພດ</InputLabel>
              <Select
                value={formData.gender}
                onChange={(e) => setFormData(prev => ({ ...prev, gender: e.target.value as Gender }))}
                label="Gender"
                startAdornment={
                  <InputAdornment position="start">
                    <Wc sx={{ color: "#9990DA" }} />
                  </InputAdornment>
                }
              >
                <MenuItem value={Gender.MALE}>ຜູ້ຊາຍ</MenuItem>
                <MenuItem value={Gender.FEMALE}>ຜູ້ຍິງ</MenuItem>
              </Select>
              {formErrors.gender && <FormHelperText>{formErrors.gender}</FormHelperText>}
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              type="date"
              label="ວັນເດືອນປີເກີດ"
              variant="outlined"
              inputRef={dateOfBirthRef}
              error={!!formErrors.dateOfBirth}
              helperText={formErrors.dateOfBirth}
              InputLabelProps={{ shrink: true }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <CalendarToday sx={{ color: "#9990DA" }} />
                  </InputAdornment>
                ),
              }}
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: "12px",
                  "&:hover fieldset": { borderColor: "#9990DA" },
                  "&.Mui-focused fieldset": { borderColor: "#9990DA" },
                },
              }}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              placeholder="ເບີໂທລະສັບ"
              variant="outlined"
              inputRef={telephoneRef}
              error={!!formErrors.telephone}
              helperText={formErrors.telephone}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Phone sx={{ color: "#9990DA" }} />
                  </InputAdornment>
                ),
              }}
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: "12px",
                  "&:hover fieldset": { borderColor: "#9990DA" },
                  "&.Mui-focused fieldset": { borderColor: "#9990DA" },
                },
              }}
            />
          </Grid>
        </Grid>
      </Box>
    </Fade>
  );

  return (
    <>
      <Dialog
        open={open}
        onClose={handleClose}
        maxWidth="md"
        PaperProps={{
          sx: {
            borderRadius: 3,
            width: "900px",
            maxHeight: "90vh",
            overflow: "hidden",
            boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
          },
        }}
      >
        <DialogContent sx={{ p: 0, display: "flex", minHeight: "600px" }}>
          {/* Left side - Image */}
          <Box
            sx={{
              flex: 1,
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              position: "relative",
              backgroundImage: `url(${bgImage})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
              "&::before": {
                content: '""',
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
              },
            }}
          >
          </Box>

          {/* Right side - Form */}
          <Box
            sx={{
              flex: 1.2,
              p: 4,
              display: "flex",
              flexDirection: "column",
              position: "relative",
            }}
          >
            <IconButton
              onClick={handleClose}
              sx={{
                position: "absolute",
                right: 16,
                top: 16,
                bgcolor: "#f3f4f6",
                "&:hover": { bgcolor: "#e5e7eb" },
              }}
            >
              <Close />
            </IconButton>

            <Typography
              variant="h4"
              sx={{
                fontWeight: "bold",
                color: "#1f2937",
                mb: 1,
                mt: 2,
              }}
            >
              ສ້າງບັນຊີໃໝ່
            </Typography>
            
            <Typography variant="body2" sx={{ color: "#6b7280", mb: 4 }}>
              ຂັ້ນຕອນ {currentStep} ຂອງ 3 - ເລີ່ມສ້າງບັນຊີໃໝ່
            </Typography>

            {renderStepIndicator()}

            <Box sx={{ flex: 1, minHeight: "300px" }}>
              {currentStep === 1 && renderStep1()}
              {currentStep === 2 && renderStep2()}
              {currentStep === 3 && renderStep3()}
            </Box>

            <Divider sx={{ my: 3 }} />

            {/* Navigation buttons */}
            <Box sx={{ display: "flex", justifyContent: "space-between", gap: 2 }}>
              <Button
                variant="outlined"
                onClick={currentStep === 1 ? handleClose : handlePrevStep}
                sx={{
                  borderRadius: "12px",
                  textTransform: "none",
                  borderColor: "#d1d5db",
                  color: "#6b7280",
                  "&:hover": {
                    borderColor: "#9ca3af",
                    bgcolor: "#f9fafb",
                  },
                }}
              >
                {currentStep === 1 ? "ຍົກເລິກ" : "ກັບຄືນ"}
              </Button>

              <Button
                variant="contained"
                onClick={currentStep === 3 ? handleRegister : handleNextStep}
                disabled={isLoading}
                endIcon={
                  isLoading ? (
                    <CircularProgress size={20} color="inherit" />
                  ) : currentStep === 3 ? (
                    <CheckCircle />
                  ) : (
                    <ArrowForward />
                  )
                }
                sx={{
                  bgcolor: "#9990DA",
                  borderRadius: "12px",
                  px: 4,
                  py: 1.5,
                  textTransform: "none",
                  boxShadow: "0 4px 12px rgba(153, 144, 218, 0.4)",
                  "&:hover": {
                    bgcolor: "#8b82d6",
                    boxShadow: "0 6px 16px rgba(153, 144, 218, 0.5)",
                  },
                }}
              >
                {currentStep === 3 ? "ສ້າງບັນຊີ" : "ຕໍ່ໄປ"}
              </Button>
            </Box>  
          </Box>
        </DialogContent>
      </Dialog>

      {/* Registration Complete Dialog */}
      <RegistrationCompleteDialog
        open={completionDialogOpen}
        onClose={() => setCompletionDialogOpen(false)}
        onLoginClick={onLoginClick}
        userName={registeredUserName}
      />

      {/* Error notification */}
      <Snackbar
        open={!!error}
        autoHideDuration={6000}
        onClose={() => setError(null)}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert 
          severity="error" 
          sx={{ 
            width: "100%",
            borderRadius: "12px",
          }}
        >
          {error}
        </Alert>
      </Snackbar>
    </>
  );
};

export default RegisterDialog;