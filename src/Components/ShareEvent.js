import React from "react";
import fire from "../Firebase/fire";
import "firebase/auth";
import "firebase/database";
import "../CSS/ShareEvent.css";
import { keyframes } from "styled-components";


//Code Resources

class ShareEvent extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      event: this.props.selectedEvent, //ID of event
      eventUsers: [], //list of users shared to workout
      eventName: "",
      uid: "",
      friends: [],
      sharedFriends: [], //people have already shared workout with
      notSharedFriends: [], //people have not yet shared workout with
      toShareWith: "", //user ID of friend that has been selected to share with
      warning: false
    };
    this.parseEventData = this.parseEventData.bind(this);
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
          uid: user.uid
        });
        console.log(this.state.event);
        this.parseEventData();
      } else {
        // No user is signed in
        this.props.history.push("/login");
      }
    });
  }

  // //adds workout id, name, and exercise array to state to use later
  parseEventData() {
    let eventRef = fire.database().ref("Events/" + this.state.event);

    eventRef.once("value", (data) => {
      let eventData = data.val();
      if (eventData) {
        this.setState({
          eventName: eventData.workoutName,
          eventUsers: Object.values(eventData.users)
        });
      } else {
        console.log("Event No Longer Exists");
      }
    });
    this.parseFriends();
  }

  //finds user's current friends
  parseFriends(){    
    let friendListRef = fire.database().ref("FriendList/" + this.state.uid + "/Friends");
    let allFriends = [];
    friendListRef.once("value", (data) => {
      data.forEach(function(friend) {
        let currentFriend = friend.val();
        let friendToPush = {
          id: currentFriend.friendId,
          username: currentFriend.friendUsername
        };
        allFriends.push(friendToPush);
      });  
      this.setState({
        friends: allFriends,
        toShareWith: allFriends[0].id //set default to first option on dropdown menu
      });
      this.determineShareList();
    });
  }

   //FINISH FUNCTIONALITY
  //goes through friends list to see who workout has been shared with and who hasn't
  determineShareList(){
    let notSharedList = []; 
    let alreadySharedList = []; 
    this.state.friends.forEach( (friend) => {
      this.state.eventUsers.includes(friend.id) ? 
        alreadySharedList.push(friend.username) 
        : notSharedList.push(friend.username);
    });
    this.setState({
      sharedFriends: alreadySharedList,
      notSharedFriends: notSharedList
    })
  }
  
  //allows user to select which friend to share with and option to submit
  toShareList(){
    
    return(
      <div>
        <select name="toShare" onChange={this.changeHandler}>
          {this.state.friends.map((friend, index) => 
            <option  value={friend.id} key={index}>{friend.username}</option>
          )}
        </select>
      </div>
    );   
  }

   //users who have already been shared with
  sharedList(){
    return(
      <div>
        <ul>
          {this.state.sharedFriends.map( (friend, index) =>
            <li key={index}>{friend}</li>
          )}
        </ul>
      </div>
    );
  }

  //sets state whenever dropdown option is selected
  changeHandler(event){
    this.setState({
      toShareWith: event.target.value
    })
  }

  //updates "shared with" list under the specified workout in Firebase w/selected user 
  shareHandler(){
    if(this.state.eventUsers.includes(this.state.toShareWith)){
      this.setState({warning: true})
    }
    else{
      this.setState({warning: false})
      let shareRef = fire.database().ref("Events/" + this.state.event + "/users");
      shareRef.once("value", (data) => {
          let sharedUsers = data.val();
          sharedUsers.push(this.state.toShareWith); //add new user to shared list
          shareRef.set(sharedUsers);
      });
      this.parseEventData();
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

        <h2>Share "{this.state.eventName}" Event</h2>
        <p>Shared with:</p>    

        {this.sharedList()} 

        <p>Share with:</p>       
        {this.toShareList()}

        <br></br>

        <input type="button" value="Share" onClick={this.shareHandler}></input>

        {this.state.warning == true ? 
          <p className="warning">Event has already been shared with this user</p>  
        :
          <p className="warning"></p>
        }

      </div>
    );
  }
}

export default ShareEvent;