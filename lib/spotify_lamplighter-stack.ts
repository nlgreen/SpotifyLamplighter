import * as cdk from 'aws-cdk-lib';
import * as path from 'path';
import { BucketDeployment, Source } from 'aws-cdk-lib/aws-s3-deployment';
import { Bucket } from 'aws-cdk-lib/aws-s3';
import * as lambda from 'aws-cdk-lib/aws-lambda';

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

	const apiLambda = new lambda.Function(this, 'APIFunction', {
	    runtime: lambda.Runtime.PYTHON_3_9,
	    handler: 'index.lambda_handler',
	    code: lambda.Code.fromAsset(path.join(__dirname, '..', 'api'))
	});

	
	new cdk.CfnOutput(this, 'bucketExport', {
	    value: websiteBucket.bucketWebsiteUrl,
	    exportName: 'websiteBucketName'
	});
    }
}
