import React from 'react';
import CourseRow from './CourseRow'; // Assuming CourseRow.jsx is in the same directory
import { CATEGORY_COLORS } from '../constants'; // Import for CourseRow and potentially here

export default function SemesterCard({
    semesterName,
    coursesForSemester,
    allCategories,
    // CATEGORY_COLORS is already imported, can be passed to CourseRow or CourseRow can import it itself
    addCourseToSemesterFn,
    confirmDeleteSemesterFn,
    updateCourseFn,
    toggleCourseEditFn,
    removeCourseFn,
    handleCourseDrop,
    handleCourseDragStart
}) {
    return (
        <div className="google-card">
            <div
                onDragOver={e => e.preventDefault()} // Necessary for drop to work
                onDrop={e => handleCourseDrop(e, semesterName)}
            >
                <div className="flex justify-between items-center p-2 border-b border-gray-100">
                    <h2 className="text-sm font-medium">{semesterName}</h2>
                    <div className="flex gap-1">
                        <button
                            draggable={false}
                            onClick={() => addCourseToSemesterFn(semesterName)}
                            className="google-btn-primary flex items-center text-xs py-1 px-2"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                            קורס
                        </button>
                        <button
                            draggable={false}
                            onClick={() => confirmDeleteSemesterFn(semesterName)}
                            className="text-gray-500 hover:text-red-500 transition-colors p-1"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m5-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                        </button>
                    </div>
                </div>

                <div className="overflow-x-auto text-xs">
                    <table className="w-full">
                        <thead className="text-xs text-gray-700 bg-gray-50">
                            <tr>
                                <th className="px-2 py-1 text-right">שם קורס</th>
                                <th className="px-2 py-1 text-right">סוג</th>
                                <th className="px-2 py-1 text-right">נק"ז</th>
                                <th className="px-2 py-1 text-right">ציון</th>
                                <th className="px-2 py-1 text-right">סטטוס</th>
                                <th className="px-2 py-1 text-right">פעולות</th>
                            </tr>
                        </thead>
                        <tbody>
                            {coursesForSemester.map(course => (
                                <CourseRow
                                    key={course.id}
                                    course={course}
                                    categories={allCategories}
                                    CATEGORY_COLORS={CATEGORY_COLORS} // Pass down the imported colors
                                    updateCourse={updateCourseFn}
                                    toggleEdit={toggleCourseEditFn}
                                    removeCourse={removeCourseFn}
                                    handleDragStart={handleCourseDragStart}
                                />
                            ))}
                            {coursesForSemester.length === 0 && (
                                <tr>
                                    <td colSpan="6" className="px-2 py-3 text-center text-gray-500 text-xs">
                                        לחץ על "קורס" כדי להוסיף קורס חדש
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
} 