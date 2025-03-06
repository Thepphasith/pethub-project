import { Box, Button, Card, Chip, IconButton, Stack, Typography } from "@mui/material";
import FavoriteIcon from "@mui/icons-material/Favorite";
import Logo1 from "../../assets/icons/Golden.jpeg";
import LocationOnOutlinedIcon from "@mui/icons-material/LocationOnOutlined";
const CustomCard = () => {
  return (
    <Card
      sx={{
        border: "1px solid gray",
        borderRadius: "18px",
        maxWidth: { xs: 300, md: 400 },
        boxShadow: "inset 0 0 0 1px #e9e7e7,0 2px 20px rgba(0,0,0,.05)",
        width: "288px",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
      }}
    >
      <Box>
        <Box>
          <img
            style={{
              width: "100%",
              maxHeight: 200,
              objectFit: "cover",
            }}
            src={Logo1}
          />
        </Box>

        <Box sx={{ p: "0 15px 15px 15px" }}>
          <Box
            sx={{
              display: "flex",
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <Typography
              fontSize={16}
              fontWeight={600}
              sx={{
                flexGrow: 1,
                alignSelf: "center",
              }}
            >
              Golden
            </Typography>
            <IconButton
              aria-label="add to favorites"
              sx={{
                alignSelf: "center",
              }}
            >
              <FavoriteIcon />
            </IconButton>
          </Box>
          <Box sx={{ mt: 0.5 }}>
            <Typography
              fontSize={16}
              fontWeight={700}
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1, // Adds space between icon and text
              }}
            >
              <LocationOnOutlinedIcon
                sx={{
                  fontSize: 20, // Adjust icon size to match text
                  color: "text.secondary", // Optional: color adjustment
                }}
              />
              Laos
            </Typography>
          </Box>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
            <Stack
              direction="row"
              spacing={2}
              alignItems="center"
              sx={{ width: "100%" }}
            >
              <Typography variant="body1" sx={{ fontWeight: "medium" }}>
                Gender:
              </Typography>
              <Chip
                label="Male"
                size="small"
                color="primary"
                variant="outlined"
              />
              <Typography variant="body1" sx={{ fontWeight: "medium", ml: 2 }}>
                Breed:
              </Typography>
              <Chip
                label="Labrador"
                size="small"
                color="secondary"
                variant="outlined"
              />
            </Stack>
            <Stack
              direction="row"
              spacing={2}
              alignItems="center"
              sx={{ width: "100%" }}
            >
              <Typography variant="body1" sx={{ fontWeight: "medium" }}>
                Age:
              </Typography>
              <Chip label="2" size="small" color="primary" variant="outlined" />
              <Typography variant="body1" sx={{ fontWeight: "medium", ml: 2 }}>
                Size:
              </Typography>
              <Chip
                label="Medium"
                size="small"
                color="secondary"
                variant="outlined"
              />
            </Stack>
          </Box>
          <Box sx={{ mt: 2 }}>
            <Typography
              color={"#6E6E73"}
              fontSize={14}
              fontWeight={700}
              sx={{
                display: "-webkit-box",
                overflow: "hidden",
                textOverflow: "ellipsis",
                WebkitLineClamp: 1,
                WebkitBoxOrient: "vertical",
              }}
            >
              Vientiane Province, Oudomxay Province, Bokeo
            </Typography>

            <Typography
              color={"#6E6E73"}
              fontSize={14}
              fontWeight={700}
              sx={{
                display: "-webkit-box",
                overflow: "hidden",
                textOverflow: "ellipsis",
                WebkitLineClamp: 1,
                WebkitBoxOrient: "vertical",
              }}
            >
              01-Jun-2024 - 01-Dec-2024
            </Typography>
            <Button
              variant="outlined"
              sx={{
                mt: 1,
                color: "#675BCB",
                borderColor: "#675BCB",
                textTransform: "none",
                fontSize: 14,
                display: "flex",
                width: "100%",
              }}
            >
              More Info
            </Button>
          </Box>
        </Box>
      </Box>
    </Card>
  );
};


export default CustomCard;
