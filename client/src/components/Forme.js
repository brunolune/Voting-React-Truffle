import React, { Component } from 'react';
import Card from 'react-bootstrap/Card';

// Permet d'entrer les electeurs autorises, ainsi que les propositions 
// et les votes des utilisateurs.
class Forme extends Component {

    state ={term:""};
    
    onFormSubmit = event => {
        // event.preventDefault();
        this.props.onSubmit(this.state.term);
    }
    //Ne s'affiche que pendant les phases d'utilisation
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