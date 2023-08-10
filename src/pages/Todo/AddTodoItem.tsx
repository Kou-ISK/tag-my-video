import { useState } from "react"

const AddTodoItem = (
    { addTodoItem }:
        { addTodoItem: (contentName: string, deadline: Date) => void }
) => {
    const [contentName, setContentName] = useState('');
    const [deadline, setDeadline] = useState(new Date());
    return (
        <input type="text" value={contentName} />
    )
}