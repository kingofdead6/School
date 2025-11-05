import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import HomePage from "./Pages/HomePage";
import AboutPage from "./Pages/AboutPage";
import ProtectedRoute from "./components/Shared/ProtectedRoute";
import ScrollToTop from "./components/Shared/ScrollTop";
import Login from "./components/Auth/Login";
import AdminDashboard from "./components/Admin/AdminDashboard";
import AdminRegistration from "./components/Admin/AdminRegistration";
import AdminStudent from "./components/Admin/AdminStudent";
import AdminGroups from "./components/Admin/AdminGroup";
import AdminTeacher from "./components/Admin/AdminTeacher";
import AdminGrades from "./components/Admin/AdminGrades";
import AdminGallery from "./components/Admin/AdminGallery";
import AdminNewsletter from "./components/Admin/AdminNewsletter";
import AdminAnnouncements from "./components/Admin/AdminAnnoucements";
import AdminContact from "./components/Admin/AdminContact";
import AdminManagement from "./components/Admin/AdminManagement";
import Footer from "./components/Shared/Footer";
import TeacherDashboard from "./components/Teachers/TeacherDashboard";
import TeacherProfile from "./components/Teachers/TeacherProfile";
import TeacherGroups from "./components/Teachers/TeacherGroup";
import TeacherProfiles from "./components/Home/TeacherProfile";
import AdminPrograms from "./components/Admin/AdminPrograms";
import SubmitTestimonialPage from "./components/Home/SubmitTestimonial";
import AdminTestimonials from "./components/Admin/AdminTestimonials";
import StudentRegistrationForm from "./components/Registration/StudentRegistrationForm";


export default function App() {

  return (
    <Router>
       <ScrollToTop />
        
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/teacher/:id" element={<TeacherProfiles />} />
          <Route path="/reviews" element={<SubmitTestimonialPage /> } />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/registration" element={<StudentRegistrationForm />} />
            <Route element={<ProtectedRoute />}>
              <Route path="/admin/dashboard" element={<AdminDashboard />} />
              <Route path="/admin/registrations" element={<AdminRegistration />} />
              <Route path="/admin/students" element={<AdminStudent />} />
              <Route path="/admin/groups" element={<AdminGroups /> }/>
              <Route path="/admin/teachers" element={<AdminTeacher />} />
              <Route path="/admin/grades" element={<AdminGrades />} />
              <Route path="/admin/gallery" element={<AdminGallery />} />
              <Route path="/admin/contact" element={<AdminContact />} />
              <Route path="/admin/newsletter" element={<AdminNewsletter />} />
              <Route path="/admin/announcements" element={<AdminAnnouncements />} />
              <Route path="/admin/admins" element={<AdminManagement />} />
              <Route path="/admin/programs" element={<AdminPrograms />} />
              <Route path="/admin/testimonials" element={<AdminTestimonials />} />

              <Route path="/teacher/dashboard" element={<TeacherDashboard />} />
              <Route path="/teacher/profile" element={<TeacherProfile />} />
              <Route path="/teacher/groups" element={<TeacherGroups />} />
            </Route>

        </Routes>
        <Footer />
    </Router>
  );
}
