import React, { Component } from 'react';
import { InputGroup, FormControl, Button, ButtonToolbar, Form } from 'react-bootstrap'
import SweetAlert from 'react-bootstrap-sweetalert'
import { toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import 'react-widgets/dist/css/react-widgets.css'
import Select from 'react-select'
import Moment from 'moment'
import PoDtl from './poDtl'
import { request, isSuccessfullResponse } from './util/APIUtils'
import { API_PO_INVOICE_URL, API_PARTY_URL } from './constant'

class PO extends Component {

    state = {
        invoice: {},
        navigationDtl: {},
        parties: [],
        partyName: "",
        invoiceAlert: false,
        saveDisabled: true
    }

    async componentDidMount() {
        try {
            await this.populateParties();
            this.firstInvoice();
        } catch (error) {
            console.log(error);
        }
    }

    async populateParties() {
        console.log("Start populate parties");

        const parties = [];
        const options = {
            url: API_PARTY_URL + 'all',
            method: 'GET'
        };
        try {
            const res = await request(options);
            if(isSuccessfullResponse(res)){
                console.log("Stop populate parties");
                res.data.forEach(element => {
                    parties.push({
                        value: element.partyCode,
                        label: element.partyName
                    });
                });
            }
        } catch (error) {
            console.log(error);
        }
        this.setState({ parties });
    }

    populatePartyName = (partyCode) => {
        console.log("populatePartyName called");
        console.log("Party Code: ", partyCode);

        let parties = [...this.state.parties];

        const result = parties.filter(party => party.value === partyCode);
        if (result[0] !== undefined) {
            let partyName = result[0].label;
            this.setState({ partyName });
        }

    }

    navigateInvoice = async (operation) => {
        const options = {
            url: API_PO_INVOICE_URL + operation,
            method: 'GET'
        };
        try {
            const res = await request(options);
            if(isSuccessfullResponse(res)){
                const { invoice, navigationDtl } = res.data;
                this.populatePartyName(invoice.party);
                this.setState({ invoice, navigationDtl });
            }
        } catch (error) {
            console.log(error);
        }
    }

    saveAndNavigateInvoice = async (operation) => {
        const { saveDisabled } = this.state;
        if (!saveDisabled) {
            try {
                await this.saveInvoice();
            } catch (error) {
                console.log(error);
            }
            this.navigateInvoice(operation);
        } else {
            this.navigateInvoice(operation);
        }
    }

    handleInvoiceChange = (event) => {
        const { name, value } = event.target;
        console.log("Target name", name);
        console.log(value);
        let invoice = { ...this.state.invoice };
        invoice[name] = value;
        let saveDisabled = { ...this.state.saveDisabled };
        const {invDate, party} = invoice;
        if (invDate === undefined || invDate === null || invDate === '' ||
        party === undefined || party === null || party === '') {
            saveDisabled = true;
        } else {
            saveDisabled = false;
        }
        this.setState({ invoice, saveDisabled });
    }

    handleInvoiceSelectChange = (name, value) => {
        let invoice = { ...this.state.invoice };
        invoice[value.name] = name.value;
        let saveDisabled = { ...this.state.saveDisabled };
        const {invDate, party} = invoice;
        if (invDate === undefined || invDate === null || invDate === '' ||
        party === undefined || party === null || party === '') {
            saveDisabled = true;
        } else {
            saveDisabled = false;
        }
        this.setState({ invoice, saveDisabled });
        this.populatePartyName(invoice.party);
    }

    handleInvoiceComboboxChange = (value, name) => {
        let invoice = { ...this.state.invoice };
        invoice[name] = value;
        let saveDisabled = { ...this.state.saveDisabled };
        const {invDate, party} = invoice;
        if (invDate === undefined || invDate === null || invDate === '' ||
        party === undefined || party === null || party === '') {
            saveDisabled = true;
        } else {
            saveDisabled = false;
        }
        this.setState({ invoice, saveDisabled });
    }

    newInvoice = () => {
        const currDate = this.getCurrentDate();
        const party = this.state.parties[0].value;
        console.log("Party:", party);
        this.populatePartyName(party);
        const invoice = { invType: 'PO', invDate: currDate, party };
        invoice.invoiceDtls = [];
        this.setState({ invoice, navigationDtl: { first: true, last: true } });
    }

    saveInvoice = async () => {
		const {invDate, party} = this.state.invoice;
        if (invDate === undefined || invDate === null || invDate === '') {
            toast.error("PO date is required field");
        } else if (party === undefined || party === null || party === '') {
            toast.error("Party is required field");
        } else {
            console.log("Post: Object sent: ", this.state.invoice);
            const options = {
                url: API_PO_INVOICE_URL + 'save',
                method: 'POST',
                data: this.state.invoice
            };
            try {
                const res = await request(options);
                if(isSuccessfullResponse(res)){
                    console.log("Post: Object received: ", res.data);
                    const { invoice, navigationDtl } = res.data;
                    this.setState({ invoice, navigationDtl, invoiceDetails: invoice.invoiceDtls, saveDisabled: true });
                }
            } catch (error) {
                console.log(error);
            }
        }
    }

    saveInvoiceShowMessage = async (message) => {
        try {
            await this.saveInvoice();
        } catch (error) {
            console.log(error);
            
        }
            toast.success(message);
        }

    deleteInvoice = async () => {
        if (this.state.invoice.invoiceCode != null) {
            console.log("Delete: Invoice Code sent: ", this.state.invoice.invoiceCode);
            const options = {
                url: API_PO_INVOICE_URL + 'delete/' + this.state.invoice.invoiceCode,
                method: 'DELETE'
            };
            try {
                const res = await request(options);
                if(isSuccessfullResponse(res)){
                    console.log("Delete: Response: ", res);
                    const { invoice, navigationDtl } = res.data;
                    this.setState({ invoice, navigationDtl, invoiceDetails: invoice.invoiceDtls, saveDisabled: true });
                }
            } catch (error) {
                console.log(error);
            }
        }
        this.setState({
            invoiceAlert: false
        });
    }

    firstInvoice = () => {
        this.navigateInvoice('first');
    }

    previousInvoice = () => {
        this.navigateInvoice('previous');
    }

    nextInvoice = () => {
        this.navigateInvoice('next');
    }

    lastInvoice = () => {
        this.navigateInvoice('last');
    }

    undoChanges = () => {
        this.setState({saveDisabled: true});
        if (this.state.invoice.invoiceCode != null) {
            console.log("Invoice Code: ", this.state.invoice.invoiceCode);
            let url = '' + this.state.invoice.invoiceCode;
            this.navigateInvoice(url);
        } else {
            this.firstInvoice();
        }
    }

    addDetailsIntoInvoice = (details) => {
        let invoice = { ...this.state.invoice };
        invoice.invoiceDtls = details;
        this.setState({ invoice });
    }

    getCurrentDate = () => {
        const curr = new Date();
        /* const jsonDate = await curr.toJSON().slice(0,10);
        console.log("Current Date:", jsonDate);
        return jsonDate; */
        const currDate = Moment(curr).format('YYYY-MM-DD');
        console.log("Current Date:", currDate);
        return currDate;
        // const currDate = curr.toISOString().substr(0, 10);
    }

    render() {
        const { invoice, navigationDtl, parties, partyName } = this.state;
        

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
                            <InputGroup.Text style={inputGroupTextStyle}>PO No.</InputGroup.Text>
                        </InputGroup.Prepend>
                        <FormControl
                            name="invNum"
                            placeholder="PO No."
                            aria-label="PO No."
                            readOnly
                            value={invoice.invNum || ''}
                            onChange={this.handleInvoiceChange}
                        />
                    </InputGroup>
                    <InputGroup className="mb-3">
                        <InputGroup.Prepend>
                            <InputGroup.Text style={inputGroupTextStyle}>PO Date</InputGroup.Text>
                        </InputGroup.Prepend>
                        <FormControl
                            type="date"
                            name="invDate"
                            placeholder="PO Date"
                            aria-label="PO Date"
                            onSelect={this.handleInvoiceChange}
                            value={invoice.invDate != null ? invoice.invDate.split("T")[0] : ''}
                            required
                            onChange={this.handleInvoiceChange}
                        />
                    </InputGroup>

                    <InputGroup className="mb-3">
                        <InputGroup.Prepend>
                            <InputGroup.Text style={inputGroupTextStyle}>Party</InputGroup.Text>
                        </InputGroup.Prepend>
                        <div style={stretchStyle}>
                            <Select
                                name="party"
                                placeholder="Select Party"
                                aria-label="Select Party"
                                value={{ value: invoice.party || '', label: partyName || '' }}
                                /* getOptionLabel={option => option.label}
                                getOptionValue={option => option.value} */
                                onChange={(name, value) => this.handleInvoiceSelectChange(name, value)}
                                clearable={true}
                                options={parties}
                            />
                        </div>
                    </InputGroup>


                    <InputGroup className="mb-3">
                        <InputGroup.Prepend>
                            <InputGroup.Text style={inputGroupTextStyle}>Advance Paid</InputGroup.Text>
                        </InputGroup.Prepend>
                        <FormControl
                            type="number"
                            name="paidAmt"
                            placeholder="Paid Amount"
                            aria-label="Paid Amount"
                            value={invoice.paidAmt || ''}
                            onChange={this.handleInvoiceChange}
                        />
                    </InputGroup>

                    <InputGroup className="mb-3">
                        <InputGroup.Prepend>
                            <InputGroup.Text style={inputGroupTextStyle}>Remarks</InputGroup.Text>
                        </InputGroup.Prepend>
                        <FormControl
                            as="textarea"
                            rows="3"
                            name="remarks"
                            placeholder="Remarks"
                            aria-label="Remarks"
                            value={invoice.remarks || ''}
                            onChange={this.handleInvoiceChange}
                        />
                    </InputGroup>

                    <ButtonToolbar className="m-2">
                        <Button
                            variant="primary"
                            disabled={navigationDtl.first}
                            onClick={this.firstInvoice}
                            className="mr-1" style={smallButtonStyle}
                            active>First
                            </Button>

                        <Button
                            variant="primary"
                            disabled={navigationDtl.first}
                            onClick={this.previousInvoice}
                            className="mr-1" style={smallButtonStyle}
                            active>Previous
                            </Button>

                        <Button
                            variant="primary"
                            disabled={navigationDtl.last}
                            onClick={this.nextInvoice}
                            className="mr-1" style={smallButtonStyle}
                            active>Next
                            </Button>

                        <Button
                            variant="primary"
                            disabled={navigationDtl.last}
                            onClick={this.lastInvoice}
                            className="mr-1" style={smallButtonStyle}
                            active>Last
                            </Button>

                    </ButtonToolbar>

                    <ButtonToolbar className="ml-2">
                        <Button
                            variant="primary"
                            // disabled={navigationDtl.first}
                            onClick={this.newInvoice}
                            className="mr-1" style={smallButtonStyle}
                            active>Add
                            </Button>

                        <Button
                            variant="primary"
                            // disabled={navigationDtl.first}
                            onClick={() => this.setState({ invoiceAlert: true })}
                            className="mr-1" style={smallButtonStyle}
                            active>Delete
                            </Button>

                        <Button
                            variant="primary"
                            onClick={() => this.saveInvoiceShowMessage("Invoice saved successfully.")}
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
                            show={this.state.invoiceAlert}
                            warning
                            showCancel
                            confirmBtnText="Delete"
                            confirmBtnBsStyle="danger"
                            cancelBtnBsStyle="default"
                            title="Delete Confirmation"
                            Text="Are you sure you want to delete this invoice? It will also delete all invoice details related to it."
                            onConfirm={() => this.deleteInvoice()}
                            onCancel={() => this.setState({ invoiceAlert: false })}
                        >
                            Delete Invoice
                                </SweetAlert>
                    </ButtonToolbar>
                    <br />

                    <PoDtl invoice={invoice} addDetailsIntoInvoice={this.addDetailsIntoInvoice} />
                </Form>
            </>
        );
    }
}

export default PO;