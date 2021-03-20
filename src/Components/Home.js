import React from "react";
import fire from "../Firebase/fire";
import "firebase/auth";
import "firebase/database";
import { withRouter, Link, Redirect } from "react-router-dom";
import "../CSS/Home.css";

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
  isSameMonth,
  parseISO
} from "date-fns";
import CreateEvent from "./CreateEvent";

// Code Resources
// -https://medium.com/@moodydev/create-a-custom-calendar-in-react-3df1bfd0b728

class Home extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      uid: "",
      month: new Date(),
      workoutEvents: []
    };
    this.previousMonth = this.previousMonth.bind(this);
    this.nextMonth = this.nextMonth.bind(this);
    // this.previousWeek = this.previousWeek.bind(this);
    // this.nextWeek = this.nextWeek.bind(this);
    this.createWeekArray = this.createWeekArray.bind(this);
    this.createMonthCells = this.createMonthCells.bind(this);
    this.findThisMonthEvents = this.findThisMonthEvents.bind(this);
    this.deleteWorkoutEvent = this.deleteWorkoutEvent.bind(this);
  }

  componentDidMount() {
    fire.auth().onAuthStateChanged((user) => {
      if (user) {
        // User is signed in
        console.log(user.email);
        console.log(user.displayName);
        this.findThisMonthEvents();
      } else {
        // No user is signed in
        this.props.history.push("/login");
      }
    });
  }

  //Inspiration: https://medium.com/@moodydev/create-a-custom-calendar-in-react-3df1bfd0b728
  renderMonth() {
    return (
      <div className="monthBox">
        <button type="button" onClick={this.previousMonth} className="monthNav btn btn-secondary btn-sm">
          Previous
        </button>

        <div className="month">
          <h2>
            {format(this.state.month, "MMMM") +
              " " +
              format(this.state.month, "yyyy")}
          </h2>
        </div>

        <button type="button" onClick={this.nextMonth} className="monthNav btn btn-secondary btn-sm">
          Next
        </button>
      </div>
    );
  }

  previousMonth() {
    let newMonth = subMonths(this.state.month, 1);
    this.findThisMonthEvents(newMonth);
  }

  nextMonth() {
    let newMonth = addMonths(this.state.month, 1);
    this.findThisMonthEvents(newMonth);
  }

  //from https://medium.com/@moodydev/create-a-custom-calendar-in-react-3df1bfd0b728
  // renderWeekdays() {
  //   let week = this.createWeekArray();

  //   return (
  //     <div class="weekBox">
  //       <div onClick={this.previousWeek} class="weekNav nav">
  //         Previous Week
  //       </div>

  //       <div class="week">{week}</div>

  //       <div onClick={this.nextWeek} class="weekNav nav">
  //         Next Week
  //       </div>
  //     </div>
  //   );
  // }

  //Returns array of the week, starting from Sunday
  createWeekArray(currentDay) {
    let start = startOfWeek(currentDay);
    let days = [];
    for (let i = 0; i < 7; i++) {
      let dayToAdd = addDays(start, i);
      let weekday = format(dayToAdd, "EEEE"); //needed to convert to English name to add the * if date matches, otherwise syntax error
      let daynumber = format(dayToAdd, "d");
      let today = new Date();

      if (
        isSameDay(today, dayToAdd) &&
        isSameWeek(today, dayToAdd) &&
        isSameYear(today, dayToAdd)
      ) {
        //identifies current day: make into CSS later!!!
        weekday = "**" + weekday + "**";
      }

      let todayEvents = [];
      for (let i=0; i< this.state.workoutEvents.length; i++) {
        let event = this.state.workoutEvents[i];
        let formattedDate = new Date(format(parseISO(event.date), 'MM/dd/yyyy'));
        if (isSameDay(formattedDate, dayToAdd) && isSameWeek(formattedDate, dayToAdd)) {
          console.log(event);
          todayEvents.push(
            <div className="workoutEvent" id={event.eventKey} key={event.eventKey}>
              <div><strong>{event.workoutName}</strong></div>
              <div>{event.start} - {event.end}</div>
              <button type="button" onClick={this.deleteWorkoutEvent}>Delete</button>
            </div>
          );
        }
      }

      days.push(
        <div className="col cell" key={dayToAdd}>
          <div className="dayNumber">
            <strong>{daynumber}</strong>
            {todayEvents}
          </div>
        </div>
      );
    }
    return <div className="weekdayRow row">{days}</div>;
  }

  //Returns whole month, made up of week arrays
  createMonthCells() {
    let monthStart = startOfMonth(this.state.month);
    let monthEnd = endOfMonth(monthStart);
    let startDate = startOfWeek(monthStart);
    let endDate = endOfWeek(monthEnd);

    let weekRows = [];
    let currentDay = startDate;
    while (currentDay < endDate) {
      weekRows.push(
        this.createWeekArray(currentDay)
      );
      currentDay = addDays(currentDay, 7);
    }
    return <div className="all-cells">{weekRows}</div>;
  }

  findThisMonthEvents(currentMonth) {
    let currentComponent = this;
    //get user's workout events
    fire.auth().onAuthStateChanged(function (user) {
      if (user) {
        let schedulesRef = fire.database().ref("Schedules/" + user.uid);
        let eventsData = [];
        let thisMonth = currentComponent.state.month;
        if (currentMonth) {
          thisMonth = currentMonth;
        }
        console.log(thisMonth);
        schedulesRef.once("value", function (data) {
          let eventsFromDatabase = data.val();
          for (const key in eventsFromDatabase) {
            let formattedDate = new Date(format(parseISO(eventsFromDatabase[key].date), 'MM/dd/yyyy'));
            if (isSameMonth(formattedDate, thisMonth) && isSameYear(formattedDate, thisMonth)) {
              eventsData.push({
                eventKey: key,
                workoutName: eventsFromDatabase[key].workoutName,
                workoutId: eventsFromDatabase[key].workoutId,
                date: eventsFromDatabase[key].date,
                start: eventsFromDatabase[key].startTime,
                end: eventsFromDatabase[key].endtime
              });
            }
          }
          currentComponent.setState({ month: thisMonth, workoutEvents: eventsData, uid: user.uid});
        });
      }
      else {
        currentComponent.props.history.push("/login");
      }
    });
  }

  deleteWorkoutEvent(event) {
    let eventId = event.target.parentNode.id;
    console.log(eventId);
    let deleteEventRef = fire.database().ref("Schedules/"+this.state.uid+"/"+eventId);
    deleteEventRef.remove();
    this.findThisMonthEvents();
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
    console.log("render");
    return (
      <div>
        <div>
          <h1 className="mb-4">Welcome Home</h1>
        </div>

        <CreateEvent reloadCal={this.findThisMonthEvents}/>

        {/**Inspiration from https://medium.com/@moodydev/create-a-custom-calendar-in-react-3df1bfd0b728 */}
        <div className="calendar">
          {this.renderMonth()}
          {/* {this.renderWeekdays()} */}
          {/* {this.renderTimes()} */}
          <div className="row calHeader">
            <div className="col"><strong>Sunday</strong></div>
            <div className="col"><strong>Monday</strong></div>
            <div className="col"><strong>Tuesday</strong></div>
            <div className="col"><strong>Wednesday</strong></div>
            <div className="col"><strong>Thursday</strong></div>
            <div className="col"><strong>Friday</strong></div>
            <div className="col"><strong>Saturday</strong></div>
          </div>
          {this.createMonthCells()}
        </div>
      </div>
    );
  }
}

export default withRouter(Home);
