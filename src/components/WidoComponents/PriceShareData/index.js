import React, { useEffect, useState } from 'react'
import { getPriceFeed } from '../../../utils'
import PriceChart from '../PriceChart'
import ChartRangeSelect from '../ChartRangeSelect'
import {
  ButtonGroup,
  ChartDiv,
  Container,
  Header,
  Total,
  TokenSymbol,
  TooltipInfo,
  FlexDiv,
  CurContent,
} from './style'
import { FARM_TOKEN_SYMBOL, IFARM_TOKEN_SYMBOL } from '../../../constants'

const recommendLinks = [
  { name: '1W', type: 1, state: '1W' },
  { name: '1M', type: 2, state: '1M' },
  { name: '1Y', type: 3, state: '1Y' },
]

const PriceShareData = ({ token, vaultPool, tokenSymbol }) => {
  const [selectedState, setSelectedState] = useState('1Y')

  const address = token.vaultAddress || vaultPool.autoStakePoolAddress || vaultPool.contractAddress
  const chainId = token.chain || token.data.chain

  const [apiData, setApiData] = useState({})
  const [loadComplete, setLoadComplete] = useState(true)
  const [curDate, setCurDate] = useState('')
  const [curContent, setCurContent] = useState('')

  const symbol = tokenSymbol === FARM_TOKEN_SYMBOL ? IFARM_TOKEN_SYMBOL : `f${tokenSymbol}`

  useEffect(() => {
    const initData = async () => {
      const { data, flag } = await getPriceFeed(address, chainId)
      setLoadComplete(flag)
      setApiData(data)
    }

    initData()
  }, [address, chainId])

  return (
    <Container>
      <Header>
        <Total>
          <FlexDiv>
            <TooltipInfo>
              <TokenSymbol>{`${symbol} Price`}</TokenSymbol>
              <FlexDiv>
                <CurContent color="#1b1b1b">{curDate}&nbsp;:&nbsp;</CurContent>
                <CurContent color="#00D26B">{curContent}</CurContent>
              </FlexDiv>
            </TooltipInfo>
          </FlexDiv>
          <ButtonGroup>
            {recommendLinks.map((item, i) => (
              <ChartRangeSelect
                key={i}
                onClick={() => {
                  setSelectedState(item.state)
                }}
                state={selectedState}
                type={item.type}
                text={item.name}
              />
            ))}
          </ButtonGroup>
        </Total>
      </Header>
      <ChartDiv>
        <PriceChart
          data={apiData}
          loadComplete={loadComplete}
          range={selectedState}
          setCurDate={setCurDate}
          setCurContent={setCurContent}
        />
      </ChartDiv>
    </Container>
  )
}
export default PriceShareData
