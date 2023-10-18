import { useRef, useState, useEffect, useContext } from "react";
import axios from "axios";
import "./Signup.css";
import { baseUrl } from "../../core";
import { Link } from "react-router-dom";

import { GlobalContext } from "../../context/Context";

const Signup = () => {
  const { state, dispatch } = useContext(GlobalContext);

  const firstNameInputRef = useRef(null);
  const lastNameInputRef = useRef(null);
  const emailInputRef = useRef(null);
  const passwordInputRef = useRef(null);
  const repeatPasswordInputRef = useRef(null);

  const [passwordErrorClass, setPasswordErrorClass] = useState("hidden");
  const [alertMessage, setAlertMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    setTimeout(() => {
      setAlertMessage("");
      setErrorMessage("");
    }, 5000);
  }, [alertMessage, errorMessage]);

  const SignupSubmitHandler = async (e) => {
    e.preventDefault();
    console.log("Signup submit handler");

    if (
      passwordInputRef.current.value !== repeatPasswordInputRef.current.value
    ) {
      setPasswordErrorClass("");
      return;
    } else {
      setPasswordErrorClass("hidden");
    }

    try {
      const response = await axios.post(`${baseUrl}/api/v1/signup`, {
        firstName: firstNameInputRef.current.value,
        lastName: lastNameInputRef.current.value,
        email: emailInputRef.current.value,
        password: passwordInputRef.current.value,
      });

      console.log("resp: ", response.data.message);
      setAlertMessage(response.data.message);
      e.target.reset();
    } catch (e) {
      console.log(e);
      setErrorMessage(e.response.data.message);
    }
  };

  return (
    <div className="container-signup">
      <div className="first-child">
        <div className="app-name">Social Media App</div>
        <p className="app-text">Social Media App helps you connect and<br />share with the people.</p>
      </div>
      <div className="second-child">
        <form id="signup" onSubmit={SignupSubmitHandler}>
          <input
            ref={firstNameInputRef}
            type="text"
            autoComplete="given-name"
            name="firstNameInput"
            id="firstNameInput"
            className="input-fields"
            placeholder="FirstName"
            required
          />

          <br />
          <input
            ref={lastNameInputRef}
            type="text"
            autoComplete="family-name"
            name="lastNameInput"
            id="lastNameInput"
            className="input-fields"
            placeholder="LastName"
            required
          />

          <br />
          <input
            ref={emailInputRef}
            type="email"
            autoComplete="email"
            name="emailInput"
            id="emailInput"
            className="input-fields"
            placeholder="Example@gmail.com"
            required
          />

          <br />
          <input
            ref={passwordInputRef}
            type="password"
            autoComplete="new-password"
            name="passwordInput"
            id="passwordInput"
            className="input-fields"
            placeholder="Password"
            required
          />

          <br />
          <input
            ref={repeatPasswordInputRef}
            type="password"
            autoComplete="new-password"
            name="repeatpasswordInput"
            id="repeatpasswordInput"
            className="input-fields"
            placeholder="Repeat Password"
            required
          />
          <p
            className={`errorMessage ${passwordErrorClass}`}
            id="passwordError"
          >
            Password Does Not Match !
          </p>

          <br />

          <button class="btn btn-primary loginBtn" type="submit">Sign Up</button>
          <br />
          <p style={{textAlign: "center", marginTop: "1rem"}}>Already have an account? </p>
          <hr />
          <div>
          <Link class="btn btn-success newBtn" to={`/login`}> Login </Link></div>

          <div className="alertMessage">{alertMessage}</div>
          <div className="errorMessage">{errorMessage}</div>
        </form>
      </div>
    </div>
  );
};
export default Signup;
