import React from "react";
import fire from "../Firebase/fire";
import 'firebase/auth';
import 'firebase/database';
import { withRouter, useHistory, Link } from 'react-router-dom';

import './sidebar.css';

// Code Resources
// -

class Sidebar extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      loggedIn: false,
      uid: '',
      email: '',
      username: ''
    };
    this.logout = this.logout.bind(this);
  }

  componentDidMount() {
    fire.auth().onAuthStateChanged((user) => {
        if (user) {
          // User is signed in
          console.log(user.email);
          console.log(user.displayName);
          this.setState({
              loggedIn: true, 
              uid: user.uid,
              email: user.email,
              username: user.displayName
            });
        } else {
          // No user is signed in
          this.setState({loggedIn: false});
        }
      });      
  }

  logout() {
        fire.auth().signOut().then(() => {
        // Sign-out successful.
        console.log("signout");
        useHistory().push('/login');
      }).catch((error) => {
        // An error happened.
      });
  }

  render() {
    return (
      <div id="sidebar">
          <nav>
              <h2>FITNESS APP</h2>
              <div>
                  <h3>Welcome, {this.state.username}</h3>
                  <button onClick={this.logout}>Logout</button>
            </div>              
              <div>
                <Link to="/createworkout"> Create Workout </Link>
              </div>
              <div>
                <Link to="/displayworkouts"> My Saved Workouts </Link>
              </div>
        </nav>
      </div>
    );
  }
}

export default withRouter(Sidebar);