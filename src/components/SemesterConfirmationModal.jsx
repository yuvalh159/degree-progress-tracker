import React from 'react';

export default function SemesterConfirmationModal({ semesterToDelete, onConfirm, onCancel }) {
    if (!semesterToDelete) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
            <div className="google-card bg-white p-6 w-full max-w-md">
                <h2 className="google-header text-center">אישור מחיקה</h2>
                <p className="google-subheader text-center">
                    האם אתה בטוח שברצונך למחוק את הסמסטר "{semesterToDelete}"?
                </p>
                <div className="flex justify-center gap-3 mt-6">
                    <button onClick={onCancel} className="google-btn-secondary">ביטול</button>
                    <button onClick={onConfirm} className="bg-red-500 hover:bg-red-600 text-white font-medium rounded-md px-4 py-2 transition duration-200">מחק</button>
                </div>
            </div>
        </div>
    );
} 