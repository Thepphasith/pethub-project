import { useState } from "react";

const useMainController = () => {
  const [anchorEl, setAnchorEl] = useState<any>(null);
  const [menuOptions, setMenuOptions] = useState<any>([]);
  const [currentButtonLabel, setCurrentButtonLabel] = useState<string>('');
  const [selectedOptions, setSelectedOptions] = useState<any>({});

  const handleClick = (event: any, options: any, label: any) => {
    setAnchorEl(event.currentTarget);
    setMenuOptions(options);
    setCurrentButtonLabel(label);
  };

  const handleClose = (option: any) => {
    setSelectedOptions((prevSelectedOptions: any) => ({
      ...prevSelectedOptions,
      [currentButtonLabel]: option,
    }));
    setAnchorEl(null);
  };


  return {
    menuOptions,
    currentButtonLabel,
    selectedOptions,
    anchorEl,
    setAnchorEl,
    setMenuOptions,
    setCurrentButtonLabel,
    handleClick,
    handleClose,
    open
  };
};

export default useMainController;
