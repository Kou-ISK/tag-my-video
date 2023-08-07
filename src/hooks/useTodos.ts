import { useEffect, useState } from "react";
import { Todo } from "../types/Todo";

export const useTodos = () => {
    const [todoList, setTodoList] = useState<Todo[]>([]);
    useEffect(() => {
        setTodoList({
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
        }.todoList)
    }, []);


    // TODO データの永続化を行うかを決める
    const toggleTodoStatus = (id: string, isDone: boolean) => {
        const updatedTodoList = todoList.map((todo) =>
            todo.id === id ? { ...todo, isDone } : todo
        );
        setTodoList(updatedTodoList);
    }

    const deleteTodoItem = (id: string) => {
        const updatedTodoList = todoList.filter((todo) => todo.id !== id);
        setTodoList(updatedTodoList);
    }

    //　実装する
    const addTodoItem = () => {
    }

    return { todoList, setTodoList, toggleTodoStatus, deleteTodoItem };
}