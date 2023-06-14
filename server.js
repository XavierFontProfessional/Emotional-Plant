require('dotenv').config()
const express = require('express');
const { Configuration, OpenAIApi } = require("openai");
const cors = require('cors');
const path = require('path');
const fs = require('fs');



const configuration = new Configuration({
    apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

const app = express();

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public'), {
    maxAge: '1y'
}));
app.use(cors());


app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'tree.html'));
});

app.get('/', (req, res) => {
    res.send("request has been reached");
});

app.get('/get_canvas', (req, res) => {

});

app.post('/analyze_sentiment', async (req, res) => {
    const expression = req.body.expression;
    let sentimentScore, flowerResponse;

    try {
        // Get sentiment score
        let gptResponse = await openai.createCompletion({
            model: 'text-davinci-003',
            prompt: `This prompt is made for my webapp, you need to return a number between -15 and 15. The response must be a number between -15 and 15, otherwise my webapp will crash, so be careful. The number you give me is a score you give the following text based on sentiment (better sentiment, higher score, and vise versa): "${expression}"\n. The webapp is a platform where a user enters a prompt, the text you saw, and a plant grows according to the number you returned, so choose the numbers wisely. Gove me the plain number, no spaces or any other characters.`,
            temperature: 0.3,
            max_tokens: 60
        });

        sentimentScore = gptResponse.data.choices[0].text.trim();

        // Get flower response
        gptResponse = await openai.createCompletion({
            model: 'text-davinci-003',
            prompt: `Imagine you are a flower, and someone tells you "${expression}". How would you respond if you could talk? Please give me the response straight up as I will use it on my webapp. Nothing but the response.`,
            temperature: 0.3,
            max_tokens: 60
        });

        flowerResponse = gptResponse.data.choices[0].text.trim();

        // Return the results
        res.json({ sentimentScore: sentimentScore, flowerResponse: flowerResponse });
    } catch (error) {
        if (error.response) {
            console.log(error.response.status);
            console.log(error.response.data);
        } else {
            console.log(error.message);
        }
        // Respond with an error message
        res.status(500).json({ error: 'An error occurred while processing your request.' });
    }
});


app.listen(80, () => console.log('Server listening on port 80'));
