import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Card,
  CardContent,
  Typography,
  Avatar,
  Box,
  IconButton,
  Button,
  Stack,
  Divider,
  CardActions,
  CardMedia,
  CardHeader,
  CircularProgress,
  Container,
  Paper,
  Grid,
  useTheme,
  alpha,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Snackbar,
  Alert,
} from "@mui/material";
import CommentIcon from "@mui/icons-material/Comment";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import InsertPhotoOutlinedIcon from "@mui/icons-material/InsertPhotoOutlined";
import { Person, Flag } from "@mui/icons-material";
import CommentSection from "../../company_search/components/comment";
import axiosInstance from "../../../configs/axios";
import BlogReportDialog from "../../../layout/components/dialogReport";
import SaveButton from "../../company_search/components/favoriteButton";

// Interfaces
interface User {
  id: string;
  firstName: string;
  lastName: string;
  avatar: string;
  username: string;
}

interface Comment {
  id: string;
  body: string;
  userId: string;
  commentText?: string;
  timestamp?: string;
  user: User;
}

interface Post {
  id: string;
  title: string;
  body: string;
  createdAt: string;
  images?: string[];
  timestamp: string;
  saved: boolean;
  comment: Comment[];
  user: User;
  userId?: string;
  username?: string;
  isActive?: boolean;
  updatedAt?: string;
}

interface BlogPostsProps {
  posts?: Post[];
  searchQuery?: string;
  onRefresh?: () => void;
}

