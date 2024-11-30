import React, { useState, useEffect } from "react";
import { db } from "../../../firebase/config";
import { collection, getDocs, doc, updateDoc } from "firebase/firestore";
import "./studentManage.scss";

const StudentManagement = () => {
  const [students, setStudents] = useState([]);

  useEffect(() => {
    const fetchStudents = async () => {
      const studentSnapshot = await getDocs(collection(db, "students"));
      const studentList = studentSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setStudents(studentList);
    };

    fetchStudents();
  }, []);

  const toggleStudentStatus = async (studentID, isActive) => {
    const studentRef = doc(db, "students", studentID);
    await updateDoc(studentRef, { active: !isActive });
    setStudents((prev) =>
      prev.map((student) =>
        student.id === studentID ? { ...student, active: !isActive } : student
      )
    );
  };

  return (
    <div className="student-management">
      <h2>Manage Students</h2>
      <ul>
        {students.map((student) => (
          <li key={student.id}>
            <span>{student.name}</span>
            <button
              onClick={() => toggleStudentStatus(student.id, student.active)}
              className={student.active ? "deactivate" : "activate"}
            >
              {student.active ? "Deactivate" : "Activate"}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default StudentManagement;
