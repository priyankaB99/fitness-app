import React from "react";
import fire from "../Firebase/fire";
import "firebase/auth";
import "firebase/database";
import { withRouter } from "react-router-dom";
import "../CSS/profile.css";
class UserProfile extends React.Component {
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
      displayUserId: this.props.displayUserId,
    };
  }

  componentDidMount() {
    let currentComponent = this;
    fire.auth().onAuthStateChanged(function (user) {
      if (user) {
        //retrieve profile information of friend
        let friendUser = currentComponent.state.displayUserId;

        let usersRef = fire.database().ref("Users/" + friendUser);
        usersRef.on("value", function (data) {
          let info = data.val();
          currentComponent.setState({
            username: info.Username,
            firstName: info.firstName,
            lastName: info.lastName,
            bday: info.bday,
            pic: info.pic,
          });
          console.log(info);
        });

        //retrieve favorite workouts
        let favoritesRef = fire.database().ref("Favorites/" + friendUser + "/");

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
        let goalsRef = fire.database().ref("FitnessGoals/" + friendUser);
        let goalsData = [];
        goalsRef.once("value", function (data) {
          let goalsFromDatabase = data.val();
          for (const key in goalsFromDatabase) {
            let eachGoal = { goal: goalsFromDatabase[key].goal, goalId: key };
            goalsData.push(eachGoal);
          }
          currentComponent.setState({ goals: goalsData });
        });
      } else {
        console.log("signed out");
      }
    });
  }

  showGoalForm(event) {}

  render() {
    return (
      <div>
        <div id="profileBox" class="workout">
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
        <div id="goals" class="workout">
          <h2> Fitness Goals </h2>
        </div>
        <div id="favWorkouts" class="workout">
          <h2> Favorite Workouts</h2>
          <div>
            {this.state.favorites.map((data, index) => (
              <div key={data.workoutId} id={data.workoutId}>
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
export default withRouter(UserProfile);
