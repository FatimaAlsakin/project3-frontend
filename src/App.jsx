import { useEffect, useState } from "react";
import { Navigate, Route, Routes } from "react-router";
import Navbar from "./components/Navbar";
import SignupPage from "./pages/SignupPage";
import Homepage from "./pages/Homepage";
import SignInPage from "./pages/SigninPage";
import Dashboard from "./pages/Dashboard";
import { logout } from "./services/authService";
import AllCases from "./pages/case/AllCases";
import CaseDetail from "./pages/case/CaseDetails";
import CreateCase from "./pages/case/CreateCase";

function App() {
  function  getUserFromToken (){
    const token = localStorage.getItem("token");

    if (!token) return null;

    return JSON.parse(atob(token.split(".")[1]));
  };


  const [user, setUser] = useState(getUserFromToken());

  function handleLogout() {
    logout();
    setUser(null);
  }

  return (
    <div>
      <Navbar user={user} handleLogout={handleLogout} />
      <Routes>
        <Route path="/" element={<Homepage />} />
        <Route path="/sign-up" element={<SignupPage />} />
        <Route path="/sign-in" element={<SignInPage setUser={setUser} />} />
        <Route
          path="/dashboard"
          element={user ? <Dashboard user={user} /> : <Navigate to="/sign-in" />}
        />
        <Route path="/cases" element={<AllCases/>}/>
        <Route path="/case/:cId" element={<CaseDetail  user={user} />}/>
        <Route path="/case/create" element={user ? <CreateCase user={user} /> : <Navigate to="/sign-in" />} />
      </Routes>
    </div>
  );
}

export default App;
