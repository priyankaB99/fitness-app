import React from "react";
import fire from "../Firebase/fire";
import 'firebase/auth';
import 'firebase/database';
import { withRouter } from 'react-router-dom';

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
      error: null
    };
    this.submitForm = this.submitForm.bind(this);
    this.changeHandler = this.changeHandler.bind(this);
  }

  changeHandler(event) {
    event.preventDefault();
    this.setState({ [event.target.name]: event.target.value });
  }

  submitForm(event) {
    fire.auth().signInWithEmailAndPassword(this.state.email, this.state.password)
    .then((authUser) => {
        // User has been logged in
        console.log(authUser);
        // login successful. Go home.
        console.log('success logging in user');
        this.props.history.push('/home');
    })
    .catch((error) => {
         // An error happened.
        console.log("Login error:", error); 
        this.setState({ error : error });
    });
  }

  render() {

    let { email, password, error } = this.state;
    const isInvalid = 
    password === '' ||
    email === '';

    return (
      <div>
        <input
          name="email"
          value={email}
          onChange={this.changeHandler}
          type="email"
          placeholder="Email"
        />
        <input
          name="password"
          value={password}
          onChange={this.changeHandler}
          type="password"
          placeholder="Password"
        />
        <button disabled={isInvalid} onClick={() => this.submitForm()}>Log In</button>
        {error && <p>{error.message}</p>}
      </div>
    );
  }
}

export default withRouter(Login);
