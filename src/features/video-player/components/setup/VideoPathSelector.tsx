import {
  Box,
  Button,
  Typography,
  TextField,
  Stepper,
  Step,
  StepLabel,
  Paper,
  Alert,
  AlertTitle,
  Stack,
  Chip,
  LinearProgress,
  Backdrop,
  CircularProgress,
  Card,
  CardContent,
} from '@mui/material';
import FolderOpenIcon from '@mui/icons-material/FolderOpen';
import VideoFileIcon from '@mui/icons-material/VideoFile';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import GraphicEqIcon from '@mui/icons-material/GraphicEq';
import { PackageDatas } from '../../../../renderer';
import { MetaData } from '../../../../types/MetaData';
import { AudioSyncAnalyzer } from '../../../../utils/AudioSyncAnalyzer';
import { VideoSyncData } from '../../../../types/VideoSync';
import React, { Dispatch, SetStateAction, useState } from 'react';

interface VideoPathSelectorProps {
  setVideoList: Dispatch<SetStateAction<string[]>>;
  setIsFileSelected: Dispatch<SetStateAction<boolean>>;
  isFileSelected: boolean;
  setTimelineFilePath: Dispatch<SetStateAction<string>>;
  setPackagePath: Dispatch<SetStateAction<string>>;
  setMetaDataConfigFilePath: Dispatch<SetStateAction<string>>;
  setSyncData: Dispatch<SetStateAction<VideoSyncData | undefined>>;
}

