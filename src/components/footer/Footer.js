import React from 'react'
import styles from "./Footer.module.scss";

const date = new Date();
const year = date.getFullYear();

const Footer = () => {
  return( 
  <>
  <div className={styles.footer}> 
  <div >
    <ul>
      <li>
        <a href="https://facebook.com" target="_blank" rel="noopener noreferrer">Facebook</a></li>
        <li><a href="https://twitter.com" target="_blank" rel="noopener noreferrer">Twitter</a>
        </li><li><a href="https://linkedin.com" target="_blank" rel="noopener noreferrer">LinkedIn</a>
        </li>
    </ul>
        
      </div>
    <div>
    &copy; {year} All Rights Reserve.
    </div>
    
  
  </div>
  
</>
);
};


export default Footer
