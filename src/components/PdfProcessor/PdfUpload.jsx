import React, { useState, useRef } from 'react';
import * as pdfjsLib from 'pdfjs-dist/build/pdf';

// Configure the workerSrc for PDF.js. This is crucial for it to work.
const base_url = import.meta.env.BASE_URL || '/'; // Ensure fallback if BASE_URL is undefined
const workerSrcPath = `${base_url}js/pdf.worker.min.mjs`.replace('//', '/'); // Construct path and remove double slashes if base_url is '/'
pdfjsLib.GlobalWorkerOptions.workerSrc = workerSrcPath;

// Option 2: Use a CDN (can be unreliable or cause issues like version mismatch or CSP problems)
// pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

// Helper function to check if a string is purely numeric (allowing for decimals for points)
function isNumeric(str) {
    if (typeof str !== 'string') return false;
    return /^\d+(?:\.\d+)?$/.test(str.trim());
}

// New helper function to validate grade strings
function isValidGrade(str) {
    if (typeof str !== 'string') return false;
    const trimmedStr = str.trim();
    // Check for purely numeric grades (e.g., "75", "100")
    if (/^\d+$/.test(trimmedStr)) return true;
    // Check against a list of known non-numeric grades
    const validNonNumericGrades = [
        "עובר",
        "פטור",
        "פטור ללא ניקוד",
        "פטור עם ניקוד"
        // Add other valid non-numeric grades if they exist (e.g., "נכשל")
    ];
    return validNonNumericGrades.includes(trimmedStr);
}

