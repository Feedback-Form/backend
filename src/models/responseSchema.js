const mongoose = require("mongoose");

const responseSchema = new mongoose.Schema(
	{

        personalDetails: {
            firstName:  {
                type: String,
                required: true,
                trim: true
            },
            lastName:  {
                type: String,
                required: true,
                trim: true
            },
            linkedInProfile:  {
                type: String,
                required: true,
                trim: true
            }

            },
        questionsResponses: [
            {
                question: {
                    type: String,
                    required: true,
                    trim: true
                },
                response: {
                    type: String,
                    required: true,
                    trim: true
                },
                rating: {
                    type: Number,
                    required: true
                },
                tags: [
                    {
                    type: String,
                    require: true,
                    trim: true
                    }
                ]
                
            }
        ],
        formId: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: 'Form',
          },
    },
	{
		timestamps: true,
	}
);



const Response = mongoose.model('Response', responseSchema);
module.exports = Response;