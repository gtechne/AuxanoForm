import { BrowserRouter, Route, Routes } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {Home,Login,Register, Reset, Admin} from "./pages/index"
import {Header, Footer } from "./components/index"
import AdminOnlyRoute from "./components/adminOnlyRoute/AdminOnlyRoute";
import NotFound from "./pages/notFound/NotFound";
import Career from "./pages/career/Career";
import TeacherPanel from "./components/admin/teacher/TeacherPanel";
import StudentDashboard from "./pages/career/StudentDashboard";

function App() {
  return (
    <>
     <BrowserRouter>
     <ToastContainer />
       <Header/>
       <Routes>
        <Route path="/" element={<Home/>}/>
        
        <Route path="/career" element={<Career/>}/>
        <Route path="/teacherpanel" element={<TeacherPanel/>}/>
        <Route path="/Student" element={<StudentDashboard/>}/>
        <Route path="/login" element={<Login/>}/>
        <Route path="/register" element={<Register/>}/>
        <Route path="/reset" element={<Reset/>}/>
        
        <Route
            path="/admin/*"
            element={
              <AdminOnlyRoute>
                <Admin />
              </AdminOnlyRoute>
            }
          />


         
          <Route path="*" element={<NotFound />} />
        
       </Routes>
       <Footer/>

     </BrowserRouter>
    </>
  );
}

export default App;
