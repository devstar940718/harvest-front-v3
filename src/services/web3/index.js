import { SafeAppProvider } from '@safe-global/safe-apps-provider'
import SafeAppsSDK from '@safe-global/safe-apps-sdk'
import BigNumber from 'bignumber.js'
import { ethers } from 'ethers'
import mobile from 'is-mobile'
import { get } from 'lodash'
import Web3 from 'web3'
import {
  ARBISCAN_URL,
  ARBITRUM_URL,
  BASE_URL,
  BASESCAN_URL,
  ETHERSCAN_URL,
  INFURA_URL,
  isDebugMode,
  MATICSCAN_URL,
  MATIC_URL,
  POLL_BALANCES_INTERVAL_MS,
} from '../../constants'
import { CHAIN_IDS } from '../../data/constants'
import { formatNumber, isSafeApp } from '../../utils'
import contracts from './contracts'

export const getChainHexadecimal = chainId => `0x${Number(chainId).toString(16)}`

const SDK = new SafeAppsSDK()
export const infuraWeb3 = new Web3(INFURA_URL)
export const maticWeb3 = new Web3(MATIC_URL)
export const arbitrumWeb3 = new Web3(ARBITRUM_URL)
export const baseWeb3 = new Web3(BASE_URL)
export const safeProvider = async () => {
  const safe = await SDK.safe.getInfo()
  return new ethers.providers.Web3Provider(new SafeAppProvider(safe, SDK))
}
export const safeWeb3Provider = async () => {
  const safe = await SDK.safe.getInfo()
  return new SafeAppProvider(safe, SDK)
}
export const safeWeb3 = async () => {
  const safe = await SDK.safe.getInfo()
  return new Web3(new SafeAppProvider(safe, SDK))
}

export const mainWeb3 = new Web3(window.ethereum || INFURA_URL)

export const getContract = contractName => {
  return !!Object.keys(contracts).find(contractKey => contractKey === contractName)
}

export const fromWei = (wei, decimals, decimalsToDisplay = 2, format = false) => {
  if (wei != null) {
    wei = wei.toString()
  }
  const weiAmountInBN = new BigNumber(wei)
  let result = '0'

  if (typeof decimals !== 'undefined' && weiAmountInBN.isGreaterThan(0)) {
    result = weiAmountInBN.div(new BigNumber(10).exponentiatedBy(decimals)).toFixed()

    if (format) {
      result = formatNumber(result, decimalsToDisplay)
    }
  }
  return result
}

export const toWei = (token, decimals, decimalsToDisplay) => {
  if (token != null) {
    token = token.toString()
  }
  let tokenAmountInBN = new BigNumber(token)

  if (typeof decimals !== 'undefined' && tokenAmountInBN.isGreaterThan(0)) {
    tokenAmountInBN = tokenAmountInBN.multipliedBy(new BigNumber(10).exponentiatedBy(decimals))

    if (typeof decimalsToDisplay !== 'undefined') {
      tokenAmountInBN = tokenAmountInBN.decimalPlaces(decimalsToDisplay)
    }

    return tokenAmountInBN.toFixed()
  }
  return '0'
}

export const maxUint256 = () => {
  return ethers.constants.MaxUint256
}

export const formatWeb3PluginErrorMessage = (error, customMessage) => {
  console.error(error)

  return (
    customMessage || 'Error submitting transaction, please make sure it was approved in your wallet'
  )
}

export const hasValidUpdatedBalance = (newBalance, currentBalance, fresh) =>
  fresh ||
  newBalance === 'error' ||
  new BigNumber(newBalance).eq(0) ||
  !new BigNumber(newBalance).eq(new BigNumber(currentBalance))

export const pollUpdatedBalance = (method, currentBalance, onTimeout, onSuccess, maxRetries = 2) =>
  new Promise((resolve, reject) => {
    let retries = 0
    const pollBalance = setInterval(() => {
      if (retries >= maxRetries) {
        clearInterval(pollBalance)
        resolve(onTimeout())
      }

      retries += 1

      method
        .then(fetchedBalance => {
          if (hasValidUpdatedBalance(fetchedBalance, currentBalance)) {
            resolve(onSuccess(fetchedBalance))
            clearInterval(pollBalance)
          }
        })
        .catch(err => {
          console.error(err)
          reject(err)
        })
    }, POLL_BALANCES_INTERVAL_MS)
  })

export const getChainName = chainId => {
  switch (Number(chainId)) {
    case Number(CHAIN_IDS.ARBITRUM_ONE):
    case getChainHexadecimal(CHAIN_IDS.ARBITRUM_ONE):
      return 'Arbitrum One'
    case getChainHexadecimal(CHAIN_IDS.BASE):
      return 'Base'
    case Number(CHAIN_IDS.ETH_MAINNET):
    case getChainHexadecimal(CHAIN_IDS.ETH_MAINNET):
      return 'Ethereum Mainnet'
    case Number(CHAIN_IDS.ETH_ROPSTEN):
    case getChainHexadecimal(CHAIN_IDS.ETH_ROPSTEN):
      return 'Ethereum Ropsten'
    case Number(CHAIN_IDS.POLYGON_MAINNET):
    case getChainHexadecimal(CHAIN_IDS.POLYGON_MAINNET):
      return 'Polygon (Matic)'
    default:
      return `Unknown(${chainId})`
  }
}

export const getWeb3 = async (chainId, account, web3 = null) => {
  if (account) {
    if (isSafeApp()) {
      const safeWeb = await safeWeb3()
      return safeWeb
    }
    return web3 || mainWeb3
  }

  if (chainId === CHAIN_IDS.POLYGON_MAINNET) {
    return maticWeb3
  }

  if (chainId === CHAIN_IDS.ARBITRUM_ONE) {
    return arbitrumWeb3
  }

  if (chainId === CHAIN_IDS.BASE) {
    return baseWeb3
  }

  return infuraWeb3
}

export const newContractInstance = async (contractName, address, customAbi, web3Provider) => {
  const contractAddress = getContract(contractName)
    ? contracts[contractName].contract.address
    : address
  const contractAbi = getContract(contractName) ? contracts[contractName].contract.abi : customAbi

  if (contractAddress) {
    const web3Instance = web3Provider || mainWeb3
    return new web3Instance.eth.Contract(contractAbi, contractAddress)
  }
  return null
}

export const getExplorerLink = chainId => {
  switch (chainId) {
    case CHAIN_IDS.POLYGON_MAINNET:
      return MATICSCAN_URL
    case CHAIN_IDS.ARBITRUM_ONE:
      return ARBISCAN_URL
    case CHAIN_IDS.BASE:
      return BASESCAN_URL
    default:
      return ETHERSCAN_URL
  }
}

export const isMobileWeb3 = get(window, 'ethereum') && mobile()

export const handleWeb3ReadMethod = (methodName, params, instance) => {
  if (isDebugMode) {
    console.debug(`
Provider: ${get(instance, 'currentProvider.host') ? 'Infura/HttpProvider' : 'Injected web3'}
Contract address: ${get(instance, '_address')}
Method: ${methodName}
Params: ${params}
    `)
  }

  const contractMethod = instance.methods[methodName]
  return contractMethod(...params).call()
}
