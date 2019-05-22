import React, { Component } from 'react';
import { Button, Popover, PopoverBody, PopoverHeader } from 'reactstrap';
import PropTypes from "prop-types";

class HelpPopover extends Component {
  constructor(props) {
    super(props);

    this.toggle = this.toggle.bind(this);
    this.state = {
      popoverOpen: false,
    };
  }

  toggle() {
    this.setState({
      popoverOpen: !this.state.popoverOpen,
    });
  }

  render() {
    return (
      <span>
        &nbsp;<span className="c-pointer"><i className="fa fa-info-circle text-primary" id={'Popover-' + this.props.id} onClick={this.toggle}/></span>&nbsp;
        <Popover placement={this.props.placement} isOpen={this.state.popoverOpen} target={'Popover-' + this.props.id} toggle={this.toggle}>
          <PopoverHeader>{this.props.title}</PopoverHeader>
          <PopoverBody>{this.props.content}</PopoverBody>
        </Popover>
      </span>
    );
  }
}

HelpPopover.propTypes = {
  placement: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired,
  content: PropTypes.string.isRequired,
  id: PropTypes.string.isRequired,
};

export default HelpPopover;
