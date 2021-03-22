import React from 'react';
import fire from "../Firebase/fire";
import 'firebase/auth';
import 'firebase/database';
import { withRouter, Link } from 'react-router-dom';
import './general.css';

// Code Resources
// - https://www.robinwieruch.de/complete-firebase-authentication-react-tutorial#react-router-for-firebase-auth
// - https://firebase.google.com/docs/auth/web/password-auth?authuser=0
// - https://firebase.google.com/docs/auth/web/manage-users?authuser=0

class SignUp extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            email: '',
            username: '',
            password1: '',
            password2: '',
            warning: '',
            error: null
        };
        this.submitForm = this.submitForm.bind(this);
    }

    onChange = event => {
        this.setState({ [event.target.name]: event.target.value });
    };

    submitForm(event) {

        const regexp = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        if (this.state.password1.length < 6) {
            this.setState({ warning: "Password should be at least six characters."});
            return;
        }
        else if (this.state.password1 !== this.state.password2) {
            this.setState({ warning: "Passwords do not match."});
            return;
        }
        else if (!regexp.test(this.state.email)) { 
            this.setState({ warning: "Invalid email address."});
            return;
        }

        fire.auth().createUserWithEmailAndPassword(this.state.email, this.state.password1)
            .then((authUser) => {
                // User has been logged in
                console.log(authUser);
                // Update profile with display name
                authUser.user.updateProfile({
                    displayName: this.state.username
                }).then(() => {
                // Update successful. Go home.
                console.log('success adding user');
                this.props.history.push('/');
                }).catch((error) => {
                // An error happened.
                console.log("Sign up error:" + error); 
                this.setState({ error : error});
                }).then(() => {
                    var userRef = fire.database().ref('Users/'+authUser.user.uid);
                    userRef.set({
                        UserId: authUser.user.uid,
                        Username: this.state.username,
                        Email: this.state.email
                    });
                  }).catch(error => {
                    // An error happened.
                    console.log(error);
                    this.setState({ error : error });
                });
            })
            .catch((error) => {
                 // An error happened.
                console.log("Sign up error:", error); 
                this.setState({ error : error });
            });
    };

    render() {
        let {
            email,
            username,
            password1,
            password2,
            warning,
            error
          } = this.state;

          let isInvalid =
          password1 === '' ||
          email === '' ||
          username === '';

          return (
            <div>
              <h1 class="mb-4">Sign Up</h1>
              <div className="loginBox login">
                <input
                  name="username"
                  value={username}
                  onChange={this.onChange}
                  type="text"
                  placeholder="Username"
                /> <br></br>
                <input
                  name="email"
                  value={email}
                  onChange={this.onChange}
                  type="text"
                  placeholder="Email Address"
                /> <br></br>
                <input
                  name="password1"
                  value={password1}
                  onChange={this.onChange}
                  type="password"
                  placeholder="Password"
                /> <br></br>
                <input
                  name="password2"
                  value={password2}
                  onChange={this.onChange}
                  type="password"
                  placeholder="Confirm Password"
                /> <br></br>
                <button className="btn btn-secondary" disabled={isInvalid} onClick={() => this.submitForm()}>
                    Sign Up
                </button>
                {warning !== '' && <p>{warning}</p>}
                <br></br>
                {error && <p>{error.message}</p>}
                <Link to="/login"> Log In </Link>
              </div>
            </div>
          );
    }
}

export default withRouter(SignUp);
