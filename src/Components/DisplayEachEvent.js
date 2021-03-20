import React from "react";
import fire from "../Firebase/fire";
import "firebase/auth";
import "firebase/database";
import { withRouter } from "react-router-dom";
import { Modal, Button } from "react-bootstrap";

class EventModal extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isOpen: false,
      date: "",
      startTime: "",
      endTime: "",
      workoutName: "",
      workoutId: "",
    };
  }
  openModal = () => this.setState({ isOpen: true });
  closeModal = () => this.setState({ isOpen: false });

  render() {
    return (
      <Modal show={this.state.isOpen} onHide={this.closeModal}>
        <Modal.Header closeButton>
          <Modal.Title>Modal heading</Modal.Title>
        </Modal.Header>
        <Modal.Body>Woohoo, you're reading this text in a modal!</Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={this.closeModal}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    );
  }
}

export default withRouter(EventModal);
