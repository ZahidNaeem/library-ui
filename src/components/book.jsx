import React, {Component} from 'react';
import {InputGroup, FormControl, Button, ButtonToolbar, Form} from 'react-bootstrap'
import SweetAlert from 'react-bootstrap-sweetalert'
import {toast} from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import 'react-widgets/dist/css/react-widgets.css'
import MySelect from './common/select'
import ToggleGroup from './common/toggleGroup'
import {request, getCurrentUser} from './util/APIUtils'
import Volume from './volume'
// import {ExportCSV} from './common/ExportCSV'
// import {CSVLink, CSVDownload} from "react-csv"
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
    BUTTON_UNDO,
    BUTTON_SEARCH,
    BUTTON_EXECUTE
} from './constant'

const bookConditions = [
    {value: 'New', label: 'New'},
    {value: 'Old', label: 'Old'}
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
        undoButtonDisabled: true,
        isSearching: false
    }

    async componentDidMount() {
        await this.populateAuthors();
        await this.populateSubjects();
        await this.populatePublishers();
        await this.populateResearchers();
        await this.firstBook();
        const canAdd = await this.canAdd();
        const canEdit = await this.canEdit();
        const canDelete = await this.canDelete();
        this.setState({addButtonDisabled: !canAdd, fieldsDisabled: !canEdit, deleteButtonDisabled: !canDelete});
    }

    getCurrentUser = async () => {
        try {
            const res = await getCurrentUser();
            console.log("Current User: ", res.data.entity);
            return res.data.entity;
        } catch (error) {
            console.log(error);
        }
    }

    findAll = async () => {
        const options = {
            url: API_BOOK_URL + "excel/data",
            method: 'GET'
        };
        try {
            const res = await request(options);
            const books = [...res.data.entity];
            return books;
        } catch (error) {
            console.log(error);
        }
    }

    handleBookChange = (event) => {
        const {name, value} = event.target;
        console.log("Target name", name);
        console.log("Target value", value);
        const book = {...this.state.book};
        book[name] = name === 'bookName' ? value.toUpperCase() : name === 'purchased' ? parseInt(value) : value;
        this.setState({book});
        this.enableSaveUndoButton();
    }

    handleSelectChange = (name, value) => {
        console.log("handleSelectChange name", name);
        console.log("handleSelectChange value", value);
        const {book} = this.state;
        book[name] = value;
        this.setState({book});
        this.enableSaveUndoButton();
    }

    validateForm = () => {
        const {book} = this.state;
        let validateBook = !(book.bookName === undefined || book.bookName === null || book.bookName === '');
        if (validateBook === true) {
            if (book.volumes !== undefined && book.volumes !== null) {
                const invalidVolumes = book.volumes.filter(volume => volume.volumeName === undefined || volume.volumeName === null || volume.volumeName === '');
                validateBook = invalidVolumes.length < 1;
            }
        }
        return validateBook;
    }

    enableSaveUndoButton = () => {
        const saveButtonDisabled = !this.validateForm();
        this.setState({saveButtonDisabled, undoButtonDisabled: false});
    }

    disableAddButton = (boolean) => {
        this.setState({addButtonDisabled: boolean});
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
        // book.volumes = [];
        this.setState({book, navigationDtl: {first: true, last: true}, undoButtonDisabled: false});
        // this.disableAddButton(true);
    }

    addVolumeIntoBook = (volumes) => {
        let book = {...this.state.book};
        // volumes.map(volume => {
        //     volume['book'] = book.bookId;
        // });
        book.volumes = volumes;
        this.setState({book});
    }

    saveBook = async () => {
        let saveResponse = {};
        if (this.validateForm() === false) {
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

                console.log("Post: Object received: ", res.data.entity);
                const {book, navigationDtl} = res.data.entity;
                this.setState({book, navigationDtl, saveButtonDisabled: true, undoButtonDisabled: true});
                this.disableAddButton(false);
                saveResponse = res.data;
            } catch (error) {
                saveResponse = error.response.data;
            }
        }
        return saveResponse;
    }

    saveBookShowMessage = async () => {
        try {
            const saveResponse = await this.saveBook();
            if (saveResponse.success === undefined || saveResponse.success === null) {
                toast.error(saveResponse);
            } else {
                toast.success(saveResponse.message);
            }
        } catch (error) {
            toast.error(error.response.data.message || 'Sorry! Something went wrong. Please try again or contact administrator.');
            return;
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

                console.log("Delete: Response: ", res);
                const {book, navigationDtl} = res.data.entity;
                this.setState({book, navigationDtl, saveButtonDisabled: true});
            } catch (error) {
                console.log(error);
                toast.error(error.response.data.message || 'Sorry! Something went wrong. Please try again or contact administrator.');
                return;
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

            const {book, navigationDtl} = res.data.entity;
            this.setState({book, navigationDtl})
            console.log(this.state.book);
        } catch (error) {
            console.log(error);
        }
    }

    saveAndNavigateBook = async (operation) => {
        const {saveButtonDisabled} = this.state;
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

    searchBook = async () => {
        let isSearching = this.state.isSearching;
        if (isSearching === false) {
            this.setState({book: {}});
        } else {
            const options = {
                url: API_BOOK_URL + 'search',
                method: 'POST',
                data: this.state.book
            };
            try {
                const res = await request(options);
                await this.navigateBook('first');
                console.log("Book Search Result", res);
            } catch (error) {
                console.log(error);
            }
        }
        isSearching = !this.state.isSearching;
        this.setState({isSearching});
    }

    firstBook = async () => {
        await this.saveAndNavigateBook('first');
    }

    previousBook = async () => {
        await this.saveAndNavigateBook('previous');
    }

    nextBook = async () => {
        await this.saveAndNavigateBook('next');
    }

    lastBook = async () => {
        await this.saveAndNavigateBook('last');
    }

    undoChanges = () => {
        const book = {...this.state.book};
        console.log("Book ID: ", book.bookId);
        this.setState({saveButtonDisabled: true});
        if (book.bookId != null) {
            const operation = book.bookId;
            this.navigateBook(operation);
        } else {
            this.firstBook();
        }
        this.setState({undoButtonDisabled: true});
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

            console.log("Stop populate authors");
            res.data.entity.forEach(element => {
                authors.push({
                    value: element.authorId,
                    label: element.authorName
                });
            });
            console.log("Authors:", authors);
        } catch (error) {
            console.log(error);
        }
        this.setState({authors});
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

            console.log("Stop populate subjects");
            res.data.entity.forEach(element => {
                subjects.push({
                    value: element.subjectId,
                    label: element.subjectName
                });
            });
            console.log("Subjects:", subjects);
        } catch (error) {
            console.log(error);
        }
        this.setState({subjects});
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

            console.log("Stop populate publishers");
            res.data.entity.forEach(element => {
                publishers.push({
                    value: element.publisherId,
                    label: element.publisherName
                });
            });
            console.log("Publishers:", publishers);
        } catch (error) {
            console.log(error);
        }
        this.setState({publishers});
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

            console.log("Stop populate researchers");
            res.data.entity.forEach(element => {
                researchers.push({
                    value: element.researcherId,
                    label: element.researcherName
                });
            });
            console.log("Researchers:", researchers);
        } catch (error) {
            console.log(error);
        }
        this.setState({researchers});
    }

    // exportToExcel = async () => {
    //     const rows = await this.findAll();
    //     console.log("Rows", rows);
    //     let csvContent = "data:text/csv;charset=utf-8,"
    //         + Object.keys(rows).map((key, index) => Object.values(rows[key]).map(value => value).join(',')).join('\n');
    //     // + rows.map(e => e.join(",")).join("\n");
    //     var encodedUri = encodeURI(csvContent);
    //     var link = document.createElement("a");
    //     link.setAttribute("href", encodedUri);
    //     link.setAttribute("download", "my_data.csv");
    //     document.body.appendChild(link); // Required for FF
    //     link.click();
    // }

    exportToExcel = async () => {
        const data = await this.findAll();
        console.log("Rows", data);
        {
            var table = "<head><meta charset='UTF-8'></head><table><thead><tr><td>";
            var head = Object.keys(data[0]);
            for(var i=0;i<head.length;i++){
                table += head[i]+"</td><td>";
            }
            table += "</td></tr></thead><tbody>";
            for(var i=0;i<data.length;i++){
                table += "<tr>";
                for(var j=0;j<head.length;j++){
                    table += "<td>"+data[i][head[j]]+"</td>";
                }
                table += "</tr>";
            }
            table += "</tbody></table>";
            var uri = 'data:application/vnd.ms-excel;charset=utf-8,'+ table;

            var downloadLink = document.createElement("a");
            downloadLink.href = uri;
            downloadLink.download = "data.xlsx";

            document.body.appendChild(downloadLink);
            downloadLink.click();
            document.body.removeChild(downloadLink);
        }
    }

    render() {
        const {
            book,
            navigationDtl,
            authors,
            subjects,
            publishers,
            researchers,
            fieldsDisabled,
            addButtonDisabled,
            deleteButtonDisabled,
            saveButtonDisabled,
            undoButtonDisabled,
            isSearching
        } = this.state;
        // [
        //     { firstname: "Ahmed", lastname: "Tomi", email: "ah@smthing.co.com" },
        //     { firstname: "Raed", lastname: "Labes", email: "rl@smthing.co.com" },
        //     { firstname: "Yezzi", lastname: "Min l3b", email: "ymin@cocococo.com" }
        // ];

        const items = [
            {value: parseInt("1"), label: "Purchased", disabled: fieldsDisabled},
            {value: parseInt("0"), label: "Gifted", disabled: fieldsDisabled},
            {value: parseInt("2"), label: "Other", disabled: fieldsDisabled}
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
                            onClick={() => this.setState({bookAlert: true})}
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
                            onCancel={() => this.setState({bookAlert: false})}
                        >
                            Delete Book
                        </SweetAlert>

                        <Button
                            variant="primary"
                            onClick={this.saveBookShowMessage}
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
                    <ButtonToolbar className="mb-2">
                        <Button
                            variant="primary"
                            // disabled={addButtonDisabled}
                            onClick={this.searchBook}
                            className="ml-1" style={SMALL_BUTTON_STYLE}
                            active>{isSearching === false ? BUTTON_SEARCH : BUTTON_EXECUTE}
                        </Button>
                        <Button
                            onClick={this.exportToExcel}
                            active>
                            Download
                        </Button>
                        {/*<div className="col-md-4 center">*/}
                        {/*    <CSVLink data={data}>*/}
                        {/*        Download me*/}
                        {/*    </CSVLink>*/}
                        {/*</div>*/}
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