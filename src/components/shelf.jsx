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
import Rack from './rack';

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
        await this.firstShelf();
        const canAdd = await this.canAdd();
        const canEdit = await this.canEdit();
        const canDelete = await this.canDelete();
        this.setState({ addButtonDisabled: !canAdd, fieldsDisabled: !canEdit, deleteButtonDisabled: !canDelete });
    }

    getCurrentUser = async () => {
        try {
            const res = await getCurrentUser();
            if (isSuccessfullResponse(res)) {
                console.log("Current User: ", res.data.entity);
                return res.data.entity;
            }
        } catch (error) {
            console.log(error);
        }
    }

    handleShelfChange = (event) => {
        const { name, value } = event.target;
        console.log("Target name", name);
        console.log("Target value", value);
        const shelf = { ...this.state.shelf };
        shelf[name] = name === 'shelfName' ? value.toUpperCase() : value;
        this.setState({ shelf });
        this.enableSaveUndoButton();
    }

    validateForm = () => {
        const { shelf } = this.state;
        let validateBook = !(shelf.shelfName === undefined || shelf.shelfName === null || shelf.shelfName === '');
        if (validateBook === true) {
            if (shelf.racks !== undefined && shelf.racks !== null) {
                const invalidRacks = shelf.racks.filter(rack => rack.rackName === undefined || rack.rackName === null || rack.rackName === '');
                validateBook = invalidRacks.length < 1;
            }
        }
        return validateBook;
    }

    enableSaveUndoButton = () => {
        const saveButtonDisabled = !this.validateForm();
        this.setState({ saveButtonDisabled, undoButtonDisabled: false });
    }

    // disableAddButton = (boolean) => {
    //     this.setState({ addButtonDisabled: boolean });
    // }

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

    addShelf = () => {
        const shelf = {};
        // shelf.racks = [];
        this.setState({ shelf, navigationDtl: { first: true, last: true }, undoButtonDisabled: false });
        // this.disableAddButton(true);
    }

    addRackIntoShelf = (racks) => {
        let shelf = { ...this.state.shelf };
        // racks.map(rack => {
        //     rack['shelf'] = shelf.shelfId;
        // });
        shelf.racks = racks;
        this.setState({ shelf });
    }

    saveShelf = async () => {
        let saveResponse = {};
        if (this.validateForm() === false) {
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
                    console.log("Post: Object received: ", res.data.entity);
                    const { shelf, navigationDtl } = res.data.entity;
                    this.setState({ shelf, navigationDtl, saveButtonDisabled: true, undoButtonDisabled: true });
                    this.disableAddButton(false);
                    saveResponse = res.data;
                }
            } catch (error) {
                // throw error.response.data;
                saveResponse = error.response.data;
            }
        }
        return saveResponse;
    }

    saveShelfShowMessage = async () => {
        try {
            const saveResponse = await this.saveShelf();
            if(saveResponse.success === undefined || saveResponse.success === null){
                toast.error(saveResponse);
            } else {
                toast.success(saveResponse.message);
            }
        } catch (error) {
            toast.error(JSON.stringify(error));
        }
    }

    deleteShelf = async () => {
        const shelf = { ...this.state.shelf };
        if (shelf.shelfId !== undefined && shelf.shelfId !== null) {
            console.log("Delete: Shelf ID sent: ", shelf.shelfId);
            const options = {
                url: API_SHELF_URL + shelf.shelfId,
                method: 'DELETE'
            };
            try {
                const res = await request(options);
                if (isSuccessfullResponse(res)) {
                    console.log("Delete: Response: ", res);
                    const { shelf, navigationDtl } = res.data.entity;
                    this.setState({ shelf, navigationDtl, saveButtonDisabled: true });
                    // this.disableAddButton(false);
                }
            } catch (error) {
                console.log(error);

            }
        } else {
            this.undoChanges();
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
                const { shelf, navigationDtl } = res.data.entity;
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

    firstShelf = async () => {
        await this.saveAndNavigateShelf('first');
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
            this.navigateShelf(operation);
        } else {
            this.firstShelf();
        }
        this.setState({ undoButtonDisabled: true });
        // this.disableAddButton(false);
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
        const { shelf, navigationDtl, fieldsDisabled, addButtonDisabled, deleteButtonDisabled, saveButtonDisabled, undoButtonDisabled } = this.state;

        return (
            <>
                <Form dir="rtl">
                    {/* <InputGroup className="mb-3">
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
                    </InputGroup> */}

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
                            disabled={fieldsDisabled}
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
                            disabled={fieldsDisabled}
                            onChange={this.handleShelfChange}
                        />
                    </InputGroup>

                    <ButtonToolbar className="mb-2">
                        <Button
                            variant="primary"
                            disabled={navigationDtl.first}
                            onClick={this.firstShelf}
                            className="ml-1" style={SMALL_BUTTON_STYLE}
                            active>{BUTTON_FIRST}
                        </Button>

                        <Button
                            variant="primary"
                            disabled={navigationDtl.first}
                            onClick={this.previousShelf}
                            className="ml-1" style={SMALL_BUTTON_STYLE}
                            active>{BUTTON_PREVIOUS}
                        </Button>

                        <Button
                            variant="primary"
                            disabled={navigationDtl.last}
                            onClick={this.nextShelf}
                            className="ml-1" style={SMALL_BUTTON_STYLE}
                            active>{BUTTON_NEXT}
                        </Button>

                        <Button
                            variant="primary"
                            disabled={navigationDtl.last}
                            onClick={this.lastShelf}
                            className="ml-1" style={SMALL_BUTTON_STYLE}
                            active>{BUTTON_LAST}
                        </Button>

                    </ButtonToolbar>

                    <ButtonToolbar className="mb-2">
                        <Button
                            variant="primary"
                            disabled={addButtonDisabled}
                            onClick={this.addShelf}
                            className="ml-1" style={SMALL_BUTTON_STYLE}
                            active>{BUTTON_ADD}
                        </Button>

                        <Button
                            variant="primary"
                            disabled={deleteButtonDisabled}
                            onClick={() => this.setState({ shelfAlert: true })}
                            className="ml-1" style={SMALL_BUTTON_STYLE}
                            active>{BUTTON_DELETE}
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
                            onClick={this.saveShelfShowMessage}
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
                    <Rack
                        shelf={shelf}
                        addRackIntoShelf={this.addRackIntoShelf}
                        enableSaveUndoButton={this.enableSaveUndoButton}
                        fieldsDisabled={fieldsDisabled}
                        addButtondisabled={addButtonDisabled}
                        deleteButtondisabled={deleteButtonDisabled}
                    />
                </Form>
            </>
        );
    }
}

export default Shelf;