import { useState } from "react";
import {
  Typography,
  Avatar,
  Box,
  Button,
  Stack,
  TextField,
  Collapse,
  CircularProgress,
  Paper,
  useTheme,
  alpha,
} from "@mui/material";
import SendIcon from "@mui/icons-material/Send";
import axiosInstance from "../../../configs/axios";
import { useSelector } from "react-redux";
import { RootState } from "../../../store";

// Interfaces
interface User {
  id: string;
  firstName: string;
  lastName: string;
  avatar?: string;
  username?: string;
}

interface Comment {
  id: string;
  body?: string;
  userId: string;
  commentText?: string;
  timestamp?: string;
  createdAt?: string;
  user?: User;
}

interface CommentSectionProps {
  postId: string;
  comments: Comment[];
  expanded: boolean;
  onCommentsUpdate: () => void;
  className?: string;
}

const CommentSection = ({ 
  postId, 
  comments, 
  expanded, 
  onCommentsUpdate, 
  className 
}: CommentSectionProps) => {
  const theme = useTheme();
  const [commentInput, setCommentInput] = useState<string>("");
  const [submittingComment, setSubmittingComment] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  
  // Get current user from Redux store
  const currentUser = useSelector((state: RootState) => state.auth.data);

  const handleCommentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCommentInput(e.target.value);
    if (error) setError(""); // Clear error when user starts typing
  };

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Validation
    if (!commentInput?.trim()) {
      setError("ກະລຸນາປ້ອນຄຳເຫັນ");
      return;
    }

    if (!currentUser?.id) {
      setError("ກະລຸນາເຂົ້າສູ່ລະບົບກ່ອນ");
      return;
    }

    setSubmittingComment(true);
    setError("");

    try {
      console.log("Submitting comment:", {
        commentText: commentInput.trim(),
        blogId: postId,
        userId: currentUser.id
      });

      const response = await axiosInstance.post("/comment", {
        commentText: commentInput.trim(),
        blogId: postId,
      });

      console.log("Comment response:", response.data);

      if (response.data) {
        // Clear the comment input
        setCommentInput("");
        
        // Call the callback to update comments in parent component
        if (onCommentsUpdate) {
          onCommentsUpdate();
        }
        
        console.log("ເພີ່ມຄວາມຄິດເຫັນສຳເລັດ");
      }
    } catch (error: any) {
      console.error("ເພີ່ມຄວາມຄິດເຫັນຜິດພາດ:", error);
      
      // Handle different error types
      if (error.response?.status === 401) {
        setError("ກະລຸນາເຂົ້າສູ່ລະບົບກ່ອນ");
      } else if (error.response?.status === 400) {
        setError("ຂໍ້ມູນບໍ່ຖືກຕ້ອງ");
      } else if (error.response?.status === 500) {
        setError("ເກີດຂໍ້ຜິດພາດຂອງເຊີເວີ");
      } else {
        setError("ເກີດຂໍ້ຜິດພາດ ກະລຸນາລອງໃໝ່");
      }
    } finally {
      setSubmittingComment(false);
    }
  };

  const getTimeAgo = (timestamp: string): string => {
    try {
      const now = new Date();
      const pastDate = new Date(timestamp);
      const diffMs = now.getTime() - pastDate.getTime();
      
      const diffSecs = Math.floor(diffMs / 1000);
      if (diffSecs < 60) return `${diffSecs}s ago`;
      
      const diffMins = Math.floor(diffSecs / 60);
      if (diffMins < 60) return `${diffMins}m ago`;
      
      const diffHours = Math.floor(diffMins / 60);
      if (diffHours < 24) return `${diffHours}h ago`;
      
      const diffDays = Math.floor(diffHours / 24);
      if (diffDays < 7) return `${diffDays}d ago`;
      
      return formatDate(timestamp);
    } catch (err) {
      return "Unknown time";
    }
  };

  const formatDate = (timestamp: string) => {
    try {
      const date = new Date(timestamp);
      return date.toLocaleDateString("en-US", {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch (err) {
      return "Invalid date";
    }
  };

  // Generate avatar URL based on user ID
  const getAvatarUrl = (user: User | undefined, userId?: string) => {
    if (user?.avatar) {
      return user.avatar;
    }
    
    // Generate a consistent avatar based on user ID
    const id = user?.id || userId || "default";
    const colors = [
      "#FF6B6B", "#4ECDC4", "#45B7D1", "#96CEB4", "#FECA57", 
      "#FF9FF3", "#54A0FF", "#5F27CD", "#00D2D3", "#FF9F43"
    ];
    
    const colorIndex = id.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0) % colors.length;
    const color = colors[colorIndex];
    
    const initials = user?.firstName && user?.lastName 
      ? `${user.firstName[0]}${user.lastName[0]}`.toUpperCase()
      : user?.username?.[0]?.toUpperCase() || "U";
    
    return `https://ui-avatars.com/api/?name=${initials}&background=${color.replace("#", "")}&color=fff&size=128`;
  };

  // Stop event propagation for the entire comment section
  const handleCommentSectionClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  return (
    <Collapse in={expanded} timeout="auto" unmountOnExit>
      <Box 
        className={className}
        onClick={handleCommentSectionClick}
        sx={{ 
          p: 3, 
          bgcolor: alpha(theme.palette.background.default, 0.5),
          borderTop: `1px solid ${alpha(theme.palette.divider, 0.5)}`
        }}
      >
        <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 2 }}>
          {comments.length > 0 ? (
            `${comments.length} ${comments.length === 1 ? "ຄວາມຄິດເຫັນ" : "ຄວາມຄິດເຫັນ"}`
          ) : (
            "ເພີ່ມຄວາມຄິດເຫັນ"
          )}  
        </Typography>

        {/* Comment Input Form */}
        <Box 
          component="form"
          onSubmit={handleCommentSubmit}
          sx={{ 
            display: 'flex',
            alignItems: 'flex-start',
            mb: 3
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <Avatar
            src={getAvatarUrl(currentUser)}
            alt={`${currentUser?.firstName || "User"}'s avatar`}
            sx={{ 
              width: 36, 
              height: 36, 
              mr: 1.5,
              mt: 1
            }}
          />
          <Box 
            sx={{ 
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <TextField
              fullWidth
              multiline
              minRows={1}
              maxRows={4}
              variant="outlined"
              placeholder="ຂຽນຄວາມຄິດເຫັນ..."
              value={commentInput}
              onChange={handleCommentChange}
              onClick={(e) => e.stopPropagation()}
              disabled={submittingComment}
              error={!!error}
              helperText={error}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 3,
                  bgcolor: theme.palette.background.paper,
                  boxShadow: theme.shadows[1],
                }
              }}
            />
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 1 }}>
              <Button
                type="submit"
                color="primary"
                disabled={!commentInput?.trim() || submittingComment}
                variant="contained"
                disableElevation
                endIcon={!submittingComment && <SendIcon fontSize="small" />}
                sx={{
                  borderRadius: 4,
                  textTransform: 'none',
                  px: 2
                }}
              >
                {submittingComment ? (
                  <CircularProgress size={20} color="inherit" />
                ) : (
                  "ອັບໂຫຼດ"
                )}
              </Button>
            </Box>
          </Box>
        </Box>
        
        {/* Comments List */}
        {comments.length > 0 ? (
          <Stack spacing={2.5} onClick={(e) => e.stopPropagation()}>
            {comments.map((comment) => {
              // Handle different comment structures
              const commentText = comment.commentText || comment.body || "";
              const commentTimestamp = comment.timestamp || comment.createdAt || "";
              const commentUser = comment.user;
              
              return (
                <Box
                  key={comment.id}
                  sx={{
                    display: 'flex',
                    alignItems: 'flex-start',
                  }}
                >
                  <Avatar
                    src={getAvatarUrl(commentUser, comment.userId)}
                    alt={`${commentUser?.firstName || "User"}'s avatar`}
                    sx={{ 
                      width: 36, 
                      height: 36, 
                      mr: 1.5 
                    }}
                  />
                  <Box sx={{ flex: 1 }}>
                    <Paper
                      elevation={0}
                      sx={{
                        p: 2,
                        borderRadius: "16px",
                        bgcolor: theme.palette.background.paper,
                        boxShadow: theme.shadows[1],
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
                        <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                          {commentUser ? 
                            `${commentUser.firstName || ""} ${commentUser.lastName || ""}`.trim() ||
                            commentUser.username ||
                            "Anonymous User"
                            : "Anonymous User"
                          }
                        </Typography>
                        {commentTimestamp && (
                          <Typography 
                            variant="caption" 
                            color="text.secondary"
                            sx={{ 
                              ml: 1,
                              display: 'inline-flex',
                              alignItems: 'center',
                              '&:before': {
                                content: '""',
                                width: '3px',
                                height: '3px',
                                bgcolor: 'text.secondary',
                                borderRadius: '50%',
                                display: 'inline-block',
                                mr: 1
                              }
                            }}
                          >
                            {getTimeAgo(commentTimestamp)}
                          </Typography>
                        )}
                      </Box>
                      <Typography 
                        variant="body2" 
                        sx={{ 
                          wordBreak: 'break-word',
                          color: theme.palette.text.primary,
                          lineHeight: 1.5
                        }}
                      >
                        {commentText || "No comment text"}
                      </Typography>
                    </Paper>
                  </Box>
                </Box>
              );
            })}
          </Stack>
        ) : (
          <Paper
            elevation={0}
            sx={{
              p: 2,
              borderRadius: 2,
              bgcolor: alpha(theme.palette.background.paper, 0.6),
              textAlign: 'center',
              border: `1px dashed ${alpha(theme.palette.divider, 0.8)}`,
            }}
          >
            <Typography variant="body2" color="text.secondary">
              ຍັງບໍ່ມີຄຳເຫັນເທື່ອ. ເປັນຄົນທຳອິດທີ່ສະແດງຄວາມຄິດເຫັນ!
            </Typography>
          </Paper>
        )}
      </Box>
    </Collapse>
  );
};

export default CommentSection;