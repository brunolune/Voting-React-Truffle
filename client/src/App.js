import React, { Component } from "react";
import 'bootstrap/dist/css/bootstrap.min.css';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import Card from 'react-bootstrap/Card';
import ListGroup from 'react-bootstrap/ListGroup';
import Table from 'react-bootstrap/Table';
// import Whitelist from "./contracts/Whitelist.json";
//import Migrations from ".contracts/Migrations.json";
import Voting from "./contracts/Voting.json";
import getWeb3 from "./getWeb3";
import "./App.css";
import Liste from "./components/Liste";
import Bouton from "./components/Bouton";

class App extends Component {
  state = { web3: null, accounts: null, contract: null, whitelist: null, owner:null, status:null};

  componentWillMount = async () => {
    try {
      // Récupérer le provider web3
      const web3 = await getWeb3();
      console.log("web3=",web3)
  
      // Utiliser web3 pour récupérer les comptes de l’utilisateur (MetaMask dans notre cas) 
      const accounts = await web3.eth.getAccounts();
      console.log("accounts[0]=",accounts[0])

      // Récupérer l’instance du smart contract “Whitelist” avec web3 et les informations du déploiement du fichier (client/src/contracts/Whitelist.json)
      const networkId = await web3.eth.net.getId();
      console.log("networkId=",networkId)

      const deployedNetwork = Voting.networks[networkId];
      console.log("deployedNetwork=",deployedNetwork)
      const instance = new web3.eth.Contract(
        Voting.abi,deployedNetwork.address
      );
      console.log("contrat=",instance)
      // Set web3, accounts, and contract to the state, and then proceed with an
      // example of interacting with the contract's methods.
      const owner = await instance.methods.owner().call();
      console.log("owner=",owner);
      this.setState({ web3, accounts, contract:instance, owner:owner }, this.runInit);
      // const owner = await this.state.contract.methods.owner().call();
      // console.log(this.state.accounts[0])
      // console.log("owner=",owner);
    } catch (error) {
      // Catch any errors for any of the above operations.
      alert(
        `Non-Ethereum browser detected. Can you please try to install MetaMask before starting.`,
      );
      console.error(error);
    }
  };

  runInit = async() => {
    const { contract } = this.state;
  
    // récupérer la liste des comptes autorisés
    const whitelist = await contract.methods.getwhitelistarray().call();
    // Mettre à jour le state 
    this.setState({ whitelist: whitelist });
    this.getstatus();
    console.log("whitelist[0]=",whitelist[0]);
  }; 

  getstatus = async() => {
    const { contract } = this.state;
    const currentStatus = await contract.methods.getVoteStatus().call();
    this.setState({ status: currentStatus });
    console.log("status:",currentStatus)
  }

  whitelist = async() => {
    const { contract } = this.state;
    const address = this.address.value;
    
    // Interaction avec le smart contract pour ajouter un compte 
    await contract.methods.A_votersRegistration(address).send();
    // Récupérer la liste des comptes autorisés
    this.runInit();
  }
 
  onAction = async() => {
    const { contract, status } = this.state;
    this.getstatus();
    let currentStatus = status;
    console.log("status onAction:",currentStatus)
    if (currentStatus==="RegisteringVoters"){
      await contract.methods.B_proposalsRegistrationStart().send();
    }
    else if(currentStatus==="ProposalsRegistrationStarted"){
      await contract.methods.D_proposalsRegistrationTermination().send();
    }
    else if(currentStatus==="ProposalsRegistrationEnded"){
      await contract.methods.E_votingTimeStart().send();
    }
    else if(currentStatus==="VotingSessionStarted"){
      await contract.methods.G_votingTimeTermination().send();
    }
    else if(currentStatus==="VotingSessionEnded"){
      await contract.methods.G_votingTimeTermination().send();
    }
    else {
      await contract.methods.H_CountVotes().send();
    } 
  }

  render() {
    const { whitelist, status } = this.state;
    
    // const isOwner = (this.state.accounts[0]==whitelist[0]);
    if (!this.state.web3 || !this.state.status) {
      return <div>Loading Web3, accounts, and contract...</div>;
    }
    else if (this.state.accounts[0]===this.state.owner) { //'0x75D846154589776adC82F8e94E0FF3BAF80fb06F'
      return (
        <div className="App">
        <div>
            <h2 className="text-center">Voting Dapp</h2>
            <hr></hr>
            <br></br>
        </div>
        <Liste whitelist={whitelist} status={status}/>
        <br></br>
        <div style={{display: 'flex', justifyContent: 'center'}}>
          <Card style={{ width: '50rem' }}>
            <Card.Header><strong>Autoriser un nouveau compte</strong></Card.Header>
            <Card.Body>
              <Form.Group controlId="formAddress">
                <Form.Control type="text" id="address"
                ref={(input) => { this.address = input }}
                />
              </Form.Group>
              <Button onClick={ this.whitelist } variant="dark" > Autoriser </Button>
            </Card.Body>
          </Card>
          </div>
          <br></br>
          <Bouton onClick={this.onAction}/>
        <br></br>
      </div>
    )}
    else{
      return (
        <div className="App">
          <div>
              <h2 className="text-center">Voting Dapp</h2>
              <hr></hr>
              <br></br>
          </div>
          <div style={{display: 'flex', justifyContent: 'center'}}>
            <Card style={{ width: '50rem' }}>
              <Card.Header><strong>Liste des propositions</strong></Card.Header>
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
                        {whitelist !== null && 
                          whitelist.map((a) => <tr><td>{a}</td></tr>)
                        }
                      </tbody>
                    </Table>
                  </ListGroup.Item>
                </ListGroup>
              </Card.Body>
            </Card>
          </div>
          <br></br>
          <div style={{display: 'flex', justifyContent: 'center'}}>
            <Card style={{ width: '50rem' }}>
              <Card.Header><strong>Autoriser un nouveau compte</strong></Card.Header>
              <Card.Body>
                <Form.Group controlId="formAddress">
                  <Form.Control type="text" id="address"
                  ref={(input) => { this.address = input }}
                  />
                </Form.Group>
                <Button onClick={ this.whitelist } variant="dark" > Autoriser </Button>
              </Card.Body>
            </Card>
            </div>
            <br></br>          
        </div>
      );
    }
  }
}

export default App;