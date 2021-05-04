import React from "react";
import fire from "../Firebase/fire";
import "firebase/auth";
import "firebase/database";
import { withRouter } from "react-router-dom";
import "../CSS/profile.css";
import ShowFavorite from "./ShowFavorite";

class UserProfile extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      username: "",
      firstName: "",
      lastName: "",
      location: "",
      pic: "",
      favorites: [],
      goals: [],
      displayUserId: this.props.displayUserId,
      showWorkout: false,
      selectedFavorite: "",
    };
    this.showFavorite = this.showFavorite.bind(this);
    this.retrieveGoals = this.retrieveGoals.bind(this);
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
        currentComponent.retrieveGoals(currentComponent.state.displayUserId);
      } else {
        console.log("signed out");
      }
    });
  }

  showFavorite(event) {
    this.setState({
      showWorkout: !this.state.showWorkout,
      selectedFavorite: event.target.parentNode.id,
    });
  }

  retrieveGoals(userId) {
    let currentComponent = this;
    let goalsRef = fire.database().ref("FitnessGoals/" + userId);
    let goalsData = [];
    goalsRef.once("value", function (data) {
      let goalsFromDatabase = data.val();
      for (const key in goalsFromDatabase) {
        let eachGoal = { goal: goalsFromDatabase[key].goal, goalId: key };
        goalsData.push(eachGoal);
      }
      currentComponent.setState({ goals: goalsData });
    });
  }

  render() {
    return (
      <div>
        <div className="mt-3" id="profileBox">
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
          <p> Username: {this.state.username}</p>
        </div>
        <div id="goals">
          <h3 className="mb-3">Fitness Goals</h3>
          <ol>
            {this.state.goals.map((data, index) => (
              <li key={data.goalId} id={data.goalId}>
                {data.goal}
              </li>
            ))}
          </ol>
        </div>
        <div id="favWorkouts">
          <h3 className="mb-3"> Favorite Workouts</h3>
          <div>
            {this.state.favorites.map((data, index) => (
              <div key={data.workoutId} id={data.workoutId}>
                <div className="workoutName" onClick={this.showFavorite}>
                  {data.name}
                </div>
                {this.state.showWorkout ? (
                  <ShowFavorite
                    closePopup={this.showFavorite}
                    favoriteId={this.state.selectedFavorite}
                  />
                ) : null}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }
}
export default withRouter(UserProfile);
