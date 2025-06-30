import React, { useState, useEffect, useRef } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  TextField,
  Grid,
  Button,
  Box,
  IconButton,
  InputAdornment,
  Autocomplete,
} from "@mui/material";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import EmailIcon from "@mui/icons-material/Email";
import LockIcon from "@mui/icons-material/Lock";
import PersonIcon from "@mui/icons-material/Person";
import PhoneIcon from "@mui/icons-material/Phone";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import AvatarUpload from "./avatarUpload";
import axiosInstance from "../../../configs/axios";
import Swal from "sweetalert2";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import { VientianeCityOptions } from "../../../enums/city";

interface EditProfileDialogProps {
  open: boolean;
  onClose: () => void;
  userData: {
    id: string;
    firstName: string;
    lastName: string;
    username: string;
    email: string;
    phoneNumber: string;
    profileImage: string;
    village: string;
    city: string;
    DOB: string;
  };
}

const EditProfileDialog: React.FC<EditProfileDialogProps> = ({
  open,
  onClose,
  userData,
}) => {
  const [showNewPassword, setShowNewPassword] = useState<boolean>(false);
  const [showConfirmPassword, setShowConfirmPassword] =
    useState<boolean>(false);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  console.log("Avatar", avatarFile);
  const [profileImagePreview, setProfileImagePreview] = useState<string>(
    userData.profileImage
  );

  const [selectedCity, setSelectedCity] = useState<string | null>(
    userData.city || null
  );
  // Create refs for all form fields
  const villageRef = useRef<HTMLInputElement>(null);
  const usernameRef = useRef<HTMLInputElement>(null);
  const emailRef = useRef<HTMLInputElement>(null);
  const newPasswordRef = useRef<HTMLInputElement>(null);
  const confirmPasswordRef = useRef<HTMLInputElement>(null);
  const phoneNumberRef = useRef<HTMLInputElement>(null);
  const dateOfBirthRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setAvatarFile(null);
      setProfileImagePreview(userData.profileImage);
      setSelectedCity(userData.city || null);

      // Reset form fields with user data when dialog opens
      setTimeout(() => {
        if (villageRef.current) {
          villageRef.current.value = userData.village;
        }
        if (usernameRef.current) {
          usernameRef.current.value = userData.username;
        }
        if (emailRef.current) {
          emailRef.current.value = userData.email;
        }
        if (phoneNumberRef.current) {
          phoneNumberRef.current.value = userData.phoneNumber;
        }
        if (newPasswordRef.current) {
          newPasswordRef.current.value = "";
        }
        if (confirmPasswordRef.current) {
          confirmPasswordRef.current.value = "";
        }
        if (dateOfBirthRef.current) {
          const dateOnly = userData?.DOB ? userData.DOB.substring(0, 10) : "";
          dateOfBirthRef.current.value = dateOnly;
        }
      }, 100);
    }
  }, [open, userData]);

  const handlePasswordVisibility = (field: "new" | "confirm") => {
    if (field === "new") {
      setShowNewPassword(!showNewPassword);
    } else {
      setShowConfirmPassword(!showConfirmPassword);
    }
  };

  const handleAvatarChange = (file: File, previewUrl: string) => {
    setAvatarFile(file);
    setProfileImagePreview(previewUrl);
  };

  // Form validation using refs
  const validateForm = (): boolean => {
    if (!usernameRef.current?.value.trim()) {
      Swal.fire({
        title: "ຂໍ້ຜິດພາດໃນການກວດສອບ",
        text: "ຊື່ຜູ້ໃຊ້ແມ່ນຈຳເປັນ",
        icon: "error",
        confirmButtonColor: "#8470C0",
      });
      usernameRef.current?.focus();
      return false;
    }

    if (!emailRef.current?.value.trim()) {
      Swal.fire({
        title: "ຂໍ້ຜິດພາດໃນການກວດສອບ",
        text: "ອີເມລ໌ແມ່ນຈຳເປັນ",
        icon: "error",
        confirmButtonColor: "#8470C0",
      });
      emailRef.current?.focus();
      return false;
    } else if (!/\S+@\S+\.\S+/.test(emailRef.current.value)) {
      Swal.fire({
        title: "ຂໍ້ຜິດພາດໃນການກວດສອບ",
        text: "ອີເມລ໌ບໍ່ຖືກຕ້ອງ",
        icon: "error",
        confirmButtonColor: "#8470C0",
      });
      emailRef.current?.focus();
      return false;
    }

    // If new password is provided, confirm password should match
    if (
      newPasswordRef.current?.value &&
      newPasswordRef.current.value !== confirmPasswordRef.current?.value
    ) {
      Swal.fire({
        title: "ຂໍ້ຜິດພາດໃນການກວດສອບ",
        text: "ລະຫັດຜ່ານບໍ່ກົງກັນ",
        icon: "error",
        confirmButtonColor: "#8470C0",
      });
      confirmPasswordRef.current?.focus();
      return false;
    }

    return true;
  };

  const handleSaveChanges = async () => {
    onClose();
    // First validate the form
    if (!validateForm()) return;

    // Ask for confirmation before submitting
    const result = await Swal.fire({
      title: "ອັບເດດໂປຣໄຟລ໌",
      text: "ທ່ານແນ່ໃຈບໍ່ວ່າຕ້ອງການອັບເດດໂປຣໄຟລ໌ຂອງທ່ານ?",
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#8470C0",
      cancelButtonColor: "#d33",
      confirmButtonText: "ແມ່ນແລ້ວ, ອັບເດດເລີຍ!",
    });

    if (!result.isConfirmed) return;

    setIsUploading(true);

    try {
      // Create FormData object for the API request
      const formDataObj = new FormData();

      // Add text fields to FormData
      if (selectedCity) {
        formDataObj.append("city", selectedCity);
      }
      formDataObj.append("village", villageRef.current?.value || "");

      if (usernameRef) {
        formDataObj.append("username", usernameRef.current?.value || "");
      }
      formDataObj.append("email", emailRef.current?.value || "");

      if (phoneNumberRef) {
        formDataObj.append("tel", phoneNumberRef.current?.value || "");
      }

      // Add avatar file if changed
      if (avatarFile) {
        formDataObj.append("avatar", avatarFile);
      }

      // Send request to update user profile
      const response = await axiosInstance.patch(
        `/user/${userData?.id}`,
        formDataObj,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      // Handle the response
      if (response.status >= 200 && response.status < 300) {
        Swal.fire({
          title: "ສຳເລັດ!",
          text: "ໂປຣໄຟລ໌ຂອງທ່ານໄດ້ຖືກອັບເດດສຳເລັດແລ້ວ",
          icon: "success",
          confirmButtonColor: "#8470C0",
        });
      } else {
        throw new Error("ບໍ່ສາມາດອັບເດດໂປຣໄຟລ໌ໄດ້");
      }
    } catch (error) {
      console.error("ຂໍ້ຜິດພາດໃນການອັບເດດໂປຣໄຟລ໌:", error);
      Swal.fire({
        title: "ເກີດຂໍ້ຜິດພາດ!",
        text: "ເກີດຂໍ້ຜິດພາດຂະນະອັບເດດໂປຣໄຟລ໌ຂອງທ່ານ",
        icon: "error",
        confirmButtonColor: "#8470C0",
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          borderRadius: 4,
          width: "700px",
          maxWidth: "95vw",
          p: 3,
          overflow: "visible",
          border: "1px solid #e0e0e0",
          boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
        },
      }}
    >
      <DialogTitle
        sx={{
          textAlign: "center",
          pb: 0,
          fontSize: "1.5rem",
          fontWeight: 600,
          px: 0,
          pt: 0,
          mb: 3,
        }}
      >
        ແກ້ໄຂໂປຣໄຟລ໌
      </DialogTitle>

      <DialogContent sx={{ px: 0, pb: 4 }}>
        <Box
          sx={{
            position: "relative",
            mb: 4,
            display: "flex",
            justifyContent: "center",
          }}
        >
          <AvatarUpload
            currentImage={userData?.profileImage ?? profileImagePreview}
            onImageChange={handleAvatarChange}
            isUploading={isUploading}
          />
        </Box>

        <Grid container spacing={3}>
          {/* Username */}
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              placeholder="ຊື່ຜູ້ໃຊ້"
              label="ຊື່ຜູ້ໃຊ້"
              variant="outlined"
              name="username"
              inputRef={usernameRef}
              defaultValue={userData.username}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <PersonIcon sx={{ color: "text.secondary" }} />
                  </InputAdornment>
                ),
              }}
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: "8px",
                  bgcolor: "#f9f9f9",
                },
              }}
            />
          </Grid>

          {/* Village */}
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              placeholder="ນາມສະກຸນ"
              variant="outlined"
              name="Village"
              label=""
              inputRef={villageRef}
              defaultValue={userData.lastName}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <PersonIcon sx={{ color: "text.secondary" }} />
                  </InputAdornment>
                ),
              }}
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: "8px",
                  bgcolor: "#f9f9f9",
                },
              }}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <Autocomplete
              options={VientianeCityOptions}
              value={selectedCity}
              onChange={(event, newValue) => {
                setSelectedCity(newValue);
              }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  fullWidth
                  label="ເມືອງ"
                  placeholder="ເລືອກເມືອງ"
                  variant="outlined"
                  InputProps={{
                    ...params.InputProps,
                    startAdornment: (
                      <>
                        <InputAdornment position="start">
                          <LocationOnIcon sx={{ color: "text.secondary" }} />
                        </InputAdornment>
                        {params.InputProps.startAdornment}
                      </>
                    ),
                  }}
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      borderRadius: "8px",
                      bgcolor: "#f9f9f9",
                    },
                  }}
                />
              )}
            />
          </Grid>

          {/* New Password */}
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="ລະຫັດຜ່ານໃໝ່"
              placeholder="ລະຫັດຜ່ານໃໝ່"
              variant="outlined"
              name="newPassword"
              inputRef={newPasswordRef}
              type={showNewPassword ? "text" : "password"}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <LockIcon sx={{ color: "text.secondary" }} />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => handlePasswordVisibility("new")}
                      edge="end"
                      sx={{ color: "text.secondary" }}
                    >
                      {showNewPassword ? (
                        <VisibilityOffIcon />
                      ) : (
                        <VisibilityIcon />
                      )}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: "8px",
                  bgcolor: "#f9f9f9",
                },
              }}
            />
          </Grid>

          {/* Email */}
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="ອີເມລ໌"
              placeholder="ອີເມລ໌"
              variant="outlined"
              name="email"
              type="email"
              inputRef={emailRef}
              defaultValue={userData.email}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <EmailIcon sx={{ color: "text.secondary" }} />
                  </InputAdornment>
                ),
              }}
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: "8px",
                  bgcolor: "#f9f9f9",
                },
              }}
            />
          </Grid>

          {/* Confirm Password */}
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              placeholder="ຢືນຢັນລະຫັດຜ່ານໃໝ່"
              variant="outlined"
              name="confirmPassword"
              label="ຢືນຢັນລະຫັດຜ່ານ"
              inputRef={confirmPasswordRef}
              type={showConfirmPassword ? "text" : "password"}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <LockIcon sx={{ color: "text.secondary" }} />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => handlePasswordVisibility("confirm")}
                      edge="end"
                      sx={{ color: "text.secondary" }}
                    >
                      {showConfirmPassword ? (
                        <VisibilityOffIcon />
                      ) : (
                        <VisibilityIcon />
                      )}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: "8px",
                  bgcolor: "#f9f9f9",
                },
              }}
            />
          </Grid>

          {/* Select a day */}
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              placeholder="ເລືອກວັນທີ"
              variant="outlined"
              name="dateOfBirth"
              label="ວັນເດືອນປີເກີດ"
              type="date"
              inputRef={dateOfBirthRef}
              defaultValue={userData?.DOB?.substring(0, 10)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <CalendarTodayIcon sx={{ color: "text.secondary" }} />
                  </InputAdornment>
                ),
              }}
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: "8px",
                  bgcolor: "#f9f9f9",
                },
                "& input::-webkit-calendar-picker-indicator": {
                  opacity: 0,
                  position: "absolute",
                  right: 0,
                  cursor: "pointer",
                  height: "100%",
                  width: "100%",
                },
              }}
            />
          </Grid>

          {/* Phone Number */}
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="ເບີໂທລະສັບ"
              placeholder="ເບີໂທລະສັບ"
              variant="outlined"
              name="phoneNumber"
              inputRef={phoneNumberRef}
              defaultValue={userData.phoneNumber}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <PhoneIcon sx={{ color: "text.secondary" }} />
                  </InputAdornment>
                ),
              }}
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: "8px",
                  bgcolor: "#f9f9f9",
                },
              }}
            />
          </Grid>
        </Grid>


        {/* Button */}
        <Box sx={{ display: "flex", justifyContent: "center" }}>
          <Button
            variant="contained"
            onClick={handleSaveChanges}
            sx={{
              bgcolor: "#8470C0",
              borderRadius: "30px",
              px: 4,
              py: 1.5,
              mt: 3,
              fontSize: "1rem",
              textTransform: "none",
              boxShadow: "0 4px 10px rgba(132, 112, 192, 0.3)",
              "&:hover": {
                bgcolor: "#7361b0",
              },
            }}
          >
            ຕົກລົງອັບເດດ
          </Button>
        </Box>
      </DialogContent>
    </Dialog>
  );
};

export default EditProfileDialog;