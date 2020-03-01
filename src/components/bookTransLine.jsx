import React, {Component} from 'react';
import {FormControl, Button, ButtonToolbar, Table} from 'react-bootstrap'
import SweetAlert from 'react-bootstrap-sweetalert'
import 'react-toastify/dist/ReactToastify.css'
import 'react-widgets/dist/css/react-widgets.css'
import {request} from './util/APIUtils'
import {
    API_BOOK_TRANS_LINE_URL,
    STRETCH_STYLE,
    LARGE_BUTTON_STYLE,
    INPUT_DATE_STYLE,
    EXTRA_SMALL_BUTTON_STYLE,
    API_BOOK_URL
} from './constant'

class BookTransLine extends Component {

    state = {
        bookTransLines: [],
        books: [],
        bookTransLineAlert: false
    }

    async componentDidMount() {
        const options = {
            url: `${API_BOOK_URL}`,
            method: 'GET'
        };
        try {
            const res = await request(options);
            const books = res.data.entity;
            this.setState({books});
        } catch (error) {
            console.log(error);
        }
    }

    componentWillReceiveProps(props) {
        // You don't have to do this check first, but it can help prevent an unneeded render
        console.log("BookTransLine props", props);
        // if (props.bookTransLines !== this.state.bookTransLines) {
        // }
        const {bookTransLines} = props;
        if(bookTransLines === undefined || bookTransLines === null){
            console.log("bookTransLine is undefined or null");
        } else {
            const books = [...this.state.books];
            console.log("Books", books);
            bookTransLines.forEach(line => {
                const filteredBooks = books.filter(book => book.bookId === line.book);
                const filteredVolumes = filteredBooks[0].volumes.filter(volume => volume.volumeId === line.volume);
                line.bookName = filteredBooks[0].bookName;
                line.volumeName = filteredVolumes[0].volumeName;
            })
        }
        this.setState({bookTransLines});
    }

    // handleBookTransLineChange = async (event, index) => {
    //     const { name, value } = event.target;
    //     const bookTransHeader = { ...this.state.bookTransHeader };
    //     const bookTransLines = [...this.state.bookTransHeader.bookTransLines];
    //     console.log("Target name", name);
    //     console.log("Index: ", index);
    //     console.log("Value: ", value);
    //     console.log("Cell old value: ", bookTransLines[index][name]);
    //     bookTransLines[index][name] = value;
    //     bookTransHeader.bookTransLines = bookTransLines;
    //     try {
    //         await this.props.addBookTransLineIntoBookTransHeader(bookTransLines);
    //         this.setState({ bookTransHeader });
    //         this.props.enableSaveUndoButton();
    //     } catch (error) {
    //         console.log(error);
    //     }
    // }

    // handleSelectChange = async (name, value, index) => {
    //     const bookTransHeader = { ...this.state.bookTransHeader };
    //     const bookTransLines = [...this.state.bookTransHeader.bookTransLines];
    //     console.log("Target name", name);
    //     console.log("Index: ", index);
    //     console.log("Value: ", value);
    //     console.log("Cell old value: ", bookTransLines[index][name]);
    //     bookTransLines[index][name] = value;
    //     bookTransHeader.bookTransLines = bookTransLines;
    //     try {
    //         await this.props.addBookTransLineIntoBookTransHeader(bookTransLines);
    //         this.props.enableSaveUndoButton(bookTransHeader);
    //     } catch (error) {
    //         console.log(error);
    //     }
    //     this.setState({ bookTransHeader });
    // }

    // addBookTransLine = async () => {
    //     let bookTransLines = [...this.state.bookTransLines];
    //     let newBookTransLine = {};
    //     bookTransLines.push(newBookTransLine);
    //     try {
    //         await this.props.addBookTransLineIntoBookTransHeader(bookTransLines);
    //         this.setState({ bookTransLines });
    //         this.props.enableSaveUndoButton();
    //     } catch (error) {
    //         console.log(error);
    //     }
    // }

    /*     saveBookTransLine = () => {
            console.log("BookTransHeader at save: ", this.state.bookTransHeader);
            this.props.saveBookTransHeader("BookTransLine saved successfully.");
            
        } */

