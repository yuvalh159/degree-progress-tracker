import React from 'react';
import { CATEGORY_COLORS } from "../constants"; // Assuming constants.js is one level up

// ---------- small component to render stats ----------
export default function Stat({ label, value, required }) {
    // Calculate the remaining percentage (not completed)
    const percentComplete = required ? Math.min(100, Math.max(0, 100 * (1 - value / required))) : 0;
    const defaultColors = CATEGORY_COLORS["default"] || { bg: "bg-gray-50", text: "text-gray-700", bar: "bg-gray-400" };
    const colors = CATEGORY_COLORS[label] || defaultColors;

    // Extract the color code from the Tailwind class for the progress bar
    const barColorClass = colors.bar.replace('bg-', '');

    return (
        <div className={`google-card p-3 border border-gray-100 rounded-md shadow-sm ${colors.gradient}`}>
            <div className="flex justify-between items-center">
                <span className={`text-sm font-medium ${colors.text}`}>{label}</span>
                <span className={`text-sm font-bold ${colors.text}`}>{value.toFixed(1)}</span>
            </div>

            {/* Progress bar */}
            <div className={`w-full h-2 bg-white/50 rounded-full overflow-hidden my-2`}>
                <div
                    className={`h-full ${colors.bar}`}
                    style={{ width: `${percentComplete}%` }}
                />
            </div>

            {/* Required amount */}
            <div className="flex justify-end">
                <span className={`text-sm ${colors.text} opacity-60`}>{required.toFixed(1)}</span>
            </div>
        </div>
    );
} 