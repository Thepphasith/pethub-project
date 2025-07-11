// pages/ProfilePage.tsx

import React, { useState, useEffect } from "react";
import ProfileContent from "../components/ProfileContent";
import EditProfileDialog from "../components/EditProfileDialog";
import axiosInstance from "../configs/axios";

const ProfilePage: React.FC = () => {
  const [profileData, setProfileData] = useState<any>(null);
  const [editOpen, setEditOpen] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      const res = await axiosInstance.get("/user/me"); // replace with real API
      setProfileData(res.data);
    };
    fetchData();
  }, []);

  if (!profileData) return <div>Loading...</div>;

  return (
    <>
      <ProfileContent
        openEditDialog={() => setEditOpen(true)}
        profileData={profileData}
      />

      <EditProfileDialog
        open={editOpen}
        onClose={() => setEditOpen(false)}
        userData={profileData}
        onSave={(updatedUser) => setProfileData(updatedUser)}
      />
    </>
  );
};

export default ProfilePage;
