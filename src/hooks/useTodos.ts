import { useState } from "react";
import { Todo } from "../types/Todo";

export const useTodos = () => {
    // TODO トグル用メソッドを作成
    // TODO データの管理をどこで行うかを決める(db.json?)
    const [todoList, setTodoList] = useState<Todo[]>([]);
}