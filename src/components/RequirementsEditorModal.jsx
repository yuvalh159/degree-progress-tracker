import React from 'react';
import { CATEGORY_COLORS } from '../constants';

export default function RequirementsEditorModal({
    showReqEditor,
    onClose,
    categories,
    requirements,
    setRequirements,
    newCategoryName,
    setNewCategoryName,
    newCategoryValue,
    setNewCategoryValue,
    addCustomCategory
}) {
    if (!showReqEditor) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
            <div className="google-card bg-white p-4 w-full max-w-md">
                <div className="flex items-center justify-between mb-3 border-b border-gray-100 pb-2">
                    <h2 className="text-xl font-medium text-gray-800">עריכת דרישות נק"ז</h2>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <div className="space-y-2 mb-4 max-h-[60vh] overflow-y-auto">
                    {categories.map(cat => {
                        const colors = CATEGORY_COLORS[cat] || { bg: "bg-gray-100", text: "text-gray-700" };
                        return (
                            <div key={cat} className={`flex justify-between items-center p-2 rounded-md ${colors.bg}`}>
                                <span className={`text-sm font-medium ${colors.text}`}>{cat}</span>
                                <input
                                    type="number"
                                    min="0"
                                    step="0.5"
                                    value={requirements[cat]}
                                    onChange={e => {
                                        const v = Number(e.target.value);
                                        setRequirements(prev => ({ ...prev, [cat]: isNaN(v) ? 0 : v }));
                                    }}
                                    className="google-input text-sm w-24 text-center py-1"
                                />
                            </div>
                        );
                    })}

                    <div className="mt-4 p-2 bg-indigo-50 rounded-md">
                        <div className="flex justify-between items-center mb-2">
                            <span className="text-sm font-medium text-indigo-700">הוספת קטגוריה חדשה</span>
                        </div>
                        <div className="grid grid-cols-5 gap-2">
                            <input
                                type="text"
                                placeholder="שם קטגוריה"
                                value={newCategoryName}
                                onChange={e => setNewCategoryName(e.target.value)}
                                className="google-input text-sm col-span-3"
                            />
                            <input
                                type="number"
                                min="0"
                                step="0.5"
                                placeholder="נק״ז"
                                value={newCategoryValue}
                                onChange={e => setNewCategoryValue(Number(e.target.value))}
                                className="google-input text-sm text-center col-span-1"
                            />
                            <button
                                onClick={addCustomCategory}
                                className="google-btn-primary text-sm py-1 px-2 col-span-1"
                                disabled={!newCategoryName.trim()}
                            >
                                הוסף
                            </button>
                        </div>
                    </div>
                </div>

                <div className="flex justify-end gap-2 pt-3 border-t border-gray-100">
                    <button onClick={onClose} className="google-btn-secondary text-sm py-1.5 px-4">סגור</button>
                    <button onClick={onClose} className="google-btn-primary text-sm py-1.5 px-4">שמור</button>
                </div>
            </div>
        </div>
    );
} 