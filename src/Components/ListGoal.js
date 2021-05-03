import React from "react";
import fire from "../Firebase/fire";
import "firebase/auth";
import "firebase/database";
import "../CSS/profile.css";

class ListGoal extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      goalId: this.props.goalId,
      goalText: this.props.goalText,
      completed: this.props.completed,
    };
    this.deleteGoal = this.deleteGoal.bind(this);
    this.completeGoal = this.completeGoal.bind(this);
    this.uncheckGoal = this.uncheckGoal.bind(this);
  }
  deleteGoal() {
    fire.auth().onAuthStateChanged((user) => {
      if (user) {
        let deleteId = this.state.goalId;
        console.log(deleteId);
        let currentUser = fire.auth().currentUser.uid;
        let goalsRef = fire
          .database()
          .ref("FitnessGoals/" + currentUser + "/" + deleteId);
        goalsRef.remove().then(() => {
          this.props.reload();
          console.log("success removing");
        });
      }
    });
  }
  completeGoal() {
    fire.auth().onAuthStateChanged((user) => {
      if (user) {
        let completeId = this.state.goalId;
        console.log(completeId);
        let currentUser = fire.auth().currentUser.uid;
        let goalsRef = fire
          .database()
          .ref("FitnessGoals/" + currentUser + "/" + completeId);
        goalsRef.update({ completed: true }).then(() => {
          this.props.reload();
          console.log("success completing");
          this.setState({ completed: true });
        });
      }
    });
  }

  uncheckGoal() {
    fire.auth().onAuthStateChanged((user) => {
      if (user) {
        let completeId = this.state.goalId;
        console.log(completeId);
        let currentUser = fire.auth().currentUser.uid;
        let goalsRef = fire
          .database()
          .ref("FitnessGoals/" + currentUser + "/" + completeId);
        goalsRef.update({ completed: false }).then(() => {
          this.props.reload();
          console.log("success unchecking");
          this.setState({ completed: false });
        });
      }
    });
  }

  render() {
    return (
      <li id={this.state.goalId}>
        {this.state.completed ? (
          //if goal completed
          <div>
            <p className="completed"> {this.state.goalText}</p>
            <button className="btn btn-secondary mr-2 btn-sm" onClick={this.uncheckGoal}> Uncheck </button>
            <button className="btn btn-secondary btn-sm" onClick={this.deleteGoal}> Delete </button>
          </div>
        ) : (
          //if goal incomplete
          <div>
            <p> {this.state.goalText}</p>
            <button className="btn btn-secondary mr-2 btn-sm" onClick={this.completeGoal}> Complete </button>
            <button className="btn btn-secondary btn-sm" onClick={this.deleteGoal}> Delete </button>
          </div>
        )}
      </li>
    );
  }
}

export default ListGoal;
