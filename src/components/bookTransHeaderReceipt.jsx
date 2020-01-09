import React, { Component } from 'react';
import { InputGroup, FormControl, Button, ButtonToolbar, Form } from 'react-bootstrap'
import SweetAlert from 'react-bootstrap-sweetalert'
import { toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import 'react-widgets/dist/css/react-widgets.css'
import { request, isSuccessfullResponse, getCurrentUser } from './util/APIUtils'
import {
    API_BOOK_TRANS_HEADER_URL,
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
import BookTransLine from './bookTransLine';

class BookTransHeaderReceipt extends Component {

    state = {
        bookTransHeader: {
            transType: 'RECEIPT'
        },
        navigationDtl: {},
        bookTransHeaderAlert: false,
        fieldsDisabled: true,
        addButtonDisabled: true,
        deleteButtonDisabled: true,
        saveButtonDisabled: true,
        undoButtonDisabled: true
    }

    async componentDidMount() {
        this.firstBookTransHeader();
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

    handleBookTransHeaderChange = (event) => {
        const { name, value } = event.target;
        console.log("Target name", name);
        console.log("Target value", value);
        const bookTransHeader = { ...this.state.bookTransHeader };
        bookTransHeader[name] = name === 'bookTransHeaderName' ? value.toUpperCase() : value;
        this.setState({ bookTransHeader });
        this.enableSaveUndoButton();
    }

    validateForm = () => {
        const { bookTransHeader } = this.state;
        let validateBook = !(bookTransHeader.bookTransHeaderName === undefined || bookTransHeader.bookTransHeaderName === null || bookTransHeader.bookTransHeaderName === '');
        if (validateBook === true) {
            if (bookTransHeader.bookTransLines !== null) {
                const invalidBookTransLines = bookTransHeader.bookTransLines.filter(bookTransLine => bookTransLine.bookTransLineName === undefined || bookTransLine.bookTransLineName === null || bookTransLine.bookTransLineName === '');
                validateBook = invalidBookTransLines.length < 1;
            }
        }
        return validateBook;
    }

    enableSaveUndoButton = () => {
        const saveButtonDisabled = !this.validateForm();
        this.setState({ saveButtonDisabled, undoButtonDisabled: false });
    }

    disableAddButton = (boolean) => {
        this.setState({ addButtonDisabled: boolean });
    }

    /* handleComboboxChange = (value, name) => {
        let bookTransHeader = { ...this.state.bookTransHeader };
        bookTransHeader[name] = value.toUpperCase();
        let saveButtonDisabled = { ...this.state.saveButtonDisabled };
        if (bookTransHeader.bookTransHeaderName === undefined || bookTransHeader.bookTransHeaderName === null || bookTransHeader.bookTransHeaderName === '') {
            saveButtonDisabled = true;
        } else {
            saveButtonDisabled = false;
        }
        this.setState({ bookTransHeader, saveButtonDisabled });
    } */

    addBookTransHeader = () => {
        const bookTransHeader = {};
        bookTransHeader.bookTransLines = [];
        this.setState({ bookTransHeader, navigationDtl: { first: true, last: true }, undoButtonDisabled: false });
        this.disableAddButton(true);
    }

    addBookTransLineIntoBookTransHeader = (bookTransLines) => {
        let bookTransHeader = { ...this.state.bookTransHeader };
        // bookTransLines.map(bookTransLine => {
        //     bookTransLine['bookTransHeader'] = bookTransHeader.headerId;
        // });
        bookTransHeader.bookTransLines = bookTransLines;
        this.setState({ bookTransHeader });
    }

    saveBookTransHeader = async () => {
        const { bookTransHeaderName } = this.state.bookTransHeader;
        if (bookTransHeaderName === undefined || bookTransHeaderName === null || bookTransHeaderName === '') {
            toast.error("BookTransHeader name is required field");
        } else {
            console.log("Post: Object sent: ", this.state.bookTransHeader);
            const options = {
                url: API_BOOK_TRANS_HEADER_URL,
                method: 'POST',
                data: this.state.bookTransHeader
            };
            try {
                const res = await request(options);
                if (isSuccessfullResponse(res)) {
                    console.log("Post: Object received: ", res.data);
                    const { bookTransHeader, navigationDtl } = res.data;
                    this.setState({ bookTransHeader, navigationDtl, saveButtonDisabled: true, undoButtonDisabled: true });
                    this.disableAddButton(false);
                }
            } catch (error) {
                throw error.response.data;
            }
        }
    }

    saveBookTransHeaderShowMessage = async (message) => {
        try {
            await this.saveBookTransHeader();
            toast.success(message);
        } catch (error) {
            toast.error(JSON.stringify(error));
        }
    }

    deleteBookTransHeader = async () => {
        const bookTransHeader = { ...this.state.bookTransHeader };
        if (bookTransHeader.headerId !== undefined && bookTransHeader.headerId !== null) {
            console.log("Delete: BookTransHeader ID sent: ", bookTransHeader.headerId);
            const options = {
                url: API_BOOK_TRANS_HEADER_URL + bookTransHeader.headerId,
                method: 'DELETE'
            };
            try {
                const res = await request(options);
                if (isSuccessfullResponse(res)) {
                    console.log("Delete: Response: ", res);
                    const { bookTransHeader, navigationDtl } = res.data;
                    this.setState({ bookTransHeader, navigationDtl, saveButtonDisabled: true });
                    this.disableAddButton(false);
                }
            } catch (error) {
                console.log(error);

            }
        } else {
            this.undoChanges();
        }
        this.setState({
            bookTransHeaderAlert: false
        });
    }

    navigateBookTransHeader = async (operation) => {
        const options = {
            url: API_BOOK_TRANS_HEADER_URL + operation,
            method: 'GET'
        };
        try {
            const res = await request(options);
            if (isSuccessfullResponse(res)) {
                const { bookTransHeader, navigationDtl } = res.data;
                this.setState({ bookTransHeader, navigationDtl })
                console.log(this.state.bookTransHeader);
            }
        } catch (error) {
            console.log(error);
        }
    }

    saveAndNavigateBookTransHeader = async (operation) => {
        const { saveButtonDisabled } = this.state;
        if (!saveButtonDisabled) {
            try {
                await this.saveBookTransHeader();
            } catch (error) {
                console.log(error);
            }
            this.navigateBookTransHeader(operation);
        } else {
            this.navigateBookTransHeader(operation);
        }
    }

    firstBookTransHeader = () => {
        this.saveAndNavigateBookTransHeader('first');
    }

    previousBookTransHeader = () => {
        this.saveAndNavigateBookTransHeader('previous');
    }

    nextBookTransHeader = () => {
        this.saveAndNavigateBookTransHeader('next');
    }

    lastBookTransHeader = () => {
        this.saveAndNavigateBookTransHeader('last');
    }

    undoChanges = () => {
        const bookTransHeader = { ...this.state.bookTransHeader };
        console.log("BookTransHeader ID: ", bookTransHeader.headerId);
        this.setState({ saveButtonDisabled: true });
        if (bookTransHeader.headerId != null) {
            const operation = bookTransHeader.headerId;
            this.navigateBookTransHeader(operation);
        } else {
            this.firstBookTransHeader();
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
        const { bookTransHeader, navigationDtl, fieldsDisabled, addButtonDisabled, deleteButtonDisabled, saveButtonDisabled, undoButtonDisabled } = this.state;

        return (
            <>
                <Form dir="rtl">
                    {/* <InputGroup className="mb-3">
                        <InputGroup.Prepend>
                            <InputGroup.Text style={INPUT_GROUP_TEXT_STYLE}>BookTransHeader ID</InputGroup.Text>
                        </InputGroup.Prepend>
                        <FormControl
                            name="headerId"
                            placeholder="BookTransHeader ID"
                            aria-label="BookTransHeader ID"
                            readOnly
                            value={bookTransHeader.headerId || ''}
                            onChange={this.handleBookTransHeaderChange}
                        />
                    </InputGroup> */}

                    <InputGroup className="mb-3">
                        <InputGroup.Prepend>
                            <InputGroup.Text style={INPUT_GROUP_TEXT_STYLE}>BookTransHeader Name</InputGroup.Text>
                        </InputGroup.Prepend>
                        <FormControl
                            name="bookTransHeaderName"
                            placeholder="BookTransHeader Name"
                            aria-label="BookTransHeader Name"
                            value={bookTransHeader.bookTransHeaderName || ''}
                            required
                            disabled={fieldsDisabled}
                            onChange={this.handleBookTransHeaderChange}
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
                            value={bookTransHeader.remarks || ''}
                            disabled={fieldsDisabled}
                            onChange={this.handleBookTransHeaderChange}
                        />
                    </InputGroup>

                    <ButtonToolbar className="mb-2">
                        <Button
                            variant="primary"
                            disabled={navigationDtl.first}
                            onClick={this.firstBookTransHeader}
                            className="ml-1" style={SMALL_BUTTON_STYLE}
                            active>{BUTTON_FIRST}
                        </Button>

                        <Button
                            variant="primary"
                            disabled={navigationDtl.first}
                            onClick={this.previousBookTransHeader}
                            className="ml-1" style={SMALL_BUTTON_STYLE}
                            active>{BUTTON_PREVIOUS}
                        </Button>

                        <Button
                            variant="primary"
                            disabled={navigationDtl.last}
                            onClick={this.nextBookTransHeader}
                            className="ml-1" style={SMALL_BUTTON_STYLE}
                            active>{BUTTON_NEXT}
                        </Button>

                        <Button
                            variant="primary"
                            disabled={navigationDtl.last}
                            onClick={this.lastBookTransHeader}
                            className="ml-1" style={SMALL_BUTTON_STYLE}
                            active>{BUTTON_LAST}
                        </Button>

                    </ButtonToolbar>

                    <ButtonToolbar className="mb-2">
                        <Button
                            variant="primary"
                            disabled={addButtonDisabled}
                            onClick={this.addBookTransHeader}
                            className="ml-1" style={SMALL_BUTTON_STYLE}
                            active>{BUTTON_ADD}
                        </Button>

                        <Button
                            variant="primary"
                            disabled={deleteButtonDisabled}
                            onClick={() => this.setState({ bookTransHeaderAlert: true })}
                            className="ml-1" style={SMALL_BUTTON_STYLE}
                            active>{BUTTON_DELETE}
                        </Button>

                        <SweetAlert
                            show={this.state.bookTransHeaderAlert}
                            warning
                            showCancel
                            confirmBtnText="Delete"
                            confirmBtnBsStyle="danger"
                            cancelBtnBsStyle="default"
                            title="Delete Confirmation"
                            Text="Are you sure you want to delete this bookTransHeader?"
                            onConfirm={() => this.deleteBookTransHeader()}
                            onCancel={() => this.setState({ bookTransHeaderAlert: false })}
                        >
                            Delete BookTransHeader
                                </SweetAlert>

                        <Button
                            variant="primary"
                            onClick={() => this.saveBookTransHeaderShowMessage("BookTransHeader saved successfully.")}
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
                    <BookTransLine
                        bookTransHeader={bookTransHeader}
                        addBookTransLineIntoBookTransHeader={this.addBookTransLineIntoBookTransHeader}
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

export default BookTransHeaderReceipt;