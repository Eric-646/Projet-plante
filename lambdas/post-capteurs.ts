
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
        body = await dynamo.post({ TableName: table, Item: event }).promise();

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