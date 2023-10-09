import { MenuItem, Select, SelectChangeEvent } from '@mui/material'
import { ActionList } from '../../ActionList'
import { useState } from 'react';

interface ActionResultSelectorProps {
    id: string
    actionName: string,
    updateActionResult: any
}
export const ActionResultSelector = ({ id, actionName, updateActionResult }: ActionResultSelectorProps) => {
    const results = ActionList.find((value) => actionName.includes(value.action))?.results
    const [result, setResult] = useState('');
    const handleChange = (event: SelectChangeEvent) => {
        setResult(event.target.value)
        updateActionResult(id, event.target.value)
    }
    return (
        <>
            <Select
                value={result}
                label="Result"
                onChange={handleChange}
                sx={{ margin: '5px' }}
                size='small'
            >
                <MenuItem sx={{ zIndex: 2000 }} value={''}></MenuItem>
                {results && results.map((value) =>
                    <MenuItem sx={{ zIndex: 2000 }} value={value}>{value}</MenuItem>
                )}
            </Select>
        </>
    )
}