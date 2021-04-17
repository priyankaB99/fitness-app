import React from "react";
import fire from "../Firebase/fire";
import "firebase/auth";
import "firebase/database";
import { withRouter } from "react-router-dom";
import "../CSS/profile.css";
import ViewEditProfile from "./ViewEditProfile";
import ShowFavorite from "./ShowFavorite";
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
      goals: [],
      addGoalOpen: false,
      goalToAdd: "",
      editInfoOpen: false,
      showWorkout: false,
    };

    this.showGoalForm = this.showGoalForm.bind(this);
    this.showEditInfo = this.showEditInfo.bind(this);
    this.changeHandler = this.changeHandler.bind(this);
    this.submitHandler = this.submitHandler.bind(this);
    this.retrieveGoals = this.retrieveGoals.bind(this);
    this.showFavorite = this.showFavorite.bind(this);
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
        }
        // else {
        //   const profpic = fire.auth().currentUser.photoURL;
        //   currentComponent.setState({ pic: profpic });
        // }

        let usersRef = fire.database().ref("Users/" + currentUser);
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

        currentComponent.retrieveGoals();
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

        //add fitness goal
      } else {
        console.log("signed out");
      }
    });
  }

  showGoalForm(event) {
    this.setState({ addGoalOpen: !this.state.addGoalOpen });
  }

  changeHandler(event) {
    event.preventDefault();
    this.setState({ [event.target.name]: event.target.value });
  }

  submitHandler(event) {
    event.preventDefault();
    let currentUserId = fire.auth().currentUser.uid;
    //submit goal to database
    let goalsRef = fire.database().ref("FitnessGoals/" + currentUserId);
    let newGoalRef = goalsRef.push();
    newGoalRef
      .set({
        goal: this.state.goalToAdd,
      })
      .then(() => {
        this.setState({ addGoalOpen: !this.state.addGoalOpen });
        this.retrieveGoals();
      });
  }

  retrieveGoals() {
    let currentComponent = this;

    let currentUser = fire.auth().currentUser.uid;
    let goalsRef = fire.database().ref("FitnessGoals/" + currentUser);
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

  showEditInfo(event) {
    this.setState({ editInfoOpen: !this.state.editInfoOpen });
  }

  showFavorite() {
    this.setState({ showWorkout: !this.state.showWorkout });
  }

  render() {
    return (
      <div id="myProfile">
        <div id="profileBox" class="workout">
          <h2> My Info</h2>
          {this.state.editInfoOpen ? (
            <ViewEditProfile
              username={this.state.username}
              bday={this.state.bday}
              pic={this.state.pic}
              closePopup={this.showEditInfo}
            />
          ) : null}
          <img
            id="profPic"
            src={this.state.pic}
            alt={this.state.username}
          ></img>
          <p className="profileLabel">Name: </p>
          <p>
            {this.state.firstName} {this.state.lastName}
          </p>
          <p className="profileLabel"> Birthday: </p>
          <p>{this.state.bday}</p>
          <p className="profileLabel"> Username: </p>
          <p>{this.state.username}</p>
          <button
            onClick={this.showEditInfo}
            type="button"
            id="editProfile"
            className="btn btn-secondary"
          >
            Edit Info
          </button>
        </div>
        <div id="goals" class="workout">
          <h2> Fitness Goals </h2>
          <button
            type="button"
            className="btn btn-secondary"
            id="addGoal"
            onClick={this.showGoalForm}
          >
            Add Goal
          </button>
          {this.state.addGoalOpen ? (
            <form onChange={this.changeHandler} onSubmit={this.submitHandler}>
              <input type="text" name="goalToAdd" />
              <input type="submit" value="Add" />
            </form>
          ) : null}
          <ol>
            {this.state.goals.map((data, index) => (
              <li key={data.goalId} id={data.goalId}>
                {data.goal}
              </li>
            ))}
          </ol>
        </div>
        <div id="favWorkouts" className="workout">
          <h2> Favorite Workouts</h2>
          <div>
            {this.state.favorites.map((data, index) => (
              <div key={data.workoutId} id={data.workoutId}>
                <button
                  className="workoutName"
                  type="button"
                  onClick={this.showFavorite}
                >
                  {data.name}
                </button>
                {this.state.showWorkout ? (
                  <ShowFavorite
                    closePopup={this.showFavorite}
                    favoriteId={data.workoutId}
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
export default withRouter(MyProfile);
