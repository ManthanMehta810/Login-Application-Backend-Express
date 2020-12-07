const userSchema = mongoose.Schema(
  {
    userId: { type: String },
    firstName: { type: String },
    lastName: { type: String },
    phoneNumber: { type: String, required: true },
    address: { type: String },
    dOB: { type: Date },
    profilePhoto: { type: String },
    password: { type: String },
    isRegistered: { type: Boolean, default: false, required: true },
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model('User', userSchema);
