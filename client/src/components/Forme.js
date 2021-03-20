import React, { Component } from 'react';
// import Button from 'react-bootstrap/Button';
// import Form from 'react-bootstrap/Form';
import Card from 'react-bootstrap/Card';

class Forme extends Component {

    state ={term:""};
    
    onFormSubmit = event => {
        // event.preventDefault();
        this.props.onSubmit(this.state.term);
    }

    render() {
        let currentStatus = this.props.status;
        let titre = "";
        if (currentStatus==="RegisteringVoters"){
            titre = "Add Voters";
        } 
        else if (currentStatus==="ProposalsRegistrationStarted"){
            titre = "Add Proposals";
        } 
        else if (currentStatus==="VotingSessionStarted"){
            titre = "Vote for your favorite proposal (enter its number)";
        }
        return (
            <div>
                 {(this.props.status === "RegisteringVoters" 
                || this.props.status === "ProposalsRegistrationStarted"
                || this.props.status === "VotingSessionStarted") && (
                    <div style={{display: 'flex', justifyContent: 'center'}}>
                        <Card style={{ width: '50rem' }}>
                        <Card.Header><strong>{titre}</strong></Card.Header>
                        <Card.Body>
                        {/* <Form.Group controlId="formAddress">
                            <Form.Control type="text" id="address"
                            ref={(input) => { this.address = input }}
                            />
                        </Form.Group> */}
                        <form onSubmit={this.onFormSubmit}>
                            <div className="field">
                                <input
                                type="text"
                                value={this.state.term}
                                onChange={e => this.setState({term:e.target.value})}
                                size='50'
        
                                />
                            </div>
                        </form>

                        {/* <Button onClick={ this.whitelist } variant="dark" > Add </Button> */}
                        </Card.Body>
                    </Card>
                    </div> 
                     )
                    }

                               
            </div>
        );
    }
}



export default Forme;