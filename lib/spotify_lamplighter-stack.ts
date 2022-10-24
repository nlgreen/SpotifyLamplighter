import * as cdk from 'aws-cdk-lib';
import * as path from 'path';
import { BucketDeployment, Source } from 'aws-cdk-lib/aws-s3-deployment';
import { Bucket } from 'aws-cdk-lib/aws-s3';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import { HttpApi, CorsHttpMethod, HttpMethod } from '@aws-cdk/aws-apigatewayv2-alpha';
import { HttpLambdaIntegration } from '@aws-cdk/aws-apigatewayv2-integrations-alpha';
import { HttpJwtAuthorizer } from '@aws-cdk/aws-apigatewayv2-authorizers-alpha';
import { UserPool } from 'aws-cdk-lib/aws-cognito';
import { Queue } from 'aws-cdk-lib/aws-sqs';

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

	const httpApi = new HttpApi(this, 'simpleHttpApi', {
	    corsPreflight: {
		allowOrigins: ['*'],
		allowMethods: [CorsHttpMethod.GET],
		allowHeaders: ['Authorization']
	    },
	    apiName: 'getSongTable',
	    createDefaultStage: true
	});


	const userPool = new UserPool(this, 'UserPool', {
	    selfSignUpEnabled: false,
	});

	userPool.addDomain('UserPoolDomain', {
	    cognitoDomain: {
		domainPrefix: 'spotify-lamplighter'
	    }
	});
	
	const userPoolAppClient = userPool.addClient('UserPoolClient', {
	    oAuth: {
		callbackUrls: ["https://example.com/callback"],
		logoutUrls: ["https://example.com/logout"]
	    },
	    userPoolClientName: 'SpotifyLamplighterAppClient'
	});

	const issuer = 'https://cognito-idp.us-east-1.amazonaws.com/' + userPool.userPoolId;
	const identitySource = '$request.header.Authorization';

	const authorizer = new HttpJwtAuthorizer('APIAuthorizer', issuer, {
	    jwtAudience: [userPoolAppClient.userPoolClientId],
	    authorizerName: userPoolAppClient.userPoolClientName,
	    identitySource: [identitySource]
	});

	const lambdaIntegration = new HttpLambdaIntegration('APIIntegration', apiLambda);
	httpApi.addRoutes({
	    path: '/getSongTable',
	    methods: [ HttpMethod.GET ],
	    integration: lambdaIntegration,
	    authorizer
	});

	new cdk.CfnOutput(this, 'apiExport', {
	    value: httpApi.url!
	});
	
	new cdk.CfnOutput(this, 'bucketExport', {
	    value: websiteBucket.bucketWebsiteUrl,
	    exportName: 'websiteBucketName'
	});
    }
}
