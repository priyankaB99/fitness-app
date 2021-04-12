import React from "react";
import fire from "../Firebase/fire";
import "firebase/auth";
import "firebase/database";
import { withRouter, Link } from "react-router-dom";

class ForgotPassword extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      email: "",
      submitted: false,
    };
    this.submitHandler = this.submitHandler.bind(this);
    this.changeHandler = this.changeHandler.bind(this);
  }

  submitHandler(event) {
    event.preventDefault();
    this.setState({ submitted: true });
    var auth = fire.auth();
    var emailAddress = this.state.email;

    auth
      .sendPasswordResetEmail(emailAddress)
      .then(function () {
        console.log("Email sent");
      })
      .catch(function (error) {
        console.log(error);
      });
  }

  changeHandler(event) {
    event.preventDefault();
    this.setState({ [event.target.name]: event.target.value });
  }

  render() {
    let content;
    if (this.state.submitted === false) {
      content = (
        <form className="loginBox login" onSubmit={this.submitHandler}>
          <h5>
            Enter the email associated with your account to recover your
            password.
          </h5>
          <input
            name="email"
            value={this.state.email}
            onChange={this.changeHandler}
            type="text"
            placeholder="Email"
          />
          <br></br>
          <input
            type="submit"
            className="btn btn-secondary"
            value="Send Recovery Email"
          />
        </form>
      );
    } else {
      content = (
        <h5>
          A link has been sent to the email you submitted. Use the link provided
          in there to reset your password. Then return to the login page to sign
          in with your new password.
        </h5>
      );
    }
    return (
      <div>
        <h2>Recover Your Password</h2>
        {content}
        <Link to="/login"> Return to Login</Link>
      </div>
    );
  }
}
export default withRouter(ForgotPassword);
