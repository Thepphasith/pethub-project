import { Box } from "@mui/material"
import PetBlog from "./components/BlogPage";


const PetBlogPage = () => {
  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        bgcolor: "",
      }}
    >
      <Box sx={{ maxWidth: 1300, width: "100%" }}>
        <PetBlog/>
      </Box>
    </Box>
  );
};

export default PetBlogPage;