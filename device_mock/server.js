const express = require('express')
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
const port = 3000;

// A very simple REST service mocking a device. Used to demonstrate how EHR Craft Form can load data into the form 

// Use CORS 
app.use(cors());

// Configuring body parser middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.get('/',(req,res) => {
    console.log("Request for data");
    res.json(getData())

});

current = {
    "spo2": 90,
    "pulse": 76,
    "temp": 37,
    "resp": 22
}



function getData() {
    current.spo2 = getRandomInt(80,100);
    current.pulse = getRandomInt(40,120);
    current.temp = getRandomInt(36,42);
    current.resp = getRandomInt(15,40);
    return current;
}
function getRandomInt(min,max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

app.listen(port,() => console.log(`Device Mock Server is running at port: ${port}!`));