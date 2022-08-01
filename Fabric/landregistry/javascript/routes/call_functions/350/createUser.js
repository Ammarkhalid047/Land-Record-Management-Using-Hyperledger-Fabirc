/*
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict';

const { FileSystemWallet, Gateway } = require('fabric-network');
const path = require('path');

const ccpPath = path.resolve(__dirname, '..', '..','..', '..','..', 'first-network', 'connection-org1.json');

async function main(userName,password,email,imageUrl,nid) {
    try {
	nid = 'NOT';
	userName = 'Ammar';
	password = '12345';
	email = 'ak.mughal05@gmail.com';
	imageUrl = 'sdfdfs';
        // Create a new file system based wallet for managing identities.
        const walletPath = path.join(process.cwd(),'/routes/call_functions', 'wallet');
        const wallet = new FileSystemWallet(walletPath);
        console.log(`Wallet path: ${walletPath}`);

        // Check to see if we've already enrolled the user.
        const userExists = await wallet.exists(nid);
        if (!userExists) {
            console.log('An identity for the user '+nid+' does not exist in the wallet');
            console.log('Run the registerUser.js application before retrying');
            return true;
        }

        // Create a new gateway for connecting to our peer node.
        const gateway = new Gateway();
        await gateway.connect(ccpPath, { wallet, identity: nid, discovery: { enabled: true, asLocalhost: true } });

        // Get the network (channel) our contract is deployed to.
        const network = await gateway.getNetwork('mychannel');

        // Get the contract from the network.
        const contract = network.getContract('landregistry');
        await contract.submitTransaction('createUser', nid , userName , email , imageUrl , password);
        console.log('Transaction has been submitted');

        // Disconnect from the gateway.
        await gateway.disconnect();

    } catch (error) {
        console.error(`Failed to submit transaction: ${error}`);
        process.exit(1);
    }
}

main();


