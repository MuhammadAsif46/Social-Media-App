import express from "express";
import { client } from "../mongodb.mjs";
import { ObjectId } from "mongodb";
import { openai as openaiClient } from "../mongodb.mjs";

const db = client.db("dbcrud"); // create database  // document base database
const col = db.collection("posts"); // create collection
const userCollection = db.collection("users");

let router = express.Router();


// search : /api/v1/search?q=car
router.get('/search', async (req, res, next) => {

  try {
      const response = await openaiClient.embeddings.create({
          model: "text-embedding-ada-002",
          input: req.query.q,
      });
      const vector = response?.data[0]?.embedding
      console.log("vector: ", vector);
      // [ 0.0023063174, -0.009358601, 0.01578391, ... , 0.01678391, ]

      // Query for similar documents.
      const documents = await col.aggregate([
          {
              "$search": {
                  "index": "vectorIndex",
                  "knnBeta": {
                      "vector": vector,
                      "path": "embedding",
                      "k": 10 // number of documents
                  },
                  "scoreDetails": true

              }
          },
          {
              "$project": {
                  "embedding": 0,
                  "score": { "$meta": "searchScore" },
                  "scoreDetails": { "$meta": "searchScoreDetails" }
              }
          }
      ]).toArray();
      
      console.log(`${documents.length} records found `);
      documents.map(eachMatch => {
          console.log(`score ${eachMatch?.score?.toFixed(3)} => ${JSON.stringify(eachMatch)}\n\n`);
      })

    res.send(documents);

  } catch (e) {
      console.log("error getting data mongodb: ", e);
      res.status(500).send('server error, please try later');
  }

})


// post?_id=123455
router.get("/posts", async (req, res, next) => {

  const userId = req.query._id ;

  if (!ObjectId.isValid(userId) && userId !== undefined) {
    res.status(403).send(`Invalid user id`);
    return;
  }

  const cursor = col.find({ authorId: new ObjectId(userId)})
  .sort({ _id: -1 })
  .limit(5);


  try {
    let results = await cursor.toArray();
    console.log("results: ", results);
    res.send(results);
  } catch (err) {
    console.log(" error getting data mongodb : ", err);
    res.status(500).send("server error, please try later..");
  }
});


router.get("/profile/:userId" , async (req, res, next) => {
    
    const userId = req.params.userId;
    
    if (!ObjectId.isValid(userId) && userId !== undefined) {
      res.status(403).send(`Invalid user id`);
      return;
    }
    
    try {
      let result = await userCollection.findOne({ _id: new ObjectId(userId) });
      console.log("result: ", result); // [{...}] []
      res.send({
        message: 'profile fetched',
        data: {
          firstName: result?.firstName,
          lastName: result?.lastName,
          email: result?.email,
          
        }
      });
    } catch (e) {
      console.log("error getting data mongodb: ", e);
      res.status(500).send('server error, please try later');
    }
  });

router.use((req, res) => {
  res.status(401).send({message: "invalid token"});
  return;
})

export default router;