const BlogPosts = ({ posts: propPosts, searchQuery = "", onRefresh }: BlogPostsProps) => {
  const theme = useTheme();
  const navigate = useNavigate();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Instead of storing expanded state as a record, use a single string to track the active post
  const [activeCommentPostId, setActiveCommentPostId] = useState<string | null>(
    null
  );

  // Menu state
  const [menuAnchorEl, setMenuAnchorEl] = useState(null);
  const [currentPostId, setCurrentPostId] = useState(null);

  // Dialog states
  const [isReportDialogOpen, setIsReportDialogOpen] = useState(false);

  // Current user ID (in a real app, you would get this from auth context)
  const [currentUserId, setCurrentUserId] = useState(
    "currentUserIdPlaceholder"
  );

  // Snackbar state
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState<
    "success" | "error" | "info" | "warning"
  >("success");

  // Function to highlight search terms
  const highlightSearchTerm = (text: string, searchTerm: string) => {
    if (!searchTerm || !text) return text;
    
    const regex = new RegExp(`(${searchTerm})`, 'gi');
    const parts = text.split(regex);
    
    return parts.map((part, index) => 
      regex.test(part) ? (
        <span key={index} style={{ 
          fontWeight: 'bold',
          padding: '0 2px',
          borderRadius: '2px'
        }}>
          {part}
        </span>
      ) : part
    );
  };

  useEffect(() => {
    // If posts are provided as props, use them instead of fetching
    if (propPosts && propPosts.length >= 0) {
      setPosts(propPosts);
      setLoading(false);
      setError(null);
    } else {
      // Only fetch data if no posts are provided as props
      handleGetData();
    }

    // In a real app, you might get the current user ID from an auth context
    const fetchCurrentUser = async () => {
      try {
        setCurrentUserId("currentUserIdPlaceholder");
      } catch (err) {
        console.error("Error fetching current user:", err);
      }
    };

    fetchCurrentUser();
  }, [propPosts]);

  const handleGetData = async () => {
    setLoading(true);
    setError(null);

    try {
      // Make API call to fetch blog posts
      const response = await axiosInstance.get("/blog");

      // Check if response has data property and it contains data array
      if (response?.data?.data && Array.isArray(response.data.data)) {
        // Map API response data to Post interface
        const mappedPosts = response.data.data.map((item: any) => ({
          id: item.id ? String(item.id) : `temp-${Math.random()}`,
          title: item.title || "Untitled Post",
          body: item.body || "",
          images: item.images || [],
          timestamp: item.createdAt || new Date().toISOString(),
          createdAt: item.createdAt || new Date().toISOString(),
          saved: Boolean(item.saved),
          comment: Array.isArray(item.comment) ? item.comment : [],
          user: item.user || {
            id: item.userId || "",
            firstName: item.user?.firstName || "Anonymous",
            lastName: item.user?.lastName || "User",
            avatar: item.user?.avatar || "/api/placeholder/40/40",
            username: item.user?.username || "anonymous",
          },
          userId: item.userId || "",
          username: item.username || item.user?.username || "anonymous",
          isActive: item.isActive !== undefined ? item.isActive : true,
          updatedAt: item.updatedAt || new Date().toISOString(),
        }));

        console.log("All posts:", mappedPosts);
        setPosts(mappedPosts);
      } else {
        // Handle empty or invalid response
        console.warn("API returned unexpected data structure:", response);
        setPosts([]);
        setError("Couldn't load posts. Please try again later.");
      }
    } catch (error) {
      console.error("Error fetching posts:", error);
      setError(
        "Failed to load posts. Please check your connection and try again."
      );
    } finally {
      setLoading(false);
    }
  };

  // Handle post save status change
  const handleSaveChange = (postId: string, newSavedState: boolean) => {
    // Update the posts state with the new saved status
    setPosts((prevPosts) =>
      prevPosts.map((post) =>
        post.id === postId ? { ...post, saved: newSavedState } : post
      )
    );
  };

  // Modified function to only show comments for the selected post
  const toggleComments = (postId: string) => {
    // If clicking on the already active post, close it
    if (activeCommentPostId === postId) {
      setActiveCommentPostId(null);
    } else {
      // Otherwise, set the new active post
      setActiveCommentPostId(postId);
    }
  };

  // Navigate to post detail page
  const navigateToPostDetail = (postId: string, event: React.MouseEvent) => {
    // Check if click occurred on elements we want to exclude from navigation
    const target = event.target as HTMLElement;
    const clickedOnButton = target.closest("button") !== null;
    const clickedOnIconButton = target.closest(".MuiIconButton-root") !== null;

    // Don't navigate if clicking on buttons (like comment button) or menu
    if (clickedOnButton || clickedOnIconButton || menuAnchorEl) {
      return;
    }

    // Navigate to the post detail page
    navigate(`/blog-detail/${postId}`);
  };

  // Menu handling functions
  const handleMenuOpen = (event: any, postId: any) => {
    if (!event || !postId) return;
    event.stopPropagation(); // Stop event propagation
    console.log("Opening menu for post:", postId);
    setMenuAnchorEl(event.currentTarget);
    setCurrentPostId(postId);
  };

  const handleMenuClose = () => {
    setMenuAnchorEl(null);
  };

  // New function to handle view profile click
  const handleViewProfile = () => {
    // Find the current post based on currentPostId
    const currentPost = posts.find((post) => post.id === currentPostId);

    // Navigate to user profile with the user ID
    if (currentPost && currentPost.user && currentPost.user.id) {
      navigate(`/user-profile/${currentPost.user.id}`);
    } else {
      // Show error if user ID is not available
      setSnackbarMessage("Error: User profile not available");
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
    }

    // Close the menu
    handleMenuClose();
  };

  // Report dialog functions
  const handleOpenReportDialog = () => {
    setIsReportDialogOpen(true);
    handleMenuClose();
  };

  const handleCloseReportDialog = () => {
    setIsReportDialogOpen(false);
  };

  const handleReportSuccess = () => {
    // Show success snackbar
    setSnackbarMessage("Report submitted successfully");
    setSnackbarSeverity("success");
    setSnackbarOpen(true);
  };

  // Handle comments update and refresh data if needed
  const handleCommentsUpdate = () => {
    if (onRefresh) {
      onRefresh();
    } else {
      handleGetData();
    }
  };

  // Handle snackbar close
  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };

  const formatDate = (timestamp: string) => {
    try {
      const date = new Date(timestamp);
      return date.toLocaleDateString("en-US", {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch (err) {
      return "Invalid date";
    }
  };

  const getTimeAgo = (timestamp: string): string => {
    try {
      const now = new Date();
      const pastDate = new Date(timestamp);
      const diffMs = now.getTime() - pastDate.getTime();

      const diffSecs = Math.floor(diffMs / 1000);
      if (diffSecs < 60) return `${diffSecs}s ago`;

      const diffMins = Math.floor(diffSecs / 60);
      if (diffMins < 60) return `${diffMins}m ago`;

      const diffHours = Math.floor(diffMins / 60);
      if (diffHours < 24) return `${diffHours}h ago`;

      const diffDays = Math.floor(diffHours / 24);
      if (diffDays < 7) return `${diffDays}d ago`;

      return formatDate(timestamp);
    } catch (err) {
      return "Unknown time";
    }
  };

  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        height="400px"
      >
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Paper
        sx={{
          p: 3,
          bgcolor: alpha(theme.palette.error.main, 0.1),
          color: theme.palette.error.main,
          borderRadius: 2,
        }}
      >
        <Typography align="center">{error}</Typography>
        <Box sx={{ textAlign: 'center', mt: 2 }}>
          <Button 
            variant="outlined" 
            onClick={onRefresh || handleGetData}
            color="error"
          >
            Try Again
          </Button>
        </Box>
      </Paper>
    );
  }

  if (posts.length === 0) {
    return (
      <Paper
        sx={{
          p: 4,
          textAlign: "center",
          borderRadius: 2,
          bgcolor: alpha(theme.palette.primary.main, 0.05),
        }}
      >
        <InsertPhotoOutlinedIcon
          sx={{
            fontSize: 60,
            color: alpha(theme.palette.text.secondary, 0.5),
            mb: 2,
          }}
        />
        <Typography variant="h6" color="text.secondary">
          {searchQuery ? "ບໍ່ພົບຜົນການຊອກຫາ" : "ບໍ່ພົບ ບົດຄວາມ"}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          {searchQuery 
            ? `ບໍ່ພົບບົດຄວາມທີ່ກ່ຽວຂ້ອງກັບ "${searchQuery}"`
            : "ປັດຈຸບັນໜ້າຟີດວ່າງເປົ່າ"
          }
        </Typography>
      </Paper>
    );
  }

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Stack spacing={3}>
        {posts.map((post) => (
          <Card
            key={post.id}
            elevation={2}
            onClick={(e) => navigateToPostDetail(post.id, e)}
            sx={{
              borderRadius: 2,
              overflow: "hidden",
              transition: "all 0.3s ease",
              "&:hover": {
                transform: "translateY(-4px)",
                boxShadow: theme.shadows[4],
                cursor: "pointer",
              },
            }}
          >
            <CardHeader
              avatar={
                <Avatar
                  src={post.user.avatar || "/api/placeholder/40/40"}
                  alt={`${post.user.firstName} ${post.user.lastName}`}
                  sx={{
                    width: 45,
                    height: 45,
                    border: `2px solid ${theme.palette.primary.main}`,
                  }}
                />
              }
              action={
                <IconButton
                  aria-label="settings"
                  onClick={(e) => handleMenuOpen(e, post.id)}
                >
                  <MoreVertIcon />
                </IconButton>
              }
              title={
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                    {highlightSearchTerm(`${post.user.firstName} ${post.user.lastName}`, searchQuery)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    @{highlightSearchTerm(post.user.username, searchQuery)}
                  </Typography>
                </Box>
              }
              subheader={
                <Typography variant="caption" color="text.secondary">
                  {getTimeAgo(post.timestamp)}
                </Typography>
              }
              sx={{ pb: 0 }}
            />

            <CardContent sx={{ pt: 1 }}>
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 600,
                  mb: 1,
                  color: theme.palette.text.primary,
                }}
              >
                {highlightSearchTerm(post.title, searchQuery)}
              </Typography>
              <Typography
                variant="body1"
                color="text.secondary"
                sx={{
                  mb: 2,
                  lineHeight: 1.6,
                }}
              >
                {highlightSearchTerm(post.body, searchQuery)}
              </Typography>
            </CardContent>

            {/* Post Images */}
            {post.images && post.images.length > 0 && (
              <Box sx={{ px: 2, pb: 2 }}>
                {post.images.length === 1 ? (
                  <CardMedia
                    component="img"
                    image={post.images[0] || "/api/placeholder/600/400"}
                    alt="Post image"
                    sx={{
                      width: "100%",
                      borderRadius: 2,
                      maxHeight: 400,
                      objectFit: "cover",
                    }}
                  />
                ) : (
                  <Grid container spacing={1}>
                    {post.images.slice(0, 4).map((img, index) => (
                      <Grid item xs={6} key={index}>
                        <Box
                          sx={{
                            position: "relative",
                            height: 180,
                            borderRadius: 2,
                            overflow: "hidden",
                            ...(post.images &&
                            post.images.length > 4 &&
                            index === 3
                              ? {
                                  "&::after": {
                                    content: `'+${post.images.length - 4}'`,
                                    position: "absolute",
                                    top: 0,
                                    left: 0,
                                    width: "100%",
                                    height: "100%",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    backgroundColor: "rgba(0,0,0,0.6)",
                                    color: "#fff",
                                    fontSize: "2rem",
                                  },
                                }
                              : {}),
                          }}
                        >
                          <CardMedia
                            component="img"
                            image={img || "/api/placeholder/300/200"}
                            alt={`Post image ${index + 1}`}
                            sx={{
                              height: "100%",
                              width: "100%",
                              objectFit: "cover",
                            }}
                          />
                        </Box>
                      </Grid>
                    ))}
                  </Grid>
                )}
              </Box>
            )}

            <Divider sx={{ mx: 2 }} />

            <CardActions
              sx={{
                justifyContent: "space-between",
                px: 2,
                py: 1.5,
                bgcolor: alpha(theme.palette.background.default, 0.6),
              }}
            >
              <Button
                startIcon={<CommentIcon fontSize="small" />}
                size="small"
                onClick={(e) => {
                  e.stopPropagation();
                  toggleComments(post.id);
                }}
                sx={{
                  textTransform: "none",
                  color:
                    activeCommentPostId === post.id
                      ? theme.palette.primary.main
                      : theme.palette.text.secondary,
                  borderRadius: 4,
                  px: 2,
                  "&:hover": {
                    bgcolor: alpha(theme.palette.primary.main, 0.1),
                  },
                }}
              >
                {post.comment.length}{" "}
                {post.comment.length === 1
                  ? "ສະແດງຄວາມຄິດເຫັນ"
                  : "ສະແດງຄວາມຄິດເຫັນ"}
              </Button>

              <SaveButton
                itemId={post?.id}
                itemType="blog"
                itemName={post.title}
                onSaveChange={handleSaveChange}
              />
            </CardActions>

            {/* Comments Section - only shown for the active post */}
            <CommentSection
              postId={post.id}
              comments={post.comment}
              expanded={activeCommentPostId === post.id}
              onCommentsUpdate={handleCommentsUpdate}
            />
          </Card>
        ))}
      </Stack>

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
        <MenuItem onClick={handleViewProfile}>
          <ListItemIcon>
            <Person fontSize="small" />
          </ListItemIcon>
          <ListItemText>ເບິ່ງໂປຣໄຟລ໌</ListItemText>
        </MenuItem>

        <MenuItem onClick={handleOpenReportDialog}>
          <ListItemIcon>
            <Flag fontSize="small" color="error" />
          </ListItemIcon>
          <ListItemText>ລາຍງານ</ListItemText>
        </MenuItem>
      </Menu>

      {/* Report Dialog */}
      <BlogReportDialog
        open={isReportDialogOpen}
        onClose={handleCloseReportDialog}
        blogId={currentPostId}
        currentUserId={currentUserId}
      />

      {/* Snackbar Notifications */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={4000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={handleSnackbarClose}
          severity={snackbarSeverity}
          sx={{ width: "100%" }}
          variant="filled"
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default BlogPosts;