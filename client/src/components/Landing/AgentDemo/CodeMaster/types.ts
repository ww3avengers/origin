export interface CodeTask {
  id: number;
  title: string;
  description: string;
  initialCode: string;
  solution: string;
  hint: string;
}

export interface CodeSnippet {
  code: string;
  language: string;
  showLineNumbers?: boolean;
}

export interface CodeAnalysisResult {
  performanceScore: number;
  optimizations: string[];
  issues: string[];
  suggestions: string[];
}

export interface CodePreviewState {
  renderCount: number;
  isOptimized: boolean;
  lastRenderTime: number;
  performanceMetrics: {
    averageRenderTime: number;
    renderCount: number;
    totalRenderTime: number;
  };
}

export type EditorStatus = 'editing' | 'solving' | 'solved' | 'error';
