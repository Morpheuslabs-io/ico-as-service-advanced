/**
 * Validator Object generator
 *
 *  target_component: Target react component with `errors` state
 *  rules: object defining validation rule,
 *
 *  Error format is following, but better to use `hasError('field')` and `getError('field')` Helper functions
 *
 *  errors: {
 *      field: [
 *        'error1',
 *        'error2'
 *        ]
 *    }
 *
 *  ex:
 *    constructor (props) {
 *
 *      this.state = {
 *        first_name: '',    <--------------------------------------actual fields
 *        errors: {}   <-------------------------------------------errors state
 *      }
 *
 *      // Init validator object  <--------------------------------Init validator with rules
 *      this.validator = validator(this, {
 *           'first_name': [
 *             {
 *               test: (val) => {return val.length >= 5},
 *               message: 'Name should be longer than 5 letters'
 *             }
 *           ]
 *         });
 *    }
 *
 *
 *    handleInputChange(e, id) {
 *      const newState = Object.assign({}, this.state);
 *      newState[id] = e.target.value;
 *      this.setState(newState);
 *
 *      // Call validation      <-------------------------------------2
 *      this.validator.validate(id);
 *    }
 *
 *
 *    render() {
 *    ...
 *      <TextField
 *        onChange={e => {this.handleInputChange(e, 'first_name')}}
 *        error={this.validator.hasError('first_name')} <---------------3
 *        helperText={this.validator.getError('first_name')}
 *    ...
 *    }
 *
 */
export default function (target_component, rules) {
  return {
    rules,

    /**
     * Validates one key of component state
     * @param {string} key - The key of component to validate, ex: `this.state.first_name`
     * @returns {boolean}
     */
    validate(key) {
      if (target_component.state.hasOwnProperty(key)) {
        return this.validatePair(target_component.state[key], key);
      }

      return true;
    },

    /**
     * Validates array of keys from component state
     * @param {Array} key_array - The array of keys, ex: [ 'first_name', 'last_name', ...etc ]
     * @returns {boolean}
     */
    validateFields(key_array) {
      let valid = true;

      for (let i = 0; i < key_array.length; i++) {
        valid = this.validate(key_array[i]) && valid;
      }

      return valid;
    },
    /**
     * Validates key with new_value, this does not change actual value of state. ex: (new_val, key)
     * @param new_val - Value to validate
     * @param key - The key of state
     * @returns {boolean}
     */
    validatePair(new_val, key) {
      if (rules && rules.hasOwnProperty(key)) {
        let error = [];

        // Do validation
        rules[key].forEach((rule) => {
          if (rule.test instanceof RegExp) {
            // Do regexp validation
            if (!rule.test.test(new_val)) {
              error.push(rule.message);
            }
          } else if (typeof(rule.test) === 'function') {
            // Do function validation
            if (!rule.test(new_val)) {
              error.push(rule.message);
            }
          }
        });

        // Update component's state
        target_component.setState((prev_state) => {
          return {
            errors: Object.assign({}, prev_state.errors, {
              [key]: error
            })
          }
        });

        return error.length === 0;
      }

      return true;
    },

    /**
     * Validates Pairs, this does not change actual value of state.
     * @param key_val_obj - {{key1: new_val1}, {key2: new_val2}, ...}
     * @returns {boolean}
     */
    validatePairs(key_val_obj) {
      let valid = true;

      for (let key in key_val_obj) {
        if (key_val_obj.hasOwnProperty(key)) {
          valid = this.validatePair(key_val_obj[key], key) && valid;
        }
      }

      return valid;
    },

    /**
     * Set component's `errors` state from external object
     * @param err_obj - { key1: ['error1', 'error2'], key2: ['error21', 'error22'] }
     */
    setErrorPairs(err_obj) {
      for (let key in err_obj) {
        if (err_obj.hasOwnProperty(key)) {
          // Update component's state
          target_component.setState((prev_state) => {
            return {
              errors: Object.assign({}, prev_state.errors, {
                [key]: Array.isArray(err_obj[key]) ? err_obj[key] : [err_obj[key]]
              })
            }
          });
        }
      }
    },

    /**
     * Helper function to check if one key has errors or not, This does not validate field again, just return
     * @param {string} key - key to check
     * @returns {boolean}
     */
    hasError(key) {
      return (target_component.state.hasOwnProperty('errors') &&
        target_component.state.errors.hasOwnProperty(key) &&
        target_component.state.errors[key].length > 0);
    },

    /**
     * Helper function to get first error of key as string, returns '' if no error
     * @param {string} key - key to get error
     * @returns {string}
     */
    getError(key) {
      if (target_component.state.hasOwnProperty('errors') &&
        target_component.state.errors.hasOwnProperty(key) &&
        target_component.state.errors[key].length > 0) {
        return target_component.state.errors[key][0];
      } else {
        return '';
      }
    },

    /**
     * Helper function to check array of keys have at least one error or not.
     * @param {Array} fields - array of keys, ex: [ 'first_name', 'last_name', ...etc ]
     * @returns {boolean}
     */
    hasErrors(fields) {
      // Used for instead of foreach performance wise
      for (let i = 0, len = fields.length; i < len; i++) {
        if (!this.hasError(fields[i])) {
          return false;
        }
      }

      return true;
    },

    /**
     * Reset errors state, this does not do validation
     */
    reset() {
      let errors = {};

      for (let rule in rules) {
        if (rules.hasOwnProperty(rule)) {
          errors[rule] = [];
        }
      }

      target_component.setState({
        errors
      });
    }
  };
}
