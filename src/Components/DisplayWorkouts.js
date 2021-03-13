import React from "react";
import fire from "../Firebase/fire";
import "firebase/auth";
import "firebase/database";
import { withRouter } from "react-router-dom";

class DisplayWorkouts extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      workouts: [
        { name: "", timeLength: "", exercises: [], workoutId: "", notes: "" },
      ],
    };
  }

  componentDidMount() {
    let currentUserId = fire.auth().currentUser.uid;
    let workoutsRef = fire.database().ref("Workouts");
    workoutsRef
      .orderByChild("creatorId")
      .equalTo(currentUserId)
      .on("child_added", function (data) {
        console.log(data.val());
      });
  }
  render() {
    return <h1> My Workouts </h1>;
  }
}

export default withRouter(DisplayWorkouts);
