import * as AWS from 'aws-sdk'
import * as AWSXRay from 'aws-xray-sdk'

const XAWS = AWSXRay.captureAWS(AWS)

// TODO: Implement the fileStorage logic
const AttachmentsBucket = process.env.ATTACHMENT_S3_BUCKET
const signedUrlExp = process.env.SIGNED_URL_EXPIRATION
const S3 = new XAWS.S3({signatureVersion: 'v4'})

export async function getUploadUrl(todoId: string) {
    return S3.getSignedUrl("putObject", {
        Bucket: AttachmentsBucket,
        Key: todoId,
        Expires: parseInt(signedUrlExp)
    })
}

export function deleteBucket(todoId: string) {
    S3.deleteObject({
        Bucket: AttachmentsBucket,
        Key: todoId
    }, function(error){
        if (error) console.log("Error", error.stack);
    });
}