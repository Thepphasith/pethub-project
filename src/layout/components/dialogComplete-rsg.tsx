import React from "react";
import {
  Dialog,
  DialogContent,
  DialogActions,
  Typography,
  Button,
  Box,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import LoginDialog from "./dialog-login"; // Assuming this is a component or hook for media query

interface CompletionDialogProps {
  open: boolean;
  onClose: () => void;
  onLoginClick: () => void;
  userName: string;
}

const RegistrationCompleteDialog: React.FC<CompletionDialogProps> = ({
  open,
  onClose,
  onLoginClick,
  userName,
}) => {
  const theme = useTheme();
  // Correctly using useMediaQuery hook for responsive design
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const handleLoginClick = () => {
    onClose(); // Close the current dialog
    onLoginClick(); // Open the login dialog
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
          p: 1,
          overflow: "visible",
        },
      }}
    >
      <DialogContent>
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            textAlign: "center",
            pt: 2,
            pb: 3,
          }}
        >
          <CheckCircleOutlineIcon
            sx={{
              fontSize: 80,
              color: "#45B26B",
              mb: 2,
            }}
          />

          <Typography variant="h5" fontWeight="bold" gutterBottom>
            ລົງທະບຽນສຳເລັດແລ້ວ!
          </Typography>

          <Typography
            variant="body1"
            color="text.secondary"
            sx={{ mb: 3, maxWidth: "85%", mx: "auto" }}
          >
            ຂໍສະແດງຄວາມຍິນດີ {userName}! ບັນຊີຂອງທ່ານໄດ້ຖືກສ້າງສຳເລັດແລ້ວ. ກະລຸນາລໍຖ້າໃຫ້ຜູ້ເບິ່ງແຍງລະບົບອະນຸມັດບັນຊີຂອງທ່ານໂດຍການສົ່ງ SMS ຫາທ່ານ (ເບີໂທລະສັບຂອງທ່ານຕ້ອງໄດ້ຮັບການຢືນຢັນເພື່ອຮັບຂໍ້ຄວາມອະນຸມັດ).
          </Typography>

          <Box
            sx={{
              bgcolor: "#f8f8ff",
              p: 2,
              borderRadius: 2,
              mb: 2,
              width: "100%",
              maxWidth: "450px",
            }}
          >
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              ຫຼັງຈາກຜູ້ເບິ່ງແຍງລະບົບອະນຸມັດແລ້ວ, ດ້ວຍບັນຊີ Pet-Hub ໃໝ່ຂອງທ່ານ, ທ່ານສາມາດ:
            </Typography>

            <Box component="ul" sx={{ pl: 2, m: 0, textAlign: "left" }}>
              <Typography component="li" variant="body2" color="text.secondary">
                ສ້າງໂປຣໄຟລ໌ສຳລັບສັດລ້ຽງຂອງທ່ານ
              </Typography>
              <Typography component="li" variant="body2" color="text.secondary">
                ຊອກຫາສັດລ້ຽງທີ່ພ້ອມໃຫ້ຮັບລ້ຽງ
              </Typography>
              <Typography component="li" variant="body2" color="text.secondary">
                ເຊື່ອມຕໍ່ກັບເຈົ້າຂອງສັດລ້ຽງອື່ນໆ
              </Typography>
              <Typography component="li" variant="body2" color="text.secondary">
                ເຂົ້າເຖິງຊັບພະຍາກອນການດູແລສັດລ້ຽງສະເພາະ
              </Typography>
            </Box>
          </Box>
        </Box>
      </DialogContent>

      <DialogActions
        sx={{
          p: 3,
          pt: 0,
          justifyContent: "center",
          flexDirection: isMobile ? "column" : "row",
          gap: 1,
        }}
      >
        <Button
          variant="outlined"
          onClick={onClose}
          sx={{
            borderRadius: 2,
            px: 3,
            py: 1,
            borderColor: "#9990DA",
            color: "#9990DA",
            "&:hover": {
              borderColor: "#6C63FF",
              backgroundColor: "rgba(108, 99, 255, 0.05)",
            },
            width: isMobile ? "100%" : "auto",
          }}
        >
          ປິດ
        </Button>

        <Button
          variant="contained"
          onClick={handleLoginClick}
          sx={{
            borderRadius: 2,
            px: 4,
            py: 1,
            bgcolor: "#9990DA",
            "&:hover": {
              backgroundColor: "#6C63FF",
            },
            width: isMobile ? "100%" : "auto",
          }}
        >
          ເຂົ້າສູ່ລະບົບດຽວນີ້
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default RegistrationCompleteDialog;
