import React, { useState, useEffect } from "react";
import {
  Dialog,
  Button,
  Paper,
  Typography,
  Box,
  TextField,
  Divider,
  IconButton,
  CircularProgress,
  Snackbar,
  Alert,
  Fade,
  Chip,
  Avatar,
  useMediaQuery,
  useTheme
} from "@mui/material";
import { styled } from "@mui/material/styles";
import CloseIcon from "@mui/icons-material/Close";
import ConfirmationNumberIcon from "@mui/icons-material/ConfirmationNumber";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import EmailIcon from "@mui/icons-material/Email";
import PhoneIcon from "@mui/icons-material/Phone";
import PetsIcon from "@mui/icons-material/Pets";
import axiosInstance from "../../configs/axios";

// Define interfaces for our data types
interface AnimalDetails {
  id: string;
  name: string;
  species: string;
  breed?: string;
  age?: string;
  basePrice: number;
  imageUrl?: string;
  status?: string; // Added status field to check if pet is already adopted
}

interface BuyerDetails {
  id: string;
  name: string;
  email: string;
  phone?: string;
}

interface PaymentDialogProps {
  open: boolean;
  onClose: () => void;
  animalDetails: AnimalDetails;
  buyerDetails: BuyerDetails;
}

interface PaymentApiPayload {
  petId: string;
  amount: number;
  status: string;
}

// Styled components with updated design
const ContentWrapper = styled(Box)(({ theme }) => ({
  display: "flex",
  flexDirection: "row",
  [theme.breakpoints.down("md")]: {
    flexDirection: "column",
  },
}));

const BlueSection = styled(Box)(({ theme }) => ({
  backgroundColor: "#6c63ff", // Brighter purple
  backgroundImage: "linear-gradient(135deg, #D5D1F0 0%, #9990DA 100%)",
  color: "white",
  padding: theme.spacing(4),
  borderTopLeftRadius: theme.shape.borderRadius,
  borderBottomLeftRadius: theme.shape.borderRadius,
  [theme.breakpoints.down("md")]: {
    borderTopLeftRadius: theme.shape.borderRadius,
    borderTopRightRadius: theme.shape.borderRadius,
    borderBottomLeftRadius: 0,
  },
  position: "relative",
  overflow: "hidden",
  "&::after": {
    content: '""',
    position: "absolute",
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    background: "radial-gradient(circle at bottom right, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0) 70%)",
    pointerEvents: "none",
  }
}));

const WhiteSection = styled(Box)(({ theme }) => ({
  backgroundColor: "white",
  padding: theme.spacing(4),
  borderTopRightRadius: theme.shape.borderRadius,
  borderBottomRightRadius: theme.shape.borderRadius,
  [theme.breakpoints.down("md")]: {
    borderBottomLeftRadius: theme.shape.borderRadius,
    borderBottomRightRadius: theme.shape.borderRadius,
    borderTopRightRadius: 0,
  },
  boxShadow: "inset 1px 0 0 rgba(0, 0, 0, 0.05)",
}));

const InfoRow = styled(Box)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  marginBottom: theme.spacing(3),
}));

const CircleIcon = styled(Box)(({ theme }) => ({
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  borderRadius: "50%",
  backgroundColor: "rgba(255, 255, 255, 0.2)",
  width: 40,
  height: 40,
  marginRight: theme.spacing(2),
}));

const StyledTextField = styled(TextField)(({ theme }) => ({
  '& .MuiOutlinedInput-root': {
    borderRadius: theme.shape.borderRadius * 1.5,
    transition: theme.transitions.create(['border-color', 'box-shadow']),
    '&:hover fieldset': {
      borderColor: theme.palette.primary.main,
    },
    '&.Mui-focused fieldset': {
      borderColor: '#6c63ff',
      boxShadow: '0 0 0 2px rgba(108, 99, 255, 0.1)',
    },
  },
}));

