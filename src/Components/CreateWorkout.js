import React from "react";
import fire from "../Firebase/fire";
import "firebase/auth";
import "firebase/database";
import { withRouter } from "react-router-dom";
import "./workouts.css";
//code pulled from https://itnext.io/building-a-dynamic-controlled-form-in-react-together-794a44ee552c

class CreateWorkout extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      name: "",
      timeLength: "",
      exercises: [{ exerciseName: "", qty: "", unit: "reps" }],
      notes: "",
    };
    this.addExercise = this.addExercise.bind(this);
    this.deleteExercise = this.deleteExercise.bind(this);
    this.submitHandler = this.submitHandler.bind(this);
    this.changeHandler = this.changeHandler.bind(this);
  }

  //function to produce dynamic form input for each exercise
  addExercise(event) {
    event.preventDefault();
    this.setState((prevState) => ({
      exercises: [
        ...prevState.exercises,
        { exerciseName: "", qty: "", unit: "reps" },
      ],
    }));
  }

  deleteExercise(event) {
    event.preventDefault();
    let arrayIdx = event.target.parentNode.getAttribute("data-arrayIdx");
    let exercisesArray = [...this.state.exercises];
    exercisesArray.splice(arrayIdx, 1);
    this.setState({ exercises: exercisesArray });
  }
  submitHandler(event) {
    event.preventDefault();

    let currentUserId = fire.auth().currentUser.uid;
    //add to workouts table
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
    alert(
      "Workout added! Visit 'My Workouts' to see all your saved workouts or 'Home' to create an event with your new workout."
    );
    //refresh form
    this.setState({
      name: "",
      timeLength: "",
      exercises: [{ exerciseName: "", qty: "", unit: "" }],
      notes: "",
    });
  }

  changeHandler(event) {
    if (["exerciseName", "qty", "unit"].includes(event.target.className)) {
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
      <div>
        <h2>Create a New Workout</h2>
        <form id="createForm" onSubmit={this.submitHandler}>
          <label htmlFor="name"> Workout Name: </label>
          <input
            type="text"
            name="name"
            value={name}
            onChange={this.changeHandler}
            required
          />
          <label htmlFor="timeLength"> Total Workout Length (Minutes): </label>
          <input
            type="number"
            name="timeLength"
            value={timeLength}
            onChange={this.changeHandler}
            min="0"
            required
          />
          {exercises.map((val, idx) => {
            let exerciseId = `exerciseName-${idx}`;
            let qtyId = `qty-${idx}`;
            let unitId = `unit-${idx}`;
            return (
              <div key={idx} class="exercise-list">
                <div className="eachExercise" data-arrayIdx={idx}>
                  <p> {`Exercise #${idx + 1}`}</p>
                  <label htmlFor={exerciseId}>Name:</label>
                  <input
                    type="text"
                    name={exerciseId}
                    data-id={idx}
                    id={exerciseId}
                    value={exercises[idx].exerciseName}
                    className="exerciseName"
                    onChange={this.changeHandler}
                    required
                  />
                  <label htmlFor={qtyId}> Quantity: </label>
                  <input
                    type="number"
                    name={qtyId}
                    data-id={idx}
                    id={qtyId}
                    value={exercises[idx].qty}
                    className="qty"
                    onChange={this.changeHandler}
                    min="0"
                    required
                  />
                  <select
                    name={unitId}
                    data-id={idx}
                    id={unitId}
                    className="unit"
                    onChange={this.changeHandler}
                    required
                    value={exercises[idx].unit}
                  >
                    <option value="reps"> reps </option>
                    <option value="secs"> seconds</option>
                    <option value="min"> minutes </option>
                  </select>
                  <button class="deleteExercise" onClick={this.deleteExercise}>
                    X
                  </button>
                </div>
              </div>
            );
          })}
          <button
            type="button"
            id="add-exercise"
            className="btn btn-secondary"
            onClick={this.addExercise}
          >
            Add Another Exercise
          </button>

          <label htmlFor="notes"> Notes/Links: </label>
          <textarea
            type="textarea"
            name="notes"
            value={notes}
            onChange={this.changeHandler}
          ></textarea>

          <input
            id="createBtn"
            className="btn btn-secondary"
            type="submit"
            value="Finish Creating Workout"
          />
        </form>
      </div>
    );
  }
}

export default withRouter(CreateWorkout);
