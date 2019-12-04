import React, { Component } from 'react';
import { FormControl, Button, ButtonToolbar, Table } from 'react-bootstrap'
import SweetAlert from 'react-bootstrap-sweetalert'
import 'react-toastify/dist/ReactToastify.css'
import 'react-widgets/dist/css/react-widgets.css'
import Select from 'react-select'
import { request, isSuccessfullResponse } from './util/APIUtils'
import { API_AUTHOR_URL, API_INVOICE_DTL_URL } from './constant'

class PoDtl extends Component {
    state = {
        invoice: {},
        items: [],
        invoiceDtlAlert: false,
        invoiceDtlIndex: 0
    }

    async componentDidMount() {
        try {
            await this.populateItems();
        } catch (error) {
            console.log(error);
        }
    }

    componentWillReceiveProps(props) {
        // You don't have to do this check first, but it can help prevent an unneeded render
        if (props.invoice !== this.state.invoice) {
            const { invoice } = props;
            console.log("Invoice", invoice);

            this.setState({ invoice });
        }
    }

    handleInvoiceDetailsSelectChange = async (name, value) => {
        console.log("handleInvoiceDetailsSelectChange start");

        const invoice = { ...this.state.invoice };
        const invoiceDetails = invoice.invoiceDtls;
        invoiceDetails[this.state.invoiceDtlIndex][value.name] = name.value;
        const currRow = invoiceDetails[this.state.invoiceDtlIndex];
        try {
            const itemPrice = await this.populateItemPrice(currRow['item']);
            console.log("Item Price:", itemPrice);
            if (null !== itemPrice) {
                currRow['itemPrice'] = itemPrice;
            }
        } catch (error) {
            console.log(error);
        }
        invoice.invoiceDtls = invoiceDetails;
        try {
            await this.props.addDetailsIntoInvoice(invoiceDetails);
            this.setState({ invoice });
            console.log("handleInvoiceDetailsSelectChange end");
        } catch (error) {
            console.log(error);
        }
    }

    handleInvoiceDetailsComboboxChange = (value, name) => {
        const invoice = { ...this.state.invoice };
        const invoiceDetails = invoice.invoiceDtls;
        invoiceDetails[this.state.invoiceDtlIndex][name] = value;
        invoice.invoiceDtls = invoiceDetails;
        this.setState({ invoice });
    }

    async populateItems() {
        let items = [];
        const options = {
            url: API_AUTHOR_URL + 'all',
            method: 'GET'
        };
        try {
            const res = await request(options);
            if(isSuccessfullResponse(res)){
                res.data.forEach(element => {
                    items.push({
                        value: element.itemCode,
                        label: element.itemDesc,
                        uom: element.itemUom,
                        salePrice: element.salePrice
                    });
                });
            }
        } catch (error) {
            console.log(error);
        }
        this.setState({ items });
        console.log("Items: ", items);

    }

    populateItemDesc(itemCode) {
        console.log("populateItemDesc start");
        console.log("Item Code:", itemCode);

        let items = [...this.state.items];
        const result = items.filter(item => item.value === itemCode);
        if (result[0] !== undefined) {
            return result[0].label;
        }
        console.log("populateItemDesc end");
    }

    populateItemUOM(itemCode) {
        console.log("populateItemUOM start");
        console.log("Item Code:", itemCode);

        let items = [...this.state.items];
        const result = items.filter(item => item.value === itemCode);
        if (result[0] !== undefined) {
            return result[0].uom;
        }
        console.log("populateItemUOM end");
    }

    populateItemPrice(itemCode) {
        console.log("populateItemPrice start");
        console.log("Item Code:", itemCode);

        let items = [...this.state.items];
        const result = items.filter(item => item.value === itemCode);
        if (result[0] !== undefined) {
            return result[0].salePrice;
        }
        console.log("populateItemPrice end");
    }

    handleinvoiceDtlChange = async (event, index) => {
        const { name, value } = event.target;
        const invoice = this.state.invoice;
        const invoiceDetails = invoice.invoiceDtls;
        console.log("Target name", name);
        console.log("Index: ", index);
        console.log("Value: ", value);
        console.log("Cell old value: ", invoiceDetails[index][name]);
        invoiceDetails[index][name] = value;
        invoice.invoiceDtls = invoiceDetails;
        try {
            await this.props.addDetailsIntoInvoice(invoiceDetails);
            this.setState({ invoice });
        } catch (error) {
            console.log(error);
        }
    }

    addinvoiceDtl = async () => {
        let invoice = { ...this.state.invoice };
        let newinvoiceDtl = {};
        let invoiceDetails = invoice.invoiceDtls;
        invoiceDetails.push(newinvoiceDtl);
        invoice.invoiceDtls = invoiceDetails;
        try {
            await this.props.addDetailsIntoInvoice(invoiceDetails);
            this.setState({ invoice });
        } catch (error) {
            console.log(error);
        }
    }

