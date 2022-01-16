const Joi = require('joi'); // returns class. naming convention for class starts with capital
const express = require('express');
const app = express();

//app.use(express.json());

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Listening to port ${port}...`));

const courses = [
   { id: 1, name: 'course1'},
   { id: 2, name: 'course2'},
   { id: 3, name: 'course3'},
];

//app.get('/', (req, res) => {
   //res.send('Hello World');
//});

app.get('/api/courses', (req, res) => {
   res.send(courses);
});

app.get('/api/courses/:id', (req, res) => {
   const course = courses.find(c => c.id === parseInt(req.params.id));
   if (!course) return res.status(404).send('The course with the given ID was not found.');
   res.send(course);
})

app.get('/api/posts/:year/:month', (req, res) => {
   res.send(req.params); //http://localhost:3000/api/posts/2021/1
   //res.send(req.query); //http://localhost:3000/api/posts/2021/1?sortBy=name
})

app.post('/api/courses', (req, res) => {
   const { error} = validateCourse(req.body); // result.error
   if (error) return res.status(400).send(res.error.details[0].message);

   const course = {
      id: courses.length + 1,
      name: req.body.name
   };
   courses.push(course);
   res.send(course);
});

app.put('/api/courses/:id', (req, res) => {
   // Look up the course
   // If not existing, return 404
   const course = courses.find(c => c.id === parseInt(req.params.id));
   if (!course) return res.status(404).send('The course with the given ID was not found.');

   // Validate
   // If invalid, return 400 - Bad request
   //const result = validateCourse(req.body); // Can be done as below
   const { error } = validateCourse(req.body); // result.error
   if (error) return res.status(400).send(error.details[0].message);

   // Update course
   course.name = req.body.name;
   res.send(course);
   // Return the updated courses

});

function validateCourse(course) {
   const schema = Joi.object({
      name: Joi.string().min(3).required()
   });
   return schema.validate(course);
}

app.delete('/api/courses/:id', (req, res) => {
   // Look up the course
   // If not existing, return 404
   const course = courses.find(c => c.id === parseInt(req.params.id));
   if (!course) return res.status(404).send('The course with the given ID was not found.');

   // Delete
   const index = courses.indexOf(course);
   courses.splice(index, 1);

   // Return the same course
   res.send(course);
});

//////////////////////////////////////////////////////////////
const low = require('lowdb')
const FileSync = require('lowdb/adapters/FileSync')

const adapter = new FileSync('db.json')
const db = low(adapter)

const bodyParser= require('body-parser');
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: true }));

const defaultData = {
  posts: [
    {
      id: 0,
      authorId: 0,
      test: "This is the first post",
    },
  ],
  authors: [
    {
      id: 0,
      name: "impks",
    },
  ],
};

app.get('/', (req, res) => {
    res.sendFile(__dirname + "/index.html");
});

app.get('/posts', (req, res) => {
    const posts = db.get("posts").value();
    res.send(posts);
});


db.defaults(defaultData).write();

app.post("/author", (req, res) => {
    const name = req.body.name;
    const lastAuthor = db.get("authors").takeRight(1).value()[0];
    console.log(lastAuthor);
    const nextId = lastAuthor.id + 1;
    db.get("authors").push({ id: nextId, name: name }).write();
    res.redirect("/");
});