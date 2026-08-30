import React from 'react';
import {
  Dialog,
  DialogContent,
  Box,
  Typography,
  Button,
  Stack,
  MobileStepper,
  Paper,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { IconAction } from './ui';

export interface TutorialStep {
  title: string;
  description: string;
  icon: React.ReactNode;
  tips?: string[];
}

interface OnboardingTutorialViewProps {
  open: boolean;
  activeStep: number;
  stepsCount: number;
  currentStep: TutorialStep;
  onNext: () => void;
  onBack: () => void;
  onSkip: () => void;
}

export const OnboardingTutorialView: React.FC<OnboardingTutorialViewProps> = ({
  open,
  activeStep,
  stepsCount,
  currentStep,
  onNext,
  onBack,
  onSkip,
}) => {
  return (
    <Dialog
      open={open}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: (theme) => theme.shape.borderRadius,
          bgcolor: (theme) => theme.custom.tokens.surface.work,
          border: (theme) => `1px solid ${theme.custom.tokens.border.subtle}`,
        },
      }}
    >
      <IconAction
        icon={<CloseIcon />}
        label="チュートリアルを閉じる"
        onClick={onSkip}
        sx={{
          position: 'absolute',
          right: 8,
          top: 8,
          color: 'text.secondary',
        }}
      />

      <DialogContent sx={{ pt: 6, pb: 3 }}>
        <Stack spacing={3} alignItems="center">
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              width: 120,
              height: 120,
              bgcolor: (theme) =>
                theme.custom.tokens.interactive.hover,
              borderRadius: '50%',
              border: (theme) => `2px solid ${theme.custom.tokens.border.focus}`,
            }}
          >
            {currentStep.icon}
          </Box>

          <Typography
            variant="h5"
            fontWeight="bold"
            textAlign="center"
            sx={{ color: 'primary.main' }}
          >
            {currentStep.title}
          </Typography>

          <Typography
            variant="body1"
            textAlign="center"
            color="text.secondary"
            sx={{ maxWidth: 450 }}
          >
            {currentStep.description}
          </Typography>

          {currentStep.tips && (
            <Paper
              variant="outlined"
              sx={{
                width: '100%',
                p: 2,
                bgcolor: (theme) => theme.custom.tokens.surface.selected,
                borderColor: (theme) => theme.custom.tokens.border.subtle,
              }}
            >
              <Typography
                variant="caption"
                fontWeight="bold"
                sx={{ color: 'secondary.main', mb: 1, display: 'block' }}
              >
                Tips
              </Typography>
              <Stack spacing={0.5}>
                {currentStep.tips.map((tip) => (
                  <Typography
                    key={tip}
                    variant="body2"
                    color="text.secondary"
                    sx={{ pl: 1 }}
                  >
                    {'- '}
                    {tip}
                  </Typography>
                ))}
              </Stack>
            </Paper>
          )}

          <MobileStepper
            variant="dots"
            steps={stepsCount}
            position="static"
            activeStep={activeStep}
            sx={{
              width: '100%',
              bgcolor: 'transparent',
              '& .MuiMobileStepper-dot': {
                bgcolor: 'action.disabled',
              },
              '& .MuiMobileStepper-dotActive': {
                bgcolor: 'primary.main',
              },
            }}
            nextButton={
              <Button
                size="large"
                onClick={onNext}
                variant={activeStep === stepsCount - 1 ? 'contained' : 'outlined'}
                endIcon={activeStep === stepsCount - 1 ? null : <ArrowForwardIcon />}
              >
                {activeStep === stepsCount - 1 ? '始める' : '次へ'}
              </Button>
            }
            backButton={
              <Button
                size="large"
                onClick={onBack}
                disabled={activeStep === 0}
                startIcon={<ArrowBackIcon />}
              >
                戻る
              </Button>
            }
          />

          {activeStep < stepsCount - 1 && (
            <Button
              onClick={onSkip}
              color="inherit"
              size="small"
              sx={{ textTransform: 'none' }}
            >
              スキップ
            </Button>
          )}
        </Stack>
      </DialogContent>
    </Dialog>
  );
};
