import React, { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Avatar,
  Button,
  Typography,
  Box,
  Collapse,
  IconButton,
  Stack,
  Tabs,
  Tab,
  CircularProgress,
  Chip,
  Divider,
  Grid,
} from "@mui/material";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
// Import additional icons
import PetsIcon from "@mui/icons-material/Pets";
import EmailIcon from "@mui/icons-material/Email";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import StraightenIcon from "@mui/icons-material/Straighten";
import MaleIcon from "@mui/icons-material/Male";
import FemaleIcon from "@mui/icons-material/Female";
import HomeIcon from "@mui/icons-material/Home";
import InfoIcon from "@mui/icons-material/Info";
import DateRangeIcon from "@mui/icons-material/DateRange";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";
import PendingIcon from "@mui/icons-material/Pending";
import CelebrationIcon from "@mui/icons-material/Celebration";
import EventIcon from "@mui/icons-material/Event"; // Add this for meet-up button
import PaymentDialog from "../../layout/components/dialog-payment";
import axiosInstance from "../../configs/axios";
import Swal from "sweetalert2";
import MeetupDialog from "../../layout/components/dialog-meetup";
import { PetType } from "../../enums/petType";

// Core interfaces
interface PetDetails {
  id: string;
  name: string;
  age: string;
  size: string;
  breed: string;
  gender: string;
  image: string;
  price?: number;
}

interface HouseDetails {
  id: string;
  userId: string;
  petId: string;
  createdAt: string;
  acceptStatus: "PENDING" | "ACCEPTED" | "REJECTED";
  adoptionStatus?: "COMPLETED" | null;
  adults: number;
  allergies: boolean;
  children: number;
  houseDetails: string;
  houseImages: string[];
  neutered: boolean;
  otherPets: boolean;
  otherPetsDetails: string;
  paymentId: string | null;
  isMeetUp?: boolean; // Add this to track if meet-up exists
  pet?: {
    id: string;
    userId: string;
    petName: string;
    yearAge: number;
    monthAge: number;
    size: string;
    gender: string;
    status: string;
    breed?: {
      breedName: string;
    };
    petType?: string;
    images?: string[];
    price?: number;
    user?: {
      firstName?: string;
      email?: string;
      avatar?: string;
    };
  };
}

interface AdoptionRequest {
  id: string;
  fullName: string;
  dateOfRequest: string;
  status: "PENDING" | "ACCEPTED" | "REJECTED";
  adoptionStatus?: "COMPLETED" | null;
  email?: string;
  petDetails?: PetDetails;
  userAvatar: string;
  pet: {
    image: string;
    petName: string;
    yearAge: number;
    PetType: PetType;
    email: string;
  };
  originalData: HouseDetails;
  isOwnedByCurrentUser: boolean;
  paymentStatus: "PAID" | "UNPAID";
  petId: string;
  userId?: string;

  isMeetUp?: boolean;
}

// Interface for animal details to pass to payment dialog
interface AnimalDetails {
  id: string;
  name: string;
  species: string;
  breed?: string;
  age?: string;
  basePrice: number;
  imageUrl?: string;
  status?: string;
}

// Interface for buyer details to pass to payment dialog
interface BuyerDetails {
  id: string;
  name: string;
  email: string;
  phone?: string;
}

