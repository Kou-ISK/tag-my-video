import { Box, Button } from "@mui/material";
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
            <Box display={"flex"} flexDirection={"row"} justifyContent={"space-around"}>
                <p style={{ verticalAlign: 'middle' }}>{todo.contentName}</p>
                <Button onClick={toggleIsDone} color={todo.isDone ? "success" : "error"} variant='outlined'>
                    {todo.isDone ? "完了" : "未完"}
                </Button>
                <p style={{ verticalAlign: 'top' }}>{todo.deadline.toString()}</p>
                <Button
                    variant='outlined'
                    endIcon={<DeleteOutlineOutlinedIcon />}
                    onClick={() => deleteTodoItem(todo.id)}
                >削除</Button>
            </Box>
        </>
    );
};