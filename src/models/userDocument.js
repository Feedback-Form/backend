/* eslint-disable no-use-before-define */
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const validator = require('validator');
const bcrypt = require('bcrypt');

//schemes
const Form = require('./formSchema');
const Tag = require('./tagSchema');
const Response = require('./responseSchema');
const userSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: true,
      trim: true,
    },
    lastName: {
      type: String,
      required: true,
      trim: true,
    },
    company: {
      type: String,
      required: false,
      trim: true,
    },
    email: {
      type: String,
      require: true,
      unique: true,
      trim: true,
      lowercase: true,
      validate(value) {
        if (!validator.isEmail(value)) {
          throw new Error('email is invalid');
        }
      },
    },
    companyDescription: {
      type: String,
      require: true,
      trim: true
    },
    password: {
      type: String,
      required: true,
      trim: true,
      minLength: 7,
      validate(value) {
        if (value.toLowerCase() === 'password') {
          throw new Error('this password is too common.');
        }
      },
    },
    userIsVerified: {
      type: Boolean,
      required: true,
    },

    // billing: {
    //   stripeCustomerId: {
    //     type: String,
    //     trim: true,
    //   },
    //   userIsTrial: {
    //     type: Boolean,
    //     required: true,
    //   },

    //   subscription: {
    //     subscriptionStatus: {
    //       type: String,
    //     },
    //     productId: {
    //       type: String,
    //     },
    //     currentPeriodEnd: {
    //       type: Number,
    //     },
    //   },
    // },
    tokens: [
      {
        token: {
          type: String,
          required: true,
          trim: true,
        },
      },
    ],
  },
  {
    timestamps: true,
  },
);


userSchema.virtual('userForms', {
  ref: 'Form',
  localField: '_id',
  foreignField: 'owner',
});

userSchema.virtual('userResponseTags', {
  ref: 'Tag',
  localField: '_id',
  foreignField: 'owner',
});



userSchema.methods.toJSON = function () {
  const user = this;

  const userObj = user.toObject();

  // remove things we retrieve from profile requests
  delete userObj.password;
  delete userObj.tokens;

  return userObj;
};

userSchema.methods.generateAuthToken = async function () {
  const user = this;

  const token = jwt.sign(
    { _id: user._id.toString() },
    process.env.JWT_SECRET,
    { expiresIn: '30d' },
  );

  user.tokens = user.tokens.concat({ token });
  await user.save();

  return token;
};

userSchema.statics.findByCredentials = async (email, password) => {
  const user = await User.findOne({ email });

  if (!user) {
    throw new Error('unable to login');
  }

  const isMatch = await bcrypt.compare(password, user.password);

  if (!isMatch) {
    throw new Error('Unable to login');
  }

  return user;
};

userSchema.statics.findByEmail = async (email) => {
  const user = await User.findOne({ email });

  if (!user) {
    throw new Error('no user found.');
  }

  return user;
};

// hash the plain text password
// 'this' refers to the individual, specific requested user
userSchema.pre('save', async function (next) {
  const user = this;

  if (user.isModified('password')) {
    user.password = await bcrypt.hash(user.password, 8);
  }

  next();
});

// delete all docs, if the user is deleted.
userSchema.pre('remove', async function (next) {
  const user = this;

  // await aiDocument.deleteMany({ author: user._id });
  await Form.deleteMany({owner : user._id});
  await Tag.deleteMany({owner : user._id});
  await Response.deleteMany({formId : user._id});

  next();
});

const User = mongoose.model('User', userSchema);
module.exports = User;
