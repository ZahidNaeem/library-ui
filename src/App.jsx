import 'bootstrap/dist/css/bootstrap.min.css';
import 'react-toastify/dist/ReactToastify.css';
import {Route, Routes, useLocation, useNavigate} from "react-router-dom";
import Home from "./components/Home";
import About from "./components/About";
import Header from "./components/Header";
import Confirmation from "./components/Confirmation";
import Subjects from "./components/Subjects";
import Authors from "./components/Authors";
import Shelves from "./components/Shelves";
import Login from "./components/Login";
import {toast, ToastContainer} from "react-toastify";
import {isTokenValid, login, logout} from "./api/AuthService";
import CreateUser from "./components/CreateUser";
import {useCallback, useEffect, useMemo, useState} from "react";
import Books from "./components/Books";
import Publishers from "./components/Publishers";
import Researchers from "./components/Researchers";
import Readers from "./components/Readers";
import BookTrans from "./components/BookTrans";

const App = () => {

  const [routes, setRoutes] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();

  const logoutRequest = useCallback(() => {
    logout()
    .then((response) => {
      console.log("Response", response);
      setIsLoggedIn(false);
      navigate("login");
    })
    .catch(e => {
      console.log(e);
      toast.error(e.response.data.message);
      setIsLoggedIn(true);
    });
  }, [navigate]);

  const secureRoutes = useMemo(() => (
      <>
        <Header logout={() => logoutRequest()}/>
        <Routes>
          <Route path="/" element={<Home/>}/>
          <Route path="about" element={<About/>}/>
          <Route path="subjects" element={<Subjects/>}/>
          <Route path="authors" element={<Authors/>}/>
          <Route path="publishers" element={<Publishers/>}/>
          <Route path="researchers" element={<Researchers/>}/>
          <Route path="shelves" element={<Shelves/>}/>
          <Route path="readers" element={<Readers/>}/>
          <Route path="books" element={<Books/>}/>
          <Route path="trans" element={<BookTrans/>}/>
          <Route path="*" element={<h1 className="not-found">Page Not Found</h1>}/>
        </Routes>
      </>
  ), [logoutRequest]);

  const loginRequest = useCallback((loginData) => {
    setIsLoggedIn(false);
    login(loginData)
    .then(response => {
      const data = response.data;
      if(data.success) {
        setIsLoggedIn(true);
        setRoutes(secureRoutes);
        navigate("/");
      }
    })
    .catch(e => {
      console.log(e);
      toast.error(e.response.data.message);
    });
  }, [navigate, secureRoutes]);

  const insecureRoutesMap = useMemo(() => [
    {path: "login", element: <Login loginRequest={(loginData) => loginRequest(loginData)}/>},
    {path: "signup", element: <CreateUser/>},
    {path: "confirmed", element: <Confirmation/>},
    {path: "*", element: <h1 className="not-found">Page Not Found</h1>},
  ], [loginRequest]);

  const navigateToLogin = useCallback(() => {
    const router = insecureRoutesMap.find(route => route.path === "login");
    setRoutes(
        <Routes>
          <Route path={router.path} element={router.element}/>
        </Routes>
    );
    navigate("login");
  }, [insecureRoutesMap, navigate]);

  const updateRoute = useCallback(() => {
    const router = insecureRoutesMap.find(route => "/" + route.path === location.pathname);
    if (router) {
      setRoutes(
          <Routes>
            <Route path={router.path} element={router.element}/>
          </Routes>
      );
    } else {
      if (isLoggedIn) {
        setRoutes(secureRoutes);
      } else {
        navigateToLogin();
      }
    }
  }, [insecureRoutesMap, isLoggedIn, location.pathname, navigateToLogin, secureRoutes]);

  useEffect(() => {
    updateRoute();
  }, [updateRoute]);

  return (
      <>
        {routes}
        <footer>
          <p style={{textAlign: 'center'}}>© Al-Abtaal - All Rights Reserved</p>
        </footer>
        <ToastContainer autoClose={2000}/>
      </>
  );
}

export default App;
