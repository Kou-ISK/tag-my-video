import { Button, Grid, SvgIcon } from "@mui/material";
import { Todo } from "../../types/Todo";
import DeleteOutlineOutlinedIcon from '@mui/icons-material/DeleteOutlineOutlined';

export const TodoItem = ({ todo, toggleTodoStatus, deleteTodoItem }: {
    todo: Todo,
    toggleTodoStatus: (id: string, isDone: boolean) => void,
    deleteTodoItem: (id: string) => void
}) => {
    const toggleIsDone = () => {
        toggleTodoStatus(todo.id, !todo.isDone);
    };
    return (
        <>
            <Grid container>
                <p>{todo.contentName}</p>
                <Grid>
                    <Button onClick={toggleIsDone} color={todo.isDone ? "success" : "error"}>
                        {todo.isDone ? "完了" : "未完"}
                    </Button>
                </Grid>
                <p>{todo.deadline.toString()}</p>
                <SvgIcon component={DeleteOutlineOutlinedIcon} onClick={() => deleteTodoItem(todo.id)}></SvgIcon>
            </Grid>
        </>
    );
};