  import React, { useState, useEffect } from "react";
  import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    TextField,
    Box,
    Typography,
    InputAdornment,
    Stack,
    IconButton,
    Chip,
    Divider,
    useMediaQuery,
    useTheme,
    Grid,
    CircularProgress,
    Snackbar,
    Alert
  } from "@mui/material";
  import {
    CalendarMonth,
    AccessTime,
    LocationOn,
    Map,
    Close,
    ChevronRight,
    Pets
  } from "@mui/icons-material";
  import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
  import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
  import { DateCalendar } from "@mui/x-date-pickers/DateCalendar";
  import { TimeClock } from "@mui/x-date-pickers/TimeClock";
  import dayjs, { Dayjs } from "dayjs";
  import axiosInstance from "../../configs/axios";

  interface MeetupDetails {
    date: Dayjs | null;
    time: Dayjs | null;
    location: string;
    mapLink: string;
  }

  interface MeetupApiPayload {
    petId: string;
    adoptId: string;
    locationDetails: string;
    scheduledDateTime: string;
    link: string;
    status: string;
  }

  interface MeetupDialogProps {
    open: boolean;
    onClose: () => void;
    petName?: string;
    petType?: string;
  }

  const MeetupDialog: React.FC<MeetupDialogProps> = ({
    open,
    onClose,
    petName = "",
    petType = ""
  }) => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
    
    // State for IDs from localStorage
    const [adoptId, setAdoptId] = useState<string>("");
    const [petId, setPetId] = useState<string>("");
    const [userRole, setUserRole] = useState<string>("");
    
    // Define today outside of the component or inside useEffect to avoid dependency issues
    const getDefaultDate = () => dayjs();
    const getDefaultTime = () => dayjs().set('hour', 12).startOf('hour');
    
    const [meetupDetails, setMeetupDetails] = useState<MeetupDetails>({
      date: getDefaultDate(),
      time: getDefaultTime(),
      location: "",
      mapLink: ""
    });
    
    const [formErrors, setFormErrors] = useState({
      date: false,
      time: false,
      location: false
    });

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [snackbar, setSnackbar] = useState<{
      open: boolean;
      message: string;
      severity: "success" | "error" | "info";
    }>({
      open: false,
      message: "",
      severity: "info"
    });
    
    // Get IDs from localStorage when dialog opens
    useEffect(() => {
      if (open) {
        // Retrieve data from localStorage
        const storedAdoptId = localStorage.getItem('selectedAdoptId') || "";
        const storedPetId = localStorage.getItem('selectedPetId') || "";
        const storedRole = localStorage.getItem('meetupRole') || "";
        
        // Update state with stored values
        setAdoptId(storedAdoptId);
        setPetId(storedPetId);
        setUserRole(storedRole);
        
        // Reset form
        setMeetupDetails({
          date: getDefaultDate(),
          time: getDefaultTime(),
          location: "",
          mapLink: ""
        });
        setFormErrors({
          date: false,
          time: false,
          location: false
        });
        setIsSubmitting(false);
        
        // Log values for debugging
        console.log("Retrieved from localStorage:", {
          adoptId: storedAdoptId,
          petId: storedPetId,
          role: storedRole
        });
      }
    }, [open]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const { name, value } = e.target;
      setMeetupDetails(prev => ({
        ...prev,
        [name]: value
      }));
      
      // Clear error when user types
      if (name in formErrors) {
        setFormErrors(prev => ({
          ...prev,
          [name]: false
        }));
      }
    };

    const handleDateChange = (newDate: Dayjs | null) => {
      setMeetupDetails(prev => ({
        ...prev,
        date: newDate
      }));
      setFormErrors(prev => ({
        ...prev,
        date: false
      }));
    };

    const handleTimeChange = (newTime: Dayjs | null) => {
      setMeetupDetails(prev => ({
        ...prev,
        time: newTime
      }));
      setFormErrors(prev => ({
        ...prev,
        time: false
      }));
    };

    const validateForm = (): boolean => {
      const errors = {
        date: !meetupDetails.date,
        time: !meetupDetails.time,
        location: !meetupDetails.location.trim()
      };
      
      setFormErrors(errors);
      return !Object.values(errors).some(error => error);
    };

    // Combine date and time into a single ISO string
    const getScheduledDateTime = (): string => {
      if (!meetupDetails.date || !meetupDetails.time) {
        return "";
      }
      
      // Create a new date with the date from meetupDetails.date and time from meetupDetails.time
      const combinedDateTime = dayjs(meetupDetails.date)
        .hour(meetupDetails.time.hour())
        .minute(meetupDetails.time.minute())
        .second(0)
        .millisecond(0);
        
      return combinedDateTime.toISOString();
    };

    // Function to create payload for API
    const createApiPayload = (): MeetupApiPayload => {
      // Determine which ID to send based on user role
      let finalPetId = "";
      let finalAdoptId = "";
      
      if (userRole === "buyer") {
        // Buyer sends petId only
        finalPetId = petId;
        finalAdoptId = ""; // Don't send adoptId
        console.log("Creating payload as buyer - sending petId only");
      } else if (userRole === "seller") {
        // Seller sends adoptId only
        finalPetId = ""; // Don't send petId
        finalAdoptId = adoptId;
        console.log("Creating payload as seller - sending adoptId only");
      } else {
        // If role is not specified, send both (fallback)
        finalPetId = petId;
        finalAdoptId = adoptId;
        console.log("Role not specified - sending both IDs as fallback");
      }
      
      // Validate the appropriate ID is available
      if ((userRole === "ຜູ້ຊື້" && !finalPetId) || 
          (userRole === "ຜູ້ຂາຍ" && !finalAdoptId) ||
          (!userRole && (!finalPetId || !finalAdoptId))) {
        console.error("Missing required ID for API payload:", { 
          role: userRole, 
          petId: finalPetId,
          adoptId: finalAdoptId
        });
      }
      
      return {
        petId: finalPetId,
        adoptId: finalAdoptId,
        locationDetails: meetupDetails.location,
        scheduledDateTime: getScheduledDateTime(),
        link: meetupDetails.mapLink || "",
        status: "PENDING"
      };
    };

    // Function to send data to API using Axios
    const createMeetup = async (payload: MeetupApiPayload): Promise<boolean> => {
      try {
        console.log("Sending meetup payload:", payload);
        
        const response = await axiosInstance.post('/meet-up', payload, {
          headers: {
            'Content-Type': 'application/json',
          }
        });
        
        // Axios automatically throws for error status codes,
        // but we'll check anyway for clarity
        if (response.status >= 200 && response.status < 300) {
          return true;
        } else {
          throw new Error(`API error: ${response.status}`);
        }
      } catch (error) {
        console.error('Error creating meetup:', error);
        return false;
      }
    };

    const handleSubmit = async () => {
      if (!validateForm()) {
        return;
      }
      
      // Check if we have at least one of the required IDs based on role
      let hasRequiredId = false;
      
      if (userRole === "buyer") {
        // Buyer needs petId
        hasRequiredId = Boolean(petId);
        if (!hasRequiredId) {
          setSnackbar({
            open: true,
            message: "Missing pet information. Please try again.",
            severity: "error"
          });
        }
      } else if (userRole === "seller") {
        // Seller needs adoptId
        hasRequiredId = Boolean(adoptId);
        if (!hasRequiredId) {
          setSnackbar({
            open: true,
            message: "Missing adoption information. Please try again.",
            severity: "error"
          });
        }
      } else {
        // If no role, require both (fallback)
        hasRequiredId = Boolean(petId && adoptId);
        if (!hasRequiredId) {
          setSnackbar({
            open: true,
            message: "Missing required information. Please try again.",
            severity: "error"
          });
        }
      }
      
      if (!hasRequiredId) {
        return;
      }
      
      setIsSubmitting(true);
      
      const payload = createApiPayload();
      console.log("Submitting payload:", payload);
      const success = await createMeetup(payload);
      
      if (success) {
        setSnackbar({
          open: true,
          message: "Meet-up scheduled successfully!",
          severity: "success"
        });
        // Allow the success message to be visible briefly before closing
        setTimeout(() => {
          // Clear localStorage after successful submission
          localStorage.removeItem('selectedAdoptId');
          localStorage.removeItem('selectedPetId');
          localStorage.removeItem('meetupRole');
          onClose();
        }, 1500);
      } else {
        setSnackbar({
          open: true,
          message: "Failed to schedule meet-up. Please try again.",
          severity: "error"
        });
        setIsSubmitting(false);
      }
    };

    const handleSnackbarClose = () => {
      setSnackbar(prev => ({
        ...prev,
        open: false
      }));
    };

    const formatMeetingDateTime = () => {
      if (!meetupDetails.date || !meetupDetails.time) return "";
      
      const date = meetupDetails.date.format("dddd, MMMM D, YYYY");
      const time = meetupDetails.time.format("h:mm A");
      
      return `${date} at ${time}`;
    }

    // Calculate maximal hours based on day selection
    const isToday = meetupDetails.date?.isSame(dayjs(), 'day');
    const minTime = isToday ? dayjs() : undefined;
    const maxTime = dayjs().set('hour', 20).startOf('hour'); // Limit to 8 PM

    // Get dialog title based on user role
    const getDialogTitle = () => {
      if (userRole === "seller") {
        return "ຈັດຕາຕະລາງນັດພົບ (ໃນຖານະຜູ້ຂາຍ)";
      } else if (userRole === "buyer") {
        return "ຈັດຕາຕະລາງນັດພົບ (ໃນຖານະຜູ້ຊື້)";
      }
      return "ຈັດຕາຕະລາງນັດພົບ";
    };

    // Validate if form can be submitted based on available data and role
    const canSubmit = Boolean(
      meetupDetails.date && 
      meetupDetails.time && 
      meetupDetails.location && 
      (
        (userRole === "buyer" && petId) || 
        (userRole === "seller" && adoptId) || 
        (userRole === "" && petId && adoptId)
      )
    );

    return (
      <>
        <Dialog
          open={open}
          onClose={onClose}
          fullScreen={isMobile}
          PaperProps={{
            elevation: 3,
            sx: {
              borderRadius: isMobile ? 0 : 3,
              width: "100%",
              maxWidth: 800,
              overflow: "hidden"
            }
          }}
        >
          <Box sx={{ 
            display: "flex", 
            justifyContent: "space-between",
            alignItems: "center",
            backgroundColor: theme.palette.primary.main,
            color: "white",
            px: 3,
            py: 2
          }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              {petType && (
                <Pets fontSize="small" />
              )}
              <DialogTitle sx={{ 
                p: 0,
                fontSize: { xs: "1.25rem", sm: "1.5rem" },
                fontWeight: 600
              }}>
                {getDialogTitle()}
              </DialogTitle>
            </Box>
            <IconButton 
              onClick={onClose} 
              sx={{ color: "white" }}
              aria-label="close dialog"
              disabled={isSubmitting}
            >
              <Close />
            </IconButton>
          </Box>

          {petName && (
            <Box sx={{ 
              px: 3,
              py: 2,
              backgroundColor: theme.palette.grey[50],
              borderBottom: `1px solid ${theme.palette.divider}`
            }}>
              <Chip 
                label={`For ${petName}`}
                color="primary"
                variant="outlined"
                sx={{ borderRadius: 1.5, fontWeight: 500 }}
              />
            </Box>
          )}

          {((userRole === "buyer" && !petId) || 
            (userRole === "seller" && !adoptId) ||
            (userRole === "" && (!petId || !adoptId))) && (
            <Box sx={{ 
              px: 3,
              py: 2,
              backgroundColor: "#fff3cd", // Warning background
              borderBottom: `1px solid ${theme.palette.divider}`
            }}>
              <Typography color="warning.dark">
                {userRole === "buyer" && !petId
                  ? "ຂໍ້ມູນສັດລ້ຽງບໍ່ຄົບຖ້ວນທີ່ຕ້ອງການສຳລັບການນັດພົບຂອງຜູ້ຊື້."
                  : userRole === "seller" && !adoptId
                    ? "Missing adoption information required for seller meetup request."
                    : userRole === "" && !petId && !adoptId
                      ? "Missing both pet and adoption information."
                      : userRole === "" && !petId
                        ? "Missing pet information."
                        : "Missing adoption information."}
              </Typography>
            </Box>
          )}

          <DialogContent sx={{ px: { xs: 2, sm: 3 }, py: 3 }}>
            <Stack spacing={3}>
              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <Grid
                  container
                  columns={{ xs: 1, md: 2 }}
                  spacing={4}
                  alignItems="center"
                  justifyContent="center"
                >
                  <Grid item xs={1} md={1}>
                    <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 1, display: "flex", alignItems: "center", gap: 1 }}>
                      <CalendarMonth fontSize="small" color="primary" /> 
                      Select Date
                    </Typography>
                    <Box sx={{ 
                      display: "flex", 
                      justifyContent: "center", 
                      border: formErrors.date ? `1px solid ${theme.palette.error.main}` : `1px solid ${theme.palette.divider}`,
                      borderRadius: 2,
                      p: 1
                    }}>
                      <DateCalendar 
                        value={meetupDetails.date} 
                        onChange={handleDateChange} 
                        disablePast
                        disabled={isSubmitting}
                      />
                    </Box>
                    {formErrors.date && (
                      <Typography variant="caption" color="error" sx={{ mt: 0.5, ml: 2 }}>
                        Please select a date
                      </Typography>
                    )}
                  </Grid>
                  
                  <Grid item xs={1} md={1}>
                    <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 1, display: "flex", alignItems: "center", gap: 1 }}>
                      <AccessTime fontSize="small" color="primary" /> 
                      Select Time
                    </Typography>
                    <Box sx={{ 
                      display: "flex", 
                      justifyContent: "center", 
                      border: formErrors.time ? `1px solid ${theme.palette.error.main}` : `1px solid ${theme.palette.divider}`,
                      borderRadius: 2,
                      p: 1
                    }}>
                      <TimeClock 
                        value={meetupDetails.time} 
                        onChange={handleTimeChange}
                        minTime={minTime}
                        maxTime={maxTime}
                        ampm
                        disabled={isSubmitting}
                      />
                    </Box>
                    {formErrors.time && (
                      <Typography variant="caption" color="error" sx={{ mt: 0.5, ml: 2 }}>
                        Please select a time
                      </Typography>
                    )}
                  </Grid>
                </Grid>
              </LocalizationProvider>

              {meetupDetails.date && meetupDetails.time && (
                <Box sx={{ 
                  mt: 2, 
                  p: 2, 
                  backgroundColor: theme.palette.primary.light,
                  color: theme.palette.primary.contrastText,
                  borderRadius: 2,
                  display: "flex",
                  alignItems: "center",
                  gap: 1
                }}>
                  <CalendarMonth fontSize="small" />
                  <Typography>
                    Meeting scheduled for {formatMeetingDateTime()}
                  </Typography>
                </Box>
              )}

              <Divider />

              <Box>
                <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 1, display: "flex", alignItems: "center", gap: 1 }}>
                  <LocationOn fontSize="small" color="primary" /> 
                  Meeting Location
                </Typography>
                <TextField
                  fullWidth
                  name="location"
                  placeholder="Enter location details"
                  value={meetupDetails.location}
                  onChange={handleInputChange}
                  error={formErrors.location}
                  helperText={formErrors.location ? "Please enter a location" : null}
                  disabled={isSubmitting}
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      borderRadius: 2,
                    }
                  }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <LocationOn color="action" />
                      </InputAdornment>
                    )
                  }}
                />
              </Box>

              <Box>
                <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 1, display: "flex", alignItems: "center", gap: 1 }}>
                  <Map fontSize="small" color="primary" /> 
                  Map Link (Optional)
                </Typography>
                <TextField
                  fullWidth
                  name="mapLink"
                  placeholder="Add a map link (Google Maps, etc.)"
                  value={meetupDetails.mapLink}
                  onChange={handleInputChange}
                  disabled={isSubmitting}
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      borderRadius: 2,
                    }
                  }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Map color="action" />
                      </InputAdornment>
                    )
                  }}
                />
              </Box>
            </Stack>
          </DialogContent>

          <DialogActions sx={{ 
            px: 3, 
            py: 3, 
            justifyContent: "flex-end", 
            gap: 2,
            borderTop: `1px solid ${theme.palette.divider}`,
            backgroundColor: theme.palette.grey[50]
          }}>
            <Button
              variant="outlined"
              onClick={onClose}
              disabled={isSubmitting}
              sx={{
                borderRadius: 2,
                px: 3,
                py: 1,
                fontWeight: 500
              }}
            >
              Cancel
            </Button>
            <Button
              variant="contained"
              onClick={handleSubmit}
              disabled={isSubmitting || !canSubmit}
              endIcon={isSubmitting ? <CircularProgress size={20} color="inherit" /> : <ChevronRight />}
              sx={{
                borderRadius: 2,
                px: 3,
                py: 1,
                fontWeight: 600,
                boxShadow: 2
              }}
            >
              {isSubmitting ? "Scheduling..." : "Schedule Meet-up"}
            </Button>
          </DialogActions>
        </Dialog>

        <Snackbar 
          open={snackbar.open} 
          autoHideDuration={6000} 
          onClose={handleSnackbarClose}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        >
          <Alert 
            onClose={handleSnackbarClose} 
            severity={snackbar.severity}
            sx={{ width: '100%' }}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>
      </>
    );
  };

  export default MeetupDialog;