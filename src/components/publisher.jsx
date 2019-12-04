import React, { Component } from 'react';
import { InputGroup, FormControl, Button, ButtonToolbar, Form } from 'react-bootstrap'
import SweetAlert from 'react-bootstrap-sweetalert'
import { toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import 'react-widgets/dist/css/react-widgets.css'
import { Combobox } from 'react-widgets'
import { request, isSuccessfullResponse } from './util/APIUtils'
import { API_PUBLISHER_URL } from './constant'

class Publisher extends Component {

    state = {
        publisher: {},
        navigationDtl: {},
        publisherAlert: false,
        saveDisabled: true
    }

    componentDidMount() {
        this.firstPublisher();
    }

    handlePublisherChange = (event) => {
        const { name, value } = event.target;
        console.log("Target name", name);
        console.log(value);
        const publisher = { ...this.state.publisher };
        publisher[name] = name === 'publisherName' ? value.toUpperCase() : value;
        let saveDisabled = { ...this.state.saveDisabled };
        if (publisher.publisherName === undefined || publisher.publisherName === null || publisher.publisherName === ''
            || publisher.publisherUom === undefined || publisher.publisherUom === null || publisher.publisherUom === ''
            || publisher.effectiveStartDate === undefined || publisher.effectiveStartDate === null || publisher.effectiveStartDate === '') {
            saveDisabled = true;
        } else {
            saveDisabled = false;
        }
        this.setState({ publisher, saveDisabled });
    }

    handleComboboxChange = (value, name) => {
        let publisher = { ...this.state.publisher };
        publisher[name] = value.toUpperCase();
        let saveDisabled = { ...this.state.saveDisabled };
        if (publisher.publisherName === undefined || publisher.publisherName === null || publisher.publisherName === '') {
            saveDisabled = true;
        } else {
            saveDisabled = false;
        }
        this.setState({ publisher, saveDisabled });
    }

    newPublisher = () => {
        const publisher = {};
        publisher.publisherStocks = [];
        this.setState({ publisher, navigationDtl: { first: true, last: true } });
    }

    savePublisher = async () => {
        const { publisherName } = this.state.publisher;
        if (publisherName === undefined || publisherName === null || publisherName === '') {
            toast.error("Publisher name is required field");
        } else {
            console.log("Post: Object sent: ", this.state.publisher);
            const options = {
                url: API_PUBLISHER_URL + 'save',
                method: 'POST',
                data: this.state.publisher
            };
            try {
                const res = await request(options);
                if(isSuccessfullResponse(res)){
                    console.log("Post: Object received: ", res.data);
                    const { publisher, navigationDtl } = res.data;
                    this.setState({ publisher, navigationDtl, saveDisabled: true });
                }
            } catch (error) {
                console.log(error);

            }
        }
    }

    savePublisherShowMessage = async (message) => {
        try {
            await this.savePublisher();
        } catch (error) {
            console.log(error);
        }
        toast.success(message);
    }

    deletePublisher = async () => {
        if (this.state.publisher.publisherId != null) {
            console.log("Delete: Publisher ID sent: ", this.state.publisher.publisherId);
            const options = {
                url: API_PUBLISHER_URL + 'delete/' + this.state.publisher.publisherId,
                method: 'DELETE'
            };
            try {
                const res = await request(options);
                if(isSuccessfullResponse(res)){
                    console.log("Delete: Response: ", res);
                    const { publisher, navigationDtl } = res.data;
                    this.setState({ publisher, navigationDtl, saveDisabled: true });
                }
            } catch (error) {
                console.log(error);

            }
        }
        this.setState({
            publisherAlert: false
        });
    }

    navigatePublisher = async (operation) => {
        const options = {
            url: API_PUBLISHER_URL + operation,
            method: 'GET'
        };
        try {
            const res = await request(options);
            if(isSuccessfullResponse(res)){
                const { publisher, navigationDtl } = res.data;
                this.setState({ publisher, navigationDtl })
                console.log(this.state.publisher);
            }
        } catch (error) {
            console.log(error);
        }
    }

    saveAndNavigatePublisher = async (operation) => {
        const { saveDisabled } = this.state;
        if (!saveDisabled) {
            try {
                await this.savePublisher();
            } catch (error) {
                console.log(error);
            }
            this.navigatePublisher(operation);
        } else {
            this.navigatePublisher(operation);
        }
    }

    firstPublisher = () => {
        this.saveAndNavigatePublisher('first');
    }

    previousPublisher = () => {
        this.saveAndNavigatePublisher('previous');
    }

    nextPublisher = () => {
        this.saveAndNavigatePublisher('next');
    }

    lastPublisher = () => {
        this.saveAndNavigatePublisher('last');
    }

    undoChanges = () => {
        const publisher = { ...this.state.publisher };
        console.log("Publisher ID: ", publisher.publisherId);
        this.setState({ saveDisabled: true });
        if (publisher.publisherId != null) {
            const operation = publisher.publisherId;
            this.saveAndNavigatePublisher(operation);
        } else {
            this.firstPublisher();
        }
    }

    publisherCategories = () => {
        const data = [];
        const options = {
            url: API_PUBLISHER_URL + 'cats',
            method: 'GET'
        };
        request(options)
            .then(res => {
                res.data.forEach(element => {
                    data.push(element);
                });
            })
            .catch(err => {
                console.log(err);
            });

        return data;
    }

    publisherUOMs = () => {
        const data = [];
        const options = {
            url: API_PUBLISHER_URL + 'uoms',
            method: 'GET'
        };
        request(options)
            .then(res => {
                res.data.forEach(element => {
                    data.push(element);
                });
            })
            .catch(err => {
                console.log(err);
            });

        return data;
    }

    render() {
        const { publisher, navigationDtl } = this.state;

        const cats = this.publisherCategories();
        const uoms = this.publisherUOMs();

        const inputGroupTextStyle = {
            width: "180px"
        }

        const stretchStyle = {
            flex: "1"
        }

        const smallButtonStyle = {
            width: "7%"
        }

        return (
            <>
                <Form>
                    <InputGroup className="mb-3">
                        <InputGroup.Prepend>
                            <InputGroup.Text style={inputGroupTextStyle}>Publisher ID</InputGroup.Text>
                        </InputGroup.Prepend>
                        <FormControl
                            name="publisherId"
                            placeholder="Publisher ID"
                            aria-label="Publisher ID"
                            readOnly
                            value={publisher.publisherId || ''}
                            onChange={this.handlePublisherChange}
                        />
                    </InputGroup>

                    <InputGroup className="mb-3">
                        <InputGroup.Prepend>
                            <InputGroup.Text style={inputGroupTextStyle}>Publisher Name</InputGroup.Text>
                        </InputGroup.Prepend>
                        <FormControl
                            name="publisherName"
                            placeholder="Publisher Name"
                            aria-label="Publisher Name"
                            value={publisher.publisherName || ''}
                            required
                            onChange={this.handlePublisherChange}
                        />
                    </InputGroup>

                    <ButtonToolbar className="m-2">
                        <Button
                            variant="primary"
                            disabled={navigationDtl.first}
                            onClick={this.firstPublisher}
                            className="mr-1" style={smallButtonStyle}
                            active>First
                            </Button>

                        <Button
                            variant="primary"
                            disabled={navigationDtl.first}
                            onClick={this.previousPublisher}
                            className="mr-1" style={smallButtonStyle}
                            active>Previous
                            </Button>

                        <Button
                            variant="primary"
                            disabled={navigationDtl.last}
                            onClick={this.nextPublisher}
                            className="mr-1" style={smallButtonStyle}
                            active>Next
                            </Button>

                        <Button
                            variant="primary"
                            disabled={navigationDtl.last}
                            onClick={this.lastPublisher}
                            className="mr-1" style={smallButtonStyle}
                            active>Last
                            </Button>

                    </ButtonToolbar>

                    <ButtonToolbar className="ml-2">
                        <Button
                            variant="primary"
                            // disabled={navigationDtl.first}
                            onClick={this.newPublisher}
                            className="mr-1" style={smallButtonStyle}
                            active>Add
                            </Button>

                        <Button
                            variant="primary"
                            // disabled={navigationDtl.first}
                            onClick={() => this.setState({ publisherAlert: true })}
                            className="mr-1" style={smallButtonStyle}
                            active>Delete
                            </Button>

                        <Button
                            variant="primary"
                            onClick={() => this.savePublisherShowMessage("Publisher saved successfully.")}
                            className="mr-1" style={smallButtonStyle}
                            disabled={this.state.saveDisabled}
                            active>Save
                            </Button>

                        <Button
                            variant="primary"
                            /* disabled={navigationDtl.last} */
                            onClick={this.undoChanges}
                            className="mr-1" style={smallButtonStyle}
                            active>Undo
                            </Button>

                        <SweetAlert
                            show={this.state.publisherAlert}
                            warning
                            showCancel
                            confirmBtnText="Delete"
                            confirmBtnBsStyle="danger"
                            cancelBtnBsStyle="default"
                            title="Delete Confirmation"
                            Text="Are you sure you want to delete this publisher?"
                            onConfirm={() => this.deletePublisher()}
                            onCancel={() => this.setState({ publisherAlert: false })}
                        >
                            Delete Publisher
                                </SweetAlert>
                    </ButtonToolbar>
                </Form>
            </>
        );
    }
}

export default Publisher;