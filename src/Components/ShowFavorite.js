import React from "react";
import fire from "../Firebase/fire";
import "firebase/auth";
import "firebase/database";
import { withRouter } from "react-router-dom";
import "../CSS/profile.css";

class ShowFavorite extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      name: "",
      exercises: [],
      timeLength: "",
      notes: "",
      tags: [],
      favoriteId: this.props.favoriteId,
    };
  }

  componentDidMount() {
    let currentComponent = this;
    let favoriteId = this.props.favoriteId;
    fire.auth().onAuthStateChanged(function (user) {
      if (user) {
        let currentUser = fire.auth().currentUser.uid;
        let workoutsRef = fire.database().ref("Workouts/" + favoriteId);
        workoutsRef.once("value", function (data) {
          let info = data.val();
          currentComponent.setState({
            name: info.name,
            exercises: info.exercises,
            timeLength: info.timeLength,
            notes: info.notes,
            tags: info.tags,
          });
        });
      }
    });
  }

  checkStringEmpty = (string) => {
    if (string === "") {
      return true;
    } else {
      return false;
    }
  };

  render() {
    return (
      <div id={this.state.workoutId} class="popup" id="eachFavorite">
        <p className="close" onClick={this.props.closePopup}>
          x
        </p>
        <h4> {this.state.name}</h4>
        <p>Workout Length: {this.state.timeLength} </p>
        <table className="exercises">
          <tbody>
            {this.state.exercises &&
              this.state.exercises.map((exercise, index) => (
                <tr key={index}>
                  <td>
                    <strong>{index + 1}:</strong> {exercise.exerciseName}{" "}
                  </td>
                  {this.checkStringEmpty(exercise.sets) ? null : (
                    <td>{exercise.sets} sets </td>
                  )}
                  <td>
                    {exercise.qty} {exercise.unit}
                  </td>

                  {this.checkStringEmpty(exercise.weight) ? null : (
                    <td>{exercise.sets} lbs </td>
                  )}
                </tr>
              ))}
          </tbody>
        </table>
        <ul id="tags">
          {this.state.tags &&
            this.state.tags.map((tag, index) => (
              <li key={index} className="tag">
                <span className="tag-title">{tag}</span>
              </li>
            ))}
        </ul>
        {this.state.notes && (
          <p id="workoutNotes"> Notes/Links: {this.state.notes}</p>
        )}
      </div>
    );
  }
}
export default ShowFavorite;
