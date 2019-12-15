import React, { Component } from 'react';
import { InputGroup, FormControl, Button, ButtonToolbar, Form } from 'react-bootstrap'
import SweetAlert from 'react-bootstrap-sweetalert'
import { toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import 'react-widgets/dist/css/react-widgets.css'
import { request, isSuccessfullResponse, getCurrentUser } from './util/APIUtils'
import {
    API_SHELF_URL,
    INPUT_GROUP_TEXT_STYLE,
    STRETCH_STYLE,
    SMALL_BUTTON_STYLE
} from './constant'

class Shelf extends Component {

    state = {
        shelf: {},
        navigationDtl: {},
        shelfAlert: false,
        fieldsDisabled: true,
        addButtonDisabled: true,
        deleteButtonDisabled: true,
        saveButtonDisabled: true,
        undoButtonDisabled: true
    }

    async componentDidMount() {
        this.firstShelf();
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

    handleShelfChange = (event) => {
        const { name, value } = event.target;
        console.log("Target name", name);
        console.log(value);
        const shelf = { ...this.state.shelf };
        shelf[name] = name === 'shelfName' ? value.toUpperCase() : value;
        let saveButtonDisabled = { ...this.state.saveButtonDisabled };
        if (shelf.shelfName === undefined || shelf.shelfName === null || shelf.shelfName === '') {
            saveButtonDisabled = true;
        } else {
            saveButtonDisabled = false;
        }
        this.setState({ shelf, saveButtonDisabled, undoButtonDisabled: false });
    }

    /* handleComboboxChange = (value, name) => {
        let shelf = { ...this.state.shelf };
        shelf[name] = value.toUpperCase();
        let saveButtonDisabled = { ...this.state.saveButtonDisabled };
        if (shelf.shelfName === undefined || shelf.shelfName === null || shelf.shelfName === '') {
            saveButtonDisabled = true;
        } else {
            saveButtonDisabled = false;
        }
        this.setState({ shelf, saveButtonDisabled });
    } */

    newShelf = () => {
        const shelf = {};
        shelf.shelfStocks = [];
        this.setState({ shelf, navigationDtl: { first: true, last: true }, undoButtonDisabled: false });
    }

    saveShelf = async () => {
        const { shelfName } = this.state.shelf;
        if (shelfName === undefined || shelfName === null || shelfName === '') {
            toast.error("Shelf name is required field");
        } else {
            console.log("Post: Object sent: ", this.state.shelf);
            const options = {
                url: API_SHELF_URL,
                method: 'POST',
                data: this.state.shelf
            };
            try {
                const res = await request(options);
                if (isSuccessfullResponse(res)) {
                    console.log("Post: Object received: ", res.data);
                    const { shelf, navigationDtl } = res.data;
                    this.setState({ shelf, navigationDtl, saveButtonDisabled: true, undoButtonDisabled: true });
                }
            } catch (error) {
                throw error.response.data;
            }
        }
    }

    saveShelfShowMessage = async (message) => {
        try {
            await this.saveShelf();
            toast.success(message);
        } catch (error) {
            toast.error(JSON.stringify(error));
        }
    }

    deleteShelf = async () => {
        if (this.state.shelf.shelfId != null) {
            console.log("Delete: Shelf ID sent: ", this.state.shelf.shelfId);
            const options = {
                url: API_SHELF_URL + this.state.shelf.shelfId,
                method: 'DELETE'
            };
            try {
                const res = await request(options);
                if (isSuccessfullResponse(res)) {
                    console.log("Delete: Response: ", res);
                    const { shelf, navigationDtl } = res.data;
                    this.setState({ shelf, navigationDtl, saveButtonDisabled: true });
                }
            } catch (error) {
                console.log(error);

            }
        }
        this.setState({
            shelfAlert: false
        });
    }

    navigateShelf = async (operation) => {
        const options = {
            url: API_SHELF_URL + operation,
            method: 'GET'
        };
        try {
            const res = await request(options);
            if (isSuccessfullResponse(res)) {
                const { shelf, navigationDtl } = res.data;
                this.setState({ shelf, navigationDtl })
                console.log(this.state.shelf);
            }
        } catch (error) {
            console.log(error);
        }
    }

    saveAndNavigateShelf = async (operation) => {
        const { saveButtonDisabled } = this.state;
        if (!saveButtonDisabled) {
            try {
                await this.saveShelf();
            } catch (error) {
                console.log(error);
            }
            this.navigateShelf(operation);
        } else {
            this.navigateShelf(operation);
        }
    }

    firstShelf = () => {
        this.saveAndNavigateShelf('first');
    }

    previousShelf = () => {
        this.saveAndNavigateShelf('previous');
    }

    nextShelf = () => {
        this.saveAndNavigateShelf('next');
    }

    lastShelf = () => {
        this.saveAndNavigateShelf('last');
    }

    undoChanges = () => {
        const shelf = { ...this.state.shelf };
        console.log("Shelf ID: ", shelf.shelfId);
        this.setState({ saveButtonDisabled: true });
        if (shelf.shelfId != null) {
            const operation = shelf.shelfId;
            this.saveAndNavigateShelf(operation);
        } else {
            this.firstShelf();
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
        const { shelf, navigationDtl } = this.state;

        return (
            <>
                <Form dir="rtl">
                    <InputGroup className="mb-3">
                        <InputGroup.Prepend>
                            <InputGroup.Text style={INPUT_GROUP_TEXT_STYLE}>Shelf ID</InputGroup.Text>
                        </InputGroup.Prepend>
                        <FormControl
                            name="shelfId"
                            placeholder="Shelf ID"
                            aria-label="Shelf ID"
                            readOnly
                            value={shelf.shelfId || ''}
                            onChange={this.handleShelfChange}
                        />
                    </InputGroup>

                    <InputGroup className="mb-3">
                        <InputGroup.Prepend>
                            <InputGroup.Text style={INPUT_GROUP_TEXT_STYLE}>Shelf Name</InputGroup.Text>
                        </InputGroup.Prepend>
                        <FormControl
                            name="shelfName"
                            placeholder="Shelf Name"
                            aria-label="Shelf Name"
                            value={shelf.shelfName || ''}
                            required
                            disabled={this.state.fieldsDisabled}
                            onChange={this.handleShelfChange}
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
                            value={shelf.remarks || ''}
                            disabled={this.state.fieldsDisabled}
                            onChange={this.handleShelfChange}
                        />
                    </InputGroup>

                    <ButtonToolbar className="mb-2">
                        <Button
                            variant="primary"
                            disabled={navigationDtl.first}
                            onClick={this.firstShelf}
                            className="mr-1" style={SMALL_BUTTON_STYLE}
                            active>First
                            </Button>

                        <Button
                            variant="primary"
                            disabled={navigationDtl.first}
                            onClick={this.previousShelf}
                            className="mr-1" style={SMALL_BUTTON_STYLE}
                            active>Previous
                            </Button>

                        <Button
                            variant="primary"
                            disabled={navigationDtl.last}
                            onClick={this.nextShelf}
                            className="mr-1" style={SMALL_BUTTON_STYLE}
                            active>Next
                            </Button>

                        <Button
                            variant="primary"
                            disabled={navigationDtl.last}
                            onClick={this.lastShelf}
                            className="mr-1" style={SMALL_BUTTON_STYLE}
                            active>Last
                            </Button>

                    </ButtonToolbar>

                    <ButtonToolbar className="mb-2">
                        <Button
                            variant="primary"
                            disabled={this.state.addButtonDisabled}
                            onClick={this.newShelf}
                            className="mr-1" style={SMALL_BUTTON_STYLE}
                            active>Add
                            </Button>

                        <Button
                            variant="primary"
                            disabled={this.state.deleteButtonDisabled}
                            onClick={() => this.setState({ shelfAlert: true })}
                            className="mr-1" style={SMALL_BUTTON_STYLE}
                            active>Delete
                            </Button>

                        <SweetAlert
                            show={this.state.shelfAlert}
                            warning
                            showCancel
                            confirmBtnText="Delete"
                            confirmBtnBsStyle="danger"
                            cancelBtnBsStyle="default"
                            title="Delete Confirmation"
                            Text="Are you sure you want to delete this shelf?"
                            onConfirm={() => this.deleteShelf()}
                            onCancel={() => this.setState({ shelfAlert: false })}
                        >
                            Delete Shelf
                                </SweetAlert>

                        <Button
                            variant="primary"
                            onClick={() => this.saveShelfShowMessage("Shelf saved successfully.")}
                            className="mr-1" style={SMALL_BUTTON_STYLE}
                            disabled={this.state.saveButtonDisabled}
                            active>Save
                            </Button>

                        <Button
                            variant="primary"
                            onClick={this.undoChanges}
                            className="mr-1" style={SMALL_BUTTON_STYLE}
                            disabled={this.state.undoButtonDisabled}
                            active>Undo
                            </Button>
                    </ButtonToolbar>

                </Form>
            </>
        );
    }
}

export default Shelf;