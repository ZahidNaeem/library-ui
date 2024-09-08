import Modal from "react-bootstrap/Modal";
import {Button, Form} from "react-bootstrap";
import {useCallback, useEffect, useState} from "react";
import _ from "lodash";
import DropdownWithSearchOption from "./DropdownWithSearchOption";
import NestedTableComponent from "./NestedTableComponent";

const AddEditModal = ({
  title,
  currentObject,
  handelSave,
  handleClose,
  configurations,
}) => {
  const [updatedObject, setUpdatedObject] = useState(_.cloneDeep(currentObject));
  const [error, setError] = useState('');
  const [formHasValidChanges, setFormHasValidChanges] = useState(false);

  function onChange(e) {
    let {name, value} = e.target;
    const conf = configurations.find(conf => conf.modalKey === name);
    if (conf.uppercase) {
      value = value.toUpperCase();
    }
    const object = {...updatedObject};
    object[name] = value;
    setUpdatedObject(object);
  }

  function onDropdownChange(array, filterKey, column) {
    const object = {...updatedObject};
    if (array && array.length > 0) {
      const firstElementReturnValue = array[0][filterKey];
      if (firstElementReturnValue) {
        object[column] = firstElementReturnValue;
      }
    } else {
      object[column] = null;
    }
    setUpdatedObject(object);
  }

  function handleNestedTableChange(fieldName, nestedTable) {
    setUpdatedObject({...updatedObject, [fieldName]: nestedTable});
  }

  function save() {
    setError('');
    handelSave(updatedObject)
    .then(response => {
      if (response.success) {
        handleClose();
      } else {
        setError(response.message);
      }
    })
    .catch(e => setError(e.response));
  }

  const enableSaveButton = useCallback(() => {
    if (_.isEqual(updatedObject, currentObject)) {
      setFormHasValidChanges(true);
      return;
    }
    let invalidArray = configurations.filter(conf => conf.required && !updatedObject[conf.modalKey]);
    setFormHasValidChanges(invalidArray.length !== 0);
  }, [configurations, currentObject, updatedObject]);

  useEffect(() => {
    enableSaveButton();
  }, [enableSaveButton]);

  return (
      <Modal dialogClassName="custom-width-modal" show onHide={handleClose}>
        <Modal.Header closeButton>
          <Modal.Title>{title}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Label style={{color: "red", fontWeight: "bold", width: "100%"}} visuallyHidden={!error}>{error}</Form.Label>
            {configurations && configurations.map((conf, index) => (
                <div key={index}>
                  <Form.Group key={index} style={{display: "flex"}} className="mb-3">
                    <Form.Label className="label-default-size">{conf.title}</Form.Label>
                    {conf.modalType === 'input' &&
                        <Form.Control type="input" name={conf.modalKey} value={updatedObject[conf.modalKey] || ''} onChange={onChange}/>}
                    {conf.modalType === 'date' &&
                        <Form.Control type="date" name={conf.modalKey} value={(updatedObject[conf.modalKey] && new Date(updatedObject[conf.modalKey]).toISOString().split('T')[0]) || ''}
                                      onChange={onChange}/>}
                    {conf.modalType === 'textarea' &&
                        <Form.Control as="textarea" rows={3} name={conf.modalKey} value={updatedObject[conf.modalKey] || ''} onChange={onChange}/>}
                    {conf.modalType === 'select' &&
                        <DropdownWithSearchOption
                            options={conf.list}
                            multiple={conf.multiple || false}
                            onChange={(array) => onDropdownChange(array, conf.listReturnKey, conf.modalKey)}
                            value={conf.list.filter(element => element[conf.listReturnKey] === updatedObject[conf.modalKey])}
                            labelKey={conf.listLabelKey}/>
                    }
                    {conf.modalType === 'checkbox' &&
                        <Form.Check type="checkbox" name={conf.modalKey} value={updatedObject[conf.modalKey] || ''} onChange={onChange}/>}
                    {conf.modalType === 'autocomplete' &&
                        <>
                          <Form.Control type="input" list="options" name={conf.modalKey} value={updatedObject[conf.modalKey] || ''} onChange={onChange}/>
                          <datalist id="options">
                            {conf.list && conf.list.map(opt =>
                                (<option key={opt} value={opt}/>)
                            )}
                          </datalist>
                        </>}
                  </Form.Group>
                  {conf.nestedConfig &&
                      <NestedTableComponent
                          configurations={conf.nestedConfig}
                          nestedTableData={updatedObject[conf.nestedKey]}
                          onNestedTableChange={(nestedTable) => handleNestedTableChange(conf.nestedKey, nestedTable)}
                      />
                  }
                </div>
            ))}
            <Button style={{width: "100%"}} disabled={formHasValidChanges} onClick={save}>Save Record</Button>
          </Form>
        </Modal.Body>
      </Modal>
  );
}
export default AddEditModal;