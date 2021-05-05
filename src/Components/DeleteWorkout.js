import React from "react";
import fire from "../Firebase/fire";
import "firebase/auth";
import "firebase/database";

//Code Resources
// -https://codepen.io/bastianalbers/pen/PWBYvz?editors=0110

class DeleteWorkout extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      workout: this.props.selectedWorkout,
      uid: "",
      tags: this.props.tags,
      allEvents: [],
    };
    this.deleteWorkout = this.deleteWorkout.bind(this);
  }

  componentDidMount() {
    fire.auth().onAuthStateChanged((user) => {
      if (user) {
        let currentComponent = this;
        let currentUser = fire.auth().currentUser.uid;
        currentComponent.setState({ uid: currentUser });
      }
    });
  }

  deleteWorkout() {
    let currentComponent = this;
    let workoutsRef = fire.database().ref("Workouts/");
    workoutsRef.off("value");
    let deleteWorkoutRef = fire
      .database()
      .ref("Workouts/" + this.state.workout);
    deleteWorkoutRef.remove();

    //delete from tags
    if (this.state.tags) {
      for (let i in this.state.tags) {
        let tagsRef = fire
          .database()
          .ref(
            "Tags/" +
              this.state.tags[i] +
              "/" +
              this.state.uid +
              "/" +
              this.state.workout
          );
        tagsRef.remove().then(() => {
          this.props.retrieveTags();
        });
      }
    }

    //delete from events
    let eventsRef = fire.database().ref("Events/");
    let events = [];
    eventsRef.once("value", function (data) {
      let info = data.val();
      for (let key in info) {
        if (info[key].workoutId === currentComponent.state.workout) {
          events.push(key);
        }
      }
      for (let i in events) {
        let deleteAllEventsRef = fire.database().ref("Events/" + events[i]);
        deleteAllEventsRef.remove();
      }
    });

    // let changedWorkouts = this.state.myWorkouts;
    // let deletedWorkoutIndex = "";
    // for (const key in changedWorkouts) {
    //   if (changedWorkouts[key].workoutId === workoutId) {
    //     deletedWorkoutIndex = key;
    //   }
    // }
    // changedWorkouts.splice(deletedWorkoutIndex, 1);
    // this.setState({ myWorkouts: changedWorkouts });
    this.props.retrieveWorkouts();
    this.props.closePopup();
  }

  render() {
    return (
      <div className="popup">
        <div>
          <p className="close" onClick={this.props.closePopup}>
            x
          </p>
        </div>
        <p> Are you sure you want to delete this workout? </p>
        <button className="btn btn-secondary mb-3" onClick={this.deleteWorkout}>
          Yes
        </button>
        <button className="btn btn-secondary" onClick={this.props.closePopup}>
          No
        </button>
      </div>
    );
  }
}

export default DeleteWorkout;
