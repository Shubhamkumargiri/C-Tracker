import { Routes, Route } from "react-router-dom";

import Home from "./pages/Home";
import Features from "./pages/Features";
import Pricing from "./pages/Pricing";
import About from "./pages/About";
import Contact from "./pages/Contact";

import Login from "./pages/auth/Login";
import Signup from "./pages/auth/Signup";

import ProtectedRoute from "./components/ProtectedRoute";
import Dashboard from "./pages/dashboard/Dashboard";
import Dhome from "./pages/dashboard/Dhome";  
import Profile from "./pages/dashboard/Profile";
import Analytics from "./pages/dashboard/Analytics";
import Integrations from "./pages/dashboard/Integrations"
import Settings from "./pages/dashboard/Settings";

function App() {
  return (
    <Routes>

      <Route path="/" element={<Home />} />
      <Route path="/features" element={<Features />} />
      <Route path="/pricing" element={<Pricing/>}/>
      <Route path="/about" element={<About/>}/>
      <Route path="/contact" element={<Contact/>}/>

      <Route path="/login" element={<Login/>}/>
      <Route path="/signup" element={<Signup/>}/>
              
              <Route path="/dashboard" element={<ProtectedRoute><Dashboard/></ProtectedRoute>}>
                <Route index element={<Dhome />}/>
                <Route path="dhome" element={<Dhome />}/>
                <Route path="analytics" element={<Analytics/>}/>
                <Route path="profile" element={<Profile/>}/>
                <Route path="integrations" element={<Integrations/>}/>
                <Route path="settings" element={<Settings/>}/>
              </Route>
              

    </Routes>
    
  );
}

export default App;
