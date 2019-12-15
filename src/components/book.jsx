import React, { Component } from 'react';
import { InputGroup, FormControl, Button, ButtonToolbar, Form } from 'react-bootstrap'
import SweetAlert from 'react-bootstrap-sweetalert'
import { toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import 'react-widgets/dist/css/react-widgets.css'
import { request, isSuccessfullResponse, getCurrentUser } from './util/APIUtils'
import {
    API_BOOK_URL,
    INPUT_GROUP_TEXT_STYLE,
    STRETCH_STYLE,
    SMALL_BUTTON_STYLE
} from './constant'

class Book extends Component {

    state = {
        book: {},
        navigationDtl: {},
        bookAlert: false,
        fieldsDisabled: true,
        addButtonDisabled: true,
        deleteButtonDisabled: true,
        saveButtonDisabled: true,
        undoButtonDisabled: true
    }

    async componentDidMount() {
        this.firstBook();
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

    handleBookChange = (event) => {
        const { name, value } = event.target;
        console.log("Target name", name);
        console.log(value);
        const book = { ...this.state.book };
        book[name] = name === 'bookName' ? value.toUpperCase() : value;
        let saveButtonDisabled = { ...this.state.saveButtonDisabled };
        if (book.bookName === undefined || book.bookName === null || book.bookName === '') {
            saveButtonDisabled = true;
        } else {
            saveButtonDisabled = false;
        }
        this.setState({ book, saveButtonDisabled, undoButtonDisabled: false });
    }

    /* handleComboboxChange = (value, name) => {
        let book = { ...this.state.book };
        book[name] = value.toUpperCase();
        let saveButtonDisabled = { ...this.state.saveButtonDisabled };
        if (book.bookName === undefined || book.bookName === null || book.bookName === '') {
            saveButtonDisabled = true;
        } else {
            saveButtonDisabled = false;
        }
        this.setState({ book, saveButtonDisabled });
    } */

    newBook = () => {
        const book = {};
        book.bookStocks = [];
        this.setState({ book, navigationDtl: { first: true, last: true }, undoButtonDisabled: false });
    }

    saveBook = async () => {
        const { bookName } = this.state.book;
        if (bookName === undefined || bookName === null || bookName === '') {
            toast.error("Book name is required field");
        } else {
            console.log("Post: Object sent: ", this.state.book);
            const options = {
                url: API_BOOK_URL,
                method: 'POST',
                data: this.state.book
            };
            try {
                const res = await request(options);
                if (isSuccessfullResponse(res)) {
                    console.log("Post: Object received: ", res.data);
                    const { book, navigationDtl } = res.data;
                    this.setState({ book, navigationDtl, saveButtonDisabled: true, undoButtonDisabled: true });
                }
            } catch (error) {
                throw error.response.data;
            }
        }
    }

    saveBookShowMessage = async (message) => {
        try {
            await this.saveBook();
            toast.success(message);
        } catch (error) {
            toast.error(JSON.stringify(error));
        }
    }

    deleteBook = async () => {
        if (this.state.book.bookId != null) {
            console.log("Delete: Book ID sent: ", this.state.book.bookId);
            const options = {
                url: API_BOOK_URL + this.state.book.bookId,
                method: 'DELETE'
            };
            try {
                const res = await request(options);
                if (isSuccessfullResponse(res)) {
                    console.log("Delete: Response: ", res);
                    const { book, navigationDtl } = res.data;
                    this.setState({ book, navigationDtl, saveButtonDisabled: true });
                }
            } catch (error) {
                console.log(error);

            }
        }
        this.setState({
            bookAlert: false
        });
    }

    navigateBook = async (operation) => {
        const options = {
            url: API_BOOK_URL + operation,
            method: 'GET'
        };
        try {
            const res = await request(options);
            if (isSuccessfullResponse(res)) {
                const { book, navigationDtl } = res.data;
                this.setState({ book, navigationDtl })
                console.log(this.state.book);
            }
        } catch (error) {
            console.log(error);
        }
    }

    saveAndNavigateBook = async (operation) => {
        const { saveButtonDisabled } = this.state;
        if (!saveButtonDisabled) {
            try {
                await this.saveBook();
            } catch (error) {
                console.log(error);
            }
            this.navigateBook(operation);
        } else {
            this.navigateBook(operation);
        }
    }

    firstBook = () => {
        this.saveAndNavigateBook('first');
    }

    previousBook = () => {
        this.saveAndNavigateBook('previous');
    }

    nextBook = () => {
        this.saveAndNavigateBook('next');
    }

    lastBook = () => {
        this.saveAndNavigateBook('last');
    }

    undoChanges = () => {
        const book = { ...this.state.book };
        console.log("Book ID: ", book.bookId);
        this.setState({ saveButtonDisabled: true });
        if (book.bookId != null) {
            const operation = book.bookId;
            this.saveAndNavigateBook(operation);
        } else {
            this.firstBook();
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
        const { book, navigationDtl } = this.state;

        return (
            <>
                <Form dir="rtl">
                    <InputGroup className="mb-3">
                        <InputGroup.Prepend>
                            <InputGroup.Text style={INPUT_GROUP_TEXT_STYLE}>Book ID</InputGroup.Text>
                        </InputGroup.Prepend>
                        <FormControl
                            name="bookId"
                            placeholder="Book ID"
                            aria-label="Book ID"
                            readOnly
                            value={book.bookId || ''}
                            onChange={this.handleBookChange}
                        />
                    </InputGroup>

                    <InputGroup className="mb-3">
                        <InputGroup.Prepend>
                            <InputGroup.Text style={INPUT_GROUP_TEXT_STYLE}>Book Name</InputGroup.Text>
                        </InputGroup.Prepend>
                        <FormControl
                            name="bookName"
                            placeholder="Book Name"
                            aria-label="Book Name"
                            value={book.bookName || ''}
                            required
                            disabled={this.state.fieldsDisabled}
                            onChange={this.handleBookChange}
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
                            value={book.remarks || ''}
                            disabled={this.state.fieldsDisabled}
                            onChange={this.handleBookChange}
                        />
                    </InputGroup>

                    <ButtonToolbar className="mb-2">
                        <Button
                            variant="primary"
                            disabled={navigationDtl.first}
                            onClick={this.firstBook}
                            className="mr-1" style={SMALL_BUTTON_STYLE}
                            active>First
                            </Button>

                        <Button
                            variant="primary"
                            disabled={navigationDtl.first}
                            onClick={this.previousBook}
                            className="mr-1" style={SMALL_BUTTON_STYLE}
                            active>Previous
                            </Button>

                        <Button
                            variant="primary"
                            disabled={navigationDtl.last}
                            onClick={this.nextBook}
                            className="mr-1" style={SMALL_BUTTON_STYLE}
                            active>Next
                            </Button>

                        <Button
                            variant="primary"
                            disabled={navigationDtl.last}
                            onClick={this.lastBook}
                            className="mr-1" style={SMALL_BUTTON_STYLE}
                            active>Last
                            </Button>

                    </ButtonToolbar>

                    <ButtonToolbar className="mb-2">
                        <Button
                            variant="primary"
                            disabled={this.state.addButtonDisabled}
                            onClick={this.newBook}
                            className="mr-1" style={SMALL_BUTTON_STYLE}
                            active>Add
                            </Button>

                        <Button
                            variant="primary"
                            disabled={this.state.deleteButtonDisabled}
                            onClick={() => this.setState({ bookAlert: true })}
                            className="mr-1" style={SMALL_BUTTON_STYLE}
                            active>Delete
                            </Button>

                        <SweetAlert
                            show={this.state.bookAlert}
                            warning
                            showCancel
                            confirmBtnText="Delete"
                            confirmBtnBsStyle="danger"
                            cancelBtnBsStyle="default"
                            title="Delete Confirmation"
                            Text="Are you sure you want to delete this book?"
                            onConfirm={() => this.deleteBook()}
                            onCancel={() => this.setState({ bookAlert: false })}
                        >
                            Delete Book
                                </SweetAlert>

                        <Button
                            variant="primary"
                            onClick={() => this.saveBookShowMessage("Book saved successfully.")}
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

export default Book;