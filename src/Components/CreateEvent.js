import React from "react";
import fire from "../Firebase/fire";
import "firebase/auth";
import "firebase/database";
import { withRouter, Redirect } from "react-router-dom";
import "../CSS/ViewEditEvent.css";

class CreateEvent extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      currentUserId: "",
      date: "",
      startTime: "12:00",
      endTime: "",
      workout: "",
      workoutName: "",
      workoutNames: [],
      reloadCal: this.props.reloadCal,
      // showComponent: false,
    };
    this.changeHandler = this.changeHandler.bind(this);
    this.submitHandler = this.submitHandler.bind(this);
    this.retrieveWorkouts = this.retrieveWorkouts.bind(this);
    // this.showComponent = this.showComponent.bind(this);
  }

  //query workotus database for names of all the workouts to display
  retrieveWorkouts() {
    let currentComponent = this;
    fire.auth().onAuthStateChanged(function (user) {
      if (user) {
        let currentUser = fire.auth().currentUser.uid;
        let workoutsRef = fire.database().ref("Workouts");
        let workoutsData = [];
        workoutsRef.once("value", function (data) {
          let workoutsFromDatabase = data.val();
          for (const key in workoutsFromDatabase) {
            if (workoutsFromDatabase[key].creatorId === currentUser) {
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
    //convert date
    console.log(this.props.selectedDay);
    if (this.props.selectedDay !== "") {
      const fullDate = new Date(this.props.selectedDay);
      const formattedDate = fullDate.toISOString().substring(0, 10);
      this.setState({ date: formattedDate });
    }
  }

  changeHandler(event) {
    event.preventDefault();
    this.setState({ [event.target.name]: event.target.value });

    if (event.target.name === "workout" && event.target.value !== "create") {
      getEvent(event.target.value).then((value) => {
        this.setState({ workoutName: value });
      });

      async function getEvent(workoutId) {
        let workoutRef = await fire
          .database()
          .ref("Workouts/" + workoutId)
          .once("value");
        return workoutRef.val().name;
      }
    }
  }

  submitHandler(event) {
    event.preventDefault();
    let currentUserId = fire.auth().currentUser.uid;
    
    //first pushes the event to the database
    // let eventRef = fire.database().ref("Schedules/" + currentUserId);
    let eventRef = fire.database().ref("Events/");

    let newEventRef = eventRef.push();
    newEventRef.set(
      {
        date: this.state.date,
        creatorId: currentUserId,
        startTime: this.state.startTime,
        endTime: this.state.endTime,
        workoutId: this.state.workout,
        workoutName: this.state.workoutName,
        users: [currentUserId]
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
    });
    this.state.reloadCal();
    this.props.closePopup();
  }

  render() {
    if (this.state.workout === "create") {
      return <Redirect to="/createworkout" />;
    }
    return (
      <div className="popup">
        <div>
          <p className="close" onClick={this.props.closePopup}>
            x
          </p>
        </div>
        {/* <h5 onClick={this.props.popUp}> Add to Your Workout Schedule</h5> */}
        {/* {this.state.showComponent ? ( */}
        <form id="createEventForm" onSubmit={this.submitHandler}>
          <h3> Add a Workout Event to Your Calendar </h3>

          <label htmlFor="date"> Date: </label>
          <input
            type="date"
            name="date"
            value={this.state.date}
            onChange={this.changeHandler}
            required
          />
          <label htmlFor="startTime"> Start Time: </label>
          <input
            type="time"
            name="startTime"
            value={this.state.startTime}
            onChange={this.changeHandler}
            required
          />
          <label htmlFor="endTime"> End Time: </label>
          <input
            type="time"
            name="endTime"
            value={this.state.endTime}
            onChange={this.changeHandler}
            required
          />
          <label htmlFor="workout">
            Choose one of your own custom workouts for this event:
          </label>
          <select
            name="workout"
            value={this.state.workout}
            onChange={this.changeHandler}
            required
          >
            <option value="" disabled hidden>
              Select a workout
            </option>
            {this.state.workoutNames.map((data, idx) => (
              <option key={idx} value={data.workoutId}>
                {data.name}
              </option>
            ))}
            <option value="create">Click to Create a New Workout!</option>
          </select>
          <br></br>
          <input
            type="submit"
            className="btn btn-secondary"
            value="Create Workout Event"
          />
        </form>
        {/* ) : (
          <div></div>
        )} */}
      </div>
    );
  }
}

export default withRouter(CreateEvent);
