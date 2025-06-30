import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  IconButton,
  Paper,
  Divider,
  Container,
  TextField,
  Button,
  Stack,
  useTheme,
  useMediaQuery,
  Menu,
  MenuItem,
  InputAdornment,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  AppBar,
  Toolbar,
  alpha,
  Snackbar,
  Alert,
  Chip,
  FormControl,
  Select,
  InputLabel,
} from "@mui/material";
import {
  Search,
  Home,
  Pets,
  Create,
  TrendingUp,
  NewReleases,
  Settings,
  Menu as MenuIcon,
  Close,
  Person,
  Clear,
  FilterList,
} from "@mui/icons-material";
import CreatePostDialog from "../../../layout/components/dialog-createpost";
import PetReportDialog from "../../../layout/components/dialogReport";
import { BlogPostModel } from "../../../models/blog";
import axiosInstance from "../../../configs/axios";
import BlogPosts from "../../company_search/components/Post";
import useMainController from "../../company_search/controller/index"; // Import your controller

// Simplified comment interface without replies
interface Comment {
  id: number;
  username: string;
  content: string;
  timestamp: string;
  votes: number;
  userVote: "up" | "down" | null;
}

const RedditStylePetBlog = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const isTablet = useMediaQuery(theme.breakpoints.down("md"));

  // Use the enhanced controller
  const {
    searchQuery,
    setSearchQuery,
    searchType,
    setSearchType,
    getFilteredPosts,
    highlightSearchTerm,
    clearSearch,
  } = useMainController();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [menuAnchorEl, setMenuAnchorEl] = useState(null);
  const [activeMenuItem, setActiveMenuItem] = useState("home");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isReportDialogOpen, setIsReportDialogOpen] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [posts, setPosts] = useState([]);
  const [filteredPosts, setFilteredPosts] = useState([]);
  const [expandedPostId, setExpandedPostId] = useState(null);
  const [currentPostId, setCurrentPostId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const handleOpenDialog = () => setIsDialogOpen(true);
  const handleCloseDialog = () => setIsDialogOpen(false);

  const handleOpenReportDialog = () => {
    setIsReportDialogOpen(true);
    handleMenuClose();
  };

  const handleCloseReportDialog = () => setIsReportDialogOpen(false);

  const handleGetData = async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await axiosInstance.get("/blog");

      if (res && res.data && Array.isArray(res.data.data)) {
        const mappedPosts = res.data.data.map((item: Post) => ({
          id: item.id ? String(item.id) : `temp-${Math.random()}`,
          userId: item.userId || "",
          username:
            item.username ||
            (item.user ? item.user.username : item.userId || "Anonymous"),
          user: item.user || {},
          timestamp: item.createdAt
            ? new Date(item.createdAt).toLocaleString()
            : "Unknown date",
          title: item.title || "Untitled Post",
          body: item.body || "",
          images: processImages(item.images),
          comment: Array.isArray(item.comment) ? item.comment : [],
          saved: Array.isArray(item.saved) ? item.saved : [],
          isActive: item.isActive !== undefined ? item.isActive : true,
          createdAt: item.createdAt || new Date().toISOString(),
          updatedAt: item.updatedAt || new Date().toISOString(),
        }));

        setPosts(mappedPosts);
        setFilteredPosts(mappedPosts);
      } else {
        console.warn("API returned unexpected data structure:", res);
        setPosts([]);
        setFilteredPosts([]);
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

  // Process images helper function
  const processImages = (images) => {
    if (!images) return [];
    if (typeof images === "string") {
      try {
        return JSON.parse(images);
      } catch (e) {
        console.error("Error parsing images string:", e);
        return [];
      }
    }
    return Array.isArray(images) ? images : [];
  };

  // Handle search input change
  const handleSearchChange = (event) => {
    const query = event.target.value;
    setSearchQuery(query);
  };

  // Handle search type change
  const handleSearchTypeChange = (event) => {
    setSearchType(event.target.value);
  };

  // Handle search submit
  const handleSearchSubmit = (event) => {
    event.preventDefault();
    performSearch();
  };

  // Perform search function
  const performSearch = () => {
    const filtered = getFilteredPosts(posts);
    setFilteredPosts(filtered);
  };

  // Clear search and show all posts
  const handleClearSearch = () => {
    clearSearch();
    setFilteredPosts(posts);
  };

  // Function to handle menu item selection
  const handleMenuItemClick = (menuItem) => {
    setActiveMenuItem(menuItem);

    if (menuItem === "create") {
      handleOpenDialog();
      if (mobileMenuOpen) {
        setMobileMenuOpen(false);
      }
    }
  };

  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };

  const handleExpandPost = (postId) => {
    setExpandedPostId(expandedPostId === postId ? null : postId);
  };

  const handleMenuOpen = (event, postId) => {
    if (!event || !postId) return;
    setMenuAnchorEl(event.currentTarget);
    setCurrentPostId(postId);
  };

  const handleMenuClose = () => {
    setMenuAnchorEl(null);
  };

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  // Effect to filter posts when search query or type changes
  useEffect(() => {
    if (posts.length > 0) {
      performSearch();
    }
  }, [searchQuery, searchType, posts]);

  useEffect(() => {
    handleGetData();
  }, []);

  return (
    <Box
      sx={{
        bgcolor: theme.palette.mode === "dark" ? "#9990DA" : "#9990DA",
        minHeight: "100vh",
      }}
    >
      {/* Enhanced App Bar with Search */}
      <AppBar
        position="sticky"
        color="inherit"
        elevation={1}
        sx={{ bgcolor: theme.palette.background.paper }}
      >
        <Toolbar sx={{ justifyContent: "space-between", color: "#9990DA" }}>
          <Box sx={{ display: "flex", alignItems: "center" }}>
            {isMobile && (
              <IconButton
                edge="start"
                color="inherit"
                onClick={toggleMobileMenu}
              >
                <MenuIcon />
              </IconButton>
            )}
            <Box sx={{ display: "flex", alignItems: "center", mr: 2 }}>
              <Pets color="primary" sx={{ mr: 1 }} />
              <Typography
                variant="h6"
                noWrap
                sx={{
                  display: { xs: "none", sm: "block" },
                  fontWeight: "bold",
                }}
              >
                ບົດຄວາມ
              </Typography>
            </Box>
          </Box>

          {/* Enhanced Search Section */}
          <Box sx={{ flexGrow: 1, maxWidth: 800, mx: "auto" }}>
            <Box
              component="form"
              onSubmit={handleSearchSubmit}
              sx={{ display: "flex", gap: 1, alignItems: "center" }}
            >
              {/* Search Type Selector */}
              <FormControl size="small" sx={{ minWidth: 120 }}>
                <Select
                  value={searchType}
                  onChange={handleSearchTypeChange}
                  displayEmpty
                  sx={{ borderRadius: 4 }}
                >
                  <MenuItem value="all">ທັງໝົດ</MenuItem>
                  <MenuItem value="title">ຫົວເລື່ອງ</MenuItem>
                  <MenuItem value="username">ຊື່ຜູ້ໃຊ້</MenuItem>
                  <MenuItem value="date">ວັນທີ່</MenuItem>
                </Select>
              </FormControl>

              {/* Search Input */}
              <TextField
                fullWidth
                placeholder={
                  searchType === 'title' ? 'ຊອກຫົວເລື່ອງ...' :
                  searchType === 'username' ? 'ຊອກຊື່ຜູ້ໃຊ້...' :
                  searchType === 'date' ? 'ຊອກວັນທີ່ (YYYY-MM-DD)...' :
                  'ຊອກບົດຄວາມ...'
                }
                size="small"
                variant="outlined"
                value={searchQuery}
                onChange={handleSearchChange}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search />
                    </InputAdornment>
                  ),
                  endAdornment: searchQuery && (
                    <InputAdornment position="end">
                      <IconButton onClick={handleClearSearch} size="small">
                        <Clear />
                      </IconButton>
                    </InputAdornment>
                  ),
                  sx: {
                    borderRadius: 4,
                    bgcolor: alpha(theme.palette.common.black, 0.04),
                  },
                }}
              />

              
            </Box>

            {/* Search Results Info */}
            {searchQuery && (
              <Box sx={{ mt: 1, display: "flex", alignItems: "center", gap: 1 }}>
                <Chip
                  label={`ພົບ ${filteredPosts.length} ຜົນການຊອກຫາ`}
                  size="small"
                  color="primary"
                  variant="outlined"
                />
                <Chip
                  label={`ຊອກ: "${searchQuery}"`}
                  size="small"
                  onDelete={handleClearSearch}
                  deleteIcon={<Clear />}
                />
              </Box>
            )}
          </Box>

          <Button
            variant="contained"
            color="primary"
            startIcon={<Create />}
            onClick={handleOpenDialog}
            sx={{
              ml: 2,
              borderRadius: 4,
              display: { xs: "none", sm: "flex" },
              bgcolor: "#9990DA",
              "&:hover": {
                bgcolor: "#D5D1F0",
              },
            }}
          >
            ສ້າງບົດຄວາມ
          </Button>
        </Toolbar>
      </AppBar>

      {/* Mobile Drawer Menu */}
      <Drawer anchor="left" open={mobileMenuOpen} onClose={toggleMobileMenu}>
        <Box sx={{ width: 250 }} role="presentation">
          <Box
            sx={{
              p: 2,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center" }}>
              <Pets color="primary" sx={{ mr: 1 }} />
              <Typography variant="h6">ບົດຄວາມ</Typography>
            </Box>
            <IconButton onClick={toggleMobileMenu}>
              <Close />
            </IconButton>
          </Box>
          <Divider />
          <List>
            {[
              { text: "Home", icon: <Home />, id: "home" },
              { text: "Popular", icon: <TrendingUp />, id: "popular" },
              { text: "Create Post", icon: <Create />, id: "create" },
            ].map((item) => (
              <ListItem
                button
                key={item.id}
                selected={activeMenuItem === item.id}
                onClick={() => handleMenuItemClick(item.id)}
              >
                <ListItemIcon>{item.icon}</ListItemIcon>
                <ListItemText primary={item.text} />
              </ListItem>
            ))}
          </List>
          <Divider />
        </Box>
      </Drawer>

      <Container maxWidth="lg" disableGutters={isMobile}>
        <Grid container spacing={2} sx={{ p: { xs: 0, sm: 1 } }}>
          {/* Left Sidebar - Hidden on mobile */}
          {!isMobile && (
            <Grid item xs={12} md={3} lg={2}>
              <Card
                sx={{ mb: 2, position: "sticky", top: 76, borderRadius: 4 }}
              >
                <CardContent>
                  <List disablePadding dense>
                    <ListItem
                      button
                      selected={activeMenuItem === "home"}
                      onClick={() => handleMenuItemClick("home")}
                    >
                      <ListItemIcon>
                        <Home />
                      </ListItemIcon>
                      <ListItemText primary="ໜ້າຫຼັກ" />
                    </ListItem>
                    <ListItem
                      button
                      selected={activeMenuItem === "popular"}
                      onClick={() => handleMenuItemClick("popular")}
                    >
                      <ListItemIcon>
                        <TrendingUp />
                      </ListItemIcon>
                      <ListItemText primary="ໂພສຍອດນິຍົມ" />
                    </ListItem>
                    <ListItem
                      button
                      selected={activeMenuItem === "new"}
                      onClick={() => handleMenuItemClick("new")}
                    >
                      <ListItemIcon>
                        <NewReleases />
                      </ListItemIcon>
                      <ListItemText primary="ໃໝ່" />
                    </ListItem>
                  </List>
                </CardContent>
              </Card>
            </Grid>
          )}

          {/* Main Content */}
          <Grid item xs={10} md={isTablet ? 9 : 6} lg={7}>
            {loading ? (
              <Paper sx={{ p: 3, textAlign: "center", borderRadius: 4 }}>
                <Typography variant="h6" color="text.secondary" gutterBottom>
                  ກຳລັງໂຫຼດບົດຄວາມ...
                </Typography>
              </Paper>
            ) : error ? (
              <Paper sx={{ p: 3, textAlign: "center", borderRadius: 4 }}>
                <Typography variant="h6" color="error" gutterBottom>
                  ການໂຫຼດບົດຄວາມລຜິດພາດ
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {error}
                </Typography>
                <Button
                  variant="outlined"
                  sx={{ mt: 2 }}
                  onClick={handleGetData}
                >
                  ລອງໃໝ່ອີກຄັ້ງ
                </Button>
              </Paper>
            ) : filteredPosts.length === 0 && searchQuery ? (
              <Paper sx={{ p: 3, textAlign: "center", borderRadius: 4 }}>
                <Typography variant="h6" color="text.secondary" gutterBottom>
                  ບໍ່ພົບຜົນການຊອກຫາ
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  ບໍ່ພົບບົດຄວາມທີ່ກ່ຽວຂ້ອງກັບ "{searchQuery}"
                </Typography>
                <Button
                  variant="outlined"
                  sx={{ mt: 2 }}
                  onClick={handleClearSearch}
                >
                  ລ້າງການຊອກຫາ
                </Button>
              </Paper>
            ) : (
              <Stack spacing={2}>
                <BlogPosts posts={filteredPosts} searchQuery={searchQuery} />
              </Stack>
            )}
          </Grid>

          {/* Right Sidebar - Hidden on tablet and mobile */}
          {!isTablet && (
            <Grid item xs={12} md={3}>
              <Box sx={{ position: "sticky", top: 76 }}>
                <Card sx={{ mb: 2 }}>
                  <CardContent>
                    <Typography variant="h6" sx={{ fontWeight: "bold", mb: 2 }}>
                      r/PetCare ກົດລະບຽບ
                    </Typography>
                    <List dense disablePadding>
                      {[
                        "ເຄົາລົບຜູ້ໃຊ້ ແລະ ສັດລ້ຽງອື່ນໆ",
                        "ຫ້າມໂຄສະນາ ຫຼື ສົ່ງເສີມຕົນເອງ",
                        "ລະບຸສະຖານທີ່ ເວລາຂໍຄຳແນະນຳຈາກສັດຕະວະແພດ",
                        "ບໍ່ມີກໍລະນີສຸກເສີນທາງການແພດ - ຕິດຕໍ່ສັດຕະວະແພດຂອງທ່ານ",
                        "ອ້າງອີງແຫຼ່ງທີ່ມາສຳລັບຂໍ້ມູນສຸຂະພາບ/ໂພຊະນາການ",
                      ].map((rule, index) => (
                        <React.Fragment key={index}>
                          <ListItem sx={{ px: 0 }}>
                            <ListItemText
                              primary={`${index + 1}. ${rule}`}
                              primaryTypographyProps={{ variant: "body2" }}
                            />
                          </ListItem>
                          {index < 4 && <Divider component="li" />}
                        </React.Fragment>
                      ))}
                    </List>
                  </CardContent>
                </Card>

                <Box sx={{ mt: 2, px: 2 }}>
                  <Typography variant="caption" color="text.secondary">
                    © 2025 ບົດຄວາມ, Inc. ສະຫງວນລິຂະສິດ
                  </Typography>
                </Box>
              </Box>
            </Grid>
          )}
        </Grid>
      </Container>

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
        <MenuItem onClick={handleMenuClose}>
          <ListItemIcon>
            <Person fontSize="small" />
          </ListItemIcon>
          <ListItemText>ເບິ່ງໂປຣໄຟລ໌</ListItemText>
        </MenuItem>

        <MenuItem onClick={handleOpenReportDialog}>
          <ListItemIcon>
            <Settings fontSize="small" />
          </ListItemIcon>
          <ListItemText>ລາຍງານ</ListItemText>
        </MenuItem>
      </Menu>

      {/* Mobile Post Creation Button */}
      {isMobile && (
        <Button
          variant="contained"
          color="primary"
          onClick={handleOpenDialog}
          sx={{
            position: "fixed",
            bottom: 16,
            right: 16,
            borderRadius: "50%",
            width: 56,
            height: 56,
            minWidth: 56,
            boxShadow: theme.shadows[6],
            zIndex: theme.zIndex.speedDial,
          }}
        >
          <Create />
        </Button>
      )}

      {/* Dialogs */}
      <CreatePostDialog open={isDialogOpen} onClose={handleCloseDialog} />
      <PetReportDialog
        open={isReportDialogOpen}
        onClose={handleCloseReportDialog}
      />

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={5000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
      >
        <Alert
          onClose={handleSnackbarClose}
          severity="success"
          sx={{ width: "100%" }}
          variant="filled"
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default RedditStylePetBlog;