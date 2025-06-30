import React, { useState, useEffect, useCallback } from "react";
import { 
  Box, 
  Typography, 
  Chip, 
  Grid, 
  Button, 
  Divider, 
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  useMediaQuery,
  useTheme,
  Collapse,
  IconButton,
  Badge,
  Stack,
  CircularProgress,
  Alert
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import CatIcon from "@mui/icons-material/Pets";
import DogIcon from "@mui/icons-material/Pets";
import axiosInstance from "../../../configs/axios";

// Custom theme colors
const themeColors = {
  primary: "#9990DA",
  primaryLight: "rgba(153, 144, 218, 0.15)",
  primaryDark: "#7B74B7",
  hover: "rgba(153, 144, 218, 0.08)",
  buttonHover: "#8A82C6",
  lightGrey: "#f5f5f5",
  border: "#e0e0e0"
};

// Types and interfaces
interface FilterOption {
  id: string;
  name: string;
  icon: React.ReactNode;
  type: string;
}

interface Pet {
  id: string;
  type: string;
  breed: string;
  color: string;
  gender: string;
  age: string;
  size: string;
  // other properties...
}

interface Breed {
  id: string;
  breedName: string;
  animalType: string; // "DOG" or "CAT"
  // other breed properties...
}

interface FilterCategory {
  id: string;
  name: string;
  count?: number;
}

interface FilterComponentProps {
  onApplyFilters?: (filterData: { 
    filters: FilterState; 
    queryParams: URLSearchParams;
  }) => void;
  onFilterStateChange?: (filters: FilterState) => void;
}

interface FilterState {
  animalType: string;
  breeds: string[];
  colors: string[];
  genders: string[];
  ages: string[];
  sizes: string[];
}

// Filter categories
const filterCategories: FilterCategory[] = [
  { id: "breed", name: "ສາຍພັນ" },
  { id: "color", name: "ສີ" },
  { id: "gender", name: "ເພດ" },
  { id: "age", name: "ອາຍຸ" },
  { id: "size", name: "ຂະໜາດ" },
];

// Animal options
const animalOptions: FilterOption[] = [
  { id: "cat", name: "ແມວ", icon: <CatIcon />, type: "cat" },
  { id: "dog", name: "ໝາ", icon: <DogIcon />, type: "dog" },
];

// Static data options (updated to match API exactly)
const colorOptions = [
  "BLACK", "WHITE", "BROWN", "GRAY", 
  "RED", "CREAM", "GOLD", "OTHER",
];

const genderOptions = ["MALE", "FEMALE"];
const ageOptions = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10+"]; // Use actual years as API expects yearAge
const sizeOptions = ["SMALL", "MEDIUM", "LARGE"];

const FilterComponent: React.FC<FilterComponentProps> = ({
  onApplyFilters,
  onFilterStateChange,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  // Main filter state
  const [filterState, setFilterState] = useState<FilterState>({
    animalType: "",
    breeds: [],
    colors: [],
    genders: [],
    ages: [],
    sizes: [],
  });

  // API data state
  const [breeds, setBreeds] = useState<Breed[]>([]);
  const [breedsLoading, setBreedsLoading] = useState<boolean>(false);
  const [breedsError, setBreedsError] = useState<string>("");

  // UI state
  const [expandedCategories, setExpandedCategories] = useState<string[]>([]);
  const [openSuccessDialog, setOpenSuccessDialog] = useState<boolean>(false);
  const [activeFiltersCount, setActiveFiltersCount] = useState<number>(0);
  const [applyingFilters, setApplyingFilters] = useState<boolean>(false);

  // Fetch breeds from API
  const fetchBreeds = useCallback(async () => {
    try {
      setBreedsLoading(true);
      setBreedsError("");
      
      const response = await axiosInstance.get("/breed");
      
      if (response.data && response.data.data) {
        setBreeds(response.data.data);
        console.log("Fetched breeds:", response.data.data);
      } else {
        setBreeds(response.data || []);
      }
    } catch (error) {
      console.error("Error fetching breeds:", error);
      setBreedsError("Failed to load breeds. Please try again.");
      setBreeds([]);
    } finally {
      setBreedsLoading(false);
    }
  }, []);

  // Initial fetch on component mount
  useEffect(() => {
    fetchBreeds();
  }, [fetchBreeds]);

  // Get current breeds based on selected animal type
  const getCurrentBreeds = () => {
    if (!filterState.animalType) return [];
    
    const animalTypeMap = {
      "cat": "CAT",
      "dog": "DOG"
    };
    
    const targetType = animalTypeMap[filterState.animalType as keyof typeof animalTypeMap];
    
    return breeds.filter(breed => 
      breed.animalType?.toUpperCase() === targetType
    );
  };

  // Calculate active filters count
  useEffect(() => {
    const count = 
      (filterState.animalType ? 1 : 0) +
      filterState.breeds.length +
      filterState.colors.length +
      filterState.genders.length +
      filterState.ages.length +
      filterState.sizes.length;
    
    setActiveFiltersCount(count);
  }, [filterState]);

  // Notify parent component of filter changes
  useEffect(() => {
    if (onFilterStateChange) {
      onFilterStateChange(filterState);
    }
  }, [filterState, onFilterStateChange]);

  // Reset breed selections when animal type changes
  useEffect(() => {
    setFilterState(prev => ({ ...prev, breeds: [] }));
  }, [filterState.animalType]);

  // Build query parameters from filter state
  const buildQueryParams = (filters: FilterState): URLSearchParams => {
    const params = new URLSearchParams();
    
    // Add pet type (convert to backend format)
    if (filters.animalType) {
      const petTypeMap = {
        "cat": "CAT",
        "dog": "DOG"
      };
      params.append("petType", petTypeMap[filters.animalType as keyof typeof petTypeMap]);
    }
    
    // Add multiple values for each filter category
    filters.breeds.forEach(breed => params.append("breedId", breed));
    filters.colors.forEach(color => params.append("color", color));
    filters.genders.forEach(gender => params.append("gender", gender));
    filters.ages.forEach(age => params.append("yearAge", age));
    filters.sizes.forEach(size => params.append("size", size));
    
    return params;
  };

  // Handler functions
  const handleAnimalSelect = (animalType: string) => {
    setFilterState(prev => ({ ...prev, animalType }));
  };

  const handleToggleFilter = (category: string, value: string) => {
    setFilterState(prev => {
      const currentValues = prev[category as keyof typeof prev] as string[];
      return {
        ...prev,
        [category]: currentValues.includes(value)
          ? currentValues.filter(item => item !== value)
          : [...currentValues, value]
      };
    });
  };

  const handleAccordionToggle = (categoryId: string) => {
    setExpandedCategories(prev =>
      prev.includes(categoryId)
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  const handleResetFilters = () => {
    setFilterState(prev => ({
      animalType: prev.animalType, // Keep the animal type
      breeds: [],
      colors: [],
      genders: [],
      ages: [],
      sizes: []
    }));
  };

  const handleApplyFilters = async () => {
    try {
      setApplyingFilters(true);
      
      // Build query parameters
      const queryParams = buildQueryParams(filterState);
      
      console.log("Applying filters with query params:", queryParams.toString());
      
      // Call the callback if provided
      if (onApplyFilters) {
        onApplyFilters({
          filters: filterState,
          queryParams,
        });
      }

      // Show success dialog
      setOpenSuccessDialog(true);
      
    } catch (error) {
      console.error("Error applying filters:", error);
    } finally {
      setApplyingFilters(false);
    }
  };

  // Render filter options for each category
  const renderFilterOptions = (categoryId: string) => {
    const isExpanded = expandedCategories.includes(categoryId);
    
    switch (categoryId) {
      case "breed":
        const availableBreeds = getCurrentBreeds();
        
        return (
          <Collapse in={isExpanded} timeout="auto" unmountOnExit>
            <Box sx={{ mt: 2 }}>
              {breedsLoading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
                  <CircularProgress size={24} />
                </Box>
              ) : breedsError ? (
                <Alert 
                  severity="error" 
                  sx={{ mb: 2 }}
                  action={
                    <Button size="small" onClick={fetchBreeds}>
                      Retry
                    </Button>
                  }
                >
                  {breedsError}
                </Alert>
              ) : availableBreeds.length === 0 ? (
                <Typography variant="body2" color="text.secondary" sx={{ py: 2 }}>
                  {filterState.animalType ? "No breeds available for selected animal type" : "Please select an animal type first"}
                </Typography>
              ) : (
                <Grid container spacing={1}>
                  {availableBreeds.map((breed) => (
                    <Grid item key={breed.id}>
                      <Chip
                        label={breed.breedName}
                        onClick={() => handleToggleFilter("breeds", breed.id)} // Use breed.id instead of breed.breedName
                        variant={filterState.breeds.includes(breed.id) ? "filled" : "outlined"} // Check breed.id instead of breed.breedName
                        size="small"
                        sx={{
                          borderRadius: 1.5,
                          backgroundColor: filterState.breeds.includes(breed.id)
                            ? themeColors.primaryLight
                            : "transparent",
                          color: filterState.breeds.includes(breed.id)
                            ? themeColors.primary
                            : "text.secondary",
                          borderColor: filterState.breeds.includes(breed.id)
                            ? themeColors.primary
                            : themeColors.border,
                          '&:hover': {
                            backgroundColor: filterState.breeds.includes(breed.id)
                              ? themeColors.primaryLight
                              : themeColors.hover
                          }
                        }}
                      />
                    </Grid>
                  ))}
                </Grid>
              )}
            </Box>
          </Collapse>
        );
        
      case "color":
        return (
          <Collapse in={isExpanded} timeout="auto" unmountOnExit>
            <Box sx={{ mt: 2 }}>
              <Grid container spacing={1}>
                {colorOptions.map((color) => (
                  <Grid item key={color}>
                    <Chip
                      label={color}
                      onClick={() => handleToggleFilter("colors", color)}
                      variant={filterState.colors.includes(color) ? "filled" : "outlined"}
                      size="small"
                      sx={{
                        borderRadius: 1.5,
                        backgroundColor: filterState.colors.includes(color)
                          ? themeColors.primaryLight
                          : "transparent",
                        color: filterState.colors.includes(color)
                          ? themeColors.primary
                          : "text.secondary",
                        borderColor: filterState.colors.includes(color)
                          ? themeColors.primary
                          : themeColors.border,
                        '&:hover': {
                          backgroundColor: filterState.colors.includes(color)
                            ? themeColors.primaryLight
                            : themeColors.hover
                        }
                      }}
                    />
                  </Grid>
                ))}
              </Grid>
            </Box>
          </Collapse>
        );
        
      case "gender":
        return (
          <Collapse in={isExpanded} timeout="auto" unmountOnExit>
            <Box sx={{ mt: 2 }}>
              <Grid container spacing={1}>
                {genderOptions.map((gender) => (
                  <Grid item key={gender}>
                    <Chip
                      label={gender}
                      onClick={() => handleToggleFilter("genders", gender)}
                      variant={filterState.genders.includes(gender) ? "filled" : "outlined"}
                      size="small"
                      sx={{
                        borderRadius: 1.5,
                        backgroundColor: filterState.genders.includes(gender)
                          ? themeColors.primaryLight
                          : "transparent",
                        color: filterState.genders.includes(gender)
                          ? themeColors.primary
                          : "text.secondary",
                        borderColor: filterState.genders.includes(gender)
                          ? themeColors.primary
                          : themeColors.border,
                        '&:hover': {
                          backgroundColor: filterState.genders.includes(gender)
                            ? themeColors.primaryLight
                            : themeColors.hover
                        }
                      }}
                    />
                  </Grid>
                ))}
              </Grid>
            </Box>
          </Collapse>
        );
        
      case "age":
        return (
          <Collapse in={isExpanded} timeout="auto" unmountOnExit>
            <Box sx={{ mt: 2 }}>
              <Grid container spacing={1}>
                {ageOptions.map((age) => (
                  <Grid item key={age}>
                    <Chip
                      label={age}
                      onClick={() => handleToggleFilter("ages", age)}
                      variant={filterState.ages.includes(age) ? "filled" : "outlined"}
                      size="small"
                      sx={{
                        borderRadius: 1.5,
                        backgroundColor: filterState.ages.includes(age)
                          ? themeColors.primaryLight
                          : "transparent",
                        color: filterState.ages.includes(age)
                          ? themeColors.primary
                          : "text.secondary",
                        borderColor: filterState.ages.includes(age)
                          ? themeColors.primary
                          : themeColors.border,
                        '&:hover': {
                          backgroundColor: filterState.ages.includes(age)
                            ? themeColors.primaryLight
                            : themeColors.hover
                        }
                      }}
                    />
                  </Grid>
                ))}
              </Grid>
            </Box>
          </Collapse>
        );
        
      case "size":
        return (
          <Collapse in={isExpanded} timeout="auto" unmountOnExit>
            <Box sx={{ mt: 2 }}>
              <Grid container spacing={1}>
                {sizeOptions.map((size) => (
                  <Grid item key={size}>
                    <Chip
                      label={size}
                      onClick={() => handleToggleFilter("sizes", size)}
                      variant={filterState.sizes.includes(size) ? "filled" : "outlined"}
                      size="small"
                      sx={{
                        borderRadius: 1.5,
                        backgroundColor: filterState.sizes.includes(size)
                          ? themeColors.primaryLight
                          : "transparent",
                        color: filterState.sizes.includes(size)
                          ? themeColors.primary
                          : "text.secondary",
                        borderColor: filterState.sizes.includes(size)
                          ? themeColors.primary
                          : themeColors.border,
                        '&:hover': {
                          backgroundColor: filterState.sizes.includes(size)
                            ? themeColors.primaryLight
                            : themeColors.hover
                        }
                      }}
                    />
                  </Grid>
                ))}
              </Grid>
            </Box>
          </Collapse>
        );
        
      default:
        return null;
    }
  };

  // Generate summary content for the results dialog
  const renderFilterSummary = (category: string, values: string[]) => {
    if (values.length === 0) return null;
    
    return (
      <Box sx={{ mt: 2, mb: 1 }}>
        <Typography variant="subtitle2" sx={{ mb: 0.5, color: "text.secondary" }}>
          {category}:
        </Typography>
        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
          {values.map((value) => (
            <Chip
              key={value}
              label={value}
              size="small"
              sx={{
                bgcolor: themeColors.primaryLight,
                color: themeColors.primary,
                borderRadius: 1.5,
                fontWeight: 500,
              }}
            />
          ))}
        </Box>
      </Box>
    );
  };

  // Count selected options per category for badge display
  const countSelectedOptions = (categoryId: string): number => {
    switch (categoryId) {
      case "breed": return filterState.breeds.length;
      case "color": return filterState.colors.length;
      case "gender": return filterState.genders.length;
      case "age": return filterState.ages.length;
      case "size": return filterState.sizes.length;
      default: return 0;
    }
  };

  return (
    <>
      <Paper
        elevation={2}
        sx={{
          p: 2.5,
          borderRadius: 2,
          height: "100%",
          bgcolor: "#ffffff",
        }}
      >
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          mb={2}
        >
          <Typography 
            variant="h6" 
            component="h2"
            sx={{ 
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              color: "#424242"
            }}
          >
            {activeFiltersCount > 0 ? (
              <Badge 
                sx={{ 
                  '& .MuiBadge-badge': { 
                    fontSize: 6, 
                    height: 8, 
                    minWidth: 8,
                    bgcolor: themeColors.primary
                  } 
                }}
              >
              ຕົວກັ່ນຕອງ 
              </Badge>
            ) : (
              "ຕົວກັ່ນຕອງ"
            )}
          </Typography>
          <Button
            size="small"
            variant="outlined"
            onClick={handleResetFilters}
            sx={{
              borderRadius: 20,
              textTransform: "none",
              borderColor: themeColors.primary,
              color: themeColors.primary,
              "&:hover": {
                borderColor: themeColors.primaryDark,
                backgroundColor: themeColors.hover,
              },
              fontSize: '0.75rem',
            }}
          >
            ຕັ້ງຄ່າໃໝ່ 
          </Button>
        </Box>

        {/* Animal Type Selector */}
        <Box sx={{ mt: 3 }}>
          <Typography 
            variant="subtitle1" 
            sx={{ 
              mb: 2,
              color: "#666666",
              fontWeight: 500
            }}
          >
            ປະເພດຂອງສັດ
          </Typography>
          
          <Grid container spacing={2}>
            {animalOptions.map((option) => (
              <Grid item key={option.id} xs={6}>
                <Paper
                  elevation={0}
                  onClick={() => handleAnimalSelect(option.id)}
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: "pointer",
                    py: 2,
                    borderRadius: 2,
                    border: "1px solid",
                    borderColor: filterState.animalType === option.id
                      ? themeColors.primary
                      : themeColors.border,
                    backgroundColor: filterState.animalType === option.id
                      ? themeColors.primaryLight
                      : "#ffffff",
                    "&:hover": {
                      borderColor: themeColors.primary,
                    },
                    transition: "all 0.2s ease",
                  }}
                >
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      width: 48,
                      height: 48,
                      borderRadius: "50%",
                      backgroundColor: filterState.animalType === option.id
                        ? themeColors.primary
                        : "#3B68B8",
                      color: "#ffffff",
                      mb: 1,
                    }}
                  >
                    {React.cloneElement(option.icon as React.ReactElement, { 
                      fontSize: "medium" 
                    })}
                  </Box>
                  <Typography
                    variant="body2"
                    sx={{ fontWeight: 500 }}
                  >
                    {option.name}
                  </Typography>
                </Paper>
              </Grid>
            ))}
          </Grid>
        </Box>

        <Divider sx={{ my: 3 }} />

        {/* Filter Categories */}
        {filterState.animalType && (
          <Box>
            {filterCategories.map((category) => {
              const isExpanded = expandedCategories.includes(category.id);
              const selectedCount = countSelectedOptions(category.id);
              
              return (
                <Box key={category.id} sx={{ mb: 2 }}>
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      py: 1,
                      cursor: "pointer",
                      "&:hover": {
                        color: themeColors.primary,
                      },
                    }}
                    onClick={() => handleAccordionToggle(category.id)}
                  >
                    <Stack direction="row" spacing={1} alignItems="center">
                      <Typography 
                        variant="subtitle2"
                        sx={{ 
                          fontWeight: 600,
                          color: isExpanded ? themeColors.primary : "text.primary",
                          transition: "color 0.3s ease"
                        }}
                      >
                        {category.name}
                        {category.id === "breed" && (
                          <Typography
                            component="span"
                            variant="caption"
                            sx={{ ml: 0.5, color: "text.secondary" }}
                          >
                            ({filterState.animalType === "dog" ? "Dog" : "Cat"})
                          </Typography>
                        )}
                      </Typography>
                      
                      {selectedCount > 0 && (
                        <Chip 
                          label={selectedCount} 
                          size="small"
                          sx={{ 
                            height: 20,
                            minWidth: 20,
                            fontSize: '0.65rem',
                            fontWeight: 600,
                            backgroundColor: themeColors.primary,
                            color: "#ffffff"
                          }}
                        />
                      )}
                    </Stack>
                    
                    <IconButton 
                      size="small" 
                      sx={{ 
                        color: isExpanded ? themeColors.primary : "text.secondary",
                        p: 0 
                      }}
                    >
                      {isExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                    </IconButton>
                  </Box>
                  
                  {/* Category filter options */}
                  {renderFilterOptions(category.id)}
                  
                  <Divider sx={{ mt: 1.5 }} />
                </Box>
              );
            })}
          </Box>
        )}

        <Button
          variant="contained"
          fullWidth
          onClick={handleApplyFilters}
          disabled={!filterState.animalType || applyingFilters}
          sx={{
            mt: 3,
            textTransform: "none",
            borderRadius: 8,
            bgcolor: themeColors.primary,
            "&:hover": {
              backgroundColor: themeColors.buttonHover,
            },
            py: 1.2,
            fontSize: '0.9rem',
            fontWeight: 500,
          }}
        >
          {applyingFilters ? (
            <CircularProgress size={20} color="inherit" />
          ) : (
            "ຢືນຢັນການກັ່ນຕອງ"
          )}
        </Button>
      </Paper>

      {/* Results Dialog */}
      <Dialog
        open={openSuccessDialog}
        onClose={() => setOpenSuccessDialog(false)}
        maxWidth="sm"
        fullWidth={true}
        fullScreen={isMobile}
        PaperProps={{
          sx: {
            borderRadius: 2,
            px: { xs: 2, sm: 3 },
            py: { xs: 2, sm: 1 },
          },
        }}
      >
        <DialogTitle sx={{ textAlign: "center", pt: 3 }}>
          <CheckCircleOutlineIcon
            sx={{ fontSize: 56, color: "#45B26B", mb: 1 }}
          />
          <Typography 
            variant="h6" 
            component="div" 
            sx={{ fontWeight: 600 }}
          >
            ການຢືນຢັນການກັ່ນຕອງສຳເລັດ
          </Typography>
        </DialogTitle>
        
        <DialogContent>
          <Typography
            variant="body2"
            align="center"
            color="text.secondary"
            sx={{ mb: 2 }}
          >
          ການຊອກຫາສັດລ້ຽງຂອງທ່ານໄດ້ຖືກປັບປຸງດ້ວຍຕົວກັ່ນຕອງດັ່ງຕໍ່ໄປນີ້:
          </Typography>

          <Box sx={{ p: 2, bgcolor: "#f9f9f9", borderRadius: 2, mb: 2 }}>
            {filterState.animalType && (
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" sx={{ mb: 0.5, color: "text.secondary" }}>
                 ປະເພດຂອງສັດ:
                </Typography>
                <Chip
                  label={filterState.animalType.charAt(0).toUpperCase() + filterState.animalType.slice(1)}
                  size="small"
                  sx={{
                    bgcolor: themeColors.primaryLight,
                    color: themeColors.primary,
                    borderRadius: 1,
                    fontWeight: 500,
                  }}
                />
              </Box>
            )}

            {renderFilterSummary("ສາຍພັນ", filterState.breeds)}
            {renderFilterSummary("ສີ", filterState.colors)}
            {renderFilterSummary("ເພດ", filterState.genders)}
            {renderFilterSummary("ອາຍຸ", filterState.ages)}
            {renderFilterSummary("ຂະໜາດ", filterState.sizes)}
          </Box>

          <Typography
            variant="body2"
            align="center"
            sx={{ mt: 2, fontWeight: 500 }}
          >
            ກຳລັງຊອກຫາ {filterState.animalType} ທີ່ກົງກັບເງື່ອນໄຂຂອງທ່ານ...
          </Typography>
        </DialogContent>
        
        <DialogActions sx={{ justifyContent: "center", pb: 3 }}>
          <Button
            onClick={() => setOpenSuccessDialog(false)}
            variant="contained"
            sx={{
              bgcolor: themeColors.primary,
              "&:hover": { backgroundColor: themeColors.buttonHover },
              borderRadius: 8,
              textTransform: "none",
              px: 4,
              py: 1,
              mb: 1,
            }}
          >
            ເບິ່ງຜົນປະກອບການກັ່ນຕອງ
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default FilterComponent;