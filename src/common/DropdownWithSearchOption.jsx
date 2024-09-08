import React, {useState} from 'react';
import {Typeahead} from 'react-bootstrap-typeahead';
import 'react-bootstrap-typeahead/css/Typeahead.css';

const DropdownWithSearchOption = ({options, labelKey, value, multiple, onChange}) => {
  const [selected, setSelected] = useState(value || []);

  const handleChange = (array) => {
    setSelected(array);
    onChange(array);
  }

  return (
      <div className="typeahead-container">
        <Typeahead
            id="basic-example"
            labelKey={labelKey}
            multiple={multiple}
            onChange={handleChange}
            options={options}
            placeholder="Choose an option..."
            selected={selected}
        />
      </div>
  );
};

export default DropdownWithSearchOption;