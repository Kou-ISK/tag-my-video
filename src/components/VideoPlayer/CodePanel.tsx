import { Box, Divider, Stack, Typography } from '@mui/material';
import { CodeButton } from './CodeButton';
import { Dispatch, SetStateAction, useEffect, useMemo, useState } from 'react';
import React from 'react';

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

type ActionListEntry = string;

export const CodePanel = ({
  metaDataConfigFilePath,
  addTimelineData,
  teamNames,
  setTeamNames,
}: CodePanelProps) => {
  const [actionList, setActionList] = useState<ActionListEntry[]>([]);

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
          setActionList(data.actionList as ActionListEntry[]);
        }
      })
      .catch((error) => console.error('Error loading JSON:', error));

    return () => {
      isActive = false;
    };
  }, [metaDataConfigFilePath, setTeamNames]);

  const groupedActions = useMemo(() => {
    return actionList.reduce<Record<string, ActionListEntry[]>>(
      (groups, item) => {
        const leading = item.split(' ')[0];
        const key = leading ?? 'その他';
        if (!groups[key]) {
          groups[key] = [];
        }
        groups[key].push(item);
        return groups;
      },
      {},
    );
  }, [actionList]);

  const renderButtons = (label: string, actions: ActionListEntry[]) => (
    <Box key={label}>
      <Typography variant="overline" color="text.secondary">
        {label}
      </Typography>
      <Stack direction="column" spacing={1} sx={{ mt: 0.5 }}>
        {actions.map((action) => (
          <Stack
            key={action}
            direction="row"
            spacing={1}
            useFlexGap
            flexWrap="wrap"
          >
            {teamNames.map((teamName, index) => (
              <CodeButton
                key={`${teamName}-${action}`}
                actionName={`${teamName} ${action}`}
                addTimelineData={addTimelineData}
                color={index === 0 ? 'team1' : 'team2'}
              />
            ))}
          </Stack>
        ))}
      </Stack>
    </Box>
  );

  const actionGroupEntries = useMemo(
    () => Object.entries(groupedActions),
    [groupedActions],
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
        タグのショートカット
      </Typography>
      <Divider sx={{ mb: 1.5 }} />
      <Box
        sx={{
          flex: 1,
          minHeight: 0,
          overflowY: 'auto',
          pr: 1,
        }}
      >
        <Stack spacing={2}>
          {actionGroupEntries.length > 0 ? (
            actionGroupEntries.map(([label, actions], index) => (
              <React.Fragment key={label}>
                {renderButtons(label, actions)}
                {index < actionGroupEntries.length - 1 && <Divider />}
              </React.Fragment>
            ))
          ) : (
            <Typography variant="body2" color="text.secondary">
              メタデータを読み込むとタグのショートカットが表示されます。
            </Typography>
          )}
        </Stack>
      </Box>
    </Box>
  );
};
