import React, { Component } from "react";
import 'bootstrap/dist/css/bootstrap.min.css';
// import Button from 'react-bootstrap/Button';
// import Form from 'react-bootstrap/Form';
// import Card from 'react-bootstrap/Card';
// import ListGroup from 'react-bootstrap/ListGroup';
// import Table from 'react-bootstrap/Table';
// import Whitelist from "./contracts/Whitelist.json";
//import Migrations from ".contracts/Migrations.json";
import Voting from "./contracts/Voting.json";
import getWeb3 from "./getWeb3";
import "./App.css";
import Liste from "./components/Liste";
import Bouton from "./components/Bouton";
import Forme from "./components/Forme";

class App extends Component {

  state = { web3: null, accounts: null, contract: null, whitelist: null, owner:null, status:null, proposals:null, currentAccount:null};
   

  componentWillMount = async () => {
    try {
      // Récupérer le provider web3
      const web3 = await getWeb3();
      console.log("web3=",web3)
  
      // Utiliser web3 pour récupérer les comptes de l’utilisateur (MetaMask dans notre cas) 
      const accounts = await web3.eth.getAccounts();
      console.log("accounts[0]=",accounts[0])
      this.setState({currentAccount:accounts[0]})

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
      this.setState({ web3, accounts, contract:instance, owner:owner, currentAccount:accounts[0] }, this.runUpdate);      
    } catch (error) {
      // Catch any errors for any of the above operations.
      alert(
        `Non-Ethereum browser detected. Can you please try to install MetaMask before starting.`,
      );
      console.error(error);
    }
  };

  runUpdate = async() => {
    const { contract,currentAccount } = this.state;
    // récupérer la liste des comptes autorisés
    const whitelist = await contract.methods.getwhitelistarray().call();
    const proposals = await contract.methods.getproposalsarray().call();
    // Mettre à jour le state 
    this.setState({ whitelist: whitelist, proposals:proposals });
    this.getstatus();
    // console.log("runUpdate accounts[0] avant=",accounts[0])
    this.getCurrentAccount();
    // console.log("runUpdate accounts[0] apres=",accounts[0])
    console.log("whitelist[0]=",whitelist[0]);
    console.log("currentAccount in runUpdate=",currentAccount);
  }; 

  getstatus = async() => {
    const { contract } = this.state;
    const currentStatus = await contract.methods.getVoteStatus().call();
    this.setState({ status: currentStatus });
    console.log("status ds getstatus:",currentStatus)
  }

  onFormSubmit = async (term) => {
    const { contract, currentAccount, status} = this.state;
    this.getCurrentAccount();
    console.log("onFormSubmit currentAccount apres=",currentAccount)
    console.log("currentAccount in whitelist=",currentAccount);
    if (status==="RegisteringVoters"){
      await contract.methods.A_votersRegistration(term).send({from:currentAccount});
    } 
    else if (status==="ProposalsRegistrationStarted"){
      await contract.methods.C_proposalRegistration(term).send({from:currentAccount});
    }
    else if (status==="VotingSessionStarted"){
      await contract.methods.F_vote(Number(term)).send({from:currentAccount});
    }
    this.runUpdate();
  }

  getCurrentAccount = async() => {
    await window.ethereum.on('accountsChanged', (accounts) => {
      // Time to reload your interface with accounts[0]!
      this.setState({currentAccount:accounts[0]});
      console.log("currentAccount in getcurrentAccount=",accounts[0]);
    }) 
  }
  
  onAction = async() => {
    const { contract, status, currentAccount } = this.state;
    this.getstatus();
    let currentStatus = status;
    console.log("status onAction:",currentStatus)
    if (currentStatus==="RegisteringVoters"){
      await contract.methods.B_proposalsRegistrationStart().send({from:currentAccount});
    }
    else if(currentStatus==="ProposalsRegistrationStarted"){
      await contract.methods.D_proposalsRegistrationTermination().send({from:currentAccount});
    }
    else if(currentStatus==="ProposalsRegistrationEnded"){
      await contract.methods.E_votingTimeStart().send({from:currentAccount});
    }
    else if(currentStatus==="VotingSessionStarted"){
      await contract.methods.G_votingTimeTermination().send({from:currentAccount});
    }
    else if(currentStatus==="VotingSessionEnded"){
      await contract.methods.H_CountVotes().send({from:currentAccount});
      const results = await contract.methods.I_WinningProposalIds().call();
      console.log(results)
    }
    else {
      console.log("C'est fini!")     
    } 
  }

  render() {
    const { whitelist, status, proposals, currentAccount} = this.state;
        
    if (!this.state.web3 || this.state.status===undefined) {
      return <div>Loading Web3, accounts, and contract...</div>;
    }
    else if (currentAccount===this.state.owner) {
      return (
        <div className="App">
        <div>
            <h2 className="text-center">Voting Dapp</h2>
            <hr></hr>
            <br></br>
        </div>
        <Liste whitelist={whitelist} proposals={proposals} status={status}/>
        <br></br>
        <Forme onSubmit={this.onFormSubmit} status={status} />
        <br></br>
        <Bouton onClick={this.onAction} status={status}/>
        <br></br>
      </div>
    )}
    else if (currentAccount!==this.state.owner) {
      return (
        <div className="App">
          <div>
              <h2 className="text-center">Voting Dapp</h2>
              <hr></hr>
              <br></br>
          </div>
          <Liste whitelist={whitelist} proposals={proposals} status={status}/>
          <br></br>
          <Forme onSubmit={this.onFormSubmit} status={status}/>      
        </div>   
      );
    }
  }
}

export default App;