import React, { useState, useMemo } from "react";

// Predefined semester options
const SEMESTER_OPTIONS = ["א", "ב", "ג", "ד", "ה", "ו", "ז", "ח", "קיץ"];

// Color mappings for each course category with softer, more minimalistic colors
const CATEGORY_COLORS = {
  "חובה": { bg: "bg-blue-50", text: "text-blue-600", bar: "bg-blue-500" },
  "בחירה כללי": { bg: "bg-orange-50", text: "text-orange-600", bar: "bg-orange-500" },
  "בחירה א": { bg: "bg-green-50", text: "text-green-600", bar: "bg-green-500" },
  "בחירה ב": { bg: "bg-yellow-50", text: "text-yellow-600", bar: "bg-yellow-500" },
  "בחירה ג": { bg: "bg-teal-50", text: "text-teal-600", bar: "bg-teal-500" },
  "בחירה ד": { bg: "bg-emerald-50", text: "text-emerald-600", bar: "bg-emerald-500" },
  "מלג": { bg: "bg-purple-50", text: "text-purple-600", bar: "bg-purple-500" },
  "חופשית": { bg: "bg-amber-50", text: "text-amber-700", border: "border-amber-100", bar: "bg-amber-500" },
  "ספורט": { bg: "bg-cyan-50", text: "text-cyan-700", border: "border-cyan-100", bar: "bg-cyan-500" },
  "גמר": { bg: "bg-red-50", text: "text-red-700", border: "border-red-100", bar: "bg-red-500" }
};

// Electve categories for hierarchy display
const ELECTIVE_CATEGORIES = ['בחירה א', 'בחירה ב', 'בחירה ג', 'בחירה ד'];

// ---------- constants ----------
// Predefined degree profiles with their requirements
const DEGREE_PROFILES = {
  "תואר מכונות": { 
    "חובה": 109.5,
    "בחירה כללי": 30,
    "בחירה א": 10, 
    "בחירה ב": 10, 
    "בחירה ג": 5, 
    "בחירה ד": 5,
    "מלג": 6, 
    "חופשית": 4, 
    "ספורט": 2, 
    "גמר": 6 
  },
  "תואר חשמל": { 
    "חובה": 115.0,
    "בחירה כללי": 26,
    "בחירה א": 10,
    "בחירה ב": 8,
    "בחירה ג": 8,
    "מלג": 6, 
    "חופשית": 4, 
    "ספורט": 2, 
    "גמר": 8 
  },
  "תואר תוכנה": { 
    "חובה": 95.5,
    "בחירה כללי": 36.5,
    "בחירה א": 12.5,
    "בחירה ב": 12,
    "בחירה ג": 12,
    "מלג": 6, 
    "חופשית": 4, 
    "ספורט": 2, 
    "גמר": 6 
  }
};

const DEFAULT_PROFILE = "תואר מכונות";
const DEFAULT_REQUIREMENTS = DEGREE_PROFILES[DEFAULT_PROFILE];

// ---------- helper to create a new course draft ----------
const makeCourse = semester => ({
  id: `${Date.now()}-${Math.random()}`,
  name: "",
  category: "חובה",
  credits: 0,
  grade: null,
  status: "planned",
  semester,
  isEditing: true
});

