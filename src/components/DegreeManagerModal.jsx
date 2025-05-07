import React, { useState } from 'react';

export default function DegreeManagerModal({
    showModal,
    onClose,
    degreeProfiles,
    addProfileFn,
    removeProfileFn,
    // currentProfileName, // Could be used to prevent deleting/editing active, or highlight it
    // updateProfileRequirementsFn // For more advanced editing within this modal
}) {
    const [newProfileName, setNewProfileName] = useState("");

    if (!showModal) return null;

    const handleAddProfile = () => {
        if (newProfileName.trim()) {
            addProfileFn(newProfileName.trim());
            setNewProfileName(""); // Clear input after adding
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
            <div className="google-card bg-white p-4 w-full max-w-lg">
                <div className="flex items-center justify-between mb-3 border-b border-gray-100 pb-2">
                    <h2 className="text-xl font-medium text-gray-800">ניהול מסלולי תואר</h2>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <div className="space-y-3 mb-4 max-h-[60vh] overflow-y-auto p-1">
                    <h3 className="text-md font-medium text-gray-700 mb-2">מסלולים קיימים:</h3>
                    {Object.keys(degreeProfiles).map(profileName => (
                        <div key={profileName} className="flex justify-between items-center p-2 bg-gray-50 rounded-md hover:bg-gray-100">
                            <span className="text-sm text-gray-800">{profileName}</span>
                            <button
                                onClick={() => {
                                    if (window.confirm(`האם אתה בטוח שברצונך למחוק את המסלול "${profileName}"?`)) {
                                        removeProfileFn(profileName);
                                    }
                                }}
                                className="text-red-500 hover:text-red-700 text-xs font-medium p-1"
                                disabled={Object.keys(degreeProfiles).length <= 1} // Prevent deleting the last one
                            >
                                מחק
                            </button>
                        </div>
                    ))}
                    {Object.keys(degreeProfiles).length === 0 && (
                        <p className="text-sm text-gray-500 text-center py-2">אין מסלולים מוגדרים.</p>
                    )}
                </div>

                <div className="mt-4 pt-3 border-t border-gray-100">
                    <h3 className="text-md font-medium text-gray-700 mb-2">הוספת מסלול חדש:</h3>
                    <div className="flex items-center gap-2">
                        <input
                            type="text"
                            placeholder="שם המסלול החדש"
                            value={newProfileName}
                            onChange={e => setNewProfileName(e.target.value)}
                            className="google-input text-sm flex-grow"
                        />
                        <button
                            onClick={handleAddProfile}
                            className="google-btn-primary text-sm py-2 px-3"
                            disabled={!newProfileName.trim()}
                        >
                            הוסף מסלול
                        </button>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                        המסלול החדש ייווצר עם דרישות זהות למסלול הפעיל כעת. תוכל לערוך אותן לאחר מכן דרך כפתור "דרישות".
                    </p>
                </div>

                <div className="flex justify-end gap-2 pt-4 mt-2 border-t border-gray-100">
                    <button onClick={onClose} className="google-btn-secondary text-sm py-1.5 px-4">סגור</button>
                </div>
            </div>
        </div>
    );
} 