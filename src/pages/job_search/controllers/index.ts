import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { PetModel } from "../../../models/pet";
import axiosInstance from "../../../configs/axios";

const useMainController = () => {
  const [data, setData] = useState<PetModel[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const navigate = useNavigate();
  const handleNaVigate = (path: string) => {
    navigate(path);
  };

   const handleGetAllData = async (): Promise<void> => {
     try {
       setLoading(true);
       const res = await axiosInstance.get("/pets/all");
       setData(res.data?.data);
     } catch (error) {
       console.error("Error fetching pet data:", error);
     } finally {
       setLoading(false);
     }
   };

  useEffect(() => {
    handleGetAllData();
  }, []);
  return {
    loading,
    data,
    handleNaVigate,
    navigate,
  };
};
export default useMainController;
