import React from "react";
import fire from "../Firebase/fire";
import "firebase/auth";
import "firebase/database";
import "../CSS/ViewEditEvent.css";
import { format, parse } from "date-fns";
import ShareEvent from "./ShareEvent";
import { Redirect } from "react-router-dom";

//Code Resources
// -https://codepen.io/bastianalbers/pen/PWBYvz?editors=0110

class ViewEditEvent extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      otherUserEvent: this.props.otherUserEvent,
      workout: this.props.selectedWorkout, //includes workoutId, workoutName, date, start, end
      scheduleId: this.props.scheduleId, //basically the uid
      workoutId: "",
      workoutName: "",
      workoutExercises: [],
      workoutTags: [],
      workoutNotes: "",
      workoutDate: this.props.selectedWorkout.date,
      workoutStart: this.props.selectedWorkout.start,
      workoutEnd: this.props.selectedWorkout.end,
      eventKey: this.props.selectedWorkout.eventKey,
      warning: "",
      editToggled: false, //if edit button has been clicked
      isShared: this.props.selectedWorkout.shared, //is this user's event or someone else's?
      showSharePopup: false,
      ownerUsername: "", //null if user is owner, username of owner if is shared
      redirect: false, //true if username of shared event sharer is clicked --> friendsList
    };
    this.parseWorkoutData = this.parseWorkoutData.bind(this);
    this.toggleEditEvent = this.toggleEditEvent.bind(this);
    this.formatDate = this.formatDate.bind(this);
    this.formatTime = this.formatTime.bind(this);
    this.formatExercises = this.formatExercises.bind(this);
    this.deleteEvent = this.deleteEvent.bind(this);
    this.displayNonEdit = this.displayNonEdit.bind(this);
    this.displayEdit = this.displayEdit.bind(this);
    this.changeHandler = this.changeHandler.bind(this);
    this.submitHandler = this.submitHandler.bind(this);
    this.displayTags = this.displayTags.bind(this);
    this.displayWorkout = this.displayWorkout.bind(this);
    this.displayMyWorkout = this.displayMyWorkout.bind(this);
    this.displaySharedWorkout = this.displaySharedWorkout.bind(this);
    this.displayWarning = this.displayWarning.bind(this);
    this.toggleShareEvent = this.toggleShareEvent.bind(this);
    this.findOwnerUsername = this.findOwnerUsername.bind(this);
    this.redirectFriends = this.redirectFriends.bind(this);
  }

  componentDidMount() {
    fire.auth().onAuthStateChanged((user) => {
      if (user) {
        // User is signed in
        this.parseWorkoutData();
        this.findOwnerUsername();
      } else {
        // No user is signed in
        // this.props.history.push("/login");
      }
    });
  }

  //adds workout id, name, and exercise array to state to use later
  parseWorkoutData() {
    let workoutId = this.state.workout.workoutId;
    let workoutRef = fire.database().ref("Workouts/" + workoutId);

    workoutRef.once("value", (data) => {
      //using arrow function => instead of function (data) preserves use of 'this' inside function
      let workoutData = data.val();
      if (workoutData) {
        this.setState({
          workoutId: workoutId,
          workoutName: workoutData.name,
          workoutExercises: workoutData.exercises,
          workoutNotes: workoutData.notes,
          warning: "",
          workoutTags: workoutData.tags,
        });
      } else {
        if (this.state.otherUserEvent) {
          this.setState({
            warning:
              "The workout assigned to this event has been deleted by the owner.",
          });
        } else {
          this.setState({
            warning:
              "The workout assigned to this event has been deleted. Edit and choose a different workout or delete this event.",
          });
        }
      }
    });
  }

  formatDate() {
    let date = parse(this.state.workoutDate, "yyyy-MM-dd", new Date());
    let weekday = format(date, "EEEE");
    let monthDay = format(date, "MMMM d");
    return weekday + ", " + monthDay;
  }

  formatTime() {
    if (this.state.workoutStart !== "" && this.state.workoutEnd !== "") {
      let start = parse(this.state.workoutStart, "HH:mm", new Date());
      let end = parse(this.state.workoutEnd, "HH:mm", new Date());
      let formattedStart = format(start, "h:mm b");
      let formattedEnd = format(end, "h:mm b");
      return formattedStart + " - " + formattedEnd;
    }
  }

  toggleShareEvent() {
    this.setState({
      showSharePopup: !this.state.showSharePopup,
    });
  }

  //view when edit is not clicked
  displayNonEdit() {
    return (
      <div>
        <p>{this.formatDate() + " | " + this.formatTime()}</p>
        {this.state.workoutNotes && (
          <div className="notes"> Notes: {this.state.workoutNotes}</div>
        )}
        {this.props.deleteEvent ? (
          <div>
            <button
              className="btn btn-secondary popup-buttons btn-sm"
              onClick={this.toggleEditEvent}
            >
              Edit Event
            </button>

            <button
              className="btn btn-secondary popup-buttons btn-sm"
              onClick={this.deleteEvent}
            >
              Delete Event
            </button>

            <button
              className="btn btn-secondary popup-buttons btn-sm"
              onClick={this.toggleShareEvent}
            >
              Share Event
            </button>
          </div>
        ) : null}
      </div>
    );
  }

  //view when edit is clicked
  displayEdit() {
    return (
      <div>
        <label htmlFor="workoutDate"> Date: </label>
        <input
          type="date"
          name="workoutDate"
          value={this.state.workoutDate}
          onChange={this.changeHandler}
          required
        />
        <br></br>
        <label htmlFor="startTime"> Start Time: </label>
        <input
          type="time"
          name="workoutStart"
          value={this.state.workoutStart}
          onChange={this.changeHandler}
          required
        />
        <label htmlFor="workoutEnd"> End Time: </label>
        <input
          type="time"
          name="workoutEnd"
          value={this.state.workoutEnd}
          onChange={this.changeHandler}
          required
        />

        <button
          onClick={() => {
            this.submitHandler();
          }}
        >
          Save
        </button>
        <button
          onClick={() => {
            this.toggleEditEvent();
          }}
        >
          Cancel
        </button>
      </div>
    );
  }

  displayTags() {
    return (
      <ul className="displayTags" id="tags">
        {this.state.workoutTags &&
          this.state.workoutTags.map((tag, index) => (
            <li key={index} className="tag">
              <span className="tag-title">{tag}</span>
            </li>
          ))}
      </ul>
    );
  }

  displayWorkout() {
    if (this.state.warning === "") {
      return this.state.isShared
        ? this.displaySharedWorkout()
        : this.displayMyWorkout();
    } else {
      return this.displayWarning();
    }
  }

  displayMyWorkout() {
    return (
      <div className="workoutInfo owner" id={this.state.eventKey}>
        <div className="name">
          <h2>{this.state.workoutName}</h2>
        </div>
        {this.state.editToggled ? this.displayEdit() : this.displayNonEdit()}
      </div>
    );
  }

  displaySharedWorkout() {
    return (
      <div className="workoutInfo shared" id={this.state.eventKey}>
        <div className="name">
          <h2>{this.state.workoutName}</h2>
        </div>
        <p>{this.formatDate() + " | " + this.formatTime()}</p>
        {this.state.workoutNotes && (
          <div className="notes"> Notes: {this.state.workoutNotes}</div>
        )}
      </div>
    );
  }

  displayWarning() {
    return (
      <div class="warning">
        <strong>{this.state.warning}</strong>
        <br></br>
        {this.props.deleteEvent ? (
          <div>
            <button
              className="btn btn-secondary popup-buttons btn-sm"
              onClick={this.toggleEditEvent}
              disabled
            >
              Edit Event
            </button>
            <button
              className="btn btn-secondary popup-buttons btn-sm"
              onClick={this.deleteEvent}
            >
              Delete Event
            </button>
          </div>
        ) : null}
      </div>
    );
  }

  changeHandler(event) {
    this.setState({ [event.target.name]: event.target.value });
  }

  //submit edits to FireBase
  submitHandler() {
    //reference to existing workout
    console.log(this.state.eventKey);
    let eventRef = fire.database().ref("Events/" + this.state.eventKey);

    eventRef.update({
      date: this.state.workoutDate,
      endTime: this.state.workoutEnd,
      startTime: this.state.workoutStart,
    });
    this.toggleEditEvent();
    this.props.reloadCal();
    console.log("Your event has been edited!");
  }

  checkStringEmpty(string) {
    if (string === "") {
      return true;
    } else {
      return false;
    }
  }

  findOwnerUsername(){
    //if is shared workout
    if(this.state.workout.creatorId !== this.state.scheduleId){
      let ownerRef = fire.database().ref('Users/' + this.state.workout.creatorId + '/Username');
      ownerRef.get().then((username) => {
        this.setState({
          ownerUsername: username.val()
        })
      });
    }
  }

  redirectFriends(){
    this.setState({
      redirect: true
    })
  }

  formatExercises() {
    let exercises = this.state.workoutExercises;
    let formattedExercises = [];
    if (exercises) {
      formattedExercises = exercises.map((exercise, index) => (
        <div className="exercise">
          <div className="viewExerciseName">
            <b>{index + 1 + ". " + exercise.exerciseName}</b>
          </div>
          <div className="sets">
            {exercise.sets}
            {this.checkStringEmpty(exercise.sets) ? null : <p>sets</p>}
          </div>
          <div className="qty">
            {exercise.qty} {exercise.unit}
          </div>
          <div className="weight">
            {exercise.weight}
            {this.checkStringEmpty(exercise.weight) ? null : <p>lbs </p>}
          </div>
        </div>
      ));
    }

    return formattedExercises;
  }

  toggleEditEvent() {
    this.setState({
      editToggled: !this.state.editToggled,
    });
  }

  deleteEvent(event) {
    this.props.closePopup();
    this.props.deleteEvent(event);
  }

  render() {
    //if username of workout owner is clicked
    if (this.state.redirect === true) {
      return <Redirect to="/myfriends" />;
    }

    return (
      <div className="popup">
        <div>
          <p className="close" onClick={this.props.closePopup}>
            x
          </p>
        </div>

        {this.state.showSharePopup ? (
          <ShareEvent
            closePopup={this.toggleShareEvent}
            selectedEvent={this.state.eventKey}
          />
        ) : null}

        {this.displayWorkout()}
        
        {this.state.ownerUsername ? 
          <p>
            Shared by <b onClick={this.redirectFriends}>{this.state.ownerUsername}</b>
          </p> 
        
          : null}

        {this.displayTags()}

        <div className="exerciseBox">{this.formatExercises()}</div>
      </div>
    );
  }
}

export default ViewEditEvent;
