import {
  Box,
  Button,
  Grid,
  InputAdornment,
  Menu,
  MenuItem,
  styled,
  TextField,
} from "@mui/material";

import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import SearchOutlinedIcon from "@mui/icons-material/SearchOutlined";
import ArrowDropDownOutlinedIcon from '@mui/icons-material/ArrowDropDownOutlined';

import useMainController from "../controller";

const StyledTextField = styled(TextField)({
  "& .MuiOutlinedInput-root": {
    "& fieldset": {
      borderColor: "transparent", // Set border color to transparent to hide it
    },
    "&:hover fieldset": {
      borderColor: "transparent", // Hide border color on hover
    },
    "&.Mui-focused fieldset": {
      borderColor: "transparent", // Hide border color when focused
    },
  },
});

const jobOptions = [
  { value: "others", label: "Others" },
  { value: "banking", label: "Banking" },
  { value: "logistic", label: "Logistic" },
  { value: "it software & service", label: "It Software & Service" }, 
];

const ButtonList = [
  {
    label: "Company Type",
    icon: <ArrowDropDownOutlinedIcon />,
    options: [
      { label: "All Companies", value: "all_companies" },
      { label: "Hiring Now", value: "hiring_now" },
    ],
  },

  {
    label: "Location",
    options: [
      { label: "Vientiane", value: "vte" },
      { label: "Hiring Now", value: "hiring_now" },
    ],
  },
  // Add more buttons with their options here
];

const TextFieldSearchCompany = () => {
  const ctrl = useMainController();

  const open = Boolean(ctrl.anchorEl);

  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        flexDirection: "column",
        minHeight: 200,
        mt: 3,
        px: 2,
      }}
    >
      <Box
        sx={{
          maxWidth: 1300,
          width: "100%",
          justifyContent: "center",
          alignItems: "center",
          display: "flex",
        }}
      >
        <Grid
          sx={{ bgcolor: "white", borderRadius: 5, px: 2 }}
          container
          direction={{ xs: "column", sm: "row" }}
        >
          <Grid item xs={12} sm={8}>
            <StyledTextField
              type="search"
              fullWidth
              size="medium"
              placeholder="Company Name"
              variant="outlined"
              InputProps={{
                style: {
                  minHeight: 60,
                  backgroundColor: "white",
                },
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchOutlinedIcon fontSize="medium" />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>

          <Grid item xs={12} sm={4}>
            <StyledTextField
              select
              fullWidth
              variant="outlined"
              defaultValue="others"
              InputProps={{
                style: {
                  backgroundColor: "white",
                  minHeight: 60,
                },
              }}
            >
              <Box
                sx={{
                  px: 2,
                  display: "flex",
                  justifyContent: "center",
                  gap: 2,
                  my: 2,
                }}
              >
                <Box sx={{ display: "flex", alignItems: "center" }}>
                  <ArrowBackIcon />
                </Box>

                <TextField placeholder="Industry" fullWidth />
              </Box>
              {jobOptions.map((option) => (
                <MenuItem key={option?.value} value={option?.value}>
                  {option?.label}
                </MenuItem>
              ))}
            </StyledTextField>
          </Grid>
        </Grid>
      </Box>

      <Box
        sx={{
          width: "100%",
          maxWidth: 1300,
          my: 2,
        }}
      >
        <Box
          sx={{ p: 1, width: "100%", maxWidth: 1300, display: "flex", gap: 2 }}
        >
          {ButtonList.map((button) => (
            <Box key={button.label}>
              <Button
              sx={{ textTransform: 'none', color: 'white', border: '1px solid white', minWidth: 160, minHeight: 45 ,width: '100%', fontWeight: 600, borderRadius: 2}}
                onClick={(event) =>
                  ctrl.handleClick(event, button.options, button.label)
                }
                endIcon={button.icon}
              >
                {ctrl.selectedOptions[button.label] || button.label}
              </Button>
              <Menu
                id="simple-menu"
                anchorEl={ctrl.anchorEl}
                open={open && ctrl.currentButtonLabel === button.label}
                onClose={() => ctrl.setAnchorEl(null)}
              >
                {ctrl.menuOptions.map((option: any) => (
                  <MenuItem
                    key={option.value}
                    onClick={() => ctrl.handleClose(option.label)}
                  >
                    {option.label}
                  </MenuItem>
                ))}
              </Menu>
            </Box>
          ))}
        </Box>
      </Box>
    </Box>
  );
};

export default TextFieldSearchCompany;
