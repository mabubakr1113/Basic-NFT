const pinataSDK = require('@pinata/sdk')
const path = require('path')
const fs = require('fs')
require('dotenv').config()

const pinataAPIKey = process.env.PINATA_API_KEY
const pinataSecretKey = process.env.PINATA_SECRET_KEY

const pinata = pinataSDK(pinataAPIKey, pinataSecretKey)

async function storeImages(imagePath) {
  const completePath = path.resolve(imagePath)
  const files = fs.readdirSync(completePath)
  let responses = []
  for (fileIndex in files) {
    console.log(`Uploading ${fileIndex}`)
    const readableStreamForFile = fs.createReadStream(
      `${completePath}/${files[fileIndex]}`
    )
    try {
      const response = await pinata.pinFileToIPFS(readableStreamForFile)
      responses.push(response)
    } catch (error) {
      console.log(error)
    }
  }
  return { responses, files }
}

async function storeTokenUriMetadata(metadata) {
  try {
    const response = await pinata.pinJSONToIPFS(metadata)
    return response
  } catch (error) {
    console.log(error)
  }
  return null
}
module.exports = { storeImages, storeTokenUriMetadata }
