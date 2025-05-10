import React, { useState, useEffect } from 'react';
import Joyride, { STATUS, ACTIONS, EVENTS } from 'react-joyride';

// Define tour steps
// We'll use CSS selectors to target elements. Make sure these selectors are unique and stable.
const TOUR_STEPS = [
    {
        target: '.pdf-upload-section',
        content: 'ברוכים הבאים! כאן תוכלו להעלות את קובץ גיליון הציונים שלכם בפורמט PDF. העלאת קובץ תמלא אוטומטית את הקורסים והציונים. ניתן להשתמש באתר גם ללא העלאת קובץ, על ידי הוספה ידנית של סמסטרים וקורסים.',
        placement: 'bottom',
        title: 'העלאת גיליון ציונים',
        disableBeacon: false // Ensure beacon is shown for this first step
    },
    {
        target: '.summary-stats-section',
        content: 'כאן יוצגו נתונים מסכמים כמו ממוצע הציונים וההתקדמות שלכם בכל קטגוריה.',
        placement: 'bottom',
        title: 'סטטיסטיקות התקדמות'
    },
    {
        target: '.semester-cards-container',
        content: 'הסמסטרים והקורסים שלכם יוצגו כאן. תוכלו להוסיף, לערוך ולמחוק אותם.',
        placement: 'top',
        title: 'סמסטרים וקורסים'
    },
    {
        target: '.add-semester-form',
        content: 'מכאן ניתן להוסיף סמסטרים חדשים למעקב.',
        placement: 'top',
        title: 'הוספת סמסטר חדש'
    },
    {
        target: '.header-profile-selector',
        content: 'כאן תוכלו לבחור או לנהל את מסלולי הלימוד השונים שלכם.',
        placement: 'left',
        title: 'בחירת מסלול לימודים'
    },
    {
        target: '.requirements-button', // Assuming you add this class to the "דרישות" button
        content: 'לחצו כאן כדי לנהל את דרישות הנקודות זכות עבור כל קטגוריה במסלול הלימודים הנוכחי.',
        placement: 'left',
        title: 'ניהול דרישות הקטגוריות'
    }
];

const TourGuide = ({ run: runSignal, onComplete }) => {
    const [internalRunTour, setInternalRunTour] = useState(false);
    const [steps] = useState(TOUR_STEPS);

    useEffect(() => {
        // When the runSignal prop becomes true, start the tour.
        if (runSignal) {
            setInternalRunTour(true);
        }
        // We don't automatically set internalRunTour to false if runSignal becomes false,
        // as the tour might be in progress. Completion is handled by the callback.
    }, [runSignal]);

    const handleJoyrideCallback = (data) => {
        const { status, type, action } = data;
        const finishedStatuses = [STATUS.FINISHED, STATUS.SKIPPED];

        if (finishedStatuses.includes(status)) {
            setInternalRunTour(false);
            localStorage.setItem('degreeProgressTourSeen', 'true');
            if (onComplete) onComplete(); // Call the onComplete callback from App.jsx
        } else if (type === EVENTS.STEP_AFTER || type === EVENTS.TARGET_NOT_FOUND) {
            console.log('Joyride event:', data);
        }

        // If the user closes the tour manually using the X button or Esc key
        if (action === ACTIONS.CLOSE) {
            setInternalRunTour(false);
            localStorage.setItem('degreeProgressTourSeen', 'true');
            if (onComplete) onComplete(); // Also call onComplete here
        }
    };

    // If internalRunTour is false, don't render Joyride to ensure it fully resets if re-triggered
    if (!internalRunTour) {
        return null;
    }

    return (
        <Joyride
            steps={steps}
            run={internalRunTour} // Controlled by internal state, triggered by prop
            callback={handleJoyrideCallback}
            continuous={true}
            showProgress={true}
            showSkipButton={true}
            locale={{
                back: 'הקודם',
                close: 'סגור',
                last: 'סיום',
                next: 'הבא',
                open: 'פתח חלון עזרה',
                skip: 'דלג על הסיור',
            }}
            styles={{
                options: {
                    arrowColor: '#fff',
                    backgroundColor: '#fff',
                    primaryColor: '#0d6efd', // A Google-like blue
                    textColor: '#333',
                    zIndex: 10000, // Ensure it's on top of other elements
                },
                tooltip: {
                    borderRadius: '8px',
                    textAlign: 'right', // For RTL
                    fontSize: '15px',
                },
                tooltipContainer: {
                    textAlign: 'right', // For RTL
                },
                tooltipTitle: {
                    textAlign: 'right', // For RTL
                    fontWeight: 'bold',
                    fontSize: '18px',
                },
                buttonNext: {
                    borderRadius: '4px',
                    fontSize: '14px',
                },
                buttonBack: {
                    borderRadius: '4px',
                    fontSize: '14px',
                    marginRight: 'auto', // Push back button to the left for RTL
                },
                buttonSkip: {
                    fontSize: '14px',
                    color: '#666',
                },
                buttonClose: { // Style for the close button (X)
                    position: 'absolute', // Ensure it's absolutely positioned if not already
                    top: '10px',      // Adjust as needed for vertical alignment
                    left: '10px',     // For RTL, this should push it to the far left of the tooltip header
                    right: 'auto',
                    // color: '#333', // Example: change color of X
                },
                overlay: {
                    backgroundColor: 'rgba(0, 0, 0, 0.6)',
                }
            }}
        />
    );
};

export default TourGuide; 