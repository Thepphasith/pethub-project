import { Box, Card, Typography } from "@mui/material";
import { Link } from "react-router-dom";

import Beerlao from "../../../assets/icons/beerlao.png";
import Foodpan from "../../../assets/icons/FoodPanda.jpg";
import Toa from "../../../assets/icons/TOA.png";

interface CardCustomProps {
    provinceName: string;
  }

  const CardCProvinceCustom: React.FC<CardCustomProps> = ({ provinceName }) => {
  const image = [Beerlao, Foodpan, Toa];

  return (
    <Card
      sx={{
        borderRadius: "1rem",
        boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.2)',
        width: "100%",
        p: 3,
        minHeight: '90px',
        minWidth: 195,
      }}
    >
      <Link to="#" style={{ textDecoration: "none", color: "black" }}>
        <Box>
          <Typography fontWeight={550}>{provinceName}</Typography>

          <p style={{ fontSize: "14px" }}>6 Job Available</p>

          <Box sx={{ display: "flex", flexDirection: "row", gap: 1, mt: 2 }}>
            {image.map((image, index) => (
              <Box
                key={index}
                sx={{
                  width: 40,
                  height: 40,
                  borderRadius: 2,
                  display: "flex",
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: '1px solid gray'
                }}
              >
                <img style={{ borderRadius: 10 }} width={30} height={30} src={image} alt="" />
              </Box> 
            ))}
          </Box>
        </Box>
      </Link>
    </Card>
  );
};

export default CardCProvinceCustom;
