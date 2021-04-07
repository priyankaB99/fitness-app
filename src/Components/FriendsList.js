import React from "react";
import fire from "../Firebase/fire";
import "firebase/auth";
import "firebase/database";
import { withRouter } from "react-router-dom";
import {format} from "date-fns";
import { cleanup } from "@testing-library/react";

class FriendsList extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
        uid: "",
        friendList: [],
        requestedUsername: ""
    };
    this.changeHandler = this.changeHandler.bind(this);
    this.sendFriendRequest = this.sendFriendRequest.bind(this);
  }

  componentDidMount() {
    let currentComponent = this;
    fire.auth().onAuthStateChanged(function (user) {
      if (user) {
          // User is signed in
          console.log(user.email);
          console.log(user.displayName);
          let friendsRef = fire.database().ref("FriendList/" + user.uid + "/Friends");
          let friendsData = [];
          friendsRef.once("value", function (data) {
            let friendsFromDatabase = data.val();
            for (const key in friendsFromDatabase) {
                console.log(friendsFromDatabase[key]);
                friendsData.push({
                    friendKey: key,
                    friendID: friendsFromDatabase[key].friendId,
                    friendUsername: friendsFromDatabase[key].friendUsername
                });
            }
            currentComponent.setState({
              uid: user.uid,
              friendList: friendsData
            });
          });
      } else {
        // No user is signed in
        this.props.history.push("/login");
      }
    });
  }

  changeHandler(event) {
    event.preventDefault();
    this.setState({ [event.target.name]: event.target.value });
  }

  sendFriendRequest(event) {
    let currentComponent = this;
    var requestedUserId = "";

    //checks if entered user is same logged in user
    if (currentComponent.state.requestedUsername == fire.auth().currentUser.displayName) {
        currentComponent.setState({error: "Cannot send friend request to yourself :)"})
        return;
    }
    
    //checks if username entered is an actual user
    fire.database().ref("Users").once("value", function (data) {
        let userData = data.val();
        console.log(currentComponent.state.requestedUsername);
        for (const key in userData) {
            if (userData[key].Username === currentComponent.state.requestedUsername) {
                console.log("found match");
                requestedUserId = userData[key].UserId;
                console.log(requestedUserId);
                break;
            }
        }
    }).catch((error) => {
        console.log("Friend Find:", error);
        currentComponent.setState({ error: error.message });
    }).then(() => {
        if (requestedUserId != "") {
            //Checks if we've already sent request to this person
            let canPushRequest = true;
            let currentUserRef = fire.database().ref("FriendList/" + currentComponent.state.uid + "/SentRequests");
            currentUserRef.once("value", function (data) {
                let reqData = data.val();
                for (const key in reqData) {
                    if (reqData[key].requestedId === requestedUserId) {
                        console.log("already requested");
                        currentComponent.setState({error: "You've already sent this user a friend request"})
                        canPushRequest = false;
                    }
                }
            }).then(() => {
                if (canPushRequest) {
                    //can send friend request!
                    //first pushes the friend request to the database under current user
                    let currentUserRef2 = fire.database().ref("FriendList/" + currentComponent.state.uid + "/SentRequests");
                    let friendRequestRef = currentUserRef2.push();
                    friendRequestRef.set(
                    {
                        requestedId: requestedUserId,
                        requestedUsername: currentComponent.state.requestedUsername,
                        dateRequested: format(new Date(), "mm/dd/yyyy")
                    });
                    //finally, pushes the friend request to the database under requested user
                    let otherUserRef = fire.database().ref("FriendList/" + requestedUserId + "/ReceivedRequests");
                    friendRequestRef = otherUserRef.push();
                    friendRequestRef.set(
                    {
                        requestorId: currentComponent.state.uid,
                        requestorUsername: fire.auth().currentUser.displayName,
                        dateRequestReceived: format(new Date(), "mm/dd/yyyy")
                    });
                    console.log("sent request");
                    alert("Request has been sent!");
                    //reset states
                    currentComponent.setState({requestedUsername: "", error: ""})
                }
            })
            
        }
        else {
            currentComponent.setState({error: "Entered username does not exist"})
        }
    });
  }

  render() {
    let requestedUsername = this.state.requestedUsername;
    let error = this.state.error;
    const isInvalid = requestedUsername === "";
    return (
      <div>
          <h2>Friends</h2>
          <div className="loginBox login">
          <input
            name="requestedUsername"
            value={requestedUsername}
            onChange={this.changeHandler}
            type="text"
            placeholder="Enter Username"
          />{" "}
          <br></br>
          <button
            className="btn btn-secondary"
            disabled={isInvalid}
            onClick={() => this.sendFriendRequest()}
          >
            Send Invite
          </button>
          {error && <p>{error}</p>}
        </div>
      </div>
    );
  }
}

export default withRouter(FriendsList);