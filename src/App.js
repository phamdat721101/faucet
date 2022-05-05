
import { useCallback, useEffect, useState } from "react";
import "./App.css";
import Web3 from "web3";
import detectEthereumProvider from '@metamask/detect-provider'
import { loadContract } from "./utils/load-contract";


function App() {
  const [web3Api, setWeb3Api] = useState({
    provider: null,
    isProviderLoaded: false,
    web3: null,
    contract: null
  })

  const [balance, setBallance] = useState(null)
  const [account, setAccount] = useState(null)
  const [shouldReload, reload] = useState(false)

  const canConnectToContract = account && web3Api.contract
  const reloadEffect = useCallback(() => reload(!shouldReload), [shouldReload])

  const setAccountListener = provider => {
    provider.on("accountsChanged", _ => window.location.reload())
    provider.on("chainChanged", _ => window.location.reload())
  }

  useEffect(() => {
    const loadProvider = async () => {
      const provider = await detectEthereumProvider()
      if (provider) {
        const contract = await loadContract("Faucet", provider)
        setAccountListener(provider)
        setWeb3Api({
          web3: new Web3(provider),
          provider,
          contract,
          isProviderLoaded: true
        })
      } else {
        setWeb3Api(api => ({ ...api, isProviderLoaded: true }))
        console.error("Please, install Metamask.")
      }
    }

    loadProvider()
  }, [])

  useEffect(() => {
    const loadBalance = async () => {
      const { contract, web3 } = web3Api
      const balance = await web3.eth.getBalance(contract.address)
      setBallance(web3.utils.fromWei(balance, "ether"))
    }

    web3Api.contract && loadBalance()
  }, [web3Api, shouldReload])

  useEffect(() => {
    const getAccount = async () => {
      const accounts = await web3Api.web3.eth.getAccounts()
      setAccount(accounts[0])
    }

    web3Api.web3 && getAccount()
  }, [web3Api.web3])

  const addFunds = useCallback(async () => {
    const { contract, web3 } = web3Api
    await contract.addFunds({
      from: account,
      value: web3.utils.toWei("1000", "ether")
    })
    reloadEffect()
  }, [web3Api, account, reloadEffect])

  const withdraw = async () => {
    const privKey = '6ee44874d355c054c138a417c5a725cccf7353460892125e028e60ebc8c77129'; // Genesis private key
    const addressFrom = '0xF7FCCFc3DE0789362B5B998782992a27b12040c8';
    console.log("Accouny: ", account)
    const createTransaction = await web3Api.web3.eth.accounts.signTransaction(
      {
         from: addressFrom,
         to: account,
         value: web3Api.web3.utils.toWei('5', 'ether'),
         gas: '21000',
      },
      privKey
    );

    // Deploy transaction
    const createReceipt = await web3Api.web3.eth.sendSignedTransaction(
        createTransaction.rawTransaction
    );
    alert(
        `Transaction successful with hash: ${createReceipt.transactionHash}`
    );
    reloadEffect()
  }

  return (
    <>
      <div className="faucet-wrapper">
        <div className="faucet box">
          <h1 class="subtitle is-1">Faucet Application</h1>
          {web3Api.isProviderLoaded ?
            <div className="is-flex is-align-items-center">
              <span>
                <strong className="mr-2 is-size-3">Account: </strong>
              </span>
              {account ?
                <div className="is-size-4">{account}</div> :
                !web3Api.provider ?
                  <>
                    <div className="notification is-warning is-small is-rounded">
                      Wallet is not detected!{` `}
                      <a target="_blank" href="https://docs.metamask.io" rel="noreferrer">
                        Install Metamask
                      </a>
                    </div>
                  </> :
                  <button
                    className="button is-small"
                    onClick={() =>
                      web3Api.provider.request({ method: "eth_requestAccounts" }
                      )}
                  >
                    Connect Wallet
                  </button>
              }
            </div> :
            <span>Looking for Web3...</span>
          }
          
          {!canConnectToContract &&
            <i className="is-block">
              Connect to Ganache
            </i>
          }
          
          <button
            disabled={!canConnectToContract}
            onClick={withdraw}
            className="button is-dark"><strong>Get 5 FXCE</strong></button>
        </div>
      </div>
    </>
  );
}

export default App;