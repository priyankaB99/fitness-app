import React from "react";
import fire from "../Firebase/fire";
import "firebase/auth";
import "firebase/database";
import { withRouter } from "react-router-dom";
import "./workouts.css";
class DisplayWorkouts extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      workouts: [],
    };
    this.deleteWorkout = this.deleteWorkout.bind(this);
    this.editWorkout = this.editWorkout.bind(this);
  }

  componentDidMount() {
    let currentComponent = this;
    fire.auth().onAuthStateChanged(function (user) {
      console.log("check 17");
      if (user) {
        let currentUser = fire.auth().currentUser.uid;
        let workoutsRef = fire.database().ref("Workouts");
        let workoutsData = [];
        workoutsRef.on("value", function (data) {
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
        this.props.history.push("/login");
      }
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

  editWorkout(event) {
    let workoutId = event.target.parentNode.id;
    console.log(workoutId);
  }
  render() {
    return (
      <div>
        <h2> My Saved Workouts</h2>
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
                id="editBtn"
                onClick={this.editWorkout}
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
