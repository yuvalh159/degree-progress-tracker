import React from 'react';
import Stat from './Stat'; // Assuming Stat.jsx is in the same directory

export default function SummaryStats({ gpa, summary, categories }) {
    return (
        <div className="mb-5">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
                {/* Grade Average card in consistent size */}
                <div className="google-card p-2.5 bg-indigo-50 border border-indigo-200 rounded-md shadow-sm">
                    <div className="flex justify-between items-center">
                        <span className="text-sm font-medium text-indigo-700">ממוצע ציונים</span>
                        <span className="text-sm font-bold text-indigo-700">{gpa.toFixed(1)}</span>
                    </div>

                    <div className="w-full h-1.5 bg-white rounded-full overflow-hidden my-1.5">
                        <div
                            className="h-full bg-indigo-500"
                            style={{ width: `${Math.min(gpa, 100)}%` }} // Assuming GPA is capped at 100 for display
                        />
                    </div>

                    <div className="flex justify-end">
                        <span className="text-xs text-indigo-500">100.0</span>
                    </div>
                </div>

                {/* All categories including בחירה categories with consistent size */}
                {categories.map(cat => (
                    <Stat
                        key={cat}
                        label={cat}
                        value={summary[cat] ? summary[cat].remaining : 0} // Added a check for summary[cat]
                        required={summary[cat] ? summary[cat].required : 0} // Added a check for summary[cat]
                    />
                ))}
            </div>
        </div>
    );
} 