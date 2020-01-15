import React, { Component } from 'react';
import { InputGroup, FormControl, Button, ButtonToolbar, Form } from 'react-bootstrap'
import SweetAlert from 'react-bootstrap-sweetalert'
import { toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import 'react-widgets/dist/css/react-widgets.css'
import { request, isSuccessfullResponse, getCurrentUser } from './util/APIUtils'
import {
    API_PUBLISHER_URL,
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

class Publisher extends Component {

    state = {
        publisher: {},
        navigationDtl: {},
        publisherAlert: false,
        fieldsDisabled: true,
        addButtonDisabled: true,
        deleteButtonDisabled: true,
        saveButtonDisabled: true,
        undoButtonDisabled: true
    }

    async componentDidMount() {
        await this.firstPublisher();
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

    handlePublisherChange = (event) => {
        const { name, value } = event.target;
        console.log("Target name", name);
        console.log("Target value", value);
        const publisher = { ...this.state.publisher };
        publisher[name] = name === 'publisherName' ? value.toUpperCase() : value;
        this.setState({ publisher });
        this.enableSaveUndoButton();
    }

    validateForm = () => {
        const { publisher } = this.state;
        return !(publisher.publisherName === undefined || publisher.publisherName === null || publisher.publisherName === '');
    }
    
    enableSaveUndoButton = () => {
        const saveButtonDisabled = !this.validateForm();
        this.setState({ saveButtonDisabled, undoButtonDisabled: false });
    }

    disableAddButton = (boolean) => {
    this.setState({ addButtonDisabled: boolean });
}

    /* handleComboboxChange = (value, name) => {
        let publisher = { ...this.state.publisher };
        publisher[name] = value.toUpperCase();
        let saveButtonDisabled = { ...this.state.saveButtonDisabled };
        if (publisher.publisherName === undefined || publisher.publisherName === null || publisher.publisherName === '') {
            saveButtonDisabled = true;
        } else {
            saveButtonDisabled = false;
        }
        this.setState({ publisher, saveButtonDisabled });
    } */

    addPublisher = () => {
        const publisher = {};
        this.setState({ publisher, navigationDtl: { first: true, last: true }, undoButtonDisabled: false });
        this.disableAddButton(true);
    }

    savePublisher = async () => {
        if (this.validateForm() === false) {
            toast.error("Publisher name is required field");
        } else {
            console.log("Post: Object sent: ", this.state.publisher);
            const options = {
                url: API_PUBLISHER_URL,
                method: 'POST',
                data: this.state.publisher
            };
            try {
                const res = await request(options);
                if (isSuccessfullResponse(res)) {
                    console.log("Post: Object received: ", res.data);
                    const { publisher, navigationDtl } = res.data;
                    this.setState({ publisher, navigationDtl, saveButtonDisabled: true, undoButtonDisabled: true });
                    this.disableAddButton(false);
                }
            } catch (error) {
                throw error.response.data;
            }
        }
    }

    savePublisherShowMessage = async (message) => {
        try {
            await this.savePublisher();
            toast.success(message);
        } catch (error) {
            toast.error(JSON.stringify(error));
        }
    }

    deletePublisher = async () => {
        const publisher = {...this.state.publisher};
        if (publisher.publisherId !== undefined && publisher.publisherId !== null) {
            console.log("Delete: Publisher ID sent: ", publisher.publisherId);
            const options = {
                url: API_PUBLISHER_URL + publisher.publisherId,
                method: 'DELETE'
            };
            try {
                const res = await request(options);
                if (isSuccessfullResponse(res)) {
                    console.log("Delete: Response: ", res);
                    const { publisher, navigationDtl } = res.data;
                    this.setState({ publisher, navigationDtl, saveButtonDisabled: true });
                    this.disableAddButton(false);
                }
            } catch (error) {
                console.log(error);

            }
        } else {
            this.undoChanges();
        }
        this.setState({
            publisherAlert: false
        });
    }

    navigatePublisher = async (operation) => {
        const options = {
            url: API_PUBLISHER_URL + operation,
            method: 'GET'
        };
        try {
            const res = await request(options);
            if (isSuccessfullResponse(res)) {
                const { publisher, navigationDtl } = res.data;
                this.setState({ publisher, navigationDtl })
                console.log(this.state.publisher);
            }
        } catch (error) {
            console.log(error);
        }
    }

    saveAndNavigatePublisher = async (operation) => {
        const { saveButtonDisabled } = this.state;
        if (!saveButtonDisabled) {
            try {
                await this.savePublisher();
            } catch (error) {
                console.log(error);
            }
            this.navigatePublisher(operation);
        } else {
            this.navigatePublisher(operation);
        }
    }

    firstPublisher = async () => {
        await this.saveAndNavigatePublisher('first');
    }

    previousPublisher = () => {
        this.saveAndNavigatePublisher('previous');
    }

    nextPublisher = () => {
        this.saveAndNavigatePublisher('next');
    }

    lastPublisher = () => {
        this.saveAndNavigatePublisher('last');
    }

    undoChanges = () => {
        const publisher = { ...this.state.publisher };
        console.log("Publisher ID: ", publisher.publisherId);
        this.setState({ saveButtonDisabled: true });
        if (publisher.publisherId != null) {
            const operation = publisher.publisherId;
            this.navigatePublisher(operation);
        } else {
            this.firstPublisher();
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
        const { publisher, navigationDtl, fieldsDisabled, addButtonDisabled, deleteButtonDisabled, saveButtonDisabled, undoButtonDisabled } = this.state;

        return (
            <>
                <Form dir="rtl">
                    {/* <InputGroup className="mb-3">
                        <InputGroup.Prepend>
                            <InputGroup.Text style={INPUT_GROUP_TEXT_STYLE}>Publisher ID</InputGroup.Text>
                        </InputGroup.Prepend>
                        <FormControl
                            name="publisherId"
                            placeholder="Publisher ID"
                            aria-label="Publisher ID"
                            readOnly
                            value={publisher.publisherId || ''}
                            onChange={this.handlePublisherChange}
                        />
                    </InputGroup> */}

                    <InputGroup className="mb-3">
                        <InputGroup.Prepend>
                            <InputGroup.Text style={INPUT_GROUP_TEXT_STYLE}>Publisher Name</InputGroup.Text>
                        </InputGroup.Prepend>
                        <FormControl
                            name="publisherName"
                            placeholder="Publisher Name"
                            aria-label="Publisher Name"
                            value={publisher.publisherName || ''}
                            required
                            disabled={fieldsDisabled}
                            onChange={this.handlePublisherChange}
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
                            value={publisher.remarks || ''}
                            disabled={fieldsDisabled}
                            onChange={this.handlePublisherChange}
                        />
                    </InputGroup>

                    <ButtonToolbar className="mb-2">
                        <Button
                            variant="primary"
                            disabled={navigationDtl.first}
                            onClick={this.firstPublisher}
                            className="ml-1" style={SMALL_BUTTON_STYLE}
                            active>{BUTTON_FIRST}
                            </Button>

                        <Button
                            variant="primary"
                            disabled={navigationDtl.first}
                            onClick={this.previousPublisher}
                            className="ml-1" style={SMALL_BUTTON_STYLE}
                            active>{BUTTON_PREVIOUS}
                            </Button>

                        <Button
                            variant="primary"
                            disabled={navigationDtl.last}
                            onClick={this.nextPublisher}
                            className="ml-1" style={SMALL_BUTTON_STYLE}
                            active>{BUTTON_NEXT}
                            </Button>

                        <Button
                            variant="primary"
                            disabled={navigationDtl.last}
                            onClick={this.lastPublisher}
                            className="ml-1" style={SMALL_BUTTON_STYLE}
                            active>{BUTTON_LAST}
                            </Button>

                    </ButtonToolbar>

                    <ButtonToolbar className="mb-2">
                        <Button
                            variant="primary"
                            disabled={addButtonDisabled}
                            onClick={this.addPublisher}
                            className="ml-1" style={SMALL_BUTTON_STYLE}
                            active>{BUTTON_ADD}
                            </Button>

                        <Button
                            variant="primary"
                            disabled={deleteButtonDisabled}
                            onClick={() => this.setState({ publisherAlert: true })}
                            className="ml-1" style={SMALL_BUTTON_STYLE}
                            active>{BUTTON_DELETE}
                            </Button>

                        <SweetAlert
                            show={this.state.publisherAlert}
                            warning
                            showCancel
                            confirmBtnText="Delete"
                            confirmBtnBsStyle="danger"
                            cancelBtnBsStyle="default"
                            title="Delete Confirmation"
                            Text="Are you sure you want to delete this publisher?"
                            onConfirm={() => this.deletePublisher()}
                            onCancel={() => this.setState({ publisherAlert: false })}
                        >
                            Delete Publisher
                                </SweetAlert>

                        <Button
                            variant="primary"
                            onClick={() => this.savePublisherShowMessage("Publisher saved successfully.")}
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

export default Publisher;