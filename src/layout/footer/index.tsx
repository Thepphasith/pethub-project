import React from "react";
import {
  Box,
  Container,
  Typography,
  TextField,
  Button,
  Grid,
  Link,
  IconButton,
  Stack,
} from "@mui/material";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import PhoneIcon from "@mui/icons-material/Phone";
import EmailIcon from "@mui/icons-material/Email";
import FacebookIcon from "@mui/icons-material/Facebook";
import PinterestIcon from "@mui/icons-material/Pinterest";
import TwitterIcon from "@mui/icons-material/Twitter";
import InstagramIcon from "@mui/icons-material/Instagram";
import YouTubeIcon from "@mui/icons-material/YouTube";

// Define colors
const FOOTER_PURPLE = "#6247aa";

const Footer = () => {

  return (
    <Box component="footer">
      {/* Main Footer */}
      <Box
        sx={{
          bgcolor: "background.paper",
          pt: 5,
          pb: 5,
          borderTop: "2px solid",
          borderColor: FOOTER_PURPLE,
        }}
      >
        <Container maxWidth="lg">
          <Grid container spacing={4}>
            {/* Help Column */}
            <Grid item xs={12} md={4}>
              <Typography
                variant="h6"
                color="primary"
                sx={{
                  mb: 2,
                  fontWeight: 600,
                }}
              >
                How Can We Help?
              </Typography>
              <Stack spacing={1}>
                <Link href="/adopt" color="textPrimary" underline="hover">
                  Adopt a pet
                </Link>
                <Link href="/rehome" color="textPrimary" underline="hover">
                  Rehome a pet
                </Link>
                <Link href="/adopt-faq" color="textPrimary" underline="hover">
                  Adopt FAQ's
                </Link>
                <Link href="/rehome-faq" color="textPrimary" underline="hover">
                  Rehome FAQ's
                </Link>
              </Stack>
            </Grid>

            {/* Contact Column */}
            <Grid item xs={12} md={4}>
              <Typography
                variant="h6"
                color="primary"
                sx={{
                  mb: 2,
                  fontWeight: 600,
                }}
              >
                Contact Us
              </Typography>
              <Stack spacing={2}>
                <Box sx={{ display: "flex", alignItems: "flex-start" }}>
                  <LocationOnIcon color="primary" sx={{ mr: 1 }} />
                  <Typography variant="body1">
                    123 Main Street, Anytown,USA
                  </Typography>
                </Box>
                <Box sx={{ display: "flex", alignItems: "center" }}>
                  <PhoneIcon color="primary" sx={{ mr: 1 }} />
                  <Typography variant="body1">+1 (555) 123-4567</Typography>
                </Box>
                <Box sx={{ display: "flex", alignItems: "center" }}>
                  <EmailIcon color="primary" sx={{ mr: 1 }} />
                  <Typography variant="body1">
                    FurryFriendsSupport@gmail.com
                  </Typography>
                </Box>
              </Stack>
            </Grid>

            {/* Newsletter Column */}
            <Grid item xs={12} md={4}>
              <Typography
                variant="h6"
                color="primary"
                sx={{
                  mb: 2,
                  fontWeight: 600,
                }}
              >
                Keep In Touch With Us
              </Typography>
              <Typography variant="body1" sx={{ mb: 2 }}>
                Join the FurryFriends magazine and be first to hear about news
              </Typography>
              <Box
                component="form"
                sx={{
                  display: "flex",
                  flexDirection: { xs: "column", sm: "row" },
                  gap: 1,
                }}
              >
                <TextField
                  placeholder="E-mail Address"
                  size="small"
                  fullWidth
                  variant="outlined"
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      borderRadius: 1,
                    },
                  }}
                />
                <Button
                  variant="contained"
                  color="primary"
                  sx={{
                    borderRadius: 1,
                    whiteSpace: "nowrap",
                    px: 3,
                  }}
                >
                  Subscribe
                </Button>
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Social Media Bar */}
      <Box
        sx={{
          bgcolor: FOOTER_PURPLE,
          py: 2,
          px: 3,
          color: "white",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: { xs: "wrap", sm: "nowrap" },
          gap: 2,
        }}
      >
        <Typography variant="body2">©2024 Furryfriends.com</Typography>
        <Stack direction="row" spacing={1}>
          <IconButton size="small" sx={{ color: "white" }}>
            <FacebookIcon fontSize="small" />
          </IconButton>
          <IconButton size="small" sx={{ color: "white" }}>
            <PinterestIcon fontSize="small" />
          </IconButton>
          <IconButton size="small" sx={{ color: "white" }}>
            <TwitterIcon fontSize="small" />
          </IconButton>
          <IconButton size="small" sx={{ color: "white" }}>
            <InstagramIcon fontSize="small" />
          </IconButton>
          <IconButton size="small" sx={{ color: "white" }}>
            <YouTubeIcon fontSize="small" />
          </IconButton>
        </Stack>
      </Box>
    </Box>
  );
};

export default Footer;
