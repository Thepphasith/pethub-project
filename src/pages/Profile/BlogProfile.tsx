import React, { useState, useEffect } from "react";
import {
  Container,
  Grid,
  List,
  ListItem,
  ListItemText,
  Paper,
  ThemeProvider,
  Box,
  createTheme,
  CircularProgress,
  Alert,
} from "@mui/material";
import AdoptionRequestsTable from "./Request";
import PetAdoptionApp from "./Adopt";
import EditProfileDialog from "../../layout/components/dialog of profile/dialog-profile";
import { UserModel } from "../../models/user";
import ProfileContent from "./components/profilePanel";
import axiosInstance from "../../configs/axios";
import OrderHistoryTable from "./History";
import FavoritesPage from "./Favorite";
import MeetupManagementTable from "./meetup";

// Define theme with purple accent
const theme = createTheme({
  palette: {
    primary: {
      main: "#8470C0",
    },
    secondary: {
      main: "#ffffff",
    },
    background: {
      default: "#f5f5f5",
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
  },
});

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`tabpanel-${index}`}
      aria-labelledby={`tab-${index}`}
      {...other}
    >
      {value === index && <Box>{children}</Box>}
    </div>
  );
}

// Interface for the processed profile data that ProfileContent expects
interface ProfileData {
  name: string;
  location: string;
  age: string;
  bio: string[];
  email: string;
  phone: string;
  instagram: string;
  profileImage: string;
  city: string;
  village: string;
  DOB: string;
}

const ProfilePage: React.FC = () => {
  const [tabValue, setTabValue] = useState<number>(1  ); // Set default to 0 (Profile)
  const [dialogOpen, setDialogOpen] = useState<boolean>(false);
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [userData, setUserData] = useState<UserModel | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  // Fetch user profile data from API
  useEffect(() => {
    const fetchUserProfile = async () => {
      setLoading(true);
      try {
        const response = await axiosInstance.get<UserModel>(
          "/auth/user/profile"
        );

        // Set the raw user data for the edit dialog
        setUserData(response.data);

        // Process the API response into the format needed by ProfileContent
        const processedData: ProfileData = {
          name: `${response.data.firstName} ${response.data.lastName}`,
          location: response.data.city || "Not specified",
          age: response.data.age || "Not specified",
          bio: response.data.bio
            ? response.data.bio.split("\n").filter((p) => p.trim().length > 0)
            : ["No bio available"],
          email: response.data.email,
          city: response.data.city || "Not specified",
          village: response.data.village || "Not specified",
          phone: response.data.tel || "Not specified",
          instagram: "Not specified", // Instagram is not in your model, add it if needed
          profileImage: response.data.avatar || "/default-avatar.jpg",
          DOB: response.data.DOB || "Not specified",
        };

        setProfileData(processedData);
        setError(null);
      } catch (err) {
        console.error("Error fetching user profile:", err);
        setError("Failed to load user profile. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, []);

  return (
    <ThemeProvider theme={theme}>
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Grid container spacing={2}>
          {/* Sidebar Navigation */}
          <Grid item xs={12} md={3}>
            <Paper elevation={1} sx={{ position: "sticky", top: 16 }}>
              <List>
                <ListItem
                  button
                  selected={tabValue === 1}
                  onClick={(e) => handleTabChange(e, 1)}
                >
                  <ListItemText primary="ໂປຣໄຟລ໌" />
                </ListItem>
                <ListItem
                  button
                  selected={tabValue === 2}
                  onClick={(e) => handleTabChange(e, 2)}
                >
                  <ListItemText primary="ພາກສ່ວນຄໍາຂໍການຂາຍ" />
                </ListItem>
                  <ListItem
                  button
                  selected={tabValue === 3}
                  onClick={(e) => handleTabChange(e, 3)}
                >
                  <ListItemText primary="ພາກສ່ວນນັດຮັບ" />
                </ListItem>
                <ListItem
                  button
                  selected={tabValue === 4}
                  onClick={(e) => handleTabChange(e, 4)}
                >
                  <ListItemText primary="ສັດລ້ຽງ" />
                </ListItem>
                <ListItem
                  button
                  selected={tabValue === 5}
                  onClick={(e) => handleTabChange(e, 5)}
                >
                  <ListItemText primary="ລາຍການທີ່ຖືກໃຈ" />
                </ListItem>
                <ListItem
                  button
                  selected={tabValue === 6}
                  onClick={(e) => handleTabChange(e, 6)}
                >
                  <ListItemText primary="ປະຫວັດ" />
                </ListItem>
              </List> 
            </Paper>
          </Grid>

          {/* Main Content */}
          <Grid item xs={12} md={9}>
            {/* Profile Tab - Using the ProfileContent component */}
            <TabPanel value={tabValue} index={1}>
              {loading ? (
                <Paper elevation={1} sx={{ p: 5, mb: 2, textAlign: "center" }}>
                  <CircularProgress />
                  <Box mt={2}>Loading your profile...</Box>
                </Paper>
              ) : error ? (
                <Paper elevation={1} sx={{ p: 3, mb: 2 }}>
                  <Alert severity="error">{error}</Alert>
                </Paper>
              ) : profileData ? (
                <ProfileContent
                  openEditDialog={() => setDialogOpen(true)}
                  profileData={profileData}
                />
              ) : (
                <Paper elevation={1} sx={{ p: 3, mb: 2 }}>
                  <Alert severity="warning">No profile data available</Alert>
                </Paper>
              )}
            </TabPanel>

            {/* Adopt Tab - Requests */}
            <TabPanel value={tabValue} index={2}>
              <Paper elevation={1} sx={{ p: 2, mb: 2 }}>
                <AdoptionRequestsTable />
              </Paper>
            </TabPanel>
              {/* Adopt Tab - Requests */}
            <TabPanel value={tabValue} index={3}>
              <Paper elevation={1} sx={{ p: 2, mb: 2 }}>
                <MeetupManagementTable />
              </Paper>
            </TabPanel>


            {/* Pets Tab */}
            <TabPanel value={tabValue} index={4}>
              <Paper elevation={1} sx={{ p: 2, mb: 2 }}>
                <PetAdoptionApp />
              </Paper>
            </TabPanel>

            {/* Favorites Tab */}
            <TabPanel value={tabValue} index={5}>
              <Paper elevation={1} sx={{ p: 2, mb: 2 }}>
                <FavoritesPage />
              </Paper>
            </TabPanel>

            {/* History Tab */}
            <TabPanel value={tabValue} index={6}>
              <Paper elevation={1} sx={{ p: 2, mb: 2 }}>
                <OrderHistoryTable />
              </Paper>
            </TabPanel>
          </Grid>
        </Grid>
      </Container>

      {/* Edit Profile Dialog */}
      {userData && (
        <EditProfileDialog
          open={dialogOpen}
          onClose={() => setDialogOpen(false)}
          userData={{
            id: userData.id,
            firstName: userData.firstName,
            lastName: userData.lastName,
            username: userData.username,
            email: userData.email,
            phoneNumber: userData.tel,
            profileImage: userData.avatar,
            DOB: userData.DOB,
            village: userData?.village,
            city: userData?.city,
          }}
        />
      )}
    </ThemeProvider>
  );
};

export default ProfilePage;
