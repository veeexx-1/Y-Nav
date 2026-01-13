import React from 'react';
import { Settings, ChevronLeft } from 'lucide-react';
import { Category } from '../../types';
import Icon from '../ui/Icon';

interface SidebarProps {
  sidebarOpen: boolean;
  sidebarWidthClass: string;
  isSidebarCollapsed: boolean;
  navTitleText: string;
  navTitleShort: string;
  selectedCategory: string;
  categories: Category[];
  linkCounts: Record<string, number>;
  repoUrl: string;
  onSelectAll: () => void;
  onSelectCategory: (category: Category) => void;
  onToggleCollapsed: () => void;
  onOpenCategoryManager: () => void;
  onOpenSettings: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({
  sidebarOpen,
  sidebarWidthClass,
  isSidebarCollapsed,
  navTitleText,
  navTitleShort,
  selectedCategory,
  categories,
  linkCounts,
  repoUrl,
  onSelectAll,
  onSelectCategory,
  onToggleCollapsed,
  onOpenCategoryManager,
  onOpenSettings
}) => {
  // 状态机：'typing' | 'pausing' | 'deleting'
  const [phase, setPhase] = React.useState<'typing' | 'pausing' | 'deleting'>('typing');
  const [targetText, setTargetText] = React.useState('Nav'); // 当前要显示的目标文本
  const [displayText, setDisplayText] = React.useState(''); // 实际显示的文本

  // 核心打字机逻辑
  React.useEffect(() => {
    let timeout: NodeJS.Timeout;

    const typeSpeed = 150;
    const deleteSpeed = 100;
    const navPause = 5000; // Nav 停留较久
    const timePauseMin = 3000;
    const timePauseMax = 6000; // 时间停留 3-6秒

    const getCurrentTime = () => {
      const now = new Date();
      return `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    };

    const getCurrentDate = () => {
      const now = new Date();
      return `${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    };

    if (phase === 'typing') {
      if (displayText !== targetText) {
        // 继续打字
        timeout = setTimeout(() => {
          setDisplayText(targetText.slice(0, displayText.length + 1));
        }, typeSpeed);
      } else {
        // 打字完成，进入停留
        setPhase('pausing');
      }
    } else if (phase === 'pausing') {
      // 决定停留多久
      let delay = navPause;
      if (targetText !== 'Nav') {
        // 如果是时间，停留 3-6 秒
        delay = Math.floor(Math.random() * (timePauseMax - timePauseMin + 1)) + timePauseMin;
      }

      timeout = setTimeout(() => {
        setPhase('deleting');
      }, delay);
    } else if (phase === 'deleting') {
      if (displayText.length > 0) {
        // 继续删除
        timeout = setTimeout(() => {
          setDisplayText(prev => prev.slice(0, -1));
        }, deleteSpeed);
      } else {
        // 删除完毕，决定下一个文本
        let nextText = 'Nav';

        if (targetText === 'Nav') {
          // 当前是 Nav，准备切换到其他信息
          // 20% 概率显示日期，80% 显示时间
          const showDate = Math.random() < 0.2;
          nextText = showDate ? getCurrentDate() : getCurrentTime();
        } else {
          // 当前是时间或日期，切回 Nav
          nextText = 'Nav';
        }

        setTargetText(nextText);
        setPhase('typing');
      }
    }

    return () => clearTimeout(timeout);
  }, [displayText, phase, targetText]);

  return (
    <aside
      className={`
        fixed lg:static inset-y-0 left-0 z-30 ${sidebarWidthClass} transform transition-all duration-300 ease-in-out
        bg-white/40 dark:bg-slate-950/40 border-r border-slate-200/30 dark:border-white/5 backdrop-blur-2xl flex flex-col
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}
    >
      {/* Header */}
      <div className={`h-14 flex items-center justify-center border-b border-slate-100/60 dark:border-white/5 shrink-0 relative ${isSidebarCollapsed ? 'px-2' : 'px-4'}`}>
        <div className={`flex items-center ${isSidebarCollapsed ? 'w-full justify-center' : 'gap-2'}`}>
          {isSidebarCollapsed ? (
            <button
              onClick={onToggleCollapsed}
              className="h-9 w-9 rounded-xl bg-white/50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-white/10 flex items-center justify-center transition-all cursor-pointer shadow-sm hover:shadow-lg hover:shadow-accent/20 hover:border-accent/30 hover:bg-white dark:hover:bg-slate-800 hover:scale-105 active:scale-95 group"
              title="展开侧边栏"
            >
              <span className="font-mono font-black text-xl text-slate-700 dark:text-slate-200 group-hover:text-accent transition-colors duration-300">Y</span>
            </button>
          ) : (
            <div className="relative flex items-center justify-center font-mono font-bold text-lg cursor-pointer select-none group" title={navTitleText}>
              {/* Ghost element for layout sizing (holds the widest possible width) */}
              <div className="flex items-center opacity-0 pointer-events-none" aria-hidden="true">
                <span className="mr-1.5">~/</span>
                <span className="tracking-tight">Y-</span>
                <span className="tracking-tight">00:00</span>
                <span className="w-2.5 ml-1"></span>
              </div>

              {/* Visible animated content */}
              <div className="absolute left-0 top-1/2 -translate-y-1/2 flex items-center">
                <span className="text-accent mr-1.5">~/</span>
                <span className="text-slate-700 dark:text-slate-200 tracking-tight">Y-</span>
                <span className="text-slate-700 dark:text-slate-200 tracking-tight">{displayText}</span>
                <span className="w-2.5 h-5 bg-accent ml-1 animate-pulse rounded-[2px] opacity-80 shadow-[0_0_8px_rgb(var(--accent-color)/0.6)]"></span>
              </div>
            </div>
          )}
        </div>

        {!isSidebarCollapsed && (
          <button
            onClick={onToggleCollapsed}
            className="hidden lg:inline-flex absolute right-2 p-1.5 text-slate-400 hover:text-accent hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent/50 transition-colors"
            title="收起侧边栏"
            aria-label="收起侧边栏"
          >
            <ChevronLeft size={16} />
          </button>
        )}
      </div>

      {/* Categories - 减少顶部间距 */}
      <div className={`flex-1 overflow-y-auto scrollbar-hide ${isSidebarCollapsed ? 'px-2 pt-2 pb-4' : 'px-3 pt-2 pb-4'}`}>
        {/* All / Pinned */}
        <button
          onClick={onSelectAll}
          title="置顶网站"
          className={`relative w-full rounded-xl transition-all duration-200 mb-1 group ${isSidebarCollapsed ? 'flex items-center justify-center p-2.5' : 'flex items-center gap-3 px-3 py-2.5'} ${selectedCategory === 'all'
            ? 'bg-gradient-to-r from-accent/20 via-accent/5 to-transparent text-accent shadow-sm border border-accent/10'
            : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-slate-200 border border-transparent'
            }`}
        >
          {!isSidebarCollapsed && selectedCategory === 'all' && (
            <span className="absolute left-0.5 top-1/2 -translate-y-1/2 h-6 w-1 rounded-full bg-accent shadow-[0_0_8px_rgb(var(--accent-color)/0.4)]"></span>
          )}
          <div className={`flex items-center justify-center transition-colors ${isSidebarCollapsed ? 'p-2 rounded-lg' : 'p-1'} ${selectedCategory === 'all' ? 'text-accent' : 'text-slate-500 dark:text-slate-400'}`}>
            <Icon name="Pin" size={18} />
          </div>
          {!isSidebarCollapsed && (
            <>
              <span className="font-medium flex-1 text-left">置顶网站</span>
              {linkCounts['pinned'] > 0 && (
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${selectedCategory === 'all' ? 'bg-accent/20 text-accent' : 'bg-slate-50 dark:bg-slate-800/50 text-slate-400 border border-slate-200/50 dark:border-slate-700/50'}`}>
                  {linkCounts['pinned']}
                </span>
              )}
            </>
          )}
        </button>

        {/* Category Header */}
        <div className={`flex items-center mt-4 mb-2 ${isSidebarCollapsed ? 'justify-center px-2' : 'justify-between px-3'}`}>
          {!isSidebarCollapsed && (
            <span className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
              分类目录
            </span>
          )}
          <button
            onClick={onOpenCategoryManager}
            className="p-1 text-slate-400 hover:text-accent hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md focus:outline-none focus:ring-2 focus:ring-accent/50 transition-colors"
            title="管理分类"
          >
            <Settings size={13} />
          </button>
        </div>

        {/* Category List */}
        <div className="space-y-0.5">
          {categories.map((cat) => {
            const isSelected = selectedCategory === cat.id;
            const count = linkCounts[cat.id] || 0;
            return (
              <button
                key={cat.id}
                onClick={() => onSelectCategory(cat)}
                title={isSidebarCollapsed ? cat.name : undefined}
                className={`relative w-full rounded-xl transition-all duration-200 group ${isSidebarCollapsed
                  ? 'flex items-center justify-center p-2.5'
                  : 'flex items-center gap-3 px-3 py-2'
                  } ${isSelected
                    ? 'bg-gradient-to-r from-accent/20 via-accent/5 to-transparent text-accent shadow-sm border border-accent/10'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-slate-200 border border-transparent'
                  }`}
              >
                {!isSidebarCollapsed && isSelected && (
                  <span className="absolute left-0.5 top-1/2 -translate-y-1/2 h-6 w-1 rounded-full bg-accent shadow-[0_0_8px_rgb(var(--accent-color)/0.4)]"></span>
                )}
                <div className={`flex items-center justify-center transition-colors ${isSidebarCollapsed ? 'p-2 rounded-lg' : 'p-1.5 rounded-md'
                  } ${isSelected
                    ? 'text-accent'
                    : 'text-slate-500 dark:text-slate-500'
                  }`}>
                  <Icon name={cat.icon} size={16} />
                </div>
                {!isSidebarCollapsed && (
                  <>
                    <span className={`truncate flex-1 text-left text-sm ${isSelected ? 'font-medium' : ''}`}>{cat.name}</span>
                    {count > 0 && (
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold transition-all ${isSelected ? 'bg-accent/20 text-accent' : 'bg-slate-50 dark:bg-slate-800/50 text-slate-400 border border-slate-200/50 dark:border-slate-700/50 group-hover:bg-slate-100 dark:group-hover:bg-slate-700 group-hover:border-transparent'}`}>
                        {count}
                      </span>
                    )}
                  </>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Footer Actions */}
      {!isSidebarCollapsed && (
        <div className="px-3 pb-6 shrink-0 flex justify-center">
          <div className="w-full">
            <div className="w-full h-px bg-slate-100 dark:bg-slate-800 mb-4"></div>

            <div className="flex justify-center">
              <div className="flex flex-col gap-2 w-fit">
                {/* Footer Links - Visible by default now */}
                <div className="flex items-center gap-3 justify-center mb-2 px-2 py-1 round-lg bg-slate-50/50 dark:bg-white/5 backdrop-blur-sm border border-slate-100 dark:border-white/5 rounded-full">
                  <a href={repoUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-[10px] text-slate-400 hover:text-accent font-medium transition-colors">
                    GitHub
                  </a>
                  <span className="text-[10px] text-slate-300 dark:text-slate-600">|</span>
                  <button onClick={onOpenSettings} className="flex items-center gap-1 text-[10px] text-slate-400 hover:text-accent font-medium transition-colors">
                    关于
                  </button>
                </div>

                <div className="flex items-center justify-between w-full">
                  <span className="text-sm font-bold text-slate-500 dark:text-slate-400 font-mono tracking-tight">
                    © 2026 Y-Nav
                  </span>
                  <span className="px-1.5 py-[2px] rounded-md bg-slate-100 dark:bg-slate-800 text-[11px] font-bold text-slate-400 dark:text-slate-500 border border-slate-200 dark:border-white/5 font-mono ml-4">
                    v1.2.0
                  </span>
                </div>

                <p className="text-[11px] font-medium text-slate-300 dark:text-slate-600 leading-none text-center">
                  Personal Navigation Dashboard
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
};

export default Sidebar;
