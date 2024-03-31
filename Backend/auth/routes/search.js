const { Router } = require("express");
const router = Router();
const { Admin, User, Movies, embeddedMovies } = require("../db");
const axios = require('axios');
require('dotenv').config({ path: "./.env" });

openAIKey = process.env.OPENAI;
async function getEmbedding(query) {
    // Define the OpenAI API url and key.
    const url = 'https://api.openai.com/v1/embeddings';
    const openai_key = openAIKey; // Replace with your OpenAI key.
    
    // Call OpenAI API to get the embeddings.

    let response = await axios.post(url, {
        input: query,
        model: "text-embedding-3-small"
    }, {
        headers: {
            'Authorization': `Bearer ${openai_key}`,
            'Content-Type': 'application/json'
        }
    });
    
    if(response.status === 200) {
        return response.data.data[0].embedding;
    } else {
        throw new Error(`Failed to get embedding. Status code: ${response.status}`);
    }
}

router.get("/", async (req, res) => {
    const limit = 10
    const query = req.query.text;
    const embedding = await getEmbedding(query);
    const results_semantic = await embeddedMovies.aggregate([
        {"$vectorSearch": {
          "queryVector": embedding,
          "path": "plot_embedding",
          "numCandidates": 100,
          "limit":limit,
          "index": "vector_index",
            }},
        {
          "$project": {
            "title": 1,
            "score": {
              "$meta": "searchScore"
            }
          
          }
        }
        
      ]);
      const results_auto = await Movies.aggregate([
        {
          $search: {
            index: "autocomplete",
            autocomplete: {
              query: query,
              path: "title",
              fuzzy: {
                maxEdits: 1,
              },
              tokenOrder: "sequential",
            },
          },
        },
        {
          $project: {
            title:1,
          },
        },
        {
            $limit: limit,
        }
      ]);
      const results = results_auto.concat(results_semantic).slice(0,limit);
        res.send(results);

});
module.exports = router;