import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { db } from "../../../firebase/config";
import { collection, getDocs, deleteDoc, doc } from "firebase/firestore";
import { toast } from "react-toastify";
import "./CourseManagement.scss";

const CourseManagement = () => {
  const [courses, setCourses] = useState([]);

  const fetchCourses = async () => {
    const querySnapshot = await getDocs(collection(db, "courses"));
    const coursesData = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    setCourses(coursesData);
  };

  const handleDelete = async (id) => {
    try {
      await deleteDoc(doc(db, "courses", id));
      toast.success("Course deleted successfully!");
      fetchCourses();
    } catch (error) {
      console.error(error);
      toast.error("Failed to delete the course.");
    }
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  return (
    <div className="course-management">
      <h2>Course Management</h2>
      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Title</th>
              <th>Description</th>
              <th>Chapters</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {courses.map((course) => (
              <tr key={course.id}>
                <td>{course.title}</td>
                <td>{course.description}</td>
                <td>{course.chapters.length}</td>
                <td>
                  <Link to={`/admin/edit-course/${course.id}`} className="edit-btn">
                    Edit
                  </Link>
                  <button
                    onClick={() => handleDelete(course.id)}
                    className="delete-btn"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default CourseManagement;