    /*getBookById = async (bookId) => {
        const options = {
            url: `${API_BOOK_URL}${bookId}`,
            method: 'GET'
        };
        try {
            const res = await request(options);
            const {book, navigationDtl} = res.data.entity;
            return book;
        } catch (error) {
            console.log(error);
        }
    }

    bookName = async (rowKey) => {
        const bookTransLines = [...this.state.bookTransLines];
        const filteredLines = bookTransLines.filter(line => line.rowKey === rowKey);
        const book = await this.getBookById(filteredLines[0].book);
        console.log("Book", book);
        this.setState({bookName: book.bookName});
    }

    volumeName = async (rowKey) => {
        /!*const [bookTransLines] = this.state;
        const filteredLines = bookTransLines.filter(line => line.rowKey === rowKey);
        const book = await this.getBookById(filteredLines[0].book);
        console.log("Book", book);
        return book.bookName;*!/
    }*/

    deleteBookTransLine = async (index) => {
        let bookTransLines = [...this.state.bookTransLines];
        let id = bookTransLines[index]['lineId'];
        if (id != null) {
            const options = {
                url: API_BOOK_TRANS_LINE_URL + id,
                method: 'DELETE'
            };
            try {
                const res = await request(options);

                console.log("Delete: Response: ", res);
            } catch (error) {
                console.log(error);
            }
        }
        bookTransLines.splice(index, 1);
        try {
            await this.props.addBookTransLineIntoBookTransHeader(bookTransLines);
            this.setState({bookTransLines, bookTransLineAlert: false});
        } catch (error) {
            console.log(error);
        }
    }


    render() {
        const {bookTransLines} = this.state;
        const {fieldsDisabled, addButtondisabled, deleteButtondisabled} = this.props;

        return (
            <>
                <br/>
                <h3 className="text-center h3 mb-4 text-gray-800">Book Details</h3>
                {/* <ButtonToolbar className="mb-2">
                    <Button
                        variant="primary"
                        disabled={addButtondisabled}
                        onClick={this.addBookTransLine}
                        className="ml-1" style={LARGE_BUTTON_STYLE}
                        active>Add Book Details
                                            </Button>
                </ButtonToolbar> */}
                <Table
                    striped
                    bordered
                    hover
                    // responsive
                >
                    <thead>

                    <tr>
                        <th style={INPUT_DATE_STYLE}>Book</th>
                        <th style={INPUT_DATE_STYLE}>Volume</th>
                        {/*<th style={STRETCH_STYLE}>Remarks</th>*/}
                        <th style={EXTRA_SMALL_BUTTON_STYLE}>Delete</th>
                    </tr>
                    </thead>
                    <tbody>
                    {
                        bookTransLines && bookTransLines.map((bookTransLine, index) => (
                            <tr key={bookTransLine.rowKey}
                            >
                                {/*{this.bookName(bookTransLine.rowKey)}*/}
                                {/*{this.volumeName(bookTransLine.rowKey)}*/}
                                <td>{bookTransLine.bookName}</td>
                                <td>{bookTransLine.volumeName}</td>
                                {/*<td>{bookTransLine.remarks}</td>*/}
                                <td>
                                    <Button
                                        variant="primary"
                                        disabled={deleteButtondisabled}
                                        onClick={() => this.setState({bookTransLineAlert: true})}
                                        className="ml-1"
                                        active>Delete
                                    </Button>

                                    <SweetAlert
                                        show={this.state.bookTransLineAlert}
                                        warning
                                        showCancel
                                        confirmBtnText="Delete"
                                        confirmBtnBsStyle="danger"
                                        cancelBtnBsStyle="default"
                                        title="Delete Confirmation"
                                        Text="Are you sure you want to delete this bookTransLine?"
                                        onConfirm={() => this.deleteBookTransLine(index)}
                                        onCancel={() => this.setState({bookTransLineAlert: false})}
                                    >
                                        Delete BookTransLine
                                    </SweetAlert>
                                </td>
                            </tr>
                        ))
                    }
                    </tbody>
                </Table>
            </>
        );
    }
}

export default BookTransLine;