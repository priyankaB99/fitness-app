import React from "react";

class Login extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      username: "",
      password: "",
    };
    this.subtmitHandler = this.subtmitHandler.bind(this);
    this.changeHandler = this.changeHandler.bind(this);
  }
  changeHandler(event) {
    event.preventDefault();
    this.setState({ [event.target.name]: event.target.value });
  }
  render() {
    return (
      <form onSubmit={this.submitHandler}>
        <label>
          Username:
          <input
            type="text"
            name="username"
            onChange={this.changeHandler}
            value={this.state.username}
          />
        </label>
        <label>
          Password:
          <input
            type="password"
            name="password"
            onChange={this.changeHandler}
            value={this.state.password}
          />
        </label>
        <input type="submit" value="Log In" />
      </form>
    );
  }
}
