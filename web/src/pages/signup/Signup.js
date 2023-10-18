import { useRef, useState, useEffect, useContext } from "react";
import axios from "axios";
import "./Signup.css";
import { baseUrl } from "../../core";

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
    <div className="container">
      <div className="first-child">
        <div className="app-name">Social Media App</div>
        <p className="app-text">Social Media App helps you connect and<br />share with the people.</p>
      </div>
      <div className="second-child">
        <form id="signup" onSubmit={SignupSubmitHandler}>
          <label htmlFor="firstNameInput">FirstName:</label>
          <input
            ref={firstNameInputRef}
            type="text"
            autoComplete="given-name"
            name="firstNameInput"
            id="firstNameInput"
            required
          />

          <br />
          <label htmlFor="lastNameInput">LastName:</label>
          <input
            ref={lastNameInputRef}
            type="text"
            autoComplete="family-name"
            name="lastNameInput"
            id="lastNameInput"
            required
          />

          <br />
          <label htmlFor="emailInput">Email:</label>
          <input
            ref={emailInputRef}
            type="email"
            autoComplete="email"
            name="emailInput"
            id="emailInput"
            required
          />

          <br />
          <label htmlFor="passwordInput">Password:</label>
          <input
            ref={passwordInputRef}
            type="password"
            autoComplete="new-password"
            name="passwordInput"
            id="passwordInput"
            required
          />

          <br />
          <label htmlFor="repeatpasswordInput">Repeat Password:</label>
          <input
            ref={repeatPasswordInputRef}
            type="password"
            autoComplete="new-password"
            name="repeatpasswordInput"
            id="repeatpasswordInput"
          />
          <p
            className={`errorMessage ${passwordErrorClass}`}
            id="passwordError"
          >
            Password Does Not Match !
          </p>

          <br />

          <button type="submit">Sign Up</button>

          <div className="alertMessage">{alertMessage}</div>
          <div className="errorMessage">{errorMessage}</div>
        </form>
      </div>
    </div>
  );
};
export default Signup;