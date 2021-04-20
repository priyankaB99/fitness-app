import React from "react";
import fire from "../Firebase/fire";
import "firebase/auth";
import "firebase/database";

//Code Resources
// -https://codepen.io/bastianalbers/pen/PWBYvz?editors=0110

class DeleteWorkout extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      workout: this.props.selectedWorkout,
    };
    this.deleteWorkout = this.deleteWorkout.bind(this);
    // this.deleteAndClose = this.deleteAndClose.bind(this);
  }
  //   deleteAndClose() {
  //     this.deleteWorkout();
  //     // this.props.closePopup();
  //   }
  deleteWorkout() {
    let workoutsRef = fire.database().ref("Workouts/");
    workoutsRef.off("value");
    let deleteWorkoutRef = fire
      .database()
      .ref("Workouts/" + this.state.workout);
    deleteWorkoutRef.remove();
    // let changedWorkouts = this.state.myWorkouts;
    // let deletedWorkoutIndex = "";
    // for (const key in changedWorkouts) {
    //   if (changedWorkouts[key].workoutId === workoutId) {
    //     deletedWorkoutIndex = key;
    //   }
    // }
    // changedWorkouts.splice(deletedWorkoutIndex, 1);
    // this.setState({ myWorkouts: changedWorkouts });
    this.props.retrieveWorkouts();
  }

  render() {
    return (
      <div className="popup">
        <div>
          <p className="close" onClick={this.props.closePopup}>
            x
          </p>
        </div>
        <p> Are you sure you want to delete this workout? </p>
        <button className="btn btn-secondary" onClick={this.deleteWorkout}>
          Yes
        </button>
        <button className="btn btn-secondary" onClick={this.props.closePopup}>
          No
        </button>
      </div>
    );
  }
}

export default DeleteWorkout;
