import React, { Component } from 'react';
import { Form, InputGroup, Button, Table } from 'react-bootstrap';
import MySelect from './common/select';
import {
    INPUT_GROUP_TEXT_STYLE,
    STRETCH_STYLE,
    INPUT_DATE_STYLE,
    API_AUTHOR_URL,
    API_SUBJECT_URL,
    API_PUBLISHER_URL,
    API_RESEARCHER_URL,
    API_BOOK_URL,
    API_VOLUME_URL
} from './constant';
import { getCurrentUser, isSuccessfullResponse, request } from './util/APIUtils';

let expanded = false;
class SearchBook extends Component {
    state = {
        searchBookRequest: {},
        authors: [],
        subjects: [],
        publishers: [],
        researchers: [],
        books: [],
        volumes: [],
        bookDetailsRows: []
    }

    async componentDidMount() {
        await this.populateAuthors();
        await this.populateSubjects();
        await this.populatePublishers();
        await this.populateResearchers();
    }

    handleSelectChange = (name, value) => {
        console.log("handleSelectChange name", name);
        console.log("handleSelectChange value", value);
        const { searchBookRequest } = this.state;
        searchBookRequest[name] = value;
        this.setState({ searchBookRequest });
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
                        label: element.subjectName,
                        parent: element.parentSubjectId
                    });
                });
            }
            console.log("Subjects:", subjects);
        } catch (error) {
            console.log(error);
        }
        this.setState({ subjects });
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
                        label: element.authorName,
                        parent: element.parentAuthorId
                    });
                });
            }
            console.log("Authors:", authors);
        } catch (error) {
            console.log(error);
        }
        this.setState({ authors });
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
                        label: element.publisherName,
                        parent: element.parentPublisherId
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
                        label: element.researcherName,
                        parent: element.parentResearcherId
                    });
                });
            }
            console.log("Researchers:", researchers);
        } catch (error) {
            console.log(error);
        }
        this.setState({ researchers });
    }

    async populateBooks() {
        const searchBookRequest = { ...this.state.searchBookRequest };
        console.log("Search Book: Object sent: ", this.state.searchBookRequest);
        const options = {
            url: API_BOOK_URL + 'search',
            method: 'POST',
            data: searchBookRequest
        };
        try {
            const res = await request(options);
            if (isSuccessfullResponse(res)) {
                console.log("Search Book: Object received: ", res.data);
                this.setState({ books: res.data });
                await this.populateVolumes();
            }
        } catch (error) {
            throw error.response.data;
        }
    }

    async populateVolumes() {
        console.log("Start populate volumes");
        const options = {
            url: API_VOLUME_URL + 'resp/all',
            method: 'GET'
        };
        try {
            const res = await request(options);
            if (isSuccessfullResponse(res)) {
                console.log("Stop populate volumes");
                const volumes = res.data;
                console.log("Volumes:", volumes);
                this.setState({ volumes });
            }
        } catch (error) {
            console.log(error);
        }
    }

    searchBook = async () => {
        await this.populateBooks();
        await this.populateVolumes();
    }

    handleRowClick = () => {
        console.log("handleRowClick before", expanded);
        expanded = !expanded;
        console.log("handleRowClick after", expanded);
        
    }

    renderBookDetails = () => {
        const books = [...this.state.books];
        let volumes = [...this.state.volumes];
        // const clickCallback = this.handleRowClick(book.id);
        const bookDetailsRows = [];

        books.forEach(book => {
            bookDetailsRows.push(
                <tr
                    key={"row-data-" + book.bookId}
                    onClick={this.handleRowClick}>
                    <td>{book.bookId}</td>
                    <td>{book.bookName}</td>
                    <td>{book.publicationDate}</td>
                    <td>{book.authorName}</td>
                    <td>{book.subjectName}</td>
                    <td>{book.publisherName}</td>
                    <td>{book.researcherName}</td>
                </tr>
            );

            if (expanded === true) {
                const filteredVolumes = volumes.filter(volume => volume.bookId === book.bookId);
                filteredVolumes.forEach(volume => {
                    bookDetailsRows.push(
                        <tr key={"row-expanded-" + volume.volumeId}>
                            <td>{volume.volumeName}</td>
                            <td>{volume.rackName}</td>
                            <td>{volume.remarks}</td>
                        </tr>
                    );
                });
            }
        });

        // if (this.state.expandedRows.includes(book.bookId)) {
        //     const volumes = { ...this.state.volumes };
        //     volumes.forEach(volume => {
        //         bookDetailsRows.push(
        //             <tr key={"row-expanded-" + volume.volumeId}>
        //                 <td>{volume.volumeName}</td>
        //                 <td>{volume.rackName}</td>
        //                 <td>{volume.remarks}</td>
        //             </tr>
        //         );
        //     });
        // }

        this.setState({bookDetailsRows});
    }

    render() {
        const { searchBookRequest, authors, subjects, publishers, researchers, books, volumes } = this.state;

        let allBookDetailsRows = this.renderBookDetails();

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
                    <InputGroup className="mb-3">
                        <Button
                            variant="primary"
                            onClick={this.searchBook}
                            // className="ml-1" style={SMALL_BUTTON_STYLE}
                            active>Search
                        </Button>
                    </InputGroup>
                    {/* <Table
                        striped
                        bordered
                        hover
                    // responsive
                    >
                        <thead>
                            <tr>
                                <th style={INPUT_DATE_STYLE}>Book</th>
                                <th style={STRETCH_STYLE}>Rack</th>
                                <th style={STRETCH_STYLE}>Remarks</th>
                            </tr>
                        </thead>
                        <tbody>
                            {
                                books && books.map((book, index) => (
                                    <tr key={book.bookId}
                                    >
                                        <td>{book.bookName || ''}</td>
                                        <td>{book.rack || ''}</td>
                                        <td>{book.remarks || ''}</td>
                                    </tr>
                                ))
                            }
                        </tbody>
                    </Table> */}
                    <Table
                        striped
                        bordered
                        hover
                    // responsive
                    >
                        <thead>

                            <tr>
                                <th> Book ID</th>
                                <th>Book Name</th>
                                <th>Publication Date</th>
                                <th>Author Name</th>
                                <th>Subject Name</th>
                                <th>Publisher Name</th>
                                <th>Researcher Name</th>
                            </tr>
                        </thead>
                        <tbody>
                            {allBookDetailsRows}
                        </tbody>
                    </Table>
                </Form>
            </div>
        );
    }
}

export default SearchBook;