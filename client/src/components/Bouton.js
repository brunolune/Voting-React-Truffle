import React, { Component } from 'react';
import Button from 'react-bootstrap/Button';


// Bouton de controle de l'administrateur
class Bouton extends Component {

    action = event => {
        // event.preventDefault();
        this.props.onClick();
    };

    render() {
        //l'affichage change en fonction des phases du vote
        let currentStatus = this.props.status;
        console.log("status Bouton=",currentStatus);
        let titre = "";      
        if (currentStatus==="RegisteringVoters"){
            titre = "Start Proposals Registration";
        }
        else if(currentStatus==="ProposalsRegistrationStarted"){
            titre = "Stop Proposals Registration";
        }
        else if(currentStatus==="ProposalsRegistrationEnded"){
            titre = "Start Voting Session";
        }
        else if(currentStatus==="VotingSessionStarted"){
            titre = "Stop Voting Session";
        }
        else {
            titre = "Count Votes";
        }
        return (
            <>
                <Button onClick={this.action} variant={"danger"} size="lg"> {titre} </Button>
            </>
        );
    }
}

export default Bouton;