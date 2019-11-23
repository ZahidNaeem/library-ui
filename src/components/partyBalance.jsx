import React, { Component } from 'react';
import { FormControl, Button, ButtonToolbar, Table } from 'react-bootstrap'
import SweetAlert from 'react-bootstrap-sweetalert'
import 'react-toastify/dist/ReactToastify.css'
import 'react-widgets/dist/css/react-widgets.css'
import { request, isSuccessfullResponse } from './util/APIUtils'
import { API_PARTY_BALANCE_URL } from './constant'

class PartyBalance extends Component {

    state = {
        party: {},
        balanceAlert: false,
        balanceIndex: null
    }

    componentWillReceiveProps(props) {
        // You don't have to do this check first, but it can help prevent an unneeded render
        if (props.party !== this.state.party) {
            const { party } = props;
            this.setState({ party });
        }
    }
    
    handleBalanceChange = async (event, index) => {
        const { name, value } = event.target;
        let party = this.state.party;
        let balances = party.partyBalances;
        console.log("Target name", name);
        console.log("Index: ", index);
        console.log("Value: ", value);
        console.log("Cell old value: ", balances[index][name]);
        balances[index][name] = value;
        party.partyBalances = balances;
        try {
            await this.props.addBalanceIntoParty(balances);
            this.setState({ party });
        } catch (error) {
            console.log(error);
        }
    }

    addBalance = async () => {
        let party = { ...this.state.party };
        let newBalance = {};
        let balances = party.partyBalances;
        balances.push(newBalance);
        party.partyBalances = balances;
        try {
            await this.props.addBalanceIntoParty(balances);
            this.setState({ party });
        } catch (error) {
            console.log(error);
        }
    }

    deleteBalance = async () => {
        let party = { ...this.state.party };
        let balances = party.partyBalances;
        let id = balances[this.state.balanceIndex]["partyBalanceId"];
        if (id != null) {
            const options = {
                url: API_PARTY_BALANCE_URL + 'delete/' + id,
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
        balances.splice(this.state.balanceIndex, 1);
        party.partyBalances = balances;
        try {
            await this.props.addBalanceIntoParty(balances);
            this.setState({ party, balanceAlert: false });
        } catch (error) {
            console.log(error);
        }
    }


    render() {
        const { party } = this.state;

        const stretchStyle = {
            flex: "1"
        }

        const largeButtonStyle = {
            width: "130px"
        }

        const inputDateStyle = {
            width: "200px"
        }

        return (
            <>
                <h3 className="text-center h3 mb-4 text-gray-800">Party Balances</h3>
                <ButtonToolbar className="m-2">
                    <Button
                        variant="primary"
                        // disabled={navigationDtl.first}
                        onClick={this.addBalance}
                        className="mr-1" style={largeButtonStyle}
                        active>Add Balance
                                            </Button>
                    {/* <Button
                        variant="primary"
                        // disabled={navigationDtl.first}
                        onClick={() => { this.saveParty("Balance saved successfully.") }}
                        className="mr-1" style={largeButtonStyle}
                        active>Save Balance
                                            </Button> */}

                    <Button
                        variant="primary"
                        // disabled={navigationDtl.first}
                        onClick={() => this.setState({ balanceAlert: true })}
                        className="mr-1" style={largeButtonStyle}
                        active>Delete Balance
                                                    </Button>
                    <SweetAlert
                        show={this.state.balanceAlert}
                        warning
                        showCancel
                        confirmBtnText="Delete"
                        confirmBtnBsStyle="danger"
                        cancelBtnBsStyle="default"
                        title="Delete Confirmation"
                        Text="Are you sure you want to delete this balance?"
                        onConfirm={() => this.deleteBalance()}
                        onCancel={() => this.setState({ balanceAlert: false })}
                    >
                        Delete Balance
                                                    </SweetAlert>
                </ButtonToolbar>
                <Table
                    striped
                    bordered
                    hover
                    responsive>
                    <thead>
                        <tr>
                            <th style={inputDateStyle}>Balance Date</th>
                            <th style={inputDateStyle}>Quantity</th>
                            <th style={stretchStyle}>Remarks</th>
                        </tr>
                    </thead>
                    <tbody>
                        {
                            party.partyBalances && party.partyBalances.map((balance, index) => (
                                <tr key={balance.partyBalanceId}
                                    onFocus={() => { this.setState({ balanceIndex: index }) }}>
                                    <td>
                                        <FormControl
                                            type="date"
                                            name="partyBalanceDate"
                                            placeholder="Balance Date"
                                            aria-label="Balance Date"
                                            value={balance.partyBalanceDate != null ? balance.partyBalanceDate.split("T")[0] : ''}
                                            required
                                            onChange={e => this.handleBalanceChange(e, index)}
                                        />
                                    </td>
                                    <td>
                                        <FormControl
                                            type="number"
                                            name="amount"
                                            placeholder="Amount"
                                            aria-label="Amount"
                                            value={balance.amount || ''}
                                            required
                                            onChange={e => this.handleBalanceChange(e, index)}
                                        />
                                    </td>
                                    <td>
                                        <FormControl
                                            type="text"
                                            name="remarks"
                                            placeholder="Remarks"
                                            aria-label="Remarks"
                                            value={balance.remarks || ''}
                                            onChange={e => this.handleBalanceChange(e, index)}
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

export default PartyBalance;