const AWS = require('aws-sdk');

const dynamo = new AWS.DynamoDB.DocumentClient();

exports.handler = async (event: any, context: any) => {
    //console.log('Received event:', JSON.stringify(event, null, 2));

    let body;
    let statusCode = '200';
    const headers = {
        'Content-Type': 'application/json',
    };
    // Nom de la table dans laquelle aller chercher des données
    let table = process.env.TABLE;
    let cle = process.env.CLE;

    try {
        if (event.queryStringParameters && event.queryStringParameters.id) {
            body = await dynamo.get({ TableName: table, Key: { cle: event.queryStringParameters.id } }).promise();
        } else {
            body = await dynamo.scan({ TableName: table }).promise();
        }
    } catch (err: any) {
        statusCode = '400';
        body = err.message;
    } finally {
        body = JSON.stringify(body);
    }

    return {
        statusCode,
        body,
        headers,
    };
};