import { Button, Grid } from "@mui/material";
import { useState } from "react";
import { Todo } from "../../types/Todo";

export const TodoItem = (todo: Todo) => {
    const [isDone, setIsDone] = useState(todo.isDone);
    const toggleIsDone = () => {
        setIsDone(!isDone);
        todo.isDone = isDone;
    };
    return (
        <>
            <Grid container>
                <Grid>
                    <p>{todo.contentName}</p>
                </Grid>
                <Grid>
                    <Button onChange={toggleIsDone} color={isDone ? "success" : "error"}>
                        {isDone ? "完了" : "未完"}
                    </Button>
                </Grid>
                <p>{todo.deadline.toString()}</p>
            </Grid>
        </>
    );
};