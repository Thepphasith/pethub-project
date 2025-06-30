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
  Card,
  CardContent,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
// Import additional icons
import PetsIcon from "@mui/icons-material/Pets";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import EmailIcon from "@mui/icons-material/Email";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import StraightenIcon from "@mui/icons-material/Straighten";
import MaleIcon from "@mui/icons-material/Male";
import FemaleIcon from "@mui/icons-material/Female";
import HomeIcon from "@mui/icons-material/Home";
import DateRangeIcon from "@mui/icons-material/DateRange";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";
import PendingIcon from "@mui/icons-material/Pending";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import MapIcon from "@mui/icons-material/Map";
import ScheduleIcon from "@mui/icons-material/Schedule";
import CelebrationIcon from "@mui/icons-material/Celebration";
import VerifiedUserIcon from "@mui/icons-material/VerifiedUser";
import PhoneIcon from "@mui/icons-material/Phone";
import MeetupDialog from "../../layout/components/dialog-meetup";
import axiosInstance from "../../configs/axios";
import Swal from "sweetalert2";

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

interface MeetupDetails {
  date: string;
  time: string;
  location: string;
  mapLink: string;
  requesterId: string;
  status?: "PENDING" | "ACCEPTED" | "COMPLETED" | "RECEIVED";
  meetupId?: string;
}

interface UserInfo {
  id: string;
  firstName: string;
  email: string;
  tel: string;
  avatar?: string;
}

interface IncomingMeetup {
  id: string;
  adoptId: string | null;
  petId: string;
  creatorId: string;
  approachedId: string;
  date?: string;
  time?: string;
  link: string;
  creator: UserInfo;
  approached?: UserInfo;
  locationDetails: string;
  mapLink?: string;
  scheduledDateTime: string;
  status: "PENDING" | "ACCEPTED" | "COMPLETED" | "RECEIVED";
  createdAt: string;
  updatedAt: string;
  pet?: {
    id: string;
    petName: string;
    yearAge: number;
    monthAge: number;
    size: string;
    gender: string;
    petType: string;
    breed?: {
      id: string;
      breedName: string;
    };
    breedId?: string;
    images?: string[];
    price?: number;
    user?: {
      firstName?: string;
      email?: string;
      avatar?: string;
    };
  };
  adopt?: {
    id: string;
    userId: string;
    petId: string;
    pet?: {
      id: string;
      petName: string;
      yearAge: number;
      monthAge: number;
      size: string;
      gender: string;
      breed?: {
        breedName: string;
      };
      images?: string[];
      user?: {
        firstName?: string;
        email?: string;
        avatar?: string;
      };
    };
  };
}

interface MeetupRequest {
  id: string;
  fullName: string;
  link: string;
  dateOfRequest: string;
  status: "PENDING" | "ACCEPTED" | "REJECTED";
  adoptionStatus?: "COMPLETED" | null;
  creator: UserInfo;
  email?: string;
  petDetails?: PetDetails;
  scheduledDateTime?: string;
  userAvatar: string;
  locationDetails?: string;
  originalData: HouseDetails | IncomingMeetup;
  meetupStatus:
    | "NONE"
    | "PENDING"
    | "ACCEPTED"
    | "REJECTED"
    | "COMPLETED"
    | "RECEIVED";
  meetupDetails?: MeetupDetails;
  isOwnedByCurrentUser: boolean;
  paymentStatus: "PAID" | "UNPAID";
  petId: string;
  userId?: string;
  meetupRequester?: string;
  meetupId?: string;
  // Additional fields for proper user info display
  otherUserInfo: UserInfo; // Info of the other person in the meetup
}

