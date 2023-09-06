import { Box } from '@mui/material';
import { useTodos } from '../hooks/useTodos';
import { AddTodoItem } from '../components/TodoApp/AddTodoItem';
import { TodoList } from '../components/TodoApp/TodoList';
export const TodoApp = () => {
    const { todoList, toggleTodoStatus, deleteTodoItem, addTodoItem } = useTodos();
    return (
        <>
            <h1>Todo App</h1>
            <AddTodoItem addTodoItem={addTodoItem} />
            <Box display={'flex'} flexDirection={'row'} justifyContent={'space-around'}>
                <div>
                    <h3>完了リスト</h3>
                    <TodoList todoList={todoList.filter(todo => todo.isDone)} toggleTodoStatus={toggleTodoStatus} deleteTodoItem={deleteTodoItem} />
                </div>
                <div>
                    <h3>未完リスト</h3>
                    <TodoList todoList={todoList.filter(todo => !todo.isDone)} toggleTodoStatus={toggleTodoStatus} deleteTodoItem={deleteTodoItem} />
                </div>
            </Box>
        </>)
}