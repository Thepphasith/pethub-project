import { Box, Button, Typography } from "@mui/material";

import AccessibleIcon from "@mui/icons-material/Accessible";

const ButtonList = [
  {
    Label: "Location",
  },

  {
    Label: "Education",
  },

  {
    Label: "Industry",
  },

  {
    Icon: <AccessibleIcon fontSize="small" />,
    Label: "Disable people",
  },
];

const ButtonSearch = () => {
  return (
    <Box
      sx={{
        my: 2,
        display: "flex",
        gap: 2,
        overflowX: "auto",
        whiteSpace: "nowrap",
      }}
    >
      {ButtonList?.map((list) => (
        <Button
          sx={{
            color: "white",
            minHeight: 50,
            minWidth: 150,
            maxWidth: 200,
            borderColor: "white",
            borderRadius: 3,
            textTransform: "none",
            gap: 1,
            fontWeight: 600,
            "&:hover": {
              borderColor: "white",
              color: "white",
            },
          }}
          variant="outlined"
          key={list?.Label}
        >
          {list?.Icon} {list?.Label}
        </Button>
      ))}

      <Typography
        sx={{
          alignContent: "center",
          color: "white",
          fontSize: 12,
          fontWeight: 550,
        }}
      >
        Clear All Filters
      </Typography>
    </Box>
  );
};

export default ButtonSearch;
