import React from "react";
import { Route, Routes } from "react-router-dom";
import Home from "../../components/admin/home/Home";
import Navbar from "../../components/admin/navbar/Navbar";

import styles from "./Admin.module.scss";
import Question from "../../components/admin/quetion/Question";

import AnswerPage from "../../components/admin/form/Form";
import ManageQuestions from "../../components/admin/quetion/managequestion/ManageQuestions";
import AnswerDetailPage from "../../components/admin/answerdetails/AnswerDetailPage";
import Teacher from "../../components/admin/teacher/Teacher";
import TeacherPanel from "../../components/admin/teacher/TeacherPanel";
import CourseManagement from "../../components/admin/coursemanagement/CourseManagement";
import EditCourse from "../../components/admin/editcourse/EditCourse";

const Admin = () => {
  return (
    <div className={styles.admin}>
      <div className={styles.navbar}>
        <Navbar />
      </div>
      <div className={styles.content}>
        <Routes>
          <Route path="home" element={<Home />} />
          <Route path="teacher" element={<Teacher />} />
          <Route path="teacherpanel" element={<TeacherPanel />} />
          <Route path="managequestion" element={<ManageQuestions />} />
          <Route path="coursemanagement" element={<CourseManagement />} />
          <Route path="/edit-course/:courseId" element={<EditCourse />} />
          <Route path="question" element={<Question/>}/>
          <Route path="/answer-detail/:submissionId" element={<AnswerDetailPage />} />
          <Route path="form" element={<AnswerPage/>}/>
          
          
        </Routes>
      </div>
    </div>
  );
};

export default Admin;