    deleteinvoiceDtl = async () => {
        let invoice = { ...this.state.invoice };
        let invoiceDetails = invoice.invoiceDtls;
        let id = invoiceDetails[this.state.invoiceDtlIndex]["invoiceDtlId"];
        if (id != null) {
            const options = {
                url: API_INVOICE_DTL_URL + 'delete/' + id,
                method: 'DELETE'
            };
            try {
                const res = await request(options);
                if(isSuccessfullResponse(res)){
                    console.log("Delete: Response: ", res);
                }
            } catch (error) {
                console.log(error);
            }
        }
        invoiceDetails.splice(this.state.invoiceDtlIndex, 1);
        invoice.invoiceDtls = invoiceDetails;
        try {
            await this.props.addDetailsIntoInvoice(invoiceDetails);
            this.setState({ invoice, invoiceDtlAlert: false });
        } catch (error) {
            console.log(error);
        }
    }

    validateRow = (invoiceDetail) => {
        console.log("validateRow start");
        console.log("Row:", invoiceDetail);
        console.log("validateRow end");

    }


    render() {
        const { invoice, items } = this.state;


        const stretchStyle = {
            flex: "1"
        }


        const largeButtonStyle = {
            width: "15%"
        }

        const inputDateStyle = {
            width: "15%"
        }

        return (
            <>
                <h3 className="text-center h3 mb-4 text-gray-800">Invoice Details</h3>
                <ButtonToolbar className="m-2">
                    <Button
                        variant="primary"
                        // disabled={navigationDtl.first}
                        onClick={this.addinvoiceDtl}
                        className="mr-1" style={largeButtonStyle}
                        active>Add Detail
                        </Button>

                    {/* <Button
                        variant="primary"
                        // disabled={navigationDtl.first}
                        onClick={() => { this.props.saveInvoice("InvoiceDetail saved successfully.") }}
                        className="mr-1" style={largeButtonStyle}
                        active>Save Detail
                                            </Button> */}

                    <Button
                        variant="primary"
                        // disabled={navigationDtl.first}
                        onClick={() => this.setState({ invoiceDtlAlert: true })}
                        className="mr-1" style={largeButtonStyle}
                        active>Delete Detail
                                                    </Button>

                    <SweetAlert
                        show={this.state.invoiceDtlAlert}
                        warning
                        showCancel
                        confirmBtnText="Delete"
                        confirmBtnBsStyle="danger"
                        cancelBtnBsStyle="default"
                        title="Delete Confirmation"
                        Text="Are you sure you want to delete this invoice detail?"
                        onConfirm={() => this.deleteinvoiceDtl()}
                        onCancel={() => this.setState({ invoiceDtlAlert: false })}
                    >
                        Delete Invoice Detail
                                                    </SweetAlert>
                </ButtonToolbar>
                <Table
                    striped
                    bordered
                    hover>
                    <thead>

                        <tr>
                            <th style={inputDateStyle}>Item</th>
                            <th style={inputDateStyle}>U.O.M</th>
                            <th style={stretchStyle}>Price</th>
                            <th style={inputDateStyle}>Quantity</th>
                        </tr>
                    </thead>
                    <tbody>
                        {
                            invoice.invoiceDtls && invoice.invoiceDtls.map((invoiceDetail, index) => (
                                <tr key={invoiceDetail.invoiceDtlId}
                                    onFocus={() => { this.setState({ invoiceDtlIndex: index }) }}
                                    onBlur={this.validateRow(invoiceDetail)} >
                                    <td>
                                        <div style={stretchStyle}>
                                            <Select
                                                name="item"
                                                placeholder="Select Item"
                                                aria-label="Select Item"
                                                value={{ value: invoiceDetail.item || '', label: this.populateItemDesc(invoiceDetail.item) || '' }}
                                                /* getOptionLabel={option => option.label}
                                                getOptionValue={option => option.value} */
                                                onChange={(name, value) => this.handleInvoiceDetailsSelectChange(name, value)}
                                                clearable={true}
                                                options={items}
                                            />
                                        </div>
                                    </td>
                                    <td>
                                        <FormControl
                                            name="uom"
                                            placeholder="U.O.M"
                                            aria-label="U.O.M"
                                            value={this.populateItemUOM(invoiceDetail.item) || ''}
                                            readOnly
                                        />
                                    </td>
                                    <td>
                                        <FormControl
                                            type="number"
                                            name="itemPrice"
                                            placeholder="Item Price"
                                            aria-label="Item Price"
                                            value={invoiceDetail.itemPrice || this.populateItemPrice(invoiceDetail.item) || ''}
                                            required
                                            onChange={e => this.handleinvoiceDtlChange(e, index)}
                                        />
                                    </td>
                                    <td>
                                        <FormControl
                                            type="number"
                                            name="qnty"
                                            placeholder="Quantity"
                                            aria-label="Quantity"
                                            value={invoiceDetail.qnty || ''}
                                            required
                                            onChange={e => this.handleinvoiceDtlChange(e, index)}
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

export default PoDtl;