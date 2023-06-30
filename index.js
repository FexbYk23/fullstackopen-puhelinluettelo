const express = require("express")
const cors = require("cors")
const morgan = require("morgan")
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

let numbers = [
    { 
      "name": "Arto Hellas", 
      "number": "040-123456",
      "id": 1
    },
    { 
      "name": "Ada Lovelace", 
      "number": "39-44-5323523",
      "id": 2
    },
    { 
      "name": "Dan Abramov", 
      "number": "12-43-234345",
      "id": 3
    },
    { 
      "name": "Mary Poppendieck", 
      "number": "39-23-6423122",
      "id": 4
    }
  ]


app.get("/api/persons", (req, res) => {
	res.json(numbers)
})

app.get("/api/persons/:id", (req, res) => {
	const id = Number(req.params.id)
	const person = numbers.find(p => p.id === id)
	if(person){
		return res.json(person)
	}
	res.status(404).end("person not found")
})

app.delete("/api/persons/:id", (req, res) => {
	const id = Number(req.params.id)
	numbers = numbers.filter(n => n.id !== id)
	res.status(204).end()
})

app.post("/api/persons/", (req, res) => {
	const id = Math.floor(Math.random() * 999999999)
	if(!req.body.name || !req.body.number){
		return res.status(400).json({
			"error" : "body must contain name and number"
		})
	}

	if(numbers.find(n => n.name === req.body.name)){
		return res.status(400).json({"error":"name must be unique"})
	}
	const newPerson = {...req.body, id}
	numbers = numbers.concat(newPerson)
	return res.status(200).json(newPerson)
})

app.get("/info", (req, res) => {
	res.send(`
		<p>Phonebook has info for ${numbers.length} people</p>
		<p>${Date()}</p>
		`)
})

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
	console.log(`App running on port ${PORT}`)
})