export const VideoPathSelector = ({
  setVideoList,
  setIsFileSelected,
  isFileSelected,
  setTimelineFilePath,
  setPackagePath,
  setMetaDataConfigFilePath,
  setSyncData,
}: VideoPathSelectorProps) => {
  const [hasOpenModal, setHasOpenModal] = useState<boolean>(false);
  const [packageName, setPackageName] = useState<string>('');
  const [team1Name, setTeam1Name] = useState<string>('');
  const [team2Name, setTeam2Name] = useState<string>('');
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [syncProgress, setSyncProgress] = useState<number>(0);
  const [syncStage, setSyncStage] = useState<string>('');

  // 新規パッケージ作成のステップ管理
  const [activeStep, setActiveStep] = useState<number>(0);
  const [selectedDirectory, setSelectedDirectory] = useState<string>('');
  const [selectedTightVideo, setSelectedTightVideo] = useState<string>('');
  const [selectedWideVideo, setSelectedWideVideo] = useState<string>('');

  // バリデーションエラー
  const [errors, setErrors] = useState<{
    packageName?: string;
    team1Name?: string;
    team2Name?: string;
  }>({});

  const steps = ['基本情報', '保存先選択', '映像ファイル選択', '確認'];

  const handleHasOpenModal = () => {
    setHasOpenModal(true);
    // モーダルを開く際にステートをリセット
    setActiveStep(0);
    setPackageName('');
    setTeam1Name('');
    setTeam2Name('');
    setSelectedDirectory('');
    setSelectedTightVideo('');
    setSelectedWideVideo('');
    setErrors({});
  };

  const handleCloseModal = () => {
    setHasOpenModal(false);
    setActiveStep(0);
  };

  // バリデーション関数
  const validateStep = (step: number): boolean => {
    const newErrors: typeof errors = {};

    if (step === 0) {
      if (!packageName.trim()) {
        newErrors.packageName = 'パッケージ名を入力してください';
      }
      if (!team1Name.trim()) {
        newErrors.team1Name = 'チーム名(1)を入力してください';
      }
      if (!team2Name.trim()) {
        newErrors.team2Name = 'チーム名(2)を入力してください';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = async () => {
    if (!validateStep(activeStep)) {
      return;
    }

    if (activeStep === 1) {
      // 保存先選択
      if (!window.electronAPI) {
        alert('この機能はElectronアプリケーション内でのみ利用できます。');
        return;
      }
      const directory = await window.electronAPI.openDirectory();
      if (directory) {
        setSelectedDirectory(directory);
        setActiveStep(activeStep + 1);
      }
    } else if (activeStep === 2) {
      // 映像ファイル選択
      if (!selectedTightVideo) {
        alert('寄り映像を選択してください');
        return;
      }
      setActiveStep(activeStep + 1);
    } else if (activeStep === 3) {
      // 最終確認→作成実行
      await executeCreatePackage();
    } else {
      setActiveStep(activeStep + 1);
    }
  };

  const handleBack = () => {
    setActiveStep(activeStep - 1);
  };

  const handleSelectTightVideo = async () => {
    if (!window.electronAPI) return;
    const path = await window.electronAPI.openFile();
    if (path) {
      setSelectedTightVideo(path);
    }
  };

  const handleSelectWideVideo = async () => {
    if (!window.electronAPI) return;
    const path = await window.electronAPI.openFile();
    if (path) {
      setSelectedWideVideo(path);
    }
  };

  // パッケージを選択した場合
  const setVideoPathByPackagePath = async () => {
    if (!window.electronAPI) {
      alert('この機能はElectronアプリケーション内でのみ利用できます。');
      return;
    }

    const packagePath = await window.electronAPI.openDirectory();
    if (packagePath) {
      console.log(packagePath + '/.metadata/config.json');

      // 既存のconfig.jsonを相対パスに変換（絶対パスの場合のみ）
      if (window.electronAPI?.convertConfigToRelativePath) {
        try {
          const result =
            await window.electronAPI.convertConfigToRelativePath(packagePath);
          if (result.success) {
            console.log('config.jsonを相対パスに変換しました:', result.config);
          } else {
            console.warn(
              'config.jsonを相対パスに変換できませんでした。相対パスへの変換はスキップします。詳細:',
              result.error,
            );
          }
        } catch (e) {
          console.warn('config.json変換をスキップ:', e);
        }
      }

      const configFilePath = packagePath + '/.metadata/config.json';
      const exists =
        await window.electronAPI?.checkFileExists?.(configFilePath);
      if (!exists) {
        alert(
          '選択したパッケージ内に .metadata/config.json が見つかりません。',
        );
        return;
      }

      setMetaDataConfigFilePath(configFilePath);
      fetch(configFilePath)
        .then((response) => {
          if (!response.ok) {
            throw new Error('Network response was not ok');
          }
          return response.json();
        })
        .then(async (data) => {
          console.log('Config.json loaded:', data);

          const hasWide = !!data.wideViewPath;
          // 相対パスを絶対パスに変換
          const tightRelativePath = data.tightViewPath as string;
          const wideRelativePath = (data.wideViewPath || undefined) as
            | string
            | undefined;

          // パッケージディレクトリをベースに絶対パスを構築
          const tight = packagePath + '/' + tightRelativePath;
          const wide = wideRelativePath
            ? packagePath + '/' + wideRelativePath
            : undefined;

          if (hasWide && tight && wide) {
            const newVideoList = [tight, wide];
            console.log('Setting video list with 2 videos:', {
              list: newVideoList,
              validPaths: newVideoList.map((path) => ({
                path,
                exists: !!path,
                length: path?.length,
                isAbsolute: path?.startsWith('/'),
              })),
            });
            setVideoList(newVideoList);

            // 既存の同期データがあれば復元し、なければ音声同期を実施
            const sd = data.syncData as
              | {
                  syncOffset?: unknown;
                  isAnalyzed?: unknown;
                  confidenceScore?: unknown;
                }
              | undefined;
            if (sd && typeof sd.syncOffset === 'number') {
              const restored: VideoSyncData = {
                syncOffset: Number(sd.syncOffset) || 0,
                isAnalyzed: !!sd.isAnalyzed,
                confidenceScore:
                  typeof sd.confidenceScore === 'number'
                    ? sd.confidenceScore
                    : undefined,
              };
              setSyncData(restored);
              console.log('既存の同期データを復元しました:', restored);
            } else {
              const syncResult = await performAudioSync(tight, wide);
              // config.jsonに同期データを保存
              if (syncResult && window.electronAPI?.saveSyncData) {
                try {
                  const configPath = packagePath + '/.metadata/config.json';
                  await window.electronAPI.saveSyncData(configPath, syncResult);
                  console.log('同期データを保存しました');
                } catch (e) {
                  console.error('同期データの保存に失敗:', e);
                }
              }
            }
          } else {
            const newVideoList = [tight];
            console.log('Setting video list with 1 video:', {
              list: newVideoList,
              validPaths: newVideoList.map((path) => ({
                path,
                exists: !!path,
                length: path?.length,
                isAbsolute: path?.startsWith('/'),
              })),
            });
            setVideoList(newVideoList);
            setSyncData(undefined); // 1本構成では同期なし
          }
          setIsFileSelected(!isFileSelected);
        })
        .catch((error) => {
          console.error('Error loading JSON:', error);
        });
      setTimelineFilePath(packagePath + '/timeline.json');
      setPackagePath(packagePath);
      console.log('Selected file:', packagePath);
    } else {
      console.log('No file selected.');
    }
  };

  // 音声同期分析を実行する関数
  const performAudioSync = async (tightPath: string, widePath: string) => {
    setIsAnalyzing(true);
    setSyncProgress(0);
    try {
      const audioAnalyzer = new AudioSyncAnalyzer();

      // 進捗コールバックを使った詳細な進捗更新
      const syncResult = await audioAnalyzer.quickSyncAnalysis(
        tightPath,
        widePath,
        (stage: string, progress: number) => {
          setSyncStage(stage);
          setSyncProgress(progress);
        },
      );

      const syncData: VideoSyncData = {
        syncOffset: syncResult.offsetSeconds,
        isAnalyzed: true,
        confidenceScore: syncResult.confidence,
      };

      setSyncData(syncData);
      setSyncProgress(100);
      console.log('音声同期完了:', syncResult);

      // 返り値として同期データを返す（呼び出し元で保存）
      return syncData;
    } catch (error) {
      console.error('音声同期分析エラー:', error);
      // エラーの場合は同期なしでセット
      const errorSyncData: VideoSyncData = {
        syncOffset: 0,
        isAnalyzed: false,
        confidenceScore: 0,
      };
      setSyncData(errorSyncData);
      return errorSyncData;
    } finally {
      setIsAnalyzing(false);
      setSyncProgress(0);
      setSyncStage('');
    }
  };

  // パッケージ作成の実行関数
  const executeCreatePackage = async () => {
    if (!window.electronAPI) {
      alert('この機能はElectronアプリケーション内でのみ利用できます。');
      return;
    }

    const metaDataConfig: MetaData = {
      tightViewPath: selectedTightVideo,
      wideViewPath: selectedWideVideo || null,
      team1Name: team1Name,
      team2Name: team2Name,
      actionList: [
        'ポゼッション',
        'スクラム',
        'ラインアウト',
        'キック',
        'タックル',
        'PK',
        'FK',
        'Check',
        'キックオフ',
        'トライ',
        'ショット',
      ],
    };

    const packageDatas: PackageDatas = await window.electronAPI.createPackage(
      selectedDirectory,
      packageName,
      selectedTightVideo,
      selectedWideVideo || null,
      metaDataConfig,
    );

    if (packageDatas.wideViewPath) {
      setVideoList([packageDatas.tightViewPath, packageDatas.wideViewPath]);
      // 2つの映像がある場合は音声同期分析を実行
      const syncResult = await performAudioSync(
        packageDatas.tightViewPath,
        packageDatas.wideViewPath,
      );
      // config.jsonに同期データを保存
      if (syncResult && window.electronAPI?.saveSyncData) {
        try {
          await window.electronAPI.saveSyncData(
            packageDatas.metaDataConfigFilePath,
            syncResult,
          );
          console.log('同期データを保存しました');
        } catch (e) {
          console.error('同期データの保存に失敗:', e);
        }
      }
    } else {
      setVideoList([packageDatas.tightViewPath]);
      // 1つの映像の場合は同期データをリセット
      setSyncData(undefined);
    }

    setTimelineFilePath(packageDatas.timelinePath);
    setMetaDataConfigFilePath(packageDatas.metaDataConfigFilePath);
    setIsFileSelected(!isFileSelected);
    setHasOpenModal(false);
  };
  return (
    <Box sx={{ maxWidth: '800px', mx: 'auto', mt: 4, px: 3 }}>
      <Stack spacing={3}>
        <Button
          sx={{ height: '120px', fontSize: '18px' }}
          onClick={setVideoPathByPackagePath}
          variant="contained"
          size="large"
          startIcon={<FolderOpenIcon />}
        >
          既存パッケージを開く
        </Button>

        <Button
          sx={{ height: '120px', fontSize: '18px' }}
          onClick={handleHasOpenModal}
          variant="outlined"
          size="large"
          startIcon={<VideoFileIcon />}
        >
          新規パッケージを作成
        </Button>
      </Stack>

      {/* 新規パッケージ作成モーダル */}
      {hasOpenModal && (
        <Paper
          elevation={3}
          sx={{
            position: 'fixed',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: '90%',
            maxWidth: '700px',
            maxHeight: '90vh',
            overflow: 'auto',
            p: 4,
            zIndex: 1300,
          }}
        >
          <Typography variant="h5" gutterBottom>
            新規パッケージ作成
          </Typography>

          <Stepper activeStep={activeStep} sx={{ mt: 3, mb: 4 }}>
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>

          {/* ステップ0: 基本情報 */}
          {activeStep === 0 && (
            <Stack spacing={3}>
              <Alert severity="info">
                <AlertTitle>パッケージの基本情報を入力してください</AlertTitle>
                パッケージ名と対戦する2チームの名前を入力します
              </Alert>

              <TextField
                fullWidth
                label="パッケージ名"
                value={packageName}
                onChange={(e) => setPackageName(e.target.value)}
                error={!!errors.packageName}
                helperText={errors.packageName || '例: 2024_春季大会_決勝'}
                required
              />

              <TextField
                fullWidth
                label="チーム名 (1)"
                value={team1Name}
                onChange={(e) => setTeam1Name(e.target.value)}
                error={!!errors.team1Name}
                helperText={errors.team1Name || '赤色で表示されます'}
                required
              />

              <TextField
                fullWidth
                label="チーム名 (2)"
                value={team2Name}
                onChange={(e) => setTeam2Name(e.target.value)}
                error={!!errors.team2Name}
                helperText={errors.team2Name || '青色で表示されます'}
                required
              />
            </Stack>
          )}

          {/* ステップ1: 保存先選択 */}
          {activeStep === 1 && (
            <Stack spacing={3}>
              <Alert severity="info">
                <AlertTitle>パッケージの保存先を選択してください</AlertTitle>
                選択したフォルダ内に「{packageName}」フォルダが作成されます
              </Alert>

              {selectedDirectory ? (
                <Paper
                  variant="outlined"
                  sx={{ p: 2, bgcolor: 'success.light' }}
                >
                  <Stack direction="row" alignItems="center" spacing={1}>
                    <CheckCircleIcon color="success" />
                    <Typography variant="body2" noWrap>
                      {selectedDirectory}
                    </Typography>
                  </Stack>
                </Paper>
              ) : (
                <Typography color="text.secondary">
                  「次へ」をクリックして保存先を選択してください
                </Typography>
              )}
            </Stack>
          )}

          {/* ステップ2: 映像ファイル選択 */}
          {activeStep === 2 && (
            <Stack spacing={3}>
              <Alert severity="info">
                <AlertTitle>映像ファイルを選択してください</AlertTitle>
                寄り映像は必須、引き映像は任意です
              </Alert>

              <Box>
                <Typography variant="subtitle2" gutterBottom>
                  寄り映像 (必須)
                </Typography>
                <Button
                  variant="outlined"
                  onClick={handleSelectTightVideo}
                  fullWidth
                  sx={{ mb: 1 }}
                >
                  {selectedTightVideo ? '再選択' : '選択'}
                </Button>
                {selectedTightVideo && (
                  <Paper
                    variant="outlined"
                    sx={{ p: 1, bgcolor: 'success.light' }}
                  >
                    <Stack direction="row" alignItems="center" spacing={1}>
                      <CheckCircleIcon color="success" fontSize="small" />
                      <Typography variant="caption" noWrap>
                        {selectedTightVideo.split('/').pop()}
                      </Typography>
                    </Stack>
                  </Paper>
                )}
              </Box>

              <Box>
                <Typography variant="subtitle2" gutterBottom>
                  引き映像 (任意)
                </Typography>
                <Button
                  variant="outlined"
                  onClick={handleSelectWideVideo}
                  fullWidth
                  sx={{ mb: 1 }}
                >
                  {selectedWideVideo ? '再選択' : '選択'}
                </Button>
                {selectedWideVideo && (
                  <Paper
                    variant="outlined"
                    sx={{ p: 1, bgcolor: 'success.light' }}
                  >
                    <Stack direction="row" alignItems="center" spacing={1}>
                      <CheckCircleIcon color="success" fontSize="small" />
                      <Typography variant="caption" noWrap>
                        {selectedWideVideo.split('/').pop()}
                      </Typography>
                    </Stack>
                  </Paper>
                )}
              </Box>
            </Stack>
          )}

          {/* ステップ3: 確認 */}
          {activeStep === 3 && (
            <Stack spacing={2}>
              <Alert severity="success">
                <AlertTitle>作成内容の確認</AlertTitle>
                以下の内容でパッケージを作成します
              </Alert>

              <Paper variant="outlined" sx={{ p: 2 }}>
                <Stack spacing={1.5}>
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      パッケージ名
                    </Typography>
                    <Typography variant="body1">{packageName}</Typography>
                  </Box>

                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      チーム
                    </Typography>
                    <Stack direction="row" spacing={1}>
                      <Chip label={team1Name} color="error" size="small" />
                      <Typography variant="body2">vs</Typography>
                      <Chip label={team2Name} color="primary" size="small" />
                    </Stack>
                  </Box>

                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      保存先
                    </Typography>
                    <Typography variant="body2" noWrap>
                      {selectedDirectory}
                    </Typography>
                  </Box>

                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      映像ファイル
                    </Typography>
                    <Typography variant="body2" noWrap>
                      寄り: {selectedTightVideo.split('/').pop()}
                    </Typography>
                    {selectedWideVideo && (
                      <Typography variant="body2" noWrap>
                        引き: {selectedWideVideo.split('/').pop()}
                      </Typography>
                    )}
                  </Box>
                </Stack>
              </Paper>
            </Stack>
          )}

          {/* 進捗表示 - 控えめなインライン表示 */}
          {isAnalyzing && (
            <Alert severity="info" sx={{ mt: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <CircularProgress size={20} />
                <Box sx={{ flex: 1 }}>
                  <Typography variant="body2" fontWeight="medium">
                    音声同期分析中...
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {syncStage} ({Math.round(syncProgress)}%)
                  </Typography>
                </Box>
              </Box>
              <LinearProgress
                variant="determinate"
                value={syncProgress}
                sx={{ mt: 1 }}
              />
            </Alert>
          )}

          {/* ボタン */}
          <Stack direction="row" spacing={2} sx={{ mt: 4 }}>
            <Button onClick={handleCloseModal} disabled={isAnalyzing}>
              キャンセル
            </Button>

            <Box sx={{ flex: 1 }} />

            {activeStep > 0 && (
              <Button onClick={handleBack} disabled={isAnalyzing}>
                戻る
              </Button>
            )}

            <Button
              variant="contained"
              onClick={handleNext}
              disabled={isAnalyzing}
            >
              {activeStep === steps.length - 1 ? '作成' : '次へ'}
            </Button>
          </Stack>
        </Paper>
      )}

      {/* 背景オーバーレイ */}
      {hasOpenModal && (
        <Box
          sx={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            bgcolor: 'rgba(0, 0, 0, 0.5)',
            zIndex: 1299,
          }}
          onClick={handleCloseModal}
        />
      )}

      {/* 音声同期中の全画面オーバーレイ */}
      <Backdrop
        open={isAnalyzing}
        sx={{
          zIndex: 1400,
          color: '#fff',
          backdropFilter: 'blur(4px)',
          backgroundColor: 'rgba(0, 0, 0, 0.7)',
        }}
      >
        <Card
          sx={{
            minWidth: 400,
            maxWidth: 500,
            backgroundColor: 'background.paper',
          }}
        >
          <CardContent>
            <Stack spacing={3} alignItems="center">
              {/* アニメーションアイコン */}
              <Box
                sx={{
                  position: 'relative',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <CircularProgress
                  size={80}
                  thickness={4}
                  sx={{ color: 'primary.main' }}
                />
                <Box
                  sx={{
                    position: 'absolute',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <GraphicEqIcon sx={{ fontSize: 40, color: 'primary.main' }} />
                </Box>
              </Box>

              {/* タイトル */}
              <Typography variant="h6" component="div" fontWeight="medium">
                音声同期分析中
              </Typography>

              {/* ステージ説明 */}
              <Typography
                variant="body2"
                color="text.secondary"
                textAlign="center"
              >
                {syncStage || '音声データを解析しています...'}
              </Typography>

              {/* プログレスバー */}
              <Box sx={{ width: '100%' }}>
                <LinearProgress
                  variant="determinate"
                  value={syncProgress}
                  sx={{ height: 8, borderRadius: 4 }}
                />
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ mt: 1, display: 'block', textAlign: 'center' }}
                >
                  {Math.round(syncProgress)}%
                </Typography>
              </Box>

              {/* 注意書き */}
              <Alert severity="warning" sx={{ width: '100%' }}>
                <Typography variant="caption">
                  音声同期の精度向上のため、処理には時間がかかる場合があります。
                  この間、他の操作はできません。
                </Typography>
              </Alert>
            </Stack>
          </CardContent>
        </Card>
      </Backdrop>
    </Box>
  );
};
