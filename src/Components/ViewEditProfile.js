import React from "react";
import fire from "../Firebase/fire";
import "firebase/auth";
import "firebase/database";
import { withRouter } from "react-router-dom";
import "../CSS/profile.css";

class ViewEditProfile extends React.Component {
  constructor(props) {
    super(props);
  }
  render() {
    return <h2> test</h2>;
  }
}

export default withRouter(ViewEditProfile);
