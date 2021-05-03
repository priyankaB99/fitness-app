import React from "react";
import fire from "../Firebase/fire";
import "firebase/auth";
import "firebase/database";
import "../CSS/ShareWorkout.css";
import { keyframes } from "styled-components";

//Code Resources
// -https://codepen.io/bastianalbers/pen/PWBYvz?editors=0110

class ShareWorkout extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      workout: this.props.selectedWorkout, //workoutID
      workoutUsers: [], //list of users shared to workout
      workoutName: "",
      uid: "",
      friends: [],
      sharedFriends: [], //people have already shared workout with
      notSharedFriends: [], //people have not yet shared workout with
      toShareWith: "", //user ID of friend that has been selected to share with
      eventKey: this.props.selectedWorkout.eventKey,
      warning: false,
    };
    this.parseWorkoutData = this.parseWorkoutData.bind(this);
    this.parseFriends = this.parseFriends.bind(this);
    this.determineShareList = this.determineShareList.bind(this);
    this.sharedList = this.sharedList.bind(this);
    this.toShareList = this.toShareList.bind(this);
    this.changeHandler = this.changeHandler.bind(this);
    this.shareHandler = this.shareHandler.bind(this);
  }

  componentDidMount() {
    fire.auth().onAuthStateChanged((user) => {
      // User is signed in
      if (user) {
        this.setState({
          uid: user.uid,
        });
        this.parseWorkoutData();
      } else {
        // No user is signed in
        this.props.history.push("/login");
      }
    });
  }

  // //adds workout id, name, and exercise array to state to use later
  parseWorkoutData() {
    let workoutRef = fire.database().ref("Workouts/" + this.state.workout);

    workoutRef.once("value", (data) => {
      let workoutData = data.val();
      if (workoutData) {
        this.setState({
          workoutName: workoutData.name,
          workoutUsers: Object.values(workoutData.users),
        });
      } else {
        console.log("Workout No Longer Exists");
      }
    });
    this.parseFriends();
  }

  //finds user's current friends
  parseFriends() {
    let friendListRef = fire
      .database()
      .ref("FriendList/" + this.state.uid + "/Friends");
    let allFriends = [];
    friendListRef.once("value", (data) => {
      data.forEach(function (friend) {
        let currentFriend = friend.val();
        let friendToPush = {
          id: currentFriend.friendId,
          username: currentFriend.friendUsername,
        };
        allFriends.push(friendToPush);
      });
      if (allFriends.length === 0) {
        this.setState({ friends: allFriends });
      } else {
        this.setState({
          friends: allFriends,
          toShareWith: allFriends[0].id, //set default to first option on dropdown menu
        });
      }

      this.determineShareList();
    });
  }

  //FINISH FUNCTIONALITY
  //goes through friends list to see who workout has been shared with and who hasn't
  determineShareList() {
    let notSharedList = [];
    let alreadySharedList = [];
    this.state.friends.forEach((friend) => {
      this.state.workoutUsers.includes(friend.id)
        ? alreadySharedList.push(friend.username)
        : notSharedList.push(friend.username);
    });
    this.setState({
      sharedFriends: alreadySharedList,
      notSharedFriends: notSharedList,
    });
  }

  //allows user to select which friend to share with and option to submit
  toShareList() {
    return (
      <div>
        {this.state.friends.length > 0 ? (
          <div>
            <select name="toShare" onChange={this.changeHandler}>
              {this.state.friends.map((friend, index) => (
                <option value={friend.id} key={index}>
                  {friend.username}
                </option>
              ))}
            </select>
            <input
              type="button"
              value="Share"
              onClick={this.shareHandler}
            ></input>
          </div>
        ) : (
          <strong>
            {" "}
            You currently have no friends. Add some friends to begin sharing!{" "}
          </strong>
        )}
      </div>
    );
  }

  //users who have already been shared with
  sharedList() {
    return (
      <div>
        <ul>
          {this.state.sharedFriends.map((friend, index) => (
            <li key={index}>{friend}</li>
          ))}
        </ul>
      </div>
    );
  }

  //sets state whenever dropdown option is selected
  changeHandler(event) {
    this.setState({
      toShareWith: event.target.value,
    });
  }

  //updates "shared with" list under the specified workout in Firebase w/selected user
  shareHandler() {
    if (this.state.workoutUsers.includes(this.state.toShareWith)) {
      this.setState({ warning: true });
    } else {
      let currentComponent = this;
      this.setState({ warning: false });
      let shareRef = fire
        .database()
        .ref("Workouts/" + this.state.workout + "/users");
      shareRef.once("value", (data) => {
        let sharedUsers = data.val();
        sharedUsers.push(this.state.toShareWith); //add new user to shared list
        shareRef.set(sharedUsers);
      });
      //retrieve tags
      let shareTagRef = fire
        .database()
        .ref("Workouts/" + this.state.workout + "/tags");
      shareTagRef.once("value", function (data) {
        let tags = data.val();
        for (let i = 0; i < tags.length; i++) {
          //make sure tags from shared workouts are set in database
          let newTagRef = fire
            .database()
            .ref("Tags/" + tags[i] + "/" + currentComponent.state.toShareWith)
            .push();
          newTagRef.set({
            workoutId: currentComponent.state.workout,
            workoutName: currentComponent.state.workoutName,
          });
        }
      });
      this.parseWorkoutData();
    }
  }

  render() {
    return (
      <div className="popup">
        <div>
          <p className="close" onClick={this.props.closePopup}>
            x
          </p>
        </div>

        <h2>Share "{this.state.workoutName}"</h2>
        <p>Shared with:</p>

        {this.sharedList()}

        <p>Share with:</p>
        {this.toShareList()}

        <br></br>

        {this.state.warning == true ? (
          <p className="warning">
            Workout has already been shared with this user
          </p>
        ) : (
          <p className="warning"></p>
        )}
      </div>
    );
  }
}

export default ShareWorkout;
