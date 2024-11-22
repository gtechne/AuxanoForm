import React, {useEffect, useState} from 'react'
import styles from "./Header.module.scss"
import { Link, NavLink, useNavigate } from 'react-router-dom';
import {  FaTimes, } from 'react-icons/fa';
import { HiOutlineMenuAlt3 } from 'react-icons/hi';
import { auth } from '../../firebase/config';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { toast } from 'react-toastify';
import { useDispatch } from "react-redux";
import {
  
  REMOVE_ACTIVE_USER,
  SET_ACTIVE_USER,
} from "../../redux/slice/authSlice";
import ShowOnLogin, { ShowOnLogout } from '../hiddenLink/hiddenLink';
import { AdminOnlyLink } from '../adminOnlyRoute/AdminOnlyRoute';
import logoImg from '../../assets/logo1.png';



const logo = (
  <div className={styles.logo}>
    <Link to="/">
      <img src={logoImg} alt="Auxano Solar Logo" />
    </Link>
  </div>
);
const activeLink = ({ isActive }) => (isActive ? `${styles.active}` : "");

const  Header = () => {
  const [showMenu, setShowMenu] = useState(false);
  const [displayName, setdisplayName] = useState("");
  const [scrollPage, setScrollPage] = useState(false);
 // const cartTotalQuantity = useSelector(selectCartTotalQuantity);

  const navigate = useNavigate();
  const dispatch = useDispatch();
  const fixNavbar = () => {
    if (window.scrollY > 50) {
      setScrollPage(true);
    } else {
      setScrollPage(false);
    }
  };
  window.addEventListener("scroll", fixNavbar);

// Monitor currently sign in user
useEffect(() => {
  onAuthStateChanged(auth, (user) => {
    if (user) {
      // console.log(user);
      if (user.displayName == null) {
        const u1 = user.email.substring(0,user.email.indexOf("@"));
        const uName = u1.charAt(0).toUpperCase() + u1.slice(1);
        setdisplayName(uName);
      } else {
        setdisplayName(user.displayName);
      }

      dispatch(
        SET_ACTIVE_USER({
          email: user.email,
          userName: user.displayName ? user.displayName : displayName,
          userID: user.uid,
        })
      );
    } else {
      setdisplayName("");
      dispatch(REMOVE_ACTIVE_USER());
    }
  });
}, [dispatch, displayName]);


  const toggleMenu = () => {
    setShowMenu(!showMenu);
  };

  const hideMenu = () => {
    setShowMenu(false);
  };

  const logoutUser = () => {
    signOut(auth)
      .then(() => {
        toast.success("Logout successfully.");
        navigate("/");
      })
      .catch((error) => {
        toast.error(error.message);
      });
  };

  

  

  return (
    <>
       <header className={scrollPage ? `${styles.fixed}` : null } >
      <div className={styles.header}>
        {logo}
          <nav className={
              showMenu ? `${styles["show-nav"]}` : `${styles["hide-nav"]}`
            }
            >
            <div
            className={
              showMenu
                ? `${styles["nav-wrapper"]} ${styles["show-nav-wrapper"]}`
                : `${styles["nav-wrapper"]}`
            }
            onClick={hideMenu}
            ></div>
            <ul onClick={hideMenu}>
            <li className={styles["logo-mobile"]}>
                {logo}
                <FaTimes size={22} color="#fff" onClick={hideMenu} />
              </li>
              <li>
              <AdminOnlyLink>
                  <Link to="/admin/home">
                    <button className="--btn --btn-primary">Admin</button>
                  </Link>
              </AdminOnlyLink>
              </li>
              <li>
                <NavLink to="/" className={activeLink}>
                  Home
                </NavLink>
              </li>
              <li>
              <ShowOnLogin>
                <NavLink to="/career">
                  Class
                </NavLink>
                </ShowOnLogin>
              </li>
              
            </ul>

            <div className={styles["header-right"]} onClick={hideMenu}>
              <span className={styles.links}>
                  <ShowOnLogout>
                  <NavLink to="/login" className={activeLink}>
                    Login 
                  </NavLink> 
                  </ShowOnLogout>

                 <ShowOnLogin>
                  <NavLink to="/" onClick={logoutUser}>
                   Logout
                  </NavLink>
                  </ShowOnLogin>
              </span>
             
            </div>
          </nav>

          <div className={styles["menu-icon"]}>
            
            <HiOutlineMenuAlt3 size={28} onClick={toggleMenu} />
          </div>
        </div>

      
    </header>
    </>
  )
}

export default Header
