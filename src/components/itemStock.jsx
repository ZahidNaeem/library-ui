import React, { Component } from 'react';
import { FormControl, Button, ButtonToolbar, Table } from 'react-bootstrap'
import SweetAlert from 'react-bootstrap-sweetalert'
import 'react-toastify/dist/ReactToastify.css'
import 'react-widgets/dist/css/react-widgets.css'
import { request, isSuccessfullResponse } from './util/APIUtils'
import { API_ITEM_STOCK_URL } from './constant'

class ItemStock extends Component {

    state = {
        item: {},
        stockAlert: false,
        stockIndex: null
    }

    componentWillReceiveProps(props) {
        // You don't have to do this check first, but it can help prevent an unneeded render
        if (props.item !== this.state.item) {
            const { item } = props;
            this.setState({ item });
        }
    }

    handleStockChange = async (event, index) => {
        const { name, value } = event.target;
        let item = {...this.state.item};
        let stocks = [...this.state.item.itemStocks];
        console.log("Target name", name);
        console.log("Index: ", index);
        console.log("Value: ", value);
        console.log("Cell old value: ", stocks[index][name]);
        stocks[index][name] = value;
        item.itemStocks = stocks;
        try {
            await this.props.addStockIntoItem(stocks);
        } catch (error) {
            console.log(error);
        }
        this.setState({ item });
    }

    addStock = async () => {
        let item = { ...this.state.item };

        // let itemCode = item.itemCode;
        // let newStock = { item: itemCode };
        let newStock = {};
        let stocks = [...this.state.item.itemStocks];
        stocks.push(newStock);
        item.itemStocks = stocks;
        try {
            await this.props.addStockIntoItem(stocks);
        } catch (error) {
            console.log(error);
        }
        this.setState({ item });
    }

/*     saveStock = () => {
        console.log("Item at save: ", this.state.item);
        this.props.saveItem("Stock saved successfully.");
        
    } */

    deleteStock = async () => {
        let item = { ...this.state.item };
        let stocks = [...this.state.item.itemStocks];
        let id = stocks[this.state.stockIndex]["itemStockId"];
        if (id != null) {
            const options = {
                url: API_ITEM_STOCK_URL + 'delete/' + id,
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
        stocks.splice(this.state.stockIndex, 1);
        item.itemStocks = stocks;
        try {
            await this.props.addStockIntoItem(stocks);
            this.setState({ item, stockAlert: false });
        } catch (error) {
            console.log(error);
        }
    }


    render() {
        const { itemStocks } = this.state.item;

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
                <br />
                <h3 className="text-center h3 mb-4 text-gray-800">Item Stocks</h3>
                <ButtonToolbar className="m-2">
                    <Button
                        variant="primary"
                        // disabled={navigationDtl.first}
                        onClick={this.addStock}
                        className="mr-1" style={largeButtonStyle}
                        active>Add Stock
                                            </Button>

                    {/* <Button
                        variant="primary"
                        // disabled={navigationDtl.first}
                        onClick={this.saveStock}
                        className="mr-1" style={largeButtonStyle}
                        active>Save Stock
                                            </Button> */}

                    <Button
                        variant="primary"
                        // disabled={navigationDtl.first}
                        onClick={() => this.setState({ stockAlert: true })}
                        className="mr-1" style={largeButtonStyle}
                        active>Delete Stock
                                                    </Button>

                    <SweetAlert
                        show={this.state.stockAlert}
                        warning
                        showCancel
                        confirmBtnText="Delete"
                        confirmBtnBsStyle="danger"
                        cancelBtnBsStyle="default"
                        title="Delete Confirmation"
                        Text="Are you sure you want to delete this stock?"
                        onConfirm={() => this.deleteStock()}
                        onCancel={() => this.setState({ stockAlert: false })}
                    >
                        Delete Stock
                                                    </SweetAlert>
                </ButtonToolbar>
                <Table
                    striped
                    bordered
                    hover
                    responsive>
                    <thead>

                        <tr>
                            <th style={inputDateStyle}>Stock Date</th>
                            <th style={inputDateStyle}>Quantity</th>
                            <th style={stretchStyle}>Remarks</th>
                        </tr>
                    </thead>
                    <tbody>
                        {
                            itemStocks && itemStocks.map((stock, index) => (
                                <tr key={stock.itemStockId}
                                    onFocus={() => { this.setState({ stockIndex: index }) }}>
                                    <td>
                                        <FormControl
                                            type="date"
                                            name="itemStockDate"
                                            placeholder="Stock Date"
                                            aria-label="Stock Date"
                                            value={stock.itemStockDate != null ? stock.itemStockDate.split("T")[0] : ''}
                                            required
                                            onChange={e => this.handleStockChange(e, index)}
                                        />
                                    </td>
                                    <td>
                                        <FormControl
                                            type="number"
                                            name="qnty"
                                            placeholder="Stock Quantity"
                                            aria-label="Stock Quantity"
                                            value={stock.qnty || ''}
                                            required
                                            onChange={e => this.handleStockChange(e, index)}
                                        />
                                    </td>
                                    <td>
                                        <FormControl
                                            type="text"
                                            name="remarks"
                                            placeholder="Remarks"
                                            aria-label="Remarks"
                                            value={stock.remarks || ''}
                                            onChange={e => this.handleStockChange(e, index)}
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

export default ItemStock;