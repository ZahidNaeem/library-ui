import React, { Component } from 'react';
import { InputGroup, FormControl, Button, ButtonToolbar, Form } from 'react-bootstrap'
import SweetAlert from 'react-bootstrap-sweetalert'
import { toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import 'react-widgets/dist/css/react-widgets.css'
import { Combobox } from 'react-widgets'
import ItemStock from './itemStock'
import { request, isSuccessfullResponse } from './util/APIUtils'
import { API_ITEM_URL } from './constant'

class Item extends Component {

    state = {
        item: {},
        navigationDtl: {},
        itemAlert: false,
        saveDisabled: true
    }

    componentDidMount() {
        this.firstItem();
    }

    handleItemChange = (event) => {
        const { name, value } = event.target;
        console.log("Target name", name);
        console.log(value);
        const item = { ...this.state.item };
        item[name] = name === 'itemDesc' ? value.toUpperCase() : value;
        let saveDisabled = { ...this.state.saveDisabled };
        if (item.itemDesc === undefined || item.itemDesc === null || item.itemDesc === ''
            || item.itemUom === undefined || item.itemUom === null || item.itemUom === ''
            || item.effectiveStartDate === undefined || item.effectiveStartDate === null || item.effectiveStartDate === '') {
            saveDisabled = true;
        } else {
            saveDisabled = false;
        }
        this.setState({ item, saveDisabled });
    }

    handleComboboxChange = (value, name) => {
        let item = { ...this.state.item };
        item[name] = value.toUpperCase();
        let saveDisabled = { ...this.state.saveDisabled };
        if (item.itemDesc === undefined || item.itemDesc === null || item.itemDesc === ''
            || item.itemUom === undefined || item.itemUom === null || item.itemUom === ''
            || item.effectiveStartDate === undefined || item.effectiveStartDate === null || item.effectiveStartDate === '') {
            saveDisabled = true;
        } else {
            saveDisabled = false;
        }
        this.setState({ item, saveDisabled });
    }

    newItem = () => {
        const item = {};
        item.itemStocks = [];
        this.setState({ item, navigationDtl: { first: true, last: true } });
    }

    saveItem = async () => {
        const { itemDesc, itemUom, effectiveStartDate } = this.state.item;
        if (itemDesc === undefined || itemDesc === null || itemDesc === '') {
            toast.error("Item Desc. is required field");
        } else if (itemUom === undefined || itemUom === null || itemUom === '') {
            toast.error("Item U.O.M is required field");
        } else if (effectiveStartDate === undefined || effectiveStartDate === null || effectiveStartDate === '') {
            toast.error("Eff. start date is required field");
        } else {
            console.log("Post: Object sent: ", this.state.item);
            const options = {
                url: API_ITEM_URL + 'save',
                method: 'POST',
                data: this.state.item
            };
            try {
                const res = await request(options);
                if(isSuccessfullResponse(res)){
                    console.log("Post: Object received: ", res.data);
                    const { item, navigationDtl } = res.data;
                    this.setState({ item, navigationDtl, saveDisabled: true });
                }
            } catch (error) {
                console.log(error);

            }
        }
    }

    saveItemShowMessage = async (message) => {
        try {
            await this.saveItem();
        } catch (error) {
            console.log(error);
        }
        toast.success(message);
    }

    deleteItem = async () => {
        if (this.state.item.itemCode != null) {
            console.log("Delete: Item Code sent: ", this.state.item.itemCode);
            const options = {
                url: API_ITEM_URL + 'delete/' + this.state.item.itemCode,
                method: 'DELETE'
            };
            try {
                const res = await request(options);
                if(isSuccessfullResponse(res)){
                    console.log("Delete: Response: ", res);
                    const { item, navigationDtl } = res.data;
                    this.setState({ item, navigationDtl, saveDisabled: true });
                }
            } catch (error) {
                console.log(error);

            }
        }
        this.setState({
            itemAlert: false
        });
    }

    navigateItem = async (operation) => {
        const options = {
            url: API_ITEM_URL + operation,
            method: 'GET'
        };
        try {
            const res = await request(options);
            if(isSuccessfullResponse(res)){
                const { item, navigationDtl } = res.data;
                this.setState({ item, navigationDtl })
                console.log(this.state.item);
            }
        } catch (error) {
            console.log(error);
        }
    }

    saveAndNavigateItem = async (operation) => {
        const { saveDisabled } = this.state;
        if (!saveDisabled) {
            try {
                await this.saveItem();
            } catch (error) {
                console.log(error);
            }
            this.navigateItem(operation);
        } else {
            this.navigateItem(operation);
        }
    }

    firstItem = () => {
        this.saveAndNavigateItem('first');
    }

    previousItem = () => {
        this.saveAndNavigateItem('previous');
    }

    nextItem = () => {
        this.saveAndNavigateItem('next');
    }

    lastItem = () => {
        this.saveAndNavigateItem('last');
    }

    undoChanges = () => {
        const item = { ...this.state.item };
        console.log("Item Code: ", item.itemCode);
        this.setState({ saveDisabled: true });
        if (item.itemCode != null) {
            const operation = item.itemCode;
            this.saveAndNavigateItem(operation);
        } else {
            this.firstItem();
        }
    }

    itemCategories = () => {
        const data = [];
        const options = {
            url: API_ITEM_URL + 'cats',
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

    itemUOMs = () => {
        const data = [];
        const options = {
            url: API_ITEM_URL + 'uoms',
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

    addStockIntoItem = (stocks) => {
        let item = { ...this.state.item };
        item.itemStocks = stocks;
        this.setState({ item });
    }

    render() {
        const { item, navigationDtl } = this.state;

        const cats = this.itemCategories();
        const uoms = this.itemUOMs();

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
                            <InputGroup.Text style={inputGroupTextStyle}>Item Code</InputGroup.Text>
                        </InputGroup.Prepend>
                        <FormControl
                            name="itemCode"
                            placeholder="Item Code"
                            aria-label="Item Code"
                            readOnly
                            value={item.itemCode || ''}
                            onChange={this.handleItemChange}
                        />

                        <InputGroup.Prepend>
                            <InputGroup.Text style={inputGroupTextStyle}>Item Barcode</InputGroup.Text>
                        </InputGroup.Prepend>
                        <FormControl
                            name="itemBarcode"
                            placeholder="Item Barcode"
                            aria-label="Item Barcode"
                            value={item.itemBarcode || ''}
                            onChange={this.handleItemChange}
                        />
                    </InputGroup>

                    <InputGroup className="mb-3">
                        <InputGroup.Prepend>
                            <InputGroup.Text style={inputGroupTextStyle}>Item Desc.</InputGroup.Text>
                        </InputGroup.Prepend>
                        <FormControl
                            name="itemDesc"
                            placeholder="Item Desc."
                            aria-label="Item Desc."
                            value={item.itemDesc || ''}
                            required
                            onChange={this.handleItemChange}
                        />
                    </InputGroup>

                    <InputGroup className="mb-3">
                        <InputGroup.Prepend>
                            <InputGroup.Text style={inputGroupTextStyle}>Item Category</InputGroup.Text>
                        </InputGroup.Prepend>
                        <Combobox
                            style={stretchStyle}
                            name="itemCategory"
                            placeholder="Select Item Category"
                            aria-label="Item Category"
                            data={cats}
                            value={item.itemCategory || ''}
                            onChange={(name) => this.handleComboboxChange(name, "itemCategory")}
                        />

                        <InputGroup.Prepend>
                            <InputGroup.Text style={inputGroupTextStyle}>Item U.O.M</InputGroup.Text>
                        </InputGroup.Prepend>

                        <Combobox
                            style={stretchStyle}
                            name="itemUom"
                            placeholder="Select Item U.O.M"
                            aria-label="Item U.O.M"
                            data={uoms}
                            value={item.itemUom || ''}
                            required
                            onChange={(name) => this.handleComboboxChange(name, "itemUom")}
                        />
                    </InputGroup>

                    <InputGroup className="mb-3">
                        <InputGroup.Prepend>
                            <InputGroup.Text style={inputGroupTextStyle}>Purchase Price</InputGroup.Text>
                        </InputGroup.Prepend>
                        <FormControl
                            type="number"
                            name="purchasePrice"
                            placeholder="Purchase Price"
                            aria-label="Purchase Price"
                            value={item.purchasePrice || ''}
                            onChange={this.handleItemChange}
                        />

                        <InputGroup.Prepend>
                            <InputGroup.Text style={inputGroupTextStyle}>Sale Price</InputGroup.Text>
                        </InputGroup.Prepend>
                        <FormControl
                            type="number"
                            name="salePrice"
                            placeholder="Sale Price"
                            aria-label="Sale Price"
                            value={item.salePrice || ''}
                            onChange={this.handleItemChange}
                        />
                    </InputGroup>

                    <InputGroup className="mb-3">
                        <InputGroup.Prepend>
                            <InputGroup.Text style={inputGroupTextStyle}>Min. Stock</InputGroup.Text>
                        </InputGroup.Prepend>
                        <FormControl
                            type="number"
                            name="minStock"
                            placeholder="Min. Stock"
                            aria-label="Min. Stock"
                            value={item.minStock || ''}
                            onChange={this.handleItemChange}
                        />

                        <InputGroup.Prepend>
                            <InputGroup.Text style={inputGroupTextStyle}>Max. Stock</InputGroup.Text>
                        </InputGroup.Prepend>
                        <FormControl
                            type="number"
                            name="maxStock"
                            placeholder="Max. Stock"
                            aria-label="Max. Stock"
                            value={item.maxStock || ''}
                            onChange={this.handleItemChange}
                        />
                    </InputGroup>

                    <InputGroup className="mb-3">
                        <InputGroup.Prepend>
                            <InputGroup.Text style={inputGroupTextStyle}>Effective Start Date</InputGroup.Text>
                        </InputGroup.Prepend>
                        <FormControl
                            type="date"
                            name="effectiveStartDate"
                            placeholder="Effective Start Date"
                            aria-label="Effective Start Date"
                            onSelect={this.handleItemChange}
                            value={item.effectiveStartDate != null ? item.effectiveStartDate.split("T")[0] : ''}
                            required
                            onChange={this.handleItemChange}
                        />

                        <InputGroup.Prepend>
                            <InputGroup.Text style={inputGroupTextStyle}>Effective End Date</InputGroup.Text>
                        </InputGroup.Prepend>
                        <FormControl
                            type="date"
                            name="effectiveEndDate"
                            placeholder="Effective End Date"
                            aria-label="Effective End Date"
                            value={item.effectiveEndDate != null ? item.effectiveEndDate.split("T")[0] : ''}
                            onChange={this.handleItemChange}
                        />
                    </InputGroup>

                    <ButtonToolbar className="m-2">
                        <Button
                            variant="primary"
                            disabled={navigationDtl.first}
                            onClick={this.firstItem}
                            className="mr-1" style={smallButtonStyle}
                            active>First
                            </Button>

                        <Button
                            variant="primary"
                            disabled={navigationDtl.first}
                            onClick={this.previousItem}
                            className="mr-1" style={smallButtonStyle}
                            active>Previous
                            </Button>

                        <Button
                            variant="primary"
                            disabled={navigationDtl.last}
                            onClick={this.nextItem}
                            className="mr-1" style={smallButtonStyle}
                            active>Next
                            </Button>

                        <Button
                            variant="primary"
                            disabled={navigationDtl.last}
                            onClick={this.lastItem}
                            className="mr-1" style={smallButtonStyle}
                            active>Last
                            </Button>

                    </ButtonToolbar>

                    <ButtonToolbar className="ml-2">
                        <Button
                            variant="primary"
                            // disabled={navigationDtl.first}
                            onClick={this.newItem}
                            className="mr-1" style={smallButtonStyle}
                            active>Add
                            </Button>

                        <Button
                            variant="primary"
                            // disabled={navigationDtl.first}
                            onClick={() => this.setState({ itemAlert: true })}
                            className="mr-1" style={smallButtonStyle}
                            active>Delete
                            </Button>

                        <Button
                            variant="primary"
                            onClick={() => this.saveItemShowMessage("Item saved successfully.")}
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
                            show={this.state.itemAlert}
                            warning
                            showCancel
                            confirmBtnText="Delete"
                            confirmBtnBsStyle="danger"
                            cancelBtnBsStyle="default"
                            title="Delete Confirmation"
                            Text="Are you sure you want to delete this item? It will also delete all stocks related to it."
                            onConfirm={() => this.deleteItem()}
                            onCancel={() => this.setState({ itemAlert: false })}
                        >
                            Delete Item
                                </SweetAlert>
                    </ButtonToolbar>
                    <ItemStock item={item} saveItem={() => this.saveItemShowMessage("Item saved successfully.")} addStockIntoItem={this.addStockIntoItem} />
                </Form>
            </>
        );
    }
}

export default Item;