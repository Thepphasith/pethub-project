import React, { useState } from "react";
import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Typography,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Box,
  styled,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";

// Define color options with their display names and values
const colorOptions = [
  { name: "Golden", value: "#DAA520", hex: "#DAA520" },
  { name: "Brown", value: "#8B4513", hex: "#8B4513" },
  { name: "Gray", value: "#808080", hex: "#808080" },
  { name: "Black", value: "#000000", hex: "#000000" },
  { name: "Red", value: "#FF0000", hex: "#FF0000" },
  { name: "Bicolor", value: "bicolor", hex: "#B87333" },
  { name: "Brindle", value: "brindle", hex: "#A38068" },
];

// Create a styled color circle component
const ColorCircle = styled(Box)(({ bgcolor }: { bgcolor: string }) => ({
  width: 24,
  height: 24,
  borderRadius: "50%",
  backgroundColor: bgcolor,
  marginRight: 12,
  display: "inline-block",
  verticalAlign: "middle",
}));

// Interface for the component props
interface ColorAccordionProps {
  onChange?: (color: string) => void;
}

const ColorAccordion: React.FC<ColorAccordionProps> = ({ onChange }) => {
  const [selectedColor, setSelectedColor] = useState<string>("");
  const [expanded, setExpanded] = useState<boolean>(false);

  const handleColorSelect = (value: string) => {
    setSelectedColor(value);
    setExpanded(false);
    if (onChange) {
      onChange(value);
    }
  };

  const handleAccordionChange = (
    _event: React.SyntheticEvent,
    isExpanded: boolean
  ) => {
    setExpanded(isExpanded);
  };

  // Find the selected color option
  const selectedOption = colorOptions.find(
    (option) => option.value === selectedColor
  );

  return (
    <Accordion
      expanded={expanded}
      onChange={handleAccordionChange}
      sx={{
        maxWidth: 400,
        boxShadow: "none",
        "&:before": {
          display: "none",
        },
        borderRadius: "8px !important",
      }}
    >
      <AccordionSummary
        expandIcon={<ExpandMoreIcon />}
        aria-controls="color-panel-content"
        id="color-panel-header"
        sx={{
          padding: "0 16px",
          minHeight: "48px",
        }}
      >
        {selectedOption ? (
          <Box sx={{ display: "flex", alignItems: "center" }}>
            <ColorCircle bgcolor={selectedOption.hex} />
            <Typography>{selectedOption.name}</Typography>
          </Box>
        ) : (
          <Typography variant="subtitle2" fontWeight={600}>
            Color
          </Typography>
        )}
      </AccordionSummary>
      <AccordionDetails sx={{ padding: 0 }}>
        <List disablePadding>
          {colorOptions.map((option) => (
            <ListItem key={option.value} disablePadding>
              <ListItemButton
                onClick={() => handleColorSelect(option.value)}
                sx={{ padding: "12px 16px" }}
              >
                <ColorCircle bgcolor={option.hex} />
                <ListItemText primary={option.name} />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      </AccordionDetails>
    </Accordion>
  );
};

export default ColorAccordion;
