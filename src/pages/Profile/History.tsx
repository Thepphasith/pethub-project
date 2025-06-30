import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Avatar,
  Typography,
  Chip,
  TextField,
  InputAdornment,
  Card,
  CardContent,
  Container,
  Button,
  useTheme,
  useMediaQuery,
  CircularProgress,
  Snackbar,
  Alert,
  IconButton
} from "@mui/material";
import {
  Search as SearchIcon,
  FilterAlt as FilterIcon,
  SwapVert as SortIcon,
  Groups as GroupsIcon,
  LocationOn as LocationIcon,
  Pets as PetsIcon,
  CalendarMonth as CalendarIcon,
  MoreVert as MoreVertIcon,
  Refresh as RefreshIcon
} from "@mui/icons-material";
import { format } from "date-fns";
import axiosInstance from "../../configs/axios";

// Interface for meet-up data from API
export interface AdoptionSchedule {
  petId: string;
  locationDetails: string;
  scheduledDateTime: string; // ISO string format like "2021-09-01T00:00:00.000Z"
  status: string; // "PENDING" | "APPROVED" | "REJECTED" 
  amount: number;
  id?: string; // Added for compatibility with the API response
  attendees?: number; // Added for compatibility with the UI
  createdAt?: string; // Added for compatibility with the UI
  updatedAt?: string; // Added for compatibility with the UI
}

// Interface for API response
interface ApiResponse {
  data: AdoptionSchedule[];
  message: string;
  status: number;
  totalMeetUps?: number;
}

