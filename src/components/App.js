import React, { useEffect } from 'react'
import './App.css'
import { ApolloClient } from 'apollo-client'
import { InMemoryCache } from 'apollo-cache-inmemory'
import { HttpLink } from 'apollo-link-http'
import { useQuery } from '@apollo/react-hooks'
import gql from 'graphql-tag'
import uniswapLogo from '../uniswap-logo.png'
import daiLogo from '../dai-logo.png'

// The client is imported into index.js to establish a connection to the ApolloProvider which allows us to talk to The Graph
export const client = new ApolloClient({
  link: new HttpLink({
    uri: 'https://api.thegraph.com/subgraphs/name/uniswap/uniswap-v2'
  }),
  fetchOptions: {
    // We use no-cors mode for the request
    mode: 'no-cors'
  },
  cache: new InMemoryCache()
})





const ALL_TOKENS_QUERY = gql`
  query tokens {
    tokens (first: 50, skip: 3000, orderBy: symbol, orderDirection: asc) {
      id
      symbol
      name
    }
  }
`

const ALL_PAIRS_QUERY = gql`
  query pairs {
    pairs (first: 1000, orderBy: reserveUSD, orderDirection: desc) {
      id
      reserveUSD
      token0 {
        symbol
        name
      }
      token1 {
        symbol
        name
      }
    }
  } 
`


const UNISWAP_DAY_DATA = gql`
  query uniswapDayDatas {
    uniswapDayDatas {
      dailyVolumeUSD
      totalVolumeUSD
      totalLiquidityUSD
    }
  }
`




const LIQUIDITY_POSITIONS = gql`
  query liquidityPositions {
    liquidityPositions (where: { id: "0x00004ee988665cdda9a1080d5792cecd16dc1220-0x2e0647b90c3823a8c881de287ae2bd400489eea0" }) {
      liquidityTokenBalance
    }
  }
`

const UNISWAP_FACTORY = gql`
  query uniswapFactories {
    uniswapFactories {
      pairCount
      totalVolumeUSD
      totalVolumeETH
      totalLiquidityUSD
      totalLiquidityETH
      txCount
      mostLiquidTokens {
        token
      }
    }
  }
`









const DAI_QUERY = gql`
  query tokens($tokenAddress: Bytes!) {
    tokens(where: { id: $tokenAddress }) {
      derivedETH
      totalLiquidity
    }
  }
`

const ETH_PRICE_QUERY = gql`
  query bundles {
    bundles(where: { id: "1" }) {
      ethPrice
    }
  }
`


const BTC_QUERY = gql`
  query tokens {
    tokens (where: {name: "Bitcoin"}, first: 1) {
      symbol
      name
      totalSupply
      tradeVolume
      tradeVolumeUSD
      totalLiquidity
      txCount
    }
  }
`

const WBTC_QUERY = gql`
  query tokens {
    tokens (where: {name: "Wrapped Bitcoin"}, first: 1) {
      symbol
      name
      totalSupply
      tradeVolume
      txCount
    }
  }
`

const USDT_QUERY = gql`
  query tokens {
    tokens (where: {symbol: "USDT"}, first: 1) {
      symbol
      name
      totalSupply
      tradeVolume
      txCount
    }
  }
`
const USDC_QUERY = gql`
  query tokens {
    tokens (where: {symbol: "USDC"}, first: 1) {
      symbol
      name
      totalSupply
      tradeVolume
      tradeVolumeUSD
      untrackedVolumeUSD
      txCount
    }
  }
`

// Query a pair using addresses of BOTH tokens
const USDC_DAI_POOL_QUERY = gql`
  query pairs {
    pairs (where :{token0: "0x6b175474e89094c44da98b954eedeac495271d0f", token1: "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48"}) {
      id
      createdAtTimestamp
      volumeUSD
      token0 {
        symbol
        name
        totalSupply
        tradeVolumeUSD
        totalLiquidity
      }
      token1 {
        symbol
      }
      token0Price
      token1Price
      volumeToken0
      volumeToken1
      liquidityProviderCount
    }
  }
`

// Query a pair with pair address
const DAI_WETH_QUERY = gql`
  query pair {
    pair (id: "0xa478c2975ab1ea89e8196811f51a7b7ade33eb11"){
     token0 {
       id
       symbol
       name
       derivedETH
     }
     token1 {
       id
       symbol
       name
       derivedETH
     }
     reserve0
     reserve1
     reserveUSD
     trackedReserveETH
     token0Price
     token1Price
     volumeUSD
     txCount
    }
  }
`

