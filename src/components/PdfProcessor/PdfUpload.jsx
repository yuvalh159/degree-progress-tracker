import React, { useState } from 'react';
import * as pdfjsLib from 'pdfjs-dist/build/pdf';

// Configure the workerSrc for PDF.js. This is crucial for it to work.
const base_url = import.meta.env.BASE_URL || '/'; // Ensure fallback if BASE_URL is undefined
const workerSrcPath = `${base_url}js/pdf.worker.min.mjs`.replace('//', '/'); // Construct path and remove double slashes if base_url is '/'
pdfjsLib.GlobalWorkerOptions.workerSrc = workerSrcPath;

// Option 2: Use a CDN (can be unreliable or cause issues like version mismatch or CSP problems)
// pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

// Helper function to parse the extracted text
const parseExtractedText = (text) => {
    console.log("Starting text parsing with new regex...");
    const lines = text.split('\n').filter(line => line.trim() !== '');
    let degreeName = 'Not Found';
    const courses = [];

    // Regex to find degree name (from "מוסמך למדעים ב[Degree Name]")
    const degreeRegex = /מוסמך למדעים ב([^לתואר]+)/i;
    // Alternative: בפקולטה\s+([^\n]+?)(?=\s+\d|\s+הנקודות|
    // Or, for a more general approach if the title varies:
    // Look for a line containing "לתואר" and "בפקולטה" then try to extract smartly.
    // For now, using the specific one from the provided text.

    // Regex for course lines: CODE NAME POINTS GRADE SEMESTER_INFO
    const courseLineRegex = /^(\d{8,10})\s+(.+?)\s+(\d+(?:\.\d)?)\s+([\d\w\s"'-֐-׿]+?)\s+(\d{4}-\d{4}\s+(?:אביב|חורף|קיץ)\s+תש[פ-ץ]{2}[א-ת])$/;
    const headerLine = 'מקצוע ניקוד ציון סמסטר';

    let foundDegree = false;
    for (const line of lines) {
        if (!foundDegree) {
            const degreeMatch = line.match(degreeRegex);
            if (degreeMatch && degreeMatch[1]) {
                degreeName = degreeMatch[1].trim();
                console.log(`Found degree: ${degreeName}`);
                foundDegree = true; // Stop searching for degree once found
            }
        }

        if (line.trim() === headerLine) {
            console.log("Skipping header line:", line);
            continue;
        }

        // Skip lines that are clearly not course data (e.g. page footers, general text)
        if (!/^\d{8,10}/.test(line.trim())) { // If line doesn't start with a course code
            // Further checks can be added here if needed, e.g. length, keywords etc.
            // console.log("Skipping non-course line (no code prefix):", line);
            continue;
        }

        const courseMatch = line.trim().match(courseLineRegex);
        if (courseMatch) {
            courses.push({
                code: courseMatch[1]?.trim(), // Capture course code
                name: courseMatch[2]?.trim(),
                points: courseMatch[3]?.trim(),
                grade: courseMatch[4]?.trim(),
                semester: courseMatch[5]?.trim()
            });
        } else {
            // Log lines that started with a course code but didn't match the full regex, for debugging
            if (/^\d{8,10}/.test(line.trim())) {
                console.log("Partial match (code found) but full regex failed for line:", line.trim());
            }
        }
    }

    console.log("Parsing complete. Degree:", degreeName, "Courses found:", courses.length);
    if (courses.length === 0 && lines.length > 10) { // Only add placeholder if parsing likely failed significantly
        courses.push({
            code: "ERROR",
            name: "No courses parsed - Check Regex and Console Logs",
            points: "0",
            grade: "N/A",
            semester: "Parsing Incomplete"
        });
    }
    return { degreeName, courses };
};

function PdfUpload() {
    const [extractedText, setExtractedText] = useState('');
    const [parsedPdfData, setParsedPdfData] = useState(null); // New state for parsed data
    const [processingStatus, setProcessingStatus] = useState(''); // e.g., 'Processing...', 'Error', 'Success'
    const [error, setError] = useState('');

    const handleFileChange = async (event) => {
        const file = event.target.files[0];
        if (file && file.type === 'application/pdf') {
            setError('');
            setExtractedText('');
            setParsedPdfData(null); // Reset parsed data
            setProcessingStatus('Processing PDF, please wait...');
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
                    // textContent.items is an array of text items. item.str is the text.
                    // We join them with spaces, and join pages with double newlines.
                    const pageText = textContent.items.map(item => item.str).join(' ');
                    fullText += pageText + '\n\n';
                }

                setExtractedText(fullText);
                console.log("Extracted Text:", fullText);

                // Parse the extracted text
                const parsedData = parseExtractedText(fullText);
                setParsedPdfData(parsedData);
                console.log("Parsed Data:", parsedData);

                setProcessingStatus('PDF processed and parsed successfully.');

            } catch (err) {
                console.error('Error processing PDF:', err);
                let errorMessage = 'Failed to process PDF.';
                if (err.name === 'MissingPDFException') {
                    errorMessage = 'Invalid or corrupted PDF file.';
                } else if (err.message && err.message.includes('NetworkError')) {
                    errorMessage = 'Network error. Could not load PDF.js worker. Please check your internet connection and workerSrc configuration.';
                }
                setError(errorMessage);
                setProcessingStatus('Error processing PDF.');
                setExtractedText('');
                setParsedPdfData(null); // Ensure parsed data is cleared on error
            }
        } else {
            setError('Please select a PDF file.');
            setProcessingStatus('');
            setExtractedText('');
            setParsedPdfData(null); // Ensure parsed data is cleared
        }
    };

    return (
        <div style={{ padding: '20px' }}>
            <h2>Upload Degree Progress PDF</h2>
            <input type="file" accept=".pdf" onChange={handleFileChange} style={{ marginBottom: '10px' }} />

            {processingStatus && <p>Status: {processingStatus}</p>}
            {error && <p style={{ color: 'red' }}>Error: {error}</p>}

            {extractedText && !parsedPdfData && (
                <div>
                    <h3>Extracted Text (for debugging purposes):</h3>
                    <pre
                        style={{
                            whiteSpace: 'pre-wrap',
                            border: '1px solid #ccc',
                            padding: '10px',
                            maxHeight: '400px',
                            overflowY: 'auto',
                            textAlign: 'left', // Assuming LTR text for now, PDF content might be RTL
                            direction: 'ltr' // Explicitly set LTR for the pre block
                        }}
                    >
                        {extractedText}
                    </pre>
                </div>
            )}

            {parsedPdfData && (
                <div>
                    <h3>Parsed Data (for debugging purposes):</h3>
                    <h4>Degree: {parsedPdfData.degreeName}</h4>
                    <h4>Courses:</h4>
                    {parsedPdfData.courses.length > 0 ? (
                        <ul style={{ listStyleType: 'none', padding: 0 }}>
                            {parsedPdfData.courses.map((course, index) => (
                                <li key={index} style={{ border: '1px solid #eee', padding: '5px', marginBottom: '5px' }}>
                                    <strong>Code:</strong> {course.code} <br />
                                    <strong>Name:</strong> {course.name} <br />
                                    <strong>Points:</strong> {course.points} <br />
                                    <strong>Grade:</strong> {course.grade} <br />
                                    <strong>Semester:</strong> {course.semester}
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p>No courses parsed (check console for potential course lines and refine regex).</p>
                    )}
                    <details>
                        <summary>Show Raw Parsed JSON</summary>
                        <pre
                            style={{
                                whiteSpace: 'pre-wrap',
                                border: '1px solid #ccc',
                                padding: '10px',
                                maxHeight: '200px',
                                overflowY: 'auto',
                                backgroundColor: '#f5f5f5'
                            }}
                        >
                            {JSON.stringify(parsedPdfData, null, 2)}
                        </pre>
                    </details>
                </div>
            )}
        </div>
    );
}

export default PdfUpload; 