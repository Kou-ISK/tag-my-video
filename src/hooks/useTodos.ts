import { useState } from "react";
import { Todo } from "../types/Todo";

export const useTodos = () => {
    const [todoList, setTodoList] = useState<Todo[]>([]);
    // TODO データの永続化を行うかを決める
    const toggleTodoStatus = (id: string, isDone: boolean) => {
        const updatedTodoList = todoList.map((todo) =>
            todo.id === id ? { ...todo, isDone } : todo
        );
        setTodoList(updatedTodoList);
    }
}