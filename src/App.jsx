import React, { useState, useMemo, useEffect, useCallback } from "react";
import {
  SEMESTER_OPTIONS, // eslint-disable-line no-unused-vars
  CATEGORY_COLORS,
  ELECTIVE_CATEGORIES, // eslint-disable-line no-unused-vars
  INITIAL_DEGREE_PROFILES,
  DEFAULT_PROFILE,
} from "./constants";
import Stat from "./components/Stat";
import useProgress from "./hooks/useProgress";
import Header from "./components/Header";
import SemesterConfirmationModal from "./components/SemesterConfirmationModal";
import RequirementsEditorModal from "./components/RequirementsEditorModal";
import SummaryStats from "./components/SummaryStats";
import SemesterCard from "./components/SemesterCard";
import AddSemesterForm from "./components/AddSemesterForm";
import Footer from "./components/Footer";
import DegreeManagerModal from "./components/DegreeManagerModal";
import Login from "./components/auth/Login";
import Signup from "./components/auth/Signup";
import EmailVerification from "./components/auth/EmailVerification";
import { useAuth } from './context/AuthContext';
import { auth, db } from "./firebaseConfig";
import { doc, getDoc, setDoc } from "firebase/firestore";
import PdfUpload from "./components/PdfProcessor/PdfUpload";
import TourGuide from "./components/TourGuide";

// Helper function to load JSON objects/arrays from localStorage
const loadJsonFromLocalStorage = (key, defaultValue) => {
  try {
    const storedValue = localStorage.getItem(key);
    return storedValue ? JSON.parse(storedValue) : defaultValue;
  } catch (error) {
    console.error(`Error loading JSON for key '${key}' from localStorage:`, error);
    // Attempt to clear the corrupted item to prevent repeated errors
    // localStorage.removeItem(key); // Optional: uncomment to clear corrupted item
    return defaultValue;
  }
};

// --- Firestore Helper Functions ---
const saveUserAppState = async (userId, appState) => {
  if (!userId) return;
  try {
    const userDocRef = doc(db, "userAppData", userId);
    await setDoc(userDocRef, appState);
    // console.log("App state saved to Firestore for UID:", userId);
  } catch (error) {
    console.error("Error saving app state to Firestore:", error);
    // Optionally, notify the user or implement a retry mechanism
  }
};

const loadUserAppState = async (userId) => {
  if (!userId) return null;
  try {
    const userDocRef = doc(db, "userAppData", userId);
    const docSnap = await getDoc(userDocRef);
    if (docSnap.exists()) {
      // console.log("App state loaded from Firestore for UID:", userId);
      return docSnap.data();
    } else {
      // console.log("No data found in Firestore for UID:", userId);
      return null;
    }
  } catch (error) {
    console.error("Error loading app state from Firestore:", error);
    return null; // Or re-throw, or return a specific error object
  }
};

