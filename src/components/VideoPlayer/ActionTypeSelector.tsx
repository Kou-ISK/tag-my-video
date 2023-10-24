import { FormControl, InputLabel, MenuItem, Select, SelectChangeEvent } from '@mui/material'
import { ActionList } from '../../ActionList'
import { useState } from 'react';

interface ActionTypeSelectorProps {
    id: string
    actionName: string,
    actionType: string,
    updateActionType: any
}
export const ActionTypeSelector = ({ id, actionName, actionType, updateActionType }: ActionTypeSelectorProps) => {
    const types = ActionList.find((value) => actionName.includes(value.action))?.types
    const handleChange = (event: SelectChangeEvent) => {
        updateActionType(id, event.target.value)
    }
    return (
        <>
            <FormControl sx={{ m: 1, minWidth: 120 }} size="small">
                <InputLabel id={id + "_type"}>Type</InputLabel>
                <Select
                    id={id + "_type"}
                    value={actionType}
                    label="Type"
                    onChange={handleChange}
                    size='small'
                    MenuProps={{
                        style: {
                            zIndex: 2000
                        }
                    }}
                >
                    <MenuItem value="">
                        <em>None</em>
                    </MenuItem>
                    {types && types.map((value) =>
                        <MenuItem value={value}>{value}</MenuItem>
                    )}
                </Select>
            </FormControl>
        </>
    )
}