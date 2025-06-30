import React from 'react';
import { 
  Box, 
  Card, 
  CardContent, 
  CardMedia, 
  Typography, 
  Avatar, 
  CardActionArea
} from '@mui/material';
// Remove the import that's causing circular dependency issues

const BlogCard = ({ post, onClick }) => {
  // Function to truncate text with ellipsis if it exceeds a certain length
  const truncateText = (text, maxLength) => {
    if (!text) return '';
    if (text.length <= maxLength) return text;
    return text.slice(0, maxLength) + '...';
  };

  // Format the date to show as relative time
  const formatRelativeDate = (dateString) => {
    if (!dateString) return '';
    
    try {
      const postDate = new Date(dateString);
      const now = new Date();
      
      const diffTime = Math.abs(now - postDate);
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
      const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
      const diffMinutes = Math.floor(diffTime / (1000 * 60));
      
      if (diffDays > 0) {
        return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
      } else if (diffHours > 0) {
        return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
      } else if (diffMinutes > 0) {
        return `${diffMinutes} minute${diffMinutes > 1 ? 's' : ''} ago`;
      } else {
        return 'Just now';
      }
    } catch (error) {
      console.error('Date formatting error:', error);
      return dateString; // Return the original string if there's an error
    }
  };

  // Generate initials for avatar if no image is provided
  const getInitials = (name) => {
    if (!name) return '?';
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase();
  };

  // Handle the case where post might be undefined or not have expected structure
  if (!post || typeof post !== 'object') {
    return null;
  }

  const { 
    id = '', 
    title = 'Untitled Post', 
    body = '', 
    imageUrl = '', 
    createdAt = '',
    author = { username: 'Anonymous', avatar: '', avatarColor: '#9990DA' }
  } = post;

  return (
    <Card 
      sx={{
        minWidth: 280,
        maxWidth: 300,
        mx: 1,
        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
        borderRadius: 2,
        flexShrink: 0, // Prevent card from shrinking in the flex container
        transition: 'transform 0.3s',
        '&:hover': {
          transform: 'translateY(-5px)'
        }
      }}
    >
      <CardActionArea onClick={onClick}>
        {imageUrl && (
          <CardMedia
            component="img"
            height="160"
            image={imageUrl}
            alt={title}
          />
        )}
        <CardContent>
          <Typography 
            variant="h6" 
            component="h2" 
            fontWeight="bold"
            sx={{ 
              mb: 1,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              lineHeight: 1.2,
              height: '2.4em'
            }}
          >
            {title}
          </Typography>
          
          <Typography 
            variant="body2" 
            color="text.secondary"
            sx={{ 
              mb: 2,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              display: '-webkit-box',
              WebkitLineClamp: 3,
              WebkitBoxOrient: 'vertical',
              height: '4.5em'
            }}
          >
            {truncateText(body, 120)}
          </Typography>
          
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              {author.avatar ? (
                <Avatar 
                  src={author.avatar} 
                  alt={author.username}
                  sx={{ width: 32, height: 32 }}
                />
              ) : (
                <Avatar 
                  sx={{ 
                    width: 32, 
                    height: 32, 
                    bgcolor: author.avatarColor || '#9990DA' 
                  }}
                >
                  {getInitials(author.username)}
                </Avatar>
              )}
              <Typography 
                variant="body2" 
                sx={{ ml: 1, fontWeight: 500 }}
              >
                {author.username || 'Anonymous'}
              </Typography>
            </Box>
            <Typography 
              variant="caption" 
              color="text.secondary"
            >
              {formatRelativeDate(createdAt)}
            </Typography>
          </Box>
        </CardContent>
      </CardActionArea>
    </Card>
  );
};

export default BlogCard;