require("dotenv").config()

const express = require("express")
const cors = require("cors")
const morgan = require("morgan")
const NumberModel = require("./models/number")
const app = express()

app.use(express.static("build"))
app.use(cors())
app.use(express.json())
app.use(morgan((tokens, req, res) => {
  const postJSON = tokens.method(req,res) == "POST" ? JSON.stringify(req.body) : ""
  return [
    tokens.method(req, res),
    tokens.url(req, res),
    tokens.status(req, res),
    tokens.res(req, res, 'content-length'), '-',
    tokens['response-time'](req, res), 'ms',
    postJSON
  ].join(' ')

}))


const errorHandler = (error, request, response, next) => {
	console.log(error.message)
	if (error.name === 'CastError') {
		return response.status(400).send({ error: 'malformatted id' })
	}else if (error.name === 'ValidationError') {
		return response.status(400).json({ error: error.message }) 
	}
	next(error)
}


app.get("/api/persons", (req, res, next) => {
	NumberModel.find({}).then((result) => {
		res.json(result)
	}).catch(error => next(error))
})

app.get("/api/persons/:id", (req, res, next) => {
	NumberModel.findById(req.params.id).then(result => {
		if(!result){
			res.status(404).end("person not found")
		}else{
			res.json(result)
		}
	}).catch(error => next(error))
})

app.put("/api/persons/:id", (req, res, next) => {
	const num = {
		name : req.body.name,
		number : req.body.number,
	}

	NumberModel.findByIdAndUpdate(req.params.id, num, {new: true})
	.then(updated => {
		if(updated){
			res.json(updated)
		}else{
			res.status(404).end("person not found")
		}
	})
	.catch(error => next(error))
})

app.delete("/api/persons/:id", (req, res, next) => {
	NumberModel.findByIdAndRemove(req.params.id).then(() => {
		res.status(204).end()
	}).catch(error => next(error))
})

app.post("/api/persons/", (req, res, next) => {
	const id = Math.floor(Math.random() * 999999999)
	if(!req.body.name || !req.body.number){
		return res.status(400).json({
			"error" : "body must contain name and number"
		})
	}

	NumberModel.find({name: req.body.name}).then(result =>{
		if(result.length !== 0){
			res.status(400).json({"error":"name must be unique"})
		}else{

			const newPerson = new NumberModel({
			name : req.body.name,
			number : req.body.number,
			})

			newPerson.save().then(() => res.status(200).json(newPerson))
					.catch(error => next(error))
		}
	})

})

app.get("/info", (req, res) => {
	NumberModel.find({}).then((numbers) => {
		res.send(`
		<p>Phonebook has info for ${numbers.length} people</p>
		<p>${Date()}</p>
		`)
	})
})


app.use(errorHandler)
app.listen(3001, () => {
	console.log("App running on port 3001")
})
