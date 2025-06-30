import React, { useState, useEffect } from "react";
import {
  Button,
  Typography,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Paper,
  IconButton,
  Box,
  Stack,
  TextField,
  FormControlLabel,
  Checkbox,
  CircularProgress,
  Alert,
  Tooltip,
} from "@mui/material";
import {
  Close as CloseIcon,
  Info as InfoIcon,
  ArrowBack as ArrowBackIcon,
} from "@mui/icons-material";
import axiosInstance from "../../configs/axios";
import { RootState } from "../../store";
import { useSelector } from "react-redux";
import Swal from "sweetalert2";

// Report reasons for blogs
const blogReportReasons = [
  { id: 1, label: "ຂໍ້ມູນທີ່ບໍ່ຖືກຕ້ອງ", needsDetails: true },
  { id: 2, label: "ຄຳເວົ້າສ້າງຄວາມກຽດຊັງ", needsDetails: true },
  { id: 3, label: "ການຂົ່ມເຫັງ", needsDetails: true },
  { id: 4, label: "ການລະເມີດລິຂະສິດ", needsDetails: true },
  { id: 5, label: "ສະແປມ", needsDetails: false },
  { id: 6, label: "ເນື້ອຫາທີ່ບໍ່ເໝາະສົມ", needsDetails: true },
  { id: 7, label: "ການລັກຂະໂມຍຜົນງານ", needsDetails: true },
  { id: 8, label: "ການລະເມີດຄວາມເປັນສ່ວນຕົວ", needsDetails: true },
  { id: 9, label: "ເນື້ອຫາສຳລັບຜູ້ໃຫຍ່", needsDetails: false },
  { id: 10, label: "ກິດຈະກຳທີ່ຜິດກົດໝາຍ", needsDetails: true },
  { id: 11, label: "ເຫດຜົນອື່ນໆ", needsDetails: true },
];

// Detailed reason information
const detailedReasonInfo: Record<string, string> = {
  "ຂໍ້ມູນທີ່ບໍ່ຖືກຕ້ອງ":
    "ເນື້ອໃນທີ່ມີຂໍ້ມູນທີ່ບໍ່ຖືກຕ້ອງ ຫຼື ເຮັດໃຫ້ເຂົ້າໃຈຜິດທີ່ນຳສະເໜີເປັນຂໍ້ເທັດຈິງ.",
  "ຄຳເວົ້າສ້າງຄວາມກຽດຊັງ":
    "ເນື້ອໃນທີ່ສົ່ງເສີມການຈຳແນກ, ການລຳອຽງເຊື້ອຊາດ, ຫຼື ຄວາມຮຸນແຮງຕໍ່ບຸກຄົນ ຫຼື ກຸ່ມຄົນ.",
  "ການຂົ່ມເຫັງ":
    "ເນື້ອໃນທີ່ເປົ້າໝາຍໃສ່ບຸກຄົນດ້ວຍຂໍ້ຄວາມທີ່ຫຍາບຄາຍ, ຂົ່ມຂູ່, ຫຼື ຂົ່ມຂູ່.",
  "ການລະເມີດລິຂະສິດ":
    "ເນື້ອໃນທີ່ໃຊ້ວັດສະດຸທີ່ມີລິຂະສິດໂດຍບໍ່ໄດ້ຮັບອະນຸຍາດ.",
  "ສະແປມ": "ເນື້ອໃນທີ່ບໍ່ໄດ້ຮ້ອງຂໍທີ່ຊ້ຳກັນ ຫຼື ບໍ່ກ່ຽວຂ້ອງ.",
  "ເນື້ອຫາທີ່ບໍ່ເໝາະສົມ":
    "ເນື້ອໃນທີ່ລະເມີດມາດຕະຖານຊຸມຊົນ ຫຼື ເປັນການກະທຳຜິດ.",
  "ການລັກຂະໂມຍຜົນງານ": "ເນື້ອໃນທີ່ຄັດລອກມາຈາກແຫຼ່ງອື່ນໂດຍບໍ່ໄດ້ອ້າງອີງຢ່າງຖືກຕ້ອງ.",
  "ການລະເມີດຄວາມເປັນສ່ວນຕົວ":
    "ເນື້ອໃນທີ່ເປີດເຜີຍຂໍ້ມູນສ່ວນຕົວໂດຍບໍ່ໄດ້ຮັບຄວາມຍິນຍອມ.",
  "ເນື້ອຫາສຳລັບຜູ້ໃຫຍ່": "ເນື້ອໃນທີ່ມີເນື້ອຫາທາງເພດທີ່ຊັດເຈນ.",
  "ກິດຈະກຳທີ່ຜິດກົດໝາຍ":
    "ເນື້ອໃນທີ່ສົ່ງເສີມ ຫຼື ອຳນວຍຄວາມສະດວກໃຫ້ແກ່ກິດຈະກຳທີ່ຜິດກົດໝາຍ.",
  "ເຫດຜົນອື່ນໆ":
    "ກະລຸນາອະທິບາຍລາຍລະອຽດວ່າເປັນຫຍັງທ່ານຈຶ່ງລາຍງານເນື້ອໃນນີ້.",
};

