import * as cdk from 'aws-cdk-lib';
import * as path from 'path';
import { BucketDeployment, Source } from 'aws-cdk-lib/aws-s3-deployment';
import { Bucket } from 'aws-cdk-lib/aws-s3';

export class SpotifyLamplighterStack extends cdk.Stack {
    constructor(scope: cdk.App, id: string, props?: cdk.StackProps) {
      super(scope, id, props);

      const websiteBucket = new Bucket(this, 'frontendBucket', {
	  websiteIndexDocument: 'index.html',
	  publicReadAccess: true
      });

      new BucketDeployment(this, 'websiteDeploy', {
	  sources: [Source.asset(path.join(__dirname, '..', 'frontend', 'build'))],
	  destinationBucket: websiteBucket
      });

      new cdk.CfnOutput(this, 'bucketExport', {
	  value: websiteBucket.bucketWebsiteUrl,
	  exportName: 'websiteBucketName'
      });
  }
}
