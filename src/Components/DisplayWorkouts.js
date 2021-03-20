import React from "react";
import fire from "../Firebase/fire";
import "firebase/auth";
import "firebase/database";
import { withRouter } from "react-router-dom";

class DisplayWorkouts extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      workouts: [],
    };
    this.deleteWorkout = this.deleteWorkout.bind(this);
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
          for (const key in workoutsFromDatabase) {
            if (workoutsFromDatabase[key].creatorId == currentUser) {
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
      if (changedWorkouts[key].workoutId == workoutId) {
        deletedWorkoutIndex = key;
      }
    }
    changedWorkouts.splice(deletedWorkoutIndex, 1);
    this.setState({ workouts: changedWorkouts });
  }

  render() {
    return (
      <div>
        <h2> My Saved Workouts</h2>
        <div>
          {this.state.workouts.map((data, index) => (
            <div key={data.workoutId} id={data.workoutId} className="workout">
              <h3>
                Workout #{index + 1}: {data.name}
              </h3>
              <p> Length of Workout: {data.timeLength}</p>
              <ul>
                {data.exercises.map((exercise, index) => (
                  <li key={index}>
                    Exercise #{index + 1}: {exercise.exerciseName} Reps:{" "}
                    {exercise.reps}
                  </li>
                ))}
              </ul>
              <p> Notes/Links: {data.notes}</p>
              <button type="button" id="deleteBtn" onClick={this.deleteWorkout}>
                Delete Workout
              </button>
            </div>
          ))}
        </div>
      </div>
    );
  }
}

export default withRouter(DisplayWorkouts);
