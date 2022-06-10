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

// DEFINE THE QUERIES
  // OPERATION TYPE AND NAME
    // 'query' = operation type?
    // 'tokens' = operation name?
  // VARIABLES & VARIABLE DEFINITION
    // We pass a variable into this particular query...
    // $tokenAddress: Bytes!
    // ↑ Where $tokenAddress = the variable + Bytes! = variable type
    // The !exclamation denotes that the variable type is required (the field requires a non-null argument)
  // PARAMETERS
    // We use the 'where' parameter to filter for properties
      // Here we are querying for "tokens where they have an id of this address"
  // FIELDS
    // tokens
    // derviedETH
    // totalLiquidity
const DAI_QUERY = gql`
  query tokens($tokenAddress: Bytes!) {
    tokens(where: { id: $tokenAddress }) {
      derivedETH
      totalLiquidity
    }
  }
`
// data: for DAI_QUERY (variable renamed from data to daiData)
  // This is the object returned from DAI_QUERY:

//        tokens: [{ 
//                  derivedETH: "0.000556614316469043115451462643202194"
//                  totalLiquidity: "82268746.914670795110320116"
//                  __typename: "Token" 
//                 }]












// OPERATION TYPE AND NAME
  // 'query' = type
  // 'bundles' = name
    // ↑ We find these names in the subgraph of Uniswap
    // Although it is listed as 'bundle' in Uniswap subgraph, we pluralize it because of the pagination model?
      // From the docs "The simplest way to expose a connection between objects is with a field that returns a plural type" ❓❓❓❓
const ETH_PRICE_QUERY = gql`
  query bundles {
    bundles(where: { id: "1" }) {
      ethPrice
    }
  }
`
// data: for ETH_PRICE_QUERY (variable renamed from data to ethPriceData)
  // This is the object returned from ETH_PRICE_QUERY:

//          bundles: [{ 
//                      ethPrice: "1800.115767561320051659391505499823"
//                      __typename: "Bundle" 
//                   }]




const ALL_TOKENS_QUERY = gql`
  query tokens {
    tokens (first: 50, skip: 3000, orderBy: symbol, orderDirection: asc) {
      id
      symbol
      name
    }
  }
`
// const ALL_TOKENS_QUERY = gql`
//   query($first: Int, $orderBy: BigInt, $orderDirection: String) {
//     tokens(
//       first: $first, orderBy: $orderBy, orderDirection: $orderDirection
//     ) {
//       id
//       symbol
//       name
      
//     }
//   }
// `


const BTC_QUERY = gql`
  query tokens {
    tokens (where: {name: "Bitcoin"}, first: 1) {
      symbol, 
      name, 
      totalSupply, 
      tradeVolume, 
      txCount
    }
  }
`

const WBTC_QUERY = gql`
  query tokens {
    tokens (where: {name: "Wrapped Bitcoin"}, first: 1) {
      symbol, 
      name, 
      totalSupply, 
      tradeVolume, 
      txCount
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
  const { loading: allTokensLoading, error: allTokensError, data: allTokensData } = useQuery(ALL_TOKENS_QUERY)
  const { loading: btcLoading, error: btcError, data: btcData } = useQuery(BTC_QUERY)
  const { loading: wbtcLoading, error: wbtcError, data: wbtcData } = useQuery(WBTC_QUERY)

  // We format the data we get back from the queries by drilling down into the values we specified in our queries
  // We use the Logical AND operator to render something or nothing
    // The constant is defined by data returned by the API queries
    // Evaluating from L to R, we'll either receive the value of the first falsy encountered OR if all values are truthy we will receive the last of the last operand
      // ie daiPriceInEth = IF daiData is truthy AND daiData.tokens[0] is truthy, return the value of daiData.tokens[0]
  const daiPriceInEth = daiData && daiData.tokens[0].derivedETH
  const daiTotalLiquidity = daiData && daiData.tokens[0].totalLiquidity
  const ethPriceInUSD = ethPriceData && ethPriceData.bundles[0].ethPrice


  console.log(ethPriceData)
  console.log(daiData)
  console.log(allTokensError)
  console.log(allTokensData)
  console.log(btcData)
  console.log(wbtcData)



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
                  DAI price:{' '}
                  {ethLoading || daiLoading
                    ? 'Loading token data...'
                    : '$' +
                      // parse responses as floats and fix to 2 decimals
                      // parseFloat excepts a string and parses it to a floating point number
                      (parseFloat(daiPriceInEth) * parseFloat(ethPriceInUSD)).toFixed(2)}
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

              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}

export default App
