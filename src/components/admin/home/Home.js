import React, { useEffect, useState } from "react";
import { db } from "../../../firebase/config";
import { collection, getDocs, doc, updateDoc } from "firebase/firestore";
const Home = () => {
  const [students, setStudents] = useState([]);

  useEffect(() => {
    const fetchStudents = async () => {
      const studentCollection = collection(db, "users");
      const studentSnapshot = await getDocs(studentCollection);
      setStudents(
        studentSnapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id }))
      );
    };
    fetchStudents();
  }, []);

  const toggleActive = async (studentID, isActive) => {
    const studentRef = doc(db, "users", studentID);
    await updateDoc(studentRef, { active: !isActive });
  };
  return (
    <div className="admin-panel">
    <h1>Admin Panel</h1>
    {students.map((student) => (
      <div key={student.id}>
        <p>{student.userName}</p>
        <button onClick={() => toggleActive(student.id, student.active)}>
          {student.active ? "Deactivate" : "Activate"}
        </button>
      </div>
    ))}
  </div>
  );
};

export default Home;
