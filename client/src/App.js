import React, { Component } from "react";
import 'bootstrap/dist/css/bootstrap.min.css';
import Voting from "./contracts/Voting.json";
import getWeb3 from "./getWeb3";
import "./App.css";
import Liste from "./components/Liste";
import Bouton from "./components/Bouton";
import Forme from "./components/Forme";

// Appli Voting-Dapp du groupe 6: Bruno, Samuel et Liedel.
// Dapp Gestion d'un système de Vote. 
// Défi Alyra Ecole Blockchain (03/2021).

class App extends Component {

  state = { web3: null, accounts: null, contract: null,
     whitelist: null, owner:null, status:null, proposals:null,
     revertError:null, currentAccount:null, resultsarray:null};
   
  componentWillMount = async () => {
    try {
      // Récupérer le provider web3
      const web3 = await getWeb3();
        
      // Utiliser web3 pour récupérer les comptes de l’utilisateur (MetaMask dans notre cas) 
      const accounts = await web3.eth.getAccounts();
      // On initialise currentAccount avec accounts[0]
      this.setState({currentAccount:accounts[0]})

      // Récupérer l’instance du smart contract à partir de l'artifact JSON
      const networkId = await web3.eth.net.getId();
      const deployedNetwork = Voting.networks[networkId];
      console.log("deployedNetwork=",deployedNetwork)
      const instance = new web3.eth.Contract(
        Voting.abi,deployedNetwork.address
      );
      // Pour recuperer les raisons de revert dans les messages d'erreur
      web3.eth.handleRevert = true;
      // Enregistre web3, accounts, l'instance du contract, ainsi que d'autres variables d'état dans le state
      const owner = await instance.methods.owner().call();
      console.log("owner=",owner);
      this.setState({ web3, accounts, contract:instance, owner:owner, currentAccount:accounts[0], proposals:[] }, this.runUpdate);      
    } catch (err) {
      alert(
        `Non-Ethereum browser detected. Can you please try to install MetaMask before starting.`,
      );
      console.error(err);
      this.setState({revertError:err})
    }
  };

  runUpdate = async() => {
    const { contract} = this.state;
    // récupére la liste des comptes des électeurs autorisés
    const whitelist = await contract.methods.getwhitelistarray().call();
    // recupere la liste des propositions faites
    const proposals = await contract.methods.getproposalsarray().call();
    // met à jour le state pour whitelist et proposals
    this.setState({ whitelist: whitelist, proposals:proposals });
    // met à jour le status
    this.getstatus();
    // met à jour le currentAccount
    this.getCurrentAccount();
    // Gestion des événements pas terminée
    // this.updateAnnounce(); 
  }; 

  //Gestion des événements pas terminée
  // updateAnnounce = async() => {
  //   const { contract,currentAccount } = this.state;
  //   let eventsArray = await contract.events.allEvents({
  //     filter: {myIndexedParam: [20,23], myOtherIndexedParam: '0x123456789...'}, // Using an array means OR: e.g. 20 or 23
  //     fromBlock: 0,
  //     toBlock: 'latest'
  // }, function(error, events){ console.log(events); })
  // .then(function(events){
  //     console.log(events) // same results as the optional callback above
  // });
  // }

  // Recupere le status du contrat
  getstatus = async() => {
    const { contract } = this.state;
    const currentStatus = await contract.methods.getVoteStatus().call();
    this.setState({ status: currentStatus });
    console.log("status ds getstatus:",currentStatus)
  }

  // Envoie les informations entrées dans la forme vers la blockchain (voters, proposals, votes)
  onFormSubmit = async (term) => {
    const { contract, currentAccount, status} = this.state;
    this.getCurrentAccount();
    try{
      if (status==="RegisteringVoters"){
        await contract.methods.A_votersRegistration(term).send({from:currentAccount});
      } 
      else if (status==="ProposalsRegistrationStarted"){
        await contract.methods.C_proposalRegistration(term).send({from:currentAccount});
      }
      else if (status==="VotingSessionStarted"){
        await contract.methods.F_vote(Number(term)).send({from:currentAccount});
      }
    }
    catch(err){
      console.log("Error!!!:",err);
      this.setState({revertError:err})
    }
    this.runUpdate();
  }

  // récupère le compte Metamask courant de l'utilisateur 
  getCurrentAccount = async() => {
    await window.ethereum.on('accountsChanged', (accounts) => {
      // force un rafraichissement de l'appli après un changement de compte
      this.setState({currentAccount:accounts[0]},window.location.reload(true));
      // log le changement de compte dans la console
      console.log("currentAccount in getcurrentAccount=",accounts[0]);
    }) 
  }
  
  // gestion des actions de l'administrateur sur le bouton de controle
  onAction = async() => {
    const { contract, status, currentAccount, proposals } = this.state;
    this.getstatus();
    let currentStatus = status;
    try{
      if (currentStatus==="RegisteringVoters"){
        await contract.methods.B_proposalsRegistrationStart().send({from:currentAccount})
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
      else if(currentStatus==="VotingSessionEnded"){ //|| currentStatus==="VotesTallied"
        await contract.methods.H_CountVotes().send({from:currentAccount});
        const results = await contract.methods.I_WinningProposalIds().call();
        // création d'un tableau de booléens pour l'affichage des résultats dans la Liste
        const resultsarray = new Array(proposals.length).fill(false);
        for (var j = 0; j < results.length; j++) {
          resultsarray[results[j]]=true;
        }
        //mise à jour du status
        this.getstatus();
        this.setState({results:results,resultsarray:resultsarray});
        // log les résultats dans la console 
        console.log(results)
        console.log(resultsarray)
      }
      else {
        console.log("It is finished!")     
      } 
    }
    catch(err){
      alert("Error!!!:",err);
      this.setState({revertError:err})
    }
    

  }

  // Affichage
  render() {
    const { whitelist, status, proposals, currentAccount, resultsarray} = this.state;    
    // attends la connection à la blockchain
    if (!this.state.web3 || this.state.status===undefined) {
      return <div>Loading Web3, accounts, and contract...</div>;
    } // affichage pour l'administrateur
    else if (currentAccount===this.state.owner) {
      return (
      <div className="App"> 
        <div>
            <h2 className="text-center">Voting Dapp</h2>
        </div>
        <br></br>
        <div class="alert alert-success" role="alert">
            {status}
        </div>
        <div style={{marginTop: '75px'}}>
          <Liste whitelist={whitelist} proposals={proposals} status={status} resultsarray={resultsarray}/>
          <br></br>
          <Forme onSubmit={this.onFormSubmit} status={status} />
        </div>
        <div style={{marginTop: '60px'}}></div>
        <Bouton onClick={this.onAction}  status={status}/>
        <br></br>
        {/* <div class="alert alert-danger" role="alert" style={{width:'500px',margin:'auto'}}>
            {errorRevert}
        </div> */}
      </div> 
    )} //affichage pour les utilisateurs
    else if (currentAccount!==this.state.owner) {
      return (
        <div className="App">
          <div>
              <h2 className="text-center">Voting Dapp</h2>
          </div>
          <br></br>
          <div class="alert alert-success" role="alert" >
              {status}
          </div>
          <div style={{marginTop: '75px'}}>
            <Liste whitelist={whitelist} proposals={proposals} status={status} resultsarray={resultsarray}/>
            <br></br>
            <Forme onSubmit={this.onFormSubmit} status={status}/>      
          </div> 
          <br></br>
          {/* <div class="alert alert-danger" role="alert" style={{width:'500px',margin:'auto'}}>
            {errorRevert}
          </div>  */}
        </div> 
      );
    }
  }
}

export default App;