// Predefined semester options
export const SEMESTER_OPTIONS = ["א", "ב", "ג", "ד", "ה", "ו", "ז", "ח", "קיץ"];

// Color mappings - Pastel Gradients
export const CATEGORY_COLORS = {
    "חובה": { gradient: "bg-gradient-to-r from-lime-50 to-lime-100", text: "text-lime-700", bar: "bg-lime-400" },
    "בחירה א": { gradient: "bg-gradient-to-r from-green-100 to-green-200", text: "text-green-700", bar: "bg-green-400" },
    "בחירה ב": { gradient: "bg-gradient-to-r from-emerald-100 to-emerald-200", text: "text-emerald-700", bar: "bg-emerald-400" },
    "בחירה ג": { gradient: "bg-gradient-to-r from-teal-100 to-teal-200", text: "text-teal-700", bar: "bg-teal-400" },
    "בחירה ד": { gradient: "bg-gradient-to-r from-cyan-100 to-cyan-200", text: "text-cyan-700", bar: "bg-cyan-400" },
    "בחירה כללי": { gradient: "bg-gradient-to-r from-sky-100 to-sky-200", text: "text-sky-700", bar: "bg-sky-400" },
    "מלג": { gradient: "bg-gradient-to-r from-lime-100 to-lime-200", text: "text-lime-800", bar: "bg-lime-500" },
    "חופשית": { gradient: "bg-gradient-to-r from-green-100 to-green-200", text: "text-green-800", bar: "bg-green-500" },
    "ספורט": { gradient: "bg-gradient-to-r from-emerald-100 to-emerald-200", text: "text-emerald-800", bar: "bg-emerald-500" },
    "גמר": { gradient: "bg-gradient-to-r from-teal-100 to-teal-200", text: "text-teal-800", bar: "bg-teal-500" },
    // Fallback/Default
    "default": { gradient: "bg-gradient-to-r from-gray-100 to-gray-200", text: "text-gray-800", bar: "bg-gray-400" }
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