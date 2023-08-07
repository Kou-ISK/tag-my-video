import { TodoItem } from './TodoItem';
import { Todo } from '../../types/Todo';

export const TodoList = ({ todoList, toggleTodoStatus, deleteTodoItem }:
    {
        todoList: Todo[],
        toggleTodoStatus: (id: string, isDone: boolean) => void,
        deleteTodoItem: (id: string) => void
    }) => {
    return (
        <>
            {todoList.length !== 0 && (
                todoList.map((todo) => (
                    <TodoItem todo={todo} toggleTodoStatus={toggleTodoStatus} deleteTodoItem={deleteTodoItem} />
                ))
            )
            }
        </>
    )
}