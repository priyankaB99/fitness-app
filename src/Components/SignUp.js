import React, { Component } from 'react';
import fire from "../Firebase/fire";
import 'firebase/auth';
import 'firebase/database';
import { Link, withRouter } from 'react-router-dom';

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
                this.props.history.push('/home');
                console.log('success adding user');
                }).catch((error) => {
                // An error happened.
                console.log("Sign up error:" + error); 
                this.setState({ error : error});
                }).then(() => {
                    var userRef = fire.database().ref('Users/'+authUser.user.uid);
                    userRef.set({
                        UserId: authUser.user.uid,
                        Username: this.state.username
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
              <input
                name="username"
                value={username}
                onChange={this.onChange}
                type="text"
                placeholder="Username"
              />
              <input
                name="email"
                value={email}
                onChange={this.onChange}
                type="text"
                placeholder="Email Address"
              />
              <input
                name="password1"
                value={password1}
                onChange={this.onChange}
                type="password"
                placeholder="Password"
              />
              <input
                name="password2"
                value={password2}
                onChange={this.onChange}
                type="password"
                placeholder="Confirm Password"
              />
              <button disabled={isInvalid} onClick={() => this.submitForm()}>
                  Sign Up
              </button>
              {warning !== '' && <p>{warning}</p>}
              <br></br>
              {error && <p>{error.message}</p>}
            </div>
          );
    }
}

export default withRouter(SignUp);
