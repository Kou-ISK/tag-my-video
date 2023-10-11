import { FormControl, InputLabel, MenuItem, Select, SelectChangeEvent } from '@mui/material'
import { ActionList } from '../../ActionList'
import { useState } from 'react';

interface ActionResultSelectorProps {
    id: string
    actionName: string,
    actionResult: string,
    updateActionResult: any
}
export const ActionResultSelector = ({ id, actionName, actionResult, updateActionResult }: ActionResultSelectorProps) => {
    const results = ActionList.find((value) => actionName.includes(value.action))?.results
    const [result, setResult] = useState(actionResult);
    const handleChange = (event: SelectChangeEvent) => {
        setResult(event.target.value)
        updateActionResult(id, event.target.value)
    }
    return (
        <>
            <FormControl sx={{ m: 1, minWidth: 120 }} size="small">
                <InputLabel id={id + "_result"}>Result</InputLabel>
                <Select
                    id={id + "_result"}
                    value={result}
                    label="Result"
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
                    {results && results.map((value) =>
                        <MenuItem value={value}>{value}</MenuItem>
                    )}
                </Select>
            </FormControl>
        </>
    )
}