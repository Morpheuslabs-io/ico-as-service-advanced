
import React, { Component, PropTypes } from 'react';

class Checkbox extends Component {
  state = {
    isChecked: false,
  }

  toggleCheckboxChange = () => {
    const { handleCheckboxChange, label } = this.props;

    this.setState(({ isChecked }) => (
      {
        isChecked: !isChecked,
      }
    ));

    handleCheckboxChange(label);
  }

  componentDidMount = async () => {
    const { checked } = this.props;
    this.setState({
      isChecked: checked
    })
  }

  render() {
    const { label } = this.props;
    const { isChecked } = this.state;

    return (
      <div className="form-check">
        <label className="form-check-label">
          <input
            className="form-check-input"
            type="checkbox"
            value={label}
            checked={isChecked}
            onChange={this.toggleCheckboxChange}
          />

          {label}
        </label>
      </div>
    );
  }
}

export default Checkbox;