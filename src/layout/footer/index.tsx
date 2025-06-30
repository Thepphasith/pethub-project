import React from "react";
import { Box, Container, Typography, TextField, Button, Grid, IconButton, Stack, useTheme, useMediaQuery } from "@mui/material";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import PhoneIcon from "@mui/icons-material/Phone";
import EmailIcon from "@mui/icons-material/Email";
import FacebookIcon from "@mui/icons-material/Facebook";
import PinterestIcon from "@mui/icons-material/Pinterest";
import TwitterIcon from "@mui/icons-material/Twitter";
import InstagramIcon from "@mui/icons-material/Instagram";
import YouTubeIcon from "@mui/icons-material/YouTube";
import { styled } from "@mui/material/styles";

// Modern color palette
const colors = {
  primary: "#7E57C2", // Modern purple
  secondary: "#5E35B1", // Darker purple for accents
  light: "#EDE7F6", // Light purple/lavender for backgrounds
  dark: "#4527A0", // Deep purple for contrast
  text: "#37474F", // Dark bluish gray for text
};

// Styled components for modern look
const StyledFooter = styled(Box)(({ theme }) => ({
  borderTop: `1px solid ${colors.light}`,
  backgroundColor: "#fff",
  position: "relative",
  overflow: "hidden",
  "& .gradient-overlay": {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: "5px",
    background: `linear-gradient(90deg, ${colors.primary} 0%, ${colors.secondary} 100%)`,
  },
}));

const SocialButton = styled(IconButton)(({ theme }) => ({
  color: colors.primary,
  backgroundColor: colors.light,
  transition: "all 0.3s ease",
  "&:hover": {
    backgroundColor: colors.primary,
    color: "#fff",
    transform: "translateY(-3px)",
  },
}));

const Footer = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  return (
    <StyledFooter component="footer">
      <div className="gradient-overlay" />
      
      {/* Main Footer */}
      <Container 
        maxWidth="lg" 
        sx={{
          pt: 6,
          pb: 4,
        }}
      >
        <Grid container spacing={4}>
          {/* Logo and Description */}
          <Grid item xs={12} md={4}>
            <Typography
              variant="h5"
              sx={{
                fontWeight: 700,
                color: colors.primary,
                mb: 2,
                fontFamily: "'Poppins', sans-serif",
              }}
            >
              PetHub
            </Typography>
            <Typography 
              variant="body2" 
              sx={{ 
                mb: 3, 
                color: colors.text,
                maxWidth: "90%",
                lineHeight: 1.7,
              }}
            >
              ສະຖານທີ່ຄົບວົງຈອນສຳລັບທຸກສິ່ງທີ່ສັດລ້ຽງຂອງທ່ານຕ້ອງການ. ການດູແລທີ່ມີຄຸນນະພາບ, ຜະລິດຕະພັນ, ແລະຊຸມຊົນສຳລັບຄົນຮັກສັດລ້ຽງ.
            </Typography>
          </Grid>

          {/* Contact Column */}
          <Grid item xs={12} md={4}>
            <Typography
              variant="h6"
              sx={{
                mb: 3,
                fontWeight: 600,
                color: colors.primary,
                position: "relative",
                "&:after": {
                  content: '""',
                  position: "absolute",
                  bottom: -8,
                  left: 0,
                  width: "40px",
                  height: "3px",
                  backgroundColor: colors.secondary,
                }
              }}
            >
               ຕິດຕໍ່ພວກເຮົາ
            </Typography>
            <Stack spacing={2.5}>
             <Box sx={{ display: "flex", alignItems: "flex-start" }}>
                <LocationOnIcon sx={{ mr: 2, color: colors.primary }} />
                <Typography variant="body2" sx={{ color: colors.text }}>
                  ຖະໜ້າທ່າເດື່ອ, ສີສັດຕະນາກ,<br />ນະຄອນຫຼວງວຽງຈັນ, ປະເທດລາວ
                </Typography>
              </Box>
              <Box sx={{ display: "flex", alignItems: "center" }}>
                <PhoneIcon sx={{ mr: 2, color: colors.primary }} />
                <Typography variant="body2" sx={{ color: colors.text }}>
                  +856 20 54325353
                </Typography>
              </Box>
              <Box sx={{ display: "flex", alignItems: "center" }}>
                <EmailIcon sx={{ mr: 2, color: colors.primary }} />
                <Typography variant="body2" sx={{ color: colors.text }}>
                  hello@pethub.com
                </Typography>
              </Box>
            </Stack>
          </Grid>

          {/* Newsletter Column */}
          <Grid item xs={12} md={4}>
            <Typography
              variant="h6"
              sx={{
                mb: 3,
                fontWeight: 600,
                color: colors.primary,
                position: "relative",
                "&:after": {
                  content: '""',
                  position: "absolute",
                  bottom: -8,
                  left: 0,
                  width: "40px",
                  height: "3px",
                  backgroundColor: colors.secondary,
                }
              }}
            >
             ເຂົ້າຮ່ວມຈົດໝາຍຂ່າວຂອງພວກເຮົາ
            </Typography>
            <Typography variant="body2" sx={{ mb: 2.5, color: colors.text }}>
               ຕິດຕາມຂໍ້ມູນຫຼ້າສຸດກ່ຽວກັບຄຳແນະນຳການດູແລສັດລ້ຽງ, ຂໍ້ສະເໜີພິເສດ ແລະ ເຫດການຊຸມຊົນ
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
                placeholder="ອີເມລຂອງທ່ານ"
                size="small"
                fullWidth
                variant="outlined"
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: "4px",
                    backgroundColor: "#fff",
                    "& fieldset": {
                      borderColor: colors.light,
                    },
                    "&:hover fieldset": {
                      borderColor: colors.primary,
                    },
                  },
                }}
              />
              <Button
                variant="contained"
                disableElevation
                sx={{
                  backgroundColor: colors.primary,
                  borderRadius: "4px",
                  textTransform: "none",
                  fontWeight: 600,
                  "&:hover": {
                    backgroundColor: colors.dark,
                  },
                }}
              >
                Subscribe
              </Button>
            </Box>
          </Grid>
        </Grid>
      </Container>

      {/* Footer Bottom */}
      <Box
        sx={{
          py: 2.5,
          borderTop: `1px solid ${colors.light}`,
          display: "flex",
          flexDirection: isMobile ? "column" : "row",
          justifyContent: "space-between",
          alignItems: isMobile ? "center" : "center",
          gap: 2,
          px: { xs: 2, sm: 3, md: 6 },
        }}
      >
        <Typography variant="body2" sx={{ color: colors.text, opacity: 0.8 }}>
          © 2025 PetHub. All rights reserved.
        </Typography>
        
        <Stack direction="row" spacing={1}>
          <SocialButton size="small">
            <FacebookIcon fontSize="small" />
          </SocialButton>
          <SocialButton size="small">
            <InstagramIcon fontSize="small" />
          </SocialButton>
          <SocialButton size="small">
            <TwitterIcon fontSize="small" />
          </SocialButton>
          <SocialButton size="small">
            <YouTubeIcon fontSize="small" />
          </SocialButton>
          <SocialButton size="small">
            <PinterestIcon fontSize="small" />
          </SocialButton>
        </Stack>
      </Box>
    </StyledFooter>
  );
};

export default Footer;