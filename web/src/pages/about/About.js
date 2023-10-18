import { useContext } from "react";
import "./About.css";

import { GlobalContext } from "../../context/Context";


const About = () =>{

    const {state, dispatch} = useContext(GlobalContext);
    return(
        <div>
            <h1>About Page</h1>
            <div>{JSON.stringify(state)}</div>
        </div>
    )
}
export default About 