// ---------- hook to compute summary and GPA ----------
function useProgress(courses, requirements) {
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
        if (c.status === 'completed') {
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
      
      if (c.grade != null && !isNaN(c.grade)) {
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

// ---------- small component to render stats ----------
function Stat({ label, value, required }) {
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

// ---------- main app component ----------
export default function DegreeProgressApp() {
  const [courses, setCourses] = useState([]);
  const [requirements, setRequirements] = useState(DEFAULT_REQUIREMENTS);
  const [semesters, setSemesters] = useState([]);
  const [newSem, setNewSem] = useState("");
  const [showReqEditor, setShowReqEditor] = useState(false);
  const [semesterToDelete, setSemesterToDelete] = useState(null);
  const [currentProfile, setCurrentProfile] = useState(DEFAULT_PROFILE);
  const [categories, setCategories] = useState(Object.keys(DEFAULT_REQUIREMENTS));
  
  // For adding new custom elective categories
  const [newCategoryName, setNewCategoryName] = useState("");
  const [newCategoryValue, setNewCategoryValue] = useState(0);

  // New function to add a custom category
  const addCustomCategory = () => {
    if (newCategoryName.trim()) {
      const categoryName = newCategoryName.trim();
      
      // Only add if the category doesn't already exist
      if (!categories.includes(categoryName)) {
        // Update requirements and categories
        setRequirements(prev => ({
          ...prev,
          [categoryName]: Number(newCategoryValue)
        }));
        
        setCategories(prev => [...prev, categoryName]);
        
        // Also update the color mapping if it's not already defined
        if (!CATEGORY_COLORS[categoryName]) {
          CATEGORY_COLORS[categoryName] = { 
            bg: "bg-green-100", 
            text: "text-green-800", 
            border: "border-green-200", 
            bar: "bg-green-600" 
          };
        }
        
        // Reset the inputs
        setNewCategoryName("");
        setNewCategoryValue(0);
      }
    }
  };

  const { summary, gpa } = useProgress(courses, requirements);

  const changeProfile = (profileName) => {
    if (DEGREE_PROFILES[profileName]) {
      setCurrentProfile(profileName);
      setRequirements(DEGREE_PROFILES[profileName]);
      setCategories(Object.keys(DEGREE_PROFILES[profileName]));
    }
  };

  const addSemester = () => {
    if (newSem) {
      // Format the semester name with the prefix
      const formattedSemName = `סמסטר ${newSem}`;
      setSemesters(prev => prev.includes(formattedSemName) ? prev : [...prev, formattedSemName]);
      setNewSem("");
    }
  };

  const confirmSemesterDelete = sem => {
    setSemesterToDelete(sem);
  };

  const performSemesterDelete = () => {
    if (semesterToDelete) {
      setSemesters(prev => prev.filter(s => s !== semesterToDelete));
      setCourses(prev => prev.filter(c => c.semester !== semesterToDelete));
      setSemesterToDelete(null);
    }
  };

  const addCourse = sem => setCourses(prev => [...prev, makeCourse(sem)]);
  
  const updateCourse = (id, field, val) => {
    setCourses(prev => {
      const updatedCourses = prev.map(c => {
        if (c.id === id) {
          return { ...c, [field]: val };
        }
        return c;
      });
      return updatedCourses;
    });
  };
  
  const toggleEdit = id => {
    setCourses(prev => {
      const updatedCourses = prev.map(c => {
        if (c.id === id) {
          if (c.isEditing) {
            // Validation: Check if name is provided
            if (!c.name.trim()) {
              alert("שם הקורס הוא שדה חובה");
              return c; // Keep in editing mode
            }
            
            // Validation: Check if grade is within range
            if (c.grade !== null && (c.grade < 0 || c.grade > 100)) {
              alert("הציון חייב להיות בין 0 ל-100");
              return c; // Keep in editing mode
            }
            
            // If validation passes, save the course
            return { 
              ...c, 
              isEditing: false,
              credits: Number(c.credits),
              name: c.name.trim() // Trim whitespace from name
            };
          } else {
            // Just toggle editing mode when entering edit mode
            return { ...c, isEditing: true };
          }
        }
        return c;
      });
      return updatedCourses;
    });
  };

  const removeCourse = id => {
    setCourses(prev => prev.filter(c => c.id !== id));
  };

  const handleDragStart = (e, id) => {
    const tag = e.target.tagName;
    if (["BUTTON", "INPUT", "SELECT"].includes(tag)) return;
    e.dataTransfer.setData("cid", id);
  };
  const handleDrop = (e, sem) => {
    e.preventDefault();
    const id = e.dataTransfer.getData("cid");
    if (id) updateCourse(id, "semester", sem);
  };

  return (
    <div className="google-container">
      {semesterToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
          <div className="google-card bg-white p-6 w-full max-w-md">
            <h2 className="google-header text-center">אישור מחיקה</h2>
            <p className="google-subheader text-center">
              האם אתה בטוח שברצונך למחוק את הסמסטר "{semesterToDelete}"?
            </p>
            <div className="flex justify-center gap-3 mt-6">
              <button onClick={() => setSemesterToDelete(null)} className="google-btn-secondary">ביטול</button>
              <button onClick={performSemesterDelete} className="bg-red-500 hover:bg-red-600 text-white font-medium rounded-md px-4 py-2 transition duration-200">מחק</button>
            </div>
          </div>
        </div>
      )}

      {showReqEditor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
          <div className="google-card bg-white p-4 w-full max-w-md">
            <div className="flex items-center justify-between mb-3 border-b border-gray-100 pb-2">
              <h2 className="text-xl font-medium text-gray-800">עריכת דרישות נק"ז</h2>
              <button onClick={() => setShowReqEditor(false)} className="text-gray-500 hover:text-gray-700">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="space-y-2 mb-4 max-h-[60vh] overflow-y-auto">
              {categories.map(cat => {
                const colors = CATEGORY_COLORS[cat] || { bg: "bg-gray-100", text: "text-gray-700" };
                return (
                  <div key={cat} className={`flex justify-between items-center p-2 rounded-md ${colors.bg}`}>
                    <span className={`text-sm font-medium ${colors.text}`}>{cat}</span>
                    <input
                      type="number"
                      min="0"
                      step="0.5"
                      value={requirements[cat]}
                      onChange={e => {
                        const v = Number(e.target.value);
                        setRequirements(prev => ({ ...prev, [cat]: isNaN(v) ? 0 : v }));
                      }}
                      className="google-input text-sm w-24 text-center py-1"
                    />
                  </div>
                );
              })}
              
              <div className="mt-4 p-2 bg-indigo-50 rounded-md">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-indigo-700">הוספת קטגוריה חדשה</span>
                </div>
                <div className="grid grid-cols-5 gap-2">
                  <input
                    type="text"
                    placeholder="שם קטגוריה"
                    value={newCategoryName}
                    onChange={e => setNewCategoryName(e.target.value)}
                    className="google-input text-sm col-span-3"
                  />
                  <input
                    type="number"
                    min="0"
                    step="0.5"
                    placeholder="נק״ז"
                    value={newCategoryValue}
                    onChange={e => setNewCategoryValue(Number(e.target.value))}
                    className="google-input text-sm text-center col-span-1"
                  />
                  <button 
                    onClick={addCustomCategory} 
                    className="google-btn-primary text-sm py-1 px-2 col-span-1"
                    disabled={!newCategoryName.trim()}
                  >
                    הוסף
                  </button>
                </div>
              </div>
            </div>
            
            <div className="flex justify-end gap-2 pt-3 border-t border-gray-100">
              <button onClick={() => setShowReqEditor(false)} className="google-btn-secondary text-sm py-1.5 px-4">סגור</button>
              <button onClick={() => setShowReqEditor(false)} className="google-btn-primary text-sm py-1.5 px-4">שמור</button>
            </div>
          </div>
        </div>
      )}

      <header className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <img src="/symbol.png" alt="Logo" className="w-10 h-10 mr-2" />
          <div>
            <h1 className="text-xl font-medium text-gray-800">מעקב התקדמות</h1>
            <p className="text-sm text-gray-600">{currentProfile}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <select 
            className="google-input text-sm py-1.5 px-3"
            value={currentProfile}
            onChange={(e) => changeProfile(e.target.value)}
          >
            {Object.keys(DEGREE_PROFILES).map(profile => (
              <option key={profile} value={profile}>{profile}</option>
            ))}
          </select>
          <button onClick={() => setShowReqEditor(true)} className="google-btn-secondary flex items-center text-sm py-1.5 px-3">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            דרישות
          </button>
        </div>
      </header>

      {/* All categories in a single compact grid */}
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
                style={{ width: `${Math.min(gpa, 100)}%` }}
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
              value={summary[cat].remaining} 
              required={summary[cat].required}
            />
          ))}
        </div>
      </div>

      <div className="space-y-3">
        {semesters.map((sem, index) => (
          <div key={sem} className="google-card">
            <div
              onDragOver={e => e.preventDefault()}
              onDrop={e => handleDrop(e, sem)}
            >
              <div className="flex justify-between items-center p-2 border-b border-gray-100">
                <h2 className="text-sm font-medium">{sem}</h2>
                <div className="flex gap-1">
                  <button draggable={false} onClick={() => addCourse(sem)} className="google-btn-primary flex items-center text-xs py-1 px-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    קורס
                  </button>
                  <button draggable={false} onClick={() => confirmSemesterDelete(sem)} className="text-gray-500 hover:text-red-500 transition-colors p-1">
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
                    {courses.filter(c => c.semester === sem).map((c, i) => {
                      const courseColors = CATEGORY_COLORS[c.category] || { bg: "bg-gray-100", text: "text-gray-800", border: "border-gray-200" };
                      return (
                      <tr
                        key={c.id}
                        draggable
                        onDragStart={e => handleDragStart(e, c.id)}
                        className={`hover:bg-opacity-80 border-b ${courseColors.border} ${courseColors.bg} bg-opacity-40`}
                      >
                        <td className="px-3 py-2">{c.isEditing ? <input value={c.name} onChange={e => updateCourse(c.id, 'name', e.target.value)} className="google-input text-sm w-full py-1"/> : <span className={`${courseColors.text} text-sm`}>{c.name}</span>}</td>
                        <td className="px-3 py-2">
                          {c.isEditing ? (
                            <select value={c.category} onChange={e => updateCourse(c.id, 'category', e.target.value)} className="google-input text-sm py-1">
                              {categories.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                            </select>
                          ) : (
                            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-sm font-medium ${courseColors.bg} ${courseColors.text}`}>
                              {c.category}
                            </span>
                          )}
                        </td>
                        <td className="px-3 py-2">
                          {c.isEditing ? 
                            <input 
                              type="number" 
                              min="0" 
                              step="0.5" 
                              placeholder="נק״ז" 
                              value={c.credits === 0 ? '' : c.credits} 
                              onChange={e => updateCourse(c.id, 'credits', e.target.value === '' ? 0 : Number(e.target.value))} 
                              className="google-input text-sm w-20 text-center py-1"
                            /> : 
                            <span className={`${courseColors.text} text-sm font-medium`}>{c.credits}</span>
                          }
                        </td>
                        <td className="px-3 py-2">
                          {c.isEditing ? 
                            <input 
                              type="number" 
                              min="0" 
                              max="100" 
                              value={c.grade ?? ''} 
                              onChange={e => updateCourse(c.id, 'grade', e.target.value === '' ? null : Number(e.target.value))} 
                              className="google-input text-sm w-20 text-center py-1"
                            /> : 
                            <span className={`${courseColors.text} text-sm font-medium`}>{c.grade}</span>
                          }
                        </td>
                        <td className="px-3 py-2">
                          {c.isEditing ? (
                            <select value={c.status} onChange={e => updateCourse(c.id, 'status', e.target.value)} className="google-input text-sm py-1">
                              <option value="planned">תוכנן</option>
                              <option value="completed">בוצע</option>
                            </select>
                          ) : (
                            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-sm font-medium ${c.status === 'completed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                              {c.status === 'completed' ? 'בוצע' : 'תוכנן'}
                            </span>
                          )}
                        </td>
                        <td className="px-3 py-2">
                          <div className="flex gap-2 justify-end">
                            {c.isEditing ? (
                              <button draggable={false} onClick={() => toggleEdit(c.id)} className="inline-flex items-center text-sm google-btn-primary py-1 px-2">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                                שמור
                              </button>
                            ) : (
                              <button draggable={false} onClick={() => toggleEdit(c.id)} className="text-orange-600 hover:text-orange-800 p-1">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                </svg>
                              </button>
                            )}
                            <button draggable={false} onClick={() => removeCourse(c.id)} className="text-gray-500 hover:text-red-500 p-1">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m5-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          </div>
                        </td>
                      </tr>
                      );
                    })}
                    {courses.filter(c => c.semester === sem).length === 0 && (
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
        ))}
        
        {/* Compact "add semester" section */}
        <div className="google-card p-3 flex flex-col items-center">
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
            <button onClick={addSemester} className="google-btn-primary text-xs py-1 px-3">הוסף</button>
          </div>
        </div>
      </div>

      <footer className="mt-6 pb-4 text-center text-gray-500 text-xs">
        <p>מעקב נקודות זכות © {new Date().getFullYear()}</p>
      </footer>
    </div>
  );
}
