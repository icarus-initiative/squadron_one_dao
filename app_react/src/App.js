import './App.css';
import { useState, useEffect } from 'react';
import { Connection, PublicKey } from '@solana/web3.js';
import { Program, Provider, web3 } from '@project-serum/anchor';
import idl from './idl.json';
import kp from './keypair.json';
import feather from './purple_feather.webp';

import {
  getLedgerWallet,
  getPhantomWallet,
  getSolflareWallet,
} from '@solana/wallet-adapter-wallets';
import {
  useWallet,
  ConnectionProvider,
  WalletProvider,
} from '@solana/wallet-adapter-react';
import {
  WalletModalProvider,
  WalletMultiButton,
} from '@solana/wallet-adapter-react-ui';
require('@solana/wallet-adapter-react-ui/styles.css');

// ===Setup: Keypairs===
const { SystemProgram } = web3;
// We use a stored keypair so the program testing is consistent.
// The keypair for the program sits in keypair.json file.
const savedKeypair = Object.values(kp._keypair.secretKey);
const secret = new Uint8Array(savedKeypair);
const savedAccount = web3.Keypair.fromSecretKey(secret);
const programID = new PublicKey(idl.metadata.address);

// ===Setup: Wallets===
const wallets = [getPhantomWallet(), getSolflareWallet(), getLedgerWallet()];

// ===Setup: Cluster===
const localnet = 'http://127.0.0.1:8899';
// const devnet = clusterApiUrl("devnet");
// const mainnet = clusterApiUrl("mainnet-beta");
const network = localnet;

// ===Setup: Provider Options===
const opts = {
  preflightCommitment: 'processed',
};

