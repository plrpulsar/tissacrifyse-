const { ethers } = require("ethers");

const contractAddress = "0xE0c77dc2B8021C971c7c997127ff17b3Ed45F8eD"; // Dirección del contrato
const contractABI = [ /* El ABI de tu contrato aquí */ ];

let provider;
let signer;
let contract;
let userAddress;

let transactionCounter = 0;

async function initialize() {
    if (window.ethereum) {
        provider = new ethers.providers.Web3Provider(window.ethereum);
        signer = provider.getSigner();
        contract = new ethers.Contract(contractAddress, contractABI, signer);

        await ethereum.request({ method: 'eth_requestAccounts' });
        userAddress = await signer.getAddress();
        document.getElementById("walletAddress").getElementsByTagName('span')[0].innerText = userAddress;
    } else {
        alert("Por favor instala MetaMask");
    }
}

async function getBalance() {
    const address = document.getElementById("addressInput").value;
    if (!ethers.utils.isAddress(address)) {
        alert("Dirección inválida");
        return;
    }

    const balance = await contract.balanceOf(address);
    document.getElementById("balanceResult").getElementsByTagName('span')[0].innerText = ethers.utils.formatUnits(balance, 18);
}

async function transferTokens() {
    const recipient = document.getElementById("recipient").value;
    const amount = document.getElementById("amount").value;

    if (!ethers.utils.isAddress(recipient)) {
        alert("Dirección de destinatario inválida");
        return;
    }

    if (isNaN(amount) || amount <= 0) {
        alert("Cantidad inválida");
        return;
    }

    try {
        const tx = await contract.transfer(recipient, ethers.utils.parseUnits(amount, 18));
        await tx.wait();
        alert("Transferencia realizada con éxito");
        incrementCounter();  // Incrementar el contador de transacciones
    } catch (error) {
        alert("Error en la transferencia: " + error.message);
    }
}

function incrementCounter() {
    transactionCounter++;
    document.getElementById("counter").innerText = transactionCounter;
}

document.getElementById("connectWallet").addEventListener("click", initialize);
document.getElementById("getBalance").addEventListener("click", getBalance);
document.getElementById("transferTokens").addEventListener("click", transferTokens);
document.getElementById("incrementCounter").addEventListener("click", incrementCounter);
