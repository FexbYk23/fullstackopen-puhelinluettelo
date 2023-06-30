const mongoose = require("mongoose")

const url = process.env.MONGODB_URI
if(!url){
	console.log("MONGODB_URI variable is not set")
	process.exit(1)
}
mongoose.set('strictQuery', false)
mongoose.connect(url)
console.log("connected to mongoDB:", url)


const numberValidator = (number) => {
	const parts = number.split("-")
	return number.length >= 8
		&& parts.length === 2
		&& (parts[0].length === 2 || parts[0].length === 3)
		&& /\d+/.test(parts[0])
		&& /\d+/.test(parts[1])
}



const numberSchema = new mongoose.Schema({
	name: {
		type: String,
		required: true,
		minlength: 3,
	},
	number : {
		type: String,
		required: true,
		validate:{
			validator: numberValidator,
			message: props => `${props.value} is not a valid phone number!`
	
		}
	}
})


numberSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString()
    delete returnedObject._id
    delete returnedObject.__v
  }
})


module.exports = mongoose.model("Number", numberSchema)
