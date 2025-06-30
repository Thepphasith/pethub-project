import { Box } from "@mui/material";
import PetAdoptionGrid from "./components/Adopt";


const JobSearchPage = () => {
  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        flexDirection: "column",
      }}
    >
      <Box sx={{ width: "100%" }}>
        <PetAdoptionGrid />
      </Box>
      <Box sx={{ maxWidth: 1300, width: "100%" }}></Box>
    </Box>
  );
};


export default JobSearchPage;
