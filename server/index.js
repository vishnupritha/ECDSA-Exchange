const express = require('express');
const app = express();
const cors = require('cors');
const SHA256 = require('crypto-js/sha256');
var EC = require('elliptic').ec;
var ec = new EC('secp256k1');
const secp = require('@noble/secp256k1');
const port = 3042;

// localhost can have cross origin errors
// depending on the browser you use!
app.use(cors());
app.use(express.json());

const privateKey1 = secp.utils.bytesToHex(secp.utils.randomPrivateKey());
const privateKey2 = secp.utils.bytesToHex(secp.utils.randomPrivateKey());
const privateKey3 = secp.utils.bytesToHex(secp.utils.randomPrivateKey());
const publicKey1 = secp.utils.bytesToHex(secp.getPublicKey(privateKey1)).slice(-40);
const publicKey2 = secp.utils.bytesToHex(secp.getPublicKey(privateKey2)).slice(-40);
const publicKey3 = secp.utils.bytesToHex(secp.getPublicKey(privateKey3)).slice(-40);

const balances = {
  [publicKey1]: 100,
  [publicKey2]: 50,
  [publicKey3]: 75,
}

app.get('/balance/:address', (req, res) => {
  const {address} = req.params;
  const balance = balances[address] || 0;
  res.send({ balance });
});

app.post('/send', (req, res) => {
  const {sender, recipient, amount, signature} = req.body;
  console.log(req.body);
  const msgHash = SHA256(JSON.stringify({sender, amount, recipient})).toString();
  var publickey = secp.utils.bytesToHex(secp.recoverPublicKey(msgHash, signature, 1));
  var publickeytemp = publickey.slice(-40);
  console.log(publickeytemp);
  const isValid = secp.verify(signature, msgHash, publickey);
  console.log(isValid);
  if(balances[publickeytemp])
  {
  balances[sender] -= amount;
  balances[recipient] = (balances[recipient] || 0) + +amount;
  res.send({ balance: balances[sender] });
  } else {
    console.log("Something's wrong !! address not found on the server");
  }
});

app.listen(port, () => {
  console.log(`Listening on port ${port}!`);
  console.log("Available address");
  console.log("===================");
  for (const i in balances){
    console.log(`${i}(${balances[i]})`);
  }  
  console.log("Private Keys ");
  console.log("===================");
  console.log(privateKey1);
  console.log(privateKey2);
  console.log(privateKey3);
});
