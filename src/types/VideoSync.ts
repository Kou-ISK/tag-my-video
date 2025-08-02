// 映像同期機能の型定義

export interface VideoSyncData {
  syncOffset: number; // 同期オフセット（秒）
  isAnalyzed: boolean; // 波形分析完了フラグ
  waveformData?: Float32Array; // 波形データ（オプション）
  confidenceScore?: number; // 同期の信頼度スコア（0-1）
}

export interface AudioAnalysisResult {
  offsetSeconds: number; // 検出された同期オフセット
  confidence: number; // 信頼度スコア
  correlationPeak: number; // 相関ピーク値
}

export interface WaveformData {
  audioBuffer: AudioBuffer;
  sampleRate: number;
  duration: number;
  peaks: number[]; // 波形のピーク値配列
}
