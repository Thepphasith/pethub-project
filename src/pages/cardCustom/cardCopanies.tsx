import { Box, Card, CardContent, Skeleton } from '@mui/material';

const BlogCardSkeleton = () => {
  return (
    <Card 
      sx={{
        minWidth: 280,
        maxWidth: 300,
        mx: 1,
        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
        borderRadius: 2,
        flexShrink: 0, // Prevent card from shrinking in the flex container
      }}
    >
      {/* Image placeholder */}
      <Skeleton 
        variant="rectangular" 
        height={160} 
        width="100%"
        animation="wave"
      />
      
      <CardContent>
        {/* Title placeholder */}
        <Skeleton 
          variant="text" 
          height={32}
          width="90%"
          animation="wave"
          sx={{ mb: 1 }}
        />
        <Skeleton 
          variant="text" 
          height={20}
          width="40%"
          animation="wave"
          sx={{ mb: 1.5 }}
        />
        
        {/* Content placeholders */}
        <Skeleton 
          variant="text" 
          height={16}
          width="100%"
          animation="wave"
        />
        <Skeleton 
          variant="text" 
          height={16}
          width="90%"
          animation="wave"
        />
        <Skeleton 
          variant="text" 
          height={16}
          width="95%"
          animation="wave"
          sx={{ mb: 2 }}
        />
        
        {/* Author and date placeholders */}
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Skeleton 
              variant="circular" 
              width={32} 
              height={32}
              animation="wave"
            />
            <Skeleton 
              variant="text" 
              height={16}
              width={80}
              animation="wave"
              sx={{ ml: 1 }}
            />
          </Box>
          <Skeleton 
            variant="text" 
            height={14}
            width={60}
            animation="wave"
          />
        </Box>
      </CardContent>
    </Card>
  );
};

export default BlogCardSkeleton;