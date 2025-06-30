import { Box } from "@mui/material";
import { Outlet } from "react-router-dom";
import ResponsiveAppBar from "./header";
import Footer from "./footer";

export default function MainLayout() {
  return (
    <Box 
      sx={{ 
        display: "flex", 
        flexDirection: "column", 
        minHeight: "100vh",
        backgroundColor: "#f8f9fa" // Light background for modern feel
      }}
    >
      <ResponsiveAppBar />
      
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          width: "100%",
          maxWidth: "1440px", // Controlled maximum width for large screens
          marginX: "auto",
          paddingX: { xs: 2, sm: 3, md: 4 }, // Responsive padding
          paddingY: { xs: 2, md: 3 },
          display: "flex",
          flexDirection: "column"
        }}
      >
        <Outlet />
      </Box>
      
      <Footer />
    </Box>
  );
}