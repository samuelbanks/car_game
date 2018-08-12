establishConnection = function(mongo)
{

  var MongoClient = mongo.MongoClient;
  var url = "mongodb://localhost:27017/"
  MongoClient.connect(url, function(err, db) {
    if (err) throw err;
    var dbo = db.db("mydb");
    console.log("Connected to database");
    // dbo.createCollection("messages", function(err, res) {
    //   if (err) throw err;
    //   console.log("Created collection")
    // })

    db.close();
  });

}
