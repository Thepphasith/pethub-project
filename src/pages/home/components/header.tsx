import { Box, Typography, Button, Grid, Container } from "@mui/material";
import ICONS from "../../../assets/icons/petHome.png";
const HeaderPAge = () => {
  return (
    <Container maxWidth="lg">
      <Grid
        container
        spacing={4}
        alignItems="center"
        sx={{
          py: 4, // Add vertical padding
          minHeight: "70vh",
        }}
      >
        {/* Text Column */}
        <Grid
          item
          xs={12}
          md={6}
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <Box
            sx={{
              maxWidth: 500,
              width: "100%",
            }}
          >
            <Typography
              variant="h2"
              component="h1"
              textAlign={"center"}
              sx={{
                fontWeight: "bold",
                color: "text.primary",
                mb: 2,
              }}
            >
              Give a New Life To
            </Typography>
            <Typography
              variant="h4"
              component="h2"
              textAlign={"center"}
              sx={{
                color: "primary.main",
                mb: 2,
              }}
            >
              <span style={{ color: "purple" }}>Furry</span> Friends
            </Typography>
          </Box>

          <Typography
            variant="body1"
            sx={{
              color: "text.secondary",
              mb: 2,
              width: "65%",
              justifyContent: "center",
            }}
          >
            We are a non-profit organization that aims to provide a safe and
            loving home to animals in need. Our mission is to help animals find
            forever homes and to provide them with the care and attention they
            deserve.
          </Typography>

          <Box
            sx={{
              display: "flex",
              justifyContent: "Space-between",
              gap: 8,
              mt: 2,
            }}
          >
            <Button
              variant="contained"
              sx={{ textTransform: "none", px: 5, height: 48 }}
              color="primary"
              size="large"
            >
              Adopt Now
            </Button>
            <Button
              variant="outlined"
              sx={{ textTransform: "none", px: 5, height: 48 }}
              color="primary"
              size="large"
            >
              Learn More
            </Button>
          </Box>
        </Grid>

        {/* Image Column */}
        <Grid
          item
          xs={12}
          md={6}
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <img
            src={ICONS}
            alt="Furry Friends"
            style={{
              maxWidth: "100%",
              height: "auto",
              borderRadius: 2, // Optional: add rounded corners
            }}
          />
        </Grid>
      </Grid>
    </Container>
  );
};

export default HeaderPAge;
