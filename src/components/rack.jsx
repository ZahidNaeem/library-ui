import React, { Component } from 'react';
import { FormControl, Button, ButtonToolbar, Table } from 'react-bootstrap'
import SweetAlert from 'react-bootstrap-sweetalert'
import 'react-toastify/dist/ReactToastify.css'
import 'react-widgets/dist/css/react-widgets.css'
import { request, isSuccessfullResponse } from './util/APIUtils'
import {
    API_RACK_URL,
    INPUT_GROUP_TEXT_STYLE,
    STRETCH_STYLE,
    LARGE_BUTTON_STYLE,
    SMALL_BUTTON_STYLE,
    INPUT_DATE_STYLE
} from './constant'

class Rack extends Component {

    state = {
        shelf: {},
        rackAlert: false,
        rackIndex: null
    }

    componentWillReceiveProps(props) {
        // You don't have to do this check first, but it can help prevent an unneeded render
        if (props.shelf !== this.state.shelf) {
            const { shelf } = props;
            this.setState({ shelf });
        }
    }

    handleRackChange = async (event, index) => {
        const { name, value } = event.target;
        const shelf = { ...this.state.shelf };
        const racks = [...this.state.shelf.racks];
        console.log("Target name", name);
        console.log("Index: ", index);
        console.log("Value: ", value);
        console.log("Cell old value: ", racks[index][name]);
        racks[index][name] = value;
        shelf.racks = racks;
        try {
            await this.props.addRackIntoShelf(racks);
            this.props.enableSaveUndoButton(shelf);
        } catch (error) {
            console.log(error);
        }
        this.setState({ shelf });
    }

    // handleSelectChange = async (name, value, index) => {
    //     const shelf = { ...this.state.shelf };
    //     const racks = [...this.state.shelf.racks];
    //     console.log("Target name", name);
    //     console.log("Index: ", index);
    //     console.log("Value: ", value);
    //     console.log("Cell old value: ", racks[index][name]);
    //     racks[index][name] = value;
    //     shelf.racks = racks;
    //     try {
    //         await this.props.addRackIntoShelf(racks);
    //         this.props.enableSaveUndoButton(shelf);
    //     } catch (error) {
    //         console.log(error);
    //     }
    //     this.setState({ shelf });
    // }

    addRack = async () => {
        let shelf = { ...this.state.shelf };

        let newRack = {};

        if (this.state.shelf.racks === null) {
            alert("Please add shelf, then add rack");
            return;
        }
        let racks = [...this.state.shelf.racks];
        racks.push(newRack);
        shelf.racks = racks;
        try {
            await this.props.addRackIntoShelf(racks);
            this.props.enableSaveUndoButton(shelf);
        } catch (error) {
            console.log(error);
        }
        this.setState({ shelf });
    }

    /*     saveRack = () => {
            console.log("Shelf at save: ", this.state.shelf);
            this.props.saveShelf("Rack saved successfully.");
            
        } */

    deleteRack = async () => {
        let shelf = { ...this.state.shelf };
        let racks = [...this.state.shelf.racks];
        let id = racks[this.state.rackIndex]["rackId"];
        if (id != null) {
            const options = {
                url: API_RACK_URL + id,
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
        racks.splice(this.state.rackIndex, 1);
        shelf.racks = racks;
        try {
            await this.props.addRackIntoShelf(racks);
            this.setState({ shelf, rackAlert: false });
        } catch (error) {
            console.log(error);
        }
    }


    render() {
        const { racks } = this.state.shelf;
        const { fieldsDisabled, addButtondisabled, deleteButtondisabled } = this.props;

        return (
            <>
                <br />
                <h3 className="text-center h3 mb-4 text-gray-800">Shelf Racks</h3>
                <ButtonToolbar className="m-2">
                    <Button
                        variant="primary"
                        disabled={addButtondisabled}
                        onClick={this.addRack}
                        className="mr-1" style={LARGE_BUTTON_STYLE}
                        active>Add Rack
                                            </Button>

                    <Button
                        variant="primary"
                        disabled={deleteButtondisabled}
                        onClick={() => this.setState({ rackAlert: true })}
                        className="mr-1" style={LARGE_BUTTON_STYLE}
                        active>Delete Rack
                                                    </Button>

                    <SweetAlert
                        show={this.state.rackAlert}
                        warning
                        showCancel
                        confirmBtnText="Delete"
                        confirmBtnBsStyle="danger"
                        cancelBtnBsStyle="default"
                        title="Delete Confirmation"
                        Text="Are you sure you want to delete this rack?"
                        onConfirm={() => this.deleteRack()}
                        onCancel={() => this.setState({ rackAlert: false })}
                    >
                        Delete Rack
                                                    </SweetAlert>
                </ButtonToolbar>
                <Table
                    striped
                    bordered
                    hover
                // responsive
                >
                    <thead>

                        <tr>
                            <th style={INPUT_DATE_STYLE}>Rack Number</th>
                            <th style={STRETCH_STYLE}>Remarks</th>
                        </tr>
                    </thead>
                    <tbody>
                        {
                            racks && racks.map((rack, index) => (
                                <tr key={rack.rackId}
                                    onFocus={() => { this.setState({ rackIndex: index }) }}>
                                    <td>
                                        <FormControl
                                            // type="number"
                                            name="rackName"
                                            placeholder="Rack Number"
                                            aria-label="Rack Number"
                                            value={rack.rackName || ''}
                                            required
                                            disabled={fieldsDisabled}
                                            onChange={e => this.handleRackChange(e, index)}
                                        />
                                    </td>
                                    <td>
                                        <FormControl
                                            type="text"
                                            name="remarks"
                                            placeholder="Remarks"
                                            aria-label="Remarks"
                                            value={rack.remarks || ''}
                                            disabled={fieldsDisabled}
                                            onChange={e => this.handleRackChange(e, index)}
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

export default Rack;