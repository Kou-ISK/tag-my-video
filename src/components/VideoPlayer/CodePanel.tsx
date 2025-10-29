import {
  Box,
  Stack,
  Typography,
  Divider,
  Grid,
} from '@mui/material';
import { CodeButton } from './CodeButton';
import React, { Dispatch, SetStateAction, useEffect, useMemo, useState } from 'react';

interface CodePanelProps {
  metaDataConfigFilePath: string;
  addTimelineData: (
    actionName: string,
    startTime: number,
    endTime: number,
    qualifier: string,
  ) => void;
  teamNames: string[];
  setTeamNames: Dispatch<SetStateAction<string[]>>;
}

export const CodePanel = ({
  metaDataConfigFilePath,
  addTimelineData,
  teamNames,
  setTeamNames,
}: CodePanelProps) => {
  const [actionList, setActionList] = useState<string[]>([]);

  useEffect(() => {
    if (!metaDataConfigFilePath) return;

    let isActive = true;

    fetch(metaDataConfigFilePath)
      .then((response) => response.json())
      .then((data) => {
        if (!isActive || !data) return;

        if (data.team1Name && data.team2Name) {
          setTeamNames([data.team1Name, data.team2Name]);
        }

        if (Array.isArray(data.actionList)) {
          setActionList(data.actionList as string[]);
        }
      })
      .catch((error) => console.error('Error loading JSON:', error));

    return () => {
      isActive = false;
    };
  }, [metaDataConfigFilePath, setTeamNames]);

  // カテゴリでグループ化（表示には使用しない、順序保持のため）
  const groupedActions = useMemo(() => {
    return actionList.reduce<Record<string, string[]>>((groups, item) => {
      const leading = item.split(' ')[0];
      const key = leading ?? 'その他';
      if (!groups[key]) {
        groups[key] = [];
      }
      groups[key].push(item);
      return groups;
    }, {});
  }, [actionList]);

  const actionGroupEntries = useMemo(
    () => Object.entries(groupedActions),
    [groupedActions],
  );

  const renderTeamColumn = (teamName: string, teamIndex: number) => (
    <Box sx={{ flex: 1, minWidth: 0 }}>
      <Typography
        variant="h6"
        sx={{
          mb: 2,
          pb: 1,
          borderBottom: 2,
          borderColor: teamIndex === 0 ? 'team1.main' : 'team2.main',
          color: teamIndex === 0 ? 'team1.main' : 'team2.main',
          fontWeight: 'bold',
        }}
      >
        {teamName}
      </Typography>
      <Stack spacing={1}>
        {actionGroupEntries.map(([category, actions]) => (
          <React.Fragment key={category}>
            {actions.map((action) => (
              <CodeButton
                key={`${teamName}-${action}`}
                actionName={`${teamName} ${action}`}
                displayName={action}
                addTimelineData={addTimelineData}
                color={teamIndex === 0 ? 'team1' : 'team2'}
              />
            ))}
          </React.Fragment>
        ))}
      </Stack>
    </Box>
  );

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        flex: 1,
        minHeight: 0,
        overflow: 'hidden',
      }}
    >
      <Typography variant="subtitle1" sx={{ mb: 1 }}>
        アクション入力
      </Typography>
      <Divider sx={{ mb: 2 }} />
      <Box
        sx={{
          flex: 1,
          minHeight: 0,
          overflowY: 'auto',
          overflowX: 'hidden',
        }}
      >
        {teamNames.length === 2 ? (
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              {renderTeamColumn(teamNames[0], 0)}
            </Grid>
            <Grid item xs={12} md={6}>
              {renderTeamColumn(teamNames[1], 1)}
            </Grid>
          </Grid>
        ) : (
          <Box sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              メタデータを読み込むとアクションが表示されます
            </Typography>
          </Box>
        )}
      </Box>
    </Box>
  );
};
