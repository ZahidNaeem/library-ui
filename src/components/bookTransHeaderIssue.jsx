import React, { Component } from 'react';
import { InputGroup, FormControl, Button, ButtonToolbar, Form } from 'react-bootstrap'
import SweetAlert from 'react-bootstrap-sweetalert'
import { toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import 'react-widgets/dist/css/react-widgets.css'
import MySelect from './common/select'
import { request, isSuccessfullResponse, getCurrentUser } from './util/APIUtils'
import {
    API_BOOK_TRANS_HEADER_URL,
    API_READER_URL,
    API_BOOK_URL,
    API_VOLUME_URL,
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

class BookTransHeaderIssue extends Component {

    state = {
        bookTransHeader: {
            transType: 'ISSUE',
            transDate: null,
            reader: null,
            remarks: null,
            bookTransLines: []
        },
        navigationDtl: {},
        bookTransHeaderAlert: false,
        readers: [],
        books: [],
        volumes: [],
        fieldsDisabled: true,
        addButtonDisabled: true,
        deleteButtonDisabled: true,
        saveButtonDisabled: true,
        undoButtonDisabled: true
    }

    async componentDidMount() {
        await this.populateReaders();
        await this.populateBooks();
        await this.populateVolumes();
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
        bookTransHeader[name] = value;
        this.setState({ bookTransHeader });
        this.enableSaveUndoButton();
    }

    handleSelectChange = (name, value) => {
        console.log("handleSelectChange name", name);
        console.log("handleSelectChange value", value);
        const { bookTransHeader } = this.state;
        bookTransHeader[name] = value;
        this.setState({ bookTransHeader });
        this.enableSaveUndoButton();
    }

    handleBookChange = (name, value) => {
        console.log("handleSelectChange name", name);
        console.log("handleSelectChange value", value);
        const volumes = [...this.state.volumes];

        const filteredVolumes = volumes.filter(volume => volume.bookId === value);
        console.log("Filtered Volumes", filteredVolumes);

        const { bookTransHeader } = this.state;
        if (bookTransHeader.bookTransLines === undefined || bookTransHeader.bookTransLines === null) {
            bookTransHeader.bookTransLines = [];
        }

        filteredVolumes.forEach(volume => {
            bookTransHeader.bookTransLines.push({
                volume: volume.volumeId,
                bookId: volume.bookId,
                volumeName: volume.volumeName,
                bookName: volume.bookName,
                rackName: volume.rackName,
                remarks: volume.remarks
            });
        });
        this.setState({ bookTransHeader });
    }

    validateForm = () => {
        const { bookTransHeader } = this.state;
        console.log("transDate", bookTransHeader.transDate);
        console.log("reader", bookTransHeader.reader);

        let validateBookTrans = !(
            bookTransHeader.transDate === undefined || bookTransHeader.transDate === null || bookTransHeader.transDate === '' ||
            bookTransHeader.reader === undefined || bookTransHeader.reader === null || bookTransHeader.reader === ''
        );
        if (validateBookTrans === true) {
            if (bookTransHeader.bookTransLines !== undefined && bookTransHeader.bookTransLines !== null) {
                const invalidBookTransLines = bookTransHeader.bookTransLines.filter(bookTransLine => bookTransLine.volume === undefined || bookTransLine.volume === null || bookTransLine.volume === '');
                validateBookTrans = invalidBookTransLines.length < 1;
            }
        }
        return validateBookTrans;
    }

    enableSaveUndoButton = () => {
        const saveButtonDisabled = !this.validateForm();
        this.setState({ saveButtonDisabled, undoButtonDisabled: false });
    }

    // disableAddButton = (boolean) => {
    //     this.setState({ addButtonDisabled: boolean });
    // }

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
        // bookTransHeader.bookTransLines = [];
        this.setState({ bookTransHeader, navigationDtl: { first: true, last: true }, undoButtonDisabled: false });
        // this.disableAddButton(true);
    }

    addBookTransLineIntoBookTransHeader = (bookTransLines) => {
        let bookTransHeader = { ...this.state.bookTransHeader };
        // bookTransLines.map(bookTransLine => {
        //     bookTransLine['bookTransHeader'] = bookTransHeader.headerId;
        // });
        bookTransHeader.bookTransLines = bookTransLines;
        this.setState({ bookTransHeader }, () => { console.log("bookTransHeader", bookTransHeader) }
        );
    }

    saveBookTransHeader = async () => {

        if (this.validateForm() === false) {
            toast.error("Issuance date and reader are required fields");
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
                    // this.disableAddButton(false);
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
                    // this.disableAddButton(false);
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

    async populateReaders() {
        console.log("Start populate readers");
        const readers = [];
        const options = {
            url: API_READER_URL,
            method: 'GET'
        };
        try {
            const res = await request(options);
            if (isSuccessfullResponse(res)) {
                console.log("Stop populate readers");
                res.data.forEach(element => {
                    readers.push({
                        value: element.readerId,
                        label: element.readerName
                    });
                });
            }
            console.log("Readers:", readers);
        } catch (error) {
            console.log(error);
        }
        this.setState({ readers });
    }

    async populateBooks() {
        console.log("Start populate books");
        const books = [];
        const options = {
            url: API_BOOK_URL,
            method: 'GET'
        };
        try {
            const res = await request(options);
            if (isSuccessfullResponse(res)) {
                console.log("Stop populate books");
                res.data.forEach(element => {
                    books.push({
                        value: element.bookId,
                        label: element.bookName
                    });
                });
            }
            console.log("Books:", books);
        } catch (error) {
            console.log(error);
        }
        this.setState({ books });
    }

    async populateVolumes() {
        console.log("Start populate volumes");
        let volumes = [];
        const options = {
            url: API_VOLUME_URL + 'resp/all',
            method: 'GET'
        };
        try {
            const res = await request(options);
            if (isSuccessfullResponse(res)) {
                console.log("Stop populate volumes");
                // res.data.forEach(element => {
                //     volumes.push({
                //         value: element.volumeId,
                //         label: element.volumeName,
                //         bookId: element.bookId
                //     });
                // });
            }
            volumes = res.data;
            console.log("Volumes:", volumes);
        } catch (error) {
            console.log(error);
        }
        this.setState({ volumes });
    }

    render() {
        const {
            bookTransHeader,
            navigationDtl,
            fieldsDisabled,
            addButtonDisabled,
            deleteButtonDisabled,
            saveButtonDisabled,
            undoButtonDisabled,
            readers,
            books
        } = this.state;


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
                            <InputGroup.Text style={INPUT_GROUP_TEXT_STYLE}>Issuance Date</InputGroup.Text>
                        </InputGroup.Prepend>
                        <FormControl
                            type="date"
                            name="transDate"
                            placeholder="Issuance Date"
                            aria-label="Issuance Date"
                            value={bookTransHeader.transDate != null ? bookTransHeader.transDate.split("T")[0] : ''}
                            required
                            disabled={fieldsDisabled}
                            onChange={this.handleBookTransHeaderChange}
                        />
                    </InputGroup>

                    <InputGroup className="mb-3">
                        <InputGroup.Prepend>
                            <InputGroup.Text style={INPUT_GROUP_TEXT_STYLE}>Reader</InputGroup.Text>
                        </InputGroup.Prepend>
                        <div style={STRETCH_STYLE}>
                            <MySelect
                                name="reader"
                                placeholder="Select Reader"
                                value={bookTransHeader.reader}
                                onChange={this.handleSelectChange}
                                disabled={fieldsDisabled}
                                options={readers}
                            />
                        </div>
                    </InputGroup>

                    <InputGroup className="mb-3">
                        <InputGroup.Prepend>
                            <InputGroup.Text style={INPUT_GROUP_TEXT_STYLE}>Book</InputGroup.Text>
                        </InputGroup.Prepend>
                        <div style={STRETCH_STYLE}>
                            <MySelect
                                name="book"
                                placeholder="Select Book"
                                // value={bookTransHeader.reader}
                                onChange={this.handleBookChange}
                                disabled={fieldsDisabled}
                                options={books}
                            />
                        </div>
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
                        bookTransLines={bookTransHeader.bookTransLines}
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

export default BookTransHeaderIssue;