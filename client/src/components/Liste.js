import React, { Component } from 'react';
import Card from 'react-bootstrap/Card';
import ListGroup from 'react-bootstrap/ListGroup';
import Table from 'react-bootstrap/Table';

class Liste extends Component {
    
    render() {
        let currentStatus = this.props.status;
        let titre = "list of proposals";
        let liste = this.props.proposals;
        if (currentStatus==="RegisteringVoters"){
            titre = "list of voters";
            liste = this.props.whitelist;
        } 
        return (
            <div>
                <div style={{display: 'flex', justifyContent: 'center'}}>
                <Card style={{ width: '50rem' }}>
                    <Card.Header><strong>{titre}</strong></Card.Header>
                    <Card.Body>
                    <ListGroup variant="flush">
                        <ListGroup.Item>
                        <Table striped bordered hover>
                            <thead>
                            <tr>
                                <th>@</th>
                            </tr>
                            </thead>
                            <tbody>
                            {liste !== null && 
                                liste.map((a) => <tr><td>{a}</td></tr>)
                            }
                            </tbody>
                        </Table>
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