import React, { createContext, useContext, useState, useEffect } from 'react'
import promiseObject from 'promise-all-object'
import importedContracts from '../services/web3/contracts'
import {
  newContractInstance,
  maticWeb3,
  arbitrumWeb3,
  baseWeb3,
  infuraWeb3,
} from '../services/web3'
import { isLedgerLive } from '../utils'
import { CHAIN_IDS } from '../data/constants'

const ContractsContext = createContext()
const useContracts = () => useContext(ContractsContext)

const getWeb3 = chainId => {
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

const ContractsProvider = _ref => {
  const { children } = _ref
  const [contracts, setContracts] = useState({})
  useEffect(() => {
    const initializeContracts = async () => {
      const temporaryGroupOfContracts = {}
      Object.keys(importedContracts).forEach(contract => {
        if (
          !isLedgerLive() ||
          (isLedgerLive() &&
            contract.chain !== CHAIN_IDS.ARBITRUM_ONE &&
            contract.chain !== CHAIN_IDS.BASE)
        ) {
          Object.assign(temporaryGroupOfContracts, {
            [contract]: {
              instance: newContractInstance(
                contract,
                null,
                null,
                getWeb3(importedContracts[contract].chain),
              ),
              methods: importedContracts[contract].methods,
              address: importedContracts[contract].contract.address,
            },
          })
        }
      })
      const initializedContracts = await promiseObject(temporaryGroupOfContracts)
      setContracts(initializedContracts)
    }

    initializeContracts()
  }, [])
  return React.createElement(
    ContractsContext.Provider,
    {
      value: {
        contracts,
      },
    },
    Object.keys(contracts).length ? children : '',
  )
}

export { ContractsProvider, useContracts }
