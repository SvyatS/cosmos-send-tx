import { Decimal } from "decimal-js-sdk";
import TransportWebUSB from "@ledgerhq/hw-transport-webusb";
import CosmosApp from "./src";

//Infuria provider for Ropsten network

const decimalOptions = {
    restURL: 'https://devnet-gate.decimalchain.com/api/rpc/'
  }

const decimal = new Decimal(decimalOptions);  
// const provider = new ethers.providers.JsonRpcProvider("https://ropsten.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161");


let chainId;
let gasPrice;
let addressWallet = 'dx1z4x4r0ljrkserqrqpn65g98h50mjkc0qxas0ps';
let recipient = "dx14kskueht0ul2qme5qmwjvlmjr9thd0x3x9ffrw";
let value = 1;
let gasLimit = 1000000;
let nonce;
let _cosmos;




document.getElementById("connect-ledger").onclick = async function () {

    // let unsignTx = await decimal.prepareTx('coin/send_coin', (value * Math.pow(10, 18)).toString());
    // let signMeta = await decimal.getMeta(wallet = { address: addressWallet });

    // const signature = await _cosmos.signTransaction("44'/60'/0'/0/0", unsignedTx);

    // console.info({unsignTx, signMeta})




    //Connecting to the Ledger Nano with USB protocol
    const transport = await TransportWebUSB.create();


    const path = [44, 118, 5, 0, 3];
    
    //Getting an Cosmos instance and get the Ledger Nano cosmos account public key
    _cosmos = new CosmosApp(transport);
    const { bech32_address: address } = await _cosmos.getAddressAndPubKey(path, "cosmos");

    console.log(address);


    //Get some properties from provider
    // gasPrice = (await provider.getGasPrice())._hex;
    // gasPrice = parseInt(gasPrice,16) * 1.15;

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
    // nonce =  await provider.getTransactionCount(addressWallet, "latest");

    //Building transaction with the information gathered
    const transaction = {
        to: recipient,
        gasPrice: "0x" + parseInt(gasPrice).toString(16),
        // gasLimit: ethers.utils.hexlify(gasLimit),
        // nonce: nonce,
        chainId: chainId,
        data: "0x00",
        // value: ethers.utils.parseUnits(value, "ether")._hex,
    }


    let unsignTx = await decimal.prepareTx('coin/send_coin', (value * Math.pow(10, 18)).toString());
    let signMeta = await decimal.getMeta(wallet = { address: addressWallet });

    const signature = await _cosmos.signTransaction("44'/60'/0'/0/0", unsignedTx);

    // Parse the signature
    signature.r = "0x"+signature.r;
    signature.s = "0x"+signature.s;
    signature.v = parseInt(signature.v);
    signature.from = addressWallet;

    console.log()







    // //Serializing the transaction to pass it to Ledger Nano for signing
    // let unsignedTx = ethers.utils.serializeTransaction(transaction).substring(2);

    // //Sign with the Ledger Nano (Sign what you see)
    

    

    //Serialize the same transaction as before, but adding the signature on it
    // let signedTx = ethers.utils.serializeTransaction(transaction, signature);

    //Sending the transaction to the blockchain
    // const hash = (await provider.sendTransaction(signedTx)).hash;

    //Display the Ropsten etherscan on the screen
    // const url = "https://ropsten.etherscan.io/tx/" + hash;
    // document.getElementById("url").innerHTML = url;
}