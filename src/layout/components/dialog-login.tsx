import React, { useState, useRef, useEffect } from "react";
import { useDispatch } from "react-redux";
import { loginSuccess } from "../../store/authenticationSlice";
import axios from "axios";
import {
  Dialog,
  DialogContent,
  Typography,
  TextField,
  Button,
  IconButton,
  Box,
  InputAdornment,
  CircularProgress,
  Alert,
  Paper,
  Fade,
  Divider,
  Tooltip,
} from "@mui/material";
import { 
  Visibility, 
  VisibilityOff, 
  Person,
  Lock,
  Close,
  Login as LoginIcon,
  Security,
} from "@mui/icons-material";
import bgImage from "../../assets/icons/Log In now with Logo.png";
import RegisterDialog from "./dialog-signup";
import { UserModel } from "../../models/user";
import { getUserByToken, login } from "../../services/Login";

interface LoginDialogProps {
  open: boolean;
  onClose: () => void;
  onLogin?: (userData: UserModel) => void;
}

interface LoginFormData {
  username: string;
  password: string;
  rememberMe: boolean;
}

interface FormErrors {
  username: string;
  password: string;
  general: string;
}

const LoginDialog: React.FC<LoginDialogProps> = ({
  open,
  onClose,
  onLogin,
}) => {
  const dispatch = useDispatch();
  const usernameRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);

  // State management
  const [formData, setFormData] = useState<LoginFormData>({
    username: "",
    password: "",
    rememberMe: false,
  });
  
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errors, setErrors] = useState<FormErrors>({
    username: "",
    password: "",
    general: "",
  });
  
  const [registerDialogOpen, setRegisterDialogOpen] = useState<boolean>(false);
  const [loginAttempts, setLoginAttempts] = useState<number>(0);
  const [isBlocked, setIsBlocked] = useState<boolean>(false);

  // Auto-focus username field when dialog opens
  useEffect(() => {
    if (open && usernameRef.current) {
      setTimeout(() => usernameRef.current?.focus(), 100);
    }
  }, [open]);

  // Handle input changes
  const handleInputChange = (field: keyof LoginFormData) => (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const value = field === 'rememberMe' ? event.target.checked : event.target.value;
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear field-specific error when user starts typing
    if (errors[field as keyof FormErrors]) {
      setErrors(prev => ({ ...prev, [field]: "", general: "" }));
    }
  };

  const handleTogglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {
      username: "",
      password: "",
      general: "",
    };
    let isValid = true;

    if (!formData.username.trim()) {
      newErrors.username = "Username is required";
      isValid = false;
    } else if (formData.username.length < 3) {
      newErrors.username = "Username must be at least 3 characters";
      isValid = false;
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
      isValid = false;
    } else if (formData.password.length < 3) {
      newErrors.password = "Password must be at least 6 characters";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleLogin = async () => {
    if (!validateForm()) return;

    if (isBlocked) {
      setErrors(prev => ({ 
        ...prev, 
        general: "Too many failed attempts. Please try again later." 
      }));
      return;
    }

    try {
      setIsLoading(true);
      setErrors({ username: "", password: "", general: "" });

      const loginResponse = await login(formData.username.trim(), formData.password);

      // Store tokens in localStorage
      const auth = {
        accessToken: loginResponse.data.accessToken,
        refreshToken: loginResponse.data.refreshToken,
      };

      localStorage.setItem("auth", JSON.stringify(auth));
      axios.defaults.headers.common["Authorization"] = `Bearer ${auth.accessToken}`;

      // Get user profile data
      const userData = await getUserByToken();

      // Store user data if remember me is checked
      if (formData.rememberMe) {
        localStorage.setItem("user", JSON.stringify(userData));
        localStorage.setItem("rememberMe", "true");
      } else {
        localStorage.removeItem("user");
        localStorage.removeItem("rememberMe");
      }

      // Reset login attempts on successful login
      setLoginAttempts(0);
      setIsBlocked(false);

      // Dispatch to Redux store
      dispatch(loginSuccess(userData));

      if (onLogin) {
        onLogin(userData);
      }

      // Clear form and close dialog
      handleClose();
      
    } catch (err) {
      console.error("Login error:", err);
      
      // Increment login attempts
      const newAttempts = loginAttempts + 1;
      setLoginAttempts(newAttempts);
      
      // Block after 5 failed attempts
      if (newAttempts >= 5) {
        setIsBlocked(true);
        setTimeout(() => {
          setIsBlocked(false);
          setLoginAttempts(0);
        }, 300000); // 5 minutes
      }

      let errorMessage = "Login failed. Please check your credentials.";
      
      if (axios.isAxiosError(err)) {
        if (err.response?.status === 401) {
          errorMessage = "Invalid username or password";
        } else if (err.response?.status === 429) {
          errorMessage = "Too many login attempts. Please try again later.";
        } else {
          errorMessage = err.response?.data?.message || err.message || errorMessage;
        }
      }

      setErrors(prev => ({ ...prev, general: errorMessage }));
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' && !isLoading) {
      handleLogin();
    }
  };

  const handleOpenRegister = () => {
    handleClose();
    setRegisterDialogOpen(true);
  };

  const handleCloseRegister = () => {
    setRegisterDialogOpen(false);
  };

  const handleClose = () => {
    setFormData({ username: "", password: "", rememberMe: false });
    setErrors({ username: "", password: "", general: "" });
    setShowPassword(false);
    onClose();
  };

  // Load remembered credentials
  useEffect(() => {
    const remembered = localStorage.getItem("rememberMe");
    const savedUser = localStorage.getItem("user");
    
    if (remembered === "true" && savedUser) {
      try {
        const userData = JSON.parse(savedUser);
        setFormData(prev => ({ 
          ...prev, 
          username: userData.username || "", 
          rememberMe: true 
        }));
      } catch (e) {
        console.error("Error loading saved user data:", e);
      }
    }
  }, []);

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
          {/* Left side - Form */}
          <Box
            sx={{
              flex: 1.2,
              p: 6,
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
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

            <Fade in={open}>
              <Box>
                {/* Header */}
                <Box sx={{ textAlign: "center", mb: 4 }}>
                  
                  <Typography
                    variant="h4"
                    sx={{
                      fontWeight: "bold",
                      color: "#1f2937",
                      mb: 1,
                    }}
                  >
                    ຍິນດີຕອນຮັບສູ່ Pet-Hub
                  </Typography>
                  
                  <Typography variant="body1" sx={{ color: "#6b7280" }}>
                    ລົງຊື່ເຂົ້າໃຊ້ບັນຊີ Pet-Hub ຂອງທ່ານ
                  </Typography>
                </Box>

                {/* Error Alert */}
                {errors.general && (
                  <Alert 
                    severity="error" 
                    sx={{ 
                      mb: 3, 
                      borderRadius: "12px",
                      "& .MuiAlert-message": { fontSize: "0.875rem" }
                    }}
                  >
                    {errors.general}
                    {loginAttempts > 0 && (
                      <Typography variant="caption" display="block" sx={{ mt: 0.5, opacity: 0.8 }}>
                        Attempts: {loginAttempts}/5
                      </Typography>
                    )}
                  </Alert>
                )}

                {/* Username Field */}
                <TextField
                  fullWidth
                  placeholder="ຊື່ບັນຊີຜູ້ໃຊ້"
                  variant="outlined"
                  value={formData.username}
                  onChange={handleInputChange('username')}
                  onKeyPress={handleKeyPress}
                  disabled={isLoading}
                  error={!!errors.username}
                  helperText={errors.username}
                  inputRef={usernameRef}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Person sx={{ color: "#6b7280" }} />
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    mb: 3,
                    "& .MuiOutlinedInput-root": {
                      borderRadius: "12px",
                      transition: "all 0.2s ease-in-out",
                      "&:hover fieldset": { 
                        borderColor: "#9990DA",
                      },
                      "&.Mui-focused fieldset": { 
                        borderColor: "#9990DA",
                        borderWidth: "2px",
                      },
                    },
                  }}
                />

                {/* Password Field */}
                <TextField
                  fullWidth
                  placeholder="ລະຫັດຜ່ານ"
                  type={showPassword ? "text" : "password"}
                  variant="outlined"
                  value={formData.password}
                  onChange={handleInputChange('password')}
                  onKeyPress={handleKeyPress}
                  disabled={isLoading}
                  error={!!errors.password}
                  helperText={errors.password}
                  inputRef={passwordRef}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Lock sx={{ color: "#6b7280" }} />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        <Tooltip title={showPassword ? "Hide password" : "Show password"}>
                          <IconButton
                            onClick={handleTogglePasswordVisibility}
                            edge="end"
                            disabled={isLoading}
                          >
                            {showPassword ? <VisibilityOff /> : <Visibility />}
                          </IconButton>
                        </Tooltip>
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    mb: 2,
                    "& .MuiOutlinedInput-root": {
                      borderRadius: "12px",
                      transition: "all 0.2s ease-in-out",
                      "&:hover fieldset": { 
                        borderColor: "#9990DA",
                      },
                      "&.Mui-focused fieldset": { 
                        borderColor: "#9990DA",
                        borderWidth: "2px",
                      },
                    },
                  }}
                />

                {/* Login Button */}
                <Button
                  variant="contained"
                  fullWidth
                  onClick={handleLogin}
                  disabled={isLoading || isBlocked}
                  startIcon={
                    isLoading ? (
                      <CircularProgress size={20} color="inherit" />
                    ) : (
                      <LoginIcon />
                    )
                  }
                  sx={{
                    bgcolor: "#9990DA",
                    borderRadius: "12px",
                    py: 1.5,
                    textTransform: "none",
                    fontSize: "1rem",
                    fontWeight: 600,
                    boxShadow: "0 4px 12px rgba(153, 144, 218, 0.4)",
                    "&:hover": {
                      bgcolor: "#8b82d6",
                      boxShadow: "0 6px 16px rgba(153, 144, 218, 0.5)",
                      transform: "translateY(-1px)",
                    },
                    "&:disabled": {
                      bgcolor: "#d1d5db",
                      boxShadow: "none",
                    },
                    transition: "all 0.2s ease-in-out",
                  }}
                >
                  {isLoading ? "Signing in..." : isBlocked ? "Account Locked" : "ເຂົ້າສູ່ລະບົບ"}
                </Button>

                <Divider sx={{ my: 4 }}>
                  <Typography variant="body2" sx={{ color: "#9ca3af", px: 2 }}>
                    or
                  </Typography>
                </Divider>

                {/* Sign Up Link */}
                <Box sx={{ textAlign: "center" }}>
                  <Typography variant="body2" sx={{ color: "#6b7280" }}>
                    ທ່ານມີບັນຊີແລ້ວບໍ່?{" "}
                    <Button
                      variant="text"
                      onClick={handleOpenRegister}
                      disabled={isLoading}
                      sx={{
                        textTransform: "none",
                        color: "#9990DA",
                        fontWeight: 600,
                        p: 0,
                        minWidth: "auto",
                        "&:hover": { 
                          bgcolor: "transparent", 
                          textDecoration: "underline" 
                        },
                      }}
                    >
                      ສ້າງບັນຊີໃໝ່
                    </Button>
                  </Typography>
                </Box>

                {/* Security Note */}
                <Paper
                  elevation={0}
                  sx={{
                    mt: 4,
                    p: 2,
                    bgcolor: "#f8fafc",
                    borderRadius: "12px",
                    border: "1px solid #e2e8f0",
                  }}
                >
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <Security sx={{ fontSize: 16, color: "#64748b" }} />
                    <Typography variant="caption" sx={{ color: "#64748b" }}>
                     ການເຊື່ອມຕໍ່ຂອງທ່ານປອດໄພດ້ວຍການເຂົ້າລະຫັດແບບຕົ້ນທາງຫາປາຍທາງ.
                    </Typography>
                  </Box>
                </Paper>
              </Box>
            </Fade>
          </Box>

          {/* Right side - Image */}
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
        </DialogContent>
      </Dialog>

      {/* Register Dialog */}
      <RegisterDialog 
        open={registerDialogOpen} 
        onClose={handleCloseRegister}
        onLoginClick={() => {
          setRegisterDialogOpen(false);
          // Optionally reopen login dialog
        }}
      />
    </>
  );
};

export default LoginDialog;