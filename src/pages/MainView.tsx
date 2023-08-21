import Button from "@mui/material/Button";
import { useState } from "react";

export const MainView = () => {
    const [helloState, setHelloState] = useState(false);
    const toggleHelloState = () => {
        setHelloState(!helloState);
    }
    return (
        <>
            <div>
                <h1>Electron Tutorial </h1>
                <Button variant='outlined' onClick={toggleHelloState}>Hello</Button>
                <p>{helloState ? "Hello" : "Bye"}</p>
            </div>
        </>
    );
}