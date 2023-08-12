import { Button } from "@mui/material";
import { useState } from "react";
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';


export const AddTodoItem = (
    { addTodoItem }:
        { addTodoItem: (contentName: string, deadline: Date) => void }
) => {
    const [contentName, setContentName] = useState('');
    const today = new Date();
    const [deadline, setDeadline] = useState<Date | null>(today);


    const addTodo = () => {
        if (contentName != null && contentName !== '' && deadline != null) {
            addTodoItem(contentName, deadline);
            setContentName('');
            setDeadline(null);
        }
    }
    // TODO 表示崩れに対応する
    return (
        <>
            <label htmlFor="contentName">タスク名</label>
            <input
                type="text"
                value={contentName}
                onChange={(e) => setContentName(e.currentTarget.value)}
                name='contentName'
            />
            <label htmlFor="deadline">期限</label>
            <DatePicker
                selected={deadline}
                onChange={(date) => setDeadline(date || today)}
                dateFormat='yyyy/MM/dd'
            />
            <br />
            <Button onClick={addTodo}>作成</Button>
        </>
    )
}