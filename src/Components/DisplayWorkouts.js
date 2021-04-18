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
      myWorkouts: [],
      sharedWorkouts: [],
      selectedWorkout: "", //workout ID 
      showEditPopup: false,
      showSharePopup: false,
      showFilter: false,
      filters: [],
      favorites: []
    };
    this.retrieveWorkouts = this.retrieveWorkouts.bind(this);
    this.retrieveFavorites = this.retrieveFavorites.bind(this);
    this.deleteWorkout = this.deleteWorkout.bind(this);
    this.favorite = this.favorite.bind(this);
    this.unfavorite = this.unfavorite.bind(this);
    this.toggleEditWorkout = this.toggleEditWorkout.bind(this);
    this.showFilter = this.showFilter.bind(this);
    this.filterChange = this.filterChange.bind(this);
    this.toggleShareWorkout = this.toggleShareWorkout.bind(this);
    this.createWorkoutDiv = this.createWorkoutDiv.bind(this);
    this.renderHeader = this.renderHeader.bind(this);
    this.renderExercises = this.renderExercises.bind(this);
    this.renderTagsAndNotes = this.renderTagsAndNotes.bind(this);
    this.renderAdminFunctions = this.renderAdminFunctions.bind(this);
    this.renderFavoriteFunctions = this.renderFavoriteFunctions.bind(this);
    this.displayMyWorkout = this.displayMyWorkout.bind(this);
    this.displaySharedWorkout = this.displaySharedWorkout.bind(this);
  }

  componentDidMount() {
    this.retrieveWorkouts();
    this.retrieveFavorites();
  }

  retrieveWorkouts() {
    fire.auth().onAuthStateChanged( (user) => {
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
              let workout = this.createWorkoutDiv(workoutsFromDatabase, key, false);
              myWorkouts.push(workout);
            }
            //shared workouts
            else if(workoutsFromDatabase[key].users.includes(currentUser)){
              let workout = this.createWorkoutDiv(workoutsFromDatabase, key, true);
              sharedWorkouts.push(workout);
            }
          }
          this.setState({ 
            myWorkouts: myWorkouts,
            sharedWorkouts: sharedWorkouts
          });
        });
      } else {
        console.log("signed out");
      }
    });
  }

  createWorkoutDiv(data, key, isShared){
    return({
      name: data[key].name,
      workoutId: key,
      exercises: data[key].exercises,
      timeLength: data[key].timeLength,
      notes: data[key].notes,
      tags: data[key].tags,
      shared: isShared
    });
  }
  retrieveFavorites() {
    let currentComponent = this;
    let currentUser = fire.auth().currentUser.uid;
    let favoritesRef = fire.database().ref("Favorites/" + currentUser + "/");
    let favorites = []
    favoritesRef.once("value", function (data) {
        let favoriteWorkouts = data.val();
        console.log("Favorites", favoriteWorkouts)
        for (const key in favoriteWorkouts) {
          favorites.push(favoriteWorkouts[key].workoutId)
        }
        currentComponent.setState({favorites: favorites})
    }).then(() => {
      console.log(currentComponent.state)
    })
  }

  favorite(event) {
    let currentUser = fire.auth().currentUser.uid;
    let workoutId = event.target.parentNode.parentNode.id;
    console.log(workoutId);

    let favoritesRef = fire.database().ref("Favorites/" + currentUser);
    let newFavoritesRef = favoritesRef.push();
    newFavoritesRef.set({ workoutId: workoutId }).then(() => {
      console.log("Workout successfully favorited");
    });
    this.retrieveFavorites();
  }

  unfavorite(event) {
    let currentUser = fire.auth().currentUser.uid;
    let workoutId = event.target.parentNode.parentNode.id;
    let favoritesRef = fire.database().ref("Favorites/" + currentUser + "/");
    let deletedId = "";
    favoritesRef.once("value", function (data) {
        let favoriteWorkouts = data.val();
        for (const key in favoriteWorkouts) {
          if (favoriteWorkouts[key].workoutId === workoutId) {
            deletedId = key;
          }
        }
      })
      .then(() => {
        console.log(deletedId);
        let deletedRef = fire.database().ref("Favorites/" + currentUser + "/" + deletedId);
        deletedRef.remove().then(() => {
          console.log("Successfully unfavorited");
        });
        this.retrieveFavorites();
      });
  }

  deleteWorkout(event) {
    let workoutsRef = fire.database().ref("Workouts/");
    workoutsRef.off("value");
    let workoutId = event.target.parentNode.parentNode.id;
    let deleteWorkoutRef = fire.database().ref("Workouts/" + workoutId);
    deleteWorkoutRef.remove();
    let changedWorkouts = this.state.myWorkouts;
    let deletedWorkoutIndex = "";
    for (const key in changedWorkouts) {
      if (changedWorkouts[key].workoutId === workoutId) {
        deletedWorkoutIndex = key;
      }
    }
    changedWorkouts.splice(deletedWorkoutIndex, 1);
    this.setState({ myWorkouts: changedWorkouts });
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

  toggleShareWorkout(event){
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
            currentComponent.setState({ myWorkouts: workoutsData });
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
                  notes: workoutsFromDatabase[key].notes
                };
                workoutsData.push(workout);
              }
            }
            currentComponent.setState({ myWorkouts: workoutsData });
          });
        } else {
          console.log("signed out");
        }
      });
    }
  }

  renderHeader(data){
    return(
      <div className = "header">
        <h3 className = "name">{data.name}</h3>
        <p className = "length">
          Workout Length: {data.timeLength} min
        </p>
      </div>
    )
  }

  renderExercises(data){
    return(
      <table className="exercises">
        <tbody>
          {data.exercises && data.exercises.map((exercise, index) => ( //&& used to catch if exercises is empty
            <tr key = {index}>
              <td><strong>{(index+1) + ". " + exercise.exerciseName}</strong></td>
              <td>{exercise.qty}</td>
              <td> {exercise.unit}</td>
            </tr>
          ))}
        </tbody>
      </table>
    )
  }

  renderTagsAndNotes(data){
    return(
      <div>
        <ul id="tags">
            {data.tags && data.tags.map( (tag, index) => { //&& used to catch if tags is empty
              <li key = {index} className = "tag">
                <span className = "tag-title">{tag}</span>
              </li>
            })}
        </ul>
        <p id="workoutNotes">Notes/Links: {data.notes}</p>
      </div>
    )
  }

  renderFavoriteFunctions(){
    return(
      <div className = "favoriteButtons">
        <button type="button" className="btn btn-secondary" id="favoriteBtn" onClick={this.favorite}>
          Favorite
        </button>
        <button type="button" className="btn btn-secondary" id="unfavoriteBtn" onClick={this.unfavorite}>
          Unfavorite
        </button>
      </div>
    )
  }

  renderAdminFunctions(){
    return(
      <div className = "adminButtons">
        <button type="button" className="btn btn-secondary" id="deleteBtn" onClick={this.deleteWorkout}>
          Delete
        </button>
        <button type="button" className="btn btn-secondary" id="editBtn" onClick={this.toggleEditWorkout}>
          Edit
        </button>
        <button type = "button" className="btn btn-secondary" id="shareBtn" onClick={this.toggleShareWorkout}>
          Share
        </button>
      </div>
    )
  }

  displayMyWorkout(data, index){
    return(
      <div className = "workout owner" key={index} id={data.workoutId}>
        {this.renderHeader(data)}
        {this.renderExercises(data)}
        {this.renderTagsAndNotes(data)}
        {this.renderFavoriteFunctions()}
        {this.renderAdminFunctions()}
      </div>
    );
  }

  //does not include edit, share, delete (only favorite and unfavorite)
  displaySharedWorkout(data, index){
    console.log(data);
    return(
      <div className = "workout shared" key={index} id={data.workoutId}>
        {this.renderHeader(data)}
        {this.renderExercises(data)}
        {this.renderTagsAndNotes(data)}
        {this.renderFavoriteFunctions()}
      </div>
    );
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
            <form onChange={this.filterChange}>
              <strong> Filter by Creator:</strong>
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
          ) : null}
        </div>

        {this.state.myWorkouts.map((data, index) => (
          this.displayMyWorkout(data, index)
        ))}

        {this.state.sharedWorkouts.map((data, index) => (
          this.displaySharedWorkout(data, index)
        ))}
         
      </div>
    );
  }
}

export default withRouter(DisplayWorkouts);
