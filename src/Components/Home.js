import React from "react";
import fire from "../Firebase/fire";
import 'firebase/auth';
import 'firebase/database';
import { withRouter, Link, Redirect } from 'react-router-dom';

// Code Resources
// -

class Home extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      loggedIn: false,
      uid: '',
      email: '',
      username: ''
    };

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
        this.props.history.push('/login');
      }
    });
  }

  render() {
      return (
      <div>
        <div>
          <h1>Welcome Home</h1>
        </div>
      </div>
    );
  }
}

export default withRouter(Home);
