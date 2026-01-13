// ... (Same imports)
import React, { useState, useEffect, useRef } from 'react';
import { X, Save, Bot, Key, Globe, Sparkles, PauseCircle, RefreshCw, Layers, Upload, Zap, List, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { AIConfig, LinkItem, SiteSettings } from '../types';
import { generateLinkDescription, testAIConnection, fetchAvailableModels } from '../services/geminiService';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: AIConfig;
  siteSettings: SiteSettings;
  onSave: (config: AIConfig, siteSettings: SiteSettings) => void;
  links: LinkItem[];
  onUpdateLinks: (links: LinkItem[]) => void;
}

const getRandomColor = () => {
  const h = Math.floor(Math.random() * 360);
  const s = 70 + Math.random() * 20;
  const l = 45 + Math.random() * 15;
  return `hsl(${h}, ${s}%, ${l}%)`;
};

const generateSvgIcon = (text: string, color1: string, color2: string) => {
  let char = '';
  // Use first character of title, default to 'Y' if empty
  if (text && text.length > 0) {
    char = text.substring(0, 1).toUpperCase();
  } else {
    char = 'Y';
  }

  const gradientId = 'g_' + Math.random().toString(36).substr(2, 9);

  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
        <defs>
            <linearGradient id="${gradientId}" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stop-color="${color1}"/>
                <stop offset="100%" stop-color="${color2}"/>
            </linearGradient>
        </defs>
        <rect width="100%" height="100%" fill="url(#${gradientId})" rx="16"/>
        <text x="50%" y="54%" dy=".1em" fill="white" font-family="Arial, sans-serif" font-weight="bold" font-size="36" text-anchor="middle">${char}</text>
    </svg>`.trim();

  try {
    const encoded = window.btoa(unescape(encodeURIComponent(svg)));
    return `data:image/svg+xml;base64,${encoded}`;
  } catch (e) {
    console.error("SVG Icon Generation Failed", e);
    return '';
  }
};

const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen, onClose, config, siteSettings, onSave, links, onUpdateLinks
}) => {
  const [activeTab, setActiveTab] = useState<'site' | 'ai'>('site');
  const [localConfig, setLocalConfig] = useState<AIConfig>(config);

  const [localSiteSettings, setLocalSiteSettings] = useState<SiteSettings>(() => ({
    title: siteSettings?.title || 'CloudNav - 我的导航',
    favicon: siteSettings?.favicon || '',
    cardStyle: siteSettings?.cardStyle || 'detailed'
  }));

  const [generatedIcons, setGeneratedIcons] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState({ current: 0, total: 0 });
  const shouldStopRef = useRef(false);

  // AI Test & Models State
  const [testingConnection, setTestingConnection] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [fetchingModels, setFetchingModels] = useState(false);
  const [availableModels, setAvailableModels] = useState<string[]>([]);
  const [showModelList, setShowModelList] = useState(false);

  const handleTestConnection = async () => {
    setTestingConnection(true);
    setConnectionStatus('idle');
    try {
      const result = await testAIConnection(localConfig);
      setConnectionStatus(result ? 'success' : 'error');
      if (result) {
        setTimeout(() => setConnectionStatus('idle'), 3000);
      }
    } catch (e) {
      setConnectionStatus('error');
    } finally {
      setTestingConnection(false);
    }
  };

  const handleFetchModels = async () => {
    setFetchingModels(true);
    setShowModelList(false);
    try {
      const models = await fetchAvailableModels(localConfig);
      if (models.length > 0) {
        setAvailableModels(models);
        setShowModelList(true);
      } else {
        alert("未找到可用模型，请检查配置或手动输入。");
      }
    } catch (e) {
      alert("获取模型列表失败");
    } finally {
      setFetchingModels(false);
    }
  };

  const updateGeneratedIcons = (text: string) => {
    const newIcons: string[] = [];
    for (let i = 0; i < 6; i++) {
      const c1 = getRandomColor();
      const h2 = (parseInt(c1.split(',')[0].split('(')[1]) + 30 + Math.random() * 30) % 360;
      const c2 = `hsl(${h2}, 70%, 50%)`;
      newIcons.push(generateSvgIcon(text, c1, c2));
    }
    setGeneratedIcons(newIcons);
  };

  useEffect(() => {
    if (isOpen) {
      setLocalConfig(config);
      const safeSettings = {
        title: siteSettings?.title || 'CloudNav - 我的导航',
        favicon: siteSettings?.favicon || '',
        cardStyle: siteSettings?.cardStyle || 'detailed'
      };
      setLocalSiteSettings(safeSettings);
      if (generatedIcons.length === 0) {
        updateGeneratedIcons(safeSettings.title);
      }

      setIsProcessing(false);
      setProgress({ current: 0, total: 0 });
      shouldStopRef.current = false;
    }
  }, [isOpen, config, siteSettings]);

  const handleChange = (key: keyof AIConfig, value: string) => {
    setLocalConfig(prev => ({ ...prev, [key]: value }));
  };

  const handleSiteChange = async (key: keyof SiteSettings, value: any) => {
    setLocalSiteSettings(prev => ({ ...prev, [key]: value }));
  };

  const handleSave = () => {
    onSave(localConfig, localSiteSettings);
    onClose();
  };

  const handleBulkGenerate = async () => {
    if (!localConfig.apiKey) {
      alert("请先配置并保存 API Key");
      return;
    }

    const missingLinks = links.filter(l => !l.description);
    if (missingLinks.length === 0) {
      alert("所有链接都已有描述！");
      return;
    }

    if (!confirm(`发现 ${missingLinks.length} 个链接缺少描述，确定要使用 AI 自动生成吗？这可能需要一些时间。`)) return;

    setIsProcessing(true);
    shouldStopRef.current = false;
    setProgress({ current: 0, total: missingLinks.length });

    let currentLinks = [...links];

    for (let i = 0; i < missingLinks.length; i++) {
      if (shouldStopRef.current) break;

      const link = missingLinks[i];
      try {
        const desc = await generateLinkDescription(link.title, link.url, localConfig);
        currentLinks = currentLinks.map(l => l.id === link.id ? { ...l, description: desc } : l);
        onUpdateLinks(currentLinks);
        setProgress({ current: i + 1, total: missingLinks.length });
      } catch (e) {
        console.error(`Failed to generate for ${link.title}`, e);
      }
    }

    setIsProcessing(false);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate size (2MB)
    if (file.size > 2 * 1024 * 1024) {
      alert('图标文件大小不能超过 2MB');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64String = event.target?.result as string;
      handleSiteChange('favicon', base64String);
    };
    reader.readAsDataURL(file);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm transition-opacity duration-300">
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden border border-slate-100 dark:border-slate-800 transition-transform duration-300 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex justify-between items-center px-6 py-5 border-b border-slate-100 dark:border-slate-800/50 shrink-0">
          <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100 tracking-tight">
            设置
          </h3>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
          >
            <X size={20} strokeWidth={2} />
          </button>
        </div>

        {/* Tabs - Centered Segmented Control */}
        <div className="px-6 pt-6 shrink-0">
          <div className="flex p-1 bg-slate-100 dark:bg-slate-800 rounded-xl">
            <button
              onClick={() => setActiveTab('site')}
              className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${activeTab === 'site'
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                }`}
            >
              <Globe size={16} />
              <span>网站设置</span>
            </button>
            <button
              onClick={() => setActiveTab('ai')}
              className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${activeTab === 'ai'
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                }`}
            >
              <Bot size={16} />
              <span>AI 助手</span>
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-6">
          {activeTab === 'site' && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-slate-700 dark:text-slate-200 mb-2">网页标题</label>
                  <input
                    type="text"
                    value={localSiteSettings.title}
                    onChange={(e) => {
                      handleSiteChange('title', e.target.value);
                      // Optionally update generated icons when title changes, maybe with debounce? 
                      // Or just let user click refresh. Let's let user click refresh to avoid flickers.
                    }}
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder:text-slate-400 focus:bg-white dark:focus:bg-slate-800 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 dark:text-slate-200 mb-2">网站图标</label>
                  <div className="flex gap-3">
                    <div className="w-14 h-14 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center overflow-hidden shrink-0 shadow-sm p-2 group relative">
                      {localSiteSettings.favicon ? (
                        <img src={localSiteSettings.favicon} className="w-full h-full object-contain" alt="Favicon" />
                      ) : (
                        <Globe size={24} className="text-slate-300" />
                      )}
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                      >
                        <Upload size={16} className="text-white" />
                      </button>
                    </div>
                    <div className="flex-1 space-y-2">
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={localSiteSettings.favicon}
                          onChange={(e) => handleSiteChange('favicon', e.target.value)}
                          placeholder="https://example.com/favicon.ico"
                          className="flex-1 px-4 py-2 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:bg-white dark:focus:bg-slate-800 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-mono"
                        />
                        <button
                          onClick={() => fileInputRef.current?.click()}
                          className="px-3 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-lg text-slate-600 dark:text-slate-300 text-xs font-medium transition-colors border border-slate-200 dark:border-slate-700"
                        >
                          上传
                        </button>
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept=".png,.jpg,.jpeg,.svg,.ico,image/*"
                          onChange={handleFileUpload}
                          className="hidden"
                        />
                      </div>

                      <div className="bg-slate-50 dark:bg-slate-800/30 rounded-lg p-2 border border-slate-100 dark:border-slate-800">
                        <div className="flex items-center justify-between mb-2 px-1">
                          <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">随机生成图标</span>
                          <button
                            type="button"
                            onClick={() => updateGeneratedIcons(localSiteSettings.title)}
                            className="flex items-center gap-1 text-blue-600 hover:text-blue-700 text-[10px] font-medium bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/20 dark:hover:bg-blue-900/30 px-1.5 py-0.5 rounded transition-colors"
                          >
                            <RefreshCw size={10} /> 换一批
                          </button>
                        </div>
                        <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
                          {generatedIcons.map((icon, idx) => (
                            <button
                              key={idx}
                              onClick={() => handleSiteChange('favicon', icon)}
                              className="shrink-0 w-8 h-8 rounded-lg border border-slate-200 dark:border-slate-700 overflow-hidden hover:ring-2 hover:ring-blue-500 hover:scale-105 transition-all bg-white dark:bg-slate-800"
                            >
                              <img src={icon} className="w-full h-full object-cover" alt="Generated" />
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'ai' && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <div className="bg-blue-50 dark:bg-blue-900/10 p-4 rounded-xl border border-blue-100 dark:border-blue-800/20 flex flex-col gap-3">
                <div className="flex gap-3">
                  <div className="shrink-0 text-blue-600 dark:text-blue-400 mt-0.5">
                    <Sparkles size={18} />
                  </div>
                  <div className="text-sm text-blue-800 dark:text-blue-200 leading-relaxed">
                    <p>配置 AI 助手后，可以自动为您的链接生成智能描述和分类建议。Key 仅存储在本地浏览器缓存中，不会发送到我们的服务器。</p>
                  </div>
                </div>
                <div className="flex justify-end mt-1">
                  <button
                    onClick={handleTestConnection}
                    className={`text-xs flex items-center gap-1.5 px-2 py-1.5 rounded-md transition-colors ${connectionStatus === 'success' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                        connectionStatus === 'error' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
                          'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-slate-700'
                      }`}
                    title="测试连接"
                  >
                    {testingConnection ? <Loader2 size={12} className="animate-spin" /> :
                      connectionStatus === 'success' ? <CheckCircle size={12} /> :
                        connectionStatus === 'error' ? <AlertCircle size={12} /> :
                          <Zap size={12} />}
                    {testingConnection ? '测试中...' :
                      connectionStatus === 'success' ? '连接成功' :
                        connectionStatus === 'error' ? '连接失败' :
                          '测试连接'}
                  </button>
                </div>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">AI 提供商</label>
                    <div className="relative">
                      <select
                        value={localConfig.provider}
                        onChange={(e) => handleChange('provider', e.target.value)}
                        className="w-full appearance-none px-4 py-2.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                      >
                        <option value="gemini">Google Gemini</option>
                        <option value="openai">OpenAI Compatible</option>
                      </select>
                      <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                        <Layers size={14} />
                      </div>
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">模型名称</label>
                    <div className="relative">
                      <input
                        type="text"
                        value={localConfig.model}
                        onChange={(e) => handleChange('model', e.target.value)}
                        placeholder={localConfig.provider === 'gemini' ? "gemini-2.5-flash" : "gpt-3.5-turbo"}
                        className="w-full pl-4 pr-10 py-2.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                      />
                      <button
                        onClick={handleFetchModels}
                        className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-slate-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-md transition-colors"
                        title="自动获取模型列表"
                      >
                        {fetchingModels ? <Loader2 size={14} className="animate-spin" /> : <List size={14} />}
                      </button>

                      {showModelList && availableModels.length > 0 && (
                        <div className="absolute z-10 top-full left-0 right-0 mt-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl max-h-48 overflow-y-auto">
                          {availableModels.map(model => (
                            <button
                              key={model}
                              onClick={() => {
                                handleChange('model', model);
                                setShowModelList(false);
                              }}
                              className="w-full text-left px-4 py-2 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                            >
                              {model}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">API Key</label>
                  <div className="relative">
                    <Key size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="password"
                      value={localConfig.apiKey}
                      onChange={(e) => handleChange('apiKey', e.target.value)}
                      placeholder="sk-..."
                      className="w-full pl-9 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-mono text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                    />
                  </div>
                </div>

                {localConfig.provider === 'openai' && (
                  <div className="animate-in fade-in slide-in-from-top-1 duration-200">
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Base URL (可选)</label>
                    <input
                      type="text"
                      value={localConfig.baseUrl}
                      onChange={(e) => handleChange('baseUrl', e.target.value)}
                      placeholder="https://api.openai.com/v1"
                      className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-mono text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                    />
                  </div>
                )}
              </div>

              <div className="pt-6 border-t border-slate-100 dark:border-slate-700/50">
                <h4 className="text-sm font-bold text-slate-800 dark:text-white mb-3">批量操作</h4>
                {isProcessing ? (
                  <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-200 dark:border-slate-700">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-xs font-medium text-slate-600 dark:text-slate-300">正在生成描述... {progress.current}/{progress.total}</span>
                      <button
                        onClick={() => {
                          shouldStopRef.current = true;
                          setIsProcessing(false);
                        }}
                        className="text-red-500 hover:text-red-600 flex items-center gap-1 text-xs font-medium px-2 py-1 hover:bg-red-50 rounded transition-colors"
                      >
                        <PauseCircle size={12} /> 停止
                      </button>
                    </div>
                    <div className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-blue-500 transition-all duration-300 ease-out"
                        style={{ width: `${(progress.current / progress.total) * 100}%` }}
                      />
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={handleBulkGenerate}
                    className="w-full group flex items-center justify-center gap-2 p-3 rounded-xl border border-dashed border-slate-300 dark:border-slate-600 hover:border-purple-400 dark:hover:border-purple-500 hover:bg-purple-50 dark:hover:bg-purple-900/10 transition-all text-slate-600 dark:text-slate-400 hover:text-purple-600 dark:hover:text-purple-400"
                  >
                    <Sparkles size={16} className="group-hover:scale-110 transition-transform" />
                    <span className="text-sm font-medium">自动补全所有缺失的链接描述</span>
                  </button>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 pt-2 border-t border-transparent">
          <button
            onClick={handleSave}
            className="w-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold py-3.5 px-4 rounded-xl hover:bg-slate-800 dark:hover:bg-slate-100 transition-all shadow-lg shadow-slate-200 dark:shadow-none active:scale-[0.99] text-sm flex items-center justify-center gap-2"
          >
            <Save size={16} />
            <span>保存设置</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;
