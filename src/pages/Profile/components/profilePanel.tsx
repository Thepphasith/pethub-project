import React, { useState } from "react";
import {
  Avatar,
  Box,
  Button,
  Divider,
  Grid,
  Paper,
  Typography,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Menu,
} from "@mui/material";
import { Edit, Email, LocationOn, Phone, Close } from "@mui/icons-material";
import EditPostDialog from "../../../layout/components/dialog-edit";
import Post from "../../Profile/components/myblog"; // Import the new BlogPost component
import MyBlog from "../../Profile/components/myblog";

// Post and Comment interfaces
interface Post {
  id: string;
  title: string;
  body: string;
  images?: string[];
  timestamp: string;
  votes: number;
  userVote: "up" | "down" | null;
  saved: boolean;
  comments: Comment[];
  user: {
    id: string;
    firstName: string;
    lastName: string;
    avatar: string;
    username: string;
  };
}

interface Comment {
  id: number;
  username: string;
  content: string;
  timestamp: string;
  votes: number;
  userVote: "up" | "down" | null;
  replies: Comment[];
}

interface ProfileContentProps {
  openEditDialog: () => void;
  profileData: {
    name: string;
    location: string;
    age: string;
    bio: string[];
    email: string;
    phone: string;
    instagram: string;
    profileImage: string;
    city: string;
    village: string;
    DOB: string;
    username: string;
  };
  userPosts?: Post[];
}

const ProfileContent: React.FC<ProfileContentProps> = ({
  openEditDialog,
  profileData,
}) => {
  const [menuAnchorEl, setMenuAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedPostId, setSelectedPostId] = useState<string | null>(null);
  const [fadingPostId, setFadingPostId] = useState<string | null>(null);

  // State for edit post dialog
  const [editPostDialogOpen, setEditPostDialogOpen] = useState(false);
  const [postToEdit, setPostToEdit] = useState<Post | null>(null);

  // State for posts data
  const [posts, setPosts] = useState<Post[]>([]);

  const handleMenuClose = () => {
    setMenuAnchorEl(null);
  };

  // Open edit post dialog
  const handleEditPost = () => {
    const postToEdit = posts.find((post) => post.id === selectedPostId);
    if (postToEdit) {
      setPostToEdit(postToEdit);
      setEditPostDialogOpen(true);
      handleMenuClose();
    }
  };

  // Handle post deletion with fade-out animation
  const handleDeletePost = () => {
    if (selectedPostId) {
      setFadingPostId(selectedPostId);
      handleMenuClose();

      // After animation completes, remove the post
      setTimeout(() => {
        setPosts(posts.filter((post) => post.id !== selectedPostId));
        setFadingPostId(null);
      }, 500);
    }
  };

  // Save edited post
  const handleSavePostEdit = (updatedPost: Post) => {
    // In a real app, this would call an API
    setPosts(
      posts.map((post) => (post.id === updatedPost.id ? updatedPost : post))
    );
    setEditPostDialogOpen(false);
    setPostToEdit(null);
  };

  return (
    <>
      {/* Profile Info Section - unchanged */}
      <Paper elevation={1} sx={{ p: 2, mb: 3, borderRadius: 4 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} md={8}>
            <Box display="flex" alignItems="center" mb={2}>
              <Avatar
                src={profileData.profileImage}
                sx={{ width: 80, height: 80, mr: 2 }}
              />
              <Box>
                <Typography variant="h6">{profileData.name}</Typography>
                <Box display="flex" alignItems="center">
                  <LocationOn fontSize="small" color="action" />
                  <Typography variant="body2">
                    {profileData.location}
                  </Typography>
                </Box>
              </Box>
            </Box>
            {profileData.bio.map((paragraph, index) => (
              <Typography key={index} paragraph>
                {paragraph}
              </Typography>
            ))}
          </Grid>
          <Grid
            item
            xs={12}
            md={4}
            sx={{
              display: "flex",
              justifyContent: "flex-end",
              alignItems: "flex-start",
            }}
          >
            <Button
              variant="outlined"
              startIcon={<Edit />}
              sx={{ borderRadius: "20px" }}
              onClick={openEditDialog}
            >
              ແກ້ໄຂໂປຣໄຟລ໌
            </Button>
          </Grid>
        </Grid>

        <Divider sx={{ my: 2 }} />

        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <Box display="flex" alignItems="center" mb={1}>
              <Email color="action" fontSize="small" sx={{ mr: 1 }} />
              <Typography variant="body2">{profileData.email}</Typography>
            </Box>
            <Box display="flex" alignItems="center">
              <LocationOn color="action" fontSize="small" sx={{ mr: 1 }} />
              <Typography variant="body2">
                {profileData.village} {profileData?.city}
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={12} md={6}>
            <Box display="flex" alignItems="center" mb={1}>
              <Phone color="action" fontSize="small" sx={{ mr: 1 }} />
              <Typography variant="body2">{profileData.phone}</Typography>
            </Box>
          </Grid>
        </Grid>
      </Paper>

      {/* Posts Section - Now using the BlogPost component */}
      <Paper elevation={1} sx={{ borderRadius: 4, overflow: "hidden", mb: 3 }}>
        <Box sx={{ p: 2 }}>
          <MyBlog />
        </Box>
      </Paper>

      {/* Post Menu */}
      <Menu
        anchorEl={menuAnchorEl}
        open={Boolean(menuAnchorEl)}
        onClose={handleMenuClose}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "right",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "right",
        }}
      >
        <MenuItem onClick={handleEditPost}>
          <ListItemIcon>
            <Edit fontSize="small" />
          </ListItemIcon>
          <ListItemText>ແກ້ໄຂບົດຄວາມ</ListItemText>
        </MenuItem>
        <MenuItem onClick={handleDeletePost}>
          <ListItemIcon>
            <Close fontSize="small" />
          </ListItemIcon>
          <ListItemText>ລົບບົດຄວາມ</ListItemText>
        </MenuItem>
      </Menu>

      {/* Edit Post Dialog */}
      <EditPostDialog
        open={editPostDialogOpen}
        onClose={() => setEditPostDialogOpen(false)}
        post={postToEdit as any}
        onSave={handleSavePostEdit as any}
      />
    </>
  );
};

export default ProfileContent;
