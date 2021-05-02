import React from "react";
import fire from "../Firebase/fire";
import "firebase/auth";
import "firebase/database";
import { withRouter } from "react-router-dom";
import "../CSS/workouts.css";
import EditWorkout from "./EditWorkout";
import ShareWorkout from "./ShareWorkout";
import DeleteWorkout from "./DeleteWorkout";
import FavoriteButton from "./FavoriteButton";

import CreateWorkout from "./CreateWorkout";

class DisplayWorkouts extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      myWorkouts: [],
      sharedWorkouts: [],
      selectedWorkout: "", //workout ID
      showEditPopup: false,
      showSharePopup: false,
      showFilter: false,
      showConfirmDelete: false,
      filterBy: "",
      favorites: [],
      tags: [],
    };
    this.retrieveWorkouts = this.retrieveWorkouts.bind(this);
    // this.deleteWorkout = this.deleteWorkout.bind(this);
    this.toggleEditWorkout = this.toggleEditWorkout.bind(this);
    this.showFilter = this.showFilter.bind(this);
    this.filterByUser = this.filterByUser.bind(this);
    this.toggleShareWorkout = this.toggleShareWorkout.bind(this);
    this.createWorkoutDiv = this.createWorkoutDiv.bind(this);
    this.renderHeader = this.renderHeader.bind(this);
    this.renderExercises = this.renderExercises.bind(this);
    this.renderTagsAndNotes = this.renderTagsAndNotes.bind(this);
    this.renderAdminFunctions = this.renderAdminFunctions.bind(this);
    this.renderFavoriteFunctions = this.renderFavoriteFunctions.bind(this);
    this.displayMyWorkout = this.displayMyWorkout.bind(this);
    this.displaySharedWorkout = this.displaySharedWorkout.bind(this);
    this.retrieveFavorites = this.retrieveFavorites.bind(this);
    this.toggleDeleteWorkout = this.toggleDeleteWorkout.bind(this);
    this.renderRemoveFunction = this.renderRemoveFunction.bind(this);
    this.removeShared = this.removeShared.bind(this);
  }

  componentDidMount() {
    this.retrieveWorkouts();
    this.retrieveFavorites();
  }
  retrieveFavorites() {
    fire.auth().onAuthStateChanged((user) => {
      if (user) {
        let currentComponent = this;
        let currentUser = fire.auth().currentUser.uid;
        let favoritesRef = fire.database().ref("Favorites/" + currentUser);
        let favoritesData = [];
        favoritesRef.once("value", function (data) {
          let info = data.val();
          for (const key in info) {
            favoritesData.push(info[key].workoutId);
          }
          currentComponent.setState({ favorites: favoritesData });
        });
      }
    });
  }

  retrieveWorkouts() {
    fire.auth().onAuthStateChanged((user) => {
      if (user) {
        let currentUser = fire.auth().currentUser.uid;
        let workoutsRef = fire.database().ref("Workouts");
        let myWorkouts = [];
        let sharedWorkouts = [];
        workoutsRef.once("value", (data) => {
          let workoutsFromDatabase = data.val();

          //iterates through the returned json object
          for (const key in workoutsFromDatabase) {
            if (workoutsFromDatabase[key].creatorId === currentUser) {
              let workout = this.createWorkoutDiv(
                workoutsFromDatabase,
                key,
                false
              );
              myWorkouts.push(workout);
            }
            //shared workouts
            else if (
              workoutsFromDatabase[key].users.includes(currentUser) &&
              workoutsFromDatabase[key].creatorId !== currentUser
            ) {
              let workout = this.createWorkoutDiv(
                workoutsFromDatabase,
                key,
                true
              );
              sharedWorkouts.push(workout);
            }
          }
          this.setState({
            myWorkouts: myWorkouts,
            sharedWorkouts: sharedWorkouts,
          });
        });
      } else {
        console.log("signed out");
      }
    });
  }

  createWorkoutDiv(data, key, isShared) {
    if (isShared === true) {
      return {
        name: data[key].name,
        workoutId: key,
        exercises: data[key].exercises,
        timeLength: data[key].timeLength,
        notes: data[key].notes,
        tags: data[key].tags,
        owner: data[key].creatorUsername,
      };
    } else {
      return {
        name: data[key].name,
        workoutId: key,
        exercises: data[key].exercises,
        timeLength: data[key].timeLength,
        notes: data[key].notes,
        tags: data[key].tags,
        owner: "Me",
      };
    }
  }

  //should add remove workout option for shared workouts
  // deleteWorkout(event) {
  //   let workoutsRef = fire.database().ref("Workouts/");
  //   workoutsRef.off("value");
  //   let workoutId = event.target.parentNode.parentNode.parentNode.id;
  //   console.log(workoutId);
  //   let deleteWorkoutRef = fire.database().ref("Workouts/" + workoutId);
  //   deleteWorkoutRef.remove();
  //   let changedWorkouts = this.state.myWorkouts;
  //   let deletedWorkoutIndex = "";
  //   for (const key in changedWorkouts) {
  //     if (changedWorkouts[key].workoutId === workoutId) {
  //       deletedWorkoutIndex = key;
  //     }
  //   }
  //   changedWorkouts.splice(deletedWorkoutIndex, 1);
  //   this.setState({ myWorkouts: changedWorkouts });
  // }

  toggleDeleteWorkout(event) {
    let workoutId = event.target.parentNode.parentNode.id;
    this.setState({
      showConfirmDelete: !this.state.showConfirmDelete,
      selectedWorkout: workoutId,
    });
  }

  //Create pop-up of event details
  //Should be able to edit times, workout, etc.
  //https://codepen.io/bastianalbers/pen/PWBYvz?editors=0010
  toggleEditWorkout(event) {
    let workoutId = event.target.parentNode.parentNode.id;
    console.log(workoutId);
    this.setState({
      showEditPopup: !this.state.showEditPopup,
      selectedWorkout: workoutId,
    });
  }

  toggleShareWorkout(event) {
    let workoutId = event.target.parentNode.parentNode.id;
    this.setState({
      showSharePopup: !this.state.showSharePopup,
      selectedWorkout: workoutId,
    });
  }

  //Create pop up for filtering options
  showFilter(event) {
    this.setState({ showFilter: !this.state.showFilter });
  }

  //CAN MAKE THIS MORE EFFICIENT with "shared" attribute (see createWorkoutDiv function)
  //retrieve filtered creator element
  filterByUser(event) {
    if (event.target.value === "none") {
      this.retrieveWorkouts();
    } else if (event.target.value === "currentUser") {
      fire.auth().onAuthStateChanged((user) => {
        if (user) {
          let currentUser = fire.auth().currentUser.uid;
          let workoutsRef = fire.database().ref("Workouts");
          let myWorkouts = [];
          workoutsRef.once("value", (data) => {
            let workoutsFromDatabase = data.val();

            //iterates through the returned json object
            for (const key in workoutsFromDatabase) {
              if (workoutsFromDatabase[key].creatorId === currentUser) {
                let workout = this.createWorkoutDiv(
                  workoutsFromDatabase,
                  key,
                  false
                );
                myWorkouts.push(workout);
              }
              //shared workouts
            }
            this.setState({
              myWorkouts: myWorkouts,
              sharedWorkouts: [],
            });
          });
        } else {
          console.log("signed out");
        }
      });
    } else if (event.target.value === "otherUser") {
      fire.auth().onAuthStateChanged((user) => {
        if (user) {
          let currentUser = fire.auth().currentUser.uid;
          let workoutsRef = fire.database().ref("Workouts");
          let sharedWorkouts = [];
          workoutsRef.once("value", (data) => {
            let workoutsFromDatabase = data.val();

            //iterates through the returned json object
            for (const key in workoutsFromDatabase) {
              if (
                workoutsFromDatabase[key].users.includes(currentUser) &&
                workoutsFromDatabase[key].creatorId !== currentUser
              ) {
                let workout = this.createWorkoutDiv(
                  workoutsFromDatabase,
                  key,
                  true
                );
                sharedWorkouts.push(workout);
              }
            }
            this.setState({
              myWorkouts: [],
              sharedWorkouts: sharedWorkouts,
            });
          });
        } else {
          console.log("signed out");
        }
      });
    }
  }

  renderHeader(data) {
    return (
      <div className="header">
        <h3 className="name">{data.name}</h3>
        <p className="length">Workout Length: {data.timeLength} min</p>
        <p className="owner">Owner: {data.owner} </p>
      </div>
    );
  }

  renderExercises(data) {
    return (
      <table className="exercises">
        <tbody>
          {data.exercises &&
            data.exercises.map((
              exercise,
              index //&& used to catch if exercises is empty
            ) => (
              <tr key={index}>
                <td>
                  <strong>{index + 1 + ". " + exercise.exerciseName}</strong>
                </td>
                <td>{exercise.qty}</td>
                <td> {exercise.unit}</td>
              </tr>
            ))}
        </tbody>
      </table>
    );
  }

  renderTagsAndNotes(data) {
    return (
      <div>
        <ul id="tags">
          {data.tags &&
            data.tags.map((tag, index) => (
              //&& used to catch if tags is empty
              <li key={index} className="tag">
                <span className="tag-title">{tag}</span>
              </li>
            ))}
        </ul>
        {data.notes && <p id="workoutNotes">Notes/Links: {data.notes}</p>}
      </div>
    );
  }

  renderFavoriteFunctions(workoutId) {
    let favId = workoutId;
    if (this.state.favorites.includes(workoutId)) {
      return (
        <FavoriteButton
          favId={favId}
          isFavorite={true}
          reload={this.retrieveFavorites}
        />
      );
    } else {
      return (
        <FavoriteButton
          favId={favId}
          isFavorite={false}
          reload={this.retrieveFavorites}
        />
      );
    }
  }

  renderAdminFunctions() {
    return (
      <div className="adminButtons">
        <button
          type="button"
          className="btn btn-secondary displayButtons"
          id="deleteBtn"
          onClick={this.toggleDeleteWorkout}
        >
          Delete
        </button>

        <button
          type="button"
          className="btn btn-secondary displayButtons"
          id="editBtn"
          onClick={this.toggleEditWorkout}
        >
          Edit
        </button>
        <button
          type="button"
          className="btn btn-secondary displayButtons"
          id="shareBtn"
          onClick={this.toggleShareWorkout}
        >
          Share
        </button>
      </div>
    );
  }

  renderRemoveFunction() {
    return (
      <div className="removeBtn">
        <button
          type="button"
          className="btn btn-secondary displayButtons"
          onClick={this.removeShared}
        >
          Remove
        </button>
      </div>
    );
  }

  removeShared(event) {
    let workoutId = event.target.parentNode.parentNode.id;
    fire.auth().onAuthStateChanged((user) => {
      if (user) {
        let currentComponent = this;
        let currentUser = fire.auth().currentUser.uid;
        let users = [];
        let workoutsRef = fire.database().ref("Workouts/" + workoutId);
        workoutsRef.once("value", function (data) {
          users = data.val().users;
          //search through old array for current user
          let index = 0;
          console.log(currentUser);
          console.log(users);
          for (let i in users) {
            if (users[i] === currentUser) {
              index = i;
            }
          }
          users.splice(index, 1);
          console.log(users);
          workoutsRef.update({ users: users }).then(() => {
            console.log("You have removed this shared workout.");
            currentComponent.retrieveWorkouts();
          });
        });
      }
    });
  }

  onFilterChange = (event) => {
    this.setState({ filterBy: event.target.value });
  };

  renderFilter = () => {
    if (this.state.filterBy === "byUser") {
      return (
        <form onChange={this.filterByUser}>
          <br></br>
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
      );
    }
  };

  displayMyWorkout(data, index) {
    return (
      <div className="workout owner" key={index} id={data.workoutId}>
        {this.renderHeader(data)}
        {this.renderExercises(data)}
        {this.renderTagsAndNotes(data)}
        {this.renderFavoriteFunctions(data.workoutId)}
        {this.renderAdminFunctions()}
      </div>
    );
  }

  //does not include edit, share, delete (only favorite and unfavorite)
  displaySharedWorkout(data, index) {
    return (
      <div className="workout shared" key={index} id={data.workoutId}>
        {this.renderHeader(data)}
        {this.renderExercises(data)}
        {this.renderTagsAndNotes(data)}
        {this.renderRemoveFunction()}
        {this.renderFavoriteFunctions(data.workoutId)}
      </div>
    );
  }

  render() {
    return (
      <div>
        <h2> My Saved Workouts</h2>

        {/**https://medium.com/@daniela.sandoval/creating-a-popup-window-using-js-and-react-4c4bd125da57 */}
        {this.state.showEditPopup ? (
          <CreateWorkout
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

        {this.state.showConfirmDelete ? (
          <DeleteWorkout
            closePopup={this.toggleDeleteWorkout}
            retrieveWorkouts={this.retrieveWorkouts}
            selectedWorkout={this.state.selectedWorkout}
          />
        ) : null}

        <div id="filter-box">
          <button
            type="button"
            className="btn btn-secondary"
            id="filterBtn"
            onClick={this.showFilter}
          >
            Filter
          </button>

          {this.state.showFilter ? (
            <div>
              <strong> Filter by:</strong>
              <select
                type="select"
                name="filterBy"
                onChange={this.onFilterChange}
              >
                <option value="" hidden>
                  Select a filter
                </option>
                <option value="byUser"> Creator </option>
                <option value="byTag"> Tags </option>
              </select>
              {this.renderFilter()}
            </div>
          ) : null}
        </div>

        {this.state.myWorkouts.map((data, index) =>
          this.displayMyWorkout(data, index)
        )}

        {this.state.sharedWorkouts.map((data, index) =>
          this.displaySharedWorkout(data, index)
        )}
      </div>
    );
  }
}

export default withRouter(DisplayWorkouts);