// New helper function to validate semester strings
function isValidSemester(str) {
    if (typeof str !== 'string') return false;
    // Example formats: "2023-2024 אביב תשפ"ד", "2022-2023 חורף תשפ"ג"
    // Regex breakdown:
    // ^\d{4}-\d{4}      : Year range (e.g., "2023-2024")
    // \s+               : Space
    // [\u0590-\u05FF]+   : Season (Hebrew characters, e.g., "אביב")
    // \s+               : Space
    // תש[א-ת]{1,2}      : "תש" followed by 1 or 2 Hebrew letters (e.g., "תשפ" or "תשפג")
    // ["\u05F3\u05F4]    : A double quote, or Hebrew geresh, or Hebrew gershayim
    // [א-ת]              : A final Hebrew letter (e.g., "ד")
    // $                  : End of string
    return /^\d{4}-\d{4}\s+[\u0590-\u05FF]+\s+תש[א-ת]{1,2}["\u05F3\u05F4][א-ת]$/.test(str.trim());
}

// Helper function to parse the extracted text
const parseExtractedText = (text) => {
    console.log("Starting text parsing with inCourseSection flag...");
    const lines = text.split('\n').map(line => line.trim()).filter(line => line !== '');
    let degreeName = 'לא נמצא'; // Translated
    const courses = [];
    let foundDegree = false;
    let inCourseSection = false; // Flag to indicate if we are in the courses part of the PDF

    const courseCodeRegex = /^\d{8,10}$/;
    const endOfCoursesMarker = 'סוף תעודת הציונים';

    for (let i = 0; i < lines.length; i++) {
        const currentLine = lines[i];

        if (!foundDegree && currentLine.startsWith("מוסמך למדעים ב")) {
            degreeName = currentLine.substring("מוסמך למדעים ב".length).trim();
            console.log(`Found degree: ${degreeName}`);
            foundDegree = true;
        }

        if (!inCourseSection && currentLine === "מקצוע") {
            if (i + 3 < lines.length &&
                lines[i + 1].trim() === "ניקוד" &&
                lines[i + 2].trim() === "ציון" &&
                lines[i + 3].trim() === "סמסטר") {
                console.log("Found course table header lines: מקצוע, ניקוד, ציון, סמסטר");
                inCourseSection = true;
                i += 3; // Advance index past the header lines (ניקוד, ציון, סמסטר)
                console.log("Advanced index, next line for course processing should be:", lines[i + 1] || "End of lines");
                continue; // Start next iteration, which should be the first actual course line
            }
        }

        if (inCourseSection && currentLine === endOfCoursesMarker) {
            console.log("Found end of courses marker.");
            inCourseSection = false;
        }

        if (!inCourseSection) {
            continue; // Don't process for courses if not in the section
        }

        if (courseCodeRegex.test(currentLine)) {
            const code = currentLine;
            let name = "לא זמין"; // Translated N/A
            let points = "0"; // Default points
            let grade = "לא זמין"; // Translated N/A
            let semester = "לא זמין"; // Translated N/A
            let linesToAdvance = 0;
            let isPotentiallyValidCourse = true; // Assume valid until a check fails

            // 1. Read Name
            if (i + 1 < lines.length && lines[i + 1] !== endOfCoursesMarker) {
                name = lines[i + 1];
                linesToAdvance = 1;
                if (name.trim() === "") { // Empty name is invalid
                    isPotentiallyValidCourse = false;
                    console.log(`Skipped entry (potential course code ${code}) due to empty name.`);
                }
            } else {
                isPotentiallyValidCourse = false; // No name line available
                console.log(`Skipped entry (potential course code ${code}) due to missing name line.`);
            }

            // 2. Read Points or Grade (only if name was found and valid)
            if (isPotentiallyValidCourse && i + 2 < lines.length && lines[i + 2] !== endOfCoursesMarker) {
                const line3 = lines[i + 2]; // This is potential points or first part of grade
                if (isNumeric(line3)) { // It's points
                    points = line3;
                    linesToAdvance = 2;
                    // 3. Read Grade (after points)
                    if (i + 3 < lines.length && lines[i + 3] !== endOfCoursesMarker) {
                        const potentialGrade = lines[i + 3];
                        if (isValidGrade(potentialGrade)) {
                            grade = potentialGrade;
                            linesToAdvance = 3;
                            // 4. Read Semester (after valid grade)
                            if (i + 4 < lines.length && lines[i + 4] !== endOfCoursesMarker) {
                                const potentialSemester = lines[i + 4];
                                if (isValidSemester(potentialSemester)) {
                                    semester = potentialSemester;
                                    linesToAdvance = 4;
                                } else {
                                    console.log(`Warning: Invalid semester format '${potentialSemester}' for course ${code}. Storing as N/A.`);
                                    // semester remains "N/A", course can still be valid
                                }
                            } // else: not enough lines for semester, semester remains "N/A"
                        } else { // Invalid grade after points
                            console.log(`Invalid grade '${potentialGrade}' after points for course ${code}. Marking as invalid.`);
                            isPotentiallyValidCourse = false;
                        }
                    } else { // Not enough lines for grade after points
                        console.log(`Missing grade line after points for course ${code}. Marking as invalid.`);
                        isPotentiallyValidCourse = false; // Requires a grade if points are specified.
                    }
                } else { // Line 3 is not points, so it must be a grade
                    const potentialGrade = line3;
                    if (isValidGrade(potentialGrade)) {
                        grade = potentialGrade;
                        // points remains default "0" - this is okay for "פטור" type grades
                        linesToAdvance = 2;
                        // 4. Read Semester (after grade, no points line)
                        if (i + 3 < lines.length && lines[i + 3] !== endOfCoursesMarker) {
                            const potentialSemester = lines[i + 3];
                            if (isValidSemester(potentialSemester)) {
                                semester = potentialSemester;
                                linesToAdvance = 3;
                            } else {
                                console.log(`Warning: Invalid semester format '${potentialSemester}' for course ${code} (grade-first path). Storing as N/A.`);
                                // semester remains "N/A", course can still be valid
                            }
                        } // else: not enough lines for semester, semester remains "N/A"
                    } else { // Invalid grade (and it wasn't points)
                        console.log(`Invalid grade '${potentialGrade}' (and not points) for course ${code}. Marking as invalid.`);
                        isPotentiallyValidCourse = false;
                    }
                }
            } else if (isPotentiallyValidCourse) { // Not enough lines for points/grade (but had a name)
                console.log(`Course ${code} with name '${name}' is missing points/grade lines. Marking as invalid.`);
                isPotentiallyValidCourse = false;
            }

            // Add course only if it's still considered valid and has a meaningful name
            if (isPotentiallyValidCourse && name !== "לא זמין" && name.trim() !== "") {
                courses.push({ code, name, points, grade, semester });
                console.log("Added course:", { code, name, points, grade, semester });
            } else if (courseCodeRegex.test(currentLine)) { // It matched course code regex but was deemed invalid
                console.log(`Skipped entry (original code line: ${currentLine}) due to invalid structure/data. Parsed as: Code: ${code}, Name: ${name}, Points: ${points}, Grade: ${grade}, Semester: ${semester}`);
            }
            i += linesToAdvance;
        }
    }

    console.log("Parsing complete. Degree:", degreeName, "Courses found:", courses.length);
    if (courses.length === 0 && lines.length > 5) {
        courses.push({
            code: "הודעה", // Translated
            name: "לא זוהו קורסים בקובץ. אנא בדוק/י את הלוגים בקונסול לפרטי תהליך העיבוד.", // Translated
            points: "-",
            grade: "-",
            semester: "-"
        });
    }
    return { degreeName, courses };
};

function PdfUpload({ onPdfDataParsed }) {
    const [selectedFile, setSelectedFile] = useState(null);
    const [parsedPdfData, setParsedPdfData] = useState(null);
    const [processingStatus, setProcessingStatus] = useState('');
    const [error, setError] = useState('');
    const fileInputRef = useRef(null); // Ref for the hidden file input
    const inputRef = useRef(null);

    const handleFileChange = async (event) => {
        const file = event.target.files[0];
        if (file && file.type === 'application/pdf') {
            setSelectedFile(file);
            setError('');
            setParsedPdfData(null);
            setProcessingStatus('מעבד קובץ PDF, אנא המתן/י...'); // Translated
            try {
                const arrayBuffer = await file.arrayBuffer();
                const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
                const numPages = pdf.numPages;
                let fullText = '';

                console.log(`Number of pages: ${numPages}`);

                for (let i = 1; i <= numPages; i++) {
                    console.log(`Processing page ${i}...`);
                    const page = await pdf.getPage(i);
                    const textContent = await page.getTextContent();
                    const pageText = textContent.items.map(item => item.str).join('\n');
                    fullText += pageText + '\n\n';
                }

                console.log("Extracted Text (raw with newlines from items):", fullText);

                const parsedData = parseExtractedText(fullText);
                setParsedPdfData(parsedData);
                console.log("Parsed Data:", parsedData);

                if (onPdfDataParsed) {
                    onPdfDataParsed(parsedData);
                }

                setProcessingStatus('קובץ PDF עובד ופוענח בהצלחה.'); // Translated

            } catch (err) {
                console.error('Error processing PDF:', err);
                let errorMessage = 'שגיאה בעיבוד הקובץ.'; // Translated
                if (err.name === 'MissingPDFException') {
                    errorMessage = 'קובץ PDF לא תקין או פגום.'; // Translated
                } else if (err.message && err.message.includes('NetworkError')) {
                    errorMessage = 'שגיאת רשת. לא ניתן היה לטעון את רכיב העזר של PDF.js. אנא בדוק/י את חיבור האינטרנט ואת הגדרות רכיב העזר.'; // Translated
                }
                setError(errorMessage);
                setProcessingStatus('שגיאה בעיבוד קובץ PDF.'); // Translated
                setParsedPdfData(null);
            }
        } else if (file) { // If a file is selected but it's not a PDF
            setSelectedFile(file); // Show the name of the invalid file
            setError('אנא בחר/י קובץ מסוג PDF בלבד.'); // Translated
            setProcessingStatus('');
            setParsedPdfData(null);
        } else { // No file selected or selection cancelled
            setSelectedFile(null);
            setError('לא נבחר קובץ.'); // Translated
            setProcessingStatus('');
            setParsedPdfData(null);
        }
    };

    const handleLabelClick = () => {
        fileInputRef.current.click(); // Trigger click on hidden input
    };

    return (
        <div className="w-full max-w-xs sm:max-w-sm md:max-w-md flex flex-col items-center">
            <input
                type="file"
                id="pdf-upload-input"
                accept=".pdf"
                onChange={handleFileChange}
                className="hidden" // Keep the actual input hidden
                ref={inputRef} // Assign the ref here
            />
            {/* Styled label that acts as the button */}
            <label
                htmlFor="pdf-upload-input"
                className="google-btn-primary text-base sm:text-sm px-4 py-2 h-10 cursor-pointer flex items-center justify-center w-full" // Added h-10 and w-full
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 rtl:ml-2 rtl:mr-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                </svg>
                {selectedFile ? selectedFile.name : "בחר/י קובץ PDF"}
            </label>

            {processingStatus && !error && (
                <p className="text-sm text-blue-600 mt-2 mb-2 text-center">סטטוס: {processingStatus}</p>
            )}
            {error && (
                <p className="text-sm text-red-600 mt-2 mb-2 text-center">שגיאה: {error}</p>
            )}
            {parsedPdfData && !error && processingStatus.includes("בהצלחה") && (
                <p className="text-sm text-green-600 mt-2 mb-2 text-center">הקורסים מהקובץ יובאו בהצלחה למערכת!</p>
            )}
        </div>
    );
}

export default PdfUpload; 