const MeetupManagementTable: React.FC = () => {
  // State for meetup requests
  const [meetupRequests, setMeetupRequests] = useState<MeetupRequest[]>([]);
  console.log("MeetP", meetupRequests);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Get current user ID
  const [currentUserId, setCurrentUserId] = useState<string>("");

  // Track active tab - FIXED: Values now match labels
  const [activeTab, setActiveTab] = useState<"buyer" | "seller">("buyer");

  // Track which rows are open
  const [openRows, setOpenRows] = useState<Record<string, boolean>>({});

  // Meetup dialog state
  const [meetupDialogOpen, setMeetupDialogOpen] = useState(false);
  const [selectedRequestId, setSelectedRequestId] = useState<string | null>(
    null
  );

  // Track if we're showing meetup details
  const [showMeetupDetails, setShowMeetupDetails] = useState<
    Record<string, boolean>
  >({});

  // Meetup details dialog state
  const [meetupDetailsDialogOpen, setMeetupDetailsDialogOpen] = useState(false);
  const [existingMeetupDetails, setExistingMeetupDetails] = useState<{
    meetupDetails: MeetupDetails | null;
    requesterName: string;
    petName: string;
  } | null>(null);

  // Debug logging
  useEffect(() => {
    console.log("Current user ID:", currentUserId);
    console.log("Active tab:", activeTab);
  }, [currentUserId, activeTab]);

  // Fetch current user ID
  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const response = await axiosInstance.get("/auth/user/profile");
        console.log("Current user response:", response.data);
        setCurrentUserId(response.data.id);
      } catch (err) {
        console.error("Error fetching current user:", err);
        setError("Failed to fetch user profile. Please refresh the page.");
      }
    };

    fetchCurrentUser();
  }, []);

  // FIXED: Fetch data based on active tab with proper user info mapping
  const fetchMeetupData = async (tabType: "buyer" | "seller") => {
    try {
      setLoading(true);
      setError(null);

      let response;
      let transformedData: MeetupRequest[] = [];

      if (tabType === "buyer") {
        // For buyer tab, fetch from /meet-up/incoming
        // Current user is the buyer, show seller's info
        response = await axiosInstance.get("/meet-up/incoming");

        const incomingMeetups = response.data.data || response.data || [];

        transformedData = incomingMeetups.map((meetup: IncomingMeetup) => {
          const pet = meetup.pet;
          const adopt = meetup.adopt;

          // For buyer tab: current user is buyer, other user is seller (pet owner)
          // The pet owner info should come from pet.user or approached user
          const otherUserInfo: UserInfo = {
            id: meetup.approached?.id || pet?.user?.firstName || "unknown",
            firstName: meetup.approached?.firstName || pet?.user?.firstName || "Unknown Seller",
            email: meetup.approached?.email || pet?.user?.email || "Unknown",
            tel: meetup.approached?.tel || "Unknown",
            avatar: meetup.approached?.avatar || pet?.user?.avatar || "/api/placeholder/40/40",
          };

          const transformedRequest: MeetupRequest = {
            id: meetup.id,
            fullName: otherUserInfo.firstName,
            dateOfRequest: new Date(meetup.createdAt).toLocaleDateString(),
            status: "ACCEPTED" as const,
            adoptionStatus: null,
            petId: meetup.petId || pet?.id || "",
            userId: meetup.creatorId || meetup.approached?.id || "",
            petDetails: pet
              ? {
                  id: pet.id,
                  name: pet.petName,
                  age: `${pet.yearAge} years ${pet.monthAge} months`,
                  size: pet.size?.toLowerCase() || "",
                  breed: pet.breed?.breedName || "Unknown Breed",
                  gender: pet.gender?.toLowerCase() || "",
                  image:
                    pet.images && pet.images.length > 0
                      ? pet.images[0]
                      : "/api/placeholder/100/100",
                  price: pet.price || 0,
                }
              : {
                  id: meetup.id,
                  name: "Unknown Pet",
                  age: "Unknown",
                  size: "unknown",
                  breed: "Unknown",
                  gender: "unknown",
                  image: "/api/placeholder/100/100",
                  price: 0,
                },
            userAvatar: otherUserInfo.avatar || "/api/placeholder/40/40",
            originalData: meetup,
            meetupStatus: meetup.status,
            meetupDetails: {
              date: new Date(meetup.scheduledDateTime).toLocaleDateString(),
              time: new Date(meetup.scheduledDateTime).toLocaleTimeString(),
              location: meetup.locationDetails,
              mapLink: meetup.link || "",
              requesterId: meetup.creatorId || "",
              status: meetup.status,
              meetupId: meetup.id,
            },
            isOwnedByCurrentUser: false,
            paymentStatus: "PAID" as const,
            meetupRequester: meetup.creatorId || "",
            meetupId: meetup.id,
            creator: meetup.creator,
            scheduledDateTime: new Date(meetup.scheduledDateTime).toLocaleString(),
            locationDetails: meetup.locationDetails,
            link: meetup.link || "",
            otherUserInfo: otherUserInfo, // Seller info for buyer tab
          };

          console.log("Transformed buyer request:", transformedRequest);
          return transformedRequest;
        });
      } else {
        // For seller tab, fetch from /meet-up
        // Current user is the seller, show buyer's info
        response = await axiosInstance.get("/meet-up");

        const sellerMeetups = response.data.data || response.data || [];

        transformedData = sellerMeetups.map((meetup: IncomingMeetup) => {
          const adopt = meetup.adopt;
          const pet = adopt?.pet || meetup.pet;

          // For seller tab: current user is seller, other user is buyer (creator)
          const otherUserInfo: UserInfo = {
            id: meetup.creator?.id || "unknown",
            firstName: meetup.creator?.firstName || "Unknown Buyer",
            email: meetup.creator?.email || "Unknown",
            tel: meetup.creator?.tel || "Unknown",
            avatar: meetup.creator?.avatar || "/api/placeholder/40/40",
          };

          const transformedRequest: MeetupRequest = {
            id: meetup.id,
            fullName: otherUserInfo.firstName,
            dateOfRequest: new Date(meetup.createdAt).toLocaleDateString(),
            status: "ACCEPTED" as const,
            adoptionStatus: null,
            locationDetails: meetup.locationDetails,
            link: meetup.link || "",
            scheduledDateTime: new Date(meetup.scheduledDateTime).toLocaleString(),
            petId: adopt?.petId || pet?.id || "",
            userId: adopt?.userId || "",
            email: otherUserInfo.email,
            petDetails: pet
              ? {
                  id: pet.id,
                  name: pet.petName,
                  age: `${pet.yearAge} years ${pet.monthAge} months`,
                  size: pet.size?.toLowerCase() || "unknown",
                  breed: pet.breed?.breedName || "Unknown",
                  gender: pet.gender?.toLowerCase() || "unknown",
                  image:
                    pet.images && pet.images.length > 0
                      ? pet.images[0]
                      : "/api/placeholder/100/100",
                }
              : {
                  id: meetup.id,
                  name: "Unknown Pet",
                  age: "Unknown",
                  size: "unknown",
                  breed: "Unknown",
                  gender: "unknown",
                  image: "/api/placeholder/100/100",
                },
            userAvatar: otherUserInfo.avatar || "/api/placeholder/40/40",
            originalData: meetup,
            meetupStatus: meetup.status,
            creator: meetup.creator,
            meetupDetails: {
              date: new Date(meetup.scheduledDateTime).toLocaleDateString(),
              time: new Date(meetup.scheduledDateTime).toLocaleTimeString(),
              location: meetup.locationDetails,
              link: meetup.link || "",
              mapLink: meetup.link || "",
              requesterId: adopt?.userId || "",
              status: meetup.status,
              meetupId: meetup.id,
            },
            isOwnedByCurrentUser: true,
            paymentStatus: "PAID" as const,
            meetupRequester: adopt?.userId || "",
            meetupId: meetup.id,
            otherUserInfo: otherUserInfo, // Buyer info for seller tab
          };

          console.log("Transformed seller request:", transformedRequest);
          return transformedRequest;
        });
      }

      console.log("Transformed meetup data:", transformedData);
      setMeetupRequests(transformedData);

      // Auto-show meetup details for RECEIVED status
      transformedData.forEach((request) => {
        if (
          request.meetupStatus === "RECEIVED" ||
          request.meetupStatus === "ACCEPTED"
        ) {
          setShowMeetupDetails((prev) => ({
            ...prev,
            [request.id]: true,
          }));
        }
      });

      setLoading(false);
    } catch (err) {
      console.error("Error fetching meetup data:", err);
      setError("Failed to load meetup requests. Please try again later.");
      setLoading(false);
    }
  };

  // Fetch data when currentUserId or activeTab changes
  useEffect(() => {
    if (currentUserId) {
      fetchMeetupData(activeTab);
    }
  }, [currentUserId, activeTab]);

  // Toggle row expanded/collapsed state
  const toggleRow = (id: string) => {
    console.log("Toggling row:", id);
    setOpenRows((prev) => {
      const newState = {
        ...prev,
        [id]: !prev[id],
      };
      console.log("New openRows state:", newState);
      return newState;
    });
  };

  // FIXED: Handle tab change and fetch new data
  const handleTabChange = (
    _event: React.SyntheticEvent,
    newValue: "buyer" | "seller"
  ) => {
    setActiveTab(newValue);
    setOpenRows({}); // Close all open rows when switching tabs
    setShowMeetupDetails({}); // Hide all meetup details when switching tabs
  };

  // Get appropriate title based on active tab
  const getTabTitle = () => {
    return activeTab === "buyer"
      ? "ການນັດພົບສຳລັບຜູ້ຊື້"
      : "ການນັດພົບສຳລັບຜູ້ຂາຍ";
  };

  // Show existing meetup details dialog
  const showExistingMeetupDetails = () => {
    const requestWithMeetup = meetupRequests.find(
      (req) => req.meetupStatus === "PENDING" || req.meetupStatus === "RECEIVED"
    );

    if (requestWithMeetup && requestWithMeetup.meetupDetails) {
      setExistingMeetupDetails({
        meetupDetails: requestWithMeetup.meetupDetails,
        requesterName: requestWithMeetup.fullName,
        petName: requestWithMeetup.petDetails?.name || "Pet",
      });
      setMeetupDetailsDialogOpen(true);
    }
  };

  // Handle meetup button click
  const handleMeetup = (meetupRequest: MeetupRequest) => {
    const adoptId = meetupRequest?.id;
    const petId = meetupRequest.petId;

    if (!adoptId || !petId) {
      console.error("Missing adoptId or petId", { adoptId, petId });
      Swal.fire({
        title: "Error",
        text: "Missing required information. Please try again.",
        icon: "error",
      });
      return;
    }

    localStorage.setItem("selectedAdoptId", adoptId);
    localStorage.setItem("selectedPetId", petId);

    const role = activeTab === "buyer" ? "buyer" : "seller";
    localStorage.setItem("meetupRole", role);

    console.log("Setting up meetup for:", { adoptId, petId, role });

    // Check if any other request has a pending or active meetup
    const hasPendingMeetup = meetupRequests.some(
      (req) =>
        req.id !== adoptId &&
        (req.meetupStatus === "PENDING" || req.meetupStatus === "RECEIVED")
    );

    if (hasPendingMeetup && activeTab === "seller") {
      showExistingMeetupDetails();
      return;
    }

    setSelectedRequestId(adoptId);
    setMeetupDialogOpen(true);
  };

  // Toggle meetup details visibility
  const toggleMeetupDetails = (id: string) => {
    console.log("Toggling meetup details for:", id);
    setShowMeetupDetails((prev) => {
      const newState = {
        ...prev,
        [id]: !prev[id],
      };
      console.log("New showMeetupDetails state:", newState);
      return newState;
    });
  };

  // Handle dialog close
  const handleDialogClose = () => {
    setMeetupDialogOpen(false);
    setSelectedRequestId(null);
  };

  // Handle meetup details dialog close
  const handleMeetupDetailsDialogClose = () => {
    setMeetupDetailsDialogOpen(false);
    setExistingMeetupDetails(null);
  };

  // Handle apply button in dialog
  const handleApplyMeetup = async (
    meetupDetails: Omit<MeetupDetails, "requesterId">
  ) => {
    // Get adoptId from both selectedRequestId and localStorage as backup
    const adoptIdFromState = selectedRequestId;
    const adoptIdFromStorage = localStorage.getItem("selectedAdoptId");
    const petIdFromStorage = localStorage.getItem("selectedPetId");

    // Use state first, then localStorage as fallback
    const adoptId = adoptIdFromState || adoptIdFromStorage;
    const petId = petIdFromStorage;

    console.log("Meetup creation attempt:", {
      adoptIdFromState,
      adoptIdFromStorage,
      petIdFromStorage,
      finalAdoptId: adoptId,
      finalPetId: petId,
      currentUserId,
      meetupDetails,
    });

    // Validate required fields
    if (!adoptId) {
      console.error("Missing adoptId - both state and localStorage are empty");
      Swal.fire({
        title: "Error",
        text: "Adoption ID is missing. Please try selecting the meetup again.",
        icon: "error",
      });
      return;
    }

    if (!petId) {
      console.error("Missing petId");
      Swal.fire({
        title: "Error",
        text: "Pet ID is missing. Please try selecting the meetup again.",
        icon: "error",
      });
      return;
    }

    if (!meetupDetails.date || !meetupDetails.time || !meetupDetails.location) {
      Swal.fire({
        title: "Error",
        text: "Please fill in all required fields (date, time, and location).",
        icon: "error",
      });
      return;
    }

    if (!currentUserId) {
      Swal.fire({
        title: "Error",
        text: "User not authenticated. Please refresh the page and try again.",
        icon: "error",
      });
      return;
    }

    try {
      // Format the datetime properly for the API
      const [year, month, day] = meetupDetails.date.split("-");
      const [hour, minute] = meetupDetails.time.split(":");

      // Validate date/time parsing
      if (!year || !month || !day || !hour || !minute) {
        throw new Error("Invalid date or time format");
      }

      // Create a proper Date object
      const meetupDateTime = new Date(
        parseInt(year),
        parseInt(month) - 1, // Month is 0-indexed
        parseInt(day),
        parseInt(hour),
        parseInt(minute)
      );

      // Validate that the date is valid
      if (isNaN(meetupDateTime.getTime())) {
        throw new Error("Invalid date/time provided");
      }

      // Convert to ISO string
      const scheduledDateTime = meetupDateTime.toISOString();

      // Create payload exactly matching the API specification
      const meetupPayload = {
        petId: petId,
        adoptId: adoptId,
        locationDetails: meetupDetails.location.trim(),
        scheduledDateTime: scheduledDateTime,
        link: meetupDetails.mapLink?.trim() || "",
        status: "PENDING",
      };

      console.log("Sending meetup payload:", meetupPayload);

      // Validate payload before sending
      if (
        !meetupPayload.adoptId ||
        !meetupPayload.petId ||
        !meetupPayload.locationDetails
      ) {
        throw new Error("Missing required fields in payload");
      }

      const response = await axiosInstance.post("/meet-up", meetupPayload);

      console.log("Meetup creation response:", response.data);

      if (response.data && (response.data.id || response.data.data?.id)) {
        const meetupId = response.data.id || response.data.data?.id;

        Swal.fire({
          title: "Meetup Scheduled!",
          text: "Your meetup request has been sent successfully.",
          icon: "success",
          confirmButtonColor: "#6c63ff",
        });

        // Refresh meetup data
        await fetchMeetupData(activeTab);

        // Close dialog
        setMeetupDialogOpen(false);
        setSelectedRequestId(null);

        // Clear localStorage
        localStorage.removeItem("selectedAdoptId");
        localStorage.removeItem("selectedPetId");
        localStorage.removeItem("meetupRole");
      } else {
        throw new Error("Invalid response from server - no meetup ID returned");
      }
    } catch (error: any) {
      console.error("Error scheduling meetup:", error);

      // More detailed error handling
      let errorMessage = "Failed to schedule meetup. Please try again.";

      if (error.response) {
        // Server responded with error status
        console.error("Error response:", error.response);
        console.error("Error response data:", error.response.data);

        if (error.response.data?.message) {
          errorMessage = error.response.data.message;
        } else if (error.response.data?.error) {
          errorMessage = error.response.data.error;
        } else if (error.response.status === 400) {
          errorMessage =
            "Invalid meetup data. Please check your inputs and try again.";
        } else if (error.response.status === 401) {
          errorMessage =
            "You are not authorized to create this meetup. Please log in again.";
        } else if (error.response.status === 404) {
          errorMessage = "Adoption request not found. Please refresh the page.";
        } else if (error.response.status === 422) {
          errorMessage = "Validation error. Please check all required fields.";
        } else if (error.response.status === 500) {
          errorMessage = "Server error. Please try again later.";
        }
      } else if (error.request) {
        // Network error
        errorMessage =
          "Network error. Please check your connection and try again.";
      } else if (error.message) {
        // Client-side error
        errorMessage = error.message;
      }

      Swal.fire({
        title: "Error",
        text: errorMessage,
        icon: "error",
      });
    }
  };

  // Accept meetup request (changes status from PENDING to ACCEPTED)
  const handleAcceptMeetup = async (id: string, meetupId?: string) => {
    console.log("handleAcceptMeetup called with:", { id, meetupId });

    if (!meetupId) {
      console.error("Missing meetupId for accepting meetup");
      Swal.fire({
        title: "Error",
        text: "Missing meetup ID. Please refresh and try again.",
        icon: "error",
      });
      return;
    }

    try {
      console.log("Accepting meetup:", { id, meetupId });
      const response = await axiosInstance.patch(`/meet-up/${meetupId}`, {
        status: "ACCEPTED",
      });

      console.log("Accept meetup response:", response.data);

      Swal.fire({
        title: "Meetup Accepted!",
        text: "You have successfully accepted the meetup request.",
        icon: "success",
        confirmButtonColor: "#6c63ff",
      });

      // Refresh data
      await fetchMeetupData(activeTab);
    } catch (error) {
      console.error("Error updating meetup status:", error);
      Swal.fire({
        title: "Error",
        text: "Failed to accept meetup. Please try again.",
        icon: "error",
      });
    }
  };

  // Reject meetup request (changes status from PENDING to REJECTED)
  const handleRejectMeetup = async (id: string, meetupId?: string) => {
    console.log("handleRejectMeetup called with:", { id, meetupId });

    if (!meetupId) {
      console.error("Missing meetupId for rejecting meetup");
      Swal.fire({
        title: "Error",
        text: "Missing meetup ID. Please refresh and try again.",
        icon: "error",
      });
      return;
    }

    try {
      console.log("Rejecting meetup:", { id, meetupId });

      // Show confirmation dialog
      const result = await Swal.fire({
        title: "Reject Meetup?",
        text: "Are you sure you want to reject this meetup request?",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Yes, Reject",
        cancelButtonText: "Cancel",
        confirmButtonColor: "#dc3545",
      });

      if (result.isConfirmed) {
        const response = await axiosInstance.patch(`/meet-up/${meetupId}`, {
          status: "REJECTED",
        });

        console.log("Reject meetup response:", response.data);

        Swal.fire({
          title: "Meetup Rejected",
          text: "You have rejected the meetup request.",
          icon: "info",
          confirmButtonColor: "#6c63ff",
        });

        // Refresh data
        await fetchMeetupData(activeTab);
      }
    } catch (error) {
      console.error("Error rejecting meetup:", error);
      Swal.fire({
        title: "Error",
        text: "Failed to reject meetup. Please try again.",
        icon: "error",
      });
    }
  };

  // Confirm RECEIVED meetup (changes status from ACCEPTED to RECEIVED)
  const handleConfirmRECEIVED = async (id: string, meetupId?: string) => {
    console.log("handleConfirmRECEIVED called with:", { id, meetupId });

    if (!meetupId) {
      console.error("Missing meetupId for confirming RECEIVED");
      Swal.fire({
        title: "Error",
        text: "Missing meetup ID. Please refresh and try again.",
        icon: "error",
      });
      return;
    }

    try {
      console.log("Confirming RECEIVED:", { id, meetupId });

      // Show confirmation dialog
      const result = await Swal.fire({
        title: "Confirm Meetup Completed?",
        text: "Have you met and completed the handover?",
        icon: "question",
        showCancelButton: true,
        confirmButtonText: "Yes, Completed",
        cancelButtonText: "Not Yet",
        confirmButtonColor: "#28a745",
      });

      if (result.isConfirmed) {
        const response = await axiosInstance.patch(`/meet-up/${meetupId}`, {
          status: "RECEIVED",
        });

        console.log("Confirm RECEIVED response:", response.data);

        Swal.fire({
          title: "Meetup Completed!",
          text: "You have confirmed the meetup was completed successfully.",
          icon: "success",
          confirmButtonColor: "#6c63ff",
        });

        // Refresh data
        await fetchMeetupData(activeTab);
      }
    } catch (error) {
      console.error("Error confirming RECEIVED:", error);
      Swal.fire({
        title: "Error",
        text: "Failed to confirm meetup completion. Please try again.",
        icon: "error",
      });
    }
  };

  // Cancel meetup request
  const handleCancelMeetup = async (id: string, meetupId?: string) => {
    if (!meetupId) {
      console.error("Missing meetupId for canceling meetup");
      return;
    }

    try {
      console.log("Canceling meetup:", { id, meetupId });
      const response = await axiosInstance.delete(`/meet-up/${meetupId}`);

      console.log("Cancel meetup response:", response.data);

      setShowMeetupDetails((prev) => ({
        ...prev,
        [id]: false,
      }));

      Swal.fire({
        title: "Meetup Cancelled",
        text: "The meetup has been cancelled.",
        icon: "info",
        confirmButtonColor: "#6c63ff",
      });

      // Refresh data
      await fetchMeetupData(activeTab);
    } catch (error) {
      console.error("Error deleting meetup:", error);
      Swal.fire({
        title: "Error",
        text: "Failed to cancel meetup. Please try again.",
        icon: "error",
      });
    }
  };

  const selectedRequest = selectedRequestId
    ? meetupRequests.find((req) => req.id === selectedRequestId)
    : null;

  // Check if meetups are available (for seller tab)
  const isMeetupAvailable = (id: string) => {
    if (activeTab !== "seller") return true;

    return !meetupRequests.some(
      (req) =>
        req.id !== id &&
        (req.meetupStatus === "PENDING" || req.meetupStatus === "RECEIVED")
    );
  };

  // Check if the user is the requester of the meetup
  const isCurrentUserMeetupRequester = (request: MeetupRequest) => {
    return request.meetupRequester === currentUserId;
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
        <Typography sx={{ ml: 2 }}>
          Loading {activeTab} meetup data...
        </Typography>
      </Box>
    );
  }

  // Render error state
  if (error) {
    return (
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          height: "300px",
          gap: 2,
        }}
      >
        <Typography color="error">{error}</Typography>
        <Button
          variant="contained"
          onClick={() => {
            setError(null);
            setLoading(true);
            fetchMeetupData(activeTab);
          }}
        >
          ລອງໃໝ່
        </Button>
      </Box>
    );
  }

  // Render meetup details card
  const renderMeetupDetails = (request: MeetupRequest) => {
    if (!request.meetupDetails) return null;

    return (
      <Card sx={{ mt: 2, mb: 2, backgroundColor: "#f0f7ff", borderRadius: 2 }}>
        <CardContent>
          <Typography
            variant="subtitle2"
            fontWeight="bold"
            color="primary"
            gutterBottom
          >
            ລາຍລະອຽດການນັດຮັບສັດ
          </Typography>

          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <Stack
                direction="row"
                spacing={1}
                alignItems="center"
                sx={{ mb: 1 }}
              >
                <AccessTimeIcon color="primary" fontSize="small" />
                <Typography variant="body2">
                  ມື້ ແລະ ເວລາ: {request?.scheduledDateTime || "Unknown"}
                </Typography>
              </Stack>
            </Grid>

            <Grid item xs={12} md={4}>
              <Stack
                direction="row"
                spacing={1}
                alignItems="center"
                sx={{ mb: 1 }}
              >
                <LocationOnIcon color="primary" fontSize="small" />
                <Typography variant="body2">
                  ສະຖານທີ: {request?.locationDetails || "Unknown"}
                </Typography>
              </Stack>

              {request.meetupDetails.mapLink && (
                <Stack direction="row" spacing={1} alignItems="center">
                  <MapIcon color="primary" fontSize="small" />
                  <Typography variant="body2">
                    <a
                      href={request?.link || "Unknown"}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ color: "#6c63ff", textDecoration: "none" }}
                    >
                     ເບິ່ງແຜ່ນທີ່ນັດພົບ
                    </a>
                  </Typography>
                </Stack>
              )}
            </Grid>

            {/* MEETUP BUTTONS */}
            <Grid item xs={12}>
              <Divider sx={{ my: 1 }} />
              <Stack
                direction="row"
                spacing={2}
                alignItems="center"
                flexWrap="wrap"
              >
                {/* PENDING STATUS - Show Accept/Reject buttons */}
                {request.meetupStatus === "PENDING" && (
                  <>
                    <Chip
                      icon={<PendingIcon />}
                      label={
                        isCurrentUserMeetupRequester(request)
                          ? "ຖ້າການຍອມຮັບ"
                          : "ຄຳຮ້ອງຂໍນັດພົບໄດ້ຮັບແລ້ວ"
                      }
                      color="warning"
                      sx={{ mt: 1 }}
                    />

                    {!isCurrentUserMeetupRequester(request) && (
                      <>
                        <Button
                          variant="contained"
                          color="success"
                          size="small"
                          onClick={(e) => {
                            e.stopPropagation();
                            e.preventDefault();
                            console.log(
                              "Accept button clicked for:",
                              request.id,
                              request.meetupId
                            );
                            handleAcceptMeetup(request.id, request.meetupId);
                          }}
                          sx={{
                            borderRadius: 2,
                            bgcolor: "#28a745",
                            "&:hover": { bgcolor: "#218838" },
                          }}
                        >
                          ຢືນຢັນການນັດ
                        </Button>

                        <Button
                          variant="outlined"
                          color="error"
                          size="small"
                          onClick={(e) => {
                            e.stopPropagation();
                            e.preventDefault();
                            console.log(
                              "Reject button clicked for:",
                              request.id,
                              request.meetupId
                            );
                            handleRejectMeetup(request.id, request.meetupId);
                          }}
                          sx={{ borderRadius: 2 }}
                        >
                          ປະຕິເສດການນັດ
                        </Button>
                      </>
                    )}

                    {isCurrentUserMeetupRequester(request) && (
                      <Button
                        variant="outlined"
                        color="error"
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation();
                          e.preventDefault();
                          console.log(
                            "Cancel button clicked for:",
                            request.id,
                            request.meetupId
                          );
                          handleCancelMeetup(request.id, request.meetupId);
                        }}
                        sx={{ borderRadius: 2 }}
                      >
                        ຍົກເລີກການນັດ
                      </Button>
                    )}
                  </>
                )}

                {/* ACCEPTED STATUS - Show Confirm RECEIVED button */}
                {request.meetupStatus === "ACCEPTED" && (
                  <>
                    <Button
                      variant="contained"
                      color="primary"
                      size="small"
                      onClick={(e) => {
                        e.stopPropagation();
                        e.preventDefault();
                        console.log(
                          "Confirm RECEIVED button clicked for:",
                          request.id,
                          request.meetupId
                        );
                        handleConfirmRECEIVED(request.id, request.meetupId);
                      }}
                      sx={{
                        borderRadius: 2,
                        mb: 3,
                        bgcolor: "#6c63ff",
                        "&:hover": { bgcolor: "#5a54d9" },
                      }}
                      startIcon={<VerifiedUserIcon />}
                    >
                      ຢືນຢັນວ່າໄດ້ຮັບສັດແລ້ວ
                    </Button>
                  </>
                )}

                {/* REJECTED STATUS */}
                {request.meetupStatus === "REJECTED" && (
                  <Chip
                    icon={<CancelIcon />}
                    label="Meetup Rejected"
                    color="error"
                    sx={{ mt: 1 }}
                  />
                )}

                {/* RECEIVED STATUS - Meetup completed */}
                {request.meetupStatus === "RECEIVED" &&
                  !request.adoptionStatus && (
                    <>
                      <Chip
                        icon={<VerifiedUserIcon />}
                        label="Meetup Completed"
                        color="success"
                        sx={{ mt: 1, bgcolor: "#28a745", color: "white" }}
                      />

                      {activeTab === "buyer" && (
                        <Typography
                          color="text.secondary"
                          variant="body2"
                          sx={{ mt: 1 }}
                        >
                          Waiting for pet owner to finalize adoption...
                        </Typography>
                      )}
                    </>
                  )}

                {/* COMPLETED ADOPTION */}
                {request.adoptionStatus === "COMPLETED" && (
                  <Chip
                    icon={<CelebrationIcon />}
                    label="Adoption Completed!"
                    color="success"
                    sx={{ mt: 1, bgcolor: "#28a745", color: "white" }}
                  />
                )}
              </Stack>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    );
  };

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
          {/* FIXED: Tab values now match their labels */}
          <Tabs
            value={activeTab}
            onChange={handleTabChange}
            aria-label="buyer or seller meetup tabs"
            sx={{
              "& .MuiTabs-indicator": {
                backgroundColor: "#6c63ff",
              },
              "& .MuiTab-root.Mui-selected": {
                color: "#6c63ff",
              },
            }}
          >
            <Tab label="ຜູ້ຊື້" value="seller" />
            <Tab label="ຜູ້ຂາຍ" value="buyer" />
            
          </Tabs>
        </Box>

        <TableContainer>
          <Table aria-label="meetup requests table">
            <TableHead sx={{ backgroundColor: "#f5f5ff" }}>
              <TableRow>
                <TableCell width="30px"></TableCell>
                <TableCell sx={{ fontWeight: 500 }}>
                  {/* FIXED: Show correct label based on tab */}
                  {activeTab === "buyer" ? "ຊື່ຜູ້ຂາຍ" : "ຊື່ຜູ້ຊື້"}
                </TableCell>
                <TableCell sx={{ fontWeight: 500 }}>
                  ເວລາເລີ່ມສົ່ງຄຳຮ້ອງຂໍ
                </TableCell>
                <TableCell sx={{ fontWeight: 500 }}>ສະຖານະການນັດພົບ</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {meetupRequests.length > 0 ? (
                meetupRequests.map((request, index) => {
                  console.log(`Rendering request ${index}:`, request);
                  return (
                    <React.Fragment key={request.id}>
                      <TableRow
                        sx={{
                          "& > *": { borderBottom: "unset" },
                          backgroundColor: openRows[request.id]
                            ? "#f5f5ff"
                            : "inherit",
                          "&:hover": { backgroundColor: "#f0f0ff" },
                          cursor: "pointer",
                        }}
                        onClick={(e) => {
                          e.preventDefault();
                          console.log("Row clicked for request:", request.id);
                          toggleRow(request.id);
                        }}
                      >
                        <TableCell>
                          <IconButton
                            aria-label="expand row"
                            size="small"
                            onClick={(e) => {
                              e.stopPropagation();
                              console.log(
                                "Arrow button clicked for:",
                                request.id
                              );
                              toggleRow(request.id);
                            }}
                          >
                            {openRows[request.id] ? (
                              <KeyboardArrowUpIcon sx={{ color: "#6c63ff" }} />
                            ) : (
                              <KeyboardArrowDownIcon
                                sx={{ color: "#6c63ff" }}
                              />
                            )}
                          </IconButton>
                        </TableCell>
                        <TableCell>
                          <Stack
                            direction="row"
                            spacing={1.5}
                            alignItems="center"
                          >
                            {/* FIXED: Show other user's info (seller for buyer tab, buyer for seller tab) */}
                            <Typography>
                              {request.otherUserInfo.firstName}
                            </Typography>
                          </Stack>
                        </TableCell>
                        <TableCell>
                          <Stack
                            direction="row"
                            spacing={1}
                            alignItems="center"
                          >
                            <DateRangeIcon
                              fontSize="small"
                              sx={{ color: "text.secondary", opacity: 0.7 }}
                            />
                            <Typography>{request.dateOfRequest}</Typography>
                          </Stack>
                        </TableCell>
                        <TableCell>
                          <Stack
                            direction="row"
                            spacing={1}
                            alignItems="center"
                          >
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
                            ) : request.meetupStatus === "NONE" ? (
                              <Chip
                                icon={<ScheduleIcon fontSize="small" />}
                                label="No Meetup"
                                color="default"
                                variant="outlined"
                                size="small"
                                sx={{
                                  fontWeight: 500,
                                  minWidth: 100,
                                  justifyContent: "center",
                                }}
                              />
                            ) : (
                              <>
                                {request.meetupStatus === "PENDING" && (
                                  <Chip
                                    icon={<PendingIcon fontSize="small" />}
                                    label="Meetup Pending"
                                    color="warning"
                                    variant="outlined"
                                    size="small"
                                    sx={{ fontSize: "0.75rem" }}
                                  />
                                )}
                                {request.meetupStatus === "ACCEPTED" && (
                                  <Chip
                                    icon={<CheckCircleIcon fontSize="small" />}
                                    label="Meetup Accepted"
                                    color="info"
                                    variant="outlined"
                                    size="small"
                                    sx={{
                                      fontSize: "0.75rem",
                                      borderColor: "#17a2b8",
                                      color: "#17a2b8",
                                    }}
                                  />
                                )}
                                {request.meetupStatus === "REJECTED" && (
                                  <Chip
                                    icon={<CancelIcon fontSize="small" />}
                                    label="Meetup Rejected"
                                    color="error"
                                    variant="outlined"
                                    size="small"
                                    sx={{ fontSize: "0.75rem" }}
                                  />
                                )}
                                {request.meetupStatus === "RECEIVED" && (
                                  <Chip
                                    icon={<VerifiedUserIcon fontSize="small" />}
                                    label="Meetup Completed"
                                    color="success"
                                    variant="outlined"
                                    size="small"
                                    sx={{
                                      fontSize: "0.75rem",
                                      borderColor: "#28a745",
                                      color: "#28a745",
                                    }}
                                  />
                                )}
                              </>
                            )}
                          </Stack>
                        </TableCell>
                      </TableRow>
                      {/* Expandable row content */}
                      <TableRow>
                        <TableCell
                          style={{ paddingBottom: 0, paddingTop: 0 }}
                          colSpan={6}
                        >
                          <Collapse
                            in={openRows[request.id]}
                            timeout="auto"
                            unmountOnExit
                          >
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
                                {/* User Information Column - FIXED: Show correct user info */}
                                <Grid item xs={12} md={4}>
                                  <Box sx={{ mb: 2 }}>
                                    <Typography
                                      variant="subtitle1"
                                      fontWeight="bold"
                                      color="primary"
                                      gutterBottom
                                    >
                                      {activeTab === "buyer"
                                        ? "ຂໍ້ມູນຜູ້ຂາຍ"
                                        : "ຂໍ້ມູນຜູ້ຊື້"}
                                    </Typography>
                                    <Divider sx={{ mb: 2 }} />

                                    <Stack
                                      direction="row"
                                      spacing={1}
                                      alignItems="center"
                                      sx={{ mb: 2 }}
                                    >
                                      <Avatar 
                                        src={request.otherUserInfo.avatar}
                                        sx={{ width: 40, height: 40 }}
                                      />
                                      <Typography variant="body2" fontWeight="medium">
                                        {request.otherUserInfo.firstName}
                                      </Typography>
                                    </Stack>

                                    <Stack
                                      direction="row"
                                      spacing={1}
                                      alignItems="center"
                                      sx={{ mb: 2 }}
                                    >
                                      <EmailIcon
                                        color="action"
                                        fontSize="small"
                                      />
                                      <Typography variant="body2">
                                        {request.otherUserInfo.email}
                                      </Typography>
                                    </Stack>

                                    <Stack
                                      direction="row"
                                      spacing={1}
                                      alignItems="center"
                                      sx={{ mb: 2 }}
                                    >
                                      <PhoneIcon
                                        color="action"
                                        fontSize="small"
                                      />
                                      <Typography variant="body2">
                                        {request.otherUserInfo.tel}
                                      </Typography>
                                    </Stack>

                                    <Stack
                                      direction="row"
                                      spacing={1}
                                      alignItems="center"
                                      sx={{ mb: 2 }}
                                    >
                                      <HomeIcon
                                        color="action"
                                        fontSize="small"
                                      />
                                      <Typography variant="body2">
                                        Status: {request.meetupStatus}
                                      </Typography>
                                    </Stack>
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
                                        src={request.petDetails?.image}
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
                                          <PetsIcon
                                            color="primary"
                                            fontSize="small"
                                          />
                                          <Typography
                                            variant="body1"
                                            fontWeight="medium"
                                          >
                                            {request.petDetails?.name}
                                          </Typography>

                                          {request.adoptionStatus ===
                                            "COMPLETED" && (
                                            <Chip
                                              icon={
                                                <CelebrationIcon fontSize="small" />
                                              }
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

                                        <Stack
                                          direction="row"
                                          spacing={3}
                                          sx={{ mb: 2 }}
                                        >
                                          <Stack
                                            direction="row"
                                            spacing={1}
                                            alignItems="center"
                                          >
                                            <CalendarTodayIcon
                                              color="action"
                                              fontSize="small"
                                            />
                                            <Typography variant="body2">
                                              {request.petDetails?.age}
                                            </Typography>
                                          </Stack>

                                          <Stack
                                            direction="row"
                                            spacing={1}
                                            alignItems="center"
                                          >
                                            {request.petDetails?.gender ===
                                            "male" ? (
                                              <MaleIcon
                                                color="info"
                                                fontSize="small"
                                              />
                                            ) : (
                                              <FemaleIcon
                                                color="error"
                                                fontSize="small"
                                              />
                                            )}
                                            <Typography
                                              variant="body2"
                                              sx={{
                                                textTransform: "capitalize",
                                              }}
                                            >
                                              {request.petDetails?.gender}
                                            </Typography>
                                          </Stack>
                                        </Stack>

                                        <Stack
                                          direction="row"
                                          spacing={1}
                                          alignItems="center"
                                          sx={{ mb: 2 }}
                                        >
                                          <StraightenIcon
                                            color="action"
                                            fontSize="small"
                                          />
                                          <Typography
                                            variant="body2"
                                            sx={{ textTransform: "capitalize" }}
                                          >
                                            Size: {request.petDetails?.size}
                                          </Typography>
                                        </Stack>
                                      </Box>
                                    </Box>

                                    {/* Show meetup details if they exist and are visible */}
                                    {request.meetupDetails && (
                                      <>
                                        {showMeetupDetails[request.id] ? (
                                          <>
                                            {renderMeetupDetails(request)}
                                            <Button
                                              variant="text"
                                              color="primary"
                                              size="small"
                                              onClick={(e) => {
                                                e.stopPropagation();
                                                console.log(
                                                  "Hide meetup details clicked for:",
                                                  request.id
                                                );
                                                toggleMeetupDetails(request.id);
                                              }}
                                              sx={{ mt: 1 }}
                                            >
                                              ບໍ່ສະແດງຂໍ້ມູນການນັດຮັບ
                                            </Button>
                                          </>
                                        ) : (
                                          <Button
                                            variant="text"
                                            color="primary"
                                            size="small"
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              console.log(
                                                "Show meetup details clicked for:",
                                                request.id
                                              );
                                              toggleMeetupDetails(request.id);
                                            }}
                                            sx={{ mt: 1 }}
                                            startIcon={<DateRangeIcon />}
                                          >
                                            ສະແດງຂໍ້ມູນການນັດຮັບ
                                            {request.meetupStatus ===
                                              "PENDING" &&
                                              !isCurrentUserMeetupRequester(
                                                request
                                              ) && (
                                                <Chip
                                                  label="Action Needed"
                                                  size="small"
                                                  color="warning"
                                                  sx={{
                                                    ml: 1,
                                                    height: 20,
                                                    fontSize: "0.6rem",
                                                  }}
                                                />
                                              )}
                                            {request.meetupStatus ===
                                              "ACCEPTED" && (
                                              <Chip
                                                label="Confirm RECEIVED"
                                                size="small"
                                                color="info"
                                                sx={{
                                                  ml: 1,
                                                  height: 20,
                                                  fontSize: "0.6rem",
                                                  bgcolor: "#17a2b8",
                                                  color: "white",
                                                }}
                                              />
                                            )}
                                            {request.meetupStatus ===
                                              "RECEIVED" &&
                                              activeTab === "seller" && (
                                                <Chip
                                                  label="Ready to Finalize"
                                                  size="small"
                                                  color="success"
                                                  sx={{
                                                    ml: 1,
                                                    height: 20,
                                                    fontSize: "0.6rem",
                                                    bgcolor: "#28a745",
                                                    color: "white",
                                                  }}
                                                />
                                              )}
                                          </Button>
                                        )}
                                      </>
                                    )}
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
                                        <Typography
                                          color="success.main"
                                          fontWeight="medium"
                                        >
                                          ການຮັບລ້ຽງສຳເລັດແລ້ວ -
                                          ສັດລ້ຽງໄດ້ພົບບ້ານໃໝ່ແລ້ວ!
                                        </Typography>
                                      </Box>
                                    ) : (
                                      <>
                                        {/* SCHEDULE MEETUP BUTTON */}
                                        {request.meetupStatus === "NONE" &&
                                          isMeetupAvailable(request.id) && (
                                            <Button
                                              variant="contained"
                                              color="primary"
                                              size="medium"
                                              onClick={() =>
                                                handleMeetup(request)
                                              }
                                              sx={{
                                                backgroundColor: "#6c63ff",
                                                borderRadius: 2,
                                                boxShadow:
                                                  "0 4px 10px rgba(108, 99, 255, 0.3)",
                                                minWidth: 150,
                                              }}
                                            >
                                              ກຳນົດການນັດຮັບ
                                            </Button>
                                          )}

                                        {/* PENDING MEETUP STATUS */}
                                        {request.meetupStatus === "PENDING" && (
                                          <Typography
                                            color="text.secondary"
                                            fontStyle="italic"
                                            sx={{
                                              display: "flex",
                                              alignItems: "center",
                                            }}
                                          >
                                            <PendingIcon
                                              fontSize="small"
                                              sx={{ mr: 1 }}
                                            />
                                            {isCurrentUserMeetupRequester(
                                              request
                                            )
                                              ? "ກຳລັງລໍຖ້າການຢືນຢັນການນັດພົບ..."
                                              : "ມີຄຳຮ້ອງຂໍນັດພົບ - ກະລຸນາກວດເບິ່ງລາຍລະອຽດ"}
                                          </Typography>
                                        )}

                                        {/* ACCEPTED STATUS */}
                                        {request.meetupStatus ===
                                          "ACCEPTED" && (
                                          <Typography
                                            color="info.main"
                                            fontStyle="italic"
                                            sx={{
                                              display: "flex",
                                              alignItems: "center",
                                            }}
                                          >
                                            <CheckCircleIcon
                                              fontSize="small"
                                              sx={{ mr: 1 }}
                                            />
                                            ການນັດພົບໄດ້ຮັບການຢືນຢັນແລ້ວ -
                                            ກະລຸນາຢືນຢັນການຮັບມອບ
                                          </Typography>
                                        )}

                                        {/* REJECTED STATUS */}
                                        {request.meetupStatus ===
                                          "REJECTED" && (
                                          <Typography
                                            color="error.main"
                                            fontStyle="italic"
                                            sx={{
                                              display: "flex",
                                              alignItems: "center",
                                            }}
                                          >
                                            <CancelIcon
                                              fontSize="small"
                                              sx={{ mr: 1 }}
                                            />
                                            ການນັດພົບຖືກປະຕິເສດ
                                          </Typography>
                                        )}

                                        {/* RECEIVED STATUS (Meetup Completed) */}
                                        {request.meetupStatus ===
                                          "RECEIVED" && (
                                          <Typography
                                            color="success.main"
                                            fontStyle="italic"
                                            sx={{
                                              display: "flex",
                                              alignItems: "center",
                                            }}
                                          >
                                            <VerifiedUserIcon
                                              fontSize="small"
                                              sx={{ mr: 1 }}
                                            />
                                            {activeTab === "buyer"
                                              ? "ການນັດພົບສຳເລັດ - ລໍຖ້າເຈົ້າຂອງສັດລ້ຽງສິ້ນສຸດການຮັບລ້ຽງ"
                                              : "ການນັດພົບສຳເລັດ - ກະລຸນາສິ້ນສຸດການຮັບລ້ຽງ"}
                                          </Typography>
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
                    </React.Fragment>
                  );
                })
              ) : (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    <Box sx={{ py: 4 }}>
                      <Typography color="textSecondary">
                        ບໍ່ພົບການນັດພົບທີ່ພ້ອມສຳລັບການຈັດການ
                      </Typography>
                    </Box>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Meetup Dialog */}
      <MeetupDialog
        open={meetupDialogOpen}
        onClose={handleDialogClose}
        onApply={handleApplyMeetup}
        petName={selectedRequest?.petDetails?.name || ""}
      />

      {/* Existing Meetup Details Dialog */}
      <Dialog
        open={meetupDetailsDialogOpen}
        onClose={handleMeetupDetailsDialogClose}
        aria-labelledby="meetup-details-dialog-title"
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle id="meetup-details-dialog-title" sx={{ pb: 1 }}>
          <Stack direction="row" spacing={1} alignItems="center">
            <ScheduleIcon color="primary" />
            <Typography variant="h6">ລາຍລະອຽດການນັດພົບທີ່ມີຢູ່ແລ້ວ</Typography>
          </Stack>
        </DialogTitle>
        <DialogContent dividers>
          {existingMeetupDetails && (
            <>
              <Typography
                variant="subtitle1"
                color="text.secondary"
                gutterBottom
              >
                ໄດ້ກຳນົດເວລານັດພົບແລ້ວສຳລັບ {existingMeetupDetails.petName} with{" "}
                {existingMeetupDetails.requesterName}.
              </Typography>

              <Box sx={{ mt: 3, p: 2, bgcolor: "#f0f7ff", borderRadius: 2 }}>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <Stack
                      direction="row"
                      spacing={1}
                      alignItems="center"
                      sx={{ mb: 2 }}
                    >
                      <DateRangeIcon color="primary" fontSize="small" />
                      <Typography variant="body1">
                        {existingMeetupDetails.meetupDetails?.date}
                      </Typography>
                    </Stack>

                    <Stack direction="row" spacing={1} alignItems="center">
                      <AccessTimeIcon color="primary" fontSize="small" />
                      <Typography variant="body1">
                        {existingMeetupDetails.meetupDetails?.time}
                      </Typography>
                    </Stack>
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <Stack
                      direction="row"
                      spacing={1}
                      alignItems="center"
                      sx={{ mb: 2 }}
                    >
                      <LocationOnIcon color="primary" fontSize="small" />
                      <Typography variant="body1">
                        {existingMeetupDetails.meetupDetails?.location}
                      </Typography>
                    </Stack>

                    {existingMeetupDetails.meetupDetails?.mapLink && (
                      <Stack direction="row" spacing={1} alignItems="center">
                        <MapIcon color="primary" fontSize="small" />
                        <Typography variant="body1">
                          <a
                            href={existingMeetupDetails.meetupDetails.mapLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{ color: "#6c63ff", textDecoration: "none" }}
                          >
                            ເບິ່ງໃນແຜນທີ່ຕັ້ງ
                          </a>
                        </Typography>
                      </Stack>
                    )}
                  </Grid>
                </Grid>
              </Box>

              <Typography variant="body2" color="text.secondary" sx={{ mt: 3 }}>
                ທ່ານສາມາດກຳນົດເວລານັດພົບໄດ້ເມື່ອນັດພົບປັດຈຸບັນຖືກຍົກເລີກ ຫຼື
                ສຳເລັດ.
              </Typography>
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button
            onClick={handleMeetupDetailsDialogClose}
            variant="contained"
            color="primary"
            sx={{ borderRadius: 2 }}
          >
            ປິດ
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default MeetupManagementTable;