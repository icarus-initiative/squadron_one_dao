import * as anchor from '@project-serum/anchor';
const assert = require('assert');
const { SystemProgram, PublicKey } = anchor.web3;

describe('squadron_one_dao', () => {
  // Initialize Setup
  // ====================================================================================
  // We set up the provider from the wallet in our OS system folder.
  // That's in ~/Users/USERNAME/.config/solana/id.json.
  // We create the mainstate Keypair for our pgoram.
  // We make 2 whitelist Pubkeys and a whitelist.

  // Configure the client to use the local cluster.
  const provider = anchor.Provider.env();
  anchor.setProvider(provider);
  const program = anchor.workspace.SquadronOneDao;

  // Create Keypair for our program.
  const mainState = anchor.web3.Keypair.generate();

  // Make 2 whitelist public keys.
  // Binary 782a639ad0537be95ab2d7c053ad031c93b259dc755d6c1dc510d0c3a15160a9
  const whitelisted1 = new PublicKey(
    '965QwptcVkD7otW4bxHeDrWoXMcbGzyGqbAUjcjvfPwN'
  );

  // Binary e96cb05d27d7cdbb9c97f4b080ad99684eacb095532ba93e43045eaf533708c
  const whitelisted2 = new PublicKey(
    'yx54BueUCTurDDYMMpfWYLDchkZiEDCf9gMKjQ6dYsD'
  );

  // Add 2 keys to whitelist array.
  const p_whitelist = [whitelisted1, whitelisted2];

  // Test 1: Dapp Initialized
  // ====================================================================================
  // We log all the keys in binary and base58 forms for easy viewing.
  // We check the authority is set to our provider wallet on setup also.

  it('Is initialized!', async () => {
    console.log('========================');

    // Add your test here.
    const tx = await program.rpc.initialize({
      accounts: {
        mainState: mainState.publicKey,
        authority: provider.wallet.publicKey,
        systemProgram: SystemProgram.programId,
      },
      signers: [mainState],
    });

    console.log('Your transaction signature', tx);

    // providerWallet
    // binary a650147383b2f0efab54055c68811551517b1a5985ed044d23bf8e5254584283
    // b58 CCDW3z3tVXG8FBHoAwA6e9XMqHYRvk8t8PWFXQ2ZXMf8
    console.log('providerWallet binary:', provider.wallet.publicKey);
    console.log('providerWallet b58:', provider.wallet.publicKey.toBase58());

    // mainState
    // binary 3c2cef3728d6809b30610ee4faf87f16164e82f64f7c42902355e2d202284247
    // b58 53uCitj3jBmGKPnnBdawjxCSVya9KJLJqn7eLHqNdih4
    console.log('mainState binary:', mainState.publicKey);
    console.log('mainState b58:', mainState.publicKey.toBase58());

    // whitelisted1
    // binary 782a639ad0537be95ab2d7c053ad031c93b259dc755d6c1dc510d0c3a15160a9
    // b58 965QwptcVkD7otW4bxHeDrWoXMcbGzyGqbAUjcjvfPwN
    console.log('whitelisted1 binary:', whitelisted1);
    console.log('whitelisted1 b58:', whitelisted1.toBase58());

    // whitelisted2
    // binary e96cb05d27d7cdbb9c97f4b080ad99684eacb095532ba93e43045eaf533708c
    // b58 yx54BueUCTurDDYMMpfWYLDchkZiEDCf9gMKjQ6dYsD
    console.log('whitelisted2 binary:', whitelisted2);
    console.log('whitelisted2 b58:', whitelisted2.toBase58());

    const account = await program.account.mainState.fetch(mainState.publicKey);

    assert.ok(
      account.authority.toString() == provider.wallet.publicKey.toString()
    );
  });

  // Test 2: Whitelist Additions
  // ====================================================================================
  // We add the 2 pilots to our whitelist and check the length.

  it('Adds 2 pilots to vector', async () => {
    console.log('========================');
    await program.rpc.addWhitelist(p_whitelist, {
      accounts: {
        mainState: mainState.publicKey,
        authority: provider.wallet.publicKey,
      },
    });

    const account = await program.account.mainState.fetch(mainState.publicKey);

    console.log('whitelist', account.whitelist);

    assert.ok(account.whitelist.length == p_whitelist.length);
  });

  // Test 3: Checking Whitelist Additions
  // ====================================================================================
  // We just check that whitelist1 Publickey was added to the whitelist.
  it('Vector contains whitelist member: 965-PwN', async () => {
    console.log('========================');
    const pilot = new PublicKey(
      '965QwptcVkD7otW4bxHeDrWoXMcbGzyGqbAUjcjvfPwN'
    ).toBase58();

    const account = await program.account.mainState.fetch(mainState.publicKey);

    const found = account.whitelist.filter(
      (item) => item.address.toBase58() === pilot
    );

    console.log('found', found[0].address.toBase58());

    assert.ok(found.length > 0);
  });

  // Test 4: Voting as Non-Whitelisted
  // ====================================================================================
  // Try to vote as provider but NOT whitelisted yet.
  // Voting will not account the yay for a member not on the whitelist.
  it('Non-whitelist member votes yay', async () => {
    console.log('========================');
    await program.rpc.vote(1, {
      accounts: {
        mainState: mainState.publicKey,
        voter: provider.wallet.publicKey,
      },
    });

    const account = await program.account.mainState.fetch(mainState.publicKey);

    console.log('Yays', account.yay);
    console.log('Nays', account.nay);
    assert.ok(account.yay == 0);
  });

  // Test 5: Voting yay as Whitelisted
  // ====================================================================================
  // We have to add the provider to whitelist.
  // With allowed permission, the vote will get recorded.
  // NOTE: We can't change the provider.wallet after we started test suite.
  // Therefore, we must test using the provider as the whitelisted member.
  // AKA, one can't send their vote in from another wallet address, at least in the test suite.
  it('Member is whitelist and votes yay', async () => {
    console.log('========================');
    await program.rpc.addWhitelist([provider.wallet.publicKey], {
      accounts: {
        mainState: mainState.publicKey,
        authority: provider.wallet.publicKey,
      },
    });

    await program.rpc.vote(1, {
      accounts: {
        mainState: mainState.publicKey,
        voter: provider.wallet.publicKey,
      },
    });

    const account = await program.account.mainState.fetch(mainState.publicKey);

    console.log('Yays', account.yay);
    console.log('Nays', account.nay);
    assert.ok(account.yay == 1);
  });

  // ***This test will fail because our provider address, which we can't change in tests, has already voted.
  // ***Will work if we remove the has_vote check in our code. That has been verified by Otik.
  // Test 6: Voting nay as Whitelisted
  // ====================================================================================
  // it('Vote nay', async () => {
  //   console.log('========================');
  //   await program.rpc.vote(0, {
  //     accounts: {
  //       mainState: mainState.publicKey,
  //       voter: provider.wallet.publicKey,
  //     },
  //   });

  //   const account = await program.account.mainState.fetch(mainState.publicKey);

  //   console.log('Yays', account.yay);
  //   console.log('Nays', account.nay);
  //   assert.ok(account.nay == 1);
  // });

  // ***Testing suite limitation and will result in `Error: Signature verification failed`
  // ***We can't run the test below because we can't change the voter argument to a non-whitelisted public key. We must sign it as the provider.wallet.publicKey which is derived from our root Keypair file on our computer system. Will skip this test for this reason.
  // ====================================================================================
  // it('Non-whitelist member votes yay', async () => {
  //   const NWhitelisted = anchor.web3.Keypair.generate();

  //   await program.rpc.vote(1, {
  //     accounts: {
  //       mainState: mainState.publicKey,
  //       voter: NWhitelisted.publicKey, // We can't do this.
  //     },
  //   });

  //   const account = await program.account.mainState.fetch(mainState.publicKey);
  //   console.log('Non-whitelist member votes yay', account);
  // });
});
