import React, { Component } from 'react';
import { FormControl, Button, ButtonToolbar, Table } from 'react-bootstrap'
import SweetAlert from 'react-bootstrap-sweetalert'
import 'react-toastify/dist/ReactToastify.css'
import 'react-widgets/dist/css/react-widgets.css'
import { request, isSuccessfullResponse } from './util/APIUtils'
import {
    API_BOOK_TRANS_LINE_URL,
    STRETCH_STYLE,
    LARGE_BUTTON_STYLE,
    INPUT_DATE_STYLE,
    EXTRA_SMALL_BUTTON_STYLE
} from './constant'

class BookTransLine extends Component {

    state = {
        bookTransHeader: {},
        bookTransLineAlert: false
    }

    componentWillReceiveProps(props) {
        // You don't have to do this check first, but it can help prevent an unneeded render
        if (props.bookTransHeader !== this.state.bookTransHeader) {
            const { bookTransHeader } = props;
            this.setState({ bookTransHeader });
        }
    }

    handleBookTransLineChange = async (event, index) => {
        const { name, value } = event.target;
        const bookTransHeader = { ...this.state.bookTransHeader };
        const bookTransLines = [...this.state.bookTransHeader.bookTransLines];
        console.log("Target name", name);
        console.log("Index: ", index);
        console.log("Value: ", value);
        console.log("Cell old value: ", bookTransLines[index][name]);
        bookTransLines[index][name] = value;
        bookTransHeader.bookTransLines = bookTransLines;
        try {
            await this.props.addBookTransLineIntoBookTransHeader(bookTransLines);
            this.setState({ bookTransHeader });
            this.props.enableSaveUndoButton();
        } catch (error) {
            console.log(error);
        }
    }

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

    addBookTransLine = async () => {
        let bookTransHeader = { ...this.state.bookTransHeader };

        let newBookTransLine = {};

        if (bookTransHeader.bookTransLines === null) {
            alert("Please add bookTransHeader, then add bookTransLine");
            return;
        } else if (bookTransHeader.bookTransLines === undefined) {
            bookTransHeader['bookTransLines'] = [];
        }

        let bookTransLines = [...bookTransHeader.bookTransLines];
        bookTransLines.push(newBookTransLine);
        bookTransHeader.bookTransLines = bookTransLines;
        try {
            await this.props.addBookTransLineIntoBookTransHeader(bookTransLines);
            this.setState({ bookTransHeader });
            this.props.enableSaveUndoButton();
        } catch (error) {
            console.log(error);
        }
    }

    /*     saveBookTransLine = () => {
            console.log("BookTransHeader at save: ", this.state.bookTransHeader);
            this.props.saveBookTransHeader("BookTransLine saved successfully.");
            
        } */

    deleteBookTransLine = async (index) => {
        let bookTransHeader = { ...this.state.bookTransHeader };
        let bookTransLines = [...bookTransHeader.bookTransLines];
        let id = bookTransLines[index]['lineId'];
        if (id != null) {
            const options = {
                url: API_BOOK_TRANS_LINE_URL + id,
                method: 'DELETE'
            };
            try {
                const res = await request(options);
                if (isSuccessfullResponse(res)) {
                    console.log("Delete: Response: ", res);
                }
            } catch (error) {
                console.log(error);
            }
        }
        bookTransLines.splice(index, 1);
        bookTransHeader.bookTransLines = bookTransLines;
        try {
            await this.props.addBookTransLineIntoBookTransHeader(bookTransLines);
            this.setState({ bookTransHeader, bookTransLineAlert: false });
        } catch (error) {
            console.log(error);
        }
    }


    render() {
        const { bookTransLines } = this.state.bookTransHeader;
        const { fieldsDisabled, addButtondisabled, deleteButtondisabled } = this.props;

        return (
            <>
                <br />
                <h3 className="text-center h3 mb-4 text-gray-800">Book Details</h3>
                <ButtonToolbar className="mb-2">
                    <Button
                        variant="primary"
                        disabled={addButtondisabled}
                        onClick={this.addBookTransLine}
                        className="ml-1" style={LARGE_BUTTON_STYLE}
                        active>Add Book Details
                                            </Button>
                </ButtonToolbar>
                <Table
                    striped
                    bordered
                    hover
                // responsive
                >
                    <thead>

                        <tr>
                            <th style={INPUT_DATE_STYLE}>BookTransLine Number</th>
                            <th style={STRETCH_STYLE}>Remarks</th>
                            <th style={EXTRA_SMALL_BUTTON_STYLE}>Delete</th>
                        </tr>
                    </thead>
                    <tbody>
                        {
                            bookTransLines && bookTransLines.map((bookTransLine, index) => (
                                <tr key={bookTransLine.lineId}
                                >
                                    <td>
                                        <FormControl
                                            // type="number"
                                            name="bookTransLineName"
                                            placeholder="BookTransLine Number"
                                            aria-label="BookTransLine Number"
                                            value={bookTransLine.bookTransLineName || ''}
                                            required
                                            disabled={fieldsDisabled}
                                            onChange={e => this.handleBookTransLineChange(e, index)}
                                        />
                                    </td>
                                    <td>
                                        <FormControl
                                            type="text"
                                            name="remarks"
                                            placeholder="Remarks"
                                            aria-label="Remarks"
                                            value={bookTransLine.remarks || ''}
                                            disabled={fieldsDisabled}
                                            onChange={e => this.handleBookTransLineChange(e, index)}
                                        />
                                    </td>
                                    <td>
                                        <Button
                                            variant="primary"
                                            disabled={deleteButtondisabled}
                                            onClick={() => this.setState({ bookTransLineAlert: true })}
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
                                            onCancel={() => this.setState({ bookTransLineAlert: false })}
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