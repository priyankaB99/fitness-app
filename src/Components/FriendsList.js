import React from "react";
import fire from "../Firebase/fire";
import "firebase/auth";
import "firebase/database";
import { withRouter, useHistory } from "react-router-dom";
import { format } from "date-fns";
import "../CSS/general.css";
import "../CSS/workouts.css";
import "../CSS/friends.css";
import UserCalendar from "./UserCalendar";
import UserProfile from "./UserProfile";

class FriendsList extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      uid: "",
      friendList: [],
      friendRequests: [],
      requestedUsername: "",
    };
    this.changeHandler = this.changeHandler.bind(this);
    this.submitForm = this.submitForm.bind(this);
    this.sendFriendRequest = this.sendFriendRequest.bind(this);
    this.acceptRequest = this.acceptRequest.bind(this);
    this.rejectRequest = this.rejectRequest.bind(this);
    this.openCalendar = this.openCalendar.bind(this);
    this.openProfile = this.openProfile.bind(this);
    this.load = this.load.bind(this);
  }

  componentDidMount() {
    this.load();
  }

  load() {
    let currentComponent = this;
    fire.auth().onAuthStateChanged(function (user) {
      if (user) {
        // User is signed in
        console.log(user.email);
        console.log(user.displayName);
        //get list of friends
        let friendsRef = fire
          .database()
          .ref("FriendList/" + user.uid + "/Friends");
        let friendsData = [];
        friendsRef
          .once("value", function (data) {
            let friendsFromDatabase = data.val();
            for (const key in friendsFromDatabase) {
              friendsData.push({
                key: key,
                friendId: friendsFromDatabase[key].friendId,
                friendUsername: friendsFromDatabase[key].friendUsername,
                calendarOpen: false,
                profileOpen: false,
              });
            }
          })
          .then(() => {
            let requestsRef = fire
              .database()
              .ref("FriendList/" + user.uid + "/ReceivedRequests");
            let requestsData = [];
            requestsRef.once("value", function (data) {
              let requestsFromDatabase = data.val();
              for (const key in requestsFromDatabase) {
                requestsData.push({
                  key: key,
                  requestorId: requestsFromDatabase[key].requestorId,
                  requestorUsername:
                    requestsFromDatabase[key].requestorUsername,
                });
              }
              currentComponent.setState({
                uid: user.uid,
                friendList: friendsData,
                friendRequests: requestsData,
              });
            });
          });
      } else {
        // No user is signed in
      }
    });
  }
  changeHandler(event) {
    event.preventDefault();
    this.setState({ [event.target.name]: event.target.value });
  }

  submitForm() {
    let currentComponent = this;
    var requestedUserId = "";

    //checks if entered user is same logged in user
    if (
      currentComponent.state.requestedUsername ==
      fire.auth().currentUser.displayName
    ) {
      currentComponent.setState({
        error: "Cannot send friend request to yourself :)",
      });
      return;
    }
    //checks if username entered is an actual user
    fire
      .database()
      .ref("Users")
      .once("value", function (data) {
        let userData = data.val();
        console.log(currentComponent.state.requestedUsername);
        for (const key in userData) {
          if (
            userData[key].Username === currentComponent.state.requestedUsername
          ) {
            console.log("found match");
            requestedUserId = userData[key].UserId;
            break;
          }
        }
      })
      .catch((error) => {
        console.log("Friend Find:", error);
        currentComponent.setState({ error: error.message });
      })
      .then(() => {
        if (requestedUserId != "") {
          this.sendFriendRequest(requestedUserId);
        } else {
          currentComponent.setState({
            error: "Entered username does not exist",
          });
        }
      });
  }

  sendFriendRequest(requestedUserId) {
    let currentComponent = this;
    //Checks if we've already sent request to this person
    let canPushRequest = true;
    let currentUserRef = fire
      .database()
      .ref("FriendList/" + currentComponent.state.uid + "/SentRequests");
    currentUserRef
      .once("value", function (data) {
        let reqData = data.val();
        for (const key in reqData) {
          if (reqData[key].requestedId === requestedUserId) {
            console.log("already requested");
            currentComponent.setState({
              error: "You've already sent this user a friend request",
            });
            canPushRequest = false;
          }
        }
      })
      .then(() => {
        let currentUserRef2 = fire
          .database()
          .ref("FriendList/" + currentComponent.state.uid + "/Friends");
        currentUserRef2
          .once("value", function (data) {
            let reqData2 = data.val();
            for (const key in reqData2) {
              if (reqData2[key].friendId === requestedUserId) {
                console.log("already friend");
                currentComponent.setState({
                  error: "You are already friends with this user",
                });
                canPushRequest = false;
              }
            }
          })
          .then(() => {
            if (canPushRequest) {
              //can send friend request!
              //first pushes the friend request to the database under current user
              let randomKey = Math.round(Math.random() * 100000000);
              console.log(randomKey);
              let currentUserRef2 = fire
                .database()
                .ref(
                  "FriendList/" +
                    currentComponent.state.uid +
                    "/SentRequests/" +
                    randomKey
                );
              // let friendRequestRef = currentUserRef2.push();
              currentUserRef2.set({
                requestedId: requestedUserId,
                requestedUsername: currentComponent.state.requestedUsername,
                dateRequested: format(new Date(), "MM/dd/yyyy"),
              });
              //finally, pushes the friend request to the database under requested user
              let otherUserRef = fire
                .database()
                .ref(
                  "FriendList/" +
                    requestedUserId +
                    "/ReceivedRequests/" +
                    randomKey
                );
              // friendRequestRef = otherUserRef.push();
              otherUserRef.set({
                requestorId: currentComponent.state.uid,
                requestorUsername: fire.auth().currentUser.displayName,
                dateRequestReceived: format(new Date(), "MM/dd/yyyy"),
              });
              console.log("sent request");
              alert("Request has been sent!");
              //reset states
              currentComponent.setState({ requestedUsername: "", error: "" });
            }
          });
      });
  }

  acceptRequest(event) {
    console.log(event.target.parentNode.dataset.index);
    let index = event.target.parentNode.dataset.index;
    let requestorId = this.state.friendRequests[index].requestorId;
    let requestorUsername = this.state.friendRequests[index].requestorUsername;
    let requestKey = this.state.friendRequests[index].key;

    let currentComponent = this;
    let currentUserRef = fire
      .database()
      .ref(
        "FriendList/" +
          currentComponent.state.uid +
          "/ReceivedRequests/" +
          requestKey
      );
    currentUserRef
      .remove()
      .then(() => {
        console.log("should be removed");
        let otherUserRef = fire
          .database()
          .ref("FriendList/" + requestorId + "/SentRequests/" + requestKey);
        otherUserRef.remove().then(() => {
          //add both as each other's friends
          let currentUserRef2 = fire
            .database()
            .ref(
              "FriendList/" +
                currentComponent.state.uid +
                "/Friends/" +
                requestKey
            );
          currentUserRef2.set({
            friendId: requestorId,
            friendUsername: requestorUsername,
            friendSinceDate: format(new Date(), "MM/dd/yyyy"),
          });
          let otherUserRef2 = fire
            .database()
            .ref("FriendList/" + requestorId + "/Friends/" + requestKey);
          otherUserRef2.set({
            friendId: currentComponent.state.uid,
            friendUsername: fire.auth().currentUser.displayName,
            friendSinceDate: format(new Date(), "MM/dd/yyyy"),
          });
          alert("Friend has been added!");
          this.setState(this.state);
          this.load();
        });
      })
      .catch((error) => {
        console.log("Accept Request:", error);
      });
  }

  rejectRequest(event) {
    console.log(event.target.parentNode.dataset.index);
    let index = event.target.parentNode.dataset.index;
    let requestorId = this.state.friendRequests[index].requestorId;
    let requestKey = this.state.friendRequests[index].key;

    let currentComponent = this;
    let currentUserRef = fire
      .database()
      .ref(
        "FriendList/" +
          currentComponent.state.uid +
          "/ReceivedRequests/" +
          requestKey
      );
    currentUserRef
      .remove()
      .then(() => {
        console.log("should be removed");
        let otherUserRef = fire
          .database()
          .ref("FriendList/" + requestorId + "/SentRequests/" + requestKey);
        otherUserRef.remove();
        alert("Friend request was deleted!");
        this.setState(this.state);
        this.load();
      })
      .catch((error) => {
        console.log("Accept Request:", error);
      });
  }

  openCalendar(event) {
    let index = event.target.parentNode.dataset.index;
    let currentFriendList = this.state.friendList;
    currentFriendList[index].profileOpen = false;
    currentFriendList[index].calendarOpen = !currentFriendList[index]
      .calendarOpen;
    this.setState({
      friendList: currentFriendList,
    });
  }

  openProfile(event) {
    let index = event.target.parentNode.dataset.index;
    let currentFriendList = this.state.friendList;
    currentFriendList[index].calendarOpen = false;
    currentFriendList[index].profileOpen = !currentFriendList[index]
      .profileOpen;
    this.setState({
      friendList: currentFriendList,
    });
  }

  render() {
    let requestedUsername = this.state.requestedUsername;
    let error = this.state.error;
    const isInvalid = requestedUsername === "";
    console.log("renderagain");
    return (
      <div>
        <h2>My Friends</h2>
        <div className="row">
          <div className="pl-0 col-8">
            <div className="friends-box workout">
              {this.state.friendList.length == 0 && (
                <h5>Send a friend request to share workouts and events!</h5>
              )}
              {this.state.friendList.map((data, index) => (
                <div data-index={index}>
                  <p key={data.key}>
                    {index + 1} - {data.friendUsername}
                  </p>
                  <button
                    className="btn btn-secondary mr-2"
                    onClick={(event) => this.openCalendar(event)}
                  >
                    See Calendar
                  </button>
                  <button
                    className="btn btn-secondary mr-2"
                    onClick={(event) => this.openProfile(event)}
                  >
                    See Profile
                  </button>
                  {data.profileOpen ? (
                    <UserProfile displayUserId={data.friendId} />
                  ) : null}
                  {data.calendarOpen ? (
                    <UserCalendar displayUserId={data.friendId} />
                  ) : null}
                </div>
              ))}
            </div>
          </div>
          <div className="pl-0 col">
            <div className="workout">
              <h5>Requests</h5>
              {this.state.friendRequests.map((data, index) => (
                <div key={data.key} data-index={index}>
                  <p>
                    {index + 1} - {data.requestorUsername}
                  </p>
                  <button
                    className="btn btn-secondary displayButtons"
                    onClick={(event) => this.acceptRequest(event)}
                  >
                    Accept
                  </button>
                  <button
                    className="btn btn-secondary displayButtons"
                    onClick={(event) => this.rejectRequest(event)}
                  >
                    Reject
                  </button>
                </div>
              ))}
            </div>
            <div className="workout">
              <h5>Add Friend</h5>
              <div className="loginBox login">
                <input
                  name="requestedUsername"
                  value={requestedUsername}
                  onChange={this.changeHandler}
                  type="text"
                  placeholder="Enter Username"
                  className="input-box"
                />
                <button
                  className="btn btn-secondary"
                  disabled={isInvalid}
                  onClick={() => this.submitForm()}
                >
                  Send Invite
                </button>
                {error && <p>{error}</p>}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default withRouter(FriendsList);
