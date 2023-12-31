import express from "express";
import { nanoid } from "nanoid";
import { client } from "./../mongodb.mjs";
import { ObjectId } from "mongodb";
import { openai as openaiClient } from "./../mongodb.mjs";

const db = client.db("dbcrud"); // create database  // document base database
const col = db.collection("posts"); // create collection
const userCollection = db.collection("users");

let router = express.Router();

// search : /api/v1/search?q=car
router.get("/search", async (req, res, next) => {
  try {
    const response = await openaiClient.embeddings.create({
      model: "text-embedding-ada-002",
      input: req.query.q,
    });
    const vector = response?.data[0]?.embedding;
    console.log("vector: ", vector);
    // [ 0.0023063174, -0.009358601, 0.01578391, ... , 0.01678391, ]

    // Query for similar documents.
    const documents = await col
      .aggregate([
        {
          $search: {
            index: "vectorIndex",
            knnBeta: {
              vector: vector,
              path: "embedding",
              k: 10, // number of documents
            },
            scoreDetails: true,
          },
        },
        {
          $project: {
            embedding: 0,
            score: { $meta: "searchScore" },
            scoreDetails: { $meta: "searchScoreDetails" },
          },
        },
      ])
      .toArray();

    console.log(`${documents.length} records found `);
    documents.map((eachMatch) => {
      console.log(
        `score ${eachMatch?.score?.toFixed(3)} => ${JSON.stringify(
          eachMatch
        )}\n\n`
      );
    });

    res.send(documents);
  } catch (e) {
    console.log("error getting data mongodb: ", e);
    res.status(500).send("server error, please try later");
  }
});

// POST    /api/v1/post
router.post("/post", async (req, res, next) => {
  if (!req.body.text) {
    //!req.body.title ||
    res.status(403);
    res.send(`required parameters missing, 
        example request body:
        {
            title: "abc post title",
            text: "some post text"
        } `);
    return;
  }

  try {
    const insertResponse = await col.insertOne({
      // _id: "7864972364724b4h2b4jhgh42",
      // title: req.body.title,
      text: req.body.text,
      authorEmail: req.body.decoded.email,
      authorId: new ObjectId(req.body.decoded._id),
      createdOn: new Date(),
    });

    console.log("insertResponse : ", insertResponse);

    res.send({ message: "post created" });
  } catch (err) {
    console.log(" error inserting mongodb : ", err);
    res.status(500).send("server error, please try later..");
  }
});

router.get("/feed", async (req, res, next) => {

  //  const cursor = col.find({})
  //   .sort({ _id: -1 })
  //   .limit(100);
  
  const cursor = col.aggregate([
    {
      $lookup: {
        from: "users", // users collection name
        localField: "authorId",
        foreignField: "_id",
        as: "authorObject",
      },
    },
    {
      $unwind: {
        path: "$authorObject",
        preserveNullAndEmptyArrays: true, // Include documents with null authorId
      },
    },
    {
      $project: {
        _id: 1,
        text: 1,
        title: 1,
        img: 1,
        createdOn: 1,
        likes: { $ifNull: ["$likes", []] },
        authorObject: {
          firstName: "$authorObject.firstName",
          lastName: "$authorObject.lastName",
          email: "$authorObject.email",
        },
      },
    },
    {
      $sort: { _id: -1 },
    },
    {
      $skip: 0,
    },
    {
      $limit: 100,
    },
  ]);

  try {
    let results = await cursor.toArray();
    console.log("results: ", results);
    res.send(results);
  } catch (err) {
    console.log(" error getting data mongodb : ", err);
    res.status(500).send("server error, please try later..");
  }
});

