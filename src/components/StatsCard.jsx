import React from 'react';
import { ChartPieIcon } from '@heroicons/react/24/outline';
import { CATEGORY_COLORS, ELECTIVE_CATEGORIES } from '../constants';

// ... existing code ...

{
    sortedCategories.map(([category, points]) => {
        if (points === 0) return null; // Don't display categories with 0 points
        const colors = CATEGORY_COLORS[category] || CATEGORY_COLORS.default;
        const isElective = ELECTIVE_CATEGORIES.includes(category);
        const indentClass = isElective ? 'ml-6' : 'ml-2'; // Indent elective categories further

        return (
            <div key={category} className={`text-sm flex justify-between items-center p-2 rounded-md mb-1 ${colors.gradient} ${indentClass}`}>
                <span className={`font-medium ${colors.text}`}>{category}:</span>
                <span className={`${colors.text} font-semibold`}>{points.toFixed(1)} נק'</span>
            </div>
        );
    })
}
            </div >
// ... existing code ...

export default StatsCard; 