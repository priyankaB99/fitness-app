import React from "react";
import fire from "../Firebase/fire";
import "firebase/auth";
import "firebase/database";
import { withRouter, Link, Redirect } from "react-router-dom";
import "./Home.css";
import {
  format,
  subMonths,
  addMonths,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  addDays,
  subWeeks,
  addWeeks,
  isSameDay,
  isSameWeek,
  isSameYear,
} from "date-fns";
import CreateEvent from "./CreateEvent";

// Code Resources
// -https://medium.com/@moodydev/create-a-custom-calendar-in-react-3df1bfd0b728

class Home extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      loggedIn: false,
      uid: "",
      email: "",
      username: "",
      date: new Date(),
    };
    this.previousMonth = this.previousMonth.bind(this);
    this.nextMonth = this.nextMonth.bind(this);
    // this.previousWeek = this.previousWeek.bind(this);
    // this.nextWeek = this.nextWeek.bind(this);
    this.createWeekArray = this.createWeekArray.bind(this);
    this.createMonthCells = this.createMonthCells.bind(this);
  }

  componentDidMount() {
    fire.auth().onAuthStateChanged((user) => {
      if (user) {
        // User is signed in
        console.log(user.email);
        console.log(user.displayName);
        this.setState({
          loggedIn: true,
          uid: user.uid,
          email: user.email,
          username: user.displayName,
        });
      } else {
        // No user is signed in
        this.props.history.push("/login");
      }
    });
  }

  //Inspiration: https://medium.com/@moodydev/create-a-custom-calendar-in-react-3df1bfd0b728
  renderMonth() {
    return (
      <div class="monthBox">
        <button onClick={this.previousMonth} class="monthNav nav">
          {" "}
          {/**previous month */}
          Previous
        </button>

        <div class="month">
          <h2>
            {format(this.state.date, "MMMM") +
              " " +
              format(this.state.date, "yyyy")}
          </h2>
        </div>

        <button onClick={this.nextMonth} class="monthNav nav">
          Next
        </button>
      </div>
    );
  }

  previousMonth() {
    let newMonth = subMonths(this.state.date, 1);
    this.setState({
      date: newMonth,
    });
  }

  nextMonth() {
    let newMonth = addMonths(this.state.date, 1);
    this.setState({
      date: newMonth,
    });
  }

  //from https://medium.com/@moodydev/create-a-custom-calendar-in-react-3df1bfd0b728
  renderWeekdays() {
    let week = this.createWeekArray();

    return (
      <div class="weekBox">
        {/* <div onClick={this.previousWeek} class="weekNav nav">
          Previous Week
        </div> */}

        <div class="week">{week}</div>

        {/* <div onClick={this.nextWeek} class="weekNav nav">
          Next Week
        </div> */}
      </div>
    );
  }

  //Returns array of the week, starting from Sunday
  createWeekArray(currentDay, firstWeek) {
    let start = startOfWeek(currentDay);
    console.log(start);
    let days = [];
    for (let i = 0; i < 7; i++) {
      let dayToAdd = addDays(start, i);
      let weekday = format(dayToAdd, "EEEE"); //needed to convert to English name to add the * if date matches, otherwise syntax error
      let daynumber = format(dayToAdd, "d");
      let today = new Date();

      console.log(dayToAdd);

      if (
        isSameDay(today, dayToAdd) &&
        isSameWeek(today, dayToAdd) &&
        isSameYear(today, dayToAdd)
      ) {
        //identifies current day: make into CSS later!!!
        weekday = "**" + weekday + "**";
      }
      days.push(
        <div className="col" key={dayToAdd}>
          {firstWeek ? 
          <div class="weekday">
            <strong>{weekday}</strong>
          </div> 
          : <div></div>}
          <div class="dayNumber">
            <b>{daynumber}</b>
          </div>
        </div>
      );
    }
    return <div className="weekdayRow row">{days}</div>;
  }

  //Returns whole month, made up of week arrays
  createMonthCells() {
    let monthStart = startOfMonth(this.state.date);
    let monthEnd = endOfMonth(monthStart);
    let startDate = startOfWeek(monthStart);
    let endDate = endOfWeek(monthEnd);

    console.log(monthStart);
    console.log(startDate);

    let weekRows = [];
    let currentDay = startDate;
    console.log(currentDay);
    let firstWeek = true;
    while (currentDay < endDate) {
      weekRows.push(
        this.createWeekArray(currentDay, firstWeek)
      );
      currentDay = addDays(currentDay, 7);
      firstWeek = false;
    }
    return <div className="cells">{weekRows}</div>;
  }

  // previousWeek() {
  //   let week = this.state.date;
  //   let newWeek = subWeeks(week, 1);
  //   this.setState({
  //     date: newWeek,
  //   });
  // }

  // nextWeek() {
  //   let week = this.state.date;
  //   let newWeek = addWeeks(week, 1);
  //   this.setState({
  //     date: newWeek,
  //   });
  // }

  // renderTimes() {
  //   return (
  //     <div class="timeBox">
  //       <div class="timeLabels">
  //         <table class="times">
  //           <tr>
  //             <td>12:00AM</td>
  //           </tr>
  //           <tr>
  //             <td>1:00AM</td>
  //           </tr>
  //           <tr>
  //             <td>2:00AM</td>
  //           </tr>
  //           <tr>
  //             <td>3:00AM</td>
  //           </tr>
  //           <tr>
  //             <td>4:00AM</td>
  //           </tr>
  //           <tr>
  //             <td>5:00AM</td>
  //           </tr>
  //           <tr>
  //             <td>6:00AM</td>
  //           </tr>
  //           <tr>
  //             <td>7:00AM</td>
  //           </tr>
  //           <tr>
  //             <td>8:00AM</td>
  //           </tr>
  //           <tr>
  //             <td>9:00AM</td>
  //           </tr>
  //           <tr>
  //             <td>10:00AM</td>
  //           </tr>
  //           <tr>
  //             <td>11:00AM</td>
  //           </tr>
  //           <tr>
  //             <td>12:00PM</td>
  //           </tr>
  //           <tr>
  //             <td>1:00PM</td>
  //           </tr>
  //           <tr>
  //             <td>2:00PM</td>
  //           </tr>
  //           <tr>
  //             <td>3:00PM</td>
  //           </tr>
  //           <tr>
  //             <td>4:00PM</td>
  //           </tr>
  //           <tr>
  //             <td>5:00PM</td>
  //           </tr>
  //           <tr>
  //             <td>6:00PM</td>
  //           </tr>
  //           <tr>
  //             <td>7:00PM</td>
  //           </tr>
  //           <tr>
  //             <td>8:00PM</td>
  //           </tr>
  //           <tr>
  //             <td>9:00PM</td>
  //           </tr>
  //           <tr>
  //             <td>12:00AM</td>
  //           </tr>
  //           <tr>
  //             <td>10:00PM</td>
  //           </tr>
  //           <tr>
  //             <td>11:00PM</td>
  //           </tr>
  //         </table>
  //       </div>

  //       <div class="timesUnderDates">
  //         <div class="sunday"></div>
  //         <div class="monday"></div>
  //         <div class="tuesday"></div>
  //         <div class="wednesday"></div>
  //         <div class="thursday"></div>
  //         <div class="friday"></div>
  //         <div class="saturday"></div>
  //       </div>

  //       <div class="spacer"></div>
  //     </div>
  //   );
  // }

  render() {
    return (
      <div>
        <div>
          <h1 className="mb-4">Welcome Home</h1>
        </div>

        <CreateEvent />

        {/**Inspiration from https://medium.com/@moodydev/create-a-custom-calendar-in-react-3df1bfd0b728 */}
        <div className="calendar">
          {this.renderMonth()}
          {/* {this.renderWeekdays()} */}
          {/* {this.renderTimes()} */}
          {this.createMonthCells()}
        </div>
      </div>
    );
  }
}

export default withRouter(Home);
