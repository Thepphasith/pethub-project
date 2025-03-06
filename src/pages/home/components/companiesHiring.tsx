import { Box, Skeleton, Typography } from "@mui/material";
import { useEffect, useState } from "react";
import { Navigation, Autoplay, Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/bundle";
import "swiper/css/autoplay";
import { Swiper, SwiperSlide } from "swiper/react";
import CardComapanies from "../../cardCustom/cardCopanies";

const CompaniesHiringPages = () => {
    const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    setTimeout(() => {
      setLoading(false);
    }, 3000);
  }, []);

  const swiperStyle = {
    "--swiper-pagination-color": "blue",
    "--swiper-pagination-bullet-inactive-color": "#D9D9D9",
    "--swiper-pagination-bullet-inactive-opacity": "1",
  };
  return (
    <Box sx={{ minHeight: 600, mt: 5, p: 2 }}>
      <Box>
        <Typography variant="h5" textAlign={"center"}>
          Companies actively hiring
        </Typography>
      </Box>

      <Box
        sx={{
          minWidth: 100,
          overflow: "hidden",
          p: 2,
          mt: 5
        }}
      >
        {loading ? (
          <Skeleton
            variant="rounded"
            width={1250}
            height={500}
            sx={{ borderRadius: "12px" }}
          />
        ) : (
          <Swiper
            modules={[Navigation, Autoplay, Pagination]}
            className="mySwiper"
            autoplay={{ delay: 3000 }}
            slidesPerView={3}
            loop
            style={{
              overflow: "hidden",
              borderRadius: "12px",
              ...swiperStyle,
                minHeight: 'auto',
                top: -50,
                padding: 5
              
            }}
          >
            <SwiperSlide><CardComapanies /></SwiperSlide>
            <SwiperSlide><CardComapanies /></SwiperSlide>
            <SwiperSlide><CardComapanies /></SwiperSlide>
            <SwiperSlide><CardComapanies /></SwiperSlide>
            <SwiperSlide><CardComapanies /></SwiperSlide>
            <SwiperSlide><CardComapanies /></SwiperSlide>
          </Swiper>
        )}
      </Box>
    </Box>
  );
};

export default CompaniesHiringPages;
