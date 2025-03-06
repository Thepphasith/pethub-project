import { Box, Button, Typography } from '@mui/material';
import './404.css'

const NotFoundPage = () => {
  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', bgcolor: '#GREY_COLOR' }}>
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <Typography className='color-slide' variant="h1" sx={{ letterSpacing: 2, fontSize: 80, textAlign: 'center' }}>
          404
        </Typography>
        <Typography className='color-slide' variant="h2" sx={{ letterSpacing: 2, mt: 2, textAlign: 'center', maxWidth: 1000, px: 3 }}>
          Page Not Found
        </Typography>
        <Button
          size="small"
          variant="contained"
          color="primary"
          href="/"
          sx={{ textTransform: 'none', mt: 4, fontWeight: 'bold', borderRadius: 100, px: 2 }}
        >
          Back to Homepage
        </Button>
      </Box>
    </Box>
  );
};

export default NotFoundPage;
