import React, { Component } from 'react';
class ToggleGroup extends Component {
    // constructor(props) {
    //     super(props)
    //     this.state = {
    //         value: this.props.value
    //     };
    // }

    // componentWillReceiveProps(props) {
    //     // You don't have to do this check first, but it can help prevent an unneeded render
    //     const { value } = props;
    //     if (value !== this.state.value) {
    //         this.setState({ value });
    //     }
    // }

    // onChange = (e) => {
    //     this.props.onChange(e);
    //     const value = e.target.value;
    //     this.setState({ value });
    // }

    render() {
        return (
            <div {...this.props}>
                {this.props.items.map(item => {
                    // console.log("props.value", typeof this.props.value, this.props.value, "item.value", typeof item.value, item.value);

                    // console.log(item.label, "checked", this.props.value === item.value);

                    return (
                        <label key={item.value}>
                            &nbsp;&nbsp;
                            <input
                                type="radio"
                                pattern={this.props.pattern}
                                checked={this.props.value === item.value}
                                disabled={item.disabled}
                                value={item.value}
                                name={this.props.name}
                                onChange={this.props.onChange}
                            />
                            &nbsp;
                            <span>{item.label}</span>
                        </label>
                    );
                })}
            </div>
        );
    }
}

export default ToggleGroup;