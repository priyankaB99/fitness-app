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
  }

  componentDidMount() {
    let currentUserId = fire.auth().currentUser.uid;
    let workoutsRef = fire.database().ref("Workouts");
    let workoutsData = [];
    workoutsRef
      .orderByChild("creatorId")
      .equalTo(currentUserId)
      .on("child_added", function (data) {
        let workout = {
          name: data.val().name,
          workoutId: data.key,
          exercises: data.val().exercises,
          timeLength: data.val().timeLength,
          notes: data.val().notes,
        };
        workoutsData.push(workout);
      });
    this.setState({ workouts: workoutsData });
  }
  render() {
    return (
      <div>
        <h2> My Saved Workouts</h2>
        <div>
          {this.state.workouts.map((data, index) => (
            <div key={data.workoutId} id={data.workoutId}>
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
            </div>
          ))}
        </div>
      </div>
    );
  }
}

export default withRouter(DisplayWorkouts);
