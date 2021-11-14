const assert = require("assert");
const anchor = require("@project-serum/anchor");
const { SystemProgram } = anchor.web3;

describe("first_squadron_dao", () => {
  /* Configure the client */
  const provider = anchor.Provider.env();
  anchor.setProvider(provider);
  const program = anchor.workspace.FirstSquadronDao;
  const proposalAccount = anchor.web3.Keypair.generate();

  it("Initializes with 0 votes for yay and nay", async () => {
    console.log("Testing Initialize...");
    /* The last element passed to RPC methods is always the transaction options. Because proposal is being created here, we are required to pass it as a signers array */
    const tx = await program.rpc.initialize({
      accounts: {
        proposalAccount: proposalAccount.publicKey,
        user: provider.wallet.publicKey,
        systemProgram: SystemProgram.programId,
      },
      signers: [proposalAccount],
    });
    const account = await program.account.proposalAccount.fetch(
      proposalAccount.publicKey
    );
    
    console.log("Your transaction signature", tx);
    console.log("Yay: ", account.yay.toString());
    console.log("Nay: ", account.nay.toString());
    assert.ok(
      account.yay.toString() == 0 && account.nay.toString() == 0
    );
  });

  it("Votes correctly voteYay", async () => {
    console.log("Testing voteYay...");
    await program.rpc.voteYay({
      accounts: {
        proposalAccount: proposalAccount.publicKey,
      },
    });
    const account = await program.account.proposalAccount.fetch(
      proposalAccount.publicKey
    );
    console.log("Yay: ", account.yay.toString());
    console.log("Nay: ", account.nay.toString());
    assert.ok(
      account.yay.toString() == 1 && account.nay.toString() == 0
    );
  });

  it("Votes correctly voteNay", async () => {
    console.log("Testing voteNay...");
    await program.rpc.voteNay({
      accounts: {
        proposalAccount: proposalAccount.publicKey,
      },
    });
    const account = await program.account.proposalAccount.fetch(
      proposalAccount.publicKey
    );
    console.log("Yay: ", account.yay.toString());
    console.log("Nay: ", account.nay.toString());
    assert.ok(
      account.yay.toString() == 1 && account.nay.toString() == 1
    );
  });

  it("Counts total votes", async () => {
    console.log("Testing countVotes...");
    await program.rpc.countVotes({
      accounts: {
        proposalAccount: proposalAccount.publicKey,
      },
    });
    const account = await program.account.proposalAccount.fetch(
      proposalAccount.publicKey
    );
    const tally = (account.yay + account.yay).toString();
    const total = account.total.toString();
    console.log("Tally: ", tally);
    console.log("Total Votes: ", total);
    
    assert.ok(
      tally == total
    );
  })
});
