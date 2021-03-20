import React from "react";
import fire from "../Firebase/fire";
import "firebase/auth";
import "firebase/database";
import { withRouter } from "react-router-dom";

//code pulled from https://itnext.io/building-a-dynamic-controlled-form-in-react-together-794a44ee552c

class CreateWorkout extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      name: "",
      timeLength: "",
      exercises: [{ exerciseName: "", reps: "" }],
      notes: "",
    };
    this.addExercise = this.addExercise.bind(this);
    this.submitHandler = this.submitHandler.bind(this);
    this.changeHandler = this.changeHandler.bind(this);
  }
  addExercise(event) {
    event.preventDefault();
    this.setState((prevState) => ({
      exercises: [...prevState.exercises, { exerciseName: "", reps: "" }],
    }));
  }

  submitHandler(event) {
    event.preventDefault();
    let currentUserId = fire.auth().currentUser.uid;
    let workoutRef = fire.database().ref("Workouts/");
    let newWorkoutRef = workoutRef.push();
    newWorkoutRef.set({
      name: this.state.name,
      creatorId: currentUserId,
      users: currentUserId,
      timeLength: this.state.timeLength,
      notes: this.state.notes,
      exercises: this.state.exercises,
    });
    console.log("successfully added workout to database");
    //refresh form
    this.setState({
      name: "",
      timeLength: "",
      exercises: [{ exerciseName: "", reps: "" }],
      notes: "",
    });
  }

  changeHandler(event) {
    if (["exerciseName", "reps"].includes(event.target.className)) {
      let exercises = [...this.state.exercises];
      exercises[event.target.dataset.id][event.target.className] =
        event.target.value;
      this.setState({ exercises }, () => console.log(this.state.exercises));
    } else {
      this.setState({ [event.target.name]: event.target.value });
    }
  }
  render() {
    let { name, timeLength, exercises, notes } = this.state;
    return (
      <form onSubmit={this.submitHandler}>
        <label htmlFor="name"> Workout Name: </label>
        <input
          type="text"
          name="name"
          value={name}
          onChange={this.changeHandler}
        />
        <label htmlFor="timeLength"> Time Length: </label>
        <input
          type="number"
          name="timeLength"
          value={timeLength}
          onChange={this.changeHandler}
        />
        {exercises.map((val, idx) => {
          let exerciseId = `exerciseName-${idx}`;
          let repsId = `reps-${idx}`;
          return (
            <div key={idx}>
              <label htmlFor={exerciseId}>{`Exercise #${idx + 1} Name`}:</label>
              <input
                type="text"
                name={exerciseId}
                data-id={idx}
                id={exerciseId}
                value={exercises[idx].exerciseName}
                className="exerciseName"
                onChange={this.changeHandler}
              />
              <label htmlFor={repsId}> Reps: </label>
              <input
                type="number"
                name={repsId}
                data-id={idx}
                id={repsId}
                value={exercises[idx].reps}
                className="reps"
                onChange={this.changeHandler}
              />
            </div>
          );
        })}
        <button onClick={this.addExercise}> Add Exercise </button>

        <label htmlFor="notes"> Notes/Links: </label>
        <input
          type="text"
          name="notes"
          value={notes}
          onChange={this.changeHandler}
        />
        <input type="submit" value="Create Workout" />
      </form>
    );
  }
}

export default withRouter(CreateWorkout);
