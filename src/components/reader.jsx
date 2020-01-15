import React, { Component } from 'react';
import { InputGroup, FormControl, Button, ButtonToolbar, Form } from 'react-bootstrap'
import SweetAlert from 'react-bootstrap-sweetalert'
import { toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import 'react-widgets/dist/css/react-widgets.css'
import { request, isSuccessfullResponse, getCurrentUser } from './util/APIUtils'
import {
    API_READER_URL,
    INPUT_GROUP_TEXT_STYLE,
    STRETCH_STYLE,
    SMALL_BUTTON_STYLE,
    BUTTON_FIRST,
    BUTTON_PREVIOUS,
    BUTTON_NEXT,
    BUTTON_LAST,
    BUTTON_ADD,
    BUTTON_DELETE,
    BUTTON_SAVE,
    BUTTON_UNDO
} from './constant'

class Reader extends Component {

    state = {
        reader: {},
        navigationDtl: {},
        readerAlert: false,
        fieldsDisabled: true,
        addButtonDisabled: true,
        deleteButtonDisabled: true,
        saveButtonDisabled: true,
        undoButtonDisabled: true
    }

    async componentDidMount() {
        await this.firstReader();
        const canAdd = await this.canAdd();
        const canEdit = await this.canEdit();
        const canDelete = await this.canDelete();
        this.setState({ addButtonDisabled: !canAdd, fieldsDisabled: !canEdit, deleteButtonDisabled: !canDelete });
    }

    getCurrentUser = async () => {
        try {
            const res = await getCurrentUser();
            if (isSuccessfullResponse(res)) {
                console.log("Current User: ", res.data);
                return res.data;
            }
        } catch (error) {
            console.log(error);
        }
    }

    handleReaderChange = (event) => {
        const { name, value } = event.target;
        console.log("Target name", name);
        console.log("Target value", value);
        const reader = { ...this.state.reader };
        reader[name] = name === 'readerName' ? value.toUpperCase() : value;
        this.setState({ reader });
        this.enableSaveUndoButton();
    }

    validateForm = () => {
        const { reader } = this.state;
        return !(reader.readerName === undefined || reader.readerName === null || reader.readerName === '');
    }

    enableSaveUndoButton = () => {
        const saveButtonDisabled = !this.validateForm();
        this.setState({ saveButtonDisabled, undoButtonDisabled: false });
    }

    disableAddButton = (boolean) => {
    this.setState({ addButtonDisabled: boolean });
}
    /* handleComboboxChange = (value, name) => {
        let reader = { ...this.state.reader };
        reader[name] = value.toUpperCase();
        let saveButtonDisabled = { ...this.state.saveButtonDisabled };
        if (reader.readerName === undefined || reader.readerName === null || reader.readerName === '') {
            saveButtonDisabled = true;
        } else {
            saveButtonDisabled = false;
        }
        this.setState({ reader, saveButtonDisabled });
    } */

    addReader = () => {
        const reader = {};
        this.setState({ reader, navigationDtl: { first: true, last: true }, undoButtonDisabled: false });
        this.disableAddButton(true);
    }

    saveReader = async () => {
        if (this.validateForm() === false) {
            toast.error("Reader name is required field");
        } else {
            console.log("Post: Object sent: ", this.state.reader);
            const options = {
                url: API_READER_URL,
                method: 'POST',
                data: this.state.reader
            };
            try {
                const res = await request(options);
                if (isSuccessfullResponse(res)) {
                    console.log("Post: Object received: ", res.data);
                    const { reader, navigationDtl } = res.data;
                    this.setState({ reader, navigationDtl, saveButtonDisabled: true, undoButtonDisabled: true });
                    this.disableAddButton(false);
                }
            } catch (error) {
                throw error.response.data;
            }
        }
    }

    saveReaderShowMessage = async (message) => {
        try {
            await this.saveReader();
            toast.success(message);
        } catch (error) {
            toast.error(JSON.stringify(error));
        }
    }

    deleteReader = async () => {
        const reader = {...this.state.reader};
        if (reader.readerId !== undefined && reader.readerId !== null) {
            console.log("Delete: Reader ID sent: ", reader.readerId);
            const options = {
                url: API_READER_URL + reader.readerId,
                method: 'DELETE'
            };
            try {
                const res = await request(options);
                if (isSuccessfullResponse(res)) {
                    console.log("Delete: Response: ", res);
                    const { reader, navigationDtl } = res.data;
                    this.setState({ reader, navigationDtl, saveButtonDisabled: true });
                    this.disableAddButton(false);
                }
            } catch (error) {
                console.log(error);

            }
        } else {
            this.undoChanges();
        }
        this.setState({
            readerAlert: false
        });
    }

    navigateReader = async (operation) => {
        const options = {
            url: API_READER_URL + operation,
            method: 'GET'
        };
        try {
            const res = await request(options);
            if (isSuccessfullResponse(res)) {
                const { reader, navigationDtl } = res.data;
                this.setState({ reader, navigationDtl })
                console.log(this.state.reader);
            }
        } catch (error) {
            console.log(error);
        }
    }

    saveAndNavigateReader = async (operation) => {
        const { saveButtonDisabled } = this.state;
        if (!saveButtonDisabled) {
            try {
                await this.saveReader();
            } catch (error) {
                console.log(error);
            }
            this.navigateReader(operation);
        } else {
            this.navigateReader(operation);
        }
    }

    firstReader = async () => {
        await this.saveAndNavigateReader('first');
    }

    previousReader = () => {
        this.saveAndNavigateReader('previous');
    }

    nextReader = () => {
        this.saveAndNavigateReader('next');
    }

    lastReader = () => {
        this.saveAndNavigateReader('last');
    }

    undoChanges = () => {
        const reader = { ...this.state.reader };
        console.log("Reader ID: ", reader.readerId);
        this.setState({ saveButtonDisabled: true });
        if (reader.readerId != null) {
            const operation = reader.readerId;
            this.navigateReader(operation);
        } else {
            this.firstReader();
        }
        this.setState({ undoButtonDisabled: true });
        this.disableAddButton(false);
    }

    userRoles = async () => {
        const currentUser = await this.getCurrentUser();
        return currentUser.roles;
    }

    canAdd = async () => {
        const roles = await this.userRoles();
        const filteredRoles = roles.filter(role => role === 'ROLE_PM');
        if (filteredRoles.length > 0) {
            return true;
        } else {
            return false;
        }
    }

    canEdit = async () => {
        const roles = await this.userRoles();
        const filteredRoles = roles.filter(role => role === 'ROLE_ADMIN');
        if (filteredRoles.length > 0) {
            return true;
        } else {
            return false;
        }
    }

    canDelete = async () => {
        const roles = await this.userRoles();
        const filteredRoles = roles.filter(role => role === 'ROLE_ADMIN');
        if (filteredRoles.length > 0) {
            return true;
        } else {
            return false;
        }
    }


    render() {
        const { reader, navigationDtl, fieldsDisabled, addButtonDisabled, deleteButtonDisabled, saveButtonDisabled, undoButtonDisabled } = this.state;

        return (
            <>
                <Form dir="rtl">
                    {/* <InputGroup className="mb-3">
                        <InputGroup.Prepend>
                            <InputGroup.Text style={INPUT_GROUP_TEXT_STYLE}>Reader ID</InputGroup.Text>
                        </InputGroup.Prepend>
                        <FormControl
                            name="readerId"
                            placeholder="Reader ID"
                            aria-label="Reader ID"
                            readOnly
                            value={reader.readerId || ''}
                            onChange={this.handleReaderChange}
                        />
                    </InputGroup> */}

                    <InputGroup className="mb-3">
                        <InputGroup.Prepend>
                            <InputGroup.Text style={INPUT_GROUP_TEXT_STYLE}>Reader Name</InputGroup.Text>
                        </InputGroup.Prepend>
                        <FormControl
                            name="readerName"
                            placeholder="Reader Name"
                            aria-label="Reader Name"
                            value={reader.readerName || ''}
                            required
                            disabled={fieldsDisabled}
                            onChange={this.handleReaderChange}
                        />
                    </InputGroup>

                    <InputGroup className="mb-3">
                        <InputGroup.Prepend>
                            <InputGroup.Text style={INPUT_GROUP_TEXT_STYLE}>Remarks</InputGroup.Text>
                        </InputGroup.Prepend>
                        <FormControl
                            as="textarea"
                            rows="3"
                            name="remarks"
                            placeholder="Remarks"
                            aria-label="Remarks"
                            value={reader.remarks || ''}
                            disabled={fieldsDisabled}
                            onChange={this.handleReaderChange}
                        />
                    </InputGroup>

                    <ButtonToolbar className="mb-2">
                        <Button
                            variant="primary"
                            disabled={navigationDtl.first}
                            onClick={this.firstReader}
                            className="ml-1" style={SMALL_BUTTON_STYLE}
                            active>{BUTTON_FIRST}
                        </Button>

                        <Button
                            variant="primary"
                            disabled={navigationDtl.first}
                            onClick={this.previousReader}
                            className="ml-1" style={SMALL_BUTTON_STYLE}
                            active>{BUTTON_PREVIOUS}
                        </Button>

                        <Button
                            variant="primary"
                            disabled={navigationDtl.last}
                            onClick={this.nextReader}
                            className="ml-1" style={SMALL_BUTTON_STYLE}
                            active>{BUTTON_NEXT}
                        </Button>

                        <Button
                            variant="primary"
                            disabled={navigationDtl.last}
                            onClick={this.lastReader}
                            className="ml-1" style={SMALL_BUTTON_STYLE}
                            active>{BUTTON_LAST}
                        </Button>

                    </ButtonToolbar>

                    <ButtonToolbar className="mb-2">
                        <Button
                            variant="primary"
                            disabled={addButtonDisabled}
                            onClick={this.addReader}
                            className="ml-1" style={SMALL_BUTTON_STYLE}
                            active>{BUTTON_ADD}
                        </Button>

                        <Button
                            variant="primary"
                            disabled={deleteButtonDisabled}
                            onClick={() => this.setState({ readerAlert: true })}
                            className="ml-1" style={SMALL_BUTTON_STYLE}
                            active>{BUTTON_DELETE}
                        </Button>

                        <SweetAlert
                            show={this.state.readerAlert}
                            warning
                            showCancel
                            confirmBtnText="Delete"
                            confirmBtnBsStyle="danger"
                            cancelBtnBsStyle="default"
                            title="Delete Confirmation"
                            Text="Are you sure you want to delete this reader?"
                            onConfirm={() => this.deleteReader()}
                            onCancel={() => this.setState({ readerAlert: false })}
                        >
                            Delete Reader
                                </SweetAlert>

                        <Button
                            variant="primary"
                            onClick={() => this.saveReaderShowMessage("Reader saved successfully.")}
                            className="ml-1" style={SMALL_BUTTON_STYLE}
                            disabled={saveButtonDisabled}
                            active>{BUTTON_SAVE}
                        </Button>

                        <Button
                            variant="primary"
                            onClick={this.undoChanges}
                            className="ml-1" style={SMALL_BUTTON_STYLE}
                            disabled={undoButtonDisabled}
                            active>{BUTTON_UNDO}
                        </Button>
                    </ButtonToolbar>

                </Form>
            </>
        );
    }
}

export default Reader;