import { 
  Box, 
  Typography, 
  Button, 
  Grid, 
  Container,
  useTheme,
  useMediaQuery,
  Fade,
  Paper,
  Stack
} from "@mui/material";
import ICONS from "../../../assets/icons/petHome.png";
import PetsIcon from "@mui/icons-material/Pets";
import HomeIcon from "@mui/icons-material/Home";
import VolunteerActivismIcon from "@mui/icons-material/VolunteerActivism";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";

const HeaderPage = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  
  // Stats for the stats section
  const stats = [
    { count: "2500+", label: "Pets Adopted" },
    { count: "150+", label: "Partner Shelters" },
    { count: "50K+", label: "Happy Families" }
  ];

  return (
    <Box sx={{ overflow: "hidden", position: "relative" }}>
      {/* Background decorative elements */}
      <Box 
        sx={{ 
          position: "absolute", 
          top: -100, 
          right: -100, 
          width: 200, 
          height: 100, 
          borderRadius: "50%", 
          bgcolor: "rgba(153, 144, 218, 0.1)",
          zIndex: -1
        }} 
      />
      <Box 
        sx={{ 
          position: "absolute", 
          bottom: -50, 
          left: -50, 
          width: 100, 
          height: 100, 
          borderRadius: "50%", 
          bgcolor: "rgba(153, 144, 218, 0.1)",
          zIndex: -1
        }} 
      />

      <Container maxWidth="lg">
        <Grid
          container
          spacing={{ xs: 4, md: 6 }}
          alignItems="center"
          sx={{
            py: { xs: 6, md: 10 },
            minHeight: { xs: "auto", md: "85vh" },
          }}
        >
          {/* Text Column */}
          <Grid
            item
            xs={12}
            md={6}
            sx={{
              order: { xs: 2, md: 1 },
              position: 'relative',
              zIndex: 1,
            }}
          >
            <Fade in={true} timeout={1000}>
              <Box>
                {/* Small accent above title */}
                <Box 
                  sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    mb: 2,
                    animation: 'fadeIn 1s ease-in-out'
                  }}
                >
                  <Box sx={{ width: 40, height: 4, bgcolor: '#9990DA', mr: 2 }} />
                  <Typography 
                    variant="subtitle2" 
                    sx={{ 
                      color: '#9990DA', 
                      fontWeight: 600, 
                      letterSpacing: 1,
                      textTransform: 'uppercase'
                    }}
                  >
                    ຫາໝູ່ດີທີ່ສຸດຂອງທ່ານ
                  </Typography>
                </Box>

                <Typography
                  variant={isMobile ? "h3" : "h2"}
                  component="h1"
                  sx={{
                    fontWeight: 800,
                    color: "text.primary",
                    mb: 2,
                    lineHeight: 1.2,
                  }}
                >
                 ໃຫ້ຊີວິດໃໝ່ກັບ <br />
                  <Box component="span" sx={{ 
                    color: "#9990DA",
                    position: "relative",
                    "&::after": {
                      content: '""',
                      position: "absolute",
                      width: "100%",
                      height: "8px",
                      bottom: "-4px",
                      left: 0,
                      backgroundColor: "rgba(153, 144, 218, 0.2)",
                      zIndex: -1,
                    }
                  }}>
                    Pet-Hub
                  </Box>
                </Typography>

                <Typography
                  variant="body1"
                  sx={{
                    color: "text.secondary",
                    mb: 4,
                    fontSize: "1.1rem",
                    maxWidth: 500,
                    lineHeight: 1.6,
                  }}
                >
             ພວກເຮົາເປັນອົງການບໍ່ຫວັງຜົນກຳໄລທີ່ອຸທິດຕົນເພື່ອເຊື່ອມຕໍ່ເຮືອນທີ່ອົບອຸ່ນດ້ວຍຄວາມຮັກກັບສັດທີ່ຕ້ອງການຄວາມຊ່ວຍເຫຼືອ. ພາລະກິດຂອງພວກເຮົາແມ່ນການສ້າງເຮືອນຖາວອນ ແລະ ຄອບຄົວທີ່ມີຄວາມສຸກຜ່ານການຮັບສັດລ້ຽງດ້ວຍຄວາມເມດຕາ.
                </Typography>

                {/* Action Buttons */}
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mt: 3 }}>
                  <Button
                    variant="contained"
                    startIcon={<HomeIcon />}
                    endIcon={<ArrowForwardIcon />}
                    href="/Sell"
                    sx={{
                      textTransform: "none",
                      px: 4,
                      py: 1.5,
                      fontSize: '1rem',
                      fontWeight: 600,
                      color: "white",
                      bgcolor: "#9990DA",
                      borderRadius: 6,
                      boxShadow: '0 8px 16px rgba(153, 144, 218, 0.2)',
                      "&:hover": {
                        bgcolor: "#8076C8",
                        transform: 'translateY(-2px)',
                        boxShadow: '0 10px 20px rgba(153, 144, 218, 0.3)',
                        transition: 'all 0.3s ease'
                      },
                    }}
                  >
                    ຫາບ້ານໃໝ່ໃຫ້ສັດລ້ຽງ
                  </Button>
                  
                  <Button
                    variant="outlined"
                    startIcon={<PetsIcon />}
                    sx={{
                      textTransform: "none",
                      px: 4,
                      py: 1.5,
                      fontSize: '1rem',
                      fontWeight: 600,
                      color: "#9990DA",
                      borderColor: "#9990DA",
                      borderRadius: 6,
                      borderWidth: 2,
                      "&:hover": {
                        borderColor: "#8076C8",
                        bgcolor: "rgba(153, 144, 218, 0.05)",
                        borderWidth: 2,
                      },
                    }}
                    href="/pet"
                  >
                    ຫາເສັດລ້ຽງ
                  </Button>
                </Stack>

                {/* Feature Pills */}
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mt: 5 }}>
                  {[ 'ສຸຂະພາບສັດລ້ຽງທີ່ໄດ້ຮັບການຢືນຢັນແລ້ວ ', 'ສະໜັບສະໜູນຫຼັງການຮັບລ້ຽງ'].map((feature, index) => (
                    <Paper 
                      key={index} 
                      elevation={0} 
                      sx={{ 
                        px: 2, 
                        py: 1, 
                        borderRadius: 5, 
                        display: 'flex',
                        alignItems: 'center',
                        bgcolor: 'rgba(153, 144, 218, 0.1)',
                        border: '1px solid rgba(153, 144, 218, 0.2)'
                      }}
                    >
                      <Box 
                        sx={{ 
                          width: 8, 
                          height: 8, 
                          borderRadius: '50%', 
                          bgcolor: '#9990DA', 
                          mr: 1 
                        }} 
                      />
                      <Typography variant="body2" fontWeight={500}>
                        {feature}
                      </Typography>
                    </Paper>
                  ))}
                </Box>
              </Box>
            </Fade>
          </Grid>

          {/* Image Column */}
          <Grid
            item
            xs={12}
            md={6}
            sx={{
              order: { xs: 1, md: 2 },
              position: 'relative',
            }}
          >
            <Fade in={true} timeout={1000} style={{ transitionDelay: '300ms' }}>
              <Box sx={{ position: 'relative' }}>
                {/* Decorative element behind image */}
                <Box 
                  sx={{
                    position: 'absolute',
                    width: '80%',
                    height: '80%',
                    right: isMobile ? 10 : -20,
                    bottom: isMobile ? -10 : -20,
                    borderRadius: '50%',
                    background: 'radial-gradient(circle, rgba(153,144,218,0.2) 0%, rgba(153,144,218,0.05) 70%)',
                    zIndex: -1,
                  }}
                />
                
                {/* Main Image */}
                <Box
                  sx={{
                    position: 'relative',
                    borderRadius: 4,
                    overflow: 'hidden',
                    boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
                    transform: 'perspective(1000px) rotateY(-5deg)',
                    transition: 'all 0.5s ease',
                    '&:hover': {
                      transform: 'perspective(1000px) rotateY(0deg)',
                    },
                  }}
                >
                  <img
                    src={ICONS}
                    alt="Pets finding their forever home"
                    style={{
                      width: '100%',
                      height: 'auto',
                      display: 'block',
                    }}
                  />
                  
                  {/* Floating badges */}
                  <Box
                    sx={{
                      position: 'absolute',
                      top: 20,
                      right: 20,
                      background: 'rgba(255,255,255,0.9)',
                      borderRadius: 2,
                      p: 1.5,
                      boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                      display: 'flex',
                      alignItems: 'center',
                    }}
                  >
                    <VolunteerActivismIcon sx={{ color: '#9990DA', mr: 1 }} />
                    <Typography variant="body2" fontWeight="600">
                      100% Non-Profit
                    </Typography>
                  </Box>
                  
                  <Box
                    sx={{
                      position: 'absolute',
                      bottom: 20,
                      left: 20,
                      background: 'rgba(255,255,255,0.9)',
                      borderRadius: 2,
                      p: 1.5,
                      boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                      display: 'flex',
                      alignItems: 'center',
                    }}
                  >
                    <PetsIcon sx={{ color: '#9990DA', mr: 1 }} />
                    <Typography variant="body2" fontWeight="600">
                      Trusted by thousands
                    </Typography>
                  </Box>
                </Box>
              </Box>
            </Fade>
          </Grid>
        </Grid>
        
        {/* Trust Banner */}
        <Box 
          sx={{
            my: 4,
            py: 4,
            borderRadius: 4,
            bgcolor: 'rgba(153, 144, 218, 0.05)',
            border: '1px solid rgba(153, 144, 218, 0.1)',
          }}
        >
          <Typography 
            variant="subtitle2" 
            align="center" 
            fontWeight="600" 
            sx={{ color: 'text.secondary', mb: 3 }}
          >
            ໄດ້ຮັບຄວາມໄວ້ວາງໃຈຈາກບັນດາອົງການສະຫວັດດີການສັດຊັ້ນນຳ 
          </Typography>
          
          <Grid container spacing={2} justifyContent="center">
            {['ASPCA', 'Humane Society', 'Best Friends', 'PetSmart Charities', 'Petco Foundation'].map((partner, index) => (
              <Grid item key={index}>
                <Typography 
                  variant="body1" 
                  sx={{ 
                    color: 'text.disabled',
                    fontWeight: '500',
                    opacity: 0.7,
                  }}
                >
                  {partner}
                </Typography>
              </Grid>
            ))}
          </Grid>
        </Box>
      </Container>
    </Box>
  );
};

export default HeaderPage;