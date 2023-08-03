import { TodoItem } from './TodoItem';
import { Todo } from '../../types/Todo';

export const TodoList = ({ todoList }: { todoList: Todo[] }) => {
    return (
        <>
            {todoList.length !== 0 && (
                todoList.map((todo) => (
                    <TodoItem contentName={todo.contentName} isDone={todo.isDone} deadline={todo.deadline} />
                ))
            )
            }
        </>
    )
}