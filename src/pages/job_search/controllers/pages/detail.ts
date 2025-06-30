import { useParams } from "react-router-dom";
import axiosInstance from "../../../../configs/axios";
import { PetModel } from "../../../../models/pet";
import { useEffect, useState } from "react";

const DetailController = () => {
  const { id } = useParams();

  // State for main pet data
  const [data, setData] = useState<PetModel | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // State for image gallery
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

 const [latestPets, setLatestPets] = useState<PetModel[]>([]);

 const handleGetAllData = async (): Promise<void> => {
   try {
     setLoading(true);
     const res = await axiosInstance.get("/pets/all");

     // Sort by createdAt (assuming API returns this field)
     const sortedPets = res.data?.data?.sort(
       (a: PetModel, b: PetModel) =>
         new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
     );

     setLatestPets(sortedPets || []);
   } catch (error) {
     console.error("Error fetching pet data:", error);
   } finally {
     setLoading(false);
   }
 };

  // Function to get pet details by ID
  const handleGetPetById = async () => {
    if (!id) return;

    try {
      setLoading(true);
      setError(null);

      const res = await axiosInstance.get(`/pets/${id}`);

      if (res.data?.data) {
        setData(res.data.data);

        // You might want to add additional pet details here if available in the API
        // For example: color, specific needs, etc.
      } else {
        setError("No pet data found");
      }
    } catch (error: any) {
      console.error("Error fetching pet:", error);
      setError(error?.message || "Failed to load pet details");
    } finally {
      setLoading(false);
    }
  };

  // Image navigation functions
  const handleNextImage = () => {
    if (!data || !data.images || data.images.length === 0) return;

    setCurrentImageIndex((prev) =>
      prev === data.images.length - 1 ? 0 : prev + 1
    );
  };

  const handlePrevImage = () => {
    if (!data || !data.images || data.images.length === 0) return;

    setCurrentImageIndex((prev) =>
      prev === 0 ? data.images.length - 1 : prev - 1
    );
  };

  const handleSelectImage = (index: number) => {
    if (!data || !data.images || index >= data.images.length) return;

    setCurrentImageIndex(index);
  };

  // Get formatted age string
  const getAgeString = () => {
    if (!data) return "";

    const years = data.yearAge || 0;
    const months = data.monthAge || 0;

    if (years > 0 && months > 0) {
      return `${years} year${years !== 1 ? "s" : ""}, ${months} month${
        months !== 1 ? "s" : ""
      }`;
    } else if (years > 0) {
      return `${years} year${years !== 1 ? "s" : ""}`;
    } else {
      return `${months} month${months !== 1 ? "s" : ""}`;
    }
  };

  // Get weight formatted with units
  const getWeightString = () => {
    if (!data) return "";
    return `${data.weight} kg`;
  };

  // Get height formatted with units
  const getHeightString = () => {
    if (!data) return "";
    return `${data.height} cm`;
  };

  // Get pet features (for the list in the right panel)
  const getPetFeatures = () => {
    if (!data) return [];

    // This is now handled in the component with hardcoded features
    // that match the design
    return [
      { text: `${data.gender} pet`, icon: null },
      { text: `${getAgeString()} old`, icon: null },
      { text: `Weighs ${getWeightString()}`, icon: null },
      { text: `Height: ${getHeightString()}`, icon: null },
    ];
  };

  useEffect(() => {
    handleGetPetById();
  }, [id]);

  useEffect(() => {
    if (data) {
      handleGetAllData();
    }
  }, [data]);

  return {
    latestPets,
    data,
    loading,
    error,
    currentImageIndex,
    handleNextImage,
    handlePrevImage,
    handleSelectImage,
    getAgeString,
    getWeightString,
    getHeightString,
    getPetFeatures,
  };
};

export default DetailController;
