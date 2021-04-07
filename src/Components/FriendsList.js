import React from "react";
import fire from "../Firebase/fire";
import "firebase/auth";
import "firebase/database";
import { withRouter, useHistory } from "react-router-dom";
import {format} from "date-fns";
import "../CSS/general.css";
import "../CSS/workouts.css";

class FriendsList extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
        uid: "",
        friendList: [],
        friendRequests: [],
        requestedUsername: ""
    };
    this.changeHandler = this.changeHandler.bind(this);
    this.submitForm = this.submitForm.bind(this);
    this.sendFriendRequest = this.sendFriendRequest.bind(this);
  }

  componentDidMount() {
    let currentComponent = this;
    fire.auth().onAuthStateChanged(function (user) {
      if (user) {
          // User is signed in
          console.log(user.email);
          console.log(user.displayName);
          //get list of friends
          let friendsRef = fire.database().ref("FriendList/" + user.uid + "/Friends");
          let friendsData = [];
          friendsRef.once("value", function (data) {
            let friendsFromDatabase = data.val();
            for (const key in friendsFromDatabase) {
                friendsData.push({
                    key: key,
                    friendID: friendsFromDatabase[key].friendId,
                    friendUsername: friendsFromDatabase[key].friendUsername
                });
            }
          }).then(() => {
            let requestsRef = fire.database().ref("FriendList/" + user.uid + "/ReceivedRequests");
            let requestsData = [];
            requestsRef.once("value", function (data) {
                let requestsFromDatabase = data.val();
                for (const key in requestsFromDatabase) {
                    requestsData.push({
                        key: key,
                        requestorID: requestsFromDatabase[key].requestorId,
                        requestorUsername: requestsFromDatabase[key].requestorUsername
                    });
                }
                currentComponent.setState({
                    uid: user.uid,
                    friendList: friendsData,
                    friendRequests: requestsData
                });
            })
          });
      } else {
        // No user is signed in
        useHistory().push("/login");
      }
    });
  }

  changeHandler(event) {
    event.preventDefault();
    this.setState({ [event.target.name]: event.target.value });
  }

  submitForm(event) {
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
            this.sendFriendRequest(requestedUserId);
        }
        else {
            currentComponent.setState({error: "Entered username does not exist"})
        }
    });
  }

  sendFriendRequest(requestedUserId) {
    let currentComponent = this;
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

  render() {
    let requestedUsername = this.state.requestedUsername;
    let error = this.state.error;
    const isInvalid = requestedUsername === "";

    console.log(this.state.friendRequests);

    return (
      <div>
        <h2>My Friends</h2>
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
                onClick={() => this.submitForm()}
            >
                Send Invite
            </button>
            {error && <p>{error}</p>}
        </div>
        <div className="row">
            <div className="col-7">
                <div className="workout">
                    {this.state.friendList.map((data, index) => (
                        <p key={data.key} data-object={data}>{index} - {data.friendUsername}</p>
                    ))}
                </div>
            </div>
            <div className="col">
                <div className="workout">
                    {this.state.friendRequests.map((data, index) => (
                        <p key={data.key} data-object={data}>{index} - {data.requestorUsername}</p>
                    ))}
                </div>
            </div>
        </div>
      </div>
    );
  }
}

export default withRouter(FriendsList);