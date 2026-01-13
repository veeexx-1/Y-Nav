import React from 'react';
import { Database, Upload, Download } from 'lucide-react';

interface DataTabProps {
    onOpenImport: () => void;
    onOpenBackup: () => void;
    onClose: () => void;
}

const DataTab: React.FC<DataTabProps> = ({ onOpenImport, onOpenBackup, onClose }) => {
    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div>
                <h4 className="text-sm font-bold text-slate-700 dark:text-slate-200 mb-4 flex items-center gap-2">
                    <Database size={16} className="text-slate-500" />
                    数据管理 (Data Management)
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <button
                        onClick={() => {
                            onOpenImport();
                            onClose();
                        }}
                        className="flex flex-col items-center justify-center gap-3 p-6 rounded-xl border border-dashed border-slate-300 dark:border-slate-600 hover:border-accent hover:bg-accent/5 dark:hover:bg-accent/10 transition-all group"
                    >
                        <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 dark:text-slate-400 group-hover:text-accent group-hover:bg-white dark:group-hover:bg-slate-700 transition-colors shadow-sm">
                            <Upload size={24} />
                        </div>
                        <div className="text-center">
                            <div className="font-bold text-slate-700 dark:text-slate-200 group-hover:text-accent">导入数据</div>
                            <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">支持 Chrome HTML 书签导入</div>
                        </div>
                    </button>

                    <button
                        onClick={() => {
                            onOpenBackup();
                            onClose();
                        }}
                        className="flex flex-col items-center justify-center gap-3 p-6 rounded-xl border border-dashed border-slate-300 dark:border-slate-600 hover:border-accent hover:bg-accent/5 dark:hover:bg-accent/10 transition-all group"
                    >
                        <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 dark:text-slate-400 group-hover:text-accent group-hover:bg-white dark:group-hover:bg-slate-700 transition-colors shadow-sm">
                            <Download size={24} />
                        </div>
                        <div className="text-center">
                            <div className="font-bold text-slate-700 dark:text-slate-200 group-hover:text-accent">备份 / 恢复</div>
                            <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">导出 JSON 备份或管理 WebDAV</div>
                        </div>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default DataTab;
