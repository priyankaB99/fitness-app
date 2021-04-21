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

class SignUp extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      firstName: "",
      lastName: "",
      bday: "",
      email: "",
      profpic: "",
      username: "",
      password1: "",
      password2: "",
      warning: "",
      error: null,
    };
    this.submitForm = this.submitForm.bind(this);
  }

  onChange = (event) => {
    this.setState({ [event.target.name]: event.target.value });
  };

  profpicChange = (event) => {
    this.setState({ profpic: event.target.files[0] });
  };

  submitForm(event) {
    const regexp = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    if (this.state.password1.length < 6) {
      this.setState({ warning: "Password should be at least six characters." });
      return;
    } else if (this.state.password1 !== this.state.password2) {
      this.setState({ warning: "Passwords do not match." });
      return;
    } else if (!regexp.test(this.state.email)) {
      this.setState({ warning: "Invalid email address." });
      return;
    }
    //save to database
    fire
      .auth()
      .createUserWithEmailAndPassword(this.state.email, this.state.password1)
      .then((authUser) => {
        // Update profile with display name
        authUser.user
          .updateProfile({
            displayName: this.state.username,
          })
          .then(() => {
            console.log("Email verification sent");
          })
          .catch((error) => {
            console.log(error.code);
          });

        // User has been logged in
        console.log(authUser);

        //send email to verify
        authUser.user
          .sendEmailVerification()
          .then(() => {
            // Update successful. Go home.
            console.log("success adding user");
            this.props.history.push("/");
            alert("Success! Please check your email to verify your account.");
            // if(fire.auth().currentUser.emailVerified) {
            // this.setState({ warning: "" });
            // }
            // else {
            //   this.props.history.push("/login");
            //   this.setState({ warning: "Please verify your email and log in again to access your account." });
            // }
          })
          .catch((error) => {
            // An error happened.
            console.log("Sign up error:" + error);
            this.setState({ error: error });
          })
          .then(() => {
            //put into users database and insert default pic url
            let storageRef = fire.storage().ref("person.png");
            storageRef.getDownloadURL().then((url) => {
              var userRef = fire.database().ref("Users/" + authUser.user.uid);
              userRef.set({
                UserId: authUser.user.uid,
                Username: this.state.username,
                Email: this.state.email,
                firstName: this.state.firstName,
                lastName: this.state.lastName,
                bday: this.state.bday,
                pic: url,
              });
            });
          })
          .catch((error) => {
            // An error happened.
            console.log(error);
            this.setState({ error: error });
          });
      })
      .catch((error) => {
        // An error happened.
        console.log("Sign up error:", error);
        this.setState({ error: error });
      });
  }

  render() {
    let {
      email,
      username,
      password1,
      password2,
      profpic,
      warning,
      error,
      firstName,
      lastName,
      bday,
    } = this.state;

    let isInvalid = password1 === "" || email === "" || username === "";

    return (
      <div>
        <h1 class="mb-4">Sign Up</h1>
        <div className="loginBox login">
          <input
            id="firstName"
            name="firstName"
            placeholder="First Name"
            value={firstName}
            onChange={this.onChange}
            type="text"
            className="input-box"
          />
          <input
            id="lastName"
            name="lastName"
            placeholder="Last Name"
            value={lastName}
            onChange={this.onChange}
            type="text"
            className="input-box"
          />
          <input
            id="username"
            name="username"
            placeholder="Username"
            value={username}
            onChange={this.onChange}
            type="text"
            className="input-box"
          />
          <input
            id="email"
            name="email"
            placeholder="Email Address"
            value={email}
            onChange={this.onChange}
            type="text"
            className="input-box"
          />
          <input
            id="password1"
            name="password1"
            placeholder="Password"
            value={password1}
            onChange={this.onChange}
            type="password"
            className="input-box"
          />
          <input
            id="password2"
            name="password2"
            placeholder="Confirm Password"
            value={password2}
            onChange={this.onChange}
            type="password"
            className="input-box"
          />
          <label htmlFor="bday"> Date of Birth:</label>
          <input
            id="bday"
            name="bday"
            value={bday}
            onChange={this.onChange}
            type="date"
            className="input-box text-left"
          />
          <button
            className="btn btn-secondary"
            disabled={isInvalid}
            onClick={() => this.submitForm()}
          >
            Sign Up
          </button>
          {warning !== "" && <p>{warning}</p>}
          <br></br>
          {error && <p>{error.message}</p>}
          Back to <Link to="/login"> Log In </Link>
        </div>
      </div>
    );
  }
}

export default withRouter(SignUp);