const PaymentDialog: React.FC<PaymentDialogProps> = ({
  open,
  onClose,
  animalDetails,
  buyerDetails,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  const [paymentAmount, setPaymentAmount] = useState<number>(
    animalDetails.basePrice
  );
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [petId, setPetId] = useState<string>("");
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: "success" | "error" | "info";
  }>({
    open: false,
    message: "",
    severity: "info"
  });
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [isPetAlreadyAdopted, setIsPetAlreadyAdopted] = useState(false);

  // Get petId from localStorage and check if pet is already adopted when the dialog opens
  useEffect(() => {
    if (open) {
      // Reset states when dialog opens
      setPaymentSuccess(false);
      setError(null);
      
      // Try to get petId from localStorage first
      const storedPetId = localStorage.getItem('selectedPetId');
      
      // If not in localStorage, use the one from animalDetails
      const petIdToUse = storedPetId || animalDetails.id;
      
      setPetId(petIdToUse);
      
      // Set the payment amount directly from animalDetails
      setPaymentAmount(animalDetails.basePrice);
      
      // Check if pet is already adopted (has PAID status)
      setIsPetAlreadyAdopted(animalDetails.status === "PAID");
      
      console.log("Payment dialog initialized with petId:", petIdToUse);
      console.log("Setting payment amount to:", animalDetails.basePrice);
      console.log("Pet adoption status:", animalDetails.status);
    }
  }, [open, animalDetails.id, animalDetails.basePrice, animalDetails.status]);

  // Function to create payload for API
  const createApiPayload = (): PaymentApiPayload => {
    return {
      petId: petId,
      amount: paymentAmount,
      status: "PAID",
    };
  };

  // Function to send payment to API
  const createPayment = async (payload: PaymentApiPayload): Promise<boolean> => {
    try {
      console.log("Sending payment payload:", payload);
      
      const response = await axiosInstance.post('/payment', payload, {
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      // Check if request was successful
      if (response.status >= 200 && response.status < 300) {
        return true;
      } else {
        throw new Error(`API error: ${response.status}`);
      }
    } catch (error) {
      console.error('Error creating payment:', error);
      return false;
    }
  };

  const handlePaymentSubmit = async () => {
    // Validate payment amount
    if (paymentAmount <= 0) {
      setError("Payment amount must be greater than 0");
      return;
    }

    // Validate petId is available
    if (!petId) {
      setError("Pet information is missing. Please try again.");
      return;
    }

    // Check if pet is already adopted
    if (isPetAlreadyAdopted) {
      setError("This pet has already been adopted.");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      // Create and send the payment payload
      const payload = createApiPayload();
      const success = await createPayment(payload);
      
      if (success) {
        // Show success message
        setSnackbar({
          open: true,
          message: "Payment processed successfully!",
          severity: "success"
        });
        
        setPaymentSuccess(true);
        
        // Clear localStorage
        localStorage.removeItem('selectedPetId');
        
        // Close dialog after a short delay to show the success message
        setTimeout(() => {
          onClose();
        }, 3000);
      } else {
        setError("Payment processing failed. Please try again.");
        setIsSubmitting(false);
      }
    } catch (err) {
      setError("An unexpected error occurred. Please try again.");
      console.error("Payment submission error:", err);
      setIsSubmitting(false);
    }
  };

  const handleSnackbarClose = () => {
    setSnackbar(prev => ({
      ...prev,
      open: false
    }));
  };

  const generateConfirmationNumber = () => {
    return `PET${Math.floor(Math.random() * 1000000000)}G`;
  };

  const formatDate = () => {
    const date = new Date();
    return `${date.toLocaleString("default", {
      month: "short",
    })} ${date.getDate()}, ${date.getFullYear()}`;
  };

  const currentDate = formatDate();
  const currentDateTime = new Date().toLocaleString();
  const confirmationNumber = generateConfirmationNumber();

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  return (
    <>
      <Dialog
        open={open}
        onClose={paymentSuccess || isPetAlreadyAdopted ? onClose : undefined}
        fullWidth
        maxWidth="md"
        PaperProps={{
          sx: {
            borderRadius: 2,
            overflow: 'hidden',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12)'
          }
        }}
        TransitionComponent={Fade}
        TransitionProps={{ timeout: 300 }}
      >
        <Paper elevation={0} sx={{ overflow: "hidden" }}>
          <ContentWrapper>
            <BlueSection sx={{ width: isMobile ? "100%" : "40%" }}>
              <Box
                display="flex"
                justifyContent="space-between"
                alignItems="center"
                mb={3}
              >
                <Typography variant="h6" sx={{ fontWeight: 500, letterSpacing: 0.5 }}>
                  {isPetAlreadyAdopted ? 'ຂໍ້ມູນການຮັບລ້ຽງສັດ' : 'ໃບຮັບເງິນການຮັບລ້ຽງສັດ'}
                </Typography>
                <IconButton size="small" onClick={onClose} sx={{ color: "white" }} disabled={isSubmitting && !paymentSuccess && !isPetAlreadyAdopted}>
                  <CloseIcon />
                </IconButton>
              </Box>
              
              {/* Pet Image */}
              {animalDetails.imageUrl && (
                <Box sx={{ mb: 3, display: 'flex', justifyContent: 'center' }}>
                  <Avatar 
                    src={animalDetails.imageUrl} 
                    alt={animalDetails.name}
                    sx={{ 
                      width: 120, 
                      height: 120, 
                      border: '4px solid rgba(255,255,255,0.2)',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
                    }}
                  />
                </Box>
              )}
              
              <Typography variant="h5" fontWeight="bold" mb={4}>
                {animalDetails.name}
                <Chip 
                  label={animalDetails.species} 
                  size="small" 
                  sx={{ 
                    ml: 1, 
                    backgroundColor: 'rgba(255,255,255,0.2)',
                    color: 'white',
                    fontWeight: 500
                  }} 
                />
              </Typography>

              {/* Show different info if already adopted */}
              {isPetAlreadyAdopted ? (
                <InfoRow>
                  <CircleIcon>
                    <CheckCircleIcon />
                  </CircleIcon>
                  <Box>
                    <Typography variant="body2" sx={{ opacity: 0.85 }}>ສະຖານະ:</Typography>
                    <Typography variant="h6" fontWeight="bold">
                      ໄດ້ຮັບລ້ຽງແລ້ວ
                    </Typography>
                  </Box>
                </InfoRow>
              ) : (
                <InfoRow>
                  <CircleIcon>
                    <AttachMoneyIcon />
                  </CircleIcon>
                  <Box>
                    <Typography variant="body2" sx={{ opacity: 0.85 }}>ຈໍານວນ:</Typography>
                    <Typography variant="h6" fontWeight="bold">
                      {formatCurrency(paymentAmount)}
                    </Typography>
                  </Box>
                </InfoRow>
              )}

              <InfoRow>
                <CircleIcon>
                  <CalendarTodayIcon />
                </CircleIcon>
                <Box>
                  <Typography variant="body2" sx={{ opacity: 0.85 }}>ວັນທີ:</Typography>
                  <Typography variant="h6" fontWeight="bold">
                    {currentDate}
                  </Typography>
                </Box>
              </InfoRow>

              <InfoRow>
                <CircleIcon>
                  <ConfirmationNumberIcon />
                </CircleIcon>
                <Box>
                  <Typography variant="body2" sx={{ opacity: 0.85 }}>ເລກຢືນຢັນ:</Typography>
                  <Typography variant="h6" fontWeight="bold">
                    {confirmationNumber}
                  </Typography>
                </Box>
              </InfoRow>
              
              {/* Buyer information */}
              <Divider sx={{ my: 3, backgroundColor: 'rgba(255,255,255,0.2)' }} />
              
              <Typography variant="body2" sx={{ opacity: 0.85, mb: 2 }}>ຂໍ້ມູນຜູ້ຮັບລ້ຽງ:</Typography>
              
              <InfoRow>
                <CircleIcon>
                  <AccountCircleIcon />
                </CircleIcon>
                <Typography variant="body1" fontWeight="medium">
                  {buyerDetails.name}
                </Typography>
              </InfoRow>
              
              <InfoRow>
                <CircleIcon>
                  <EmailIcon />
                </CircleIcon>
                <Typography variant="body1" fontWeight="medium">
                  {buyerDetails.email}
                </Typography>
              </InfoRow>
              
              {buyerDetails.phone && (
                <InfoRow>
                  <CircleIcon>
                    <PhoneIcon />
                  </CircleIcon>
                  <Typography variant="body1" fontWeight="medium">
                    {buyerDetails.phone}
                  </Typography>
                </InfoRow>
              )}
            </BlueSection>

            <WhiteSection sx={{ width: isMobile ? "100%" : "60%" }}>
              <Box display="flex" justifyContent="flex-end" mb={2}>
                <Typography variant="body2" color="text.secondary">
                  {currentDateTime}
                </Typography>
              </Box>

              {/* Different content based on status */}
              {isPetAlreadyAdopted ? (
                // Already adopted message
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <CheckCircleIcon sx={{ fontSize: 80, color: '#4caf50', mb: 2 }} />
                  <Typography variant="h5" gutterBottom>
                    {animalDetails.name} ໄດ້ຮັບລ້ຽງແລ້ວ!
                  </Typography>
                  <Typography variant="body1" color="text.secondary" paragraph>
                    ຂໍອະໄພ, ສັດລ້ຽງໂຕນີ້ໄດ້ຖືກຮັບລ້ຽງໄປແລ້ວ. ພວກເຮົາມີສັດລ້ຽງໂຕອື່ນໆອີກຫຼາຍທີ່ກຳລັງລໍຖ້າຄອບຄົວທີ່ດີ!
                  </Typography>
                  <Button 
                    variant="contained" 
                    color="primary" 
                    sx={{ 
                      mt: 4,
                      bgcolor: "#6c63ff",
                      px: 4,
                      py: 1.5,
                      borderRadius: 2,
                      boxShadow: '0 4px 12px rgba(108, 99, 255, 0.25)',
                      '&:hover': {
                        bgcolor: "#5a54d4",
                        boxShadow: '0 6px 16px rgba(108, 99, 255, 0.35)',
                      },
                    }}
                    onClick={onClose}
                    startIcon={<PetsIcon />}
                  >
                    ຊອກຫາສັດລ້ຽງໂຕອື່ນ
                  </Button>
                </Box>
              ) : paymentSuccess ? (
                // Payment success message
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <CheckCircleIcon sx={{ fontSize: 80, color: '#4caf50', mb: 2 }} />
                  <Typography variant="h5" gutterBottom>
                    ຊຳລະເງິນສຳເລັດແລ້ວ!
                  </Typography>
                  <Typography variant="body1" color="text.secondary" paragraph>
                    ຂໍຂອບໃຈທີ່ຮັບລ້ຽງ {animalDetails.name}. ສັດລ້ຽງໂຕໃໝ່ຂອງທ່ານກຳລັງລໍຖ້າທ່ານຢູ່!
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    ໄດ້ສົ່ງອີເມວຢືນຢັນໄປທີ່ {buyerDetails.email} ແລ້ວ.
                  </Typography>
                  <Button 
                    variant="contained" 
                    sx={{ 
                      mt: 4,
                      bgcolor: "#6c63ff",
                      px: 4,
                      py: 1.5,
                      borderRadius: 2,
                      boxShadow: '0 4px 12px rgba(108, 99, 255, 0.25)',
                      '&:hover': {
                        bgcolor: "#5a54d4",
                        boxShadow: '0 6px 16px rgba(108, 99, 255, 0.35)',
                      },
                    }}
                    onClick={onClose}
                  >
                    ປິດ
                  </Button>
                </Box>
              ) : (
                // Regular payment form
                <>
                  <Box mb={4}>
                    <Typography variant="h5" mb={1} fontWeight={600}>
                      ການຮັບລ້ຽງ {animalDetails.species}
                      {animalDetails.breed ? ` (${animalDetails.breed})` : ""}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" paragraph>
                      ທ່ານກຳລັງຈະຊຳລະເງິນສຳລັບການຮັບລ້ຽງ {animalDetails.name}
                      {animalDetails.age ? ` (${animalDetails.age})` : ""}.
                    </Typography>
                    <Divider sx={{ my: 2 }} />
                    <Box display="flex" justifyContent="space-between" mt={1}>
                      <Typography variant="body1">ຄ່າທຳນຽມການຮັບລ້ຽງ:</Typography>
                      <Typography variant="body1" fontWeight="medium">
                        {formatCurrency(animalDetails.basePrice)}
                      </Typography>
                    </Box>
                    {animalDetails.basePrice !== paymentAmount && (
                      <Box display="flex" justifyContent="space-between" mt={1}>
                        <Typography variant="body1">ການຊຳລະຂອງທ່ານ:</Typography>
                        <Typography variant="body1" fontWeight="medium" color="primary">
                          {formatCurrency(paymentAmount)}
                        </Typography>
                      </Box>
                    )}
                  </Box>

                  <Box mb={4}>
                    <Typography variant="h6" gutterBottom fontWeight={500}>
                      ສະບາຍດີ {buyerDetails.name},
                    </Typography>
                    <Typography variant="body2" paragraph>
                      ກະລຸນາກວດສອບແລະຢືນຢັນການຊຳລະເງິນການຮັບລ້ຽງຂອງທ່ານສຳລັບ {animalDetails.name}.
                      ຄ່າທຳນຽມທັງໝົດຈະຖືກນຳໄປໃຊ້ໂດຍກົງໃນການດູແລສັດຢູ່ສູນພັກເຊົາຂອງພວກເຮົາ.
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      ສຳລັບຄຳຖາມ: payments@petshelter.com
                    </Typography>
                  </Box>

                  <Box mb={4}>
                    <StyledTextField
                      fullWidth
                      label="ຈໍານວນເງິນຊຳລະ"
                      type="number"
                      value={paymentAmount}
                      onChange={(e) => {
                        setPaymentAmount(Number(e.target.value));
                        setError(null);
                      }}
                      error={!!error}
                      helperText={error}
                      variant="outlined"
                      disabled={isSubmitting}
                      InputProps={{
                        startAdornment: <Box component="span" mr={1}>$</Box>
                      }}
                    />
                  </Box>
                  
                  <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 4 }}>
                    <Button 
                      onClick={onClose} 
                      color="inherit"
                      disabled={isSubmitting}
                      sx={{ mr: 2 }}
                    >
                      ຍົກເລີກ
                    </Button>
                    <Button
                      onClick={handlePaymentSubmit}
                      variant="contained"
                      sx={{ 
                        bgcolor: "#6c63ff",
                        px: 4,
                        py: 1.5,
                        borderRadius: 2,
                        boxShadow: '0 4px 12px rgba(108, 99, 255, 0.25)',
                        '&:hover': {
                          bgcolor: "#5a54d4",
                          boxShadow: '0 6px 16px rgba(108, 99, 255, 0.35)',
                        },
                        "&.Mui-disabled": {
                          bgcolor: "#9990DA",
                        }
                      }}
                      disabled={isSubmitting || !petId}
                    >
                      {isSubmitting ? (
                        <>
                          <CircularProgress size={20} color="inherit" sx={{ mr: 1 }} />
                          ກຳລັງດຳເນີນການ...
                        </>
                      ) : (
                        "ຢືນຢັນການຊຳລະ"
                      )}
                    </Button>
                  </Box>
                </>
              )}
            </WhiteSection>
          </ContentWrapper>
        </Paper>
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
          sx={{ 
            width: '100%',
            borderRadius: 2,
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
          }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
};

export default PaymentDialog;