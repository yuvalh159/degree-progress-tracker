import React from 'react';

export default function AddSemesterForm({ newSem, setNewSem, addSemester, SEMESTER_OPTIONS }) {
    return (
        <div className="google-card p-3 flex flex-col items-center add-semester-form">
            <div className="flex gap-2 w-full">
                <select
                    value={newSem}
                    onChange={e => setNewSem(e.target.value)}
                    className="google-input text-xs py-1 flex-1"
                >
                    <option value="">בחר סמסטר</option>
                    {SEMESTER_OPTIONS.map(option => (
                        <option key={option} value={option}>{option}</option>
                    ))}
                </select>
                <button
                    onClick={addSemester}
                    className="google-btn-primary text-xs"
                    disabled={!newSem}
                >
                    הוסף
                </button>
            </div>
        </div>
    );
} 