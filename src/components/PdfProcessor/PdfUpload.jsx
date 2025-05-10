import React, { useState } from 'react';
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

// Helper function to parse the extracted text
const parseExtractedText = (text) => {
    console.log("Starting text parsing with multi-line sequential logic...");
    const lines = text.split('\n').map(line => line.trim()).filter(line => line !== '');
    let degreeName = 'Not Found';
    const courses = [];
    let foundDegree = false;

    const courseCodeRegex = /^\d{8,10}$/;
    const headerLineText = 'מקצוע ניקוד ציון סמסטר'; // Text of the header line to skip

    for (let i = 0; i < lines.length; i++) {
        const currentLine = lines[i];

        // Try to find degree (once)
        if (!foundDegree && currentLine.startsWith("מוסמך למדעים ב")) {
            degreeName = currentLine.substring("מוסמך למדעים ב".length).trim();
            console.log(`Found degree: ${degreeName}`);
            foundDegree = true;
            // continue; // Degree line shouldn't be a course code, but continue just in case
        }

        // Skip known header lines for courses
        if (currentLine === headerLineText) {
            console.log("Skipping table header line:", currentLine);
            continue;
        }

        // Course parsing logic
        if (courseCodeRegex.test(currentLine)) {
            const code = currentLine;
            let name = "N/A";
            let points = "0"; // Default points
            let grade = "N/A";
            let semester = "N/A";
            let linesConsumedForCourse = 0; // How many lines to advance i

            if (i + 1 < lines.length) {
                name = lines[i + 1];
                linesConsumedForCourse = 1; // Consumed name

                if (i + 2 < lines.length) {
                    const potentialPointsOrGrade = lines[i + 2];
                    if (isNumeric(potentialPointsOrGrade)) { // It's points
                        points = potentialPointsOrGrade;
                        linesConsumedForCourse = 2; // Consumed name, points
                        if (i + 3 < lines.length) { // Grade expected next
                            grade = lines[i + 3];
                            linesConsumedForCourse = 3; // Consumed name, points, grade
                            if (i + 4 < lines.length) { // Semester expected next
                                semester = lines[i + 4];
                                linesConsumedForCourse = 4; // Consumed name, points, grade, semester
                            }
                        }
                    } else { // It's a grade (points are assumed to be 0 or not applicable)
                        grade = potentialPointsOrGrade;
                        linesConsumedForCourse = 2; // Consumed name, grade
                        if (i + 3 < lines.length) { // Semester expected next
                            semester = lines[i + 3];
                            linesConsumedForCourse = 3; // Consumed name, grade, semester
                        }
                    }
                }
            }

            courses.push({ code, name, points, grade, semester });
            console.log("Added course:", { code, name, points, grade, semester });
            i += linesConsumedForCourse; // Advance index by number of lines processed for this course
        }
    }

    console.log("Parsing complete. Degree:", degreeName, "Courses found:", courses.length);
    if (courses.length === 0 && lines.length > 5) {
        courses.push({
            code: "ERROR",
            name: "No courses parsed - Check multi-line logic and console logs",
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
                    const pageText = textContent.items.map(item => item.str).join('\n');
                    fullText += pageText + '\n\n';
                }

                setExtractedText(fullText); // Save the text with newlines for potential debugging
                console.log("Extracted Text (raw with newlines from items):", fullText);

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