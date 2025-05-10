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
    console.log("Starting text parsing with revised regex and line handling...");
    const lines = text.split('\n').filter(line => line.trim() !== '');
    let degreeName = 'Not Found';
    const courses = [];

    // Regex to find degree name
    const degreeRegex = /מוסמך למדעים ב(.*?)(?:לתואר|בפקולטה|\s+\d{2,3}\.\d|\s+הנקודות)/i;

    // Regex for course lines: CODE NAME POINTS GRADE SEMESTER_INFO
    // Adjusted to be a bit more flexible with spacing and allow for course names that might have numbers but not at the start of points/grade.
    const courseLineRegex = /^(\d{8,10})\s+(.+?)\s+(\d+(?:\.\d)?(?:\s+|$))\s*([\d\w\s"'-֐-׿]+?)\s+(\d{4}-\d{4}\s+(?:אביב|חורף|קיץ)\s+תש[פ-ץ]{2}[א-ת])$/;
    const headerLine = 'מקצוע ניקוד ציון סמסטר';

    let foundDegree = false;
    for (const line of lines) {
        const trimmedLine = line.trim();
        if (!foundDegree) {
            const degreeMatch = trimmedLine.match(degreeRegex);
            if (degreeMatch && degreeMatch[1]) {
                degreeName = degreeMatch[1].trim(); // Trim the captured group
                console.log(`Found degree: ${degreeName}`);
                foundDegree = true;
            }
        }

        if (trimmedLine === headerLine) {
            console.log("Skipping header line:", trimmedLine);
            continue;
        }

        if (!/^\d{8,10}/.test(trimmedLine)) {
            // console.log("Skipping non-course line (no code prefix):", trimmedLine);
            continue;
        }

        const courseMatch = trimmedLine.match(courseLineRegex);
        if (courseMatch) {
            courses.push({
                code: courseMatch[1]?.trim(),
                name: courseMatch[2]?.trim(),
                points: courseMatch[3]?.trim(), // Points group itself might have trailing space due to (\s+|$) so trim
                grade: courseMatch[4]?.trim(),
                semester: courseMatch[5]?.trim()
            });
        } else {
            if (/^\d{8,10}/.test(trimmedLine)) {
                console.log("Partial match (code found) but full regex failed for line:", trimmedLine);
            }
        }
    }

    console.log("Parsing complete. Degree:", degreeName, "Courses found:", courses.length);
    if (courses.length === 0 && lines.length > 5) { // Reduced threshold for placeholder
        courses.push({
            code: "ERROR",
            name: "No courses parsed - Check Regex and Console Logs from Piped Text",
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
                    // Changed join from ' ' to '\n' to better simulate lines
                    const pageText = textContent.items.map(item => item.str).join('\n');
                    fullText += pageText + '\n\n'; // Add double newline between pages
                }

                setExtractedText(fullText); // Save the text with newlines for potential debugging
                // Log a version of the text specifically for regex testing if it's too long for one console line
                // This replaces multiple spaces/newlines with single ones for better readability in logs
                // const condensedTextForLog = fullText.replace(/\s\s+/g, ' ');
                // console.log("Extracted Text (condensed for log):", condensedTextForLog);
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