// Blog report interface
export interface BlogReport {
  blogId: string;
  reporterId: string;
  reason: string;
  additionalDetails?: string; // Added field for additional details
}

interface BlogReportDialogProps {
  open: boolean;
  onClose: () => void;
  blogId: string;
  reporterId: string;
  blogTitle?: string;
}

const BlogReportDialog: React.FC<BlogReportDialogProps> = ({
  open,
  onClose,
  blogId,
  reporterId,
  blogTitle,
}) => {
  const [selectedReason, setSelectedReason] = useState<string | null>(null);
  const [detailsView, setDetailsView] = useState<boolean>(false);
  const [additionalDetails, setAdditionalDetails] = useState<string>("");
  const [sendToModerators, setSendToModerators] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submitSuccess, setSubmitSuccess] = useState<boolean>(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const currentUser = useSelector((state: RootState) => state.auth.data);

  // Reset states when dialog closes
  useEffect(() => {
    if (!open) {
      setSelectedReason(null);
      setDetailsView(false);
      setAdditionalDetails("");
      setSendToModerators(true);
      setIsSubmitting(false);
      setSubmitSuccess(false);
      setSubmitError(null);
    }
  }, [open]);

  const handleReasonSelect = (reason: string) => {
    setSelectedReason(reason);

    // Find if this reason needs additional details
    const reasonObj = blogReportReasons.find((r) => r.label === reason);

    if (reasonObj?.needsDetails || reason === "ເຫດຜົນອື່ນໆ") {
      setDetailsView(true);
    } else {
      // If no details needed, still go to details view for confirmation
      setDetailsView(true);
    }
  };

  const handleBack = () => {
    setDetailsView(false);
    setSelectedReason(null);
    setAdditionalDetails("");
  };

  const handleSubmit = async () => {
    onClose();
    if (!selectedReason) return;

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      // Create the report data with the three required fields
      const reportData: BlogReport = {
        blogId,
        reporterId: currentUser?.id || reporterId,
        reason: selectedReason,
        // Only include additionalDetails if it's not empty
        ...(additionalDetails.trim() !== "" && { additionalDetails }),
      };

      const res = await axiosInstance.post("/blog-report", reportData);
      console.log(res);

      setIsSubmitting(false);

      // Show success message with SweetAlert2
      Swal.fire({
        title: 'ລາຍງານສຳເລັດ!',
        text: 'ຂອບໃຈສຳລັບການລາຍງານຂອງທ່ານ. ຜູ້ກວດສອບຂອງພວກເຮົາຈະກວດສອບເນື້ອຫານີ້.',
        icon: 'success',
        showConfirmButton: false,
        timer: 2000,
      });

    } catch (error) {
      setIsSubmitting(false);
      setSubmitError("ບໍ່ສາມາດສົ່ງລາຍງານໄດ້. ກະລຸນາລອງໃໝ່ອີກຄັ້ງພາຍຫຼັງ.");
      console.error("Error in handleSubmit:", error);

      // Show error message with SweetAlert2
      Swal.fire({
        title: 'ເກີດຂໍ້ຜິດພາດ!',
        text: 'ບໍ່ສາມາດສົ່ງລາຍງານໄດ້. ກະລຸນາລອງໃໝ່ອີກຄັ້ງພາຍຫຼັງ.',
        icon: 'error',
        confirmButtonColor: '#3085d6',
        confirmButtonText: 'ຕົກລົງ'
      });
    }
  };

  const handleClose = () => {
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
          position: "relative",
        },
      }}
    >
      <DialogTitle sx={{ pr: 6, pb: 1, display: "flex", alignItems: "center" }}>
        {detailsView && (
          <IconButton
            edge="start"
            color="inherit"
            onClick={handleBack}
            aria-label="back"
            sx={{ mr: 1 }}
          >
            <ArrowBackIcon />
          </IconButton>
        )}
        {submitSuccess ? "ລາຍງານສຳເລັດ" : "ລາຍງານບົດຄວາມບລັອກ"}
        <IconButton
          aria-label="close"
          onClick={handleClose}
          sx={{
            position: "absolute",
            right: 8,
            top: 8,
            color: (theme) => theme.palette.grey[500],
          }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent>
        {blogTitle && !submitSuccess && !isSubmitting && (
          <Box
            sx={{
              mb: 2,
              pb: 2,
              borderBottom: "1px solid",
              borderColor: "divider",
            }}
          >
            <Typography variant="subtitle2" color="text.secondary">
              ກຳລັງລາຍງານ:
            </Typography>
            <Typography variant="body1" fontWeight="medium">
              {blogTitle}
            </Typography>
          </Box>
        )}

        {submitSuccess ? (
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              py: 3,
            }}
          >
            <Typography variant="h6" sx={{ mb: 2, color: "success.main" }}>
              ຂອບໃຈສຳລັບການລາຍງານຂອງທ່ານ!
            </Typography>
            <Typography
              variant="body2"
              color="text.secondary"
              textAlign="center"
            >
              ຜູ້ກວດສອບຂອງພວກເຮົາຈະກວດສອບເນື້ອຫານີ້ ແລະ ດຳເນີນການທີ່ເໝາະສົມ.
            </Typography>
          </Box>
        ) : isSubmitting ? (
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              py: 3,
            }}
          >
            <CircularProgress size={40} sx={{ mb: 2 }} />
            <Typography variant="body2" color="text.secondary">
              ກຳລັງສົ່ງລາຍງານຂອງທ່ານ...
            </Typography>
          </Box>
        ) : submitError ? (
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              py: 3,
            }}
          >
            <Alert severity="error" sx={{ mb: 2, width: "100%" }}>
              {submitError}
            </Alert>
            <Button variant="outlined" onClick={() => setSubmitError(null)}>
              ລອງໃໝ່ອີກຄັ້ງ
            </Button>
          </Box>
        ) : !detailsView ? (
          <>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              ຂອບໃຈທີ່ຊ່ວຍພວກເຮົາຮັກສາຊຸມຊົນທີ່ປອດໄພ ແລະ ມີຄວາມເຄົາລົບ.
              ກະລຸນາເລືອກເຫດຜົນໃນການລາຍງານບົດຄວາມບລັອກນີ້.
            </Typography>

            <Stack spacing={1} sx={{ mt: 1 }}>
              {blogReportReasons.map((reason) => (
                <Paper
                  key={reason.id}
                  elevation={0}
                  onClick={() => handleReasonSelect(reason.label)}
                  sx={{
                    p: 1.5,
                    backgroundColor: "rgba(0, 0, 0, 0.04)",
                    borderRadius: 2,
                    cursor: "pointer",
                    "&:hover": {
                      backgroundColor: "rgba(0, 0, 0, 0.08)",
                    },
                  }}
                >
                  <Typography variant="body2">{reason.label}</Typography>
                </Paper>
              ))}
            </Stack>

            <Box
              sx={{
                mt: 2,
                p: 2,
                backgroundColor: "rgba(0, 0, 0, 0.04)",
                borderRadius: 1,
                display: "flex",
                alignItems: "start",
              }}
            >
              <InfoIcon
                sx={{ fontSize: 20, mr: 1, color: "text.secondary", mt: 0.3 }}
              />
              <Typography variant="body2" color="text.secondary">
                ບໍ່ແນ່ໃຈວ່າບາງສິ່ງບາງຢ່າງລະເມີດກົດລະບຽບ? ກວດເບິ່ງຄືນຄຳແນະນຳຊຸມຊົນຂອງພວກເຮົາສຳລັບຂໍ້ມູນເພີ່ມເຕີມ.
              </Typography>
            </Box>
          </>
        ) : (
          <>
            <Typography variant="h6" sx={{ mb: 1 }}>
              {selectedReason}
            </Typography>

            {selectedReason && detailedReasonInfo[selectedReason] && (
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                {detailedReasonInfo[selectedReason]}
              </Typography>
            )}

            <Box sx={{ my: 2 }}>
              <TextField
                fullWidth
                multiline
                rows={4}
                variant="outlined"
                placeholder="ເພີ່ມລາຍລະອຽດເພີ່ມເຕີມທີ່ຈະຊ່ວຍໃຫ້ຜູ້ກວດສອບເຂົ້າໃຈບັນຫາ..."
                value={additionalDetails}
                onChange={(e) => setAdditionalDetails(e.target.value)}
                sx={{ mb: 2 }}
                error={
                  selectedReason === "ເຫດຜົນອື່ນໆ" &&
                  additionalDetails.trim() === ""
                }
                helperText={
                  selectedReason === "ເຫດຜົນອື່ນໆ" &&
                  additionalDetails.trim() === ""
                    ? "ກະລຸນາໃຫ້ລາຍລະອຽດສຳລັບການລາຍງານນີ້"
                    : ""
                }
              />

              <FormControlLabel
                control={
                  <Checkbox
                    checked={sendToModerators}
                    onChange={(e) => setSendToModerators(e.target.checked)}
                    color="primary"
                  />
                }
                label="ສົ່ງການແຈ້ງເຕືອນໄປຫາຜູ້ກວດສອບ"
              />
            </Box>
          </>
        )}
      </DialogContent>

      {!submitSuccess && !isSubmitting && !submitError && (
        <DialogActions sx={{ px: 3, pb: 2 }}>
          {!detailsView ? (
            <Button onClick={handleClose} color="inherit">
              ຍົກເລີກ
            </Button>
          ) : (
            <>
              <Button onClick={handleBack} color="inherit">
                ກັບຄືນ
              </Button>
              <Button
                variant="contained"
                onClick={handleSubmit}
                disabled={
                  selectedReason === "ເຫດຜົນອື່ນໆ" &&
                  additionalDetails.trim() === ""
                }
                sx={{ borderRadius: 5 }}
              >
                ສົ່ງ
              </Button>
            </>
          )}
        </DialogActions>
      )}
    </Dialog>
  );
};

