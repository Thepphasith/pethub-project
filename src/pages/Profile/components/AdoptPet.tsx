import React from "react";
import { Box, Paper, Typography, Avatar } from "@mui/material";

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

interface AdoptPetTabPanelProps {
  tabValue: number;
  index: number;
}

// You might want to define a Pet interface based on what PetCard expects
interface Pet {
  id: number;
  name: string;
  // Add other properties your PetCard component needs
  // For example: image, breed, age, etc.
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

const AdoptPetTabPanel: React.FC<AdoptPetTabPanelProps> = ({
  tabValue,
  index,
}) => {
  // Sample pet data - replace with your actual data or API call
  const petData: Pet[] = [
    { id: 1, name: "Rex" },
    { id: 2, name: "Bella" },
    { id: 3, name: "Max" },
    { id: 4, name: "Lucy" },
    { id: 5, name: "Charlie" },
    { id: 6, name: "Luna" },
    ];
    const UserHeader: React.FC<{ user: UserProfile }> = ({ user }) => (
      <Paper
        elevation={0}
        sx={{ p: 2, display: "flex", alignItems: "center", mb: 3 }}
      >
        <Avatar src={user.avatarUrl} sx={{ width: 70, height: 70, mr: 2 }} />
        <Box>
          <Typography variant="h6" fontWeight="bold">
            Dear {user.name.split(" ")[0]}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 400 }}>
            {user.notification}
          </Typography>
        </Box>
      </Paper>
    );

  return (
    <TabPanel value={tabValue} index={index}>
    </TabPanel>
  );
};

export default AdoptPetTabPanel;
