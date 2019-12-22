import React, { Component } from 'react';
import Select from 'react-select';

class MySelect extends Component {
    state = {
        options: [],
        value: null,
        selectedOption: null
    }

    componentWillReceiveProps(props) {
        // You don't have to do this check first, but it can help prevent an unneeded render
        const { value, options } = props;
        if (options !== this.state.options) {
            this.setState({ options });
        }

        if (value !== this.state.value) {
            this.setState({ value });
        }

        this.populateSelectedOption(value, options);

    }

    populateSelectedOption = (value, options) => {
        // console.log("options in select", options);
        // console.log("Value in select", value);

        let selectedOption = null;

        const result = options.filter(option => option.value === value);
        console.log("Result", result);

        if (result[0] === undefined && result.length < 1) {
            selectedOption = null;
        } else {
            selectedOption = { value, label: result[0].label };
        }
        this.setState({ value, selectedOption });
    }

    onChange = (value, options) => {
        const actValue = value !== null ? value.value : null;
        this.props.onChange(this.props.name, actValue);
        this.populateSelectedOption(actValue, options);
    }

    clearValue = () => {
        this.setState({selectedOption: null});
        return true;
    }

    showSelect = () => {
        const { selectedOption, options } = this.state;
        
        return (<Select
            name={this.props.name}
            value={selectedOption}
            placeholder={this.props.placeholder}
            options={options}
            isClearable={this.clearValue}
            onChange={(value) => this.onChange(value, this.state.options)}
        />);
    }

    render() {
        return (
            <div>
                {this.showSelect()}
            </div>
        );
    }
}

export default MySelect;