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
import FreeIcon from "../../assets/icons/logo_pethub-removebg-preview.png";
import SearchIcon from "@mui/icons-material/Search";
import {
  BLOG_PATH,
  HOME_PATH,
  ADOPT_PATH,
} from "../../routes/path";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import {
  Button,
  Grid,
  InputAdornment,
  TextField,
} from "@mui/material";
import LoginDialog from "../components/dialog-login";

// Modified pages array - removed LOGIN_PATH
const pages = [
  { to: HOME_PATH, label: "Home" },
  { to: ADOPT_PATH, label: "Adopt" },
  { to: BLOG_PATH, label: "Blog" },
];
const settings = ["Profile", "Account", "Dashboard", "Logout"];

function ResponsiveAppBar() {
  const [currentPath, setCurrentPath] = useState<string>(location.pathname);
  const [anchorElNav, setAnchorElNav] = React.useState<null | HTMLElement>(
    null
  );
  const [anchorElUser, setAnchorElUser] = React.useState<null | HTMLElement>(
    null
  );
  // New state for login dialog
  const [loginDialogOpen, setLoginDialogOpen] = React.useState(false);
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");

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
    setEmail("");
    setPassword("");
  };

  const handleLogin = () => {
    // Handle login logic here
    console.log("Logging in with:", email, password);
    // After successful login, close dialog
    handleCloseLoginDialog();
  };

  useEffect(() => {
    setCurrentPath(location.pathname);
  }, [location.pathname]);

  return (
    <>
      <AppBar position="static" sx={{ bgcolor: "white" }}>
        <Container maxWidth="xl">
          <Toolbar disableGutters>
            <Box
              sx={{
                display: { xs: "none", md: "flex" },
                width: "70px",
                height: "70px",
                mr: 2,
              }}
            >
              <img
                src={FreeIcon}
                alt=""
                style={{ width: "100% ", height: "100%" }}
              />
            </Box>
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
                  <MenuItem key={page.to} onClick={handleCloseNavMenu}>
                    <Typography textAlign="center">{page.label}</Typography>
                  </MenuItem>
                ))}
                <MenuItem
                  onClick={() => {
                    handleCloseNavMenu();
                    handleOpenLoginDialog();
                  }}
                >
                  <Typography textAlign="center">Log in</Typography>
                </MenuItem>
              </Menu>
            </Box>
            <AdbIcon sx={{ display: { xs: "flex", md: "none" }, mr: 1 }} />
            <Typography
              variant="h5"
              noWrap
              component="a"
              href="#app-bar-with-responsive-menu"
              sx={{
                mr: 2,
                display: { xs: "flex", md: "none" },
                flexGrow: 1,
                fontFamily: "monospace",
                fontWeight: 700,
                letterSpacing: ".3rem",
                color: "black",
                textDecoration: "none",
              }}
            >
              Freelance
            </Typography>
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
                    color: page.to === currentPath ? "#0067bc" : "black",
                    borderBottom:
                      page.to === currentPath ? "3px solid #0067bc" : "none",
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
                      backgroundColor: "#0067bc",
                      transition: "left 0.3s ease-in-out",
                    }}
                  />
                </Link>
              ))}
              {/* Login button that opens dialog instead of navigating */}
              <Button
                onClick={handleOpenLoginDialog}
                variant="contained"
                sx={{
                  backgroundColor: "#0067bc",
                  color: "white",
                  "&:hover": {
                    backgroundColor: "#005499",
                  },
                  textTransform: "none",
                  borderRadius: "20px",
                  padding: "6px 16px",
                }}
              >
                Log in
              </Button>
            </Box>

            <Box sx={{ flexGrow: 0 }}>
              <Tooltip title="Open settings">
                <IconButton onClick={handleOpenUserMenu} sx={{ p: 0 }}>
                  <Avatar alt="Remy Sharp" src="/static/images/avatar/2.jpg" />
                </IconButton>
              </Tooltip>
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
                  <MenuItem key={setting} onClick={handleCloseUserMenu}>
                    <Typography textAlign="center">{setting}</Typography>
                  </MenuItem>
                ))}
              </Menu>
            </Box>
          </Toolbar>
        </Container>
        <Box
          sx={{
            bgcolor: "#5D4FC3",
            display: "flex",
            width: "100%",
            justifyContent: "flex-end",
            minHeight: 50,
          }}
        >
          <Grid sx={{ px: 20, alignItems: "center", display: "flex" }}>
            <TextField
              placeholder="Search..."
              variant="standard"
              sx={{
                bgcolor: "white",
                borderRadius: "10px",
                "& .MuiInput-underline:before": {
                  borderBottom: "none",
                },
                "& .MuiInput-underline:after": {
                  borderBottom: "none",
                },
                "& .MuiInput-underline:hover:not(.Mui-disabled):before": {
                  borderBottom: "none",
                },
              }}
              InputProps={{
                style: {
                  height: 40,
                },
                startAdornment: (
                  <InputAdornment position="end">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
        </Box>
      </AppBar>

      <LoginDialog open={loginDialogOpen} onClose={handleCloseLoginDialog} />
    </>
  );
}
export default ResponsiveAppBar;
