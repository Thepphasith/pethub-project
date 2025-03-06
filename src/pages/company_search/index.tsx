import { Box } from "@mui/material"
import TextFieldSearchCompany from "./components/TextFieldSearchCompany"

const Company_searchPage = () => {
  
  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', bgcolor: '#0067BC'}}>
      <Box sx={{ maxWidth: 1300, width: '100%'}}>
        <TextFieldSearchCompany  />
      </Box>
    </Box>
  )
}

export default Company_searchPage