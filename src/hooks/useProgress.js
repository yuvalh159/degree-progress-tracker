import { useMemo } from "react";

// ---------- hook to compute summary and GPA ----------
export default function useProgress(courses, requirements) {
    return useMemo(() => {
        const summary = {};
        Object.keys(requirements).forEach(cat => (summary[cat] = {
            required: requirements[cat],
            completed: 0,
            planned: 0,
            remaining: requirements[cat]
        }));

        let totalCred = 0, totalSum = 0;

        // Collect specific elective categories for later use
        const specificElectiveCategories = ['בחירה א', 'בחירה ב', 'בחירה ג', 'בחירה ד'];

        courses.forEach(c => {
            if (c.isEditing) return;

            const bucket = summary[c.category];
            if (bucket) {
                if (c.status === 'completed' || c.status === 'binary') {
                    bucket.completed += Number(c.credits);

                    // If this is a specific elective category, also deduct from בחירה כללי
                    if (specificElectiveCategories.includes(c.category) && summary['בחירה כללי']) {
                        summary['בחירה כללי'].completed += Number(c.credits);
                    }
                } else if (c.status === 'planned') {
                    bucket.planned += Number(c.credits);

                    // If this is a specific elective category, also update בחירה כללי
                    if (specificElectiveCategories.includes(c.category) && summary['בחירה כללי']) {
                        summary['בחירה כללי'].planned += Number(c.credits);
                    }
                }

                // Update remaining values
                bucket.remaining = bucket.required - bucket.completed;
            }

            // Only count towards GPA if status is not binary
            if (c.status !== 'binary' && c.grade != null && !isNaN(c.grade)) {
                totalCred += Number(c.credits);
                totalSum += Number(c.credits) * Number(c.grade);
            }
        });

        // Make sure remaining is updated for בחירה כללי after all courses have been processed
        if (summary['בחירה כללי']) {
            summary['בחירה כללי'].remaining = summary['בחירה כללי'].required - summary['בחירה כללי'].completed;
        }

        return { summary, gpa: totalCred ? totalSum / totalCred : 0 };
    }, [courses, requirements]);
} 