const AdoptionRequestsTable: React.FC = () => {
  // State for adoption requests
  const [adoptionRequests, setAdoptionRequests] = useState<AdoptionRequest[]>([]);
  console.log(adoptionRequests)
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Get current user ID (you'll need to implement this based on your auth system)
  const [currentUserId, setCurrentUserId] = useState<string>("");

  // Track active tab
  const [activeTab, setActiveTab] = useState<"adopt" | "rehome">("adopt");

  // Track which rows are open
  const [openRows, setOpenRows] = useState<Record<string, boolean>>({});

  // Payment dialog state
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
  const [selectedPaymentRequestId, setSelectedPaymentRequestId] = useState<string | null>(null);

  // Meet-up dialog state
  const [meetupDialogOpen, setMeetupDialogOpen] = useState(false);
  const [selectedMeetupRequest, setSelectedMeetupRequest] = useState<AdoptionRequest | null>(null);

  // Fetch current user ID
  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        // Replace this with your actual user fetch logic
        const response = await axiosInstance.get("/auth/user/profile");
        setCurrentUserId(response.data.id);
      } catch (err) {
        console.error("Error fetching current user:", err);
        // Set a default ID for development/testing
        setCurrentUserId("sample-user-id");
      }
    };

    fetchCurrentUser();
  }, []);

 const fetchAdoptionData = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get("/adopt");

      // Transform the API data to match our component's expected format
      const transformedData = response.data.data.map((item: HouseDetails) => {
        // Use the pet data if available
        const pet = item.pet;

        // Check if the current user is the owner of this pet
        const isOwnedByCurrentUser = pet?.userId === currentUserId;

        // Check if payment exists
        const hasPayment = Boolean(item.paymentId);

        return {
          id: item.id,
          fullName: pet?.user?.firstName || `User ${item.userId.substring(0, 5)}`,
          dateOfRequest: new Date(item.createdAt).toLocaleDateString(),
          status: item.acceptStatus,
          adoptionStatus: item.adoptionStatus || null,
          pet: {
            image: pet?.images || "",
            petName: pet?.petName || "Unknown",
            yearAge: pet?.yearAge || 0,
            PetType: pet?.petType || "",
          },
          petId: item.petId,
          userId: item.userId,
          email: pet?.user?.email || `user${item.userId.substring(0, 5)}@example.com`,
          petDetails: pet
            ? {
                id: pet.id,
                name: pet.petName,
                age: `${pet.yearAge} years ${pet.monthAge} months`,
                size: pet.size.toLowerCase(),
                breed: pet.breed?.breedName || "Unknown",
                gender: pet.gender.toLowerCase(),
                image: pet.images && pet.images.length > 0 ? pet.images[0] : "/api/placeholder/100/100",
                price: pet.price,
              }
            : undefined,
          userAvatar: pet?.user?.avatar || "/api/placeholder/40/40",
          originalData: item,
          isOwnedByCurrentUser,
          paymentStatus: hasPayment ? "PAID" : "UNPAID",
          isMeetUp: item.isMeetUp || false, // Get isMeetUp from API
        };
      });

      setAdoptionRequests(transformedData);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching adoption data:", err);
      setError("Failed to load adoption requests. Please try again later.");
      setLoading(false);
    }
  };


  // Fetch adoption data
  useEffect(() => {
    if (currentUserId) {
      fetchAdoptionData();
    }
  }, [currentUserId]);

  // Filter requests based on active tab
  const filteredRequests = adoptionRequests.filter((request) => {
    if (activeTab === "adopt") {
      // For adopt tab, show requests for pets not owned by current user
      return !request.isOwnedByCurrentUser;
    } else {
      // For rehome tab, show only requests for pets owned by current user
      return request.isOwnedByCurrentUser;
    }
  });

  // Toggle row expanded/collapsed state
  const toggleRow = (id: string) => {
    setOpenRows((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  // Handle tab change
  const handleTabChange = (_event: React.SyntheticEvent, newValue: "rehome" | "adopt") => {
    setActiveTab(newValue);
  };

  // Get appropriate title based on active tab
  const getTabTitle = () => {
    return activeTab === "adopt" ? "ຊື່ສັດລ້ຽງ" : "ຂາຍສັດລ້ຽງ";
  };

  const handlePay = (request: AdoptionRequest) => {
    // Store the adoption request ID
    setSelectedPaymentRequestId(request.id);

    // Extract and store pet ID in localStorage
    const petId = request.petId;

    // Store the petId in localStorage for later use
    localStorage.setItem("selectedPetIdPayment", petId);

    // Open the payment dialog
    setPaymentDialogOpen(true);
  };

  // Handle payment dialog close
  const handlePaymentDialogClose = () => {
    setPaymentDialogOpen(false);
    setSelectedPaymentRequestId(null);
  };

  // Handle meet-up button click
  const handleMeetup = (request: AdoptionRequest) => {
    setSelectedMeetupRequest(request);
    
    // Set localStorage data for meetup dialog
    localStorage.setItem("selectedAdoptId", request.id);
    localStorage.setItem("selectedPetId", request.petId);
    
    // Determine user role based on ownership
    const userRole = request.isOwnedByCurrentUser ? "seller" : "buyer";
    localStorage.setItem("meetupRole", userRole);
    
    // Open meet-up dialog
    setMeetupDialogOpen(true);
  };

  // Handle meet-up dialog close
  const handleMeetupDialogClose = () => {
    setMeetupDialogOpen(false);
    setSelectedMeetupRequest(null);
    
    // Check if meet-up was successful and update the state
    // You might want to call an API to check the latest meet-up status
    // For now, we'll mark it as having a meet-up after dialog closes
    if (selectedMeetupRequest) {
      setAdoptionRequests(prev =>
        prev.map(request =>
          request.id === selectedMeetupRequest.id
            ? { ...request, isMeetUp: true }
            : request
        )
      );
    }
    
    // Clear localStorage
    localStorage.removeItem("selectedAdoptId");
    localStorage.removeItem("selectedPetId");
    localStorage.removeItem("meetupRole");
  };

  // Handle accepting an adoption request
  const handleAcceptRequest = async (id: string) => {
    const confirm = await Swal.fire({
      title: "Are you sure?",
      text: "Do you want to accept this adoption request?",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Yes, accept it!",
      cancelButtonText: "Cancel",
      confirmButtonColor: "#28a745", // green
      cancelButtonColor: "#d33", // red
    });

    if (confirm.isConfirmed) {
      try {
        const data = {
          acceptStatus: "ACCEPTED",
        };

        await axiosInstance.patch(`/adopt/${id}`, data);

        Swal.fire({
          title: "Accepted!",
          text: "The adoption request has been accepted.",
          icon: "success",
          confirmButtonColor: "#6c63ff",
        });

        // Update the local state first for immediate UI feedback
        setAdoptionRequests((prev) =>
          prev.map((request) =>
            request.id === id
              ? {
                  ...request,
                  status: "ACCEPTED",
                  originalData: {
                    ...request.originalData,
                    acceptStatus: "ACCEPTED",
                  },
                }
              : request
          )
        );

        // Optionally fetch fresh data from the server
        fetchAdoptionData();
      } catch (err) {
        console.error("Error accepting adoption request:", err);
        Swal.fire({
          title: "Oops!",
          text: "Something went wrong while accepting the request.",
          icon: "error",
        });
      }
    }
  };

  // Handle rejecting an adoption request
  const handleRejectRequest = async (id: string) => {
    const confirm = await Swal.fire({
      title: "Are you sure?",
      text: "This will reject and delete the adoption request.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, reject it!",
      cancelButtonText: "Cancel",
      confirmButtonColor: "#d33", // red
      cancelButtonColor: "#6c63ff", // violet
    });

    if (confirm.isConfirmed) {
      try {
        await axiosInstance.delete(`/adopt/${id}`);

        Swal.fire({
          title: "Rejected!",
          text: "The adoption request has been rejected.",
          icon: "success",
          confirmButtonColor: "#6c63ff",
        });

        // Update local state first for immediate UI feedback
        setAdoptionRequests((prev) => prev.filter((request) => request.id !== id));

        // Then refresh from server
        fetchAdoptionData();
      } catch (err) {
        console.error("Error rejecting adoption request:", err);
        Swal.fire({
          title: "Oops!",
          text: "Something went wrong while rejecting the request.",
          icon: "error",
        });
      }
    }
  };

  // Cancel adoption request
  const handleCancel = (id: string) => {
    console.log("Canceling adoption request:", id);

    // Show confirmation first
    Swal.fire({
      title: "Are you sure?",
      text: "Do you want to cancel this adoption request?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, cancel it!",
      cancelButtonText: "No, keep it",
      confirmButtonColor: "#d33", // red
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await axiosInstance.delete(`/adopt/${id}`);

          // Update the local state
          setAdoptionRequests((prev) => prev.filter((request) => request.id !== id));

          Swal.fire("Cancelled!", "Your adoption request has been cancelled.", "success");

          // Refresh data
          fetchAdoptionData();
        } catch (error) {
          console.error("Error cancelling adoption request:", error);
          Swal.fire("Error", "There was a problem cancelling your request.", "error");
        }
      }
    });
  };

  // Get selected request details for payment
  const selectedPaymentRequest = selectedPaymentRequestId
    ? adoptionRequests.find((req) => req.id === selectedPaymentRequestId)
    : null;

  // Prepare animal details for payment dialog
  const getAnimalDetails = (): AnimalDetails | null => {
    if (!selectedPaymentRequest?.petDetails) return null;

    return {
      id: selectedPaymentRequest.petDetails.id,
      name: selectedPaymentRequest.petDetails.name,
      species: selectedPaymentRequest.originalData.pet?.petType || "Dog", // Use pet type if available
      breed: selectedPaymentRequest.petDetails.breed,
      age: selectedPaymentRequest.petDetails.age,
      basePrice: selectedPaymentRequest.petDetails.price || 0,
      imageUrl: selectedPaymentRequest.petDetails.image, // Add image URL
      status: selectedPaymentRequest.paymentStatus, // Add payment status
    };
  };

  // Prepare buyer details for payment dialog
  const getBuyerDetails = (): BuyerDetails | null => {
    if (!selectedPaymentRequest) return null;

    return {
      id: selectedPaymentRequest.userId || `user-${selectedPaymentRequest.id}`,
      name: selectedPaymentRequest.fullName,
      email: selectedPaymentRequest.email || "",
      phone: "",
    };
  };

  // Helper function to get status icon
  const getStatusIcon = (status: string) => {
    switch (status) {
      case "ACCEPTED":
        return <CheckCircleIcon fontSize="small" />;
      case "REJECTED":
        return <CancelIcon fontSize="small" />;
      default:
        return <PendingIcon fontSize="small" />;
    }
  };

  // Helper function to get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case "ACCEPTED":
        return "success";
      case "REJECTED":
        return "error";
      default:
        return "default";
    }
  };

  // Render loading state
  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "300px",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  // Render error state
  if (error) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "300px",
        }}
      >
        <Typography color="error">{error}</Typography>
      </Box>
    );
  }

  return (
    <>
     <Paper sx={{ width: "100%", overflow: "hidden", borderRadius: 2 }}>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            px: 3,
            py: 2,
            borderBottom: "1px solid rgba(0, 0, 0, 0.12)",
          }}
        >
          <Typography variant="h5" component="h1" fontWeight="500">
            {getTabTitle()}
          </Typography>
          <Tabs
            value={activeTab}
            onChange={handleTabChange}
            aria-label="rehome or adopt tabs"
            sx={{
              "& .MuiTabs-indicator": {
                backgroundColor: "#6c63ff",
              },
              "& .MuiTab-root.Mui-selected": {
                color: "#6c63ff",
              },
            }}
          >
            <Tab label="ຊື່" value="adopt" />
            <Tab label="ຂາຍ" value="rehome" />
          </Tabs>
        </Box>

        <TableContainer>
          <Table aria-label="adoption requests table">
            <TableHead sx={{ backgroundColor: "#f5f5ff" }}>
              <TableRow>
                <TableCell width="30px"></TableCell>
                <TableCell sx={{ fontWeight: 500 }}>ຮູບສັດລ້ຽງ</TableCell>
                <TableCell sx={{ fontWeight: 500 }}>ຊື່ສັດລ້ຽງ</TableCell>
                <TableCell sx={{ fontWeight: 500 }}>ເວລາເລີ່ມສົ່ງຄຳຮ້ອງຂໍ</TableCell>
                <TableCell sx={{ fontWeight: 500 }}>ສະຖານະ</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredRequests.length > 0 ? (
                filteredRequests.map((request) => (
                  <React.Fragment key={request.id}>
                    <TableRow
                      sx={{
                        "& > *": { borderBottom: "unset" },
                        backgroundColor: openRows[request.id] ? "#f5f5ff" : "inherit",
                        "&:hover": { backgroundColor: "#f0f0ff" },
                        cursor: "pointer",
                      }}
                      onClick={() => request.petDetails && toggleRow(request.id)}
                    >
                      <TableCell>
                        {request.petDetails && (
                          <IconButton
                            aria-label="expand row"
                            size="small"
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleRow(request.id);
                            }}
                          >
                            {openRows[request.id] ? (
                              <KeyboardArrowUpIcon sx={{ color: "#6c63ff" }} />
                            ) : (
                              <KeyboardArrowDownIcon sx={{ color: "#6c63ff" }} />
                            )}
                          </IconButton>
                        )}
                      </TableCell>
                      <TableCell>
                        <Stack direction="row" spacing={1.5} alignItems="center">
                          <Avatar
                            src={request?.pet?.image}
                            sx={{
                              width: 40,
                              height: 40,
                              border: "1px solid #eee",
                            }}
                          />
                        </Stack>
                      </TableCell>
                      <TableCell>
                        <Stack direction="row" spacing={1.5} alignItems="center">
                          <Typography>{request?.pet?.petName}</Typography>
                        </Stack>
                      </TableCell>
                      <TableCell>
                        <Stack direction="row" spacing={1} alignItems="center">
                          <DateRangeIcon
                            fontSize="small"
                            sx={{ color: "text.secondary", opacity: 0.7 }}
                          />
                          <Typography>{request.dateOfRequest}</Typography>
                        </Stack>
                      </TableCell>
                      <TableCell>
                        <Stack direction="row" spacing={1} alignItems="center">
                          {request.adoptionStatus === "COMPLETED" ? (
                            <Chip
                              icon={<CelebrationIcon fontSize="small" />}
                              label="Adopted"
                              color="success"
                              variant="filled"
                              size="small"
                              sx={{
                                fontWeight: 500,
                                minWidth: 100,
                                justifyContent: "center",
                                bgcolor: "#28a745",
                              }}
                            />
                          ) : (
                            <Chip
                              icon={getStatusIcon(request.status)}
                              label={request.status}
                              color={getStatusColor(request.status)}
                              variant="outlined"
                              size="small"
                              sx={{
                                fontWeight: 500,
                                minWidth: 100,
                                justifyContent: "center",
                              }}
                            />
                          )}
                        </Stack>
                      </TableCell>
                    </TableRow>
                    {request.petDetails && (
                      <TableRow>
                        <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={6}>
                          <Collapse in={openRows[request.id]} timeout="auto" unmountOnExit>
                            <Paper
                              elevation={0}
                              sx={{
                                p: 3,
                                backgroundColor: "#f9f9ff",
                                m: 2,
                                borderRadius: 2,
                              }}
                            >
                              <Grid container spacing={3}>
                                {/* User Information Column */}
                                <Grid item xs={12} md={4}>
                                  <Box sx={{ mb: 2 }}>
                                    <Typography
                                      variant="subtitle1"
                                      fontWeight="bold"
                                      color="primary"
                                      gutterBottom
                                    >
                                      {activeTab === "adopt" ? "ຂໍ້ມູນຜູ້ຊື່ສັດລ້ຽງ" : "ຂໍ້ມູນຜູ້ຂາຍສັດລ້ຽງ"}
                                    </Typography>
                                    <Divider sx={{ mb: 2 }} />

                                    <Stack
                                      direction="row"
                                      spacing={1}
                                      alignItems="center"
                                      sx={{ mb: 2 }}
                                    >
                                      <EmailIcon color="action" fontSize="small" />
                                      <Typography variant="body2">{request.email}</Typography>
                                    </Stack>

                                    <Stack
                                      direction="row"
                                      spacing={1}
                                      alignItems="center"
                                      sx={{ mb: 2 }}
                                    >
                                      <HomeIcon color="action" fontSize="small" />
                                      <Typography variant="body2">
                                        Other Pets: {request.originalData.otherPets ? "Yes" : "No"}
                                      </Typography>
                                    </Stack>

                                    {request.originalData.otherPets && (
                                      <Stack
                                        direction="row"
                                        spacing={1}
                                        alignItems="flex-start"
                                        sx={{ mb: 2 }}
                                      >
                                        <InfoIcon color="action" fontSize="small" sx={{ mt: 0.3 }} />
                                        <Typography variant="body2">
                                          Pet Details: {request.originalData.otherPetsDetails}
                                        </Typography>
                                      </Stack>
                                    )}
                                  </Box>
                                </Grid>

                                {/* Pet Information Column */}
                                <Grid item xs={12} md={8}>
                                  <Box sx={{ mb: 2 }}>
                                    <Typography
                                      variant="subtitle1"
                                      fontWeight="bold"
                                      color="primary"
                                      gutterBottom
                                    >
                                      ຂໍ້ມູນສັດລ້ຽງ
                                    </Typography>
                                    <Divider sx={{ mb: 2 }} />

                                    <Box sx={{ display: "flex", gap: 3 }}>
                                      <Avatar
                                        src={request.petDetails.image}
                                        sx={{
                                          width: 100,
                                          height: 100,
                                          border: "3px solid #6c63ff",
                                          borderRadius: 2,
                                        }}
                                        variant="rounded"
                                      />

                                      <Box>
                                        <Stack
                                          direction="row"
                                          spacing={1}
                                          alignItems="center"
                                          sx={{ mb: 2 }}
                                        >
                                          <PetsIcon color="primary" fontSize="small" />
                                          <Typography variant="body1" fontWeight="medium">
                                            {request.petDetails.name}
                                          </Typography>
                                          <Chip
                                            label={request.originalData.pet?.petType || "Unknown"}
                                            size="small"
                                            color="primary"
                                            sx={{
                                              height: 20,
                                              fontSize: "0.7rem",
                                              backgroundColor: "#6c63ff",
                                            }}
                                          />

                                          {request.adoptionStatus === "COMPLETED" && (
                                            <Chip
                                              icon={<CelebrationIcon fontSize="small" />}
                                              label="Adopted"
                                              size="small"
                                              color="success"
                                              sx={{
                                                height: 24,
                                                ml: 1,
                                                bgcolor: "#28a745",
                                                color: "white",
                                              }}
                                            />
                                          )}
                                        </Stack>

                                        <Stack direction="row" spacing={3} sx={{ mb: 2 }}>
                                          <Stack direction="row" spacing={1} alignItems="center">
                                            <CalendarTodayIcon color="action" fontSize="small" />
                                            <Typography variant="body2">
                                              {request.petDetails.age}
                                            </Typography>
                                          </Stack>

                                          <Stack direction="row" spacing={1} alignItems="center">
                                            {request.petDetails.gender === "male" ? (
                                              <MaleIcon color="info" fontSize="small" />
                                            ) : (
                                              <FemaleIcon color="error" fontSize="small" />
                                            )}
                                            <Typography
                                              variant="body2"
                                              sx={{
                                                textTransform: "capitalize",
                                              }}
                                            >
                                              {request.petDetails.gender}
                                            </Typography>
                                          </Stack>
                                        </Stack>

                                        <Stack
                                          direction="row"
                                          spacing={1}
                                          alignItems="center"
                                          sx={{ mb: 2 }}
                                        >
                                          <StraightenIcon color="action" fontSize="small" />
                                          <Typography
                                            variant="body2"
                                            sx={{ textTransform: "capitalize" }}
                                          >
                                            Size: {request.petDetails.size}
                                          </Typography>
                                        </Stack>
                                      </Box>
                                    </Box>
                                  </Box>
                                </Grid>

                                {/* Actions Column */}
                                <Grid item xs={12} md={12}>
                                  <Box
                                    sx={{
                                      display: "flex",
                                      justifyContent: "center",
                                      mt: 2,
                                    }}
                                  >
                                    {request.adoptionStatus === "COMPLETED" ? (
                                      <Box
                                        sx={{
                                          p: 2,
                                          bgcolor: "#d4edda",
                                          borderRadius: 2,
                                          display: "flex",
                                          alignItems: "center",
                                          gap: 1,
                                        }}
                                      >
                                        <CelebrationIcon color="success" />
                                        <Typography color="success.main" fontWeight="medium">
                                          ການຮັບລ້ຽງສຳເລັດແລ້ວ - ສັດລ້ຽງໄດ້ພົບບ້ານໃໝ່ແລ້ວ!{" "}
                                        </Typography>
                                      </Box>
                                    ) : activeTab === "adopt" ? (
                                      // Adopt tab buttons - Updated with meet-up functionality
                                      <>
                                        {request.status === "ACCEPTED" && (
                                          <>
                                            {request.paymentStatus === "PAID" ||
                                            request.originalData.paymentId ? (
                                              // Show meet-up button after payment is completed
                                              <>
                                                 {!request.isMeetUp ? (
          <Button
            variant="contained"
            color="secondary"
            size="medium"
            startIcon={<EventIcon />}
            onClick={() => handleMeetup(request)}
            sx={{
              backgroundColor: "#ff9800",
              borderRadius: 2,
              boxShadow: "0 4px 10px rgba(255, 152, 0, 0.3)",
              minWidth: 150,
              mx: 1,
              "&:hover": {
                backgroundColor: "#f57c00",
              },
            }}
          >
            ນັດພົບ
          </Button>
        ) : (
          <Typography
            color="info.main"
            fontWeight="medium"
            sx={{
              display: "flex",
              alignItems: "center",
              p: 2,
              bgcolor: "#e3f2fd",
              borderRadius: 2,
            }}
          >
            <EventIcon fontSize="small" sx={{ mr: 1 }} />
            ການນັດພົບໄດ້ຖືກຈັດແລ້ວ - ລໍຖ້າການສໍາເລັດການຮັບລ້ຽງ
          </Typography>
        )}
      </>
    ) : (
      // Payment buttons if not paid yet
      <>
        <Button
          variant="contained"
          color="primary"
          size="medium"
          onClick={() => handlePay(request)}
          sx={{
            backgroundColor: "#6c63ff",
            borderRadius: 2,
            boxShadow: "0 4px 10px rgba(108, 99, 255, 0.3)",
            minWidth: 100,
            mx: 1,
          }}
        >
          ຈ່າຍເງິນ
        </Button>
        <Button
          variant="outlined"
          color="primary"
          size="medium"
          onClick={() => handleCancel(request.id)}
          sx={{
            color: "#6c63ff",
            borderColor: "#6c63ff",
            borderRadius: 2,
            minWidth: 100,
            mx: 1,
          }}
        >
          ຍົກເລີກ
        </Button>
      </>
    )}
  </>
)}
                                        {request.status === "PENDING" && (
                                          <Typography color="text.secondary" fontStyle="italic">
                                            ລໍຖ້າການຢືນຢັນຈາກເຈົ້າຂອງສັດລ້ຽງ...
                                          </Typography>
                                        )}
                                      </>
                                    ) : (
                                      // Rehome tab buttons (UPDATED with meet-up functionality)
                                      <>
                                        {request.status === "PENDING" && (
                                          <>
                                            <Button
                                              variant="contained"
                                              color="success"
                                              size="medium"
                                              onClick={() => handleAcceptRequest(request.id)}
                                              sx={{
                                                borderRadius: 2,
                                                minWidth: 120,
                                                mx: 1,
                                              }}
                                            >
                                              ຍ້ອມຮັບ
                                            </Button>
                                            <Button
                                              variant="outlined"
                                              color="error"
                                              size="medium"
                                              onClick={() => handleRejectRequest(request.id)}
                                              sx={{
                                                borderRadius: 2,
                                                minWidth: 120,
                                                mx: 1,
                                              }}
                                            >
                                              ປະຕິເສດ
                                            </Button>
                                          </>
                                        )}
                                        {request.status === "ACCEPTED" && (
                                          <>
                                            {request.paymentStatus === "PAID" ||
                                            request.originalData.paymentId ? (
                                              // Show meet-up button after payment is completed (for seller)
                                              <>
                                                {!request.isMeetUp ? (
          <Button
            variant="contained"
            color="secondary"
            size="medium"
            startIcon={<EventIcon />}
            onClick={() => handleMeetup(request)}
            sx={{
              backgroundColor: "#ff9800",
              borderRadius: 2,
              boxShadow: "0 4px 10px rgba(255, 152, 0, 0.3)",
              minWidth: 150,
              mx: 1,
              "&:hover": {
                backgroundColor: "#f57c00",
              },
            }}
          >
            ນັດພົບ
          </Button>
        ) : (
          <Typography
            color="info.main"
            fontWeight="medium"
            sx={{
              display: "flex",
              alignItems: "center",
              p: 2,
              bgcolor: "#e3f2fd",
              borderRadius: 2,
            }}
          >
            <EventIcon fontSize="small" sx={{ mr: 1 }} />
            ການນັດພົບໄດ້ຖືກຈັດແລ້ວ - ລໍຖ້າການສໍາເລັດການຮັບລ້ຽງ
          </Typography>
        )}
      </>
    ) : (
      <Typography color="text.secondary" fontStyle="italic">
        ລໍຖ້າການຈ່າຍເງິນຈາກຜູ້ຊື້...
      </Typography>
    )}
  </>
)}
                                      </>
                                    )}
                                  </Box>
                                </Grid>
                              </Grid>
                            </Paper>
                          </Collapse>
                        </TableCell>
                      </TableRow>
                    )}
                  </React.Fragment>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={4} align="center">
                    <Box sx={{ py: 4 }}>
                      <Typography color="textSecondary">ບໍ່ພົບຄໍາຮ້ອງຂໍຮັບລ້ຽງ</Typography>
                    </Box>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Payment Dialog */}
      {selectedPaymentRequest && getAnimalDetails() && getBuyerDetails() && (
        <PaymentDialog
          open={paymentDialogOpen}
          onClose={handlePaymentDialogClose}
          animalDetails={getAnimalDetails()!}
          buyerDetails={getBuyerDetails()!}
        />
      )}

      {/* Meet-up Dialog */}
      {selectedMeetupRequest && (
        <MeetupDialog
          open={meetupDialogOpen}
          onClose={handleMeetupDialogClose}
          petName={selectedMeetupRequest.petDetails?.name}
          petType={selectedMeetupRequest.originalData.pet?.petType}
        />
      )}
    </>
  );
};

export default AdoptionRequestsTable;