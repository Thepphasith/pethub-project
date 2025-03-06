import { Box, Button, Grid, Skeleton, Typography } from "@mui/material";
import CardJob from "../../cardCustom/cardJob";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";

const FindJobPage = () => {
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    // Simulate loading data
    setTimeout(() => {
      setLoading(false);
    }, 1000); // Simulate a 1-second loading time
  }, []);

  return (
    <Box
      sx={{
        mt: 2,
        minHeight: "50px",
        background: "linear-gradient(0deg, #fff, #e6f3ff)",
        mb: 2,
      }}
    >
      <Box sx={{ pt: 3 }}>
        <Typography variant="h5" textAlign={"center"}>
          Blog
        </Typography>
      </Box>
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        {loading ? (
          <Box
            sx={{
              display: "flex",
              flexDirection: "row",
              overflowX: "auto",
              gap: 2,
            }}
          >
            <Box sx={{ padding: 1, flexShrink: 0 }}>
              <Skeleton
                sx={{ borderRadius: 5 }}
                animation="wave"
                variant="rectangular"
                width={1300}
                height={400}
              />
            </Box>
          </Box>
        ) : (
          <Grid
            container
            spacing={3} // Space between Grid items
            sx={{
              maxWidth: 1300,
              width: "100%",
              gap: 5, // Space between items in the Grid
              mt: 5, // Margin-top
              display: "flex",
              justifyContent: "center",
            }}
          >
            {/* Repeat CardJob component as needed */}
            {[...Array(6)].map((_, index) => (
              <Grid
                sx={{ my: 3 }}
                item
                xs={12}
                sm={6}
                md={4}
                lg={3}
                key={index}
              >
                <CardJob />
              </Grid>
            ))}
          </Grid>
        )}
        <Box sx={{display: "flex", justifyContent: "center" }}>
          <Button variant="outlined">
             See more
          </Button>
        </Box>
      </Box>
    </Box>
  );
};


export default FindJobPage;