const MeetUpsTable: React.FC = () => {
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'));
  
  const [activeFilter, setActiveFilter] = useState<string>("all");
  const [meetUps, setMeetUps] = useState<AdoptionSchedule[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [snackbarOpen, setSnackbarOpen] = useState<boolean>(false);
  const [snackbarMessage, setSnackbarMessage] = useState<string>("");
  const [snackbarSeverity, setSnackbarSeverity] = useState<"error" | "warning" | "info" | "success">("error");
  const [fetchAttempts, setFetchAttempts] = useState<number>(0);
  
  
  // Handle snackbar close
  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };

  useEffect(() => {
    fetchMeetUps();
  }, [fetchAttempts]);

  const fetchMeetUps = async () => {
    try {
      setLoading(true);
      
      const response = await axiosInstance.get('/meet-up');
      
      console.log('API Response:', response);
      
      // Check if the response is valid
      if (response.status === 200 && response.data) {
        // Normalize data based on what's returned from the API
        let meetupsData = response.data;
        
        // Handle different response structures
        if (Array.isArray(response.data)) {
          // If the response is directly an array of meet-ups
          meetupsData = response.data;
        } else if (response.data.data && Array.isArray(response.data.data)) {
          // If the response has a data property that is an array
          meetupsData = response.data.data;
        } else if (typeof response.data === 'object' && !Array.isArray(response.data)) {
          // If response is a single object, convert to array
          meetupsData = [response.data];
        }
        
        // Map the API response to match our AdoptionSchedule interface
        const normalizedData = meetupsData.map((item: any) => ({
          id: item.id || item._id || String(Math.random()),
          petId: item.petId || item.pet || '',
          locationDetails: item.locationDetails || item.location || '',
          scheduledDateTime: item.scheduledDateTime || item.date || new Date().toISOString(),
          status: (item.status || 'PENDING').toUpperCase(),
          amount: item.amount || item.fee || 0,
          attendees: item.attendees || 0,
          createdAt: item.createdAt || new Date().toISOString(),
          updatedAt: item.updatedAt || new Date().toISOString()
        }));
        
        console.log('Normalized data:', normalizedData);
        setMeetUps(normalizedData);
        setSnackbarMessage("Data fetched successfully");
        setSnackbarSeverity("success");
        setSnackbarOpen(true);
      } else {
        throw new Error("Invalid response format");
      }
      
      setLoading(false);
    } catch (err: any) {
      console.error("Error fetching meet-ups:", err);
      
      // Fall back to sample data if API call fails
      const sampleData = [
        {
          id: "sample-id-1",
          petId: "P12345",
          locationDetails: "Ban nongduang (frm 12), Vientiane, Laos",
          scheduledDateTime: "2025-05-24T14:00:00.000Z",
          status: 'PENDING',
          amount: 25.00,
          attendees: 8,
          createdAt: "2025-04-24T18:55:20.433Z",
          updatedAt: "2025-04-24T18:55:20.433Z"
        },
        {
          id: "sample-id-2",
          petId: "P67890",
          locationDetails: "Mekong River Park, Vientiane",
          scheduledDateTime: "2025-05-30T10:00:00.000Z",
          status: 'APPROVED',
          amount: 35.50,
          attendees: 12,
          createdAt: "2025-05-01T04:14:15.398Z",
          updatedAt: "2025-05-01T04:14:15.398Z"
        }
      ];
      
      // Show error message but still display sample data for demonstration
      setError("Could not connect to API. Showing sample data.");
      setMeetUps(sampleData);
      setSnackbarMessage("Error: " + (err.message || "Failed to fetch data"));
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
      setLoading(false);
    }
  };

  // Handle filter change
  const handleFilterChange = (filter: string) => {
    setActiveFilter(filter);
  };

  // Handle search input change
  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  // Format date function
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return format(date, "dd MMM yyyy, HH:mm");
    } catch (err) {
      return dateString;
    }
  };

  // Format currency function
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  // Filter meetups based on search term and active filter
  const filteredMeetUps = meetUps
    .filter(meetUp => {
      // Filter by search term
      if (searchTerm) {
        return (
          meetUp.petId.toLowerCase().includes(searchTerm.toLowerCase()) ||
          meetUp.locationDetails.toLowerCase().includes(searchTerm.toLowerCase()) ||
          meetUp.status.toLowerCase().includes(searchTerm.toLowerCase())
        );
      }
      return true;
    })
    .filter(meetUp => {
      // Filter by status
      if (activeFilter === "all") return true;
      if (activeFilter === "pending") return meetUp.status === "PENDING";
      if (activeFilter === "approved") return meetUp.status === "APPROVED";
      if (activeFilter === "rejected") return meetUp.status === "REJECTED";
      return true;
    });

  // Map API status to display colors
  const getStatusColor = (status: string) => {
    switch (status) {
      case "PENDING":
        return "primary";
      case "APPROVED":
        return "success";
      case "REJECTED":
        return "error";
      default:
        return "default";
    }
  };

  return (
    <Container maxWidth="lg" sx={{ py: 3 }}>
      <Card 
        elevation={0} 
        sx={{ 
          borderRadius: "16px",
          border: "1px solid rgba(0, 0, 0, 0.05)",
          overflow: "hidden",
          boxShadow: "0 4px 20px rgba(0, 0, 0, 0.05)"
        }}
      >
        <CardContent sx={{ p: { xs: 2, md: 4 } }}>
          {/* Header section */}
          <Box 
            sx={{ 
              display: "flex", 
              flexDirection: { xs: "column", sm: "row" },
              justifyContent: "space-between", 
              alignItems: { xs: "flex-start", sm: "center" },
              mb: 3,
              gap: 2
            }}
          >
            <Box>
              <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                <GroupsIcon 
                  sx={{ 
                    color: "#8470C0", 
                    mr: 1,
                    fontSize: 28
                  }} 
                />
                <Typography 
                  variant="h5" 
                  sx={{ 
                    fontWeight: 700, 
                    color: "#444" 
                  }}
                >
                  ປະຫວັດການຂຊື້ຂາຍ
                </Typography>
              </Box>
              <Typography 
                variant="body2" 
                color="text.secondary"
                sx={{ maxWidth: 500 }}
              >
                  ທ່ານສາມາດເບິ່ງ ແລະ ຈັດການການນັດພົບສັດລ້ຽງຂອງທ່ານທີ່ໄດ້ກຳນົດໄວ້.
              </Typography>
            </Box>

            <Box 
              sx={{ 
                display: "flex", 
                gap: 1,
                width: { xs: "100%", sm: "auto" }
              }}
            >
              <TextField
                placeholder="Search meet-ups..."
                size="small"
                fullWidth={isSmallScreen}
                value={searchTerm}
                onChange={handleSearchChange}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon fontSize="small" sx={{ color: "action.active" }} />
                    </InputAdornment>
                  ),
                  sx: { 
                    borderRadius: "12px",
                    bgcolor: "#f5f5f5",
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: 'transparent'
                    },
                    '&:hover .MuiOutlinedInput-notchedOutline': {
                      borderColor: 'rgba(0, 0, 0, 0.1)'
                    }
                  }
                }}
              />
              <IconButton
                color="primary"
                onClick={() => {
                  setError(null);
                  fetchMeetUps();
                }}
                sx={{
                  bgcolor: "#f5f5f5",
                  borderRadius: "12px",
                  color: "#8470C0",
                  "&:hover": {
                    bgcolor: "#e5e5e5",
                  }
                }}
              >
                <RefreshIcon />
              </IconButton>
              <Button
                variant="contained"
                startIcon={<FilterIcon />}
                onClick={() => {
                  // Toggle between different filters
                  const filters = ["all", "pending", "approved", "rejected"];
                  const currentIndex = filters.indexOf(activeFilter);
                  const nextIndex = (currentIndex + 1) % filters.length;
                  handleFilterChange(filters[nextIndex]);
                }}
                sx={{
                  bgcolor: "#8470C0",
                  '&:hover': {
                    bgcolor: "#7461b1"
                  },
                  borderRadius: "12px",
                  whiteSpace: "nowrap"
                }}
              >
                {activeFilter.charAt(0).toUpperCase() + activeFilter.slice(1)}
              </Button>
            </Box>
          </Box>

          {/* Error state */}
          {error ? (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Typography color="error">{error}</Typography>
              <Button 
                variant="contained" 
                sx={{ 
                  mt: 2,
                  bgcolor: "#8470C0",
                  '&:hover': {
                    bgcolor: "#7461b1"
                  },
                  borderRadius: "12px"
                }}
                onClick={() => {
                  // When retrying, clear errors first
                  setError(null);
                  // Increment fetch attempts to trigger useEffect
                  setFetchAttempts(prev => prev + 1);
                }}
              >
                Retry
              </Button>
            </Box>
          ) : loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
              <CircularProgress sx={{ color: "#8470C0" }} />
            </Box>
          ) : (
            <TableContainer 
              component={Paper} 
              elevation={0} 
              sx={{ 
                mb: 3,
                borderRadius: "12px",
                overflow: "hidden",
                border: "1px solid rgba(0, 0, 0, 0.05)",
              }}
            >
              <Table>
                <TableHead>
                  <TableRow sx={{ bgcolor: "rgba(132, 112, 192, 0.05)" }}>
                    <TableCell 
                      sx={{ 
                        color: "#555", 
                        fontWeight: 600,
                        fontSize: "0.875rem"
                      }}
                    >
                      <Box sx={{ display: "flex", alignItems: "center" }}>
                       ສັດລ້ຽງ
                        <SortIcon fontSize="small" sx={{ ml: 0.5, color: "action.active" }} />
                      </Box>
                    </TableCell>
                    <TableCell 
                      sx={{ 
                        color: "#555", 
                        fontWeight: 600,
                        fontSize: "0.875rem" 
                      }}
                    >
                      ສະຖານທີນັດພົບ
                    </TableCell>
                    <TableCell 
                      sx={{ 
                        color: "#555", 
                        fontWeight: 600,
                        fontSize: "0.875rem" 
                      }}
                    >
                     ເວລານັດຮັບ
                    </TableCell>
                    <TableCell 
                      sx={{ 
                        color: "#555", 
                        fontWeight: 600,
                        fontSize: "0.875rem" 
                      }}
                    >
                      ສະຖານະ
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredMeetUps.length > 0 ? (
                    filteredMeetUps.map((meetUp) => (
                      <TableRow
                        key={meetUp.id || meetUp.petId}
                        sx={{ 
                          transition: "all 0.2s",
                          "&:hover": { 
                            bgcolor: "rgba(132, 112, 192, 0.05)"
                          }
                        }}
                      >
                        <TableCell sx={{ fontWeight: 600, color: "#8470C0" }}>
                          <Box sx={{ display: "flex", alignItems: "center" }}>
                            <Avatar
                              sx={{ 
                                width: 36, 
                                height: 36, 
                                mr: 1.5,
                                border: "2px solid #f0f0f0",
                                bgcolor: "#8470C0"
                              }}
                            >
                              <PetsIcon fontSize="small" />
                            </Avatar>
                            <Typography 
                              variant="body2" 
                              sx={{ 
                                fontWeight: 600,
                                maxWidth: "180px",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                whiteSpace: "nowrap"
                              }}
                            >
                              {meetUp.petId}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: "flex", alignItems: "center" }}>
                            <LocationIcon 
                              fontSize="small" 
                              sx={{ color: "#666", mr: 1 }} 
                            />
                            <Typography 
                              variant="body2" 
                              sx={{ 
                                color: "#666",
                                maxWidth: "120px",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                whiteSpace: "nowrap"
                              }}
                            >
                              {meetUp.locationDetails}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: "flex", alignItems: "center" }}>
                            <CalendarIcon 
                              fontSize="small" 
                              sx={{ color: "#666", mr: 1 }} 
                            />
                            <Typography 
                              variant="body2" 
                              sx={{ color: "#666" }}
                            >
                              {formatDate(meetUp.scheduledDateTime)}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={meetUp.status}
                            size="small"
                            color={
                              meetUp.status === "PENDING" 
                                ? "primary" 
                                : meetUp.status === "APPROVED" 
                                  ? "success" 
                                  : "error"
                            }
                            sx={{
                              bgcolor: 
                                meetUp.status === "PENDING" 
                                  ? "rgba(132, 112, 192, 0.1)" 
                                  : meetUp.status === "APPROVED" 
                                    ? "rgba(76, 175, 80, 0.1)" 
                                    : "rgba(244, 67, 54, 0.1)",
                              color: 
                                meetUp.status === "PENDING" 
                                  ? "#8470C0" 
                                  : meetUp.status === "APPROVED" 
                                    ? "#4caf50" 
                                    : "#f44336",
                              fontWeight: 500,
                              borderRadius: "12px",
                              fontSize: "0.75rem",
                              height: "24px"
                            }}
                          />
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={6} sx={{ textAlign: "center", py: 4 }}>
                        <Typography variant="body1" color="text.secondary">
                         ຍັງບໍ່ມີການນັດຮັບເທື່ອ
                        </Typography>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          )}


          {/* Footer with pagination */}
          {!loading && !error && filteredMeetUps.length > 0 && (
            <Box 
              sx={{ 
                display: "flex", 
                justifyContent: "space-between",
                alignItems: "center",
                flexWrap: "wrap",
                gap: 2
              }}
            >
              <Typography variant="body2" color="text.secondary">
                ສະແດງ {filteredMeetUps.length} of {meetUps.length} ການນັດຮັບ
              </Typography>
              
              <Box 
                sx={{ 
                  display: "flex",
                  gap: 1
                }}
              >
                <Button
                  variant="outlined"
                  disabled
                  sx={{
                    borderRadius: "12px",
                    textTransform: "none",
                    fontWeight: 500,
                    px: 2,
                    borderColor: "rgba(0, 0, 0, 0.1)",
                    color: "#666",
                    '&.Mui-disabled': {
                      borderColor: "rgba(0, 0, 0, 0.1)",
                      color: "rgba(0, 0, 0, 0.3)"
                    }
                  }}
                >
                 ຍ້ອນກັບ
                </Button>
                <Button
                  variant="contained"
                  sx={{
                    borderRadius: "12px",
                    minWidth: "40px",
                    bgcolor: "#8470C0",
                    '&:hover': {
                      bgcolor: "#7461b1"
                    }
                  }}
                >
                  1
                </Button>
                <Button
                  variant="outlined"
                  disabled
                  sx={{
                    borderRadius: "12px",
                    textTransform: "none",
                    fontWeight: 500,
                    px: 2,
                    borderColor: "rgba(0, 0, 0, 0.1)",
                    color: "#666",
                    '&.Mui-disabled': {
                      borderColor: "rgba(0, 0, 0, 0.1)",
                      color: "rgba(0, 0, 0, 0.3)"
                    }
                  }}
                >
                  ໜ້າຕໍ່ໄປ
                </Button>
              </Box>
            </Box>
          )}
        </CardContent>
      </Card>
      
      {/* Snackbar for notifications */}
      <Snackbar 
        open={snackbarOpen} 
        autoHideDuration={6000} 
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={handleSnackbarClose} 
          severity={snackbarSeverity} 
          sx={{ width: '100%' }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default MeetUpsTable;