import React, { useState } from 'react';
import * as pdfjsLib from 'pdfjs-dist/build/pdf';

// Configure the workerSrc for PDF.js. This is crucial for it to work.
// Option 1: Copy 'pdf.worker.min.js' from 'node_modules/pdfjs-dist/build/'
// to your 'public/js/' directory and uncomment the line below.
// Make sure the 'public/js' directory exists or adjust the path accordingly.
// pdfjsLib.GlobalWorkerOptions.workerSrc = '/js/pdf.worker.min.js';

// Option 2: Use a CDN (easier for initial setup, but has external dependency)
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

// Helper function to parse the extracted text
const parseExtractedText = (text) => {
    console.log("Starting text parsing...");
    const lines = text.split('\n').filter(line => line.trim() !== ''); // Split by newline and remove empty lines
    let degreeName = 'Not Found';
    const courses = [];

    // TODO: Refine regex patterns based on actual text output and PDF structure
    // Regex to find degree name (very basic, needs refinement)
    const degreeRegex = /לתואר\s+מוסמך\s+ב(.+)/i; // Example: "לתואר מוסמך ב[Degree Name]"

    // Regex to identify a course line and capture its parts.
    // This is highly dependent on the text extraction order and spacing.
    // Assuming structure: Course Name | Points | Grade | Semester (Hebrew RTL means semester might appear first in string)
    // A more robust approach might involve looking for specific keywords or anchors for each field if simple regex fails.
    // Example structure from image (RTL): מקצוע (course name) | ניקוד (points) | ציון (grade) | סמסטר (semester)
    // When extracted as LTR string, semester might be first or last depending on line breaks and bidi algo.
    // Let's assume for now a line could look like: [Semester] [Grade] [Points] [Course Name]
    // OR [Course Name] [Points] [Grade] [Semester]
    // This will need significant testing and refinement with actual extracted text.
    const courseLineRegex = /^(.+?)\s+(\d(?:\.\d)?)\s+([\d\w\s-֐-׿]+?)\s+((?:אביב|חורף|קיץ)\s+\S+\s+\d{4}-\d{4}|.+)$/i;
    // Explanation of a *very* hypothetical courseLineRegex (needs heavy adjustment):
    // (.+?)                     - Group 1: Course Name (non-greedy match of any chars)
    // \s+                       - Space(s)
    // (\d(?:\.\d)?)            - Group 2: Points (digit, optionally with .digit)
    // \s+                       - Space(s)
    // ([\d\w\s-֐-׿]+?) - Group 3: Grade (digits, words, spaces, Hebrew chars, non-greedy)
    // \s+                       - Space(s)
    // ((?:אביב|חורף|קיץ)\s+\S+\s+\d{4}-\d{4}|.+) - Group 4: Semester (specific format or fallback)

    lines.forEach(line => {
        // Attempt to find degree
        const degreeMatch = line.match(degreeRegex);
        if (degreeMatch && degreeMatch[1]) {
            degreeName = degreeMatch[1].trim();
            console.log(`Found degree: ${degreeName}`);
        }

        // Attempt to find courses (this is a placeholder and will likely need a more sophisticated approach)
        // For now, let's assume course lines are identifiable and we are trying to match the structure.
        // A better way might be to identify table boundaries first.
        // The regex below is a *very* rough guess and will need to be built based on actual output
        // E.g. Looking for lines that have a year range typical of semesters
        if (/\d{4}-\d{4}/.test(line)) { // Very simple check if line might be a course
            // This is where the complex regex for course line would be tried
            // const courseMatch = line.match(courseLineRegex);
            // if (courseMatch) {
            //     courses.push({
            //         name: courseMatch[1]?.trim(), // Adjust indices based on actual regex
            //         points: courseMatch[2]?.trim(),
            //         grade: courseMatch[3]?.trim(),
            //         semester: courseMatch[4]?.trim()
            //     });
            // }
            // For now, just log potential course lines for inspection
            console.log("Potential course line: ", line);
        }
    });

    // Placeholder: Manually add a dummy course if none found, for testing display
    if (courses.length === 0 && lines.length > 0) {
        courses.push({
            name: "Placeholder Course - Check Regex",
            points: "0",
            grade: "N/A",
            semester: "Parsing Incomplete"
        });
    }

    console.log("Parsing complete. Degree:", degreeName, "Courses found:", courses.length);
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