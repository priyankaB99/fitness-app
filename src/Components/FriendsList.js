import React from "react";
import fire from "../Firebase/fire";
import "firebase/auth";
import "firebase/database";
import { withRouter } from "react-router-dom";

class FriendsList extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
        uid: "",
        friendList: []
    };
  }

  componentDidMount() {
    let currentComponent = this;
    fire.auth().onAuthStateChanged(function (user) {
      if (user) {
          // User is signed in
          console.log(user.email);
          console.log(user.displayName);
          this.findFriends();
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

  render() {
    return (
      <div>
      
      </div>
    );
  }
}

export default withRouter(FriendsList);