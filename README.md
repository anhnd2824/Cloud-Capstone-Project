# Cloud-Capstone-Project

The original source is from the final project of C4 - Serverless application.

The idea for capstone project come from concepts: Event processing of Develop & Deploy Serverless App.

I used Simple Notification Service (SNS) to observe new image being uploaded to S3.

Then SNS will trigger handler resize image to reduce the size of original image in order to create a thumbnail. Then it will upload thumbnail to another S3 bucket.

After that, I replaced the updateAttachmentUrl to replace origin attachement url of origin image into thumbnail url of thumbnail image.

This process will help frontend (client) to reduce the workload, improve performance but still satisfy the requirement of showing attached image of each Todo item.