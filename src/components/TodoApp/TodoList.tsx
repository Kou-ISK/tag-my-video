import { TodoItem } from './TodoItem';
import { Todo } from '../../types/Todo';
import { Box } from '@mui/material';

export const TodoList = ({ todoList, toggleTodoStatus, deleteTodoItem }:
    {
        todoList: Todo[],
        toggleTodoStatus: (id: string, isDone: boolean) => void,
        deleteTodoItem: (id: string) => void
    }) => {
    return (
        <>
            <Box display={'flex'} flexDirection={'column'}>
                {todoList.length !== 0 && (
                    todoList.map((todo) => (
                        <TodoItem todo={todo} toggleTodoStatus={toggleTodoStatus} deleteTodoItem={deleteTodoItem} />
                    ))
                )
                }
            </Box>
        </>
    )
}