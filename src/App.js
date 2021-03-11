import "./App.css";
import fire from "./Firebase/fire";
import Home from "./Components/Home";
import CreateWorkout from "./Components/CreateWorkout";
import { BrowserRouter, Route, Switch, Link } from "react-router-dom";

function App() {
  return (
    <div className="App">
      <h1> Main Page </h1>
      <BrowserRouter>
        <nav>
          <ul>
            <li>
              <Link to="/home"> Home </Link>
            </li>
            <li>
              <Link to="/createworkout"> Create Workout </Link>
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
        </Switch>
      </BrowserRouter>
    </div>
  );
}

export default App;
