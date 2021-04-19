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
import ViewEditEvent from "./ViewEditEvent";

// Code Resources
// -https://medium.com/@moodydev/create-a-custom-calendar-in-react-3df1bfd0b728
// -https://codepen.io/bastianalbers/pen/PWBYvz?editors=0010
// -https://dev.to/skptricks/create-simple-popup-example-in-react-application-5g7f

class UserCalendar extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      uid: "",
      displayUserId: this.props.displayUserId,
      month: new Date(),
      events: [],
      showPopup: false,
      selectedWorkout: "",
      showAddEvent: false,
      selectedDay: ""
    };
    this.renderMonthHeader = this.renderMonthHeader.bind(this);
    this.previousMonth = this.previousMonth.bind(this);
    this.nextMonth = this.nextMonth.bind(this);
    this.createWeekArray = this.createWeekArray.bind(this);
    this.createMonthCells = this.createMonthCells.bind(this);
    this.findThisMonthEvents = this.findThisMonthEvents.bind(this);
    this.toggleViewEditEvent = this.toggleViewEditEvent.bind(this);
    this.createEvent = this.createEvent.bind(this);
    this.displayMyEvent = this.displayMyEvent.bind(this);
    this.displaySharedEvent = this.displaySharedEvent.bind(this);
  }

  componentDidMount() {
    fire.auth().onAuthStateChanged((user) => {
      if (user) {
        // User is signed in
        console.log(user.email);
        console.log(user.displayName);
        this.findThisMonthEvents();
      } 
    });
  }

  createEvent(data, key, isShared){
    return(
      {eventKey: key,
      workoutName: data[key].workoutName,
      workoutId: data[key].workoutId,
      date: data[key].date,
      start: data[key].startTime,
      end: data[key].endTime,
      shared: isShared
      }
    )
  }

  findThisMonthEvents(currentMonth) {
    fire.auth().onAuthStateChanged( (user) => {
      if (user) {
        let displayUser = this.state.displayUserId;
        let schedulesRef = fire.database().ref("Events/");
        let events = [];
        let thisMonth = this.state.month;
        if (currentMonth) {
          thisMonth = currentMonth;
        }
        schedulesRef.once("value",  (data) => {
          let eventsFromDatabase = data.val();
          for (const key in eventsFromDatabase) {
            let formattedDate = new Date(
              format(parseISO(eventsFromDatabase[key].date), "MM/dd/yyyy")
            );
            //check if event is in selected month and year
            if(isSameMonth(formattedDate, thisMonth) && isSameYear(formattedDate, thisMonth) ) {
              if(eventsFromDatabase[key].creatorId === displayUser){
                let event = this.createEvent(eventsFromDatabase, key, false);
                events.push(event);
              }
              else if(eventsFromDatabase[key].users.includes(displayUser)){
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

  //Inspiration: https://medium.com/@moodydev/create-a-custom-calendar-in-react-3df1bfd0b728
  renderMonthHeader() {
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

  toggleViewEditEvent(event) {
    this.setState({
      showPopup: !this.state.showPopup,
      selectedWorkout: event,
    });
  }

  displayMyEvent(eventData){
    return(
      <div className="eventBox">
        <div 
        className = "event owner" 
        id={eventData.eventKey} key={eventData.eventKey} 
        onClick={() => this.toggleViewEditEvent(eventData)}
        >
          <div className = "eventName"> {eventData.workoutName} </div>
          <div className = "eventTime"> {eventData.start} - {eventData.end} </div>
        </div>
      </div>
    );
  }

  displaySharedEvent(eventData){
    return(
      <div className="eventBox">
        <div 
          className = "event shared" 
          id={eventData.eventKey} key={eventData.eventKey} 
          onClick={() => this.toggleViewEditEvent(eventData)}
        >
          <div className = "eventName"> {eventData.workoutName} </div>
          <div className = "eventTime"> {eventData.start} - {eventData.end} </div>
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

      let todayEvents = [];
      
      //go through events
      for (let i = 0; i < this.state.events.length; i++) {
        let event = this.state.events[i];
        let formattedDate = new Date(format(parseISO(event.date), "MM/dd/yyyy") );
        if (isSameDay(formattedDate, dayToAdd) && isSameWeek(formattedDate, dayToAdd)) {
          if(!event.shared){ //if user is owner of event
            todayEvents.push(this.displayMyEvent(event));
          }
          else if(event.shared){
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

  render() {
    return (
      <div>     
        {/**https://medium.com/@daniela.sandoval/creating-a-popup-window-using-js-and-react-4c4bd125da57 */}
        {this.state.showPopup ? (
          <ViewEditEvent
            closePopup={this.toggleViewEditEvent}
            // deleteEvent={this.deleteWorkoutEvent}
            selectedWorkout={this.state.selectedWorkout}
            otherUserEvent={this.state.displayUserId ? true : false}
          />
        ) : null}

        {/**Inspiration from https://medium.com/@moodydev/create-a-custom-calendar-in-react-3df1bfd0b728 */}
        <div className="calendar">

          {this.renderMonthHeader()}

          <div className="row calHeader">
            <div className="col">
              <strong>Sun</strong>
            </div>
            <div className="col">
              <strong>Mon</strong>
            </div>
            <div className="col">
              <strong>Tue</strong>
            </div>
            <div className="col">
              <strong>Wed</strong>
            </div>
            <div className="col">
              <strong>Thu</strong>
            </div>
            <div className="col">
              <strong>Fri</strong>
            </div>
            <div className="col">
              <strong>Sat</strong>
            </div>
          </div>

          {this.createMonthCells()}

        </div>
      </div>
    );
  }
}

export default withRouter(UserCalendar);