import React from "react";
import fire from "../Firebase/fire";
import "firebase/auth";
import "firebase/database";
import { withRouter } from "react-router-dom";

class ShowFavorite extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      name: "",
      exercises: [],
      timeLength: "",
      notes: "",
      tags: [],
    };
  }

  componentDidMount() {
    let currentComponent = this;
    const favoriteId = this.props.favoriteId;
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
  render() {
    return (
      <div id={this.state.workoutId} class="popup">
        <p className="close" onClick={this.props.closePopup}>
          x
        </p>
        <h4> {this.state.name}</h4>
        <p> Total Time: {this.state.timeLength} </p>
        <table className="exercises">
          <tbody>
            {this.state.exercises &&
              this.state.exercises.map((exercise, index) => (
                <tr key={index}>
                  <td>
                    <strong>{index + 1}:</strong> {exercise.exerciseName}{" "}
                  </td>
                  <td>{exercise.qty}</td>
                  <td> {exercise.unit}</td>
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
        <p id="workoutNotes"> Notes/Links: {this.state.notes}</p>
      </div>
    );
  }
}
export default withRouter(ShowFavorite);
