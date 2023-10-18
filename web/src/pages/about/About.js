import { useContext } from "react";
import "./About.css";
import aboutImage from "../../assets/aboutImage.png";

import { GlobalContext } from "../../context/Context";

const About = () => {
  const { state, dispatch } = useContext(GlobalContext);
  return (
    <div>
      {/* <div>{JSON.stringify(state)}</div> */}
      <br />
      <div className="about">
        <h1>COMING SOON...</h1>
        <h3>About Page</h3>
        <img src={aboutImage} width={500} height={400} alt="about-page" />
      </div>
    </div>
  );
};
export default About;
