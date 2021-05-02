import React from "react";
import fire from "../Firebase/fire";
import "firebase/auth";
import "firebase/database";
import "../CSS/EditWorkout.css";
// import { format, parse } from "date-fns";

//Code Resources
// -https://codepen.io/bastianalbers/pen/PWBYvz?editors=0110

class EditWorkout extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      workout: this.props.selectedWorkout, //includes workoutId, workoutName, date, start, end
      workoutName: "",
      workoutLength: "",
      workoutExercises: [],
      workoutNotes: "",
      eventKey: this.props.selectedWorkout.eventKey,
    };
    this.parseWorkoutData = this.parseWorkoutData.bind(this);
    this.addExercise = this.addExercise.bind(this);
    this.deleteExercise = this.deleteExercise.bind(this);
    this.submitHandler = this.submitHandler.bind(this);
    this.changeHandler = this.changeHandler.bind(this);
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

  // //adds workout id, name, and exercise array to state to use later
  parseWorkoutData() {
    let workoutRef = fire.database().ref("Workouts/" + this.state.workout);

    workoutRef.once("value", (data) => {
      //using arrow function => instead of function (data) preserves use of 'this' inside function
      let workoutData = data.val();
      if (workoutData) {
        this.setState({
          workoutName: workoutData.name,
          workoutLength: workoutData.timeLength,
          workoutExercises: workoutData.exercises,
          workoutNotes: workoutData.notes,
          workoutTags: workoutData.tags
        });
      } else {
        console.log("Workout No Longer Exists");
      }
    });
  }

   //function to produce dynamic form input for each exercise
   addExercise(event) {
    event.preventDefault();
    this.setState((prevState) => ({
      workoutExercises: [
        ...prevState.workoutExercises,
        { exerciseName: "", qty: "", unit: "reps" },
      ],
    }));
  }

  deleteExercise(event) {
    event.preventDefault();
    let arrayIdx = event.target.parentNode.getAttribute("data-arrayidx");
    let exercisesArray = [...this.state.workoutExercises];
    exercisesArray.splice(arrayIdx, 1);
    this.setState({ exercises: exercisesArray });
  }

  //submit edits to FireBase
  submitHandler(event) {
    event.preventDefault();
    //reference to existing workout
    let workoutRef = fire.database().ref("Workouts/" + this.state.workout);
    console.log(workoutRef);

    workoutRef.update({
      name: this.state.workoutName,
      timeLength: this.state.workoutLength,
      notes: this.state.workoutNotes,
      exercises: this.state.workoutExercises,
    });
    this.props.retrieveWorkouts();
    console.log("successfully edited workout in database");
    alert(
      "Your workout has been edited!"
    );
  }

  changeHandler(event) {
    if (["exerciseName", "qty", "unit"].includes(event.target.className)) {
      let exercises = [...this.state.workoutExercises];
      exercises[event.target.dataset.id][event.target.className] =
        event.target.value;
      this.setState({ exercises }, () => console.log(this.state.workoutExercises));
    } else {
      this.setState({ [event.target.name]: event.target.value });
    }
  }

  render() {
    let { workoutName, workoutLength, workoutExercises, workoutNotes } = this.state;
    return (
      <div className="popup">
        <div>
          <p className="close" onClick={this.props.closePopup}>
            x
          </p>
        </div>    

      <div>
        <h2>Edit Workout</h2>
        <form id="createForm" onSubmit={this.submitHandler}>
          <label htmlFor="workoutName"> Workout Name: </label>
          <input
            type="text"
            name="workoutName"
            className="input-box"
            value={workoutName}
            onChange={this.changeHandler}
            required
          />
          <label htmlFor="workoutLength"> Total Workout Length (Minutes): </label>
          <input
            type="number"
            name="workoutLength"
            className="input-box"
            value={workoutLength}
            onChange={this.changeHandler}
            min="0"
            required
          />
          {workoutExercises.map((val, index) => {
            let exerciseId = `exerciseName-${index}`;
            let qtyId = `qty-${index}`;
            let unitId = `unit-${index}`;
            return (
              <div key={index} class="exercise-list">
                <div className="eachExercise" data-arrayidx={index}>
                  <p> {`Exercise #${index + 1}`}</p>
                  <label htmlFor={exerciseId}>Name:</label>
                  <input
                    type="text"
                    name={exerciseId}
                    data-id={index}
                    id={exerciseId}
                    value={workoutExercises[index].exerciseName}
                    className="exerciseName"
                    onChange={this.changeHandler}
                    required
                  />
                  <label htmlFor={qtyId}> Quantity: </label>
                  <input
                    type="number"
                    name={qtyId}
                    data-id={index}
                    id={qtyId}
                    value={workoutExercises[index].qty}
                    className="qty"
                    onChange={this.changeHandler}
                    min="0"
                    required
                  />
                  <select
                    name={unitId}
                    data-id={index}
                    id={unitId}
                    className="unit"
                    onChange={this.changeHandler}
                    required
                    value={workoutExercises[index].unit}
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

          <label htmlFor="workoutNotes"> Notes/Links: </label>
          <textarea
            type="textarea"
            name="workoutNotes"
            className="input-box"
            value={workoutNotes}
            onChange={this.changeHandler}
          ></textarea>

          <input
            id="createBtn"
            className="btn btn-secondary"
            type="submit"
            value="Finish Editing Workout"
          />
        </form>
      </div>

      </div>
    );
  }
}

export default EditWorkout;
