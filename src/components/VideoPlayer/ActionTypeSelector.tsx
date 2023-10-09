import { MenuItem, Select, SelectChangeEvent } from '@mui/material'
import { ActionList } from '../../ActionList'
import { useState } from 'react';

interface ActionTypeSelectorProps {
    id: string
    actionName: string,
    updateActionType: any
}
export const ActionTypeSelector = ({ id, actionName, updateActionType }: ActionTypeSelectorProps) => {
    const types = ActionList.find((value) => actionName.includes(value.action))?.types

    console.log(ActionList);
    console.log(types)
    const [type, setType] = useState('');
    const handleChange = (event: SelectChangeEvent) => {
        setType(event.target.value)
        updateActionType(id, event.target.value)
    }
    return (
        <>
            <Select
                value={type}
                label="Type"
                onChange={handleChange}
                sx={{ margin: '5px' }}
                size='small'
            >
                <MenuItem sx={{ zIndex: 2000 }} value={''}></MenuItem>
                {types && types.map((value) =>
                    <MenuItem sx={{ zIndex: 2000 }} value={value}>{value}</MenuItem>
                )}
            </Select>
        </>
    )
}