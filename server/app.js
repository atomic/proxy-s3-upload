const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');

const aws = require('aws-sdk');
const multer = require('multer');
const multerS3 = require('multer-s3');

// set storage engine
const storage = multer.diskStorage({
    destination: './public/uploads/',
    filename: function (req, file, cb) {
        cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
    }
});

const s3 = new aws.S3({
    accessKeyId: 'your-access-key',
    secretAccessKey: 'your-secret-key'
});

// const upload = multer({
//     storage: storage
// }).single('userfile');

const upload = multer({
    storage: multerS3({
        s3: s3,
        bucket: 'some-bucket',
        acl: 'public-read-write',
        key: function (req, file, cb) {
            cb(null, path.basename( file.originalname, path.extname( file.originalname ) ) + '-' + Date.now() + path.extname( file.originalname ) )
        }
    }),
    limits:{ fileSize: 20000000 }, // In bytes: 20000000 bytes = 20 MB
    // fileFilter: function( req, file, cb ){
    //     // checkFileType( file, cb );
    // }
}).single('userfile');

// Multiple File Uploads ( max 4 )
const multiUpload = multer({
    storage: multerS3({
        s3: s3,
        bucket: 'some-bucket',
        acl: 'public-read-write',
        key: function (req, file, cb) {
            // cb( null, path.basename( file.originalname, path.extname( file.originalname ) ) + '-' + Date.now() + path.extname( file.originalname ) )
            cb( null, path.join( req.body.text1, req.body.text2, file.originalname))
        }
    }),
    limits:{ fileSize: 20000000 }, // In bytes: 20000000 bytes = 20 MB
    // fileFilter: function( req, file, cb ){
    //     checkFileType( file, cb );
    // }
}).any();
// }).array( 'userfile', 4 );

/**
 * Check File Type
 * @param file
 * @param cb
 * @return {*}
 */
function checkFileType( file, cb ){
    const filetypes = /jpeg|jpg|png|json/; // Allowed ext
    const extname = filetypes.test( path.extname( file.originalname ).toLowerCase()); // Check ext
    const mimetype = filetypes.test( file.mimetype ); // Check mime
    if( mimetype && extname ){
        return cb( null, true );
    } else {
        cb( 'Error: Images and JSON only!' );
    }
}

const app = express();

// view engine setup

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// app.use('/upload', uploadRouter);
app.post('/upload', function(req, res, next) {
    // upload(req, res, (err) => {
    multiUpload(req, res, (err) => {
        if(err)
            res.send(400, 'error');
        else {
            res.send('uploaded');
        }
    });
});

// catch 404 and forward to error handler
app.use(function(req, res, next) {
    next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // render the error page
    res.status(err.status || 500);
    res.render('error');
});

module.exports = app;
