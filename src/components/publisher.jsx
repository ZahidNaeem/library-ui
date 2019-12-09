import React, { Component } from 'react';
import { InputGroup, FormControl, Button, ButtonToolbar, Form } from 'react-bootstrap'
import SweetAlert from 'react-bootstrap-sweetalert'
import { toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import 'react-widgets/dist/css/react-widgets.css'
import { request, isSuccessfullResponse, getCurrentUser } from './util/APIUtils'
import { API_PUBLISHER_URL } from './constant'

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
        this.firstPublisher();
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
        console.log(value);
        const publisher = { ...this.state.publisher };
        publisher[name] = name === 'publisherName' ? value.toUpperCase() : value;
        let saveButtonDisabled = { ...this.state.saveButtonDisabled };
        if (publisher.publisherName === undefined || publisher.publisherName === null || publisher.publisherName === '') {
            saveButtonDisabled = true;
        } else {
            saveButtonDisabled = false;
        }
        this.setState({ publisher, saveButtonDisabled, undoButtonDisabled: false });
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

    newPublisher = () => {
        const publisher = {};
        publisher.publisherStocks = [];
        this.setState({ publisher, navigationDtl: { first: true, last: true }, undoButtonDisabled: false });
    }

    savePublisher = async () => {
        const { publisherName } = this.state.publisher;
        if (publisherName === undefined || publisherName === null || publisherName === '') {
            toast.error("Publisher name is required field");
        } else {
            console.log("Post: Object sent: ", this.state.publisher);
            const options = {
                url: API_PUBLISHER_URL + 'save',
                method: 'POST',
                data: this.state.publisher
            };
            try {
                const res = await request(options);
                if (isSuccessfullResponse(res)) {
                    console.log("Post: Object received: ", res.data);
                    const { publisher, navigationDtl } = res.data;
                    this.setState({ publisher, navigationDtl, saveButtonDisabled: true, undoButtonDisabled: true });
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
        if (this.state.publisher.publisherId != null) {
            console.log("Delete: Publisher ID sent: ", this.state.publisher.publisherId);
            const options = {
                url: API_PUBLISHER_URL + 'delete/' + this.state.publisher.publisherId,
                method: 'DELETE'
            };
            try {
                const res = await request(options);
                if (isSuccessfullResponse(res)) {
                    console.log("Delete: Response: ", res);
                    const { publisher, navigationDtl } = res.data;
                    this.setState({ publisher, navigationDtl, saveButtonDisabled: true });
                }
            } catch (error) {
                console.log(error);

            }
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

    firstPublisher = () => {
        this.saveAndNavigatePublisher('first');
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
            this.saveAndNavigatePublisher(operation);
        } else {
            this.firstPublisher();
        }
        this.setState({ undoButtonDisabled: true });
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
        const { publisher, navigationDtl } = this.state;

        const inputGroupTextStyle = {
            width: "180px"
        }

        const stretchStyle = {
            flex: "1"
        }

        const smallButtonStyle = {
            width: "10%"
        }

        return (
            <>
                <Form dir="rtl">
                    <InputGroup className="mb-3">
                        <InputGroup.Prepend>
                            <InputGroup.Text style={inputGroupTextStyle}>Publisher ID</InputGroup.Text>
                        </InputGroup.Prepend>
                        <FormControl
                            name="publisherId"
                            placeholder="Publisher ID"
                            aria-label="Publisher ID"
                            readOnly
                            value={publisher.publisherId || ''}
                            onChange={this.handlePublisherChange}
                        />
                    </InputGroup>

                    <InputGroup className="mb-3">
                        <InputGroup.Prepend>
                            <InputGroup.Text style={inputGroupTextStyle}>Publisher Name</InputGroup.Text>
                        </InputGroup.Prepend>
                        <FormControl
                            name="publisherName"
                            placeholder="Publisher Name"
                            aria-label="Publisher Name"
                            value={publisher.publisherName || ''}
                            required
                            disabled={this.state.fieldsDisabled}
                            onChange={this.handlePublisherChange}
                        />
                    </InputGroup>

                    <InputGroup className="mb-3">
                        <InputGroup.Prepend>
                            <InputGroup.Text style={inputGroupTextStyle}>Remarks</InputGroup.Text>
                        </InputGroup.Prepend>
                        <FormControl
                            as="textarea"
                            rows="3"
                            name="remarks"
                            placeholder="Remarks"
                            aria-label="Remarks"
                            value={publisher.remarks || ''}
                            disabled={this.state.fieldsDisabled}
                            onChange={this.handlePublisherChange}
                        />
                    </InputGroup>

                    <ButtonToolbar className="mb-2">
                        <Button
                            variant="primary"
                            disabled={navigationDtl.first}
                            onClick={this.firstPublisher}
                            className="mr-1" style={smallButtonStyle}
                            active>First
                            </Button>

                        <Button
                            variant="primary"
                            disabled={navigationDtl.first}
                            onClick={this.previousPublisher}
                            className="mr-1" style={smallButtonStyle}
                            active>Previous
                            </Button>

                        <Button
                            variant="primary"
                            disabled={navigationDtl.last}
                            onClick={this.nextPublisher}
                            className="mr-1" style={smallButtonStyle}
                            active>Next
                            </Button>

                        <Button
                            variant="primary"
                            disabled={navigationDtl.last}
                            onClick={this.lastPublisher}
                            className="mr-1" style={smallButtonStyle}
                            active>Last
                            </Button>

                    </ButtonToolbar>

                    <ButtonToolbar className="mb-2">
                        <Button
                            variant="primary"
                            disabled={this.state.addButtonDisabled}
                            onClick={this.newPublisher}
                            className="mr-1" style={smallButtonStyle}
                            active>Add
                            </Button>

                        <Button
                            variant="primary"
                            disabled={this.state.deleteButtonDisabled}
                            onClick={() => this.setState({ publisherAlert: true })}
                            className="mr-1" style={smallButtonStyle}
                            active>Delete
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
                            className="mr-1" style={smallButtonStyle}
                            disabled={this.state.saveButtonDisabled}
                            active>Save
                            </Button>

                        <Button
                            variant="primary"
                            onClick={this.undoChanges}
                            className="mr-1" style={smallButtonStyle}
                            disabled={this.state.undoButtonDisabled}
                            active>Undo
                            </Button>
                    </ButtonToolbar>

                </Form>
            </>
        );
    }
}

export default Publisher;