const { network } = require('hardhat')
const { networkConfig, developmentChains } = require('../helper-hardhat-config')
const { verify } = require('../utils/verify')
const fs = require('fs')

module.exports = async ({ getNamedAccounts, deployments }) => {
  const { deploy, log } = deployments
  const { deployer } = await getNamedAccounts()
  const chainId = network.config.chainId
  let ethUsdPriceFeedAddress

  if (developmentChains.includes(network.name)) {
    const EthUsdAggregator = await deployments.get('MockV3Aggregator')
    ethUsdPriceFeedAddress = EthUsdAggregator.address
  } else {
    ethUsdPriceFeedAddress = networkConfig[chainId]['ethUsdPriceFeed']
  }

  const lowSVG = fs.readFileSync('./images/svgimages/frown.svg', {
    encoding: 'utf8',
  })
  const highSVG = fs.readFileSync('./images/svgimages/happy.svg', {
    encoding: 'utf8',
  })

  log('----------------------------------------------------')
  arguments = [ethUsdPriceFeedAddress, lowSVG, highSVG]
  const dynamicSvgNft = await deploy('DynamicSvgNft', {
    from: deployer,
    args: arguments,
    log: true,
    waitConfirmations: network.config.blockConfirmations || 1,
  })

  if (!developmentChains.includes(network.name) && process.env.ETHERSCAN_API) {
    log('Verifying...')
    await verify(dynamicSvgNft.address, arguments)
  }
}

module.exports.tags = ['all', 'dynamicsvg', 'main']
