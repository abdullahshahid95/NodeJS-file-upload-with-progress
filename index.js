const app = require('express')();
const {submitForm} = require('./TestController');

const port = process.env.port || 3000;

app.post('/submit', submitForm);

app.listen(port, () => {
    console.log(`Server is running at port ${port}`);
});

