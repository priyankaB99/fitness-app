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
  isBefore,
  parse,
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
      events: [],
      showPopup: false,
      selectedWorkout: "",
      showAddEvent: false,
      selectedDay: "",
      // isOpen: false,
    };
    this.previousMonth = this.previousMonth.bind(this);
    this.nextMonth = this.nextMonth.bind(this);
    this.createWeekArray = this.createWeekArray.bind(this);
    this.createMonthCells = this.createMonthCells.bind(this);
    this.findThisMonthEvents = this.findThisMonthEvents.bind(this);
    this.deleteWorkoutEvent = this.deleteWorkoutEvent.bind(this);
    this.toggleViewEditEvent = this.toggleViewEditEvent.bind(this);
    this.toggleAddEvent = this.toggleAddEvent.bind(this);
    this.createEvent = this.createEvent.bind(this);
    this.displayMyEvent = this.displayMyEvent.bind(this);
    this.displaySharedEvent = this.displaySharedEvent.bind(this);
    this.createListOfEvents = this.createListOfEvents.bind(this);
  }

  componentDidMount() {
    fire.auth().onAuthStateChanged((user) => {
      if (user) {
        // User is signed in
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

  //TODO: FIX THIS TO CHANGE TO EVENTS/
  deleteWorkoutEvent(event) {
    let workoutsRef = fire.database().ref("Events/");
    workoutsRef.off("value");
    let eventId =
      event.currentTarget.parentNode.parentNode.parentNode.parentNode.id;
    let deleteEventRef = fire.database().ref("Events/" + eventId);
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
        event.target.className === "event" ||
        event.target.className === "eventName" ||
        event.target.className === "eventTime" ||
        event.target.className === "eventBox"
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

  displayMyEvent(eventData) {
    return (
      <div className="eventBox">
        <div
          className="event owner"
          id={eventData.eventKey}
          key={eventData.eventKey}
          onClick={() => this.toggleViewEditEvent(eventData)}
        >
          <div className="eventName"> {eventData.workoutName} </div>
          <div className="eventTime">
            {" "}
            {/* {eventData.start} - {eventData.end}{" "} */}
            {this.formatTime(eventData.start, eventData.end)}
          </div>
        </div>
      </div>
    );
  }

  formatTime = (startTime, endTime) => {
    if (startTime !== "" && endTime !== "") {
      let start = parse(startTime, "HH:mm", new Date());
      let end = parse(endTime, "HH:mm", new Date());
      let formattedStart = format(start, "h:mm b");
      let formattedEnd = format(end, "h:mm b");
      return formattedStart + " - " + formattedEnd;
    }
  };

  displaySharedEvent(eventData) {
    return (
      <div className="eventBox">
        <div
          className="event shared"
          id={eventData.eventKey}
          key={eventData.eventKey}
          onClick={() => this.toggleViewEditEvent(eventData)}
        >
          <div className="eventName"> {eventData.workoutName} </div>
          <div className="eventTime">
            {" "}
            {eventData.start} - {eventData.end}{" "}
          </div>
        </div>
      </div>
    );
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
      let cellDivClass = "col cell";
      let dateDivClass = "dayNumber";
      if (isAfter(dayToAdd, endMonth) || isBefore(dayToAdd, startMonth)) {
        dateDivClass += " diffMonthDate";
        cellDivClass += " noHover";
      }
      //adjusts class if date is today
      if (
        isSameDay(today, dayToAdd) &&
        isSameWeek(today, dayToAdd) &&
        isSameYear(today, dayToAdd)
      ) {
        cellDivClass += " today";
      }

      let todayEvents = [];

      //go through events
      for (let i = 0; i < this.state.events.length; i++) {
        let event = this.state.events[i];
        let formattedDate = new Date(
          format(parseISO(event.date), "MM/dd/yyyy")
        );
        if (
          isSameDay(formattedDate, dayToAdd) &&
          isSameWeek(formattedDate, dayToAdd)
        ) {
          if (!event.shared) {
            //if user is owner of event
            todayEvents.push(this.displayMyEvent(event));
          } else if (event.shared) {
            todayEvents.push(this.displaySharedEvent(event));
          }
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

  //get user's workout events
  findThisMonthEvents(currentMonth) {
    fire.auth().onAuthStateChanged((user) => {
      if (user) {
        let currentUser = fire.auth().currentUser.uid;
        let schedulesRef = fire.database().ref("Events/");
        let events = [];
        let thisMonth = this.state.month;
        if (currentMonth) {
          thisMonth = currentMonth;
        }
        schedulesRef.once("value", (data) => {
          let eventsFromDatabase = data.val();
          for (const key in eventsFromDatabase) {
            let formattedDate = new Date(
              format(parseISO(eventsFromDatabase[key].date), "MM/dd/yyyy")
            );
            //check if event is in selected month and year
            if (
              isSameMonth(formattedDate, thisMonth) &&
              isSameYear(formattedDate, thisMonth)
            ) {
              //own event
              if (eventsFromDatabase[key].creatorId === currentUser) {
                let event = this.createEvent(eventsFromDatabase, key, false);
                events.push(event);
                //shared event
              } else if (eventsFromDatabase[key].users.includes(currentUser)) {
                let event = this.createEvent(eventsFromDatabase, key, true);
                events.push(event);
              }
            }
          }
          this.setState({
            month: thisMonth,
            events: events,
            uid: user.uid,
          });
        });
      } else {
        this.props.history.push("/login");
      }
    });
  }

  createEvent(data, key, isShared) {
    return {
      eventKey: key,
      workoutName: data[key].workoutName,
      workoutId: data[key].workoutId,
      date: data[key].date,
      start: data[key].startTime,
      end: data[key].endTime,
      shared: isShared,
      creatorId: data[key].creatorId,
    };
  }

  createListOfEvents() {
    let eventsRender = [];
    let events = this.state.events;
    let today = new Date();
    events.map((data, index) => {
      let isToday = false;
      let cellDivClass = "eventListBox";
      if (
        isSameDay(today, new Date(format(parseISO(data.date), "MM/dd/yyyy"))) &&
        isSameWeek(
          today,
          new Date(format(parseISO(data.date), "MM/dd/yyyy"))
        ) &&
        isSameYear(today, new Date(format(parseISO(data.date), "MM/dd/yyyy")))
      ) {
        cellDivClass += " today";
        isToday = true;
      }

      if (data.shared) {
        cellDivClass += " shared";
      }

      eventsRender.push(
        <div class={cellDivClass} key={index}>
          <strong>
            {format(parseISO(data.date), "MM/dd/yyyy")}{" "}
            {isToday && <span>- Today</span>}
          </strong>
          {this.displayMyEvent(data)}
        </div>
      );
    });
    return eventsRender;
  }

  render() {
    return (
      <div>
        <div>
          <h1 className="mb-4">Welcome Home</h1>
        </div>
        <h5 className="home-banner">
          Create a workout event by clicking on a date in your calendar or here
          <br className="responsive"></br>
          <button
            type="button"
            id="addEventBtn"
            className="btn btn-secondary"
            onClick={this.toggleAddEvent}
          >
            Add Event
          </button>
        </h5>
        {/**https://medium.com/@daniela.sandoval/creating-a-popup-window-using-js-and-react-4c4bd125da57 */}
        {this.state.showPopup ? (
          <ViewEditEvent
            closePopup={this.toggleViewEditEvent}
            deleteEvent={this.deleteWorkoutEvent}
            selectedWorkout={this.state.selectedWorkout}
            scheduleId={this.state.uid}
            reloadCal={this.findThisMonthEvents}
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
        <div className="calEvents">
          {this.renderMonth()}

          <div id="calendar">
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

          <div id="listOfEvents" className="responsive">
            <h5 className="text-center">Workout Events for this Month</h5>
            {this.createListOfEvents()}
          </div>
        </div>
      </div>
    );
  }
}

export default withRouter(Home);