function DegreeProgressAppContent({ isGuest, exitGuestMode }) {
  const { currentUser } = useAuth();

  // State for degree profiles
  const [degreeProfiles, setDegreeProfiles] = useState(() => loadJsonFromLocalStorage("degreeProfiles", INITIAL_DEGREE_PROFILES));

  // State for the currently selected profile
  const [currentProfile, setCurrentProfile] = useState(() => {
    const savedProfile = localStorage.getItem("currentProfile");
    const initialProfiles = loadJsonFromLocalStorage("degreeProfiles", INITIAL_DEGREE_PROFILES); // Use loader here too
    if (savedProfile && initialProfiles[savedProfile]) {
      return savedProfile;
    }
    return Object.keys(initialProfiles)[0] || DEFAULT_PROFILE;
  });

  const [requirements, setRequirements] = useState(() => degreeProfiles[currentProfile] || {});
  const [courses, setCourses] = useState(() => loadJsonFromLocalStorage("courses", []));
  const [semesters, setSemesters] = useState(() => loadJsonFromLocalStorage("semesters", []));

  const [newSem, setNewSem] = useState("");
  const [showReqEditor, setShowReqEditor] = useState(false);
  const [semesterToDelete, setSemesterToDelete] = useState(null);
  const [categories, setCategories] = useState(Object.keys(requirements));
  const [newCategoryName, setNewCategoryName] = useState("");
  const [newCategoryValue, setNewCategoryValue] = useState(0);
  const [showDegreeManagerModal, setShowDegreeManagerModal] = useState(false);
  const [shouldRunTour, setShouldRunTour] = useState(false); // New state for tour control

  const HEBREW_SEMESTER_ALPHABET = [
    "א", "ב", "ג", "ד", "ה", "ו", "ז", "ח", "ט", "י",
    "יא", "יב", "יג", "יד", "טו", "טז", "יז", "יח", "יט", "כ",
    "כא", "כב", "כג", "כד", "כה", "כו", "כז", "כח", "כט", "ל"
  ];

  function getChronologicalSortKey(pdfSemesterName) {
    // console.log(`[SortKey] Input: "${pdfSemesterName}"`); // Log input
    if (typeof pdfSemesterName !== 'string') {
      // console.log("[SortKey] Not a string, returning default.");
      return '9999-9';
    }

    const yearMatch = pdfSemesterName.match(/^(\d{4})-\d{4}/);
    const year = yearMatch ? parseInt(yearMatch[1], 10) : 9999;
    // console.log(`[SortKey] Extracted year: ${year}`);

    let seasonOrder = 9; // Default for unknown seasons
    if (pdfSemesterName.includes("חורף")) {
      seasonOrder = 1;       // Winter
      // console.log("[SortKey] Season: חורף (1)");
    } else if (pdfSemesterName.includes("אביב")) {
      seasonOrder = 2;  // Spring
      // console.log("[SortKey] Season: אביב (2)");
    } else if (pdfSemesterName.includes("קיץ")) {
      seasonOrder = 3;   // Summer
      // console.log("[SortKey] Season: קיץ (3)");
    } else {
      // console.log("[SortKey] Season: Unknown (9)");
    }

    const key = `${year}-${seasonOrder}`;
    // console.log(`[SortKey] Generated key: "${key}" for input "${pdfSemesterName}"`);
    return key;
  }

  // Hoisted function definition for makeCourse
  function makeCourse(semester) {
    return {
      id: `${Date.now()}-${Math.random()}`,
      name: "",
      category: (requirements && Object.keys(requirements).length > 0 ? Object.keys(requirements)[0] : "חובה"),
      credits: 0,
      grade: null,
      status: "planned",
      semester,
      isEditing: true
    };
  }

  // Function to handle data parsed from PDF
  const handlePdfDataParsed = (parsedData) => {
    if (!parsedData || !parsedData.courses) {
      console.error("No parsed data or courses received from PDF.");
      return;
    }

    console.log("App.jsx: Received parsed data from PDF:", parsedData);
    const { degreeName: parsedDegreeName, courses: parsedCourses } = parsedData;

    // 1. Determine Semester Mapping
    const uniqueRawSemesters = [...new Set(parsedCourses.map(pc => pc.semester).filter(s => s && s !== "N/A"))];
    // console.log("[PDF Import] Raw unique semesters from PDF:", uniqueRawSemesters);
    // Forcing individual logging if the above is not fully expanded in console:
    // uniqueRawSemesters.forEach((item, index) => console.log(`[PDF Import] Raw unique item ${index}: ${item}`));

    uniqueRawSemesters.sort((a, b) => {
      const keyA = getChronologicalSortKey(a);
      const keyB = getChronologicalSortKey(b);
      return keyA.localeCompare(keyB);
    });
    // console.log("[PDF Import] Sorted raw unique semesters:", uniqueRawSemesters);
    // Forcing individual logging:
    // uniqueRawSemesters.forEach((item, index) => console.log(`[PDF Import] Sorted raw item ${index}: ${item}`));

    const semesterNameMap = {};
    uniqueRawSemesters.forEach((rawName, index) => {
      if (index < HEBREW_SEMESTER_ALPHABET.length) {
        semesterNameMap[rawName] = `סמסטר ${HEBREW_SEMESTER_ALPHABET[index]}`;
      } else {
        semesterNameMap[rawName] = `סמסטר ${index + 1}`; // Fallback for more than 30 semesters
      }
    });
    // console.log("[PDF Import] Semester name map:", semesterNameMap);

    // 2. Transform parsed courses
    const newCourses = parsedCourses.map(pc => {
      let status = "planned";
      let numericGrade = null; // Temp variable to hold parsed numeric grade
      const credits = parseFloat(pc.points) || 0;
      let finalGradeRepresentation = pc.grade; // What we'll store in the course object

      if (pc.grade) {
        const parsedNumGradeAttempt = parseFloat(pc.grade);
        if (!isNaN(parsedNumGradeAttempt)) { // It's a number
          numericGrade = parsedNumGradeAttempt;
          finalGradeRepresentation = numericGrade; // Store the number
          if (numericGrade >= 55) { // Assuming 55 is passing
            status = "completed";
          } else {
            status = "planned"; // Failing numeric grades are kept as planned for now
          }
        } else { // It's text
          const trimmedGradeText = pc.grade.trim();
          // List of textual grades that signify completion but don't go into GPA
          const binaryStatusGrades = ["עובר", "פטור", "פטור ללא ניקוד", "פטור עם ניקוד"];
          if (binaryStatusGrades.includes(trimmedGradeText)) {
            status = "binary";
            // finalGradeRepresentation remains the original text (pc.grade)
          }
          // Any other unrecognised text grade will keep status as "planned"
          // and finalGradeRepresentation as the original text.
        }
      }

      // If status is completed, ensure grade is set appropriately for GPA calculation later if needed
      // For text grades that mean completion but have no numeric value for GPA, grade remains as text or null.
      // The useProgress hook handles numeric and non-numeric grades differently.

      return {
        id: `${Date.now()}-${Math.random()}-${pc.code}`, // More unique ID
        name: pc.name,
        category: "לא מסווג", // Changed category
        credits: credits,
        grade: finalGradeRepresentation, // Store numeric if available, else text
        status: status,
        semester: semesterNameMap[pc.semester] || pc.semester, // Use mapped name, fallback to original if somehow not in map
        isEditing: false, // Imported courses are not in editing mode
      };
    });

    // 3. Extract and update semesters state with new sequential names
    const finalSemesterNames = uniqueRawSemesters.map(rawName => semesterNameMap[rawName]);
    // console.log("[PDF Import] Final sequential semester names to be set:", finalSemesterNames);
    // Forcing individual logging:
    // finalSemesterNames.forEach((item, index) => console.log(`[PDF Import] Final sequential item ${index}: ${item}`));

    setSemesters(prevSemesters => {
      // We replace semesters based on the PDF, but could merge if needed
      // For now, let's ensure order from PDF is preserved if merging.
      // Simplest: just use the new sorted list from the PDF.
      // If prevSemesters had manually added ones, this will overwrite.
      // Consider a more sophisticated merge if manual semesters should be kept.
      return finalSemesterNames;
    });

    // 4. Replace existing courses with the new, transformed courses
    // Consider adding a confirmation step here in a real app
    setCourses(newCourses);
    console.log("App.jsx: Updated courses and semesters based on PDF data.", newCourses, finalSemesterNames);

    // Optional: Handle degreeName - e.g., suggest creating/switching profile
    // For now, we just log it. User might need to manually ensure they are on the correct profile.
    if (parsedDegreeName && parsedDegreeName !== "Not Found") {
      // Check if the currentProfile's name is different or if a profile with parsedDegreeName exists
      const currentProfileDisplayName = Object.keys(degreeProfiles).find(key => key === currentProfile) || currentProfile;

      if (currentProfileDisplayName !== parsedDegreeName) {
        // Check if a profile with parsedDegreeName exists
        if (degreeProfiles[parsedDegreeName]) {
          // A profile with the parsed name already exists.
          // Potentially ask user if they want to switch to it.
          // For now, just log.
          console.log(`Parsed degree name "${parsedDegreeName}" matches an existing profile. Consider switching if not already on it.`);
        } else {
          // No profile with the parsed name exists.
          // Potentially ask user if they want to create it or if they want to rename current.
          // For now, just log.
          alert(`המסלול שזוהה בקובץ הוא "${parsedDegreeName}".\\nהמסלול הנוכחי הוא "${currentProfileDisplayName}".\\nהקורסים יובאו למסלול הנוכחי.\\nניתן ליצור מסלול חדש בשם "${parsedDegreeName}" דרך "נהל מסלולים" ולהריץ את הייבוא שוב אם רוצים להפריד.`);
        }
      }
    }
    // Add "מיובא מהקובץ" to categories if it doesn't exist for the current profile
    // This ensures the category is available in dropdowns etc.
    if (currentProfile && requirements && !requirements["לא מסווג"]) {
      const updatedRequirements = {
        ...requirements,
        ["לא מסווג"]: 0 // Default to 0 required, it's just a label
      };
      setDegreeProfiles(prevProfiles => ({
        ...prevProfiles,
        [currentProfile]: updatedRequirements
      }));
    }
  };

  // Combined effect to save state to Firestore or localStorage
  useEffect(() => {
    const appState = {
      degreeProfiles,
      currentProfile,
      courses,
      semesters,
    };

    if (currentUser && currentUser.uid) {
      saveUserAppState(currentUser.uid, appState);
    } else {
      // Save to localStorage if no user is logged in
      try {
        localStorage.setItem("degreeProfiles", JSON.stringify(degreeProfiles));
        localStorage.setItem("currentProfile", currentProfile); // currentProfile is a string
        localStorage.setItem("courses", JSON.stringify(courses));
        localStorage.setItem("semesters", JSON.stringify(semesters));
      } catch (error) {
        console.error("Error saving state to localStorage:", error);
      }
    }
  }, [degreeProfiles, currentProfile, courses, semesters, currentUser]);

  // Effect to LOAD data from Firestore when currentUser changes/logs in OR initialize for new user
  useEffect(() => {
    const manageUserData = async () => {
      if (currentUser && currentUser.uid) {
        // console.log("User logged in. Attempting to load data from Firestore for UID:", currentUser.uid);
        const firestoreData = await loadUserAppState(currentUser.uid);

        if (firestoreData) {
          // console.log("Data loaded from Firestore:", firestoreData);
          setDegreeProfiles(firestoreData.degreeProfiles || INITIAL_DEGREE_PROFILES);

          const loadedProfiles = firestoreData.degreeProfiles || INITIAL_DEGREE_PROFILES;
          const loadedProfileName = firestoreData.currentProfile;

          if (loadedProfileName && loadedProfiles[loadedProfileName]) {
            setCurrentProfile(loadedProfileName);
          } else {
            // Fallback if currentProfile is invalid or missing
            setCurrentProfile(Object.keys(loadedProfiles)[0] || DEFAULT_PROFILE);
          }

          setCourses(firestoreData.courses || []);
          setSemesters(firestoreData.semesters || []);
        } else {
          // console.log("No data in Firestore for this user. Initializing with defaults and saving.");
          // New user or no data: set defaults and save to Firestore
          const defaultAppState = {
            degreeProfiles: { ...INITIAL_DEGREE_PROFILES }, // Use a copy
            currentProfile: DEFAULT_PROFILE,
            courses: [],
            semesters: []
          };
          setDegreeProfiles(defaultAppState.degreeProfiles);
          setCurrentProfile(defaultAppState.currentProfile);
          setCourses(defaultAppState.courses);
          setSemesters(defaultAppState.semesters);
          // This will also trigger the save effect if data is set,
          // but an explicit save might be good for immediate persistence of defaults.
          await saveUserAppState(currentUser.uid, defaultAppState);
          // console.log("Default data saved to Firestore for new user.");
        }
      } else {
        // console.log("User logged out or not yet logged in. Loading from localStorage.");
        // User logged out: load from localStorage (or defaults if localStorage is empty/corrupt)
        const localDegreeProfiles = loadJsonFromLocalStorage("degreeProfiles", INITIAL_DEGREE_PROFILES);
        setDegreeProfiles(localDegreeProfiles);

        const localCurrentProfile = localStorage.getItem("currentProfile");
        if (localCurrentProfile && localDegreeProfiles[localCurrentProfile]) {
          setCurrentProfile(localCurrentProfile);
        } else {
          setCurrentProfile(Object.keys(localDegreeProfiles)[0] || DEFAULT_PROFILE);
        }

        setCourses(loadJsonFromLocalStorage("courses", []));
        setSemesters(loadJsonFromLocalStorage("semesters", []));
      }
    };

    manageUserData();
  }, [currentUser]); // Re-run when user logs in or out

  // Update requirements when currentProfile or degreeProfiles change
  useEffect(() => {
    setRequirements(degreeProfiles[currentProfile] || {});
  }, [currentProfile, degreeProfiles]);

  // Update categories when requirements change
  useEffect(() => {
    setCategories(Object.keys(requirements));
  }, [requirements]);

  // New function to add a custom category to the CURRENT profile's requirements
  const addCustomCategory = () => {
    if (newCategoryName.trim()) {
      const categoryName = newCategoryName.trim();

      // Only add if the category doesn't already exist in the current profile's requirements
      if (!requirements[categoryName]) {
        const updatedRequirements = {
          ...requirements,
          [categoryName]: Number(newCategoryValue)
        };
        // Update the requirements for the current profile within the degreeProfiles state
        setDegreeProfiles(prevProfiles => ({
          ...prevProfiles,
          [currentProfile]: updatedRequirements
        }));
        // setRequirements will update via useEffect on currentProfile/degreeProfiles change

        // Reset the inputs
        setNewCategoryName("");
        setNewCategoryValue(0);
      } else {
        alert("Category already exists in the current profile.");
      }
    }
  };

  const { summary, gpa } = useProgress(courses, requirements);

  const changeProfile = (profileName) => {
    if (degreeProfiles[profileName]) { // Check against stateful degreeProfiles
      setCurrentProfile(profileName);
      // Requirements will be updated by the useEffect that listens to currentProfile changes
    }
  };

  const addSemester = () => {
    if (newSem) {
      const formattedSemName = `סמסטר ${newSem}`;
      setSemesters(prev => prev.includes(formattedSemName) ? prev : [...prev, formattedSemName]);
      setNewSem("");
    }
  };

  const confirmSemesterDelete = sem => {
    setSemesterToDelete(sem);
  };

  const handleSemesterCancelDelete = () => {
    setSemesterToDelete(null);
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
            if (!c.name.trim()) {
              alert("שם הקורס הוא שדה חובה");
              return c;
            }
            if (c.grade !== null && (c.grade < 0 || c.grade > 100)) {
              alert("הציון חייב להיות בין 0 ל-100");
              return c;
            }
            return {
              ...c,
              isEditing: false,
              credits: Number(c.credits),
              name: c.name.trim()
            };
          } else {
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

  // --- Functions for Degree Profile Management ---
  const addDegreeProfile = (newProfileName) => {
    if (!newProfileName.trim()) {
      alert("Profile name cannot be empty.");
      return;
    }
    if (degreeProfiles[newProfileName.trim()]) {
      alert("Profile with this name already exists.");
      return;
    }
    // Initialize new profile with requirements from the current profile (or a default if needed)
    const newProfileRequirements = { ...(degreeProfiles[currentProfile] || INITIAL_DEGREE_PROFILES[DEFAULT_PROFILE]) };
    // Optionally, clear out specific elective values or set to defaults for a new profile
    // For simplicity, we'll copy them as is for now. User can edit later.

    setDegreeProfiles(prevProfiles => ({
      ...prevProfiles,
      [newProfileName.trim()]: newProfileRequirements
    }));
    // Optionally, switch to the new profile
    // setCurrentProfile(newProfileName.trim()); 
  };

  const removeDegreeProfile = (profileNameToRemove) => {
    if (Object.keys(degreeProfiles).length <= 1) {
      alert("Cannot remove the last degree profile.");
      return;
    }
    if (!degreeProfiles[profileNameToRemove]) return;

    const updatedProfiles = { ...degreeProfiles };
    delete updatedProfiles[profileNameToRemove];
    setDegreeProfiles(updatedProfiles);

    // If the current profile was deleted, switch to another one
    if (currentProfile === profileNameToRemove) {
      setCurrentProfile(Object.keys(updatedProfiles)[0]); // Switch to the first available
    }
  };

  // Function to update requirements of a specific profile (can be used by DegreeManagerModal later)
  const updateSpecificProfileRequirements = (profileName, newRequirements) => {
    setDegreeProfiles(prevProfiles => ({
      ...prevProfiles,
      [profileName]: newRequirements
    }));
  };

  // Effect to run the tour once for new users
  useEffect(() => {
    const tourHasBeenSeen = localStorage.getItem('degreeProgressTourSeen');
    if (!tourHasBeenSeen) {
      setShouldRunTour(true);
    }
  }, []);

  const handleStartTourRequest = () => {
    localStorage.removeItem('degreeProgressTourSeen'); // Clear so it feels like a fresh start
    setShouldRunTour(true);
  };

  const handleTourCompletion = () => {
    setShouldRunTour(false);
    // TourGuide component will set 'degreeProgressTourSeen' in localStorage internally upon finish/skip
  };

  const handleHeaderLogout = async () => {
    if (isGuest) {
      // If it's a guest, exiting guest mode effectively takes them to auth screen
      exitGuestMode();
    } else if (currentUser) {
      // Regular logout for registered user (this will be called from Header's own logout)
      // This function in App is more for abstracting what happens on "logout" action from header
      // Actual firebase logout is in AuthContext and called by Header
      // Here, we just ensure guest state is cleared if somehow it was set.
      if (typeof exitGuestMode === 'function') exitGuestMode(); // Clear guest just in case
    }
    // Navigation to auth screen will be handled by App component based on currentUser/isGuest state
  };

  return (
    <div className="min-h-screen bg-stone-50 flex flex-col p-4 font-sans relative">
      <TourGuide
        run={shouldRunTour}
        onComplete={handleTourCompletion}
      />
      <SemesterConfirmationModal
        semesterToDelete={semesterToDelete}
        onConfirm={performSemesterDelete}
        onCancel={handleSemesterCancelDelete}
      />

      <RequirementsEditorModal
        showReqEditor={showReqEditor}
        onClose={() => setShowReqEditor(false)}
        categories={categories}
        requirements={requirements}
        setRequirements={(newReqs) => {
          // This should update the current profile's requirements in degreeProfiles state
          setDegreeProfiles(prev => ({
            ...prev,
            [currentProfile]: newReqs
          }));
        }}
        newCategoryName={newCategoryName}
        setNewCategoryName={setNewCategoryName}
        newCategoryValue={newCategoryValue}
        setNewCategoryValue={setNewCategoryValue}
        addCustomCategory={addCustomCategory}
      />

      <DegreeManagerModal
        showModal={showDegreeManagerModal}
        onClose={() => setShowDegreeManagerModal(false)}
        degreeProfiles={degreeProfiles}
        addProfileFn={addDegreeProfile}
        removeProfileFn={removeDegreeProfile}
      />

      <Header
        currentProfile={currentProfile}
        availableProfiles={Object.keys(degreeProfiles)}
        changeProfile={changeProfile}
        setShowReqEditor={() => setShowReqEditor(true)}
        setShowDegreeManagerModal={() => setShowDegreeManagerModal(true)}
        onStartTourRequest={handleStartTourRequest}
        isGuest={isGuest}
        onLogout={handleHeaderLogout}
      />

      <div className="flex justify-center items-center my-6 pdf-upload-section">
        <PdfUpload onPdfDataParsed={handlePdfDataParsed} />
        <button
          type="button"
          className="ml-2 rtl:mr-2 rtl:ml-0 h-10 w-10 flex items-center justify-center rounded-md bg-teal-600 hover:bg-teal-700 text-white shadow-sm hover:shadow-md focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 transition-colors duration-150"
          onClick={() => alert("יש לצרף גליון ציונים של כלל התואר מאתר sap דרך בקשות")}
        >
          <svg viewBox="0 0 20 20" fill="currentColor" className="h-6 w-6">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
          </svg>
        </button>
      </div>

      <SummaryStats
        gpa={gpa}
        summary={summary}
        categories={categories}
      />

      <div className="space-y-3 w-full semester-cards-container">
        {semesters.map((sem) => (
          <SemesterCard
            key={sem}
            semesterName={sem}
            coursesForSemester={courses.filter(c => c.semester === sem)}
            allCategories={categories}
            addCourseToSemesterFn={addCourse}
            confirmDeleteSemesterFn={confirmSemesterDelete}
            updateCourseFn={updateCourse}
            toggleCourseEditFn={toggleEdit}
            removeCourseFn={removeCourse}
            handleCourseDrop={handleDrop}
            handleCourseDragStart={handleDragStart}
          />
        ))}

        <AddSemesterForm
          newSem={newSem}
          setNewSem={setNewSem}
          addSemester={addSemester}
          SEMESTER_OPTIONS={SEMESTER_OPTIONS}
        />
      </div>

      <Footer />
    </div>
  );
}

export default function App() {
  const { currentUser, loading, isGuest, exitGuestMode } = useAuth(); // Get isGuest and exitGuestMode
  const [showSignup, setShowSignup] = useState(false); // Manages Login vs Signup view

  const handleSwitchToLogin = () => setShowSignup(false);
  const handleSwitchToSignup = () => setShowSignup(true);

  // Main content rendering logic
  const renderContent = () => {
    if (loading) {
      return <div className="flex justify-center items-center min-h-screen">טוען...</div>;
    }

    if (isGuest || (currentUser && currentUser.emailVerified)) {
      return <DegreeProgressAppContent isGuest={isGuest} exitGuestMode={exitGuestMode} />;
    }

    if (currentUser && !currentUser.emailVerified) {
      return <EmailVerification />;
    }

    // Not loading, not guest, no verified user: Show AuthComponent
    return (
      showSignup ?
        <Signup onSwitchToLogin={handleSwitchToLogin} /> :
        <Login onSwitchToSignup={handleSwitchToSignup} />
    );
  };

  return (
    <>
      {renderContent()}
    </>
  );
}

