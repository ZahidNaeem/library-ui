import DropdownWithSearchOption from "./DropdownWithSearchOption";
import plusImage from "../images/plus.svg";
import trashImage from '../images/trash.svg';
import {useState} from "react";
import {getCustomDropdownValue, getFirstElement} from "./Constants";

const NestedTableComponent = ({configurations, nestedTableData, onNestedTableChange}) => {

  const [tableData, setTableData] = useState(nestedTableData || []);

  const addRow = () => {
    const data = [...tableData];
    const row = {};
    const defaultValues = configurations.filter((conf) => conf.default);
    defaultValues.forEach((val) => (row[val.modalKey] = val.default));
    data.push(row);
    setTableData(data);
  }

  const deleteRow = (index) => {
    const data = [...tableData];
    data.splice(index, 1);
    setTableData(data);
  }

  const onChange = (index, name, value) => {
    const data = [...tableData];
    data[index][name] = value;
    setTableData(data);
    onNestedTableChange(data);
  }

  function onDropdownChange(array, conf, index) {
    const {listReturnKey, modalKey, multiple} = conf;
    const data = [...tableData];
    if (multiple) {
      if (listReturnKey) {
        data[index][modalKey] = array.map(element => element[listReturnKey]);
      } else {
        data[index][modalKey] = array;
      }
    } else {
      const firstElement = getFirstElement(array);
      if (listReturnKey) {
        data[index][modalKey] = firstElement[listReturnKey] || null;
      } else {
        data[index][modalKey] = firstElement;
      }
    }
    setTableData(data);
    onNestedTableChange(data);
  }

  return (
      <div>
        <img className="custom-img" src={plusImage} alt="Add Row" onClick={() => addRow()}/>
        <div className="awesome-table nested-table">
          <table className="table table-stripped table-hover scrollable">
            <thead>
            <tr key="modalNestedTableHeaderRow">
              <th key="modalNestedTableHeaderRowNumber" scope="col" className="short-column-center">#</th>
              {configurations && configurations.map(obj =>
                  <th key={`modalNestedTableHeader${obj.modalKey}`} scope="col">
                    <div key={obj.title} style={{color: obj.required ? 'red' : 'auto'}}>{obj.title}</div>
                  </th>
              )}
              <th key="modalNestedTableOptionsHeader" scope="col" className="short-column-center"></th>
            </tr>
            </thead>
            <tbody>
            {tableData && tableData.map((row, index) =>
                <tr key={row.id}>
                  <td key={index + 1} className="short-column-center">{index + 1}</td>
                  {configurations.map((obj) =>
                      <td key={obj.modalKey}>
                        {obj.modalType === 'input' &&
                            <input className="form-control" type="text" name={obj.modalKey}
                                   value={row[obj.modalKey] || ''} onChange={(e) => onChange(index, e.target.name, e.target.value)}/>}
                        {obj.modalType === 'date' &&
                            <input className="form-control" type="date" name={obj.modalKey}
                                   value={(row[obj.modalKey] && new Date(row[obj.modalKey]).toISOString().split('T')[0]) || ''} onChange={(e) => onChange(index, e.target.name, e.target.value)}/>}
                        {obj.modalType === 'checkbox' &&
                            <input className="form-control" type="checkbox" name={obj.modalKey}
                                   value={row[obj.modalKey] || ''} onChange={(e) => onChange(index, e.target.name, e.target.value)}/>}
                        {obj.modalType === 'textarea' &&
                            <textarea className="form-control" name={obj.modalKey} rows="1"
                                      value={row[obj.modalKey] || ''} onChange={(e) => onChange(index, e.target.name, e.target.value)}/>}
                        {obj.modalType === 'select' &&
                            <div className="typeahead-container">
                              <DropdownWithSearchOption
                                  options={obj.list}
                                  multiple={obj.multiple || false}
                                  value={()=> getCustomDropdownValue(obj, row)}
                                  labelKey={obj.listLabelKey}
                                  onChange={(array) => onDropdownChange(array, obj, index)}/>
                            </div>
                        }
                      </td>
                  )}
                  <td key="modalNestedTableOptionsDelete">
                    <img src={trashImage} alt="Delete" className="m-1 cursor-pointer"
                         onClick={() => deleteRow(index)}/>
                  </td>
                </tr>
            )}
            </tbody>
          </table>
        </div>
      </div>
  );
}
export default NestedTableComponent;