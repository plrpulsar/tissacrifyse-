const { ethers } = require("ethers");

const contractAddress = "0xE0c77dc2B8021C971c7c997127ff17b3Ed45F8eD"; // Dirección del contrato
const contractABI = [ [
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "spender",
				"type": "address"
			},
			{
				"internalType": "uint256",
				"name": "amount",
				"type": "uint256"
			}
		],
		"name": "approve",
		"outputs": [
			{
				"internalType": "bool",
				"name": "",
				"type": "bool"
			}
		],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "account",
				"type": "address"
			}
		],
		"name": "balanceOf",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "recipient",
				"type": "address"
			},
			{
				"internalType": "uint256",
				"name": "amount",
				"type": "uint256"
			}
		],
		"name": "transfer",
		"outputs": [
			{
				"internalType": "bool",
				"name": "",
				"type": "bool"
			}
		],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "sender",
				"type": "address"
			},
			{
				"internalType": "address",
				"name": "recipient",
				"type": "address"
			},
			{
				"internalType": "uint256",
				"name": "amount",
				"type": "uint256"
			}
		],
		"name": "transferFrom",
		"outputs": [
			{
				"internalType": "bool",
				"name": "",
				"type": "bool"
			}
		],
		"stateMutability": "nonpayable",
		"type": "function"
	}

let provider;
let signer;
let contract;
let userAddress;

let transactionCounter = 0;

async function initialize() {
    if (window.ethereum) {
        try {
            provider = new ethers.providers.Web3Provider(window.ethereum);
            signer = provider.getSigner();
            contract = new ethers.Contract(contractAddress, contractABI, signer);

            // Solicitar al usuario que conecte su billetera (MetaMask)
            await ethereum.request({ method: 'eth_requestAccounts' });

            userAddress = await signer.getAddress();
            document.getElementById("walletAddress").getElementsByTagName('span')[0].innerText = userAddress;
            
            // Actualizar el estado de la billetera
            document.getElementById("connectWallet").innerText = "Billetera Conectada";
            document.getElementById("connectWallet").disabled = true;

            // Establecer el proveedor de eventos para cambios en la red o cuenta de MetaMask
            ethereum.on('accountsChanged', (accounts) => {
                if (accounts.length === 0) {
                    alert("MetaMask desconectada");
                    document.getElementById("walletAddress").getElementsByTagName('span')[0].innerText = "Desconocido";
                    document.getElementById("connectWallet").innerText = "Conectar Wallet";
                    document.getElementById("connectWallet").disabled = false;
                } else {
                    userAddress = accounts[0];
                    document.getElementById("walletAddress").getElementsByTagName('span')[0].innerText = userAddress;
                }
            });

            ethereum.on('chainChanged', (chainId) => {
                window.location.reload();
            });
        } catch (error) {
            alert("No se pudo conectar a MetaMask: " + error.message);
        }
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

    try {
        const balance = await contract.balanceOf(address);
        document.getElementById("balanceResult").getElementsByTagName('span')[0].innerText = ethers.utils.formatUnits(balance, 18);
    } catch (error) {
        alert("Error al obtener balance: " + error.message);
    }
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

async function sacrificeTokens() {
    const amount = document.getElementById("sacrificeAmount").value;

    if (isNaN(amount) || amount <= 0) {
        alert("Cantidad inválida para sacrificar");
        return;
    }

    const confirmation = confirm("¿Estás seguro de que deseas sacrificar estos tokens?");
    if (confirmation) {
        try {
            // Dirección para "quemar" los tokens (sacrificio)
            const burnAddress = "0x000000000000000000000000000000000000dEaD"; 

            const tx = await contract.transfer(burnAddress, ethers.utils.parseUnits(amount, 18));
            await tx.wait();
            alert("Tokens sacrificados con éxito");
            incrementCounter();  // Incrementar el contador de transacciones
        } catch (error) {
            alert("Error en el sacrificio: " + error.message);
        }
    }
}

function incrementCounter() {
    transactionCounter++;
    document.getElementById("counter").innerText = transactionCounter;
}

// Funciones de interacción
document.getElementById("connectWallet").addEventListener("click", initialize);
document.getElementById("getBalance").addEventListener("click", getBalance);
document.getElementById("transferTokens").addEventListener("click", transferTokens);
document.getElementById("sacrificeTokens").addEventListener("click", sacrificeTokens);
document.getElementById("incrementCounter").addEventListener("click", incrementCounter);

