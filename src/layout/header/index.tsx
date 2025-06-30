import * as React from "react";
import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Toolbar from "@mui/material/Toolbar";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import Menu from "@mui/material/Menu";
import MenuIcon from "@mui/icons-material/Menu";
import Container from "@mui/material/Container";
import Avatar from "@mui/material/Avatar";
import Tooltip from "@mui/material/Tooltip";
import MenuItem from "@mui/material/MenuItem";
import AdbIcon from "@mui/icons-material/Adb";
import FreeIcon from "../../assets/icons/Logo.png";
import {
  BLOG_PATH,
  HOME_PATH,
  BLOG_PROFILE_PATH,
  PET_PATH,
} from "../../routes/path";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { Button, Grid } from "@mui/material";
import LoginDialog from "../components/dialog-login";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "../../store"; // Assuming you have a root state type
import { logout } from "../../store/authenticationSlice";

// Modified pages array - removed LOGIN_PATH
const pages = [
  { to: HOME_PATH, label: "ໜ້າຫຼັກ" },
  { to: PET_PATH, label: "ສັດລ້ຽງ" },
  { to: BLOG_PATH, label: "ບົດຄວາມ" },
];

// Settings with paths
const settings = [
  { to: BLOG_PROFILE_PATH, label: "Profile" },
  // { to: ACCOUNT_PATH, label: "Account" },
  // { to: OVERVIEW_PATH, label: "Overview" },
  { to: "", label: "Logout" }, // No path for logout as it's an action
];

