import * as cdk from 'aws-cdk-lib';
import { NodejsFunction, NodejsFunctionProps } from 'aws-cdk-lib/aws-lambda-nodejs';
import { Construct } from 'constructs';
import { join } from 'path';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import { AttributeType, Table } from 'aws-cdk-lib/aws-dynamodb';
import { LambdaIntegration, RestApi } from 'aws-cdk-lib/aws-apigateway';
// import * as sqs from 'aws-cdk-lib/aws-sqs';

export class ProjetPlanteStack extends cdk.Stack {
  db: Table; // Table de l'application
  api: RestApi; // API de l'application

  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // Créer une table DynamoDB
    this.db = new Table(this, 'capteurs-plantes-a-faim', {
      partitionKey: {
        name: 'id',
        type: AttributeType.STRING
      },
      tableName: 'capteurs-plantes-a-faim',
      // removalPolicy: cdk.RemovalPolicy.DESTROY
    });

    // Créer des lambdas
    const plantesGet = new NodejsFunction(this, 'plantesGetPlantafaim', this.setProps('../lambdas/get-capteurs.ts', this.db.tableName));
    const plantesPost = new NodejsFunction(this, 'plantesPostPlantafaim', this.setProps('../lambdas/post-capteurs.ts', this.db.tableName));
    const plantesPut = new NodejsFunction(this, 'plantesUpPlantafaim', this.setProps('../lambdas/update-capteurs.ts', this.db.tableName));
    const plantesDelete = new NodejsFunction(this, 'plantesDeletePlantafaim', this.setProps('../lambdas/delete-capteurs.ts', this.db.tableName));

    // Autoriser les lambdas à accéder à la table
    this.db.grantReadData(plantesGet);
    this.db.grantWriteData(plantesPost);
    this.db.grantWriteData(plantesPut);
    this.db.grantWriteData(plantesDelete);


    // ApiGateway pour appeler les lambdas et récupérer les données

    this.api = new RestApi(this, 'capteurs-plantes-a-faim-api', {
      restApiName: 'capteurs-plantes-a-faim-api'
    });
    
    // Créer les intégrations qui feront le lien entre les routes et les lambdas
    const lambdaGetIntegration = new LambdaIntegration(plantesGet);
    
    // Créer les routes de l'API
    const humidite = this.api.root.addResource('humidite'); // On crée la ressource (route) /humidite
    const humiditeGet = humidite.addResource('get'); // On crée une ressource get sur la route /humidite
    humiditeGet.addMethod('GET', lambdaGetIntegration); // On crée une méthode pour les requetes HTTP GET sur la ressource /humidite/get

    const humiditePost = humidite.addResource('post');
    humiditePost.addMethod('POST', new LambdaIntegration(plantesPost));

    const humiditePut = humidite.addResource('put');
    humiditePut.addMethod('PUT', new LambdaIntegration(plantesPut));

    const humiditeDelete = humidite.addResource('delete');
    humiditeDelete.addMethod('DELETE', new LambdaIntegration(plantesDelete));
    
  }
  // Etablir une lambda pour faire un get
  setProps(file: string, table: string): NodejsFunctionProps {
    return {
      memorySize: 128,
      entry: join(__dirname, file),
      environment: {
        TABLE: table,
        CLE: 'id'
      },
      runtime: lambda.Runtime.NODEJS_16_X
    }
  }
}