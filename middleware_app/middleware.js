const express = require('express')
const app = express()
const port = 8000
const MongoClient = require("mongodb").MongoClient;

//setting uri to the Mongodb
const uri = "mongodb://localhost:27017";

//for parsing JSON body received on request
app.use(express.json())
app.use(express.urlencoded({extended: true}))

//setting header to be sent to client request 
// in such a way that no cross-orign-policy related issue occurs
app.use(function(req, res, next) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, OPTIONS, PUT, PATCH, DELETE"
  );
  res.setHeader(
    "Access-Control-Allow-Headers",
    "X-Requested-With,content-type"
  );
  res.setHeader("Access-Control-Allow-Credentials", true);
  // Pass to next layer of middleware
  next();
});


//route for visualizing sentiment at real time
app.post('/', (req, res) => {
//CONNECTING TO THE DATABASE
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

client.connect().then(db => {
	// pipeline for obtaining sender_ID, date, message and sentiment lable for the messages
	const pipeline_1 = [
        {
          '$project': {
			  '_id':1,
            'sender_id': 1, 
            'events': 1
          }
        }, {
          '$unwind': {
            'path': '$events'
          }
        }, {
          '$match': {
            'events.event': 'user'
          }
        }, {
          '$unwind': {
            'path': '$events.parse_data.entities'
          }
        }, {
          '$project': {
            'sender_id': 1, 
            'events.event': 1, 
            'events.text': 1, 
            'events.timestamp': 1, 
            'events.parse_data.entities': 1
          }
        }, {
          '$match': {
            'events.parse_data.entities.entity': 'sentiment'
          }
        }, {
          '$sort': {
            'events.timestamp': 1
          }
        }
      ];
	
	//runing pipeline inside Mognodb server and getting result as cursor
	const aggCursor = client.db("mydb").collection("conversations").aggregate(pipeline_1);
    //looping through the cursor
	aggCursor.forEach(data => {
        console.log(data._id,
		(new Date(parseInt(data.events.timestamp)*1000)).toLocaleString(),
		data.events.text,data.events.parse_data.entities.value);
    });

	//placing watch at conversations collection
	const changeStream = client.db("mydb").collection("conversations").watch();
	
	//event to fire upon change taking place
	changeStream.on("change", next => {
	var object=next.updateDescription.updatedFields;	
	   for (var key in object)
	   {
		   if (object.hasOwnProperty(key) && object[key].event=='user') 
		   {
				var innerObj=object[key].parse_data.entities;
				for (var ky in innerObj){
					if(innerObj.hasOwnProperty(ky) && innerObj[ky].entity=='sentiment'){
						console.log(next.documentKey._id,(new Date(parseInt(object[key].timestamp)*1000)).toLocaleString(), object[key].text+'  '+ innerObj[ky].value);
					}
				}
		   }   
		}
	 });
});
})

//route for loading conversations on chatUI upon each page refresh
app.post('/load_chat', (req, res) => {
			//CONNECTING TO THE DATABASE
			const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
			client.connect().then(db => {
				
				//pipeline for retrieving a message for a particular userID
				const pipeline_2 = [
									  {
										'$match': {
										  'sender_id': req.body.ID
										}
									  }, {
										'$project': {
										  '_id': 1, 
										  'sender_id': 1, 
										  'events': 1
										}
									  }, {
										'$unwind': {
										  'path': '$events'
										}
									  }, {
										'$match': {
										  'events.event': {
											'$in': [
											  'user', 'bot'
											]
										  }
										}
									  }, {
										'$project': {
										  'events.event': 1, 
										  'events.text': 1, 
										  'events.timestamp': 1
										}
									  }
									];
				
				//sending documents as collection of message history in the form of array to client
				client.db("mydb").collection("conversations").aggregate(pipeline_2).toArray(function(error, documents) {
						res.send(documents);
					});
				
});


})
//running the application on a particular port
app.listen(port, () => {
	console.log(`Middleware app listening at http://localhost:${port}`)
})