import React, { Component } from 'react';
import Card from 'react-bootstrap/Card';
import ListGroup from 'react-bootstrap/ListGroup';
import Table from 'react-bootstrap/Table';

// Component Liste sert pour l'affichage des listes 
//d'électeurs autorisés et des propositions
class Liste extends Component {
    
    render() {
        //L'affichage change en fonction des phases du vote
        let currentStatus = this.props.status;
        let titre = "List of proposals";
        let liste = this.props.proposals;
        //resultsarray doit être défini pour l'affichage avant les résultats 
        let resultsarray= new Array(liste.length).fill(false);
        let content = "Proposals";
        if (currentStatus==="RegisteringVoters"){
            titre = "List of Voters";
            liste = this.props.whitelist;
            resultsarray = new Array(liste.length).fill(false);
            content = "Voters";
        } 
        if (currentStatus==="VotesTallied"){
            titre= "Winning Proposals";
            resultsarray = this.props.resultsarray;
        }
        //affichage des résultats en changeant le background des propositions gagnantes
        return (
            <div>
                <div style={{display: 'flex', justifyContent: 'center'}}>
                <Card style={{ width: '50rem' }}>
                    <Card.Header ><strong>{titre}</strong></Card.Header>
                    <Card.Body>
                    <ListGroup variant="flush">
                        <ListGroup.Item>
                        {(this.props.status !== "VotesTallied" || resultsarray===null) && (    
                        <Table striped bordered hover>
                            <thead>
                            <tr>
                                <th>#</th>
                                <th>{content}</th>
                            </tr>
                            </thead>
                            <tbody>                            
                            {liste !== null && 
                                liste.map((a, id) => 
                                    <tr style= {{'background':'white'}}> 
                                    <td >{id}</td>
                                    <td>{a}</td>
                                    </tr>)
                            }                 
                            </tbody>
                        </Table>
                        )}
                        {(this.props.status === "VotesTallied" && resultsarray!==null) && (    
                        <Table striped bordered hover>
                            <thead>
                            <tr>
                                <th>#</th>
                                <th>{content}</th>
                            </tr>
                            </thead> 
                            <tbody>                            
                            {liste !== null && 
                                liste.map((a, id) => 
                                    <tr style={ resultsarray[id] ? {'background':'green','color':'white'} : {'background':'white','color':'black'}}>                                     
                                    <td >{id}</td>
                                    <td>{a}</td>
                                    </tr>)
                            }                 
                            </tbody>
                        </Table>
                        )}
                        </ListGroup.Item>
                    </ListGroup>
                    </Card.Body>
                </Card>
                </div>
            </div>
        );
    }
}


export default Liste;