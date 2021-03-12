import "./App.css";
import Home from "./Components/Home";
import CreateWorkout from "./Components/CreateWorkout";
import SignUp from "./Components/SignUp";
import Login from "./Components/Login";
import { BrowserRouter, Route, Switch, Link } from "react-router-dom";

function App() {
  return (
    <div className="App">
      <h1> Main Page </h1>
      <BrowserRouter>
        <nav id="sidebar">
          <ul>
            <li>
              <Link to="/createworkout"> Create Workout </Link>
            </li>
            <li>
              <Link to="/signup"> Sign Up </Link>
            </li>
            <li>
              <Link to="/login"> Log In </Link>
            </li>
          </ul>
        </nav>
        <Switch>
          <Route path="/home">
            <Home />
          </Route>
          <Route path="/createworkout">
            <CreateWorkout />
          </Route>
          <Route path="/signup">
            <SignUp />
          </Route>
          <Route path="/login">
            <Login />
          </Route>
        </Switch>
      </BrowserRouter>
    </div>
  );
}

export default App;
