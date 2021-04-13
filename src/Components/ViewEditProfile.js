import React from "react";
import fire from "../Firebase/fire";
import "firebase/auth";
import "firebase/database";
import { withRouter } from "react-router-dom";
import "../CSS/profile.css";

class ViewEditProfile extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      username: this.props.username,
      bday: this.props.bday,
      pic: this.props.pic,
      showEditUser: false,
      showEditBday: false,
      showEditProfPic: false,
      newUsername: "",
      newBday: "",
      newPic: "",
    };

    this.toggle = this.toggle.bind(this);
  }

  toggle(event) {
    let changeItem = event.target.parentNode.id;
    if (changeItem === "editUsername") {
      this.setState({ showEditUser: !this.state.showEditUser });
    } else if (changeItem === "editBday") {
      this.setState({ showEditBday: !this.state.showEditBday });
    } else if (changeItem === "editProfPic") {
      this.setState({ showEditProfPic: !this.state.showEditProfPic });
    }
  }

  changeHandler = (event) => {
    event.preventDefault();
    this.setState({ [event.target.name]: event.target.value });
  };

  profpicChange = (event) => {
    this.setState({ newPic: event.target.files[0] });
  };

  submitHandler = (event) => {
    event.preventDefault();
    const currentUser = fire.auth().currentUser;
    const currentUserId = fire.auth().currentUser.uid;
    let changeItem = event.target.parentNode.id;
    if (changeItem === "editUsername") {
      const userRef = fire.database().ref("Users/" + currentUserId);
      userRef.update({ Username: this.state.newUsername });
      currentUser
        .updateProfile({ displayName: this.state.newUsername })
        .then(() => {
          console.log("Sucessfully changed.");
          this.setState({ newUsername: "" });
        });
    } else if (changeItem === "editBday") {
      const userRef = fire.database().ref("Users/" + currentUserId);
      userRef.update({ bday: this.state.newBday }).then(() => {
        console.log("Successfully changed");
        this.setState({ newBday: "" });
      });
    } else if (changeItem === "editProfPic") {
      let file = this.state.newPic;
      let storageRef = fire
        .storage()
        .ref(currentUserId + "/profilePicture/" + "mostRecent");

      //upload profile picture to storage
      storageRef.put(file).then(() => {
        console.log("Image uploaded successfully");
        storageRef
          .getDownloadURL()
          .then((url) => {
            //update profile to include profile picture
            currentUser.updateProfile({
              photoURL: url,
            });

            const userRef = fire.database().ref("Users/" + currentUserId);
            userRef.update({ pic: url });

            this.setState({ newPic: "" });
          })
          .catch((error) => {
            //error in retrieving url
            console.log(error);
          });
      });
    }
  };

  render() {
    return (
      <div className="popup">
        <p className="close" onClick={this.props.closePopup}>
          x
        </p>
        <div id="editProfPic">
          <img src={this.state.pic} width="100px" length="100px"></img>
          <button id="editProfPic" onClick={this.toggle}>
            Edit
          </button>
          {this.state.showEditProfPic ? (
            <form onSubmit={this.submitHandler}>
              <input
                onChange={this.profpicChange}
                type="file"
                name="newProfPic"
                accept="image/*"
              />
              <input type="submit" value="Upload New Profile Picture" />
            </form>
          ) : null}
        </div>
        <div id="editUsername">
          <p>Username: {this.state.username}</p>
          <button onClick={this.toggle}>Edit</button>
          {this.state.showEditUser ? (
            <form onSubmit={this.submitHandler}>
              <input
                onChange={this.changeHandler}
                type="text"
                name="newUsername"
                value={this.state.newUsername}
              />
              <input type="submit" value="Change Username" />
            </form>
          ) : null}
        </div>
        <div id="editBday">
          <p>Birthday: {this.state.bday}</p>
          <button onClick={this.toggle}>Edit</button>
          {this.state.showEditBday ? (
            <form onSubmit={this.submitHandler}>
              <input
                value={this.state.newBday}
                onChange={this.changeHandler}
                type="date"
                name="newBday"
              />
              <input type="submit" value="Change Birthday" />
            </form>
          ) : null}
        </div>
      </div>
    );
  }
}

export default withRouter(ViewEditProfile);
