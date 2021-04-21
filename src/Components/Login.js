import React from "react";
import fire from "../Firebase/fire";
import "firebase/auth";
import "firebase/database";
import { withRouter, Link } from "react-router-dom";
import "../CSS/general.css";

// Code Resources
// - https://www.robinwieruch.de/complete-firebase-authentication-react-tutorial#react-router-for-firebase-auth
// - https://firebase.google.com/docs/auth/web/password-auth?authuser=0
// - https://firebase.google.com/docs/auth/web/manage-users?authuser=0

class Login extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      email: "",
      password: "",
      error: "",
    };
    this.submitForm = this.submitForm.bind(this);
    this.changeHandler = this.changeHandler.bind(this);
  }

  changeHandler(event) {
    event.preventDefault();
    this.setState({ [event.target.name]: event.target.value });
  }

  submitForm(event) {
    fire
      .auth()
      .signInWithEmailAndPassword(this.state.email, this.state.password)
      .then((authUser) => {
        // User has been logged in
        console.log(authUser);
        // login successful. Go home.
        // if(fire.auth().currentUser.emailVerified) {
          console.log("success logging in user");
          this.setState({error: ""});
          this.props.history.push("/");
        // }
        // else {
        //   fire.auth().signOut()
        //   this.setState({ error: "Please verify your email and log in again to access your account." });
        // }
      })
      .catch((error) => {
        // An error happened.
        console.log("Login error:", error);
        this.setState({ error: error.message });
      });
  }

  render() {
    let { email, password, error } = this.state;
    const isInvalid = password === "" || email === "";

    return (
      <div>
        <h1 class="mb-4">Log In</h1>
        <div className="loginBox login">
          <input
            name="email"
            value={email}
            onChange={this.changeHandler}
            type="email"
            placeholder="Email"
            className="input-box"
          />
          <input
            name="password"
            value={password}
            onChange={this.changeHandler}
            type="password"
            placeholder="Password"
            className="input-box"
          />
          <button
            className="btn btn-secondary"
            disabled={isInvalid}
            onClick={() => this.submitForm()}
          >
            Log In
          </button>
          {error && <p>{error}</p>}
        </div>
        <div className="login">
          Don't have an account yet?<br></br>
          <Link to="/signup"> Sign Up </Link>
        </div>
        <div className="login">
          Forgot password? <Link to="/forgotpassword"> Recover</Link>
        </div>
      </div>
    );
  }
}

export default withRouter(Login);
