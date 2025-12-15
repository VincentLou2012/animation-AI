import React, { useState } from 'react';
import { AnalysisResult, EpisodePlan, AppState, Genre } from '../types';
import { BookOpen, Users, Layers, Film, FileText, Download, ChevronRight } from 'lucide-react';

interface RightPanelProps {
  appState: AppState;
  onGenerateScript: (episodeId: number) => void;
}

const RightPanel: React.FC<RightPanelProps> = ({ appState, onGenerateScript }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'episodes' | 'script'>('overview');

  // Auto-switch tabs based on state progress
  React.useEffect(() => {
    if (appState.plan.length > 0 && activeTab === 'overview') {
       setActiveTab('episodes');
    }
  }, [appState.plan]);

  if (!appState.analysis && !appState.isProcessing) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-slate-600 bg-slate-950">
        <div className="w-24 h-24 rounded-full bg-slate-900 flex items-center justify-center mb-6 animate-pulse">
           <CpuIcon className="w-10 h-10 opacity-50" />
        </div>
        <p className="text-lg font-light tracking-wide">等待数据输入...</p>
      </div>
    );
  }

  return (
    <div className="h-full bg-black text-slate-200 flex flex-col overflow-hidden">
      {/* Navigation Tabs */}
      <div className="h-16 border-b border-slate-800 flex items-center px-6 gap-6 bg-slate-900/50 backdrop-blur-sm">
        <TabButton 
          active={activeTab === 'overview'} 
          onClick={() => setActiveTab('overview')} 
          icon={BookOpen} 
          label="作品分析" 
          disabled={!appState.analysis}
        />
        <TabButton 
          active={activeTab === 'episodes'} 
          onClick={() => setActiveTab('episodes')} 
          icon={Layers} 
          label="分集规划" 
          disabled={appState.plan.length === 0}
        />
        <TabButton 
          active={activeTab === 'script'} 
          onClick={() => setActiveTab('script')} 
          icon={FileText} 
          label="剧本编辑器" 
          disabled={Object.keys(appState.scripts).length === 0}
        />
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto p-8 custom-scrollbar relative">
         <div className="max-w-5xl mx-auto">
            {activeTab === 'overview' && appState.analysis && (
              <OverviewView analysis={appState.analysis} />
            )}
            
            {activeTab === 'episodes' && (
              <EpisodesView 
                plan={appState.plan} 
                scripts={appState.scripts}
                onGenerate={onGenerateScript}
                isProcessing={appState.isProcessing}
                onViewScript={(id) => setActiveTab('script')} // Logic to set selected script would go here in full app
              />
            )}

            {activeTab === 'script' && (
              <ScriptReader scripts={appState.scripts} plan={appState.plan} />
            )}
         </div>
      </div>
    </div>
  );
};

const TabButton = ({ active, onClick, icon: Icon, label, disabled }: any) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className={`h-full border-b-2 px-2 flex items-center gap-2 text-sm font-medium transition-all
      ${active 
        ? 'border-cyan-500 text-cyan-400' 
        : disabled 
          ? 'border-transparent text-slate-700 cursor-not-allowed'
          : 'border-transparent text-slate-400 hover:text-white hover:border-slate-600'
      }
    `}
  >
    <Icon size={16} />
    {label}
  </button>
);

