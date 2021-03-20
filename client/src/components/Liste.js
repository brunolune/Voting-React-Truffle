import React, { Component } from 'react';
import Card from 'react-bootstrap/Card';
import ListGroup from 'react-bootstrap/ListGroup';
import Table from 'react-bootstrap/Table';

class Liste extends Component {
    
    render() {
        let currentStatus = this.props.status;
        let titre = "List of proposals";
        let liste = this.props.proposals;
        let resultsarray= new Array(liste.length).fill(false);
        let content = "Proposals"
        if (currentStatus==="RegisteringVoters"){
            titre = "List of voters";
            liste = this.props.whitelist;
            resultsarray = new Array(liste.length).fill(false);
            content = "Voters"
        } 
        if (currentStatus==="VotesTallied"){
            resultsarray = this.props.resultsarray;
            console.log("resultsarray dans Liste:",resultsarray);
        }
        
        return (
            <div>
                <div style={{display: 'flex', justifyContent: 'center'}}>
                <Card style={{ width: '50rem' }}>
                    <Card.Header><strong>{titre}</strong></Card.Header>
                    <Card.Body>
                    <ListGroup variant="flush">
                        <ListGroup.Item>
                        {(this.props.status !== "VotesTallied") && (    
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
                        {(this.props.status === "VotesTallied") && (    
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
                                    <tr style={ this.props.results === id ? {background:'red'} : {background:''}}>                                     
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