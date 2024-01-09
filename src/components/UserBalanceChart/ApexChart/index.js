import React, { useEffect, useState } from 'react'
import {
  ComposedChart,
  XAxis,
  YAxis,
  Line,
  // Area,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
} from 'recharts'
import { useWindowWidth } from '@react-hook/window-size'
import { ClipLoader } from 'react-spinners'
import { useThemeContext } from '../../../providers/useThemeContext'
import { ceil10, floor10, round10, numberWithCommas } from '../../../utils'
import { LoadingDiv, NoData } from './style'
import { fromWei } from '../../../services/web3'

function formatDateTime(value) {
  const date = new Date(value)
  const year = date.getFullYear()
  const monthNames = [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'May',
    'Jun',
    'Jul',
    'Aug',
    'Sep',
    'Oct',
    'Nov',
    'Dec',
  ]
  const monthNum = date.getMonth()
  const month = monthNames[monthNum]
  const day = date.getDate()

  return `${day} ${month} ${year}`
}

function getRangeNumber(strRange) {
  let ago = 30
  if (strRange === '1W') {
    ago = 7
  } else if (strRange === '1M') {
    ago = 30
  } else if (strRange === 'ALL') {
    ago = 365
  }

  return ago
}

function getTimeSlots(ago, slotCount) {
  const slots = [],
    nowDate = new Date(),
    toDate = Math.floor(nowDate.getTime() / 1000),
    fromDate = Math.floor(nowDate.setDate(nowDate.getDate() - ago) / 1000),
    between = (toDate - fromDate) / slotCount
  for (let i = fromDate + between; i <= toDate; i += between) {
    slots.push(i)
  }

  return slots
}

function findMax(data) {
  const ary = data.map(el => el.y)
  const max = Math.max(...ary)
  return max
}
function findMin(data) {
  const ary = data.map(el => el.y)
  const min = Math.min(...ary)
  return min
}

function findMaxUnderlying(data) {
  const ary = data.map(el => el.z)
  const max = Math.max(...ary)
  return max
}
function findMinUnderlying(data) {
  const ary = data.map(el => el.z)
  const min = Math.min(...ary)
  return min
}

function generateChartDataWithSlots(
  slots,
  apiData,
  decimals,
  balance,
  priceUnderlying,
  sharePrice,
) {
  const seriesData = []
  for (let i = 0; i < slots.length; i += 1) {
    for (let j = 0; j < apiData.length; j += 1) {
      if (slots[i] > parseInt(apiData[j].timestamp, 10)) {
        const value1 = parseFloat(apiData[j][balance])
        const value2 = parseFloat(apiData[j][priceUnderlying])
        const value3 = fromWei(parseFloat(apiData[j][sharePrice]), decimals, Number(decimals) - 1)
        seriesData.push({ x: slots[i] * 1000, y: value1 * value2 * value3, z: value1 * value3 })
        break
      } else if (j === apiData.length - 1) {
        seriesData.push({ x: slots[i] * 1000, y: 0, z: 0 })
      }
    }
  }

  return seriesData
}

function formatXAxis(value, range) {
  const date = new Date(value)

  const month = date.getMonth() + 1
  const day = date.getDate()

  const hour = date.getHours()
  const mins = date.getMinutes()

  return range === '1D' ? `${hour}:${mins}` : `${month} / ${day}`
}

function getYAxisValues(min, max, roundNum) {
  const bet = Number(max - min)
  const ary = []
  for (let i = min; i <= max; i += bet / 4) {
    const val = round10(i, roundNum)
    ary.push(val)
  }
  return ary
}

