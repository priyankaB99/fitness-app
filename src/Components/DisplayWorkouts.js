import React from "react";
import fire from "../Firebase/fire";
import "firebase/auth";
import "firebase/database";
import { withRouter } from "react-router-dom";
import "../CSS/workouts.css";
import EditWorkout from "./EditWorkout";

class DisplayWorkouts extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      workouts: [],
      selectedWorkout: "",
      showPopup: false,
      showFilter: false,
      filters: [],
    };
    this.retrieveWorkouts = this.retrieveWorkouts.bind(this);
    this.deleteWorkout = this.deleteWorkout.bind(this);
    this.favorite = this.favorite.bind(this);
    this.unfavorite = this.unfavorite.bind(this);
    this.toggleEditWorkout = this.toggleEditWorkout.bind(this);
    this.showFilter = this.showFilter.bind(this);
    this.filterChange = this.filterChange.bind(this);
    this.applyFilters = this.applyFilters.bind(this);
  }

  componentDidMount() {
    this.retrieveWorkouts();
  }

  retrieveWorkouts() {
    let currentComponent = this;
    fire.auth().onAuthStateChanged(function (user) {
      if (user) {
        let currentUser = fire.auth().currentUser.uid;
        let workoutsRef = fire.database().ref("Workouts");
        let workoutsData = [];
        workoutsRef.once("value", function (data) {
          let workoutsFromDatabase = data.val();
          //iterates through the returned json object
          for (const key in workoutsFromDatabase) {
            if (workoutsFromDatabase[key].creatorId === currentUser) {
              let workout = {
                name: workoutsFromDatabase[key].name,
                workoutId: key,
                exercises: workoutsFromDatabase[key].exercises,
                timeLength: workoutsFromDatabase[key].timeLength,
                notes: workoutsFromDatabase[key].notes,
              };
              workoutsData.push(workout);
            }
          }
          currentComponent.setState({ workouts: workoutsData });
        });
      } else {
        console.log("signed out");
      }
    });
  }

  favorite(event) {
    let currentUser = fire.auth().currentUser.uid;
    let workoutId = event.target.parentNode.id;
    console.log(workoutId);
    let favoritesRef = fire.database().ref("Favorites/" + currentUser);
    let newFavoritesRef = favoritesRef.push();
    newFavoritesRef.set({ workoutId: workoutId }).then(() => {
      console.log("Workout successfully favorited");
    });
  }

  unfavorite(event) {
    let currentUser = fire.auth().currentUser.uid;
    let workoutId = event.target.parentNode.id;
    let favoritesRef = fire.database().ref("Favorites/" + currentUser + "/");
    let deletedId = "";
    favoritesRef
      .once("value", function (data) {
        let favoriteWorkouts = data.val();
        for (const key in favoriteWorkouts) {
          if (favoriteWorkouts[key].workoutId === workoutId) {
            deletedId = key;
          }
        }
      })
      .then(() => {
        console.log(deletedId);
        let deletedRef = fire
          .database()
          .ref("Favorites/" + currentUser + "/" + deletedId);
        deletedRef.remove().then(() => {
          console.log("Successfully unfavorited");
        });
      });
  }

  deleteWorkout(event) {
    let workoutsRef = fire.database().ref("Workouts/");
    workoutsRef.off("value");
    let workoutId = event.target.parentNode.id;
    console.log(workoutId);
    let deleteWorkoutRef = fire.database().ref("Workouts/" + workoutId);
    deleteWorkoutRef.remove();
    let changedWorkouts = this.state.workouts;
    let deletedWorkoutIndex = "";
    for (const key in changedWorkouts) {
      if (changedWorkouts[key].workoutId === workoutId) {
        deletedWorkoutIndex = key;
      }
    }
    changedWorkouts.splice(deletedWorkoutIndex, 1);
    this.setState({ workouts: changedWorkouts });
  }

  //Create pop-up of event details
  //Should be able to edit times, workout, etc.
  //https://codepen.io/bastianalbers/pen/PWBYvz?editors=0010
  toggleEditWorkout(event) {
    let workoutId = event.target.parentNode.id;
    this.setState({
      showPopup: !this.state.showPopup,
      selectedWorkout: workoutId,
    });
  }

  //Create pop up for filtering options
  showFilter(event) {
    this.setState({ showFilter: !this.state.showFilter });
  }

  //retrieve filtered creator element
  filterChange(event) {
    let checkedOptions = this.state.filters;
    if (event.target.checked === true) {
      checkedOptions.push(event.target.value);
      this.setState({ filters: checkedOptions });
    } else {
      let deletedIndex = "";
      for (const index in checkedOptions) {
        if (checkedOptions[index] === event.target.value);
        deletedIndex = index;
      }
      checkedOptions.splice(deletedIndex, 1);
      this.setState({ filters: checkedOptions });
    }
  }

  applyFilters(event) {
    event.preventDefault();
    let filters = this.state.filters;
    if (filters.length === 0) {
      this.retrieveWorkouts();
    } else if (filters.includes("currentUser")) {
      let currentComponent = this;
      fire.auth().onAuthStateChanged(function (user) {
        if (user) {
          let currentUser = fire.auth().currentUser.uid;
          let workoutsRef = fire.database().ref("Workouts");
          let workoutsData = [];
          workoutsRef.once("value", function (data) {
            let workoutsFromDatabase = data.val();
            //iterates through the returned json object
            for (const key in workoutsFromDatabase) {
              if (workoutsFromDatabase[key].creatorId !== currentUser) {
                let workout = {
                  name: workoutsFromDatabase[key].name,
                  workoutId: key,
                  exercises: workoutsFromDatabase[key].exercises,
                  timeLength: workoutsFromDatabase[key].timeLength,
                  notes: workoutsFromDatabase[key].notes,
                };
                workoutsData.push(workout);
              }
            }
            currentComponent.setState({ workouts: workoutsData });
          });
        } else {
          console.log("signed out");
        }
      });
    } else if (filters.includes("otherUser")) {
      let currentComponent = this;
      fire.auth().onAuthStateChanged(function (user) {
        console.log("check 17");
        if (user) {
          let currentUser = fire.auth().currentUser.uid;
          let workoutsRef = fire.database().ref("Workouts");
          let workoutsData = [];
          workoutsRef.once("value", function (data) {
            let workoutsFromDatabase = data.val();
            //iterates through the returned json object
            for (const key in workoutsFromDatabase) {
              if (workoutsFromDatabase[key].creatorId === currentUser) {
                let workout = {
                  name: workoutsFromDatabase[key].name,
                  workoutId: key,
                  exercises: workoutsFromDatabase[key].exercises,
                  timeLength: workoutsFromDatabase[key].timeLength,
                  notes: workoutsFromDatabase[key].notes,
                };
                workoutsData.push(workout);
              }
            }
            currentComponent.setState({ workouts: workoutsData });
          });
        } else {
          console.log("signed out");
        }
      });
    }
  }
  render() {
    return (
      <div>
        <h2> My Saved Workouts</h2>

        {/**https://medium.com/@daniela.sandoval/creating-a-popup-window-using-js-and-react-4c4bd125da57 */}
        {this.state.showPopup ? (
          <EditWorkout
            closePopup={this.toggleEditWorkout}
            retrieveWorkouts={this.retrieveWorkouts}
            selectedWorkout={this.state.selectedWorkout}
          />
        ) : null}
        <div>
          <button type="button" id="filterBtn" onClick={this.showFilter}>
            Filter
          </button>
          {this.state.showFilter ? (
            <form onChange={this.filterChange}>
              <p> Filter by Creator:</p>
              <input
                type="checkbox"
                name="filter"
                id="currentUserFilter"
                value="currentUser"
              />
              <label htmlFor="currentUserFilter"> Me </label>
              <br></br>
              <input
                type="checkbox"
                name="filter"
                id="otherUserFilter"
                value="otherUser"
              />
              <label htmlFor="otherUserFilter"> Other Users </label>
              {/* <p> Filter by Created Date: </p>
              <input
                type="checkbox"
                name="filter"
                id="todayFilter"
                value="today"
              />
              <label htmlFor="todayFilter"> Today </label>
              <br></br>
              <input
                type="checkbox"
                name="filter"
                id="yesterdayFilter"
                value="yesterday"
              />
              <label htmlFor="yesterdayFilter"> Yesterday </label>
              <br></br> */}
            </form>
          ) : null}
        </div>
        <div>
          {this.state.workouts.map((data, index) => (
            <div key={data.workoutId} id={data.workoutId} className="workout">
              <div className="workoutHeader">
                <h3 id="workoutName">
                  Workout #{index + 1}: {data.name}
                </h3>
                <p id="workoutLength">
                  Length of Workout: {data.timeLength} min
                </p>
              </div>
              <table id="exercises">
                <tbody>
                  {data.exercises.map((exercise, index) => (
                    <tr key={index}>
                      <td>
                        <strong>{index + 1}:</strong> {exercise.exerciseName}{" "}
                      </td>
                      <td>{exercise.qty}</td>
                      <td> {exercise.unit}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <p id="workoutNotes"> Notes/Links: {data.notes}</p>
              <button
                type="button"
                className="btn btn-secondary"
                id="deleteBtn"
                onClick={this.deleteWorkout}
              >
                Delete
              </button>
              <button
                type="button"
                className="btn btn-secondary"
                id="favoriteBtn"
                onClick={this.favorite}
              >
                Favorite
              </button>
              <button
                type="button"
                className="btn btn-secondary"
                id="unfavoriteBtn"
                onClick={this.unfavorite}
              >
                Unfavorite
              </button>
              <button
                type="button"
                className="btn btn-secondary"
                id="editBtn"
                onClick={this.toggleEditWorkout}
              >
                Edit
              </button>
            </div>
          ))}
        </div>
      </div>
    );
  }
}

export default withRouter(DisplayWorkouts);
