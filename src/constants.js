// Predefined semester options
export const SEMESTER_OPTIONS = ["א", "ב", "ג", "ד", "ה", "ו", "ז", "ח", "קיץ"];

// Color mappings for each course category with softer, more minimalistic colors
export const CATEGORY_COLORS = {
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
export const ELECTIVE_CATEGORIES = ['בחירה א', 'בחירה ב', 'בחירה ג', 'בחירה ד'];

// ---------- constants ----------
// Predefined degree profiles with their requirements
export const INITIAL_DEGREE_PROFILES = {
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

export const DEFAULT_PROFILE = "תואר מכונות";
export const DEFAULT_REQUIREMENTS = INITIAL_DEGREE_PROFILES[DEFAULT_PROFILE]; 