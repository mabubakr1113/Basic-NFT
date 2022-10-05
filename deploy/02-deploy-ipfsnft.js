const { network } = require('hardhat')
const { etherscan } = require('../hardhat.config')
const { developmentChains, networkConfig } = require('../helper-hardhat-config')
const { verify } = require('../utils/verify')
const {
  storeImages,
  storeTokenUriMetadata,
} = require('../utils/uploadToPinata')

let tokenUris = [
  'ipfs://QmPKBw33R7N6iKqSXfLQSv6Edt4gJjybajbcbpeGhpWPmE',
  'ipfs://QmdtEZbjEpa66W6rDWpRYXRQBeML8waVb7DP6AWUnG4FRh',
  'ipfs://QmUxbiiFBjZCqBm8bmFZWe4hLSUnagKKnQ8zBmi1h9dmT2',
]

const FUND_AMOUNT = '1000000000000000000000'

const metadataTemplate = {
  name: '',
  description: '',
  image: '',
  attributes: [
    {
      trait_type: 'Cuteness',
      value: 100,
    },
  ],
}

module.exports = async ({ getNamedAccounts, deployments }) => {
  const { deploy, log } = deployments
  const { deployer } = await getNamedAccounts()
  const chainId = network.config.chainId
  const imageLocation = './images/ipfs_nft'
  let vrfCoordinatorAddress, subId

  if (process.env.UPLOAD_TO_PINATA == 'true') {
    tokenUris = await handleTokenUris()
  }

  if (developmentChains.includes(network.name)) {
    const vrfCoordinatorV2Mock = await ethers.getContract(
      'VRFCoordinatorV2Mock'
    )
    vrfCoordinatorAddress = vrfCoordinatorV2Mock.address
    const tx = await vrfCoordinatorV2Mock.createSubscription()
    const txReceipt = await tx.wait(1)
    subId = txReceipt.events[0].args.subId
    await vrfCoordinatorV2Mock.fundSubscription(subId, FUND_AMOUNT)
  } else {
    vrfCoordinatorAddress = networkConfig[chainId].vrfCoordinatorV2
    subId = networkConfig[chainId].subscriptionId
  }

  async function handleTokenUris() {
    tokenUris = []
    const { responses: imageUploadResponses, files } = await storeImages(
      imageLocation
    )
    for (imageUploadResponseIndex in imageUploadResponses) {
      let tokenUriMetadata = { ...metadataTemplate }
      tokenUriMetadata.name = files[imageUploadResponseIndex].replace(
        '.png',
        ''
      )
      tokenUriMetadata.description = `A new ${tokenUriMetadata.name}`
      tokenUriMetadata.image = `ipfs://${imageUploadResponses[imageUploadResponseIndex].IpfsHash}`
      console.log(`Uploading ${tokenUriMetadata.name}...`)
      const metadataUploadResponse = await storeTokenUriMetadata(
        tokenUriMetadata
      )
      tokenUris.push(`ipfs://${metadataUploadResponse.IpfsHash}`)
    }
    console.log('Token URIs uploaded! They are:')
    console.log(tokenUris)
    return tokenUris
  }

  const args = [
    vrfCoordinatorAddress,
    networkConfig[chainId]['gasLane'],
    subId,
    networkConfig[chainId]['callbackGasLimit'],
    tokenUris,
    networkConfig[chainId]['mintFee'],
  ]

  const randomIpfsNft = await deploy('RandomIPFSNFT', {
    from: deployer,
    logs: true,
    args: args,
    waitConfirmations: 1,
  })

  if (
    !developmentChains.includes(network.name) &&
    process.env.ETHERSCAN_API_KEY
  ) {
    log('Verifying...')
    await verify(randomIpfsNft.address, args)
  }
}

module.exports.tags = ['all', 'randomipfs', 'main']
