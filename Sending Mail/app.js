const nodemailer =  require('nodemailer');
const express = require('express')
const fs = require('fs');
const multer = require('multer');
const bodyParser = require('body-parser');

const app = express();

app.use(bodyParser.urlencoded({extended:true}));
app.use(bodyParser.json());

var to;
var subject;
var body;
var path;

var Storage = multer.diskStorage({
    destination:function(req, file, callback){
        callback(null, './images');
    },
    filename:function(req, file, callback){
        callback(null, file.fieldname + '_' + Date.now() + '_' +  file.originalname);
    }
})

var upload = multer({
    storage:Storage
}).single('image');

app.use(express.static('public'));

app.get('/', (req,res) => {
    res.sendFile('/index.html');
})

app.post('/sendemail', (req,res) => {

    upload(req, res, function(err){
        if(err){
            Console.log(err);
            return res.end("Something went wrong!");
        }
        else{
            to = req.body.to;
            subject = req.body.subject;
            body = req.body.body;

            path = req.file.path;

            console.log(to);
            console.log(subject);
            console.log(body);
            console.log(path);
            // sendEmail(to, subject, body, path);
            // res.end("Email has been sent!");

            var transporter = nodemailer.createTransport({
                service:'gmail' ,
                auth:{
                    user:'ENTER YOUR EMIAL ID',
                    pass:'ENTER YOUR EMIAL APP PASSWORD'
                }
            })

            var mailOptions = {
                from:'ENTER YOUR EMIAL ID',
                to: to,
                subject: subject,
                text: body,
                attachments: [
                    {
                        path: path,
                    }
                ]
            }

            transporter.sendMail(mailOptions, function(err, info){
                if(err){
                    console.log(err);
                }
                else{
                    console.log('Email sent:'+ info.response);

                    fs.unlink(path, function(err){
                        if(err){
                            return res.end(err);
                        }else{
                            console.log('File deleted');
                            return res.redirect('/result.html');
                        }
                    })
                }
            })
        }
    })
})

app.listen(3000, () => {
    console.log('Server is running on port 3000');
});
