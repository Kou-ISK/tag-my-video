import { useTodos } from '../../hooks/useTodos';
import { TodoList } from './TodoList';
export const TodoApp = () => {
    const { todoList, toggleTodoStatus, deleteTodoItem } = useTodos();

    return (
        <>
            <TodoList todoList={todoList} toggleTodoStatus={toggleTodoStatus} deleteTodoItem={deleteTodoItem} />
        </>)
}