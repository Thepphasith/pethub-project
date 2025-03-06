import { Box, Skeleton, Typography } from "@mui/material";
import { useEffect, useState } from "react";
import { Navigation, Autoplay, Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/bundle";
import "swiper/css/autoplay";
import { Swiper, SwiperSlide } from "swiper/react";
import { BannerModel } from "../../../models/banner";
import { getAllBanner } from "../../../services/banners";
import { getFirebaseImage } from "../../../utils/functions/geFirebaseImage";
import { BANNER_ENDPOINT } from "../../../configs/endpoints";

const SponsorPages = () => {
  const [loading, setLoading] = useState<boolean>(true);

  const [data, setData] = useState<BannerModel[]>([]);

  const handleGetData = async () => {
    try {
      setLoading(true)
      const res = await getAllBanner();
      setData(res);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    handleGetData();
  }, []);

  const swiperStyle = {
    "--swiper-pagination-color": "blue",
    "--swiper-pagination-bullet-inactive-color": "#D9D9D9",
    "--swiper-pagination-bullet-inactive-opacity": "1",
  };

  return (
    <Box sx={{ minHeight: "auto", mt: 5 }}>
      <Box>
        <Typography variant="h5" textAlign="center">
          Sponsored Companies
        </Typography>
      </Box>

      <Box
        sx={{
          minWidth: 100,
          overflow: "hidden",
          p: 2,
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
            autoplay={{ delay: 4000 }}
            slidesPerView={1}
            loop
            style={{
              overflow: "hidden",
              borderRadius: "12px",
              ...swiperStyle,
            }}
          >
            {data.map((item, index) => (
              <SwiperSlide
                key={index}
                style={{ width: "100%", height: "100%" }}
              >
                <Box
                  sx={{
                    height: {
                      xs: "186px",
                      sm: "295px",
                      md: "500px",
                    },
                    maxHeight: {
                      xs: "186px",
                      sm: "295px",
                      md: "500px",
                    },
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                    borderRadius: "12px",
                    backgroundImage: `url(${getFirebaseImage(BANNER_ENDPOINT, item?.imageUrl)})`,
                  }}
                />
              </SwiperSlide>
            ))}
          </Swiper>
        )}
      </Box>
    </Box>
  );
};

export default SponsorPages;
