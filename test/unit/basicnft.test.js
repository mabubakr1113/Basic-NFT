const { network, ethers } = require('hardhat')
const { assert, expect } = require('chai')
const { developmentChains } = require('../../helper-hardhat-config')

!developmentChains.includes(network.name)
  ? describe.skip
  : describe('Basic NFT', () => {
      let basicNFT
      beforeEach(async () => {
        const { deployer } = await getNamedAccounts()
        await deployments.fixture(['all'])
        basicNFT = await ethers.getContract('BasicNft', deployer)
        tokenCounter = await basicNFT.getTokenCounter()
      })

      describe('constructor', () => {
        it('should have the value of 0', async () => {
          assert.equal(tokenCounter, 0)
          it('Shouls have the name of bugzilla', async () => {
            assert.equal(await basicNFT.name(), 'Bugzilla')
          })
          it('Should have the symbol of BGZ', async () => {
            assert.equal(await basicNFT.symbol(), 'BGZ')
          })
        })
      })

      describe('mint', () => {
        let tokenURI
        beforeEach(async () => {
          const tx = await basicNFT.mintNft()
          await tx.wait(1)
          tokenURI = await basicNFT.tokenURI(0)
        })
        it('The token counter value should increase by 1', async () => {
          assert.equal(
            (await basicNFT.getTokenCounter()).toNumber(),
            tokenCounter + 1
          )
          assert.equal(tokenURI, await basicNFT.TOKEN_URI())
        })
      })

      describe('TokenURI', () => {
        let tokenURI
        beforeEach(async () => {
          tokenURI = await basicNFT.tokenURI(0)
        })
        it('Should return correct tokenURI', async () => {
          assert.equal(tokenURI, await basicNFT.TOKEN_URI())
        })
      })
    })
