import React from "react";
import fire from "../Firebase/fire";
import "firebase/auth";
import "firebase/database";
import { withRouter } from "react-router-dom";
import "../CSS/workouts.css";
//code pulled from https://itnext.io/building-a-dynamic-controlled-form-in-react-together-794a44ee552c

class CreateWorkout extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      name: "",
      timeLength: "",
      exercises: [{ exerciseName: "", qty: "", unit: "reps" }],
      notes: "",
      createdDate: "",
      tags: []
    };
    this.addExercise = this.addExercise.bind(this);
    this.removeTag = this.removeTag.bind(this);
    this.deleteExercise = this.deleteExercise.bind(this);
    this.submitHandler = this.submitHandler.bind(this);
    this.changeHandler = this.changeHandler.bind(this);
  }
  componentDidMount() {
    //automatically set createdDate element
    //today
    const fullDate = new Date();
    //change to database accepted format
    const formattedDate = fullDate.toISOString().substring(0, 10);
    this.setState({ createdDate: formattedDate });
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
    let arrayIdx = event.target.parentNode.getAttribute("data-arrayidx");
    let exercisesArray = [...this.state.exercises];
    exercisesArray.splice(arrayIdx, 1);
    this.setState({ exercises: exercisesArray });
  }

  removeTag(index) {
    this.setState((prevState) => ({
      tags: [
        ...prevState.tags.filter(tag => prevState.tags.indexOf(tag) !== index)
      ]
    }));
  }

  submitHandler(event) {
    event.preventDefault();

    let currentUserId = fire.auth().currentUser.uid;
    //add to workouts table
    let workoutRef = fire.database().ref("Workouts/");
    let newWorkoutRef = workoutRef.push();
    let newWorkoutId = newWorkoutRef.key;
    newWorkoutRef.set({
      name: this.state.name,
      creatorId: currentUserId,
      users: currentUserId,
      timeLength: this.state.timeLength,
      notes: this.state.notes,
      exercises: this.state.exercises,
      createdDate: this.state.createdDate,
      tags: this.state.tags
    });
    console.log("successfully added workout to database");
    alert(
      "Workout added! Visit 'My Workouts' to see all your saved workouts or 'Home' to create an event with your new workout."
    );

    // let tagRef;
    // for (let i=0; i<this.state.tags.length; i++) {
    //   tagRef = fire.database().ref("Tags/");
    //   tagRef.set({
    //     this.state.tags[i]: newWorkoutId
    //   });
    // }
    
    //refresh form
    this.setState({
      name: "",
      timeLength: "",
      exercises: [{ exerciseName: "", qty: "", unit: "" }],
      notes: "",
      tags: []
    });
  }

  changeHandler(event) {
    if (["exerciseName", "qty", "unit"].includes(event.target.className)) {
      let exercises = [...this.state.exercises];
      exercises[event.target.dataset.id][event.target.className] =
        event.target.value;
      this.setState({ exercises }, () => console.log(this.state.exercises));
    } else if(event.target.className === 'tags' && event.key === "Enter" && event.target.value !== "") {
      console.log(event.target.value);
      this.setState({
        tags: [
          ...this.state.tags, event.target.value
        ]
      });
      event.target.value = "";
      console.log(this.state.tags);
    } else {
      this.setState({ [event.target.name]: event.target.value });
    }
  }
  render() {
    let { name, timeLength, exercises, notes } = this.state;
    return (
      <div>
        <h2>Create a New Workout</h2>
        <div id="createForm">
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
                <div className="eachExercise" data-arrayidx={idx}>
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

          {/* "Tags" Source: https://dev.to/prvnbist/create-a-tags-input-component-in-reactjs-ki */}
          <div className="tags-input">
            <ul id="tags">
                {this.state.tags.map((tag, index) => (
                    <li key={index} className="tag">
                        <span className='tag-title'>{tag}</span>
                        <i className="tag-close-icon" onClick={() => this.removeTag(index)}>X</i>
                    </li>
                ))}
            </ul>
            <input
                type="text"
                className="tags"
                onKeyUp={this.changeHandler}
                placeholder="Press enter to add tags"
                list="tag-options"
            />
            <datalist id="tag-options">
              {/* {this.state.workoutNames.map((data, index) => (
                <option key={index} value={data.workoutId}>
                  {data.name}
                </option>
              ))} */}
            </datalist>
          </div>

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
            // type="submit"
            onClick={this.submitHandler}
            value="Finish Creating Workout"
          />
        </div>
      </div>
    );
  }
}

export default withRouter(CreateWorkout);
