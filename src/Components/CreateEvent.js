import React from "react";
import fire from "../Firebase/fire";
import "firebase/auth";
import "firebase/database";
import { withRouter } from "react-router-dom";

class CreateEvent extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      currentUserId: "",
      date: "",
      startTime: "",
      endTime: "",
      workout: "",
      workoutName: "",
      workoutNames: [],
      reloadCal: this.props.reloadCal
    };
    this.changeHandler = this.changeHandler.bind(this);
    this.submitHandler = this.submitHandler.bind(this);
    this.retrieveWorkouts = this.retrieveWorkouts.bind(this);
  }

  //query workotus database for names of all the workouts to display
  retrieveWorkouts() {
    let currentComponent = this;
    fire.auth().onAuthStateChanged(function (user) {
      console.log("check 17");
      if (user) {
        let currentUser = fire.auth().currentUser.uid;
        let workoutsRef = fire.database().ref("Workouts");
        let workoutsData = [];
        workoutsRef.once("value", function (data) {
          let workoutsFromDatabase = data.val();
          for (const key in workoutsFromDatabase) {
            if (workoutsFromDatabase[key].creatorId == currentUser) {
              let workout = {
                name: workoutsFromDatabase[key].name,
                workoutId: key,
              };
              workoutsData.push(workout);
            }
          }
          currentComponent.setState({ workoutNames: workoutsData });
        });
      } else {
        console.log("signed out");
      }
    });
  }

  //calls that function when page loads
  componentDidMount() {
    this.retrieveWorkouts();
  }

  changeHandler(event) {
    event.preventDefault();
    this.setState({ [event.target.name]: event.target.value });
    if ([event.target.name] == "workout") {
      getEvent(event.target.value).then((value) => {
        this.setState({ workoutName: value });
      });
    }
    async function getEvent(workoutId) {
      let workoutRef = await fire
        .database()
        .ref("Workouts/" + workoutId)
        .once("value");
      return workoutRef.val().name;
    }
  }

  submitHandler(event) {
    event.preventDefault();
    let currentUserId = fire.auth().currentUser.uid;

    //first pushes the event to the database
    let eventRef = fire.database().ref("Schedules/" + currentUserId);
    let newEventRef = eventRef.push();
    newEventRef.set(
      {
        date: this.state.date,
        startTime: this.state.startTime,
        endtime: this.state.endTime,
        workoutId: this.state.workout,
        workoutName: this.state.workoutName,
      },
      (error) => {
        if (error) {
          console.log("error");
        } else {
          console.log("successfully added event to database");
        }
      }
    );

    //refresh form
    this.setState({
      currentUserId: "",
      date: "",
      startTime: "",
      endTime: "",
      workout: "",
      workoutName: "",
      workoutNames: [],
    });
    this.state.reloadCal();
  }

  render() {
    return (
      <div>
        <h2> Add to Your Workout Schedule</h2>
        <form onSubmit={this.submitHandler}>
          <label htmlFor="date"> Date: </label>
          <input
            type="date"
            name="date"
            value={this.state.date}
            onChange={this.changeHandler}
          />
          <label htmlFor="startTime"> Start Time: </label>
          <input
            type="time"
            name="startTime"
            value={this.state.startTime}
            onChange={this.changeHandler}
          />
          <label htmlFor="endTime"> End Time: </label>
          <input
            type="time"
            name="endTime"
            value={this.state.endTime}
            onChange={this.changeHandler}
          />
          <label htmlFor="workout"> Choose from your workouts: </label>
          <select
            name="workout"
            value={this.state.workout}
            onChange={this.changeHandler}
          >
            <option value="" disabled hidden>
              Select a workout:
            </option>
            {this.state.workoutNames.map((data, idx) => (
              <option key={idx} value={data.workoutId}>
                {data.name}
              </option>
            ))}
          </select>
          <input type="submit" value="Create Workout Event" />
        </form>
      </div>
    );
  }
}

export default withRouter(CreateEvent);
