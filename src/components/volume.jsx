import React, { Component } from 'react';
import { FormControl, Button, ButtonToolbar, Table } from 'react-bootstrap'
import SweetAlert from 'react-bootstrap-sweetalert'
import 'react-toastify/dist/ReactToastify.css'
import 'react-widgets/dist/css/react-widgets.css'
import { request, isSuccessfullResponse } from './util/APIUtils'
import {
    API_VOLUME_URL,
    INPUT_GROUP_TEXT_STYLE,
    STRETCH_STYLE,
    LARGE_BUTTON_STYLE,
    SMALL_BUTTON_STYLE,
    INPUT_DATE_STYLE
} from './constant'
import MySelect from './common/select';

class Volume extends Component {

    state = {
        book: {},
        volumeAlert: false,
        volumeIndex: null
    }

    componentWillReceiveProps(props) {
        // You don't have to do this check first, but it can help prevent an unneeded render
        if (props.book !== this.state.book) {
            const { book } = props;
            this.setState({ book });
        }
    }

    handleVolumeChange = async (event, index) => {
        const { name, value } = event.target;
        const book = { ...this.state.book };
        const volumes = [...this.state.book.volumes];
        console.log("Target name", name);
        console.log("Index: ", index);
        console.log("Value: ", value);
        console.log("Cell old value: ", volumes[index][name]);
        volumes[index][name] = value;
        book.volumes = volumes;
        try {
            await this.props.addVolumeIntoBook(volumes);
            this.props.enableSaveUndoButton(book);
        } catch (error) {
            console.log(error);
        }
        this.setState({ book });
    }

    handleSelectChange = async (name, value, index) => {
        const book = { ...this.state.book };
        const volumes = [...this.state.book.volumes];
        console.log("Target name", name);
        console.log("Index: ", index);
        console.log("Value: ", value);
        console.log("Cell old value: ", volumes[index][name]);
        volumes[index][name] = value;
        book.volumes = volumes;
        try {
            await this.props.addVolumeIntoBook(volumes);
            this.props.enableSaveUndoButton(book);
        } catch (error) {
            console.log(error);
        }
        this.setState({ book });
    }

    addVolume = async () => {
        let book = { ...this.state.book };

        let newVolume = {};

        if (this.state.book.volumes === null) {
            alert("Please add book, then add volume");
            return;
        }

        let volumes = [...this.state.book.volumes];
        volumes.push(newVolume);
        book.volumes = volumes;
        try {
            await this.props.addVolumeIntoBook(volumes);
            this.props.enableSaveUndoButton(book);
        } catch (error) {
            console.log(error);
        }
        this.setState({ book });
    }

    /*     saveVolume = () => {
            console.log("Book at save: ", this.state.book);
            this.props.saveBook("Volume saved successfully.");
            
        } */

    deleteVolume = async () => {
        let book = { ...this.state.book };
        let volumes = [...this.state.book.volumes];
        let id = volumes[this.state.volumeIndex]["volumeId"];
        if (id != null) {
            const options = {
                url: API_VOLUME_URL + id,
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
        volumes.splice(this.state.volumeIndex, 1);
        book.volumes = volumes;
        try {
            await this.props.addVolumeIntoBook(volumes);
            this.setState({ book, volumeAlert: false });
        } catch (error) {
            console.log(error);
        }
    }


    render() {
        const { volumes } = this.state.book;
        const racks = [
            { value: 'A', label: 'A' },
            { value: 'B', label: 'B' },
            { value: 'C', label: 'C' }
        ]
        return (
            <>
                <br />
                <h3 className="text-center h3 mb-4 text-gray-800">Book Volumes</h3>
                <ButtonToolbar className="m-2">
                    <Button
                        variant="primary"
                        // disabled={navigationDtl.first}
                        onClick={this.addVolume}
                        className="mr-1" style={LARGE_BUTTON_STYLE}
                        active>Add Volume
                                            </Button>

                    <Button
                        variant="primary"
                        // disabled={navigationDtl.first}
                        onClick={() => this.setState({ volumeAlert: true })}
                        className="mr-1" style={LARGE_BUTTON_STYLE}
                        active>Delete Volume
                                                    </Button>

                    <SweetAlert
                        show={this.state.volumeAlert}
                        warning
                        showCancel
                        confirmBtnText="Delete"
                        confirmBtnBsStyle="danger"
                        cancelBtnBsStyle="default"
                        title="Delete Confirmation"
                        Text="Are you sure you want to delete this volume?"
                        onConfirm={() => this.deleteVolume()}
                        onCancel={() => this.setState({ volumeAlert: false })}
                    >
                        Delete Volume
                                                    </SweetAlert>
                </ButtonToolbar>
                <Table
                    striped
                    bordered
                    hover
                    responsive>
                    <thead>

                        <tr>
                            <th style={INPUT_DATE_STYLE}>Volume Number</th>
                            <th style={INPUT_DATE_STYLE}>Rack</th>
                            <th style={STRETCH_STYLE}>Remarks</th>
                        </tr>
                    </thead>
                    <tbody>
                        {
                            volumes && volumes.map((volume, index) => (
                                <tr key={volume.volumeId}
                                    onFocus={() => { this.setState({ volumeIndex: index }) }}>
                                    <td>
                                        <FormControl
                                            // type="number"
                                            name="volumeName"
                                            placeholder="Volume Number"
                                            aria-label="Volume Number"
                                            value={volume.volumeName || ''}
                                            required
                                            onChange={e => this.handleVolumeChange(e, index)}
                                        />
                                    </td>
                                    <td>
                                        <MySelect
                                            name="rack"
                                            placeholder="Select Rack"
                                            value={volume.rack || ''}
                                            onChange={(name, value) => this.handleSelectChange(name, value, index)}
                                            options={racks}
                                        />
                                    </td>
                                    <td>
                                        <FormControl
                                            type="text"
                                            name="remarks"
                                            placeholder="Remarks"
                                            aria-label="Remarks"
                                            value={volume.remarks || ''}
                                            onChange={e => this.handleVolumeChange(e, index)}
                                        />
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

export default Volume;