const ApexChart = ({
  token,
  data,
  loadComplete,
  range,
  setCurDate,
  setCurContent,
  setCurContentUnderlying,
  handleTooltipContent,
  setFixedLen,
  fixedLen,
}) => {
  const { fontColor } = useThemeContext()

  const [mainSeries, setMainSeries] = useState([])

  const onlyWidth = useWindowWidth()

  const [loading, setLoading] = useState(false)
  const [isDataReady, setIsDataReady] = useState(true)
  const [roundedDecimal, setRoundedDecimal] = useState(2)
  const [roundedDecimalUnderlying, setRoundedDecimalUnderlying] = useState(2)

  const CustomTooltip = ({ active, payload, onTooltipContentChange }) => {
    useEffect(() => {
      if (active && payload && payload.length) {
        onTooltipContentChange(payload)
      }
    }, [active, payload, onTooltipContentChange])

    return null
  }

  const renderCustomXAxisTick = ({ x, y, payload }) => {
    let path = ''

    if (payload.value !== '') {
      path = formatXAxis(payload.value, range)
    }
    return (
      <text
        orientation="bottom"
        x={x - 12}
        y={y + 4}
        width={24}
        height={24}
        viewBox="0 0 1024 1024"
        fill="#000"
      >
        <tspan dy="0.71em">{path}</tspan>
      </text>
    )
  }

  const renderCustomYAxisTick = ({ x, y, payload }) => {
    let path = ''

    if (payload.value !== '') {
      path = `$${numberWithCommas(payload.value)}`
    }
    return (
      <text
        orientation="left"
        className="recharts-text recharts-cartesian-axis-tick-value"
        x={x}
        y={y}
        width={60}
        height={310}
        stroke="none"
        fill="#00D26B"
        textAnchor="start"
      >
        <tspan dx={0} dy="0.355em">
          {path}
        </tspan>
      </text>
    )
  }

  const renderCustomZAxisTick = ({ x, y, payload }) => {
    let path = ''

    if (payload.value !== '') {
      path = `${numberWithCommas(payload.value)}`
    }

    return (
      <text
        orientation="right"
        className="recharts-text recharts-cartesian-axis-tick-value"
        x={x}
        y={y}
        width={60}
        height={310}
        stroke="none"
        fill="#8884d8"
        textAnchor="end"
      >
        <tspan dx={0} dy="0.355em">
          {path}
        </tspan>
      </text>
    )
  }

  const [minVal, setMinVal] = useState(0)
  const [maxVal, setMaxVal] = useState(0)
  const [minValUnderlying, setMinValUnderlying] = useState(0)
  const [maxValUnderlying, setMaxValUnderlying] = useState(0)
  const [yAxisTicks, setYAxisTicks] = useState([])
  const [zAxisTicks, setZAxisTicks] = useState([])

  useEffect(() => {
    const init = async () => {
      setLoading(true)
      if (data === undefined) {
        setIsDataReady(false)
        return
      }

      let mainData = [],
        maxValue,
        minValue,
        maxValueUnderlying,
        minValueUnderlying,
        len = 0,
        lenUnderlying = 0,
        unitBtw,
        unitBtwUnderlying,
        firstDate,
        ago

      if ((data && data.length === 0) || !loadComplete) {
        setIsDataReady(false)
        return
      }

      if ((Object.keys(data).length === 0 && data.constructor === Object) || data.length === 0) {
        return
      }

      if (range === 'ALL') {
        for (let i = 1; i < data.length; i += 1) {
          if (data[i].value === 0) {
            firstDate = data[i].timestamp
            break
          }
        }
        if (firstDate === undefined) {
          firstDate = data[data.length - 1].timestamp
        }
        const nowDate = new Date(),
          toDate = Math.floor(nowDate.getTime() / 1000),
          periodDate = (toDate - Number(firstDate)) / (24 * 60 * 60)

        ago = Math.ceil(periodDate) + 10
      } else {
        ago = getRangeNumber(range)
      }

      const slotCount = 100,
        slots = getTimeSlots(ago, slotCount)
      mainData = generateChartDataWithSlots(
        slots,
        data,
        token.decimals || token.data.watchAsset.decimals,
        'value',
        'priceUnderlying',
        'sharePrice',
      )
      maxValue = findMax(mainData)
      minValue = findMin(mainData)
      minValue /= 1.01

      maxValueUnderlying = findMaxUnderlying(mainData)
      minValueUnderlying = findMinUnderlying(mainData)
      minValueUnderlying /= 1.01

      const between = maxValue - minValue
      const betweenUnderlying = maxValueUnderlying - minValueUnderlying
      unitBtw = between / 4
      unitBtwUnderlying = betweenUnderlying / 4
      if (unitBtw >= 1) {
        unitBtw = Math.ceil(unitBtw)
        len = unitBtw.toString().length
        unitBtw = ceil10(unitBtw, len - 1)
        maxValue = ceil10(maxValue, len - 1)
        minValue = floor10(minValue, len - 1)
      } else if (unitBtw === 0) {
        len = Math.ceil(maxValue).toString().length
        maxValue += 10 ** (len - 1)
        minValue -= 10 ** (len - 1)
      } else {
        len = Math.ceil(1 / unitBtw).toString().length + 1
        unitBtw = ceil10(unitBtw, -len)
        maxValue = ceil10(maxValue, -len)
        minValue = floor10(minValue, -len + 1)
      }

      if (unitBtwUnderlying >= 1) {
        unitBtwUnderlying = Math.ceil(unitBtwUnderlying)
        lenUnderlying = unitBtwUnderlying.toString().length
        unitBtwUnderlying = ceil10(unitBtwUnderlying, len - 1)
        maxValueUnderlying = ceil10(maxValueUnderlying, len - 1)
        minValueUnderlying = floor10(minValueUnderlying, len - 1)
      } else if (unitBtwUnderlying === 0) {
        lenUnderlying = Math.ceil(maxValueUnderlying).toString().length
        maxValueUnderlying += 10 ** (len - 1)
        minValueUnderlying -= 10 ** (len - 1)
      } else {
        lenUnderlying = Math.ceil(1 / unitBtwUnderlying).toString().length + 1
        unitBtwUnderlying = ceil10(unitBtwUnderlying, -lenUnderlying)
        maxValueUnderlying = ceil10(maxValueUnderlying, -lenUnderlying)
        minValueUnderlying = floor10(minValueUnderlying, -lenUnderlying + 1)
      }

      if (unitBtw !== 0) {
        if (minValue === 0) {
          maxValue *= 1.2
        } else {
          maxValue *= 1.01
        }
        // minValue = 0
      } else {
        unitBtw = (maxValue - minValue) / 4
      }

      if (unitBtwUnderlying !== 0) {
        if (minValueUnderlying === 0) {
          maxValueUnderlying *= 1.4
        } else {
          maxValueUnderlying *= 1.05
        }
        // minValueUnderlying = 0
      } else {
        unitBtwUnderlying = (maxValueUnderlying - minValueUnderlying) / 4
      }

      // if (unitBtw === 0) {
      //   roundNum = 0
      // } else {
      //   roundNum = len
      // }
      setRoundedDecimal(-len)
      setFixedLen(len)
      setRoundedDecimalUnderlying(-lenUnderlying)
      setMinVal(minValue)
      setMaxVal(maxValue)
      setMaxValUnderlying(maxValueUnderlying)
      setMinValUnderlying(minValueUnderlying)

      // Set date and price with latest value by default
      setCurDate(formatDateTime(mainData[mainData.length - 1].x))
      const balance = numberWithCommas(Number(mainData[mainData.length - 1].y).toFixed(fixedLen))
      const balanceUnderlying = numberWithCommas(Number(mainData[mainData.length - 1].z))
      setCurContent(balance)
      setCurContentUnderlying(balanceUnderlying)

      const yAxisAry = getYAxisValues(minValue, maxValue, roundedDecimal)
      setYAxisTicks(yAxisAry)

      const zAxisAry = getYAxisValues(
        minValueUnderlying,
        maxValueUnderlying,
        roundedDecimalUnderlying,
      )
      setZAxisTicks(zAxisAry)

      setMainSeries(mainData)

      setLoading(false)
    }

    init()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    range,
    data,
    token.decimals,
    isDataReady,
    loadComplete,
    roundedDecimal,
    setCurContent,
    setCurContentUnderlying,
    setCurDate,
    fixedLen,
  ])

  return (
    <>
      {!loading ? (
        <ResponsiveContainer
          width="100%"
          height={
            onlyWidth > 1291
              ? 346
              : onlyWidth > 1262
              ? 365
              : onlyWidth > 1035
              ? 365
              : onlyWidth > 992
              ? 365
              : 365
          }
        >
          <ComposedChart
            data={mainSeries}
            margin={{
              top: 20,
              right: 0,
              bottom: 0,
              left: roundedDecimal === 3 ? -14 : 0,
            }}
          >
            <defs>
              <linearGradient id="colorUvPrice" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#00D26B" stopOpacity={0.1} />
                <stop offset="95%" stopColor="#FFFFFF" stopOpacity={0.1} />
              </linearGradient>
            </defs>
            <CartesianGrid
              strokeDasharray="0"
              strokeLinecap="butt"
              stroke="rgba(228, 228, 228, 0.2)"
              vertical={false}
            />
            <Line
              dataKey="y"
              type="monotone"
              unit="$"
              strokeLinecap="round"
              strokeWidth={2}
              stroke="#00D26B"
              dot={false}
              legendType="none"
              yAxisId="left"
            />
            <Line
              dataKey="z"
              type="monotone"
              strokeLinecap="round"
              strokeWidth={2}
              stroke="#8884d8"
              dot={false}
              legendType="none"
              yAxisId="right"
            />
            <XAxis dataKey="x" tickLine={false} tickCount={5} tick={renderCustomXAxisTick} />
            <YAxis
              dataKey="y"
              tickCount={5}
              tick={renderCustomYAxisTick}
              ticks={yAxisTicks}
              domain={[minVal, maxVal]}
              stroke="#00D26B"
              yAxisId="left"
              orientation="left"
              mirror
            />
            <YAxis
              dataKey="z"
              tickCount={5}
              tick={renderCustomZAxisTick}
              ticks={zAxisTicks}
              domain={[minValUnderlying, maxValUnderlying]}
              stroke="#8884d8"
              yAxisId="right"
              orientation="right"
              mirror
            />
            {/* <YAxis
              dataKey="y"
              tickCount={5}
              tickFormatter={formatYAxisTick}
              stroke="#00D26B"
              yAxisId="left"
              orientation="left"
              mirror
            /> */}
            {/* <YAxis
              dataKey="z"
              tickCount={5}
              yAxisId="right"
              orientation="right"
              stroke="#8884d8"
              mirror
            /> */}
            <Tooltip
              content={<CustomTooltip onTooltipContentChange={handleTooltipContent} />}
              cursor={{
                stroke: '#00D26B',
                strokeDasharray: 3,
                strokeLinecap: 'butt',
              }}
            />
          </ComposedChart>
        </ResponsiveContainer>
      ) : (
        <LoadingDiv>
          {isDataReady ? (
            <ClipLoader size={30} margin={2} color={fontColor} />
          ) : (
            <NoData color={fontColor}>
              You don&apos;t have any fTokens of this farm. <br />
              Or, if you just converted tokens, it might take up to 5mins for the chart to appear.
            </NoData>
          )}
        </LoadingDiv>
      )}
    </>
  )
}

export default ApexChart