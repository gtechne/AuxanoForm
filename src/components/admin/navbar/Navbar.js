import React from "react";
import { useSelector } from "react-redux";
import { NavLink } from "react-router-dom";
import { selectUserName } from "../../../redux/slice/authSlice";
import styles from "./Navbar.module.scss";
import { FaUserCircle } from "react-icons/fa";

const activeLink = ({ isActive }) => (isActive ? `${styles.active}` : "");

const Navbar = () => {
  const userName = useSelector(selectUserName);

  return (
    <div className={styles.navbar}>
      <div className={styles.user}>
        <FaUserCircle size={40} color="#fff" />
        <h4>{userName}</h4>
      </div>
      <nav>
        <ul>
          
          
          <li>
            <NavLink to="/admin/teacherpanel" className={activeLink}>
             Add Course
            </NavLink>
          </li>
          <li>
            <NavLink to="/admin/coursemanagement" className={activeLink}>
              Course Management
            </NavLink>
          </li>
          <li>
            <NavLink to="/admin/question" className={activeLink}>
              Set Question
            </NavLink>
          </li>
          <li>
            <NavLink to="/admin/managequestion" className={activeLink}>
              Manage Questions
            </NavLink>
          </li>
          <li>
            <NavLink to="/admin/form" className={activeLink}>
              Answers
            </NavLink>
          </li>
         
        </ul>
      </nav>
    </div>
  );
};

export default Navbar;
