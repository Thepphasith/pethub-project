import {
  Box,
  Grid,
  InputAdornment,
  MenuItem,
  styled,
  TextField,
} from "@mui/material";

import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import SearchOutlinedIcon from "@mui/icons-material/SearchOutlined";
import ButtonSearch from "./ButtonSearch";

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
  { value: "developer", label: "Developer" },
  { value: "designer", label: "Designer" },
  { value: "manager", label: "Manager" },
  { value: "analyst", label: "Analyst" },
  { value: "administrator", label: "Administrator" },
];

const TextFieldSearchJob = () => {
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
              placeholder="Job Title"
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
              defaultValue="developer"
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

                <TextField placeholder="Job Title" fullWidth />
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

      <Box sx={{ width: "100%", maxWidth: 1300 }}>
        <ButtonSearch />
      </Box>
    </Box>
  );
};

export default TextFieldSearchJob;
