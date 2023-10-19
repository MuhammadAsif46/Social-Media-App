import "./App.css";
import { Routes, Route, Link, Navigate } from "react-router-dom";

import Home from "./pages/home/Home";
import About from "./pages/about/About";
import Chat from "./pages/chat/Chat";
import Login from "./pages/login/Login";
import Signup from "./pages/signup/Signup";
import Profile from "./pages/profile/Profile";
import profileImg1 from "./assets/my-image.jpg";
import { useEffect, useState, useContext } from "react";
import axios from "axios";
import splashScreen from "./assets/splash.gif";

import { GlobalContext } from "./context/Context";

import { baseUrl } from "./core";

const App = () => {
  const { state, dispatch } = useContext(GlobalContext);

  useEffect(() => {
    axios.interceptors.request.use(
      function (config) {
        console.log(config);

        config.withCredentials = true;
        // Do something before request is sent
        return config;
      },
      function (error) {
        // Do something with request error
        return Promise.reject(error);
      }
    );
  }, []);

  useEffect(() => {
    const checkLoginStatus = async () => {
      try {
        const response = await axios.get(`${baseUrl}/api/v1/profile`, {
          withCredentials: true,
        });
        dispatch({
          type: "USER_LOGIN",
          payload: response.data.data,
        });
      } catch (err) {
        console.log(err);
        dispatch({
          type: "USER_LOGOUT",
        });
      }
    };

    checkLoginStatus();
  }, []);

  const logoutHandler = async () => {
    try {
      await axios.post(
        `${baseUrl}/api/v1/logout`,
        {},
        {
          withCredentials: true,
        }
      );
      dispatch({
        type: "USER_LOGOUT",
      });
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <div className="App">
      {/* admin routes */}
      {state.isLogin === true && state.role === "admin" ? (
        <>
          <nav>
            <ul>
              <li>
                <Link to={`/`}> Admin Home</Link>
              </li>
              <li>
                <Link to={`/profile/${state.user._id}`}> Admin Profile</Link>
              </li>
              <li>
                <Link to={`/chat`}> Admin Chat</Link>
              </li>
              <li>
                <Link to={`/about`}> Admin About</Link>
              </li>
            </ul>
            <div>
              {state.user.email}
              <button onClick={logoutHandler}>logout</button>
            </div>
          </nav>

          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="about" element={<About />} />
            <Route path="chat" element={<Chat />} />
            <Route path="profile/:userId" element={<Profile />} />

            <Route path="*" element={<Navigate to="/" replace={true} />} />
          </Routes>
        </>
      ) : null}

      {/* user routes */}
      {state.isLogin === true && state.role === "user" ? (
        <>
          <nav className="home-page-header">
            <div className="home-first-child">
              <ul className="nav-bar">
                <li style={{ display: "flex" }}>
                  <Link
                    class="btn btn-outline-primary home-page-navBar"
                    to={`/`}
                  >
                    Home
                  </Link>
                </li>
                <li>
                  <Link
                    class="btn btn-outline-primary home-page-navBar"
                    to={`/profile/${state.user._id}`}
                  >
                    Profile
                  </Link>
                </li>
                <li>
                  <Link
                    class="btn btn-outline-primary home-page-navBar"
                    to={`/chat`}
                  >
                    Chat
                  </Link>
                </li>
                <li>
                  <Link
                    class="btn btn-outline-primary home-page-navBar"
                    to={`/about`}
                  >
                    About
                  </Link>
                </li>
              </ul>
            </div>
            <div className="home-second-child">
              <div>{state.user.email}</div>
              <div>
                <button
                  class="btn btn-outline-danger logoutBtn"
                  onClick={logoutHandler}
                >
                  logout
                </button>
              </div>
            </div>
          </nav>
          <hr />
          <Routes>
            <Route
              path="/"
              element={
                <Home
                  profileImg={profileImg1}
                  name="Muhammad Asif"
                  date="12-Jan-2022 3:50 pm"
                />
              }
            />
            <Route path="about" element={<About />} />
            <Route path="chat" element={<Chat />} />
            <Route path="profile/:userId" element={<Profile />} />

            <Route path="*" element={<Navigate to="/" replace={true} />} />
          </Routes>
        </>
      ) : null}

      {/* unAuth routes */}
      {state.isLogin === false ? (
        <>
          {/* <nav>
            <ul className="nav-bar">
              <li>
                <Link class="btn btn-outline-primary login-page-navBar" to={`/login`}>Login</Link>
              </li>
              <li>
                <Link class="btn btn-outline-primary login-page-navBar" to={`/signup`}>Signup</Link>
              </li>
            </ul>
          </nav> */}

          <Routes>
            <Route path="login" element={<Login />} />
            <Route path="signup" element={<Signup />} />
            <Route path="profile/:userId" element={<Profile />} />

            <Route path="*" element={<Navigate to="/login" replace={true} />} />
          </Routes>
        </>
      ) : null}

      {/* unsplash routes */}
      {state.isLogin === null ? (
        <div>
          <img src={splashScreen} alt="splash screen" />
        </div>
      ) : null}
    </div>
  );
};

export default App;
