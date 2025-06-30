import React, { useState, useRef } from "react";
import {
  Avatar,
  Box,
  IconButton,
  Tooltip,
  CircularProgress,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";

interface AvatarUploadProps {
  currentImage: string;
  onImageChange: (file: File, previewUrl: string) => void;
  isUploading?: boolean;
  size?: number;
}

const AvatarUpload: React.FC<AvatarUploadProps> = ({
  currentImage,
  onImageChange,
  isUploading = false,
  size = 110,
}) => {
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    const validTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];

    if (!validTypes.includes(file.type)) {
      alert("Please select a valid image file (JPEG, PNG, GIF, WEBP)");
      return;
    }

    // Create a preview URL for the selected image
    const previewUrl = URL.createObjectURL(file);
    setPreviewImage(previewUrl);

    // Pass the file and preview URL to the parent component
    onImageChange(file, previewUrl);
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  // Determine which image to display: preview or current
  const displayImage = previewImage || currentImage;

  return (
    <Box
      sx={{
        position: "relative",
        mb: 4,
        display: "flex",
        justifyContent: "center",
      }}
    >
      <Avatar
        src={displayImage}
        alt="Profile"
        sx={{
          width: size,
          height: size,
          border: "3px solid white",
          boxShadow: "0 3px 10px rgba(0,0,0,0.15)",
        }}
      />

      <Box
        sx={{
          position: "absolute",
          bottom: -5,
          right: "calc(50% - " + (size / 2 - 5) + "px)",
          zIndex: 1,
        }}
      >
        <Tooltip title="Change profile picture">
          <IconButton
            onClick={triggerFileInput}
            disabled={isUploading}
            sx={{
              bgcolor: "#8470C0",
              color: "white",
              boxShadow: "0 2px 5px rgba(0,0,0,0.2)",
              "&:hover": {
                bgcolor: "#7361b0",
              },
              width: 35,
              height: 35,
            }}
          >
            {isUploading ? (
              <CircularProgress size={20} color="inherit" />
            ) : (
              <EditIcon fontSize="small" />
            )}
          </IconButton>
        </Tooltip>
      </Box>

      {/* Hidden file input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileSelect}
        accept="image/jpeg, image/png, image/gif, image/webp"
        style={{ display: "none" }}
      />
    </Box>
  );
};

export default AvatarUpload;
