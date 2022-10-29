import * as AWS from 'aws-sdk'
import * as AWSXRay from 'aws-xray-sdk'

const XAWS = AWSXRay.captureAWS(AWS)

const s3 = new XAWS.S3({
    signatureVersion: 'v4'
})
const bucketName = process.env.ATTACHMENT_S3_BUCKET
const urlExpiration = process.env.SIGNED_URL_EXPIRATION

export class AttachmentUtils {
    async createAttachmentPresignedUrl(todoId: string): Promise<string> {
        const bucketParams = {
            Bucket: bucketName,
            Key: todoId,
            Expires: parseInt(urlExpiration)
        }

        return s3.getSignedUrl('putObject', bucketParams)
    }
}
