import React, { useRef } from 'react';
import { Upload, FileText, Cpu, Play, CheckCircle, Sparkles, Loader2 } from 'lucide-react';
import { Step } from '../types';

interface LeftPanelProps {
  inputText: string;
  setInputText: (text: string) => void;
  currentStep: Step;
  isProcessing: boolean;
  onStartProcess: () => void;
  onLoadDemo: () => void;
  progressLog: string[];
}

const LeftPanel: React.FC<LeftPanelProps> = ({
  inputText,
  setInputText,
  currentStep,
  isProcessing,
  onStartProcess,
  onLoadDemo,
  progressLog
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target?.result as string;
        setInputText(text);
      };
      reader.readAsText(file);
    }
  };

  const steps = [
    { id: Step.ANALYZING, label: '题材分析与设定', icon: Cpu },
    { id: Step.PLANNING, label: '剧情分集拆解', icon: FileText },
    { id: Step.WRITING, label: '漫剧剧本生成', icon: Play },
  ];

  const getStepStatus = (stepId: Step) => {
    const stepOrder = [Step.IDLE, Step.ANALYZING, Step.PLANNING, Step.WRITING, Step.COMPLETE];
    const currentIndex = stepOrder.indexOf(currentStep);
    const stepIndex = stepOrder.indexOf(stepId);

    if (currentIndex > stepIndex) return 'completed';
    if (currentIndex === stepIndex) return 'active';
    return 'pending';
  };

  return (
    <div className="flex flex-col h-full bg-slate-900 border-r border-slate-800 relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-cyan-500 to-transparent opacity-50"></div>

      {/* Header */}
      <div className="p-6 border-b border-slate-800">
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <span className="text-cyan-400">Manju</span>AI <span className="text-xs px-2 py-0.5 rounded border border-cyan-900 text-cyan-500 bg-cyan-950/30">AGENT</span>
        </h1>
        <p className="text-slate-400 text-sm mt-1">网文漫剧改编智能体系统</p>
      </div>

      {/* Input Section */}
      <div className="flex-1 p-6 flex flex-col gap-4 overflow-y-auto">
        {currentStep === Step.IDLE ? (
          <div className="space-y-4">
             <div 
              className="border-2 border-dashed border-slate-700 rounded-xl p-8 flex flex-col items-center justify-center text-slate-400 hover:border-cyan-500/50 hover:bg-slate-800/50 transition-all cursor-pointer group"
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload className="w-10 h-10 mb-3 text-slate-600 group-hover:text-cyan-400 transition-colors" />
              <p className="font-medium text-slate-300">上传小说文件 (.txt)</p>
              <p className="text-xs text-slate-500 mt-1">或将文件拖拽至此</p>
              <input 
                type="file" 
                ref={fileInputRef} 
                className="hidden" 
                accept=".txt,.md" 
                onChange={handleFileUpload}
              />
            </div>

            <div className="flex items-center justify-center">
              <button 
                onClick={onLoadDemo}
                className="text-xs text-cyan-500 hover:text-cyan-400 flex items-center gap-1 hover:underline transition-all"
              >
                <Sparkles size={12} /> 加载示例数据 (演示)
              </button>
            </div>
            
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-b from-transparent to-slate-900 pointer-events-none" />
              <textarea
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="或在此粘贴小说正文内容..."
                className="w-full h-64 bg-slate-950 border border-slate-700 rounded-xl p-4 text-sm text-slate-300 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 resize-none font-mono"
              />
            </div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">系统运行日志</h3>
            <div className="flex-1 bg-slate-950 rounded-xl border border-slate-800 p-4 font-mono text-xs overflow-y-auto space-y-2">
              {progressLog.map((log, idx) => (
                <div key={idx} className="text-cyan-400/80 border-l-2 border-cyan-900 pl-2">
                  <span className="text-slate-500">[{new Date().toLocaleTimeString()}]</span> {log}
                </div>
              ))}
              {isProcessing && (
                 <div className="flex items-center gap-2 text-cyan-500 animate-pulse">
                   <span className="w-2 h-2 bg-cyan-500 rounded-full"></span>
                   处理中...
                 </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Control Panel (Sticky Bottom) */}
      <div className="p-6 bg-slate-900 border-t border-slate-800">
        <div className="mb-6 space-y-4">
           {steps.map((step) => {
             const status = getStepStatus(step.id);
             return (
               <div key={step.id} className={`flex items-center gap-3 p-3 rounded-lg border transition-all ${
                 status === 'active' ? 'bg-cyan-950/30 border-cyan-500/50 shadow-[0_0_10px_rgba(6,182,212,0.1)]' : 
                 status === 'completed' ? 'bg-slate-800/50 border-slate-700 opacity-60' :
                 'bg-transparent border-transparent opacity-40'
               }`}>
                 <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                   status === 'active' ? 'bg-cyan-500 text-white animate-pulse' :
                   status === 'completed' ? 'bg-slate-700 text-cyan-400' :
                   'bg-slate-800 text-slate-500'
                 }`}>
                   {status === 'completed' ? <CheckCircle size={16} /> : <step.icon size={16} />}
                 </div>
                 <div className="flex-1">
                   <p className={`text-sm font-medium ${status === 'active' ? 'text-white' : 'text-slate-400'}`}>{step.label}</p>
                 </div>
                 {status === 'active' && <Loader2 className="w-4 h-4 text-cyan-500 animate-spin" />}
               </div>
             )
           })}
        </div>

        <button
          onClick={onStartProcess}
          disabled={!inputText || isProcessing || currentStep === Step.COMPLETE}
          className={`w-full py-4 rounded-xl font-bold text-sm tracking-widest uppercase transition-all flex items-center justify-center gap-2
            ${!inputText || isProcessing 
              ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700' 
              : 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white hover:shadow-[0_0_20px_rgba(6,182,212,0.4)] hover:border-cyan-400 border border-transparent'
            }
          `}
        >
          {isProcessing ? (
            <>
              <Loader2 className="animate-spin w-5 h-5" /> 正在处理
            </>
          ) : currentStep === Step.IDLE ? (
             <>启动智能体 <Play className="w-4 h-4 fill-current" /></>
          ) : currentStep === Step.COMPLETE ? (
             <>任务完成 <CheckCircle className="w-4 h-4" /></>
          ) : (
             <>继续执行 <Play className="w-4 h-4" /></>
          )}
        </button>
      </div>
    </div>
  );
};

export default LeftPanel;