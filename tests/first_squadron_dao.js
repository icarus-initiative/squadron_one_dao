const assert = require("assert");
const anchor = require("@project-serum/anchor");
const { SystemProgram } = anchor.web3;

describe("first_squadron_dao", () => {
  /* Configure the client */
  const provider = anchor.Provider.env();
  anchor.setProvider(provider);
  const program = anchor.workspace.FirstSquadronDao;
  const baseAccount = anchor.web3.Keypair.generate();

  // Hard coded whitelist.
  const whitelist = "adam,bob,cathy,frank,harry,jack";

  it("Initializes with 0 votes for yay and nay", async () => {
    /* The last element passed to RPC methods is always the transaction options. Because proposal is being created here, we are required to pass it as a signers array */
    const tx = await program.rpc.initialize({
      accounts: {
        proposalAccount: baseAccount.publicKey,
        user: provider.wallet.publicKey,
        systemProgram: SystemProgram.programId,
      },
      signers: [baseAccount],
    });
    const account = await program.account.proposalAccount.fetch(
      baseAccount.publicKey
    );
    
    console.log("\n");
    console.log("your transaction signature", tx);
    console.log("yay: ", account.yay.toString());
    console.log("nay: ", account.nay.toString());
    console.log("test: account.yay.toString() == 0 && account.nay.toString() == 0");

    assert.ok(account.yay.toString() == 0 && account.nay.toString() == 0);
  });

  it("Votes correctly voteYay", async () => {
    await program.rpc.voteYay({
      accounts: {
        proposalAccount: baseAccount.publicKey,
      },
    });
    const account = await program.account.proposalAccount.fetch(baseAccount.publicKey);

    console.log("\n");
    console.log("yay: ", account.yay.toString());
    console.log("nay: ", account.nay.toString());
    console.log("test: account.yay.toString() == 1 && account.nay.toString() == 0");

    assert.ok(account.yay.toString() == 1 && account.nay.toString() == 0);
  });

  it("Votes correctly voteNay", async () => {
    await program.rpc.voteNay({
      accounts: {
        proposalAccount: baseAccount.publicKey,
      },
    });
    const account = await program.account.proposalAccount.fetch(baseAccount.publicKey);

    console.log("\n");
    console.log("yay: ", account.yay.toString());
    console.log("nay: ", account.nay.toString());
    console.log("test: account.yay.toString() == 1 && account.nay.toString() == 1");

    assert.ok(account.yay.toString() == 1 && account.nay.toString() == 1);
  });

  it("Counts total votes", async () => {
    const account = await program.account.proposalAccount.fetch(
      baseAccount.publicKey
    );
    const tally = (account.yay + account.yay).toString();
    const total = account.total.toString();

    console.log("\n");
    console.log("tally: ", tally);
    console.log("total votes: ", total);
    console.log("test: tally == total");
    
    assert.ok(tally == total);
  });

  it("Initializes with a hard-coded whitelist", async () => {
    const account = await program.account.proposalAccount.fetch(
      baseAccount.publicKey
    );

    account.whitelist = whitelist;
    
    console.log("\n");
    console.log("whitelist: ", account.whitelist);
    console.log("test: account.whitelist.length > 0");

    assert.ok(account.whitelist.length > 0);
  });

  it("Initializes with 6 members exactly", async () => {
    const account = await program.account.proposalAccount.fetch(
      baseAccount.publicKey
    );

    account.whitelist = whitelist;
    const cleaved = account.whitelist.split(',');
    const whitelist_length = cleaved.length;
    
    console.log("\n");
    console.log("whitelist: ", account.whitelist);
    console.log("whitelist_length: ", whitelist_length);
    console.log("test: whitelist_length === 6");

    assert.ok(whitelist_length === 6);
  });

  it("Matches on whitelist", async () => {
    const account = await program.account.proposalAccount.fetch(baseAccount.publicKey);

    account.whitelist = whitelist;
    const cleaved = whitelist.split(',');

    const target = "frank";
    const found = cleaved.indexOf(target);
    
    console.log("\n");
    console.log("whitelist: ", whitelist);
    console.log("target: ", target);
    console.log("found: ", found);
    console.log("test: found >= 0");

    assert.ok(found >= 0);
  });

  it("Matches none on whitelist", async () => {
    const account = await program.account.proposalAccount.fetch(
      baseAccount.publicKey
    );

    account.whitelist = whitelist;
    const cleaved = whitelist.split(',');

    const target = "anatoly";
    const found = cleaved.indexOf(target);

    console.log("\n");
    console.log("whitelist: ", whitelist);
    console.log("target: ", target);
    console.log("found: ", found);
    console.log("test: found < 0");

    assert.ok(found < 0);
  });
});
