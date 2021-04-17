import React from "react";
import fire from "../Firebase/fire";
import "firebase/auth";
import "firebase/database";
import { withRouter } from "react-router-dom";
import { format } from "date-fns";
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
      tags: [],
      tagOptions: []
    };
    this.addExercise = this.addExercise.bind(this);
    this.removeTag = this.removeTag.bind(this);
    this.deleteExercise = this.deleteExercise.bind(this);
    this.submitHandler = this.submitHandler.bind(this);
    this.changeHandler = this.changeHandler.bind(this);
  }

  componentDidMount() {
    var currentComponent = this;
    //retrieve current list of tags
    let tagRef  = fire.database().ref("Tags/").orderByKey();
    tagRef.once("value", function(snapshot) {
      const data = snapshot.val();
      if (data) {
        let keys = Object.keys(data);
        currentComponent.setState({
          tagOptions : keys
        });
      } 
    });
  }
  
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

    let tags = this.state.tags;
    let workoutName = this.state.name;

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
      createdDate: format(new Date(), "MM/dd/yyyy"),
      tags: this.state.tags
    });
    console.log("successfully added workout to database");
    alert(
      "Workout added! Visit 'My Workouts' to see all your saved workouts or 'Home' to create an event with your new workout."
    );

    for (let i=0; i<tags.length; i++) {
        let newTagRef = fire.database().ref("Tags/" + tags[i]).push();
        newTagRef.set({
          workoutId : newWorkoutId,
          workoutName: workoutName
        });
        console.log("should have added tag");
    }
    
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
      this.setState({ exercises: exercises });
    } else if(event.target.className === 'tags' && event.key === "Enter" && event.target.value !== "") {
      let cleanedTag = event.target.value.trim();
      cleanedTag = cleanedTag.toLowerCase();
      console.log(this.state.tags);
      if (!this.state.tags.includes(cleanedTag)) {
        this.setState((prevState) => ({
          tags: [...prevState.tags, cleanedTag]
        }));
      }
      event.target.value = "";
      console.log(this.state.tags);
      console.log(this.state);
    } else if(event.target.className !== 'tags') {
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
            className="input-box"
            value={name}
            onChange={this.changeHandler}
            required
          />
          <label htmlFor="timeLength"> Total Workout Length (Minutes): </label>
          <input
            type="number"
            name="timeLength"
            className="input-box"
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
          <label htmlFor="tags"> Tags: </label>
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
                name="tags"
                className="tags"
                onKeyUp={this.changeHandler}
                placeholder="Double click for tag options or enter your own"
                list="tag-options"
            />
            <datalist id="tag-options">
              {this.state.tagOptions && this.state.tagOptions.map((data, index) => (
                <option key={index} value={data}>
                  {data}
                </option>
              ))}
            </datalist>
          </div>

          <label htmlFor="notes"> Notes/Links: </label>
          <textarea
            type="textarea"
            name="notes"
            value={notes}
            onChange={this.changeHandler}
            className="input-box"
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
