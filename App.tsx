import React, { useState } from 'react';
import LeftPanel from './components/LeftPanel';
import RightPanel from './components/RightPanel';
import { AppState, Step, AnalysisResult, EpisodePlan } from './types';
import * as GeminiService from './services/geminiService';
import { mockNovelText, mockAnalysis, mockPlan, mockScriptEp1 } from './data/mockData';

export default function App() {
  const [inputText, setInputText] = useState<string>("");
  const [currentStep, setCurrentStep] = useState<Step>(Step.IDLE);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  
  // Data State
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [episodePlan, setEpisodePlan] = useState<EpisodePlan[]>([]);
  const [scripts, setScripts] = useState<Record<number, string>>({});
  
  // Logging
  const [progressLog, setProgressLog] = useState<string[]>([]);

  const addLog = (msg: string) => {
    setProgressLog(prev => [msg, ...prev]);
  };

  const startAnalysis = async () => {
    if (!inputText) return;
    setIsProcessing(true);
    setCurrentStep(Step.ANALYZING);
    addLog("正在初始化分析队列...");

    try {
      // 1. Analyze
      addLog("将文本发送至神经核心 (Gemini)...");
      const analysis = await GeminiService.analyzeNovel(inputText);
      setAnalysisResult(analysis);
      addLog(`分析完成。识别题材: ${analysis.genre}`);
      addLog(`提取关键词: ${analysis.themes.join(', ')}`);

      // 2. Planning
      setCurrentStep(Step.PLANNING);
      addLog("正在构建叙事架构...");
      const plan = await GeminiService.generateEpisodePlan(analysis, inputText);
      setEpisodePlan(plan);
      addLog(`架构生成完毕。已规划 ${plan.length} 集内容。`);
      
      setCurrentStep(Step.WRITING); // Ready for writing phase
    } catch (error) {
      addLog(`错误: ${error instanceof Error ? error.message : '未知错误'}`);
      setCurrentStep(Step.IDLE);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleGenerateScript = async (episodeId: number) => {
    const episode = episodePlan.find(ep => ep.episodeNumber === episodeId);
    if (!episode || !analysisResult) return;

    setIsProcessing(true);
    addLog(`正在启动第 ${episodeId} 集的剧本生成协议...`);

    try {
      const scriptContent = await GeminiService.generateScriptForEpisode(episode, analysisResult, inputText);
      setScripts(prev => ({
        ...prev,
        [episodeId]: scriptContent
      }));
      addLog(`第 ${episodeId} 集剧本编译成功。`);
    } catch (error) {
      addLog(`第 ${episodeId} 集剧本生成失败`);
    } finally {
      setIsProcessing(false);
    }
  };

  const loadDemoData = () => {
    setInputText(mockNovelText);
    setAnalysisResult(mockAnalysis);
    setEpisodePlan(mockPlan);
    setScripts({ 1: mockScriptEp1 });
    setCurrentStep(Step.WRITING);
    
    // Simulate logs
    setProgressLog([
        "第 01 集剧本编译成功。",
        "架构生成完毕。已规划 3 集内容。",
        "正在构建叙事架构...",
        `提取关键词: ${mockAnalysis.themes.join(', ')}`,
        `分析完成。识别题材: ${mockAnalysis.genre}`,
        "将文本发送至神经核心 (Gemini)...",
        "正在初始化分析队列..."
    ]);
  };

  const appState: AppState = {
    inputText,
    currentStep,
    isProcessing,
    analysis: analysisResult,
    plan: episodePlan,
    scripts,
    selectedEpisodeId: null
  };

  return (
    <div className="flex h-screen w-screen bg-slate-950 text-slate-200 overflow-hidden font-sans">
      {/* Left Panel - 35% Width */}
      <div className="w-[400px] min-w-[350px] h-full z-10 shadow-[5px_0_30px_rgba(0,0,0,0.5)]">
        <LeftPanel 
          inputText={inputText}
          setInputText={setInputText}
          currentStep={currentStep}
          isProcessing={isProcessing}
          onStartProcess={startAnalysis}
          onLoadDemo={loadDemoData}
          progressLog={progressLog}
        />
      </div>

      {/* Right Panel - Remaining Width */}
      <div className="flex-1 h-full relative">
        {/* Subtle Grid Background */}
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10 pointer-events-none"></div>
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:50px_50px] pointer-events-none opacity-20"></div>
        
        <RightPanel 
          appState={appState}
          onGenerateScript={handleGenerateScript}
        />
      </div>
    </div>
  );
}