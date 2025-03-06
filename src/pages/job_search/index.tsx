import { Box } from "@mui/material";
import TextFieldSearch from "./components/TextFieldSearchJob";

const JobSearchPage = () => {
  return (
    <Box
      sx={{ display: "flex", justifyContent: "center", alignItems: "center", flexDirection: 'column', bgcolor: '#6373b7' }}
    >
      <Box sx={{ width: "100%" }}>
        <TextFieldSearch />
      </Box>
      <Box sx={{ maxWidth: 1300, width: "100%" }}></Box>
    </Box>
  );
};

export default JobSearchPage;
