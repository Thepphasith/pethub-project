import { Box, Typography } from "@mui/material";

import Logo2 from "../../assets/icons/Fee.png";

import MapOutlinedIcon from "@mui/icons-material/MapOutlined";
import CalendarMonthOutlinedIcon from "@mui/icons-material/CalendarMonthOutlined";
import DoNotDisturbOutlinedIcon from "@mui/icons-material/DoNotDisturbOutlined";
import FavoriteBorderOutlinedIcon from "@mui/icons-material/FavoriteBorderOutlined";

const CardJob = () => {
  return (
    <Box
    onClick={() => {console.log("click")}}
      sx={{
        maxWidth: 374,
        p: 2,
        borderRadius: 5,
        bgcolor: "white",
        width: "100%",
         cursor: "pointer"
      }}
    >
      <Box>
        <Box sx={{ display: "flex", flexDirection: "row", gap: 3 }}>
          <Box
            sx={{
              width: 50,
              height: 50,
              borderRadius: 2,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              border: "1px solid gray",
            }}
          >
            <img
              style={{ borderRadius: 10 }}
              width={40}
              height={40}
              src={Logo2}
              alt=""
            />
          </Box>

          <Box>
            <Typography fontSize={16} fontWeight={600}>
              Fee Seato
            </Typography>

            <Typography fontSize={13}>1day ago</Typography>
          </Box>
        </Box>

        <Box sx={{ mt: 2 }}>
          <Typography fontSize={16} fontWeight={700}>
            Blog
          </Typography>
        </Box>

        <Box sx={{ mt: 1, display: "flex", flexDirection: "row", gap: 0.5 }}>
          <Typography>vietiane compony of ssk and neerada</Typography>
        </Box>

        <Box sx={{ mt: 1, display: "flex", flexDirection: "row", gap: 0.5 }}>
          <Box>
            <CalendarMonthOutlinedIcon
              sx={{ color: "#707070", fontSize: 16 }}
            />
          </Box>

          <Typography>01/Jun/2024 - 01/Dec/2024</Typography>
        </Box>
      </Box>

      <Box sx={{ mt: 2, borderTop: "1px solid whitesmoke" }}>
        <Box sx={{ display: "flex", justifyContent: "space-between", mt: 1 }}>

          <Box
            sx={{ display: "flex", alignItems: "center", cursor: "pointer" }}
            onClick={() => {}}
          >
            <FavoriteBorderOutlinedIcon fontSize="small" />
            <Typography variant="body2" sx={{ ml: 1 }}>
              Favorite
            </Typography>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default CardJob;
