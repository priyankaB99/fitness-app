import React from "react";
import fire from "../Firebase/fire";
import "firebase/auth";
import "firebase/database";
import { withRouter } from "react-router-dom";
import "../CSS/workouts.css";
import EditWorkout from "./EditWorkout";
import ShareWorkout from "./ShareWorkout";

class DisplayWorkouts extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      workouts: [],
      selectedWorkout: "", //workout ID 
      showEditPopup: false,
      showSharePopup: false,
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
    this.toggleShareWorkout = this.toggleShareWorkout.bind(this);
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
                tags: workoutsFromDatabase[key].tags,
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
      showEditPopup: !this.state.showEditPopup,
      selectedWorkout: workoutId,
    });
  }

  toggleShareWorkout(event){
    let workoutId = event.target.parentNode.id;
    this.setState({
      showSharePopup: !this.state.showSharePopup,
      selectedWorkout: workoutId,
    });    
  }

  //Create pop up for filtering options
  showFilter(event) {
    this.setState({ showFilter: !this.state.showFilter });
  }

  //retrieve filtered creator element
  filterChange(event) {
    if (event.target.value === "none") {
      this.retrieveWorkouts();
    } else if (event.target.value === "currentUser") {
      let currentComponent = this;
      fire.auth().onAuthStateChanged(function (user) {
        if (user) {
          let currentUser = fire.auth().currentUser.uid;
          let workoutsRef = fire.database().ref("Workouts");
          let workoutsData = [];
          workoutsRef.once("value", function (data) {
            let workoutsFromDatabase = data.val();
            //iterates through the returned json object and parses each workout
            for (const key in workoutsFromDatabase) {
              if (
                workoutsFromDatabase[key].creatorId === currentUser &&
                workoutsFromDatabase[key].users.includes(currentUser)
              ) {
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
    } else if (event.target.value === "otherUser") {
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
              if (
                workoutsFromDatabase[key].creatorId !== currentUser &&
                workoutsFromDatabase[key].users.includes(currentUser)
              ) {
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
        {this.state.showEditPopup ? (
          <EditWorkout
            closePopup={this.toggleEditWorkout}
            retrieveWorkouts={this.retrieveWorkouts}
            selectedWorkout={this.state.selectedWorkout}
          />
        ) : null}

        {this.state.showSharePopup ? (
          <ShareWorkout
            closePopup={this.toggleShareWorkout}
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
                type="radio"
                name="filter"
                id="noFilter"
                value="none"
                defaultChecked
              />
              <label htmlFor="currentUserFilter"> None </label>
              <br></br>
              <input
                type="radio"
                name="filter"
                id="currentUserFilter"
                value="currentUser"
              />
              <label htmlFor="currentUserFilter"> Me </label>
              <br></br>
              <input
                type="radio"
                name="filter"
                id="otherUserFilter"
                value="otherUser"
              />
              <label htmlFor="otherUserFilter"> Other Users </label>
             
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
              <table className="exercises">
                <tbody>
                  {data.exercises &&
                    data.exercises.map((exercise, index) => (
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
              <ul id="tags">
                {data.tags &&
                  data.tags.map((tag, index) => (
                    <li key={index} className="tag">
                      <span className="tag-title">{tag}</span>
                    </li>
                  ))}
              </ul>
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

              <button
                type = "button"
                className="btn btn-secondary"
                id="shareBtn"
                onClick={this.toggleShareWorkout}>
                  Share
              </button>
            </div>
          ))}
        </div>
      </div>
    );
  }
}

export default withRouter(DisplayWorkouts);
