import React from "react";
import fire from "../Firebase/fire";
import "firebase/auth";
import "firebase/database";
import { withRouter } from "react-router-dom";
import "../CSS/profile.css";
import {BsHeart, BsHeartFill} from "react-icons/bs";

class FavoriteButton extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      favId: this.props.favId,
    };
    this.favorite = this.favorite.bind(this);
    this.unfavorite = this.unfavorite.bind(this);
    // this.checkFavorites = this.checkFavorites.bind(this);
  }
  // componentDidMount() {
  //   this.checkFavorites();
  // }
  // checkFavorites() {
  //   let currentComponent = this;
  //   let currentUser = fire.auth().currentUser.uid;
  //   let favoritesRef = fire.database().ref("Favorites/" + currentUser);
  //   favoritesRef.once("value", function (data) {
  //     let info = data.val();
  //     for (const key in info) {
  //       if (info[key].workoutId === currentComponent.state.favId) {
  //         currentComponent.setState({ favorited: true });
  //       } else {
  //         currentComponent.setState({ favorited: false });
  //       }
  //     }
  //   });
  // }
  favorite(event) {
    let currentComponent = this;
    this.setState({ favorited: true });
    let currentUser = fire.auth().currentUser.uid;
    let workoutId = this.state.favId;
    console.log(workoutId);

    let favoritesRef = fire.database().ref("Favorites/" + currentUser);
    let newFavoritesRef = favoritesRef.push();
    newFavoritesRef.set({ workoutId: workoutId }).then(() => {
      console.log("Workout successfully favorited");
      this.props.reload();
    });
    // this.props.retrieveFavorites();
  }

  unfavorite(event) {
    this.setState({ favorited: false });
    let currentComponent = this;

    let currentUser = fire.auth().currentUser.uid;
    let workoutId = this.state.favId;
    let favoritesRef = fire.database().ref("Favorites/" + currentUser + "/");
    let deletedId = "";
    favoritesRef
      .once("value", function (data) {
        let favoriteWorkouts = data.val();
        for (const key in favoriteWorkouts) {
          if (favoriteWorkouts[key].workoutId === workoutId) {
            deletedId = key;
          }
        }
      })
      .then(() => {
        console.log(deletedId);
        let deletedRef = fire
          .database()
          .ref("Favorites/" + currentUser + "/" + deletedId);
        deletedRef.remove().then(() => {
          console.log("Successfully unfavorited");
          this.props.reload();
        });
      });
  }

  render() {
    return (
      <div className="favoriteButtons">
        {this.props.isFavorite ? (
          // <button
          //   type="button"
          //   className="btn btn-secondary displayButtons"
          //   id="unfavoriteBtn"
          //   onClick={this.unfavorite}
          // >
          //   Unfavorite
          // </button>
          <BsHeartFill size={40} color="lightcoral" id="unfavoriteBtn" onClick={this.unfavorite}/>
        ) : (
          // <button
          //   type="button"
          //   className="btn btn-secondary displayButtons"
          //   id="favoriteBtn"
          //   onClick={this.favorite}
          // >
          //   Favorite
          // </button>
          <BsHeart size={40} id="favoriteBtn" onClick={this.favorite}/>
        )}
      </div>
    );
  }
}

export default FavoriteButton;
