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

  // We format the data we get back from the queries by drilling down into the values we specified in our queries
  // We use the Logical AND operator to render something or nothing
    // The constant is defined by data returned by the API queries
    // Evaluating from L to R, we'll either receive the value of the first falsy encountered OR if all values are truthy we will receive the last of the last operand
      // ie daiPriceInEth = IF daiData is truthy AND daiData.tokens[0] is truthy, return the value of daiData.tokens[0]
  const daiPriceInEth = daiData && daiData.tokens[0].derivedETH
  const daiTotalLiquidity = daiData && daiData.tokens[0].totalLiquidity
  const ethPriceInUSD = ethPriceData && ethPriceData.bundles[0].ethPrice

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
