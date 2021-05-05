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
      pic: this.props.pic,
      showEditUser: false,
      showEditProfPic: false,
      newUsername: "",
      newPic: "",
      warning: "",
    };

    this.toggle = this.toggle.bind(this);
  }

  toggle(event) {
    let changeItem = event.target.parentNode.id;
    if (changeItem === "editUsername") {
      this.setState({ showEditUser: !this.state.showEditUser });
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
    let currentComponent = this;
    const currentUser = fire.auth().currentUser;
    const currentUserId = fire.auth().currentUser.uid;
    let changeItem = event.target.parentNode.id;
    let username = this.state.newUsername;

    if (changeItem === "editUsername") {
      //check if username already exists
      const usernamesRef = fire.database().ref("Users/");
      let usernames = [];
      usernamesRef.once("value", function (data) {
        let info = data.val();
        for (const key in info) {
          usernames.push(info[key].Username);
        }
        if (usernames.includes(currentComponent.state.newUsername)) {
          currentComponent.setState({ warning: "Username taken" });
        } else {
          const userRef = fire.database().ref("Users/" + currentUserId);
          userRef.update({ Username: currentComponent.state.newUsername });
          currentUser
            .updateProfile({ displayName: currentComponent.state.newUsername })
            .then(() => {
              console.log("Sucessfully changed.");
              currentComponent.setState({
                newUsername: "",
                username: username,
                warning: "",
                showEditUser: false,
              });
            });
        }
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

            this.setState({ newPic: "", pic: url, showEditProfPic: false });
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
      <div className="popup" id="editProfBox">
        <p className="close" onClick={this.props.closePopup}>
          x
        </p>
        <div id="editProfPic" class="editBox">
          <img
            className="profpic"
            src={this.state.pic}
            width="100px"
            length="100px"
          ></img>
          {this.state.showEditProfPic ? (
            <form onSubmit={this.submitHandler}>
              <input
                onChange={this.profpicChange}
                className="input-box"
                type="file"
                name="newProfPic"
                accept="image/*"
                required
              />
              <input className="input-box" type="submit" value="Upload" />
              {this.state.warning !== "" && this.state.warning}
            </form>
          ) : null}
          <button
            id="editProfPicBtn"
            className="btn btn-secondary"
            onClick={this.toggle}
          >
            Edit
          </button>
        </div>

        <div id="editUsername" class="editBox">
          <p>Username: {this.state.username}</p>
          {this.state.showEditUser ? (
            <form onSubmit={this.submitHandler}>
              <input
                onChange={this.changeHandler}
                className="input-box"
                type="text"
                name="newUsername"
                value={this.state.newUsername}
                placeholder="Enter New Username"
                required
              />
              <input className="input-box" type="submit" value="Change Username" />
              {this.state.warning !== "" && this.state.warning}
            </form>
          ) : null}
          <button onClick={this.toggle} className="btn btn-secondary">
            Edit
          </button>
        </div>
        {/* <div id="editBday" class="editBox">
          <p>Birthday: {this.state.bday}</p>
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
          <button onClick={this.toggle} className="btn btn-secondary">
            Edit
          </button>
        </div> */}
      </div>
    );
  }
}

export default withRouter(ViewEditProfile);
