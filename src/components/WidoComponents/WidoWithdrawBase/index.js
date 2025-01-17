import BigNumber from 'bignumber.js'
import { isEmpty } from 'lodash'
import React, { useState, useEffect } from 'react'
import { useSetChain } from '@web3-onboard/react'
import { Spinner } from 'react-bootstrap'
import { toast } from 'react-toastify'
import ChevronRightIcon from '../../../assets/images/logos/wido/chevron-right.svg'
import DropDownIcon from '../../../assets/images/logos/wido/drop-down.svg'
import FARMIcon from '../../../assets/images/logos/wido/farm.svg'
import WidoIcon from '../../../assets/images/logos/wido/wido.svg'
import { POOL_BALANCES_DECIMALS } from '../../../constants'
import { useActions } from '../../../providers/Actions'
import { usePools } from '../../../providers/Pools'
import { useThemeContext } from '../../../providers/useThemeContext'
import { useWallet } from '../../../providers/Wallet'
import { fromWei, toWei } from '../../../services/web3'
import AnimatedDots from '../../AnimatedDots'
import Button from '../../Button'
import { CHAIN_IDS } from '../../../data/constants'
import { Divider } from '../../GlobalStyle'
import {
  Balance,
  BaseWido,
  NewLabel,
  PoweredByWido,
  StakeInfo,
  TokenAmount,
  TokenInfo,
  TokenName,
  TokenSelect,
  AmountInfo,
} from './style'
import { isSpecialApp } from '../../../utils'

const { tokens } = require('../../../data')

const getChainName = chain => {
  let chainName = 'Ethereum'
  switch (chain) {
    case CHAIN_IDS.POLYGON_MAINNET:
      chainName = 'Polygon'
      break
    case CHAIN_IDS.ARBITRUM_ONE:
      chainName = 'Arbitrum'
      break
    case CHAIN_IDS.BASE:
      chainName = 'Base'
      break
    default:
      chainName = 'Ethereum'
      break
  }
  return chainName
}

