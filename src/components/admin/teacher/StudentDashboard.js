import React, { useState, useEffect } from "react";
import { db } from "../../../firebase/config";
import { collection, doc, getDoc, getDocs, updateDoc } from "firebase/firestore";
import CourseViewer from "./CourseViewer";
import "./StudentDashboard.scss";

const StudentDashboard = () => {
  const [courses, setCourses] = useState([]);
  const [selectedCourseId, setSelectedCourseId] = useState(null);
  const [completedCourses, setCompletedCourses] = useState([]);

  useEffect(() => {
    const fetchCourses = async () => {
      const courseSnapshot = await getDocs(collection(db, "courses"));
      const courseList = courseSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setCourses(courseList);
    };

    fetchCourses();
  }, []);

  useEffect(() => {
  const fetchCompletedCourses = async () => {
    const studentId = "sampleStudentId"; // Replace with logged-in student ID
    const studentRef = doc(db, "students", studentId);
    const studentDoc = await getDoc(studentRef);

    if (studentDoc.exists()) {
      setCompletedCourses(studentDoc.data().completedCourses || []);
    } else {
      console.log("No such student document!");
    }
  };

  fetchCompletedCourses();
}, []);
  const markAsCompleted = async (courseID) => {
    const studentId = "sampleStudentId"; // Replace with logged-in student's ID
    const studentRef = doc(db, "students", studentId);
    const updatedCompletedCourses = [...completedCourses, courseID];

    await updateDoc(studentRef, { completedCourses: updatedCompletedCourses });
    setCompletedCourses(updatedCompletedCourses);
    console.log(`Marked course ${courseID} as completed.`);
  };

  const renderCourseList = () => (
    <ul>
      {courses.map((course) => (
        <li key={course.id} className={completedCourses.includes(course.id) ? "completed" : ""}>
          <h3>{course.title}</h3>
          <p>{course.description}</p>
          <button onClick={() => setSelectedCourseId(course.id)}>
            View Course
          </button>
          {!completedCourses.includes(course.id) && (
            <button onClick={() => markAsCompleted(course.id)}>Mark as Completed</button>
          )}
        </li>
      ))}
    </ul>
  );

  return (
    <div className="student-dashboard">
      <h1>Student Dashboard</h1>
      {selectedCourseId ? (
        <div>
          <button onClick={() => setSelectedCourseId(null)}>Back to Course List</button>
          <CourseViewer courseId={selectedCourseId} />
        </div>
      ) : (
        renderCourseList()
      )}
    </div>
  );
};

export default StudentDashboard;
