let instance = await Voting.at("0x52CdD3dF9902722596E361Fd8A3249d75137bfcE");
let accounts = await web3.eth.getAccounts()
instance.A_votersRegistration(accounts[1],{from:accounts[0]})
instance.A_votersRegistration(accounts[2],{from:accounts[0]})
instance.A_votersRegistration(accounts[3],{from:accounts[0]})
instance.A_votersRegistration(accounts[4],{from:accounts[0]})
instance.B_proposalsRegistrationStart({from:accounts[0]})
instance.C_proposalRegistration('p1',{from:accounts[0]})
instance.C_proposalRegistration('p2',{from:accounts[1]})
instance.C_proposalRegistration('p3',{from:accounts[2]})
instance.C_proposalRegistration('p4',{from:accounts[3]})
instance.D_proposalsRegistrationTermination({from:accounts[0]})
instance.E_votingTimeStart({from:accounts[0]})
instance.F_vote(2,{from:accounts[0]})
instance.F_vote(2,{from:accounts[1]})
instance.F_vote(0,{from:accounts[2]})
instance.F_vote(0,{from:accounts[3]})
instance.F_vote(1,{from:accounts[4]})
instance.G_votingTimeTermination({from:accounts[0]})
instance.H_CountVotes({from:accounts[0]})
instance.I_WinningProposalIds({from:accounts[0]})
