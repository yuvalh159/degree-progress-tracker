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

function DegreeProgressAppContent() {
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

  return (
    <div className="google-container py-4">
      <SemesterConfirmationModal
        semesterToDelete={semesterToDelete}
        onConfirm={performSemesterDelete}
        onCancel={() => setSemesterToDelete(null)}
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
        setShowReqEditor={setShowReqEditor}
        setShowDegreeManagerModal={setShowDegreeManagerModal}
      />

      <SummaryStats
        gpa={gpa}
        summary={summary}
        categories={categories}
      />

      <div className="space-y-3">
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
  const [showSignup, setShowSignup] = useState(false);
  const { currentUser } = useAuth(); // Get the currently logged-in user

  const handleSwitchToLogin = () => setShowSignup(false);
  const handleSwitchToSignup = () => setShowSignup(true);

  // Logic for rendering content based on authentication and verification status
  const renderContent = () => {
    // Not logged in - show login or signup
    if (!currentUser) {
      return showSignup ? (
        <Signup onSwitchToLogin={handleSwitchToLogin} />
      ) : (
        <Login onSwitchToSignup={handleSwitchToSignup} />
      );
    }

    // Logged in but email not verified
    if (!currentUser.emailVerified) {
      return <EmailVerification />;
    }

    // Logged in and verified - show the main app
    return <DegreeProgressAppContent />;
  };

  return (
    <div className="app">
      {renderContent()}
    </div>
  );
}

