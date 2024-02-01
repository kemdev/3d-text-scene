import express from 'express';
import dotenv from 'dotenv';
import presetsRouter from './api/presets';
import readFile from './readFile/readFile';
import saveScreenshot from './api/screenshot';
import { attachFirestore } from './middleware/firestoreMiddleware';
import userRouter from './api/users';
import bodyParser from 'body-parser';

// import saveDefaultPresets from './readFile/readFile';

// saveDefaultPresets();

// dotenv
dotenv.config();

//Initialising Express
const app = express();
// Configuring Express

app.use(express.urlencoded({ extended: false }));
// app.use(express.static('public'));
app.use(express.json());

// app.set('view engine', 'ejs');

app.use('/presets', attachFirestore, presetsRouter);

app.use('/storage', saveScreenshot);

app.use('/users', attachFirestore, userRouter);
// test
// app.use('/readFile', readFile);

// Detect port number from the Node Server or use 5000
const PORT = process.env.PORT || 5000;

// Listen for URIs on a port
app.listen(PORT, () => console.log(`Server started at ${PORT}`));

export default app;
