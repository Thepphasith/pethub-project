import { useState, useEffect } from "react";
import { IconButton, Tooltip, Snackbar, Alert, CircularProgress } from "@mui/material";
import BookmarkIcon from "@mui/icons-material/Bookmark";
import BookmarkBorderIcon from "@mui/icons-material/BookmarkBorder";
import axiosInstance from "../../../configs/axios"; // Adjust the import path as needed

interface SaveButtonProps {
  itemId: string;
  itemType: "pet" | "blog"; // Type of item being saved
  initialSaved?: boolean;   // Whether the item is already saved
  itemName?: string;        // Name of the pet or title of the blog
  variant?: "icon-only" | "with-text"; // Visual style of the button
  size?: "small" | "medium" | "large";
  onSaveChange?: (itemId: string, newSavedState: boolean) => void;
}

/**
 * SaveButton component for saving/bookmarking posts to favorites
 * @param {SaveButtonProps} props - Component props
 * @returns {JSX.Element} - SaveButton component
 */
const SaveButton: React.FC<SaveButtonProps> = ({
  itemId,
  itemType,
  itemName,
  initialSaved = false,
  size = "medium",
  onSaveChange
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isSaved, setIsSaved] = useState(initialSaved);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState<"success" | "error" | "info" | "warning">("success");

  // Check if this item is already saved when the component mounts or itemId changes
  useEffect(() => {
    const checkIfSaved = async () => {
      if (!itemId) return;
      
      try {
        const response = await axiosInstance.get("/favorite");
        
        if (response.data && response.data.data && Array.isArray(response.data.data)) {
          // Check all favorite documents
          let found = false;
          
          for (const favorite of response.data.data) {
            if (favorite.items && Array.isArray(favorite.items)) {
              // Check if this item is in any of the favorite documents
              found = favorite.items.some((item: any) => item.id === itemId);
              if (found) break;
            }
          }
          
          setIsSaved(found);
          
          // If initialSaved was provided but doesn't match what we found, update it
          if (initialSaved !== found && onSaveChange) {
            onSaveChange(itemId, found);
          }
        }
      } catch (error) {
        console.error("Error checking if item is saved:", error);
      }
    };
    
    checkIfSaved(); 
  }, [itemId, initialSaved, onSaveChange]);

  // Save or unsave an item
  const toggleSave = async () => {
    if (!itemId) return false;
    
    try {
      setIsLoading(true);
      
      if (isSaved) {
        // Remove from favorites
        const response = await axiosInstance.delete("/favorite/delete", {
          data: { itemId }
        });
        
        if (response.data.success || response.status === 200) {
          setIsSaved(false);
          setSnackbarMessage(`${itemName || (itemType === "pet" ? "Pet" : "Blog post")} removed from favorites`);
          setSnackbarSeverity("success");
          
          // Call parent callback if provided
          if (onSaveChange) {
            onSaveChange(itemId, false);
          }
          
          return true;
        } else {
          throw new Error("Failed to remove from favorites");
        }
      } else {
        // Add to favorites - FIXED: Added success message for blog saves
        const response = await axiosInstance.post("/favorite", {
          itemId,
        });
        
        if (response.data.success || response.status === 200 || response.status === 201) {
          setIsSaved(true);
          setSnackbarMessage(`${itemName || (itemType === "pet" ? "Pet" : "Blog post")} added to favorites`);
          setSnackbarSeverity("success");
          
          // Call parent callback if provided
          if (onSaveChange) {
            onSaveChange(itemId, true);
          }
          
          return true;
        } else {
          throw new Error("Failed to add to favorites");
        }
      }
    } catch (error) {
      console.error(`Error ${isSaved ? "removing from" : "adding to"} favorites:`, error);
      setSnackbarMessage(`Failed to ${isSaved ? "remove from" : "add to"} favorites. Please try again.`);
      setSnackbarSeverity("error");
      return false;
    } finally {
      setIsLoading(false);
      setSnackbarOpen(true);
    }
  };

  const handleSave = async (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent event bubbling to parent elements
    e.preventDefault();  // Prevent default behavior

    if (isLoading || !itemId) return;
    
    await toggleSave();
  };

  const handleCloseSnackbar = () => {
    setSnackbarOpen(false);
  };

  const getIconSize = () => {
    switch (size) {
      case "small": return { fontSize: 18 };
      case "large": return { fontSize: 28 };
      default: return { fontSize: 24 };
    }
  };

  const getButtonSize = () => {
    switch (size) {
      case "small": return "small";
      case "large": return "large";
      default: return "medium";
    }
  };

  const iconStyles = {
    ...getIconSize(),
    color: isSaved ? "#9990DA" : "inherit",
  };

  return (
    <>
      <Tooltip title={isSaved ? "Remove from favorites" : "Save to favorites"}>
        <IconButton
          onClick={handleSave}
          disabled={isLoading}
          size={getButtonSize()}
          sx={{
            color: isSaved ? "#9990DA" : "rgba(0, 0, 0, 0.54)",
            "&:hover": {
              backgroundColor: "rgba(153, 144, 218, 0.08)",
            },
          }}
          aria-label={isSaved ? "Remove from favorites" : "Save to favorites"}
        >
          {isLoading ? (
            <CircularProgress size={getIconSize().fontSize} sx={{ color: "#9990DA" }} />
          ) : (
            isSaved ? <BookmarkIcon sx={iconStyles} /> : <BookmarkBorderIcon sx={iconStyles} />
          )}
        </IconButton>
      </Tooltip>

      {/* Feedback Snackbar */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={4000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbarSeverity}
          sx={{ width: "100%", borderRadius: 2 }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </>
  );
};

export default SaveButton;