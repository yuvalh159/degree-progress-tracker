import React from 'react';
import { CATEGORY_COLORS } from "../constants"; // Assuming constants.js is one level up

// ---------- small component to render stats ----------
export default function Stat({ label, value, required }) {
    // Calculate the remaining percentage (not completed)
    const percentComplete = required ? Math.min(100, Math.max(0, 100 * (1 - value / required))) : 0;
    const colors = CATEGORY_COLORS[label] || { bg: "bg-gray-100", text: "text-gray-800", border: "border-gray-200", bar: "bg-orange-500" };

    // Extract the color code from the Tailwind class for the progress bar
    const barColorClass = colors.bar.replace('bg-', '');

    return (
        <div className={`google-card p-2 ${colors.bg} border border-gray-100 rounded-md shadow-sm`}>
            <div className="flex justify-between items-center">
                <span className={`text-xs font-medium ${colors.text}`}>{label}</span>
                <span className={`text-sm font-bold ${colors.text}`}>{value.toFixed(1)}</span>
            </div>

            {/* Progress bar */}
            <div className="w-full h-1.5 bg-white/50 rounded-full overflow-hidden my-1.5">
                <div
                    className={`h-full ${colors.bar}`}
                    style={{ width: `${percentComplete}%` }}
                />
            </div>

            {/* Required amount */}
            <div className="flex justify-end">
                <span className={`text-xs ${colors.text} opacity-60`}>{required.toFixed(1)}</span>
            </div>
        </div>
    );
} 