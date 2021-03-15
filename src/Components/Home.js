import React from "react";
import fire from "../Firebase/fire";
import 'firebase/auth';
import 'firebase/database';
import { withRouter, Link, Redirect } from 'react-router-dom';
import { format, subMonths, addMonths, startOfWeek, addDays, subWeeks, addWeeks } from 'date-fns';

// Code Resources
// -https://medium.com/@moodydev/create-a-custom-calendar-in-react-3df1bfd0b728

class Home extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      loggedIn: false,
      uid: '',
      email: '',
      username: '',
      date: new Date()
    };
    this.previousMonth = this.previousMonth.bind(this);
    this.nextMonth = this.nextMonth.bind(this);
    this.previousWeek = this.previousWeek.bind(this);
    this.nextWeek = this.nextWeek.bind(this);
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
        this.props.history.push('/login');
      }
    });
  }

  //Inspiration: https://medium.com/@moodydev/create-a-custom-calendar-in-react-3df1bfd0b728
  renderMonth(){
    let month = this.state.date;
    return (
      <div class="monthBox">
        <div onClick={this.previousMonth}> {/**previous month */}
          BACK
        </div>

        <div class="month">
          {format(month,"MMMM")}
        </div>

        <div onClick={this.nextMonth}>
          NEXT
        </div>
        
      </div>
    );
  }

  previousMonth(){
    let month = this.state.date;
    let newMonth = subMonths(month, 1);
    this.setState({
      date: newMonth
    });
  }

  nextMonth(){
    let month = this.state.date;
    let newMonth = addMonths(month, 1);
    this.setState({
      date: newMonth
    });
  }


  //shows current days, can CHANGE current days
  //need to mark CURRENT day
  //from https://medium.com/@moodydev/create-a-custom-calendar-in-react-3df1bfd0b728
  renderWeekdays(){
    let day = this.state.date; //current day
    let sunday = startOfWeek(day);

    let week = []; //

    for(let i = 0; i < 7; i++){
      let dayCalculator = addDays(sunday, i); //what day are you currently adding into array
      let dayNumber = format(dayCalculator,"d");
      let weekday = format(dayCalculator,"EEEE")
      week.push(
        <div key={i}> 
          <div class="dayNumber">
            {dayNumber}
          </div>
          <div class="weekday">
            {weekday}
          </div>
        </div>
      );
    }

    return (
      <div class="dayBox">
        <div onClick={this.previousWeek}>
          BACK
        </div>
        {week}
        <div onClick={this.nextWeek}>
          NEXT
        </div>
      </div>
    );
  }

  previousWeek(){
    let week = this.state.date;
    let newWeek = subWeeks(week, 1);
    this.setState({
      date: newWeek
    });
  }

  nextWeek(){
    let week = this.state.date;
    let newWeek = addWeeks(week, 1);
    this.setState({
      date: newWeek
    });
  }

  renderTimes(){
    return(
      <p>Times</p>
    );
  }

  render() {

      return (
      <div>
        <div>
          <h1 class="mb-4">Welcome Home</h1>
        </div>

        {/**Inspiration from https://medium.com/@moodydev/create-a-custom-calendar-in-react-3df1bfd0b728 */}
        <div>
          {this.renderMonth()}

          <br></br>

          {this.renderWeekdays()}

          <br></br>

          {this.renderTimes()}
        </div>

      </div>
    );
  }
}

export default withRouter(Home);
