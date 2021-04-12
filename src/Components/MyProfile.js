import React from "react";
import fire from "../Firebase/fire";
import "firebase/auth";
import "firebase/database";
import { withRouter } from "react-router-dom";

class MyProfile extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      username: "",
      firstName: "",
      lastName: "",
      bday: "",
      location: "",
      pic: "",
      favorites: [],
      goals: "",
      displayUserId: this.props.displayUserId
    };

    this.addGoal = this.addGoal.bind(this);
  }

  componentDidMount() {
    let currentComponent = this;
    fire.auth().onAuthStateChanged(function (user) {
      if (user) {
        //retrieve profile information
        let currentUser = fire.auth().currentUser.uid;

        if (!fire.auth().currentUser.photoURL) {
          let storageRef = fire.storage().ref("person.png");
          storageRef.getDownloadURL().then((url) => {
            fire
              .auth()
              .currentUser.updateProfile({ photoURL: url })
              .then(() => {
                let profpic = fire.auth().currentUser.photoURL;
                currentComponent.setState({ pic: profpic });
              });
          });
        } else {
          const profpic = fire.auth().currentUser.photoURL;
          currentComponent.setState({ pic: profpic });
        }

        let usersRef = fire.database().ref("Users/" + currentUser);
        usersRef.on("value", function (data) {
          let info = data.val();
          currentComponent.setState({
            username: info.Username,
            firstName: info.firstName,
            lastName: info.lastName,
            bday: info.bday,
          });
          console.log(info);
        });

        // let file = this.state.profpic;
        //     let storageRef = fire
        //       .storage()
        //       .ref(authUser.user.uid + "/profilePicture/" + file.name);

        //     //upload profile picture to storage
        //     storageRef.put(file).then(() => {
        //       storageRef
        //         .getDownloadURL()
        //         .then((url) => {
        //           //update profile to include profile picture
        //           authUser.user.updateProfile({
        //             photoURL: url,
        //           });

        //           var userRef = fire
        //             .database()
        //             .ref("Users/" + authUser.user.uid);
        //           userRef.set({
        //             UserId: authUser.user.uid,
        //             Username: this.state.username,
        //             Email: this.state.email,
        //             firstName: this.state.firstName,
        //             lastName: this.state.lastName,
        //             bday: this.state.bday,
        //             pic: url,
        //           });
        //         })
        //         .catch((error) => {
        //           //error in retrieving url
        //           console.log(error);
        //         });
        //     });

        //retrieve favorite workouts
        let favoritesRef = fire
          .database()
          .ref("Favorites/" + currentUser + "/");

        let workoutsRef = fire.database().ref("Workouts");

        let favoritesData = [];
        let favoriteWorkouts = [];

        favoritesRef
          .once("value", function (data) {
            let info = data.val();
            for (const key in info) {
              favoritesData.push(info[key].workoutId);
            }
            console.log(favoritesData);
          })
          .then(() => {
            workoutsRef.once("value", function (data) {
              let workoutsFromDatabase = data.val();
              for (const key in workoutsFromDatabase) {
                for (const index in favoritesData) {
                  if (key === favoritesData[index]) {
                    let workout = {
                      name: workoutsFromDatabase[key].name,
                      workoutId: key,
                      exercises: workoutsFromDatabase[key].exercises,
                      timeLength: workoutsFromDatabase[key].timeLength,
                      notes: workoutsFromDatabase[key].notes,
                    };
                    favoriteWorkouts.push(workout);
                  }
                }
              }
              currentComponent.setState({ favorites: favoriteWorkouts });
            });
          });
      } else {
        console.log("signed out");
      }
    });
  }

  addGoal(event) {}
  render() {
    return (
      <div>
        <div id="profileBox">
          <h2> My Info</h2>
          <img
            id="profPic"
            src={this.state.pic}
            alt={this.state.username}
            width="100px"
            length="100px"
          ></img>
          <p>
            Name: {this.state.firstName} {this.state.lastName}
          </p>
          <p> Birthday: {this.state.bday}</p>
          <p> Username: {this.state.username}</p>
        </div>
        <div id="goals">
          <h2> Fitness Goals </h2>
          <button
            type="button"
            className="btn btn-secondary"
            id="addGoal"
            onClick={this.addGoal}
          >
            Add Goal
          </button>
        </div>
        <div id="favWorkouts">
          <h2> Favorite Workouts</h2>
          <div>
            {this.state.favorites.map((data, index) => (
              <div key={data.workoutId} id={data.workoutId} className="workout">
                <div className="workoutHeader">
                  <h3 id="workoutName">{data.name}</h3>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }
}
export default withRouter(MyProfile);