// Smaller styled report button
export const BlogReportIconButton: React.FC<{
  blogId: string;
  reporterId: string;
  blogTitle?: string;
  size?: "small" | "medium";
}> = ({ blogId, reporterId, blogTitle, size = "medium" }) => {
  const [open, setOpen] = useState<boolean>(false);

  const handleOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  return (
    <>
      <Tooltip title="ລາຍງານບົດຄວາມບລັອກ">
        <IconButton
          size={size}
          onClick={handleOpen}
          aria-label="report blog post"
          sx={{ color: "text.secondary" }}
        >
          <FlagIcon fontSize={size} />
        </IconButton>
      </Tooltip>
      <BlogReportDialog
        open={open}
        onClose={handleClose}
        blogId={blogId}
        reporterId={reporterId}
        blogTitle={blogTitle}
      />
    </>
  );
};

// Standard button with text
export const BlogReportButton: React.FC<{
  blogId: string;
  reporterId: string;
  blogTitle?: string;
  variant?: "text" | "outlined" | "contained";
  size?: "small" | "medium" | "large";
}> = ({
  blogId,
  reporterId,
  blogTitle,
  variant = "outlined",
  size = "medium",
}) => {
  const [open, setOpen] = useState<boolean>(false);

  const handleOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  return (
    <>
      <Button
        variant={variant}
        size={size}
        onClick={handleOpen}
        startIcon={<FlagIcon />}
      >
        ລາຍງານ
      </Button>
      <BlogReportDialog
        open={open}
        onClose={handleClose}
        blogId={blogId}
        reporterId={reporterId}
        blogTitle={blogTitle}
      />
    </>
  );
};

export default BlogReportDialog;