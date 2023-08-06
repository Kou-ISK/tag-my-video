import { TodoList } from './TodoList';
export const Todo = () => {
    const todo = {
        "todoList": [{
            "id": "1",
            "contentName": "todo1",
            "isDone": false,
            "deadline": new Date(2023, 5, 22, 3, 2)
        },
        {
            "id": "2",
            "contentName": "todo2",
            "isDone": true,
            "deadline": new Date(2023, 5, 22, 3, 2)
        }]
    }.todoList
    return (
        <>
            <TodoList todoList={todo} />
        </>)
}