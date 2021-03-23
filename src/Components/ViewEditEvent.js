import React from "react";
import fire from "../Firebase/fire";
import "firebase/auth";
import "firebase/database";
import "../CSS/ViewEditEvent.css";
import { format, parse } from "date-fns";

//Code Resources
// -https://codepen.io/bastianalbers/pen/PWBYvz?editors=0110

class ViewEditEvent extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      workout: this.props.selectedWorkout, //includes workoutId, workoutName, date, start, end
      workoutId: "",
      workoutName: "",
      workoutExercises: [],
      workoutNotes: "",
      workoutDate: this.props.selectedWorkout.date,
      workoutStart: this.props.selectedWorkout.start,
      workoutEnd: this.props.selectedWorkout.end,
      eventKey: this.props.selectedWorkout.eventKey,
    };
    this.parseWorkoutData = this.parseWorkoutData.bind(this);
    this.editEvent = this.editEvent.bind(this);
    this.formatDate = this.formatDate.bind(this);
    this.formatTime = this.formatTime.bind(this);
    this.formatExercises = this.formatExercises.bind(this);
    this.deleteEvent = this.deleteEvent.bind(this);
  }

  componentDidMount() {
    fire.auth().onAuthStateChanged((user) => {
      if (user) {
        // User is signed in
        this.parseWorkoutData();
      } else {
        // No user is signed in
        this.props.history.push("/login");
      }
    });
  }

  //adds workout id, name, and exercise array to state to use later
  parseWorkoutData() {
    let workoutId = this.state.workout.workoutId;
    let workoutRef = fire.database().ref("Workouts/" + workoutId);

    workoutRef.once("value", (data) => {
      //using arrow function => instead of function (data) preserves use of 'this' inside function
      let workoutData = data.val();
      this.setState({
        workoutId: workoutId,
        workoutName: workoutData.name,
        workoutExercises: workoutData.exercises,
        workoutNotes: workoutData.notes,
      });
    });
    console.log(this.state);
  }

  editEvent() {
    console.log("edit");
  }

  formatDate() {
    let date = parse(this.state.workoutDate, "yyyy-MM-dd", new Date());
    let weekday = format(date, "EEEE");
    let monthDay = format(date, "MMMM d");
    return weekday + ", " + monthDay;
  }

  formatTime() {
    if (this.state.workoutStart !== "" && this.state.workoutEnd !== "") {
      let start = parse(this.state.workoutStart, "HH:mm", new Date());
      let end = parse(this.state.workoutEnd, "HH:mm", new Date());
      let formattedStart = format(start, "h:mm b");
      let formattedEnd = format(end, "h:mm b");
      return formattedStart + " - " + formattedEnd;
    }
  }

  formatExercises() {
    let exercises = this.state.workoutExercises;
    console.log(exercises);
    let formattedExercises = [];

    formattedExercises = exercises.map((exercise, index) => (
      <div className="exercise">
        <div className="exerciseName">
          <b>{index + 1 + ". " + exercise.exerciseName}</b>
        </div>
        <div className="qty">
          {exercise.qty} {exercise.unit}
        </div>
      </div>
    ));
    return formattedExercises;
  }

  deleteEvent(event) {
    this.props.closePopup();
    this.props.deleteEvent(event);
  }

  render() {
    return (
      <div className="popup">
        <div>
          <p className="close" onClick={this.props.closePopup}>
            x
          </p>
        </div>

        <div className="workoutInfo" id={this.state.eventKey}>
          <div className="name">
            <h2>{this.state.workoutName}</h2>
          </div>

          <div className="dateTime">
            {this.formatDate() + " | "}
            {this.formatTime()}
          </div>

          <div className="notes"> Notes: {this.state.workoutNotes}</div>

          <button
            className="btn btn-secondary popup-buttons btn-sm"
            onClick={this.editEvent}
            disabled
          >
            Edit
          </button>
          <button
            className="btn btn-secondary popup-buttons btn-sm"
            onClick={this.deleteEvent}
          >
            Delete
          </button>
        </div>

        <hr></hr>

        <div className="exerciseBox">{this.formatExercises()}</div>
      </div>
    );
  }
}

export default ViewEditEvent;
