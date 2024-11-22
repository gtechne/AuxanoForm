import React,{useEffect} from 'react'

import Answer from '../../components/admin/answer/Answer'


const Home = () => {
  const url = window.location.href;
  
  useEffect(() => {
    const scrollToProducts = () => {
      if (url.includes("#products")) {
        window.scrollTo({
          top: 700,
          behavior: "smooth",
        });
        return;
      }
    };
    scrollToProducts();
  }, [url]);
  return (
    <div>
      <Answer/>
      
    </div>
  )
}

export default Home
