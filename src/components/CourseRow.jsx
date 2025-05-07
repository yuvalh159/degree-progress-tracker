import React from 'react';

export default function CourseRow({
    course,
    categories,
    CATEGORY_COLORS,
    updateCourse,
    toggleEdit,
    removeCourse,
    handleDragStart
}) {
    const courseColors = CATEGORY_COLORS[course.category] || { bg: "bg-gray-100", text: "text-gray-800", border: "border-gray-200" };

    return (
        <tr
            draggable={!course.isEditing} // Only allow drag if not editing
            onDragStart={e => {
                // Prevent drag if an input/select/button was the drag origin
                const tag = e.target.tagName;
                if (["INPUT", "SELECT", "BUTTON"].includes(tag) || course.isEditing) {
                    e.preventDefault();
                    return;
                }
                handleDragStart(e, course.id);
            }}
            className={`hover:bg-opacity-80 border-b ${courseColors.border} ${courseColors.bg} bg-opacity-40`}
        >
            <td className="px-3 py-2">
                {course.isEditing ? (
                    <input
                        value={course.name}
                        onChange={e => updateCourse(course.id, 'name', e.target.value)}
                        className="google-input text-sm w-full py-1"
                    // autoFocus // Temporarily removed for debugging
                    />
                ) : (
                    <span className={`${courseColors.text} text-sm`}>{course.name}</span>
                )}
            </td>
            <td className="px-3 py-2">
                {course.isEditing ? (
                    <select
                        value={course.category}
                        onChange={e => updateCourse(course.id, 'category', e.target.value)}
                        className="google-input text-sm py-1"
                    >
                        {categories.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                    </select>
                ) : (
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-sm font-medium ${courseColors.bg} ${courseColors.text}`}>
                        {course.category}
                    </span>
                )}
            </td>
            <td className="px-3 py-2">
                {course.isEditing ? (
                    <input
                        type="number"
                        min="0"
                        step="0.5"
                        placeholder="נק״ז"
                        value={course.credits === 0 ? '' : course.credits}
                        onChange={e => updateCourse(course.id, 'credits', e.target.value === '' ? 0 : Number(e.target.value))}
                        className="google-input text-sm w-20 text-center py-1"
                    />
                ) : (
                    <span className={`${courseColors.text} text-sm font-medium`}>{course.credits}</span>
                )}
            </td>
            <td className="px-3 py-2">
                {course.isEditing ? (
                    <input
                        type="number"
                        min="0"
                        max="100"
                        value={course.grade ?? ''}
                        onChange={e => updateCourse(course.id, 'grade', e.target.value === '' ? null : Number(e.target.value))}
                        className="google-input text-sm w-20 text-center py-1"
                    />
                ) : (
                    <span className={`${courseColors.text} text-sm font-medium`}>{course.grade}</span>
                )}
            </td>
            <td className="px-3 py-2">
                {course.isEditing ? (
                    <select
                        value={course.status}
                        onChange={e => updateCourse(course.id, 'status', e.target.value)}
                        className="google-input text-sm py-1"
                    >
                        <option value="planned">תוכנן</option>
                        <option value="completed">בוצע</option>
                        <option value="binary">בינארי</option>
                    </select>
                ) : (
                    <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-sm font-medium ${course.status === 'completed' ? 'bg-green-100 text-green-800' :
                            course.status === 'binary' ? 'bg-blue-100 text-blue-800' :
                                'bg-yellow-100 text-yellow-800'
                            }`}
                    >
                        {course.status === 'completed' ? 'בוצע' : course.status === 'binary' ? 'בינארי' : 'תוכנן'}
                    </span>
                )}
            </td>
            <td className="px-3 py-2">
                <div className="flex gap-2 justify-end">
                    {course.isEditing ? (
                        <button draggable={false} onClick={() => toggleEdit(course.id)} className="inline-flex items-center text-sm google-btn-primary py-1 px-2">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            שמור
                        </button>
                    ) : (
                        <button draggable={false} onClick={() => toggleEdit(course.id)} className="text-orange-600 hover:text-orange-800 p-1">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                        </button>
                    )}
                    <button draggable={false} onClick={() => removeCourse(course.id)} className="text-gray-500 hover:text-red-500 p-1">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m5-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                    </button>
                </div>
            </td>
        </tr>
    );
} 