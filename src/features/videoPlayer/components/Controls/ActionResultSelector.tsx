import {
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  SelectChangeEvent,
} from '@mui/material';
import { ActionList } from '../../../../ActionList';
import React from 'react';

interface ActionResultSelectorProps {
  id: string;
  actionName: string;
  actionResult: string;
  updateActionResult: (id: string, actionResult: string) => void;
}
export const ActionResultSelector = ({
  id,
  actionName,
  actionResult,
  updateActionResult,
}: ActionResultSelectorProps) => {
  const results = ActionList.find((value) =>
    actionName.includes(value.action),
  )?.results;
  const handleChange = (event: SelectChangeEvent) => {
    updateActionResult(id, event.target.value);
  };
  return (
    <>
      <FormControl sx={{ m: 1, minWidth: 120 }} size="small">
        <InputLabel id={id + '_result'}>Result</InputLabel>
        <Select
          id={id + '_result'}
          value={actionResult}
          label="Result"
          onChange={handleChange}
          size="small"
          MenuProps={{
            style: {
              zIndex: 2000,
            },
          }}
        >
          <MenuItem value="">
            <em>None</em>
          </MenuItem>
          {results &&
            results.map((value, index) => (
              <MenuItem key={index} value={value}>
                {value}
              </MenuItem>
            ))}
        </Select>
      </FormControl>
    </>
  );
};
