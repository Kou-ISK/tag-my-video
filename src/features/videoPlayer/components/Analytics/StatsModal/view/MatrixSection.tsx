import React from 'react';
import {
  Button,
  Divider,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import { TimelineData } from '../../../../../../types/TimelineData';

interface MatrixSectionProps {
  title: string;
  rowKeys: string[];
  columnKeys: string[];
  matrix: Array<Array<{ count: number; entries: TimelineData[] }>>;
  onDrilldown: (title: string, entries: TimelineData[]) => void;
}

export const MatrixSection = ({
  title,
  rowKeys,
  columnKeys,
  matrix,
  onDrilldown,
}: MatrixSectionProps) => {
  if (rowKeys.length === 0 || columnKeys.length === 0) {
    return null;
  }

  return (
    <Paper elevation={1} sx={{ p: 3, borderRadius: 2 }}>
      <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
        {title}
      </Typography>
      <Divider sx={{ mb: 2 }} />
      <TableContainer
        component={Paper}
        variant="outlined"
        sx={{ borderRadius: 2 }}
      >
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 600 }}>行/列</TableCell>
              {columnKeys.map((column) => (
                <TableCell key={column} align="center" sx={{ fontWeight: 600 }}>
                  {column || '未設定'}
                </TableCell>
              ))}
              <TableCell align="center" sx={{ fontWeight: 600 }}>
                合計
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rowKeys.map((rowKey, rowIndex) => {
              const rowCells = matrix[rowIndex] ?? [];
              const rowTotal = rowCells.reduce(
                (sum, cell) => sum + cell.count,
                0,
              );
              return (
                <TableRow key={rowKey} hover>
                  <TableCell sx={{ fontWeight: 600 }}>
                    {rowKey || '未設定'}
                  </TableCell>
                  {columnKeys.map((columnKey, colIndex) => {
                    const cell = rowCells[colIndex] ?? {
                      count: 0,
                      entries: [],
                    };
                    const titleLabel = `${title} - ${rowKey || '未設定'} × ${
                      columnKey || '未設定'
                    }`;
                    return (
                      <TableCell key={`${rowKey}-${columnKey}`} align="center">
                        {cell.count > 0 ? (
                          <Button
                            size="small"
                            onClick={() =>
                              onDrilldown(titleLabel, cell.entries)
                            }
                          >
                            {cell.count}
                          </Button>
                        ) : (
                          <Typography variant="caption" color="text.disabled">
                            0
                          </Typography>
                        )}
                      </TableCell>
                    );
                  })}
                  <TableCell align="center">
                    <Typography variant="body2" color="text.secondary">
                      {rowTotal}
                    </Typography>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  );
};
