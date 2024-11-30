import React from "react";
import AddCourseForm from "./AddCourseForm";
import StudentManagement from "../student/StudentManagement";
import "./TeacherPanel.scss";

const TeacherPanel = () => {
  return (
    <div className="teacher-panel">
      <h1>Teacher Panel</h1>
      
      <AddCourseForm />
      <StudentManagement />
    </div>
  );
};

export default TeacherPanel;
