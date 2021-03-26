const { expectRevert, expectEvent } = require('@openzeppelin/test-helpers');
const { BN } = require('@openzeppelin/test-helpers/src/setup');
const { expect } = require('chai');
const truffleAssert = require('truffle-assertions');
const Voting = artifacts.require('Voting');

contract('Voting tests', function (accounts) {
    const owner = accounts[0];
    const notOwner = accounts[1];
    const nonAuthorized = accounts[2];
    const whitelisted2 = accounts[3];
    const authorizedVoter1 = accounts[4]
    const authorizedVoter2= accounts[5]
    const authorizedVoter3 = accounts[6]
    const authorizedVoter4 = accounts[7]
    const authorizedVoter5 = accounts[8]
    const authorizedVoter6 = accounts[9]

    // Avant chaque test unitaire
    beforeEach(async function () {
        this.VotingInstance = await Voting.new({from: owner});
    });

    // A_votersRegistration
    // B_proposalsRegistrationStart
    // C_proposalRegistration
    // D_proposalsRegistrationTermination
    // E_votingTimeStart
    // F_vote
    // G_votingTimeTermination
    // H_CountVotes
    // I_WinningProposalIds
    // getVoteStatus

    // Should revert when not owner
    it('verifies functions reverts when not owner', async function () {
        await (expectRevert(this.VotingInstance.A_votersRegistration(authorizedVoter1, {from: notOwner}), "Ownable: caller is not the owner"));
        await (expectRevert(this.VotingInstance.B_proposalsRegistrationStart({from: notOwner}), "Ownable: caller is not the owner"));
        await (expectRevert(this.VotingInstance.D_proposalsRegistrationTermination({from: notOwner}), "Ownable: caller is not the owner"));
        await (expectRevert(this.VotingInstance.E_votingTimeStart({from: notOwner}), "Ownable: caller is not the owner"));
        await (expectRevert(this.VotingInstance.G_votingTimeTermination({from: notOwner}), "Ownable: caller is not the owner"));
    });
    
    // Whitelist tests
    it('verify voters are added to whitelist and votersCount incremented', async function () {
        // Before the the voter is added
        let authorizedAddressesBefore = await this.VotingInstance.getwhitelistarray();
        let authorizedVoter1StructBefore = await this.VotingInstance.whitelist(authorizedVoter1); 
        let votersCountBefore = await this.VotingInstance.votersCount(); 
        // verifies the voter is not added yet
        expect(authorizedAddressesBefore.length).to.equal(1);
        expect(authorizedVoter1StructBefore.isRegistered).to.equal(false);
        // add the voter
        let receipt = await this.VotingInstance.A_votersRegistration(authorizedVoter1, {from: owner});
        // After the voter was added
        let authorizedAddressesAfter = await this.VotingInstance.getwhitelistarray();
        let authorizedVoter1StructAfter = await this.VotingInstance.whitelist(authorizedVoter1); 
        let votersCountAfter = await this.VotingInstance.votersCount();
        //verifies the voter is in the whitelist array
        expect(authorizedAddressesAfter[1]).to.equal(authorizedVoter1);
        expect(authorizedAddressesAfter.length).to.equal(2);
        //verifies the voter is tagged as registered
        expect(authorizedVoter1StructAfter.isRegistered).to.equal(true);
        //verifies votesCount is incremented
        expect(votersCountAfter).to.be.bignumber.equal(votersCountBefore.add(new BN(1)));
        //verifies the event is properly emitted
        expectEvent(receipt, "VoterRegistered", {voterAddress: authorizedVoter1 });
    });
    
    it('verify revert when already registered', async function () { 
        // first registration
        await this.VotingInstance.A_votersRegistration(authorizedVoter1, {from: owner});
        let isAuthorizedObj = await this.VotingInstance.whitelist(authorizedVoter1);
        expect(isAuthorizedObj.isRegistered).to.equal(true);
        // second registration
        await (expectRevert(this.VotingInstance.A_votersRegistration(authorizedVoter1, {from: owner}),
        "This address is already registered"));
    });

    it('verifies at least 1 voter has been added before proposalsRegistrationStart', async function () {
        await expectRevert(this.VotingInstance.B_proposalsRegistrationStart({from: owner}),"Please add at least 1 voter!");
    });

    
    // WorkflowStatus tests    
    it('verifies revert if not proper voteStatus and events', async function () { 
        //verify voteStatus
        let voteStatus = await this.VotingInstance.getVoteStatus();
        expect(voteStatus).to.equal("RegisteringVoters");

        //------------------tests of expected reverts during this phase----------------------

        // expectRevert(this.VotingInstance.A_votersRegistration(authorizedVoter6, {from: owner}),"Registration is over!");
        //expectRevert(this.VotingInstance.B_proposalsRegistrationStart({from: owner}),"Proposals Registration already started!");
        await expectRevert(this.VotingInstance.C_proposalRegistration("p1",{from: owner}),"Proposals registration not open!")
        await expectRevert(this.VotingInstance.D_proposalsRegistrationTermination({from: owner}),"Proposals registration not open!")
        await expectRevert(this.VotingInstance.E_votingTimeStart({from: owner}),"Proposals registration not ended!")
        await expectRevert(this.VotingInstance.F_vote(0,{from: owner}),"Vote not open!")
        await expectRevert(this.VotingInstance.G_votingTimeTermination({from: owner}),"Vote not open!")
        await expectRevert(this.VotingInstance.H_CountVotes({from: owner}),"Counting votes not open!")
        await expectRevert(this.VotingInstance.I_WinningProposalIds(),"Votes not counted yet!")

        //-------------------process to next phase-------------------------------------------
        
        await this.VotingInstance.A_votersRegistration(authorizedVoter1, {from: owner});
        await this.VotingInstance.A_votersRegistration(authorizedVoter2, {from: owner});
        await this.VotingInstance.A_votersRegistration(authorizedVoter3, {from: owner});
        await this.VotingInstance.A_votersRegistration(authorizedVoter4, {from: owner});
        await this.VotingInstance.A_votersRegistration(authorizedVoter5, {from: owner});
        
        let receipt =await this.VotingInstance.B_proposalsRegistrationStart({from: owner});
        //verifies event
        await expectEvent(receipt, "ProposalsRegistrationStarted");
        await expectEvent(receipt, "WorkflowStatusChange",{previousStatus:new BN(0),newStatus:new BN(1)});
        //verify voteStatus
        voteStatus = await this.VotingInstance.getVoteStatus();
        expect(voteStatus).to.equal("ProposalsRegistrationStarted");

        //------------------tests of expected reverts during this phase----------------------

        await expectRevert(this.VotingInstance.A_votersRegistration(authorizedVoter6, {from: owner}),"Registration is over!");
        await expectRevert(this.VotingInstance.B_proposalsRegistrationStart({from: owner}),"Proposals Registration already started!");
        // expectRevert(this.VotingInstance.C_proposalRegistration("p1",{from: owner}),"Proposals registration not open!")
        // expectRevert(this.VotingInstance.D_proposalsRegistrationTermination({from: owner}),"Proposals registration not open!")
        await expectRevert(this.VotingInstance.E_votingTimeStart({from: owner}),"Proposals registration not ended!")
        await expectRevert(this.VotingInstance.F_vote(0,{from: owner}),"Vote not open!")
        await expectRevert(this.VotingInstance.G_votingTimeTermination({from: owner}),"Vote not open!")
        await expectRevert(this.VotingInstance.H_CountVotes({from: owner}),"Counting votes not open!")
        await expectRevert(this.VotingInstance.I_WinningProposalIds(),"Votes not counted yet!")

        //-------------------process to next phase-------------------------------------------

        await this.VotingInstance.C_proposalRegistration("p1",{from: owner});
        receipt = await this.VotingInstance.C_proposalRegistration("p2",{from: owner});
        expectEvent(receipt, "ProposalRegistered", {proposalId:new BN(1)});

        receipt = await this.VotingInstance.D_proposalsRegistrationTermination({from: owner});
        //verifies event
        await expectEvent(receipt, "WorkflowStatusChange",{previousStatus:new BN(1),newStatus:new BN(2)});
        await expectEvent(receipt, "ProposalsRegistrationEnded");        
        await expectEvent(receipt, "WorkflowStatusChange",{previousStatus:new BN(2),newStatus:new BN(3)});

        //verify voteStatus
        voteStatus = await this.VotingInstance.getVoteStatus();
        expect(voteStatus).to.equal("ProposalsRegistrationEnded");

        //------------------tests of expected reverts during this phase----------------------

        await expectRevert(this.VotingInstance.A_votersRegistration(authorizedVoter6, {from: owner}),"Registration is over!");
        await expectRevert(this.VotingInstance.B_proposalsRegistrationStart({from: owner}),"Proposals Registration already started!");
        await expectRevert(this.VotingInstance.C_proposalRegistration("p1",{from: owner}),"Proposals registration not open!")
        await expectRevert(this.VotingInstance.D_proposalsRegistrationTermination({from: owner}),"Proposals registration not open!")
        // expectRevert(this.VotingInstance.E_votingTimeStart({from: owner}),"Proposals registration not ended!")
        await expectRevert(this.VotingInstance.F_vote(0,{from: owner}),"Vote not open!")
        await expectRevert(this.VotingInstance.G_votingTimeTermination({from: owner}),"Vote not open!")
        await expectRevert(this.VotingInstance.H_CountVotes({from: owner}),"Counting votes not open!")
        await expectRevert(this.VotingInstance.I_WinningProposalIds(),"Votes not counted yet!")

        //-------------------process to next phase-------------------------------------------

        receipt = await this.VotingInstance.E_votingTimeStart({from: owner});

        //verifies event
        await expectEvent(receipt, "VotingSessionStarted");

        await this.VotingInstance.F_vote(0,{from: owner});
        await this.VotingInstance.F_vote(1,{from: authorizedVoter1});
        receipt = await this.VotingInstance.F_vote(1,{from: authorizedVoter2});
        expectEvent(receipt, "Voted", {voter:authorizedVoter2,proposalId:new BN(1)});

        //verify voteStatus
        voteStatus = await this.VotingInstance.getVoteStatus();
        expect(voteStatus).to.equal("VotingSessionStarted");

        //------------------tests of expected reverts during this phase----------------------

        await expectRevert(this.VotingInstance.A_votersRegistration(authorizedVoter6, {from: owner}),"Registration is over!");
        await expectRevert(this.VotingInstance.B_proposalsRegistrationStart({from: owner}),"Proposals Registration already started!");
        await expectRevert(this.VotingInstance.C_proposalRegistration("p1",{from: owner}),"Proposals registration not open!")
        await expectRevert(this.VotingInstance.D_proposalsRegistrationTermination({from: owner}),"Proposals registration not open!")
        await expectRevert(this.VotingInstance.E_votingTimeStart({from: owner}),"Proposals registration not ended!")
        // expectRevert(this.VotingInstance.F_vote(0,{from: owner}),"Vote not open!")
        // expectRevert(this.VotingInstance.G_votingTimeTermination({from: owner}),"Vote not open!")
        await expectRevert(this.VotingInstance.H_CountVotes({from: owner}),"Counting votes not open!")
        await expectRevert(this.VotingInstance.I_WinningProposalIds(),"Votes not counted yet!")

        //-------------------process to next phase-------------------------------------------

        receipt = await this.VotingInstance.G_votingTimeTermination({from: owner})
        
        //verifies event
        await expectEvent(receipt, "WorkflowStatusChange",{previousStatus:new BN(3),newStatus:new BN(4)});
        await expectEvent(receipt, "VotingSessionEnded");

        //verify voteStatus
        voteStatus = await this.VotingInstance.getVoteStatus();
        expect(voteStatus).to.equal("VotingSessionEnded");

        //------------------tests of expected reverts during this phase----------------------

        await expectRevert(this.VotingInstance.A_votersRegistration(authorizedVoter6, {from: owner}),"Registration is over!");
        await expectRevert(this.VotingInstance.B_proposalsRegistrationStart({from: owner}),"Proposals Registration already started!");
        await expectRevert(this.VotingInstance.C_proposalRegistration("p1",{from: owner}),"Proposals registration not open!")
        await expectRevert(this.VotingInstance.D_proposalsRegistrationTermination({from: owner}),"Proposals registration not open!")
        await expectRevert(this.VotingInstance.E_votingTimeStart({from: owner}),"Proposals registration not ended!")
        await expectRevert(this.VotingInstance.F_vote(0,{from: authorizedVoter3}),"Vote not open!")
        await expectRevert(this.VotingInstance.G_votingTimeTermination({from: owner}),"Vote not open!")
        // expectRevert(this.VotingInstance.H_CountVotes({from: owner}),"Counting votes not open!")
        await expectRevert(this.VotingInstance.I_WinningProposalIds(),"Votes not counted yet!")

        //-------------------process to next phase-------------------------------------------

        receipt = await this.VotingInstance.H_CountVotes({from: owner})

        //verifies event
        await expectEvent(receipt, "VotesTallied");
        await expectEvent(receipt, "WorkflowStatusChange",{previousStatus:new BN(4),newStatus:new BN(5)});

        //verify voteStatus
        voteStatus = await this.VotingInstance.getVoteStatus();
        expect(voteStatus).to.equal("VotesTallied");

        //------------------tests of expected reverts during this phase----------------------

        await expectRevert(this.VotingInstance.A_votersRegistration(authorizedVoter6, {from: owner}),"Registration is over!");
        await expectRevert(this.VotingInstance.B_proposalsRegistrationStart({from: owner}),"Proposals Registration already started!");
        await expectRevert(this.VotingInstance.C_proposalRegistration("p1",{from: owner}),"Proposals registration not open!")
        await expectRevert(this.VotingInstance.D_proposalsRegistrationTermination({from: owner}),"Proposals registration not open!")
        await expectRevert(this.VotingInstance.E_votingTimeStart({from: owner}),"Proposals registration not ended!")
        await expectRevert(this.VotingInstance.F_vote(0,{from: authorizedVoter3}),"Vote not open!")
        await expectRevert(this.VotingInstance.G_votingTimeTermination({from: owner}),"Vote not open!")
        await expectRevert(this.VotingInstance.H_CountVotes({from: owner}),"Counting votes not open!")
        //expectRevert(this.VotingInstance.I_WinningProposalIds(),"Votes not counted yet!")

    });

    //Proposals registration tests    
    it('verifies proposals are properly added and empty proposal causes revert', async function () {
        // need to add at least one voter
        await this.VotingInstance.A_votersRegistration(authorizedVoter1, {from: owner});
        // await this.VotingInstance.A_votersRegistration(authorizedVoter2, {from: owner});
        // await this.VotingInstance.A_votersRegistration(authorizedVoter3, {from: owner});
        // await this.VotingInstance.A_votersRegistration(authorizedVoter4, {from: owner});
        // await this.VotingInstance.A_votersRegistration(authorizedVoter5, {from: owner});
        //Start proposals registration
        await this.VotingInstance.B_proposalsRegistrationStart({from: owner});
        //add 2 proposals
        await this.VotingInstance.C_proposalRegistration("p1",{from: owner});
        await this.VotingInstance.C_proposalRegistration("p2",{from: owner});
        //verifies proposals have been added
        //let ourProposals = "p1";
        let proposals = await this.VotingInstance.getproposalsarray(); 
        expect(proposals).to.be.an('array').that.includes("p1");
        expect(proposals).to.be.an('array').that.includes("p2");

        //test verifies empty proposal cause revert
        await truffleAssert.reverts(this.VotingInstance.C_proposalRegistration("",{from: owner}),"Your proposal is empty!");
        //test verifies that nonAuthorized address are unable to add proposals
        await truffleAssert.reverts(this.VotingInstance.C_proposalRegistration("p3",{from: nonAuthorized}),
        "You can't make a proposal cause you're not registered!");
    }); 




    // WorkflowStatus tests    
    it('verifies countVotes works properly', async function () { 
       
        //Admin adds 5 voters        
        await this.VotingInstance.A_votersRegistration(authorizedVoter1, {from: owner});
        await this.VotingInstance.A_votersRegistration(authorizedVoter2, {from: owner});
        await this.VotingInstance.A_votersRegistration(authorizedVoter3, {from: owner});
        await this.VotingInstance.A_votersRegistration(authorizedVoter4, {from: owner});
        await this.VotingInstance.A_votersRegistration(authorizedVoter5, {from: owner});
        //Admin starts proposals registration
        await this.VotingInstance.B_proposalsRegistrationStart({from: owner});
        //Admin and authorized voters add several proposals
        await this.VotingInstance.C_proposalRegistration("p1",{from: owner});
        await this.VotingInstance.C_proposalRegistration("p2",{from: authorizedVoter1});
        await this.VotingInstance.C_proposalRegistration("p3",{from: authorizedVoter2});
        await this.VotingInstance.C_proposalRegistration("p4",{from: authorizedVoter3});
        //Admin terminates proposals registration then starts voting session
        await this.VotingInstance.D_proposalsRegistrationTermination({from: owner});
        await this.VotingInstance.E_votingTimeStart({from: owner});
        //Admin and voters vote
        await this.VotingInstance.F_vote(0,{from: owner});
        await this.VotingInstance.F_vote(1,{from: authorizedVoter1});
        await this.VotingInstance.F_vote(1,{from: authorizedVoter2});
        await this.VotingInstance.F_vote(3,{from: authorizedVoter3});
        await this.VotingInstance.F_vote(3,{from: authorizedVoter4});
        //Admin ends voting session and call countVotes
        await this.VotingInstance.G_votingTimeTermination({from: owner});
        await this.VotingInstance.H_CountVotes({from: owner});
        let results = await this.VotingInstance.I_WinningProposalIds();
        let tab= [new BN(1),new BN(3)];
        expect(results.toString()).to.equal(tab.toString());

    });
    
//   it('getAddresses', async function () { 
//     // 1er appel
//     await this.WhitelistInstance.whitelist(whitelisted, {from: owner});
//     await this.WhitelistInstance.whitelist(whitelisted2, {from: owner});

//     let addresses = await this.WhitelistInstance.getAddresses(); 
//     let tab = [whitelisted,whitelisted2];

//     expect(addresses.toString()).to.equal(tab.toString());
//     expect(addresses).to.eql(tab);
//     expect(addresses).to.be.an('array').that.includes(whitelisted);
//   });
});