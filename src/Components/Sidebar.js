import React from "react";
import fire from "../Firebase/fire";
import "firebase/auth";
import "firebase/database";
import { withRouter, useHistory, Link } from "react-router-dom";
import styled from "styled-components";
import "../CSS/sidebar.css";

// Code Resources
// - https://codeburst.io/how-to-create-a-navigation-bar-and-sidebar-using-react-348243ccd93
// - https://bootstrapious.com/p/bootstrap-sidebar

const StyledNavItem = styled.div`
  transition: all 0.3s;
  a {
    font-size: 20px;
    color: ${(props) => (props.active ? "white" : "#b0a8ba")};
    :hover {
      opacity: 0.7;
      text-decoration: none; /* Gets rid of underlining of icons */
    }
  }
`;

class NavItem extends React.Component {
  handleClick = () => {
    const { path, onItemClick } = this.props;
    onItemClick(path);
  };

  render() {
    const { active } = this.props;
    return (
      <StyledNavItem active={active}>
        <Link
          to={this.props.path}
          className={this.props.css}
          onClick={this.handleClick}
        >
          <div>{this.props.name}</div>
        </Link>
      </StyledNavItem>
    );
  }
}

class Sidebar extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      activePath: props.location.pathname,
      items: [
        {
          path:
            "/" /* path is used as id to check which NavItem is active basically */,
          name: "Home",
          css: "fa fa-fw fa-home",
          key: 1 /* Key is required, else console throws error. Does this please you Mr. Browser?! */,
        },
        {
          path: "/createworkout",
          name: "Create Workout",
          css: "fa fa-fw fa-clock",
          key: 2,
        },
        {
          path: "/displayworkouts",
          name: "My Workouts",
          css: "fas fa-hashtag",
          key: 3,
        },
        {
          path: "/myprofile",
          name: "My Profile",
          key: 4,
        },
        {
          path: "/myfriends",
          name: "Friends",
          key: 5
        }
      ],
    };
    this.logout = this.logout.bind(this);
  }

  onItemClick = (path) => {
    this.setState({ activePath: path });
  };

  componentDidMount() {
    fire.auth().onAuthStateChanged((user) => {
      if (user 
        // && fire.auth().currentUser.emailVerified
        ) {
        // User is signed in
        console.log(user.email);
        console.log(user.displayName);
        let isVerified = fire.auth().currentUser.emailVerified;
        this.setState({
          loggedIn: true,
          uid: user.uid,
          email: user.email,
          username: user.displayName,
          activePath: this.props.location.pathname,
          isVerified: isVerified
        });
      } else {
        // No user is signed in
        this.setState({ loggedIn: false });
      }
    });
  }

  logout() {
    fire
      .auth()
      .signOut()
      .then(() => {
        // Sign-out successful.
        console.log("signout");
        useHistory().push("/login");
      })
      .catch((error) => {
        // An error happened.
      });
  }

  render() {
    const { items, activePath } = this.state;
    return (
      <div className="sidebar">
        <h3>Fitness App</h3>
        {this.state.loggedIn && (
          <div>
            <div className="sidebar-box">
              <p>Welcome{this.state.username ? " " + this.state.username: ""}!</p>
              <button
                type="button"
                className="btn btn-light btn-sm"
                onClick={this.logout}
              >
                {" "}
                Sign Out{" "}
              </button>
            </div>
            {items.map((item) => {
              return (
                <NavItem
                  path={item.path}
                  name={item.name}
                  css={item.css}
                  onItemClick={this.onItemClick}
                  active={item.path === activePath}
                  key={item.key}
                />
              );
            })}
          </div>
        )}
        {(this.state.loggedIn && !this.state.isVerified) && (
          <div id="verify-reminder-box">
            Verify your email to finish setting up your account.
          </div>
        )}
      </div>
    );
  }
}

export default withRouter(Sidebar);