const OverviewView = ({ analysis }: { analysis: AnalysisResult }) => (
  <div className="space-y-8 animate-fade-in">
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      <div className="col-span-1 md:col-span-2 bg-slate-900/50 border border-slate-800 rounded-2xl p-8 backdrop-blur-sm">
        <div className="flex items-start justify-between mb-4">
           <div>
              <span className="text-cyan-500 font-mono text-xs uppercase tracking-widest border border-cyan-500/30 px-2 py-1 rounded bg-cyan-950/30">{analysis.genre}</span>
              <h2 className="text-3xl font-bold text-white mt-3">{analysis.title || "未命名项目"}</h2>
           </div>
        </div>
        <p className="text-lg text-slate-300 leading-relaxed italic border-l-4 border-cyan-600 pl-4 py-1">
          "{analysis.logline}"
        </p>
        <div className="mt-6 flex flex-wrap gap-2">
           {analysis.themes.map(t => (
             <span key={t} className="px-3 py-1 rounded-full bg-slate-800 text-xs text-slate-400 border border-slate-700">#{t}</span>
           ))}
        </div>
      </div>

      <div className="bg-slate-900/30 border border-slate-800 rounded-2xl p-6">
        <h3 className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-2">
           <Users size={16} /> 主要角色
        </h3>
        <div className="space-y-4">
          {analysis.characters.map((char, i) => (
            <div key={i} className="group p-3 rounded-lg hover:bg-slate-800 transition-colors cursor-default">
               <div className="flex justify-between items-center mb-1">
                 <span className="font-bold text-cyan-200">{char.name}</span>
                 <span className="text-xs text-slate-500 uppercase">{char.role}</span>
               </div>
               <p className="text-sm text-slate-400 mb-2">{char.description}</p>
               <div className="flex gap-2">
                 {char.traits.map(t => <span key={t} className="text-[10px] bg-slate-950 px-2 py-0.5 rounded text-slate-500">{t}</span>)}
               </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-slate-900/30 border border-slate-800 rounded-2xl p-6">
        <h3 className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-2">
           <Film size={16} /> 改编规格建议
        </h3>
        <div className="space-y-4">
          <div>
            <label className="text-xs text-slate-600 block mb-1">叙事节奏</label>
            <p className="text-sm text-slate-300">{analysis.pacing}</p>
          </div>
          <div>
            <label className="text-xs text-slate-600 block mb-1">目标受众</label>
            <p className="text-sm text-slate-300">{analysis.targetAudience}</p>
          </div>
           <div>
            <label className="text-xs text-slate-600 block mb-1">格式建议</label>
            <p className="text-sm text-slate-300">适合条漫/动态漫形式。对于{analysis.genre}题材，建议加大画面张力与特效表现。</p>
          </div>
        </div>
      </div>
    </div>
  </div>
);

const EpisodesView = ({ plan, scripts, onGenerate, isProcessing, onViewScript }: any) => (
  <div className="space-y-4">
    <div className="flex justify-between items-center mb-6">
       <h2 className="text-2xl font-bold text-white">剧集大纲</h2>
       <span className="text-slate-500 text-sm font-mono">已规划 {plan.length} 集</span>
    </div>

    <div className="grid grid-cols-1 gap-4">
      {plan.map((ep: EpisodePlan) => {
        const hasScript = !!scripts[ep.episodeNumber];
        return (
          <div key={ep.episodeNumber} className="bg-slate-900/40 border border-slate-800 rounded-xl p-5 hover:border-slate-600 transition-all group">
            <div className="flex justify-between items-start">
               <div className="flex-1">
                 <div className="flex items-center gap-3 mb-2">
                    <span className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center font-mono font-bold text-cyan-500 text-sm">
                      {ep.episodeNumber.toString().padStart(2, '0')}
                    </span>
                    <h3 className="font-bold text-lg text-slate-200 group-hover:text-cyan-400 transition-colors">{ep.title}</h3>
                 </div>
                 <p className="text-slate-400 text-sm mb-4 line-clamp-2">{ep.synopsis}</p>
                 <div className="flex gap-2">
                   {ep.charactersInvolved.slice(0, 3).map((c: string) => (
                      <span key={c} className="text-xs px-2 py-1 bg-slate-950 rounded border border-slate-800 text-slate-500">{c}</span>
                   ))}
                 </div>
               </div>
               
               <div className="flex flex-col gap-2 ml-4 min-w-[140px]">
                  {hasScript ? (
                    <button 
                      onClick={() => onViewScript(ep.episodeNumber)}
                      className="px-4 py-2 rounded-lg bg-cyan-950 text-cyan-400 text-xs font-bold border border-cyan-900 hover:bg-cyan-900 transition-all flex items-center justify-center gap-2"
                    >
                      <FileText size={14} /> 查看剧本
                    </button>
                  ) : (
                    <button 
                      onClick={() => onGenerate(ep.episodeNumber)}
                      disabled={isProcessing}
                      className="px-4 py-2 rounded-lg bg-slate-800 text-slate-300 text-xs font-bold hover:bg-cyan-600 hover:text-white transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Users size={14} /> 生成剧本
                    </button>
                  )}
               </div>
            </div>
          </div>
        );
      })}
    </div>
  </div>
);

const ScriptReader = ({ scripts, plan }: { scripts: Record<number, string>, plan: EpisodePlan[] }) => {
  const [currentEpId, setCurrentEpId] = useState<number>(parseInt(Object.keys(scripts)[0]) || 1);
  const content = scripts[currentEpId];

  if (!content) return (
     <div className="flex flex-col items-center justify-center h-96 text-slate-600">
        <p>尚未生成剧本。</p>
        <p className="text-sm">请前往“分集规划”标签页生成。</p>
     </div>
  );

  return (
    <div className="h-full flex flex-col">
       <div className="flex items-center gap-4 mb-6 pb-4 border-b border-slate-800 overflow-x-auto">
          {Object.keys(scripts).map(id => (
            <button
              key={id}
              onClick={() => setCurrentEpId(parseInt(id))}
              className={`px-4 py-2 rounded text-sm whitespace-nowrap transition-all ${
                parseInt(id) === currentEpId 
                ? 'bg-cyan-600 text-white font-bold' 
                : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
              }`}
            >
              第 {id} 集
            </button>
          ))}
       </div>

       <div className="flex-1 bg-slate-950 p-8 rounded-lg font-mono text-sm leading-relaxed text-slate-300 overflow-y-auto border border-slate-800 shadow-inner">
          <div className="prose prose-invert prose-cyan max-w-none">
             {/* Simple formatting for the Markdown content */}
             {content.split('\n').map((line, i) => {
               if (line.startsWith('###') || line.startsWith('**Episode') || line.startsWith('**第')) return <h3 key={i} className="text-xl font-bold text-cyan-400 mt-6 mb-2">{line}</h3>;
               if (line.startsWith('[SCENE]')) return <div key={i} className="text-yellow-500 font-bold mt-4 border-t border-slate-800 pt-4">{line}</div>;
               if (line.startsWith('[VISUAL]')) return <div key={i} className="text-slate-500 italic pl-4 border-l-2 border-slate-700 my-1 text-xs">{line}</div>;
               if (line.includes(':')) {
                 const [speaker, ...rest] = line.split(':');
                 return (
                   <div key={i} className="my-2 pl-4">
                     <span className="text-cyan-200 font-bold uppercase">{speaker}:</span>
                     <span className="text-slate-300">{rest.join(':')}</span>
                   </div>
                 );
               }
               return <p key={i} className="min-h-[1rem]">{line}</p>;
             })}
          </div>
       </div>
    </div>
  );
};

const CpuIcon = (props: any) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="16" height="16" x="4" y="4" rx="2"/><rect width="6" height="6" x="9" y="9" rx="1"/><path d="M15 2v2"/><path d="M15 20v2"/><path d="M2 15h2"/><path d="M2 9h2"/><path d="M20 15h2"/><path d="M20 9h2"/><path d="M9 2v2"/><path d="M9 20v2"/></svg>
)

export default RightPanel;