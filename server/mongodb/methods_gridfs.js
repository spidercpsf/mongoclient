/**
 * Created by RSercan on 9.2.2016.
 */
Meteor.methods({
    'deleteFile': function (connection, bucketName, fileId) {
        var connectionUrl = getConnectionUrl(connection);
        var connectionOptions = getConnectionOptions();
        var mongodbApi = Meteor.npmRequire('mongodb');

        LOGGER.info('[deleteFile]', connectionUrl, connectionOptions, bucketName, fileId);

        var result = Async.runSync(function (done) {
            mongodbApi.MongoClient.connect(connectionUrl, connectionOptions, function (mainError, db) {
                if (mainError) {
                    done(mainError, null);
                    if (db) {
                        db.close();
                    }
                    return;
                }
                try {
                    var bucket = new mongodbApi.GridFSBucket(db, {bucketName: bucketName});
                    bucket.delete(new mongodbApi.ObjectId(fileId), function (err) {
                        done(err, null);
                        if (db) {
                            db.close();
                        }
                    });
                }
                catch (ex) {
                    LOGGER.error('[deleteFile]', ex);
                    done(new Meteor.Error(ex.message), null);
                    if (db) {
                        db.close();
                    }
                }
            });
        });

        convertBSONtoJSON(result);
        return result;
    },

    'getFileInfos': function (connection, bucketName) {
        var connectionUrl = getConnectionUrl(connection);
        var connectionOptions = getConnectionOptions();
        var mongodbApi = Meteor.npmRequire('mongodb');

        LOGGER.info('[getFileInfos]', connectionUrl, connectionOptions, bucketName);

        var result = Async.runSync(function (done) {
            mongodbApi.MongoClient.connect(connectionUrl, connectionOptions, function (mainError, db) {
                if (mainError) {
                    done(mainError, null);
                    if (db) {
                        db.close();
                    }
                    return;
                }
                try {
                    var bucket = new mongodbApi.GridFSBucket(db, {bucketName: bucketName});
                    bucket.find({}).toArray(function (err, files) {
                        done(err, files);
                        if (db) {
                            db.close();
                        }
                    });

                }
                catch (ex) {
                    LOGGER.error('[getFileInfos]', ex);
                    done(new Meteor.Error(ex.message), null);
                    if (db) {
                        db.close();
                    }
                }
            });
        });

        convertBSONtoJSON(result);
        return result;
    },

    'uploadFile': function (connection, bucketName, blob, fileName, contentType, metaData, aliases) {
        var connectionUrl = getConnectionUrl(connection);
        var connectionOptions = getConnectionOptions();
        var mongodbApi = Meteor.npmRequire('mongodb');
        if (metaData) {
            convertJSONtoBSON(metaData);
        }

        blob = new Buffer(blob);

        LOGGER.info('[uploadFile]', connectionUrl, connectionOptions, bucketName, fileName, contentType, metaData, aliases);

        return Async.runSync(function (done) {
            mongodbApi.MongoClient.connect(connectionUrl, connectionOptions, function (mainError, db) {
                if (mainError) {
                    done(mainError, null);
                    if (db) {
                        db.close();
                    }
                    return;
                }
                try {
                    var bucket = new mongodbApi.GridFSBucket(db, {bucketName: bucketName});
                    var uploadStream = bucket.openUploadStream(fileName, {
                        metadata: metaData,
                        contentType: contentType,
                        aliases: aliases
                    });
                    uploadStream.end(blob);
                    uploadStream.once('finish', function () {
                        done(null, null);
                        if (db) {
                            db.close();
                        }
                    });
                }
                catch (ex) {
                    LOGGER.error('[uploadFile]', ex);
                    done(new Meteor.Error(ex.message), null);
                    if (db) {
                        db.close();
                    }
                }
            });
        });
    },

    'getFile': function (connection, bucketName, fileId) {
        var connectionUrl = getConnectionUrl(connection);
        var connectionOptions = getConnectionOptions();
        var mongodbApi = Meteor.npmRequire('mongodb');

        LOGGER.info('[getFile]', connectionUrl, connectionOptions, bucketName, fileId);

        var result = Async.runSync(function (done) {
            mongodbApi.MongoClient.connect(connectionUrl, connectionOptions, function (mainError, db) {
                if (mainError) {
                    done(mainError, null);
                    if (db) {
                        db.close();
                    }
                    return;
                }
                try {
                    var filesCollection = db.collection(bucketName + '.files');
                    filesCollection.find({_id: new mongodbApi.ObjectId(fileId)}).limit(1).next(function (err, doc) {
                        if (doc) {
                            done(null, doc);
                        } else {
                            done(new Meteor.Error('No file found for given ID'), null);
                        }
                        if (db) {
                            db.close();
                        }
                    });
                }
                catch (ex) {
                    LOGGER.error('[getFile]', ex);
                    done(new Meteor.Error(ex.message), null);
                    if (db) {
                        db.close();
                    }
                }
            });
        });

        convertBSONtoJSON(result);
        return result;
    }
});