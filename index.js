import { Decimal } from "decimal-js-sdk";
import TransportWebUSB from "@ledgerhq/hw-transport-webusb";
import secp256k1 from "secp256k1/elliptic";
import CosmosApp from "./src";
import { createSignMsg, createBroadcastTx } from '@tendermint/sig';
import { bytesToBase64 } from '@tendermint/belt';

const decimalOptions = {
    restURL: 'https://devnet-gate.decimalchain.com/api/rpc/'
  }

const decimal = new Decimal(decimalOptions);  

const request = async (url) => {
    try {
        const responce = await fetch(url);
        return responce.json();
    }
    catch {
        return {}
    }   
}


let chainId = 4;
let gasPrice;
let addressWallet = 'dx1ndgvlye77dmuct2ncr4m8ghmfkwp7p8semks5w';
let publicKey;
let recipient = "dx14kskueht0ul2qme5qmwjvlmjr9thd0x3x9ffrw";
let value = 20;
let gasLimit = 1000000;
let nonce;
let _cosmos;
const path = [44, 60, 0, 0, 0];


document.getElementById("connect-ledger").onclick = async function () {
    const transport = await TransportWebUSB.create();

    //Getting an Cosmos instance and get the Ledger Nano cosmos account public key
    _cosmos = new CosmosApp(transport);
    const wallet = await _cosmos.getAddressAndPubKey(path, "dx");
    let address = wallet.bech32_address;

    console.log(wallet);

    //Fill the inputs with the default value
    addressWallet = address;
    document.getElementById("wallet").value = address;
    document.getElementById("gasPrice").value = parseInt(gasPrice) + " wei";
    document.getElementById("chainId").value = chainId;
    document.getElementById("value").value = value;
    document.getElementById("recipient").value = recipient;
    document.getElementById("gasLimit").value = gasLimit;
}


document.getElementById("tx-transfer").onclick = async function () {
    //Getting information from the inputs
    addressWallet = document.getElementById("wallet").value;
    recipient =  document.getElementById("recipient").value;
    value =  document.getElementById("value").value;
    gasLimit =  parseInt(document.getElementById("gasLimit").value);

    const account_info = await request('https://devnet-gate.decimalchain.com/api/rpc/accounts/' + addressWallet);
    const node_info = await request('https://devnet-gate.decimalchain.com/api/rpc/node_info');

    let signMeta = {
        account_number: account_info?.result?.value?.account_number ?? '0',
        sequence: account_info?.result?.value?.sequence ?? '0',
        chain_id: node_info?.node_info?.network || null
    }

    // let unsignTx = await decimal.prepareTx('coin/send_coin', {
    //     coin: {
    //         amount: (value * Math.pow(10, 18)).toString(),
    //         denom: "del",
    //     },
    //     receiver: recipient,
    //     sender: addressWallet,
    // });

    let unsignTx = await decimal.prepareTx('validator/delegate', {
        coin: {
            amount: (value * Math.pow(10, 18)).toString(),
            denom: "del",
        },
        delegator_address: addressWallet,
        validator_address: "dxvaloper1lx4lvt8sjuxj8vw5dcf6knnq0pacre4wx926l8",
    });

    publicKey = (await _cosmos.publicKey(path)).compressed_pk;

    let signatures = {
        signature: "",
        pub_key:   {
            type:  'tendermint/PubKeySecp256k1',
            value: bytesToBase64(publicKey)
        }
    };

    const message = JSON.stringify(createSignMsg(unsignTx, signMeta));
   
    const signature = await _cosmos.sign([44, 60, 0, 0, 0], message);
    let tx = JSON.parse(message);

    tx.msg = tx.msgs;
    tx.msgs = undefined;

    signatures.signature = bytesToBase64(secp256k1.signatureImport(signature.signature));
    tx.signatures = [signatures];


    // const broadcastTx = await decimal.getTransaction('coin/send_coin', tx);
    const result = await decimal.postTx({mode: "sync", tx }, { sendTxDirectly: true });
    console.log(result);
}