const WidoWithdrawBase = ({
  selectTokenWido,
  setSelectTokenWido,
  withdrawWido,
  setWithdrawWido,
  finalStep,
  pickedToken,
  unstakeBalance,
  setUnstakeBalance,
  symbol,
  fAssetPool,
  totalStaked,
  lpTokenBalance,
  setPendingAction,
  multipleAssets,
  token,
  supTokenList,
}) => {
  const [amountsToExecute, setAmountsToExecute] = useState('')
  const [unstakeClick, setUnstakeClick] = useState(false)
  const [stakeInputValue, setStakeInputValue] = useState(0)
  const [unstakeInputValue, setUnstakeInputValue] = useState(0)

  const isSpecialVault = token.liquidityPoolVault || token.poolVault
  const tokenDecimals = token.decimals || tokens[symbol].decimals

  const walletBalancesToCheck = multipleAssets || [symbol]

  const { account, getWalletBalances, connected, connectAction, chainId } = useWallet()
  const { fetchUserPoolStats, userStats } = usePools()
  const { handleExit } = useActions()
  const { backColor, borderColor, fontColor } = useThemeContext()

  const [
    {
      connectedChain, // the current chain the user's wallet is connected to
    },
    setChain, // function to call to initiate user to switch chains in their wallet
  ] = useSetChain()

  const tokenChain = token.chain || token.data.chain
  const curChain = isSpecialApp
    ? chainId
    : connectedChain
    ? parseInt(connectedChain.id, 16).toString()
    : ''
  const [withdrawName, setWithdrawName] = useState('Withdraw to Wallet')

  useEffect(() => {
    if (account) {
      if (curChain !== tokenChain) {
        const chainName = getChainName(tokenChain)
        setWithdrawName(`Switch to ${chainName}`)
      } else {
        setWithdrawName('Withdraw to Wallet')
      }
    }
  }, [account, curChain, tokenChain])

  const onClickUnStake = async () => {
    if (new BigNumber(totalStaked).isEqualTo(0)) {
      toast.error('Please stake first!')
      return
    }

    if (amountsToExecute === '') {
      toast.error('Please input amount for unstake!')
      return
    }

    const amountsToExecuteInWei = amountsToExecute.map(amount => {
      if (isEmpty(amount)) {
        return null
      }

      if (multipleAssets) {
        return toWei(amount, token.decimals, 0)
      }
      return toWei(amount, isSpecialVault ? tokenDecimals : token.decimals)
    })

    if (new BigNumber(amountsToExecuteInWei[0]) === 0) {
      toast.error('Please input value for Unstake!')
      return
    }

    const isAvailableUnstake = new BigNumber(amountsToExecuteInWei[0]).isLessThanOrEqualTo(
      totalStaked,
    )

    if (!isAvailableUnstake) {
      toast.error('Please input sufficient value for Unstake!')
      return
    }

    setUnstakeClick(true)

    const shouldDoPartialUnstake = new BigNumber(amountsToExecuteInWei[0]).isLessThan(totalStaked)

    await handleExit(
      account,
      fAssetPool,
      shouldDoPartialUnstake,
      amountsToExecuteInWei[0],
      setPendingAction,
      async () => {
        await fetchUserPoolStats([fAssetPool], account, userStats)
        await getWalletBalances(walletBalancesToCheck, false, true)
      },
    )

    setUnstakeClick(false)
    setStakeInputValue(0)
  }

  const onInputBalance = e => {
    setStakeInputValue(e.currentTarget.value)
    setAmountsToExecute([e.currentTarget.value])
  }

  const onInputUnstake = e => {
    setUnstakeInputValue(e.currentTarget.value)
    setUnstakeBalance(toWei(e.currentTarget.value, token.decimals))
  }

  const onClickWithdraw = async () => {
    if (pickedToken.symbol === 'Destination token') {
      toast.error('Please select token to withdraw!')
      return
    }
    const supToken = supTokenList.find(el => el.symbol === pickedToken.symbol)
    if (!supToken) {
      toast.error("Can't Withdraw with Unsupported token!")
      return
    }

    if (new BigNumber(unstakeBalance).isEqualTo(0)) {
      toast.error('Please input amount to withdraw!')
      return
    }

    if (!new BigNumber(unstakeBalance).isLessThanOrEqualTo(lpTokenBalance)) {
      toast.error('Please input sufficient amount to withdraw!')
      return
    }
    setWithdrawWido(true)
  }

  return (
    <BaseWido show={!selectTokenWido && !withdrawWido && !finalStep}>
      <div>
        <TokenName>
          <img src={FARMIcon} width={20} height={20} alt="" />
          {`f${symbol}`}
        </TokenName>
        <StakeInfo>
          Staked
          <AmountInfo
            onClick={() => {
              setStakeInputValue(Number(fromWei(totalStaked, fAssetPool.lpTokenData.decimals)))
              setAmountsToExecute([fromWei(totalStaked, fAssetPool.lpTokenData.decimals)])
            }}
          >
            {!connected ? (
              0
            ) : totalStaked ? (
              fromWei(totalStaked, fAssetPool.lpTokenData.decimals, POOL_BALANCES_DECIMALS, true)
            ) : (
              <AnimatedDots />
            )}
          </AmountInfo>
        </StakeInfo>
      </div>

      <NewLabel display="flex" justifyContent="space-between" marginTop="20px">
        <Balance backColor={backColor} width="49%">
          <TokenAmount
            type="number"
            value={stakeInputValue}
            borderColor={borderColor}
            backColor={backColor}
            fontColor={fontColor}
            onChange={onInputBalance}
          />
        </Balance>

        <Button
          color="wido-stake"
          width="49%"
          height="auto"
          onClick={async () => {
            if (curChain !== tokenChain) {
              const chainHex = `0x${Number(tokenChain).toString(16)}`
              if (!isSpecialApp) await setChain({ chainId: chainHex })
            } else {
              onClickUnStake()
            }
          }}
        >
          <NewLabel size="16px" weight="bold" height="21px">
            {unstakeClick ? (
              <Spinner
                as="span"
                animation="border"
                size="sm"
                role="status"
                style={{ margin: 'auto' }}
                aria-hidden="true"
              />
            ) : (
              'Unstake'
            )}
          </NewLabel>
        </Button>
      </NewLabel>

      <Divider height="1px" backColor="#EAECF0" marginTop="15px" />

      <StakeInfo>
        Unstaked
        <AmountInfo
          onClick={() => {
            setUnstakeBalance(lpTokenBalance)
            setUnstakeInputValue(Number(fromWei(lpTokenBalance, fAssetPool.lpTokenData.decimals)))
          }}
        >
          {!connected ? (
            0
          ) : lpTokenBalance ? (
            fromWei(lpTokenBalance, fAssetPool.lpTokenData.decimals, POOL_BALANCES_DECIMALS, true)
          ) : (
            <AnimatedDots />
          )}
        </AmountInfo>
      </StakeInfo>

      <NewLabel
        display="flex"
        position="relative"
        justifyContent="space-between"
        marginTop="15px"
        marginBottom="15px"
      >
        <Balance width="49%" backColor={backColor}>
          <TokenAmount
            type="number"
            value={unstakeInputValue}
            borderColor={borderColor}
            backColor={backColor}
            fontColor={fontColor}
            onChange={onInputUnstake}
          />
        </Balance>

        <TokenInfo>
          <TokenSelect
            type="button"
            onClick={async () => {
              setSelectTokenWido(true)
              if (!connected) {
                await connectAction()
              }
            }}
          >
            {pickedToken.logoURI ? (
              <img className="logo" src={pickedToken.logoURI} width={24} height={24} alt="" />
            ) : (
              <></>
            )}
            <NewLabel size="14px" weight="500" height="18px">
              <div className="token">{pickedToken.symbol}</div>
            </NewLabel>
            <img src={DropDownIcon} alt="" />
          </TokenSelect>
        </TokenInfo>
      </NewLabel>

      <Button
        color="wido-deposit"
        width="100%"
        size="md"
        onClick={async () => {
          if (curChain !== tokenChain) {
            const chainHex = `0x${Number(tokenChain).toString(16)}`
            await setChain({ chainId: chainHex })
          } else {
            onClickWithdraw()
          }
        }}
      >
        <NewLabel size="16px" weight="600" height="21px">
          {withdrawName}
        </NewLabel>
        <img src={ChevronRightIcon} alt="" />
      </Button>

      <PoweredByWido>
        <div>Powered By</div>
        <img src={WidoIcon} alt="" />
        <span>wido</span>
      </PoweredByWido>
    </BaseWido>
  )
}
export default WidoWithdrawBase
