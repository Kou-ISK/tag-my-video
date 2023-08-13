import { AppBar, Box } from '@mui/material';
import { Link } from "react-router-dom";

export const Header = () => {
    return (
        <AppBar position='relative'>
            <Box display={"flex"} flexDirection={"row"} justifyContent={"space-around"} margin={"20px"}>
                <Link to='/' className='nav-link'>Home</Link>
                <Link to='/todo' className='nav-link'>Todo</Link>
            </Box>
        </AppBar>
    );
}