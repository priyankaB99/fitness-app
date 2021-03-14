import "./App.css";
import React from "react";
import Home from "./Components/Home";
import CreateWorkout from "./Components/CreateWorkout";
import SignUp from "./Components/SignUp";
import Login from "./Components/Login";
import Sidebar from "./Components/Sidebar";
import DisplayWorkouts from "./Components/DisplayWorkouts";
import { BrowserRouter, Route, Switch, Link } from "react-router-dom";

function App() {
  return (
    <React.Fragment>    
      <BrowserRouter>
        <Sidebar />
        <Switch>
          <Route path="/" exact>
            <Home />
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
          <Route path="/login" exact>
            <Login />
          </Route>
        </Switch>
      </BrowserRouter>
    </React.Fragment>
  );
}

export default App;
