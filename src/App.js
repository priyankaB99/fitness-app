import "./App.css";
import React from "react";
import Home from "./Components/Home";
import CreateWorkout from "./Components/CreateWorkout";
import SignUp from "./Components/SignUp";
import ForgotPassword from "./Components/ForgotPassword";
import Login from "./Components/Login";
import Sidebar from "./Components/Sidebar";
import FriendsList from "./Components/FriendsList";
import DisplayWorkouts from "./Components/DisplayWorkouts";
import MyProfile from "./Components/MyProfile";
import { BrowserRouter, Route, Switch, Link } from "react-router-dom";

// Code Resources
// - https://codeburst.io/how-to-create-a-navigation-bar-and-sidebar-using-react-348243ccd93
// - https://bootstrapious.com/p/bootstrap-sidebar

function App() {
  return (
    <React.Fragment>
      <BrowserRouter>
        <div class="wrapper">
          <Sidebar />
          <div class="main-content bg-light">
            <Switch>
              <Route path="/" exact>
                <Home />
              </Route>
              <Route path="/myfriends" exact>
                <FriendsList />
              </Route>
              <Route path="/myprofile" exact>
                <MyProfile />
              </Route>
              <Route path="/createworkout" exact>
                <CreateWorkout />
              </Route>
              <Route path="/displayworkouts" exact>
                <DisplayWorkouts />
              </Route>
              <Route path="/signup" exact>
                <SignUp />
              </Route>
              <Route path="/forgotpassword" exact>
                <ForgotPassword />
              </Route>
              <Route path="/login" exact>
                <Login />
              </Route>
            </Switch>
          </div>
        </div>
      </BrowserRouter>
    </React.Fragment>
  );
}

export default App;
