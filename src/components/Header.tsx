import { AppBar } from "@mui/material";
import { Link } from "react-router-dom";

export const Header = () => {
    return (
        <AppBar position='static'>
            <Link to='/' className='nav-link'>Home</Link>
            <Link to='/todo' className='nav-link'>Todo</Link>
        </AppBar>
    );
}