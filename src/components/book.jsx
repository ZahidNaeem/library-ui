import React, { Component } from 'react';
import { InputGroup, FormControl, Button, ButtonToolbar, Form } from 'react-bootstrap'
import SweetAlert from 'react-bootstrap-sweetalert'
import { toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import 'react-widgets/dist/css/react-widgets.css'
import MySelect from './common/select'
import ToggleGroup from './common/toggleGroup'
import { request, isSuccessfullResponse, getCurrentUser } from './util/APIUtils'
import {
    API_BOOK_URL,
    API_AUTHOR_URL,
    API_SUBJECT_URL,
    API_PUBLISHER_URL,
    API_RESEARCHER_URL,
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
import Volume from './volume';

const bookConditions = [
    { value: 'New', label: 'New' },
    { value: 'Old', label: 'Old' }
]

class Book extends Component {

    state = {
        book: {},
        navigationDtl: {},
        authors: [],
        subjects: [],
        publishers: [],
        researchers: [],
        bookAlert: false,
        fieldsDisabled: true,
        addButtonDisabled: true,
        deleteButtonDisabled: true,
        saveButtonDisabled: true,
        undoButtonDisabled: true
    }

    async componentDidMount() {
        await this.populateAuthors();
        await this.populateSubjects();
        await this.populatePublishers();
        await this.populateResearchers();
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
        console.log("Target value", value);
        const book = { ...this.state.book };
        book[name] = name === 'bookName' ? value.toUpperCase() : name === 'purchased' ? parseInt(value) : value;
        this.setState({ book });
        this.enableSaveUndoButton();
    }

    handleSelectChange = (name, value) => {
        console.log("handleSelectChange name", name);
        console.log("handleSelectChange value", value);
        const { book } = this.state;
        book[name] = value;
        this.setState({ book });
        this.enableSaveUndoButton();
    }

    validateForm = () => {
        const { book } = this.state;
        let validateBook = !(book.bookName === undefined || book.bookName === null || book.bookName === '');
        if (validateBook === true) {
            const invalidVolumes = book.volumes.filter(volume => volume.volumeName === undefined || volume.volumeName === null || volume.volumeName === '');
            validateBook = invalidVolumes.length < 1;
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

    addBook = () => {
        const book = {};
        book.volumes = [];
        this.setState({ book, navigationDtl: { first: true, last: true }, undoButtonDisabled: false });
        this.disableAddButton(true);
    }

    addVolumeIntoBook = (volumes) => {
        let book = { ...this.state.book };
        // volumes.map(volume => {
        //     volume['book'] = book.bookId;
        // });
        book.volumes = volumes;
        this.setState({ book });
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
                    this.disableAddButton(false);
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
        const book = {...this.state.book};
        if (book.bookId !== undefined && book.bookId !== null) {
            console.log("Delete: Book ID sent: ", book.bookId);
            const options = {
                url: API_BOOK_URL + book.bookId,
                method: 'DELETE'
            };
            try {
                const res = await request(options);
                if (isSuccessfullResponse(res)) {
                    console.log("Delete: Response: ", res);
                    const { book, navigationDtl } = res.data;
                    this.setState({ book, navigationDtl, saveButtonDisabled: true });
                    this.disableAddButton(false);
                }
            } catch (error) {
                console.log(error);

            }
        } else {
            this.undoChanges();
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
            this.navigateBook(operation);
        } else {
            this.firstBook();
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

    async populateAuthors() {
        console.log("Start populate authors");
        const authors = [];
        const options = {
            url: API_AUTHOR_URL,
            method: 'GET'
        };
        try {
            const res = await request(options);
            if (isSuccessfullResponse(res)) {
                console.log("Stop populate authors");
                res.data.forEach(element => {
                    authors.push({
                        value: element.authorId,
                        label: element.authorName
                    });
                });
            }
            console.log("Authors:", authors);
        } catch (error) {
            console.log(error);
        }
        this.setState({ authors });
    }

    async populateSubjects() {
        console.log("Start populate subjects");
        const subjects = [];
        const options = {
            url: API_SUBJECT_URL,
            method: 'GET'
        };
        try {
            const res = await request(options);
            if (isSuccessfullResponse(res)) {
                console.log("Stop populate subjects");
                res.data.forEach(element => {
                    subjects.push({
                        value: element.subjectId,
                        label: element.subjectName
                    });
                });
            }
            console.log("Subjects:", subjects);
        } catch (error) {
            console.log(error);
        }
        this.setState({ subjects });
    }

    async populatePublishers() {
        console.log("Start populate publishers");
        const publishers = [];
        const options = {
            url: API_PUBLISHER_URL,
            method: 'GET'
        };
        try {
            const res = await request(options);
            if (isSuccessfullResponse(res)) {
                console.log("Stop populate publishers");
                res.data.forEach(element => {
                    publishers.push({
                        value: element.publisherId,
                        label: element.publisherName
                    });
                });
            }
            console.log("Publishers:", publishers);
        } catch (error) {
            console.log(error);
        }
        this.setState({ publishers });
    }

    async populateResearchers() {
        console.log("Start populate researchers");
        const researchers = [];
        const options = {
            url: API_RESEARCHER_URL,
            method: 'GET'
        };
        try {
            const res = await request(options);
            if (isSuccessfullResponse(res)) {
                console.log("Stop populate researchers");
                res.data.forEach(element => {
                    researchers.push({
                        value: element.researcherId,
                        label: element.researcherName
                    });
                });
            }
            console.log("Researchers:", researchers);
        } catch (error) {
            console.log(error);
        }
        this.setState({ researchers });
    }

    render() {
        const { book, navigationDtl, authors, subjects, publishers, researchers, fieldsDisabled, addButtonDisabled, deleteButtonDisabled, saveButtonDisabled, undoButtonDisabled } = this.state;

        const items = [
            { value: parseInt("1"), label: "Purchased", disabled: fieldsDisabled },
            { value: parseInt("0"), label: "Gifted", disabled: fieldsDisabled },
            { value: parseInt("2"), label: "Other", disabled: fieldsDisabled }
        ]

        return (
            <>
                <Form dir="rtl">
                    {/* <InputGroup className="mb-3">
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
                    </InputGroup> */}

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
                            disabled={fieldsDisabled}
                            onChange={this.handleBookChange}
                        />
                    </InputGroup>

                    <InputGroup className="mb-3">
                        <InputGroup.Prepend>
                            <InputGroup.Text style={INPUT_GROUP_TEXT_STYLE}>Publication Date</InputGroup.Text>
                        </InputGroup.Prepend>
                        <FormControl
                            type="date"
                            name="publicationDate"
                            placeholder="Publication Date"
                            aria-label="Publication Date"
                            disabled={fieldsDisabled}
                            onSelect={this.handleBookChange}
                            onChange={this.handleBookChange}
                            value={book.publicationDate != null ? book.publicationDate.split("T")[0] : ''}
                        />
                    </InputGroup>

                    <InputGroup className="mb-3">
                        <InputGroup.Prepend>
                            <InputGroup.Text style={INPUT_GROUP_TEXT_STYLE}>Author</InputGroup.Text>
                        </InputGroup.Prepend>
                        <div style={STRETCH_STYLE}>
                            <MySelect
                                name="author"
                                placeholder="Select Author"
                                value={book.author}
                                onChange={this.handleSelectChange}
                                disabled={fieldsDisabled}
                                options={authors}
                            />
                        </div>
                    </InputGroup>

                    <InputGroup className="mb-3">
                        <InputGroup.Prepend>
                            <InputGroup.Text style={INPUT_GROUP_TEXT_STYLE}>Subject</InputGroup.Text>
                        </InputGroup.Prepend>
                        <div style={STRETCH_STYLE}>
                            <MySelect
                                name="subject"
                                placeholder="Select Subject"
                                value={book.subject}
                                onChange={this.handleSelectChange}
                                disabled={fieldsDisabled}
                                options={subjects}
                            />
                        </div>
                    </InputGroup>

                    <InputGroup className="mb-3">
                        <InputGroup.Prepend>
                            <InputGroup.Text style={INPUT_GROUP_TEXT_STYLE}>Publisher</InputGroup.Text>
                        </InputGroup.Prepend>
                        <div style={STRETCH_STYLE}>
                            <MySelect
                                name="publisher"
                                placeholder="Select Publisher"
                                value={book.publisher}
                                onChange={this.handleSelectChange}
                                disabled={fieldsDisabled}
                                options={publishers}
                            />
                        </div>
                    </InputGroup>

                    <InputGroup className="mb-3">
                        <InputGroup.Prepend>
                            <InputGroup.Text style={INPUT_GROUP_TEXT_STYLE}>Researcher</InputGroup.Text>
                        </InputGroup.Prepend>
                        <div style={STRETCH_STYLE}>
                            <MySelect
                                name="researcher"
                                placeholder="Select Researcher"
                                value={book.researcher}
                                onChange={this.handleSelectChange}
                                disabled={fieldsDisabled}
                                options={researchers}
                            />
                        </div>
                    </InputGroup>

                    <InputGroup className="mb-3">
                        <InputGroup.Prepend>
                            <InputGroup.Text style={INPUT_GROUP_TEXT_STYLE}>Book Condition</InputGroup.Text>
                        </InputGroup.Prepend>
                        <div style={STRETCH_STYLE}>
                            <MySelect
                                name="bookCondition"
                                placeholder="Book Condition"
                                value={book.bookCondition}
                                onChange={this.handleSelectChange}
                                disabled={fieldsDisabled}
                                options={bookConditions}
                            />
                        </div>
                    </InputGroup>

                    <InputGroup className="mb-3">
                        <InputGroup.Prepend>
                            <InputGroup.Text style={INPUT_GROUP_TEXT_STYLE}>Purchased?</InputGroup.Text>
                        </InputGroup.Prepend>
                        <ToggleGroup
                            className="radio-group"
                            pattern="[0-9]*"
                            name="purchased"
                            value={book.purchased}
                            onChange={this.handleBookChange}
                            disabled={fieldsDisabled}
                            items={items}
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
                            disabled={fieldsDisabled}
                            onChange={this.handleBookChange}
                        />
                    </InputGroup>

                    <ButtonToolbar className="mb-2">
                        <Button
                            variant="primary"
                            disabled={navigationDtl.first}
                            onClick={this.firstBook}
                            className="ml-1" style={SMALL_BUTTON_STYLE}
                            active>{BUTTON_FIRST}
                        </Button>

                        <Button
                            variant="primary"
                            disabled={navigationDtl.first}
                            onClick={this.previousBook}
                            className="ml-1" style={SMALL_BUTTON_STYLE}
                            active>{BUTTON_PREVIOUS}
                        </Button>

                        <Button
                            variant="primary"
                            disabled={navigationDtl.last}
                            onClick={this.nextBook}
                            className="ml-1" style={SMALL_BUTTON_STYLE}
                            active>{BUTTON_NEXT}
                        </Button>

                        <Button
                            variant="primary"
                            disabled={navigationDtl.last}
                            onClick={this.lastBook}
                            className="ml-1" style={SMALL_BUTTON_STYLE}
                            active>{BUTTON_LAST}
                        </Button>

                    </ButtonToolbar>

                    <ButtonToolbar className="mb-2">
                        <Button
                            variant="primary"
                            disabled={addButtonDisabled}
                            onClick={this.addBook}
                            className="ml-1" style={SMALL_BUTTON_STYLE}
                            active>{BUTTON_ADD}
                        </Button>

                        <Button
                            variant="primary"
                            disabled={deleteButtonDisabled}
                            onClick={() => this.setState({ bookAlert: true })}
                            className="ml-1" style={SMALL_BUTTON_STYLE}
                            active>{BUTTON_DELETE}
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
                    <Volume
                        book={book}
                        addVolumeIntoBook={this.addVolumeIntoBook}
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

export default Book;