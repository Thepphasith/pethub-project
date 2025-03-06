import { Box, Button, Skeleton, Typography } from "@mui/material";
import CustomCard from "../../cardCustom/CustomCard";

import { useEffect, useRef, useState } from "react";

const RecommendJob = () => {
  const [loading, setLoading] = useState<boolean>(true);
  const scrollContainerRef = useRef<any>(null);

  useEffect(() => {
    // Simulate loading data
    setTimeout(() => {
      setLoading(false);
    }, 1000); // Simulate a 1-second loading time
  }, []);


  useEffect(() => {
    const scrollContainer = scrollContainerRef.current;
    
    if (scrollContainer) {
      const scrollWidth = scrollContainer.scrollWidth;
      const containerWidth = scrollContainer.clientWidth;
      let scrollAmount = 0;

      const scroll = () => {
        scrollAmount += 1;
        if (scrollAmount > scrollWidth - containerWidth) {
          scrollAmount = 0;
        }
        scrollContainer.scrollTo({
          left: scrollAmount,
          behavior: 'smooth',
        });
      };

      const intervalId = setInterval(scroll, 20); // Adjust interval speed for smoother or faster scrolling

      return () => clearInterval(intervalId); // Cleanup interval on component unmount
    }
  }, []);

  return (
    <Box sx={{ minHeight: "auto", mt: 10 }}>
      <Box>
        <Typography variant="h5" textAlign={"center"}>
          Take a Look at Some of Our
        </Typography>
      </Box>

      <Box sx={{ mt: 5, maxWidth: 1300 }}>
        {loading ? (
          <Box
            sx={{ display: "flex", flexDirection: "row", overflowX: "auto" }}
          >
            {[...Array(3)].map((_, index) => (
              <Box key={index} sx={{ padding: 1, minWidth: 200 }}>
                <Skeleton
                  sx={{ borderRadius: 5 }}
                  animation="wave"
                  variant="rectangular"
                  width={400}
                  height={400}
                />
              </Box>
            ))}
          </Box>
        ) : (
          <Box
            ref={scrollContainerRef}
            sx={{
              display: "flex",
              justifyContent: "center",
              flexDirection: "row",
              overflowX: "auto",
              overflowY: "hidden",
              whiteSpace: "nowrap",
              paddingBottom: "1rem",
              "&::-webkit-scrollbar": {
                width: 0,
                height: 0,
                backgroundColor: "transparent",
              },
              gap: 3,
            }}
          >
            {[...Array(8)].map((_, index) => (
              <Box key={index}>
                <CustomCard />
              </Box>
            ))}
          </Box>
        )}
      </Box>
      <Box sx={{ display: "flex", justifyContent: "center" }}>
        <Button
          variant="outlined"
          sx={{
            textTransform: "none",
            px: 5,
            height: 48,
            color: "#675BCB",
            borderColor: "#675BCB",
          }}
        >
          See more
        </Button>
      </Box>
    </Box>
  );
};


export default RecommendJob;