function ResponsiveAppBar() {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const [currentPath, setCurrentPath] = useState<string>(location.pathname);
  const [anchorElNav, setAnchorElNav] = React.useState<null | HTMLElement>(
    null
  );
  const [anchorElUser, setAnchorElUser] = React.useState<null | HTMLElement>(
    null
  );

  // Get authentication state from Redux
  const auth = useSelector((state: RootState) => state.auth);
  const isLoggedIn = auth.loggedIn;
  const userData = auth.data;

  // State for login dialog
  const [loginDialogOpen, setLoginDialogOpen] = React.useState(false);

  const handleOpenNavMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorElNav(event.currentTarget);
  };

  const handleOpenUserMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorElUser(event.currentTarget);
  };

  const handleCloseNavMenu = () => {
    setAnchorElNav(null);
  };

  const handleCloseUserMenu = () => {
    setAnchorElUser(null);
  };

  // Login dialog handlers
  const handleOpenLoginDialog = () => {
    setLoginDialogOpen(true);
  };

  const handleCloseLoginDialog = () => {
    setLoginDialogOpen(false);
  };

  // Handle successful login from dialog
  const handleLoginSuccess = () => {
    // No need to set local state as we're using Redux state
    handleCloseLoginDialog();
  };

  const handleLogout = () => {
    // Dispatch logout action to Redux
    dispatch(logout());
    handleCloseUserMenu();
    // Optionally navigate to home page after logout
    navigate(HOME_PATH);
  };

  const handleSettingClick = (setting: string, path: string) => {
    if (setting === "Logout") {
      handleLogout();
    } else if (path) {
      navigate(path);
      handleCloseUserMenu();
    }
  };

  useEffect(() => {
    setCurrentPath(location.pathname);
  }, [location.pathname]);

  // Get user's initials for avatar fallback
  const getUserInitials = () => {
    if (userData && userData.firstName && userData.lastName) {
      return `${userData.firstName.charAt(0)}${userData.lastName.charAt(0)}`;
    } else if (userData && userData.username) {
      return userData.username.charAt(0).toUpperCase();
    }
    return "U";
  };

  // Log auth state for debugging
  useEffect(() => {
    console.log("Auth state:", auth);
  }, [auth]);

  return (
    <>
      <AppBar position="static" sx={{ bgcolor: "white" }}>
        <Container maxWidth="xl">
          <Toolbar disableGutters>
            {/* Logo for desktop */}
            <Box
              sx={{
                display: { xs: "none", md: "flex" },
                width: "180px",
                height: "80px",
                mr: 2,
              }}
            >
              <img
                src={FreeIcon}
                alt="PetHub Logo"
                style={{ width: "100% ", height: "100%" }}
              />
              
            </Box>

            {/* Mobile menu */}
            <Box sx={{ flexGrow: 1, display: { xs: "flex", md: "none" } }}>
              <IconButton
                size="large"
                aria-label="account of current user"
                aria-controls="menu-appbar"
                aria-haspopup="true"
                onClick={handleOpenNavMenu}
                color="primary"
              >
                <MenuIcon />
              </IconButton>
              <Menu
                id="menu-appbar"
                anchorEl={anchorElNav}
                anchorOrigin={{
                  vertical: "bottom",
                  horizontal: "left",
                }}
                keepMounted
                transformOrigin={{
                  vertical: "top",
                  horizontal: "left",
                }}
                open={Boolean(anchorElNav)}
                onClose={handleCloseNavMenu}
                sx={{
                  display: { xs: "block", md: "none" },
                }}
              >
                {pages.map((page) => (
                  <MenuItem
                    key={page.to}
                    onClick={() => {
                      handleCloseNavMenu();
                      navigate(page.to);
                    }}
                  >
                    <Typography textAlign="center">{page.label}</Typography>
                  </MenuItem>
                ))}
                {!isLoggedIn && (
                  <MenuItem
                    onClick={() => {
                      handleCloseNavMenu();
                      handleOpenLoginDialog();
                    }}
                  >
                    <Typography textAlign="center">Log in</Typography>
                  </MenuItem>
                )}
              </Menu>
            </Box>

            {/* Logo for mobile */}
            <AdbIcon sx={{ display: { xs: "flex", md: "none" }, mr: 1 }} />
            <Typography
              variant="h5"
              noWrap
              component="a"
              href="#app-bar-with-responsive-menu"
              sx={{
                mr: 1,
                display: { xs: "flex", md: "none" },
                flexGrow: 1,
                fontWeight: 700,
                letterSpacing: ".3rem",
                color: "black",
                textDecoration: "none",
              }}
            >
              PetHub
            </Typography>

            {/* Desktop menu */}
            <Box
              sx={{
                flexGrow: 1,
                display: { xs: "none", md: "flex" },
                justifyContent: "flex-end",
                gap: 4,
                px: 2,
              }}
            >
              {pages.map((page) => (
                <Link
                  key={page.to}
                  to={page.to}
                  onClick={handleCloseNavMenu}
                  style={{
                    margin: "2px 0",
                    display: "block",
                    textDecoration: "none",
                    fontSize: "16px",
                    boxSizing: "border-box",
                    color: page.to === currentPath ? "#9990DA" : "black",
                    borderBottom:
                      page.to === currentPath ? "3px solid #9990DA" : "none",
                    fontWeight: page.to === currentPath ? "bold" : "normal",
                    position: "relative",
                    transition:
                      "transform 0.3s ease-in-out, color 0.3s ease-in-out, border-bottom 0.3s ease-in-out",
                    overflow: "hidden",
                    padding: "4px 0",
                  }}
                >
                  {page.label}
                  <span
                    style={{
                      position: "absolute",
                      left: "-100%",
                      bottom: 0,
                      height: "2px",
                      width: "100%",
                      backgroundColor: "#9990DA ",
                      transition: "left 0.3s ease-in-out",
                    }}
                  />
                </Link>
              ))}

              {/* Login button shown only when user is not logged in */}
              {!isLoggedIn ? (
                <Button
                  onClick={handleOpenLoginDialog}
                  variant="contained"
                  sx={{
                    backgroundColor: "#9990DA",
                    color: "white",
                    "&:hover": {
                      backgroundColor: "#D5D1F0",
                    },
                    textTransform: "none",
                    borderRadius: "20px",
                    padding: "6px 16px",
                  }}
                >
                  ເຂົ້າສູ່ລະບົບ
                </Button>
              ) : (
                // Show username when logged in
                <Typography
                  variant="body1"
                  sx={{
                    color: "#3f3d56",
                    fontWeight: 500,
                    display: "flex",
                    alignItems: "center",
                  }}
                >
                  ຍິນດີຕອນຮັບ, {userData?.firstName || userData?.username || "User"}
                </Typography>
              )}
            </Box>

            {/* User menu with avatar */}
            <Box sx={{ flexGrow: 0, ml: 2 }}>
              {/* Avatar is only shown when user is logged in */}
              {isLoggedIn && (
                <Tooltip title="Open settings">
                  <IconButton onClick={handleOpenUserMenu} sx={{ p: 0 }}>
                    <Avatar
                      alt={userData?.username || "User"}
                      src={userData?.avatar || ""}
                      sx={{ bgcolor: "#9990DA" }}
                    >
                      {getUserInitials()}
                    </Avatar>
                  </IconButton>
                </Tooltip>
              )}
              <Menu
                sx={{ mt: "45px" }}
                id="menu-appbar"
                anchorEl={anchorElUser}
                anchorOrigin={{
                  vertical: "top",
                  horizontal: "right",
                }}
                keepMounted
                transformOrigin={{
                  vertical: "top",
                  horizontal: "right",
                }}
                open={Boolean(anchorElUser)}
                onClose={handleCloseUserMenu}
              >
                {settings.map((setting) => (
                  <MenuItem
                    key={setting.label}
                    onClick={() =>
                      handleSettingClick(setting.label, setting.to)
                    }
                    sx={{
                      color: setting.to === currentPath ? "#9990DA" : "inherit",
                      fontWeight:
                        setting.to === currentPath ? "bold" : "normal",
                    }}
                  >
                    <Typography textAlign="center">{setting.label}</Typography>
                  </MenuItem>
                ))}
              </Menu>
            </Box>
          </Toolbar>
        </Container>

        {/* Search bar */}
        <Box
          sx={{
            bgcolor: "#9990DA",
            display: "flex",
            width: "100%",
            justifyContent: "flex-end",
            minHeight: 50,
          }}
        >
          <Grid
            sx={{
              px: { xs: 2, md: 20 },
              alignItems: "center",
              display: "flex",
            }}
          >
    
          </Grid>
        </Box>
      </AppBar>

      {/* Login Dialog */}
      <LoginDialog
        open={loginDialogOpen}
        onClose={handleCloseLoginDialog}
        onLogin={handleLoginSuccess}
      />
    </>
  );
}

export default ResponsiveAppBar;
