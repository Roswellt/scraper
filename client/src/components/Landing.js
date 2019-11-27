import React, { Component } from "react";
import { Redirect } from "react-router-dom";
import io from "socket.io-client";
import AthleteView from "../containers/AthleteView";
class Landing extends Component {
  constructor(props) {
    super(props);
    this.state = {
      
    };

    this.handleChange = this.handleChange.bind(this);
  }

  handleChange(event) {
    const key = event.target.name;
    const value = event.target.value;
    this.setState(prevState => {
      return { [key]: value };
    });
  }

  onClickCreate = e => {
    e.preventDefault();
    this.setState(() => ({
      clickedCreate: true
    }));
  };

  render() {
    if (this.state.clickedCreate) {
      return <Redirect to="/host-game" />;
    }
    return (
      <div className="App">
        <div className="gridChild container">
          <nav className="navbar navbar-light bg-light">
            <span className="nav-title">Parsify.</span>
          </nav>
        </div>
      </div>
    );
  }
}

export default Landing;
