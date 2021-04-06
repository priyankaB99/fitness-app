import React from "react";
import fire from "../Firebase/fire";
import "firebase/auth";
import "firebase/database";
import { withRouter } from "react-router-dom";

class MyProfile extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      username: "",
      firstName: "",
      lastName: "",
      bday: "",
      location: "",
      pic: "",
      faves: "",
      goals: "",
    };
  }
  render() {
    return <h2> My Profile</h2>;
  }
}
export default withRouter(MyProfile);
