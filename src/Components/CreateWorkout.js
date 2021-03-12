import React from "react";

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
  addExercise() {
    this.setState((prevState) => ({
      exercises: [...prevState.exercises, { exerciseName: "", reps: "" }],
    }));
  }

  submitHandler(event) {
    event.preventDefault();
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
      <form onSubmit={this.submitHandler} onChange={this.changeHandler}>
        <label htmlFor="name"> Workout Name: </label>
        <input type="text" name="name" value={name} />
        <label htmlFor="timeLength"> Time Length: </label>
        <input type="number" name="timeLength" value={timeLength} />
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
              />
              <label htmlFor={repsId}> Reps: </label>
              <input
                type="number"
                name={repsId}
                data-id={idx}
                id={repsId}
                value={exercises[idx].reps}
                className="reps"
              />
            </div>
          );
        })}
        <button onClick={this.addExercise}> Add Exercise </button>

        <label htmlFor="notes"> Notes/Links: </label>
        <input type="text" name="notes" value={notes} />
        <input type="submit" value="Create Workout" />
      </form>
    );
  }
}

export default CreateWorkout;
