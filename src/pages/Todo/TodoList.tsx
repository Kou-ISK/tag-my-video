import { TodoItem } from './TodoItem';
import { Todo } from '../../types/Todo';

export const TodoList = ({ todoList }: { todoList: Todo[] }) => {
    return (
        <>
            {
                todoList.map((todo) => (
                    <TodoItem contentName={todo.contentName} isDone={false} deadline={todo.deadline} />
                ))
            }
        </>
    )
}