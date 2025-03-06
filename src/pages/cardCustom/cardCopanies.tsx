import { Box, Button, Typography } from "@mui/material";

import LocationOnOutlinedIcon from "@mui/icons-material/LocationOnOutlined";
import WorkOutlineIcon from "@mui/icons-material/WorkOutline";

import Image from "../../assets/icons/image.png";
import Logo1 from "../../assets/icons/TOA.png";


const CardComapanies = () => {
  return (
    <Box
      sx={{
        maxWidth: 350,
        borderRadius: "20px 20px 20px 20px",
        overflow: "hidden",
        mt: 5,
        boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.2)", // Optional: Added box shadow
      }}
    >
      <Box
        sx={{
          backgroundImage: `url(${Image})`,
          height: 130,
          backgroundSize: "cover",
          backgroundPosition: "center",
          display: "flex",
          justifyContent: "center",
        }}
      >
        <Box
          sx={{
            width: 60,
            height: 60,
            borderRadius: 2,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            border: "1px solid gray",
            bgcolor: "white",
            position: "relative",
            top: 105,
          }}
        >
          <img
            style={{ borderRadius: 10 }}
            width={40}
            height={40}
            src={Logo1}
            alt=""
          />
        </Box>
      </Box>

      <Box sx={{ height: 40 }}></Box>

      <Box sx={{ p: 2 }}>
        <Typography textAlign={"center"} fontWeight={700} fontSize={16}>
          TOA Paint(Laos) Sole co.,Ltd
        </Typography>

        <Typography
          textAlign={"center"}
          fontSize={13}
          color="#6E6E73"
          sx={{
            display: "-webkit-box",
            overflow: "hidden",
            textOverflow: "ellipsis",
            WebkitLineClamp: 1,
            WebkitBoxOrient: "vertical",
          }}
        >
          <WorkOutlineIcon sx={{ color: "#6E6E73", fontSize: 16 }} /> Marketing
        </Typography>

        <Typography
          textAlign={"center"}
          fontSize={13}
          color="#6E6E73"
          sx={{
            display: "-webkit-box",
            overflow: "hidden",
            textOverflow: "ellipsis",
            WebkitLineClamp: 1,
            WebkitBoxOrient: "vertical",
          }}
        >
          <LocationOnOutlinedIcon sx={{ color: "#6E6E73", fontSize: 16 }} />{" "}
          Vientiane Province, Oudomxay Province, Bokeo
        </Typography>
      </Box>

      <Box
        sx={{
          minHeight: 80,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Button
          fullWidth
          sx={{
            bgcolor: "#E6F3FF",
            color: "#0067BC",
            minHeight: 50,
            maxWidth: 130,
            borderRadius: 10,
            textTransform: "none",
          }}
        >
          View 3 Jobs
        </Button>
      </Box>
    </Box>
  );
};

export default CardComapanies;
