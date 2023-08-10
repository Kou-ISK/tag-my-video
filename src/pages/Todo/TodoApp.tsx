import { useTodos } from '../../hooks/useTodos';
import { AddTodoItem } from './AddTodoItem';
import { TodoList } from './TodoList';
export const TodoApp = () => {
    const { todoList, toggleTodoStatus, deleteTodoItem, addTodoItem } = useTodos();

    return (
        <>
            <AddTodoItem addTodoItem={addTodoItem} />
            <TodoList todoList={todoList} toggleTodoStatus={toggleTodoStatus} deleteTodoItem={deleteTodoItem} />
        </>)
}