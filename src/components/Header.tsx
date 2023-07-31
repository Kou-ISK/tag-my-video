import { Link } from "react-router-dom";

export const Header = () => {
    return (
        <nav className='nav-bar'>
            <Link to='/' className='nav-link'>Home</Link>
            <Link to='/todo' className='nav-link'>Todo</Link>
        </nav>
    );
}