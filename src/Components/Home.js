import React from "react";
import fire from "../Firebase/fire";
import "firebase/auth";
import "firebase/database";
import { withRouter } from "react-router-dom";
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
  isSameDay,
  isSameWeek,
  isSameYear,
  isSameMonth,
  parseISO,
  isAfter,
  isBefore
} from "date-fns";
import CreateEvent from "./CreateEvent";
import ViewEditEvent from "./ViewEditEvent";

// Code Resources
// -https://medium.com/@moodydev/create-a-custom-calendar-in-react-3df1bfd0b728
// -https://codepen.io/bastianalbers/pen/PWBYvz?editors=0010
// -https://dev.to/skptricks/create-simple-popup-example-in-react-application-5g7f

class Home extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      uid: "",
      month: new Date(),
      workoutEvents: [],
      showPopup: false,
      selectedWorkout: "",
      showAddEvent: false,
      selectedDay: "",
      // isOpen: false,
    };
    this.previousMonth = this.previousMonth.bind(this);
    this.nextMonth = this.nextMonth.bind(this);
    // this.previousWeek = this.previousWeek.bind(this);
    // this.nextWeek = this.nextWeek.bind(this);
    this.createWeekArray = this.createWeekArray.bind(this);
    this.createMonthCells = this.createMonthCells.bind(this);
    this.findThisMonthEvents = this.findThisMonthEvents.bind(this);
    this.deleteWorkoutEvent = this.deleteWorkoutEvent.bind(this);
    this.toggleViewEditEvent = this.toggleViewEditEvent.bind(this);
    this.toggleAddEvent = this.toggleAddEvent.bind(this);
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
        <button
          type="button"
          onClick={this.previousMonth}
          className="monthNav btn btn-secondary"
        >
          Previous
        </button>

        <div className="month">
          <h2>
            {format(this.state.month, "MMMM") +
              " " +
              format(this.state.month, "yyyy")}
          </h2>
        </div>

        <button
          type="button"
          onClick={this.nextMonth}
          className="monthNav btn btn-secondary"
        >
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

  deleteWorkoutEvent(event) {
    let workoutsRef = fire.database().ref("Schedules/");
    workoutsRef.off("value");
    let eventId = event.target.parentNode.id;
    console.log(event.target.parentNode);
    let deleteEventRef = fire
      .database()
      .ref("Schedules/" + this.state.uid + "/" + eventId);
    deleteEventRef.remove();
    this.findThisMonthEvents();
  }

  //Create pop-up of event details
  //Should be able to edit times, workout, etc.
  //https://codepen.io/bastianalbers/pen/PWBYvz?editors=0010
  toggleViewEditEvent(event) {
    this.setState({
      showPopup: !this.state.showPopup,
      selectedWorkout: event,
    });
  }

  toggleAddEvent(event) {
    //if false
    if (!this.state.showAddEvent) {
      //if clicking on the specific date element
      if (event.target.id === "addEventBtn") {
        this.setState({ selectedDay: "" });
        this.setState({ showAddEvent: true });
      } else if (
        event.target.className === "workoutEvent" ||
        event.target.className === "eventWorkoutName" ||
        event.target.className === "eventWorkoutTime" ||
        event.target.className === "workoutBox"
      ) {
        console.log(event.target.className);
        this.setState({ showAddEvent: false });
      } else if (event.target.tagName === "STRONG") {
        this.setState({ selectedDay: event.target.parentNode.parentNode.id });
        this.setState({ showAddEvent: true });

        //if clicking on the div inside
      } else if (event.target.className === "dayNumber") {
        this.setState({ selectedDay: event.target.parentNode.id });
        this.setState({ showAddEvent: true });
      } else {
        this.setState({ selectedDay: event.target.id });
        this.setState({ showAddEvent: true });
      }
    } else {
      this.setState({ showAddEvent: false });
    }
  }

  //Returns array of the week, starting from Sunday
  createWeekArray(currentDay) {
    let start = startOfWeek(currentDay);
    let endMonth = endOfMonth(startOfMonth(this.state.month));
    let startMonth = startOfMonth(this.state.month);
    let today = new Date();
    let days = [];

    for (let i = 0; i < 7; i++) {
      let dayToAdd = addDays(start, i);
      let daynumber = format(dayToAdd, "d");

      //adjusts class if day is before or after current month
      let cellDivClass = "col cell"
      let dateDivClass = "dayNumber"
      if (isAfter(dayToAdd, endMonth) || isBefore(dayToAdd, startMonth)) {
        dateDivClass += " diffMonthDate"
        cellDivClass += " noHover"
      }
      //adjusts class if date is today
      if (
        isSameDay(today, dayToAdd) &&
        isSameWeek(today, dayToAdd) &&
        isSameYear(today, dayToAdd)
      ) {
        cellDivClass += " today";
      }

      //add events
      let todayEvents = [];
      for (let i = 0; i < this.state.workoutEvents.length; i++) {
        let event = this.state.workoutEvents[i];
        let formattedDate = new Date(
          format(parseISO(event.date), "MM/dd/yyyy")
        );
        if (
          isSameDay(formattedDate, dayToAdd) &&
          isSameWeek(formattedDate, dayToAdd)
        ) {
          todayEvents.push(
            <div className="workoutBox">
              <div
                className="workoutEvent"
                id={event.eventKey}
                key={event.eventKey}
                onClick={() => this.toggleViewEditEvent(event)}
              >
                <div className="eventWorkoutName">{event.workoutName}</div>
                <div className="eventWorkoutTime">
                  {event.start} - {event.end}
                </div>
              </div>
            </div>
          );
        }
      }

      //Finish day cell with events
      days.push(
        <div
          className={cellDivClass}
          key={dayToAdd}
          onClick={this.toggleAddEvent}
          id={dayToAdd}
        >
          <div className={dateDivClass}>
            <strong>{daynumber}</strong>
          </div>
          {todayEvents}
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
      weekRows.push(this.createWeekArray(currentDay));
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
        schedulesRef.once("value", function (data) {
          let eventsFromDatabase = data.val();
          for (const key in eventsFromDatabase) {
            let formattedDate = new Date(
              format(parseISO(eventsFromDatabase[key].date), "MM/dd/yyyy")
            );
            console.log(eventsFromDatabase[key]);
            if (
              isSameMonth(formattedDate, thisMonth) &&
              isSameYear(formattedDate, thisMonth)
            ) {
              eventsData.push({
                eventKey: key,
                workoutName: eventsFromDatabase[key].workoutName,
                workoutId: eventsFromDatabase[key].workoutId, //this is the ID in firebase corresponding to exercise
                date: eventsFromDatabase[key].date,
                start: eventsFromDatabase[key].startTime,
                end: eventsFromDatabase[key].endtime,
              });
            }
          }
          currentComponent.setState({
            month: thisMonth,
            workoutEvents: eventsData,
            uid: user.uid,
          });
        });
      } else {
        currentComponent.props.history.push("/login");
      }
    });
  }

  render() {
    return (
      <div>
        <div>
          <h1 className="mb-4">Welcome Home</h1>
        </div>
        <h5 class="home-banner">
          Create a workout event by clicking on a date in your
          calendar or here
          <button type="button" id="addEventBtn" className="btn btn-secondary" onClick={this.toggleAddEvent}>
            Add Event
          </button>
        </h5>
        {/**https://medium.com/@daniela.sandoval/creating-a-popup-window-using-js-and-react-4c4bd125da57 */}
        {this.state.showPopup ? (
          <ViewEditEvent
            closePopup={this.toggleViewEditEvent}
            deleteEvent={this.deleteWorkoutEvent}
            selectedWorkout={this.state.selectedWorkout}
          />
        ) : null}
        {this.state.showAddEvent ? (
          <CreateEvent
            closePopup={this.toggleAddEvent}
            reloadCal={this.findThisMonthEvents}
            selectedDay={this.state.selectedDay}
          />
        ) : null}
        {/**Inspiration from https://medium.com/@moodydev/create-a-custom-calendar-in-react-3df1bfd0b728 */}
        <div className="calendar">
          {this.renderMonth()}

          <div className="row calHeader">
            <div className="col">
              <strong>Sunday</strong>
            </div>
            <div className="col">
              <strong>Monday</strong>
            </div>
            <div className="col">
              <strong>Tuesday</strong>
            </div>
            <div className="col">
              <strong>Wednesday</strong>
            </div>
            <div className="col">
              <strong>Thursday</strong>
            </div>
            <div className="col">
              <strong>Friday</strong>
            </div>
            <div className="col">
              <strong>Saturday</strong>
            </div>
          </div>
          {this.createMonthCells()}
        </div>
      </div>
    );
  }
}

export default withRouter(Home);
