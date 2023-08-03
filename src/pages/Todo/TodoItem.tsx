import { Button } from "@mui/material";
import { useState } from "react";
import { Todo } from "../../types/Todo";

export const TodoItem = (todo: Todo) => {
    const [isDone, setIsDone] = useState(false);
    const toggleIsDone = () => {
        setIsDone(!isDone);
        todo.isDone = isDone;
    };
    return (
        <>
            <p>{todo.contentName}</p>
            <Button onChange={toggleIsDone} color={isDone ? "success" : "error"}>
                {isDone ? "完了" : "未完"}
            </Button>
            <p>{todo.deadline.toString()}</p>
        </>
    );
};