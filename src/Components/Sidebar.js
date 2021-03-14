import React from "react";
import fire from "../Firebase/fire";
import 'firebase/auth';
import 'firebase/database';
import { withRouter, useHistory, Link } from 'react-router-dom';
import styled from 'styled-components';
// import './sidebar.css';

// Code Resources
// -

const StyledNavItem = styled.div`
    height: 70px;
    width: 75px; /* width must be same size as NavBar to center */
    text-align: center; /* Aligns <a> inside of NavIcon div */
    margin-bottom: 0;   /* Puts space between NavItems */
    a {
        font-size: 15px;
        color: ${(props) => props.active ? "white" : "#9FFFCB"};
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
    }

    render() {
        const { active } = this.props;
        return(
            <StyledNavItem active={active}>
                <Link to={this.props.path} className={this.props.css} onClick={this.handleClick}>
                    <div>{this.props.name}</div>
                </Link>
            </StyledNavItem>
        );
    }
}

const StyledSideNav = styled.div`   
    position: fixed;     /* Fixed Sidebar (stay in place on scroll and position relative to viewport) */
    height: 100%;
    width: 200px;     /* Set the width of the sidebar */
    z-index: 1;      /* Stay on top of everything */
    top: 3.4em;      /* Stay at the top */
    background-color: #222; /* Black */
    overflow-x: hidden;     /* Disable horizontal scroll */
    padding-top: 0px;
`;

class Sidebar extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
        activePath: props.location.pathname,
            items: [
                {
                  path: '/', /* path is used as id to check which NavItem is active basically */
                  name: 'Home',
                  css: 'fa fa-fw fa-home',
                  key: 1 /* Key is required, else console throws error. Does this please you Mr. Browser?! */
                },
                {
                  path: '/createworkout',
                  name: 'createworkout',
                  css: 'fa fa-fw fa-clock',
                  key: 2
                },
                {
                  path: '/displayworkouts',
                  name: 'displayworkouts',
                  css: 'fas fa-hashtag',
                  key: 3
                },
              ]
    };
    this.logout = this.logout.bind(this);
  }

  onItemClick = (path) => {
    this.setState({ activePath: path });
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
    const { items, activePath } = this.state;
    return(
        <StyledSideNav>
            {this.state.loggedIn ? 
            <div>
                <p>Welcome {this.state.username}!</p>
                <button onClick={this.logout}> Sign Out </button>
            </div>
            :
            <div></div>}
            {
                items.map((item) => {
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
                })
            }
        </StyledSideNav>
    );
    // return (
    //   <div id="sidebar">
    //       <nav>
    //           <h2>FITNESS APP</h2>
    //           <div>
    //               <h3>Welcome, {this.state.username}</h3>
    //               <button onClick={this.logout}>Logout</button>
    //         </div>              
    //           <div>
    //             <Link to="/createworkout"> Create Workout </Link>
    //           </div>
    //           <div>
    //             <Link to="/displayworkouts"> My Saved Workouts </Link>
    //           </div>
    //     </nav>
    //   </div>
    // );
  }
}

export default withRouter(Sidebar);