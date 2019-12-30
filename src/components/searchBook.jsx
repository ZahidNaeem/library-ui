import React, { Component } from 'react';
import { Form, InputGroup, FormControl, Table } from 'react-bootstrap';
import MySelect from './common/select';
import { INPUT_GROUP_TEXT_STYLE, STRETCH_STYLE, INPUT_DATE_STYLE } from './constant';

class SearchBook extends Component {
    state = {
        searchBookRequest: {},
        authors: [],
        subjects: [],
        publishers: [],
        researchers: [],
        books: []
    }
    render() {
        const {searchBookRequest, authors, subjects, publishers, researchers, books} = this.state;
        return (
            <div>
                <Form dir="rtl">
                    <InputGroup className="mb-3">
                        <InputGroup.Prepend>
                            <InputGroup.Text style={INPUT_GROUP_TEXT_STYLE}>Author</InputGroup.Text>
                        </InputGroup.Prepend>
                        <div style={STRETCH_STYLE}>
                            <MySelect
                                name="author"
                                placeholder="Select Author"
                                value={searchBookRequest.author}
                                onChange={this.handleSelectChange}
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
                                value={searchBookRequest.subject}
                                onChange={this.handleSelectChange}
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
                                value={searchBookRequest.publisher}
                                onChange={this.handleSelectChange}
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
                                value={searchBookRequest.researcher}
                                onChange={this.handleSelectChange}
                                options={researchers}
                            />
                        </div>
                    </InputGroup>
                    <Table
                    striped
                    bordered
                    hover
                // responsive
                >
                    <thead>
                        <tr>
                            <th style={INPUT_DATE_STYLE}>Volume Number</th>
                            <th style={STRETCH_STYLE}>Rack</th>
                            <th style={STRETCH_STYLE}>Remarks</th>
                        </tr>
                    </thead>
                    <tbody>
                        {
                            books && books.map((book, index) => (
                                <tr key={book.bookId}
                                >
                                    <td>
                                        <FormControl
                                            // type="number"
                                            name="volumeName"
                                            placeholder="Volume Number"
                                            aria-label="Volume Number"
                                            value={book.bookName || ''}
                                            required
                                            onChange={e => this.handleVolumeChange(e, index)}
                                        />
                                    </td>
                                    <td>
                                        <MySelect
                                            name="rack"
                                            placeholder="Select Rack"
                                            value={book.rack || ''}
                                            onChange={(name, value) => this.handleSelectChange(name, value, index)}
                                            options={authors}
                                        />
                                    </td>
                                    <td>
                                        <FormControl
                                            type="text"
                                            name="remarks"
                                            placeholder="Remarks"
                                            aria-label="Remarks"
                                            value={book.remarks || ''}
                                            onChange={e => this.handleVolumeChange(e, index)}
                                        />
                                    </td>
                                    </tr>
                            ))
                        }
                    </tbody>
                </Table>
                </Form>
            </div>
        );
    }
}

export default SearchBook;