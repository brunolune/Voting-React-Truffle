import React, { Component } from 'react';
import Button from 'react-bootstrap/Button';

class Bouton extends Component {

    action = event => {
        event.preventDefault();
        this.props.onClick();
    };

    render() {
        let currentStatus = this.props.status;
        console.log("status Bouton=",currentStatus);
        let titre = "";      
        if (currentStatus==="RegisteringVoters"){
            titre = "Stop Voters Registration";
        }
        else if(currentStatus==="ProposalsRegistrationStarted"){
            titre = "Start Proposals Registration";
        }
        else if(currentStatus==="ProposalsRegistrationEnded"){
            titre = "Stop Proposals Registration";
        }
        else if(currentStatus==="VotingSessionStarted"){
            titre = "Start Voting Session";
        }
        else if(currentStatus==="VotingSessionEnded"){
            titre = "Stop Voting Session";
        }
        else {
            titre = "Count Votes";
        }
        return (
            <div>
                <Button onClick={this.action} variant="dark" > {titre} </Button>
            </div>
        );
    }
}

export default Bouton;