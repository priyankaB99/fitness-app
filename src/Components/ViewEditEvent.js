import React from "react";
import fire from "../Firebase/fire";
import "firebase/auth";
import "firebase/database";
import "../CSS/ViewEditEvent.css";

//Code Resources
// -https://codepen.io/bastianalbers/pen/PWBYvz?editors=0110

class ViewEditEvent extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
        workout: this.props.selectedWorkout, //includes workoutId, workoutName, date, start, end
        workoutId: "",
        workoutName: "",
        workoutExercises: [],
        workoutDate: this.props.selectedWorkout.date,
        workoutStart: this.props.selectedWorkout.start,
        workoutEnd: this.props.selectedWorkout.end
    };
    this.parseWorkoutData = this.parseWorkoutData.bind(this);
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

  //adds workout id, name, and exercise array to state to use later
  parseWorkoutData(){
    let workoutId = this.state.workout.workoutId;
    let workoutRef = fire.database().ref("Workouts/" + workoutId);
    
    workoutRef.on("value", (data) => { //using arrow function => instead of function (data) preserves use of 'this' inside function
        let workoutData = data.val();      
        this.setState({
            workoutId: workoutId,
            workoutName: workoutData.name,
            workoutExercises: workoutData.exercises
        })
    });
  }

  

  render() {
    return (
      <div className='popup'>
          <div className='functionBox'>
              <p className='close' onClick={this.props.closePopup}>x</p>
              <p className='edit'>Edit</p>
          </div>
          
          <div className='workoutInfo'>

          </div>
      </div>
    );
  }
}

export default ViewEditEvent;