// post?_id=123455
router.get("/posts", async (req, res, next) => {
  const userId = req.params._id || req.body.decoded._id;

  if (!ObjectId.isValid(userId)) {
    res.status(403).send(`Invalid user id`);
    return;
  }

  const cursor = col
    .find({ authorId: new ObjectId(userId) })
    .sort({ _id: -1 })
    .limit(100);

  try {
    let results = await cursor.toArray();
    console.log("results: ", results);
    res.send(results);
  } catch (err) {
    console.log(" error getting data mongodb : ", err);
    res.status(500).send("server error, please try later..");
  }
});

// GET     /api/v1/post/:postId
router.get("/post/:postId", async (req, res, next) => {
  if (!ObjectId.isValid(req.params.postId)) {
    res.status(403).send(`Invalid post id`);
    return;
  }

  try {
    let result = await col.findOne({ _id: new ObjectId(req.params.postId) });
    console.log("result: ", result); // [{...}] []
    res.send(result);
  } catch (e) {
    console.log("error getting data mongodb: ", e);
    res.status(500).send("server error, please try later");
  }

  res.send("post not found with id " + req.params.postId);
});

const getProfileMiddleware = async (req, res, next) => {
  const userId = req.params.userId || req.body.decoded._id;

  if (!ObjectId.isValid(userId)) {
    res.status(403).send(`Invalid user id`);
    return;
  }

  try {
    let result = await userCollection.findOne({ _id: new ObjectId(userId) });
    console.log("result: ", result); // [{...}] []
    res.send({
      message: "profile fetched",
      data: {
        isAdmin: result?.isAdmin,
        firstName: result?.firstName,
        lastName: result?.lastName,
        email: result?.email,
        _id: result?._id,
      },
    });
  } catch (e) {
    console.log("error getting data mongodb: ", e);
    res.status(500).send("server error, please try later");
  }
};

router.get("/profile", getProfileMiddleware);
router.get("/profile/:userId", getProfileMiddleware);

router.put("/post/:postId", async (req, res, next) => {
  if (!ObjectId.isValid(req.params.postId)) {
    res.status(403).send(`Invalid post id`);
    return;
  }

  if (!req.body.text) {
    // || !req.body.title
    res.status(403)
      .send(`required parameter missing, atleast one key is required.
            example put body: 
            PUT     /api/v1/post/:postId
            {
                title: "updated title",
                text: "updated text"
            }
        `);
  }

  let dataToBeUpdated = {};

  // if(req.body.title){dataToBeUpdated.title = req.body.title};
  if (req.body.text) {
    dataToBeUpdated.text = req.body.text;
  }

  try {
    const updateResponse = await col.updateOne(
      {
        _id: new ObjectId(req.params.postId),
      },
      {
        $set: dataToBeUpdated,
      }
    );

    console.log("updateResponse : ", updateResponse);

    res.send("post updated");
  } catch (err) {
    console.log(" error inserting mongodb : ", err);
    res.status(500).send("server error, please try later..");
  }
});

// DELETE  /api/v1/post/:userId/:postId
router.delete("/post/:postId", async (req, res, next) => {
  if (!ObjectId.isValid(req.params.postId)) {
    res.status(403).send(`Invalid post id`);
    return;
  }

  try {
    const deleteResponse = await col.deleteOne({
      _id: new ObjectId(req.params.postId),
    });
    console.log("deleteResponse : ", deleteResponse);

    res.send("post delete");
  } catch (err) {
    console.log(" error deleting mongodb : ", err);
    res.status(500).send("server error, please try later..");
  }
});

router.post("/post/:postId/dolike", async (req, res, next) => {
  if (!ObjectId.isValid(req.params.postId)) {
    res.status(403).send(`Invalid post id`);
    return;
  }

  try {
    const doLikeResponse = await col.updateOne(
      { _id: new ObjectId(req.params.postId) },
      {
        $addToSet: {
          likes: new ObjectId(req.body.decoded._id),
        },
      }
    );
    console.log("doLikeResponse: ", doLikeResponse);
    res.send("like done");
  } catch (e) {
    console.log("error like post mongodb: ", e);
    res.status(500).send("server error, please try later");
  }
});

export default router;
