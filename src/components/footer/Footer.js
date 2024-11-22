import React from 'react';
import styles from './Footer.module.scss';
import { Link } from 'react-router-dom';
import blogoImg from '../../assets/auxano-logo-ft.png';
import { FaTwitter, FaFacebook, FaLinkedin, FaInstagram, FaInternetExplorer } from 'react-icons/fa';

const date = new Date();
const year = date.getFullYear();

const Footer = () => {
  return (
    <div className={styles.footer}>
      <div className={styles.footerContent}>
        <div className={styles.logoSection}>
          <Link to="/">
            <img src={blogoImg} alt="Auxano Solar Logo" className={styles.logoImage} />
          </Link>
          <p>
            To become the preferred renewable energy solution provider in Nigeria.<br />
            To make Auxano Solar a household brand in Nigeria and the Western African Region.
          </p>
        </div>

        <div className={styles.socialLinks}>
          <ul>
            <li>
              <a href="https://www.facebook.com/auxanoenergy" target="_blank" rel="noopener noreferrer">
                <FaFacebook /> Facebook
              </a>
            </li>
            <li>
              <a href="https://x.com/auxano_solar?mx=2" target="_blank" rel="noopener noreferrer">
                <FaTwitter /> Twitter
              </a>
            </li>
            <li>
              <a href="https://www.linkedin.com/in/auxanosolar/" target="_blank" rel="noopener noreferrer">
                <FaLinkedin /> LinkedIn
              </a>
            </li>
            <li>
              <a href="https://www.instagram.com/auxano_solar/" target="_blank" rel="noopener noreferrer">
                <FaInstagram /> Instagram
              </a>
            </li>
            <li>
              <a href="https://auxanosolar.com/" target="_blank" rel="noopener noreferrer">
                <FaInternetExplorer /> Auxano web
              </a>
            </li>
          </ul>
        </div>
      </div>

      <div className={styles.footerBottom}>
        &copy; {year} All Rights Reserved.
      </div>
    </div>
  );
};

export default Footer;
