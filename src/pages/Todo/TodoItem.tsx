import { Button, Card, Grid, Icon, IconButton, Stack, SvgIcon } from "@mui/material";
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
            <Stack>
                <Grid container>
                    <p style={{ verticalAlign: 'middle' }}>{todo.contentName}</p>
                    <Button onClick={toggleIsDone} color={todo.isDone ? "success" : "error"} >
                        {todo.isDone ? "完了" : "未完"}
                    </Button>
                    <p style={{ verticalAlign: 'top' }}>{todo.deadline.toString()}</p>
                    <Button
                        variant='text'
                        endIcon={<DeleteOutlineOutlinedIcon />}
                        onClick={() => deleteTodoItem(todo.id)}
                    >削除</Button>
                </Grid >
            </Stack>
        </>
    );
};