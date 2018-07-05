/*
 * GET home page.
 */
import express = require('express');
const router = express.Router();

const FILE_TYPES = '.wav, .mp3'

// Load the AWS SDK for JavaScript and set the region
var AWS = require('aws-sdk');
AWS.config.update({ region: 'us-east-1' });

// Create S3 service objects
var aws = new AWS.S3();
var s3 = require('s3');

//Transcoding Test
//var sox = require('sox-stream');
var fs = require('fs');


// Set up S3 credentials
var s3Client = s3.createClient({
    s3Options: {
        accessKeyId: AWS.config.credentials.accessKeyId,
        secretAccessKey: AWS.config.credentials.secretAccessKey
    }
});


router.get('/', (req: express.Request, res: express.Response) => {
    getObjects('rockconnections-test-bucket', function (buckets, objects) {        
        res.render('index', { title: 'Express', buckets: buckets, objects: objects });
    });    
});


router.get('/test', (req: express.Request, res: express.Response) => {
    res.render('test', { title: 'TEST STREAMING'});
});


//GET All Buckets
function getBuckets(callback) {
    var buckets;
    // Call S3 to list current buckets
    aws.listBuckets(function (err, data) {
        if (err) {
            buckets = "";
            console.log("Error", err);
        } else {
            buckets = data.Buckets;
            console.log("Bucket List", data.Buckets);
        }
        callback(buckets);
    });
}

//GET All Objects
function getObjects(bucketName, callback) {
    var objects;
    var bucketParams = {
        Bucket: bucketName
    };

    // Call S3 to get the bucket's objects
    aws.listObjects(bucketParams, function (err, data) {
        if (err) {
            objects = "";
            console.log("Error", err);
        } else {
            objects = addObjectUrls(bucketName, data.Contents);
            console.log("Success", data);
        }
        var audioObjects = removeNonAudioFiles(objects);

        getBuckets(function (buckets) {
            callback(buckets, audioObjects);
        });
    });
}

//Loop over objects and remove any that don't match the specified file types
function removeNonAudioFiles(objects) {
    var result = [];
    var fileTypes = FILE_TYPES.split(",");
    for (var o in objects) {
        for (var t in fileTypes) {
            if (objects[o].Key.includes(fileTypes[t].trim())) {
                result.push(objects[o]);
                break;
            }
        }
    }
    return result;
}

//Loop over objects and add Urls as a property
function addObjectUrls(bucketName, objects) {
    var result = [];
    for (var o in objects) {
        //Get signed Url from AWS and add it to object
        var objectUrl = getObjectUrl(bucketName, objects[o].Key);
        objects[o].SignedUrl = objectUrl;
        result.push(objects[o]);
    }
    return result;
}


//Get Object Key From Url
function getKeyFromUrl(url) {
    var result = "";
    url = decodeURI(url);
    var parts = url.split("/");
    for (var i = 0; i < parts.length; i++)
        if (i > 2) {
            if (result.length > 0) result += "/"
            result += parts[i];
        }
    return result;
}


//GET object URL (pre-signed)
function getObjectUrl(bucketName, objectName) {
    var params = {
        Bucket: bucketName,
        Key: objectName,
        Expires: 1800 //Expires in 30 minutes
    };
    var url = aws.getSignedUrl('getObject', params);
    return url;
}


export default router;