// Query last 100 swaps of LINK/USDC
  // Pair addresses from info.uniswap returned empty arrays - use pair addresses from ALL_PAIRS_QUERY
const DAI_USDT_SWAP_QUERY = gql`
  query daiUsdtSwaps {
    swaps(first: 10, orderBy: timestamp, orderDirection: desc, where: { pair: "0xb20bd5d04be54f870d5c0d3ca85d82b34b836405" }) {
      timestamp
      pair {
        token0 {
          symbol
        }
        token1 {
          symbol
        }
      }
      sender
      amount0In
      amount0Out
      amount1In
      amount1Out
      amountUSD
      to
    }
  }
`

const PAIR_DAY_DATA = gql`
  query pairDayDatas {
    pairDayDatas (first: 100, where: {pairAddress: "0xa478c2975ab1ea89e8196811f51a7b7ade33eb11"}) {
      date
      token0 {
        symbol
      }
      token1 {
        symbol
      }
      reserveUSD
      dailyVolumeToken0
      dailyVolumeToken1
      dailyVolumeUSD
      reserveUSD
    }
  }
`











function App() {

  // EXECUTE THE QUERIES
  // Define vars using useQuery so we can make Apollo queries with React using React hooks
  // Whenever the App component renders, the useQuery hook automatically executes our query and returns a destructured object containing loading, error, and data properties
    // We unpack these properties from the object and assign them to new variable names
        // As long as loading (ethLoading/daiLoading) is true, the query is still in flight
        // When loading is no longer true, the query has completed and our component will render 
  const { loading: ethLoading, data: ethPriceData } = useQuery(ETH_PRICE_QUERY)
  const { loading: daiLoading, data: daiData } = useQuery(DAI_QUERY, {
    // Pass in the vars that our query requires - in this case the DAI mainnet contract address
    variables: {
      tokenAddress: '0x6b175474e89094c44da98b954eedeac495271d0f'
    }
  })
  
  // General Queries
  const { loading: allTokensLoading, error: allTokensError, data: allTokensData } = useQuery(ALL_TOKENS_QUERY)
  const { loading: allPairsLoading, error: allPairsError, data: allPairsData } = useQuery(ALL_PAIRS_QUERY)
  const { loading: uniswapDayDataLoading, error: uniswapDayDataError, data: uniswapDayDataData } = useQuery(UNISWAP_DAY_DATA) 
  const { loading: liquidityPositionsLoading, error: liquidityPositionsError, data: liquidityPositionsData } = useQuery(LIQUIDITY_POSITIONS) 
  const { loading: uniswapFactoryLoading, error: uniswapFactoryError, data: uniswapFactoryData } = useQuery(UNISWAP_FACTORY) 

  // Token Queries
  const { loading: btcLoading, error: btcError, data: btcData } = useQuery(BTC_QUERY)
  const { loading: wbtcLoading, error: wbtcError, data: wbtcData } = useQuery(WBTC_QUERY)
  const { loading: usdtLoading, error: usdtError, data: usdtData } = useQuery(USDT_QUERY)
  const { loading: usdcLoading, error: usdcError, data: usdcData } = useQuery(USDC_QUERY) 

  // Pair Queries
  const { loading: usdcDaiPoolLoading, error: usdcDaiPoolError, data: usdcDaiPoolData } = useQuery(USDC_DAI_POOL_QUERY)
  const { loading: daiWethPoolLoading, error: daiWethPoolError, data: daiWethPoolData } = useQuery(DAI_WETH_QUERY)

  // Swap Queries
  const { loading: daiUsdtSwapLoading, error: daiUsdtSwapError, data: daiUsdtSwapData } = useQuery(DAI_USDT_SWAP_QUERY)

  // PairDayData Queries
  const { loading: pairDayDataLoading, error: pairDayDataError, data: pairDayDataData } = useQuery(PAIR_DAY_DATA) 






  // We format the data we get back from the queries by drilling down into the values we specified in our queries
  // We use the Logical AND operator to render something or nothing
    // The constant is defined by data returned by the API queries
    // Evaluating from L to R, we'll either receive the value of the first falsy encountered OR if all values are truthy we will receive the last of the last operand
      // ie daiPriceInEth = IF daiData is truthy AND daiData.tokens[0] is truthy, return the value of daiData.tokens[0]
  const daiPriceInEth = daiData && daiData.tokens[0].derivedETH
  const daiTotalLiquidity = daiData && daiData.tokens[0].totalLiquidity
  const ethPriceInUSD = ethPriceData && ethPriceData.bundles[0].ethPrice

  const daiUsdtSwapTime = daiUsdtSwapData && daiUsdtSwapData.swaps[0].timestamp
  const daiUsdtSwapConvertTime = new Date(daiUsdtSwapTime * 1000).toDateString()

  const daiWethTVL = daiWethPoolData && daiWethPoolData.pair.reserveUSD



  console.log("allTokensData: ", allTokensData)
  console.log("allPairsData: ", allPairsData)
  console.log("allPairsError: ", allPairsError)
  console.log("uniswapDayDataData: ", uniswapDayDataData)
  console.log("liquidityPositionsData: ", liquidityPositionsData)
  console.log("uniswapFactory: ", uniswapFactoryData)
  console.log("daiData: ", daiData)
  console.log("ethPriceData: ", ethPriceData)
  console.log("btcData: ", btcData)
  console.log("wbtcData: ", wbtcData)
  console.log("usdtData: ", usdtData)
  console.log("usdcData: ", usdcData)
  console.log("usdcDaiPoolData: ", usdcDaiPoolData)
  console.log("daiWethTVL: ", daiWethTVL)
  console.log("💥daiWethPoolData: ", daiWethPoolData)
  console.log("🔥daiUsdtSwapData: ", daiUsdtSwapData)
  console.log("daiUsdtSwapTime: ", daiUsdtSwapTime)
  console.log("daiUsdtSwapConvertTime: ", daiUsdtSwapConvertTime)
  console.log("pairDayDataData: ", pairDayDataData)






  return (
    <div>
      <nav className="navbar navbar-dark fixed-top bg-dark flex-md-nowrap p-0 shadow">
        <a
          className="navbar-brand col-sm-3 col-md-2 mr-0"
          href=""
          target="_blank"
          rel="noopener noreferrer"
        >
          <img src={uniswapLogo} width="30" height="30" className="d-inline-block align-top" alt="" />
          &nbsp; Uniswap Explorer
        </a>
      </nav>
      <div className="container-fluid mt-5">
        <div className="row">
          <main role="main" className="col-lg-12 d-flex text-center">
            <div className="content mr-auto ml-auto">
              <div>
                <img src={daiLogo} width="150" height="150" className="mb-4" alt="" />
                <h2>
                  {/*We render based on the conditions of the query*/}
                  DAI Price:{' '}
                  {ethLoading || daiLoading
                    ? 'Loading token data...'
                    : '$' +
                      // parse responses as floats and fix to 2 decimals
                      // parseFloat excepts a string and parses it to a floating point number
                      (parseFloat(daiPriceInEth) * parseFloat(ethPriceInUSD)).toFixed(2)}
                </h2>
                <h2>
                  DAI/WETH Pool TVL: ${Number.parseFloat(daiWethTVL).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                </h2>
                <h2>
                  DAI Total Liquidity:{' '}
                  {daiLoading
                    ? 'Loading token data...'
                    : // display the total amount of DAI spread across all pools
                      parseFloat(daiTotalLiquidity).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                </h2>
                <h2>
                  ETH Price:{' '}
                  {daiLoading
                    ? 'Loading token data...'
                    : '$' + // display the total amount of DAI spread across all pools
                      parseFloat(ethPriceInUSD).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                </h2>
                <div>
                  {daiUsdtSwapLoading
                    ? 'Loading swap data...'
                    : daiUsdtSwapData.swaps.map(({timestamp, pair, sender, amount0In, amount0Out, amount1In, amount1Out, to} : daiUsdtSwaps_swaps) => (
                      <div key={timestamp} style={{marginBottom: "25px"}}>
                        <p>
                         Time: {new Date(timestamp * 1000).toLocaleString('en-US', {timeZone: 'EST'})}
                        </p>
                        <p>
                          Swap Pair: {pair.token0.symbol}/{pair.token1.symbol}
                        </p>

                        {
                          amount0In > 0
                          ?
                          <span>              
                            {Number.parseFloat(amount0In).toFixed(2)} DAI                        
                          </span>
                          :
                          <span>                       
                            {Number.parseFloat(amount1In).toFixed(2)} USDT                        
                          </span>
                        }
                        <h6 >From: {sender.substring(0,6)}..{sender.substring(38,42)}</h6>
                        
                        {
                          amount0Out > 0
                          ?
                          <span>                       
                            {Number.parseFloat(amount0Out).toFixed(2)} DAI                       
                          </span>
                          :
                          <span>                       
                            {Number.parseFloat(amount1Out).toFixed(2)} USDT                       
                          </span>
                        }
                        <h6>To: {to.substring(0,6)}..{to.substring(38,42)}</h6>

                      </div>

                    ))
                  }
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}

export default App