function App() {
  const [squadlist, setSquadlist] = useState([]);
  const [adminMode, setAdminMode] = useState(false);

  useEffect(() => {
    fetchAccount();
  });

  // Use the Phantom wallet that is signed in.
  const wallet = useWallet();

  // ===RPC Methods===
  async function getProvider() {
    const connection = new Connection(network, opts.preflightCommitment);
    const provider = new Provider(connection, wallet, opts.preflightCommitment);
    return provider;
  }

  async function initialize() {
    try {
      const provider = await getProvider();
      const program = new Program(idl, programID, provider);

      await program.rpc.initialize({
        accounts: {
          baseAccount: savedAccount.publicKey,
          authority: provider.wallet.publicKey,
          systemProgram: SystemProgram.programId,
        },
        signers: [savedAccount],
      });

      const account = await program.account.baseAccount.fetch(
        savedAccount.publicKey
      );
      console.log('account: ', account);
    } catch (err) {
      console.log('Transaction error: ', err);
    }
  }

  async function addWhitelist() {
    try {
      const provider = await getProvider();
      const program = new Program(idl, programID, provider);
      const whitelist = [
        new PublicKey('7Z2VyvJ1gr1TPKiheGueUqx5NiPqeRJGGmyoFDJYrEwk'),
        new PublicKey('3Uerp97g6jUJFbTL8KMeUCSLMaoyzAL7CBsWcqcqb4fd'),
      ];

      await program.rpc.addWhitelist(whitelist, {
        accounts: {
          baseAccount: savedAccount.publicKey,
          authority: provider.wallet.publicKey,
        },
      });

      const account = await program.account.baseAccount.fetch(
        savedAccount.publicKey
      );
      console.log('account', account);
    } catch (err) {
      console.log('Transaction error: ', err);
    }
  }

  async function markInactive() {
    try {
      const provider = await getProvider();
      const program = new Program(idl, programID, provider);
      const whitelist = [
        new PublicKey('3Uerp97g6jUJFbTL8KMeUCSLMaoyzAL7CBsWcqcqb4fd'),
      ];

      await program.rpc.markInactive(whitelist, {
        accounts: {
          baseAccount: savedAccount.publicKey,
          authority: provider.wallet.publicKey,
        },
      });

      const account = await program.account.baseAccount.fetch(
        savedAccount.publicKey
      );
      console.log('account', account);
    } catch (err) {
      console.log('Transaction error: ', err);
    }
  }

  async function vote(choice) {
    try {
      const provider = await getProvider();
      const program = new Program(idl, programID, provider);

      await program.rpc.vote(choice, {
        accounts: {
          baseAccount: savedAccount.publicKey,
          voter: provider.wallet.publicKey,
        },
      });

      const account = await program.account.baseAccount.fetch(
        savedAccount.publicKey
      );
      console.log('account', account);
    } catch (err) {
      console.log('Transaction error: ', err);
    }
  }

  async function fetchAccount(displayAccount = 0) {
    try {
      const provider = await getProvider();
      const program = new Program(idl, programID, provider);

      const account = await program.account.baseAccount.fetch(
        savedAccount.publicKey
      );

      if (displayAccount) console.log('account', account);

      const squadlist = [...account.whitelist];

      for (let item of account.votelist) {
        squadlist.forEach((pilot) => {
          if (pilot.address.toBase58() === item.address.toBase58()) {
            pilot.voted = 1;
          }
        });
      }

      setSquadlist(squadlist);
    } catch (err) {
      console.error(err);
    }
  }

  // ===View Methods===
  function renderSquadTable() {
    const tableStyles = {
      margin: '1rem auto',
    };
    const cellStyles = {
      padding: '1rem',
    };
    return (
      <table border={1} style={tableStyles}>
        <thead>
          <tr>
            <th style={cellStyles}>Pilot</th>
            <th style={cellStyles}>Active</th>
            <th style={cellStyles}>Voted</th>
          </tr>
        </thead>
        <tbody>
          {squadlist.map((pilot, index) => (
            <tr key={index}>
              <td style={cellStyles}>
                {pilot.address.toBase58().substring(0, 5)}...
                {pilot.address
                  .toBase58()
                  .substring(pilot.address.toBase58().length - 5)}
              </td>
              <td style={cellStyles}>{pilot.active ? '✅' : '❌'}</td>
              <td style={cellStyles}>{pilot.voted ? '✅' : '❌'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    );
  }

  function renderAdminMode() {
    return (
      <>
        <button onClick={showInfo}>showInfo</button>
        <button onClick={initialize}>initialize</button>
        <button onClick={() => fetchAccount(1)}>fetchAccount</button>
        <button onClick={addWhitelist}>addWhitelist</button>
        <button onClick={() => vote(1)}>voteYay</button>
        <button onClick={() => vote(0)}>voteNay</button>
        <button onClick={markInactive}>markInactive</button>
      </>
    );
  }

  // ===Admin Methods===
  async function showInfo() {
    const provider = await getProvider();
    const program = new Program(idl, programID, provider);

    console.log('wallet', wallet);
    console.log('wallet public key', wallet.publicKey.toBase58());
    console.log('====================');
    console.log('programID', programID);
    console.log('program', program);
    console.log('idl', idl);
    console.log('====================');
    console.log('provider', provider);
    console.log('provider pkb58', provider.wallet.publicKey.toBase58());
    console.log('====================');
    console.log('baseAccount', savedAccount);
    console.log('baseAccount b58', savedAccount.publicKey.toBase58());
  }

  // ===Views===
  if (!wallet.connected) {
    /* If the user's wallet is not connected, display connect wallet button. */
    return (
      <main
        className='App'
        style={{
          background: '#1a1a1d',
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-around',
            alignItems: 'center',
            padding: '1rem',
            color: 'white',
          }}
        >
          <h3>Disconnected</h3>
          🔴
          <WalletMultiButton />
        </div>
        <div
          style={{
            background: '#35363a',
            textAlign: 'center',
            color: 'white',
            minHeight: '100vh',
          }}
        >
          <img src={feather} alt='logo' />
          <h1>Squadron One DAO</h1>
        </div>
      </main>
    );
  } else {
    return (
      <main
        className='App'
        style={{
          background: '#1a1a1d',
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-around',
            alignItems: 'center',
            padding: '1rem',
            color: 'white',
          }}
        >
          <h3>Connected</h3>
          🟢
          <WalletMultiButton />
        </div>
        <div
          style={{
            background: '#35363a',
            textAlign: 'center',
            color: 'white',
            minHeight: '100vh',
          }}
        >
          <h1>Squadron One DAO</h1>
          <div style={{ color: 'white', margin: '0 auto' }}>
            {squadlist.length > 0 ? renderSquadTable() : ''}
          </div>
          <button
            style={{ display: 'block', margin: '1rem auto' }}
            onClick={() => setAdminMode(!adminMode)}
          >
            {adminMode ? 'Hide Admin Mode' : 'Show Admin Mode'}
          </button>
          {adminMode ? renderAdminMode() : ''}
        </div>
      </main>
    );
  }
}

const AppWithProvider = () => (
  <ConnectionProvider endpoint={network}>
    <WalletProvider wallets={wallets} autoConnect>
      <WalletModalProvider>
        <App />
      </WalletModalProvider>
    </WalletProvider>
  </ConnectionProvider>
);

export default AppWithProvider;
