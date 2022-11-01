import { SNSEvent, SNSHandler, S3EventRecord } from 'aws-lambda'
import 'source-map-support/register'
import * as AWS from 'aws-sdk'
import Jimp from 'jimp/es'
import { createLogger } from '../../utils/logger'
const AWSXRay = require('aws-xray-sdk')

const XAWS = AWSXRay.captureAWS(AWS)
const s3 = new XAWS.S3({
    signatureVersion: 'v4'
})

const imagesBucketName = process.env.ATTACHMENT_S3_BUCKET
const thumbnailBucketName = process.env.THUMBNAILS_S3_BUCKET

const logger = createLogger('Resize Image')

export const handler: SNSHandler = async (event: SNSEvent) => {
    logger.info('Processing SNS event ', JSON.stringify(event))
    for (const snsRecord of event.Records) {
        const s3EventStr = snsRecord.Sns.Message
        logger.info('Processing S3 event', s3EventStr)
        const s3Event = JSON.parse(s3EventStr)

        for (const record of s3Event.Records) {
            await processImage(record)
        }
    }
}

async function processImage(record: S3EventRecord) {
    const key = record.s3.object.key
    logger.info('Processing S3 item with key: ', key)
    const response = await s3
        .getObject({
            Bucket: imagesBucketName,
            Key: key
        })
        .promise()

    const body = response.Body
    const image = await Jimp.read(body)

    logger.info('Resizing image')
    image.resize(150, Jimp.AUTO)
    const convertedBuffer = await image.getBufferAsync(Jimp.AUTO)

    logger.info(`Writing image back to S3 bucket: ${thumbnailBucketName}`)
    await s3
        .putObject({
            Bucket: thumbnailBucketName,
            Key: `${key}.jpeg`,
            Body: convertedBuffer
        })
        .promise()
}
