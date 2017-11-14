

// get requirements and set instances
const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const cors = require('cors');
const mongoose = require('mongoose');
mongoose.Promise = global.Promise;
const shortUrl = require('./models/shortUrl.js');
app.use(bodyParser.json());
app.use(cors());
// connect to our data base
mongoose.createConnection(process.env.MONGODB_URI || 'mongodb://localhost/shortUrls');

// allows node to find static content
app.use(express.static(__dirname+'/public'));


// creates the data entries
app.get('/new/:urlToShort(*)', (req, res, next)=>{
    var { urlToShort } = req.params;
    // regex for url
    var expression =/[-a-zA-Z0-9@:%_\+.~#?&//=]{2,256}\.[a-z]{2,4}\b(\/[-a-zA-Z0-9@:%_\+.~#?&//=]*)?/gi;
    var regex = expression;


    if(regex.test(urlToShort)===true){
        var short = Math.floor(Math.random()*10000).toString();

        var data = new shortUrl(
            {
            originalUrl: urlToShort,
            shorterUrl: short
        }
    );

    data.save(err=>{
        if(err){
            return res.send('Error saving to database');
        }
    });
       return res.json(data);
    }

    var data = new shortUrl(
        {
        originalUrl: 'urlToShort does not match standard format',
        shorterUrl: 'invalidUrl'
    }
);

    return res.json(data);
});


// query database and forward to original url

app.get('/:urlToForward', (req, res, next)=>{
    // stores the values of param
    var shorterUrl = req.params.urlToForward;

    shortUrl.findOne({'shorterUrl' : shorterUrl}, (err, data)=>{
        if(err) return res.send('Error reading database');

        var re = new RegExp("^(http|https)://", "i");
        var strToCheck = data.originalUrl;

        if(re.test(strToCheck===true)){
            res.redirect(301, data.originalUrl);
        }
        else{
            res.redirect(301, 'https://' + data.originalUrl);
        }
    });
});




// listen to see everuthing is working
app.listen(process.env.PORT ||3000, ()=>{
    console.log('working');
});