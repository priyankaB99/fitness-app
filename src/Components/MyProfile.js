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
      selectedFavorite: "",
    };

    this.showGoalForm = this.showGoalForm.bind(this);
    this.showEditInfo = this.showEditInfo.bind(this);
    this.changeHandler = this.changeHandler.bind(this);
    this.submitHandler = this.submitHandler.bind(this);
    this.retrieveGoals = this.retrieveGoals.bind(this);
    this.showFavorite = this.showFavorite.bind(this);
    // this.goalComplete = this.goalComplete.bind(this);
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
        // completed: "incomplete",
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
        let eachGoal = {
          goal: goalsFromDatabase[key].goal,
          goalId: key,
          // completed: goalsFromDatabase[key].completed,
        };
        goalsData.push(eachGoal);
      }
      currentComponent.setState({ goals: goalsData });
    });
  }

  showEditInfo(event) {
    this.setState({ editInfoOpen: !this.state.editInfoOpen });
  }

  showFavorite(event) {
    this.setState({
      showWorkout: !this.state.showWorkout,
      selectedFavorite: event.target.parentNode.id,
    });
  }

  // goalComplete(event) {
  //   let goal = event.target.id;
  //   let currentUser = fire.auth().currentUser.uid;
  //   let goalsRef = fire
  //     .database()
  //     .ref("FitnessGoals/" + currentUser + "/" + goal);
  //   goalsRef.update({ completed: "complete" }).then(() => {
  //     this.retrieveGoals();
  //   });
  // }

  render() {
    return (
      <div id="myProfile">
        <h2> My Profile</h2>
        <div id="profileBox" class="workout">
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
          <div className="align-middle mx-4 d-inline-block">
            <p className="profileLabel">Name: </p>
            <p>
              {this.state.firstName} {this.state.lastName}
            </p>
          </div>
          <div className="align-middle mx-4 d-inline-block">
            <p className="profileLabel"> Birthday: </p>
            <p>{this.state.bday}</p>
          </div>
          <div className="align-middle mx-4 d-inline-block">
            <p className="profileLabel"> Username: </p>
            <p>{this.state.username}</p>
          </div>

          <button
            onClick={this.showEditInfo}
            type="button"
            id="editProfile"
            className="btn btn-secondary mx-4"
          >
            Edit Info
          </button>
        </div>
        <div id="goals" class="workout">
          <h3 className="mb-3"> Fitness Goals </h3>

          {this.state.addGoalOpen ? (
            <div>
              <button
                type="button"
                className="btn btn-secondary"
                id="addGoal"
                onClick={this.showGoalForm}
              >
                Close
              </button>
              <form className="py-3" onChange={this.changeHandler} onSubmit={this.submitHandler}>
                <input
                  type="text"
                  name="goalToAdd"
                  className="input-box"
                  placeholder="Enter Goal"
                />
                <input
                  type="submit"
                  className="my-2 btn btn-secondary"
                  value="Add"
                />
              </form>
            </div>
          ) : (
            <button
              type="button"
              className="btn btn-secondary"
              id="addGoal"
              onClick={this.showGoalForm}
            >
              Add Goal
            </button>
          )}
          <ol>
            {this.state.goals.map((data, index) => (
              <li key={data.goalId} id={data.goalId}>
                <p>{data.goal}</p>
                {/* <button onClick={this.goalComplete}> Done </button> */}
              </li>
            ))}
          </ol>
        </div>
        <div id="favWorkouts" className="workout">
          <h3 className="mb-3"> Favorite Workouts</h3>
          <div>
            {this.state.favorites.map((data, index) => (
              <div key={data.workoutId} id={data.workoutId}>
                <div className="workoutName" onClick={this.showFavorite}>
                  {data.name}
                </div>
              </div>
            ))}
            {this.state.showWorkout ? (
              <ShowFavorite
                closePopup={this.showFavorite}
                favoriteId={this.state.selectedFavorite}
              />
            ) : null}
          </div>
        </div>
      </div>
    );
  }
}
export default withRouter(MyProfile);
