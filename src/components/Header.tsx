import { AppBar, Box, Container, Typography } from '@mui/material';
import { Link } from "react-router-dom";

export const Header = () => {
    return (
        <AppBar component='header' position='static' sx={{ backgroundColor: 'lightblue' }}>
            <Container maxWidth='md'>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography component='h1'>
                        <Link to='/'>Home</Link>
                    </Typography>
                    <Typography component='h1'>
                        <Link to='/todo'>Todo</Link>
                    </Typography>
                    <Typography component='h1'>
                        <Link to='/video'>Video Player</Link>
                    </Typography>
                </Box>
            </Container>
        </AppBar>
    );
}