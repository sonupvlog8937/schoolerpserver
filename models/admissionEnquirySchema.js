const mongoose = require('mongoose');

const admissionEnquirySchema = new mongoose.Schema({
    school: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'admin',
        required: true,
        index: true,
    },
    studentName: {
        type: String,
        required: true,
        trim: true,
    },
    guardianName: {
        type: String,
        required: true,
        trim: true,
    },
    phone: {
        type: String,
        required: true,
        trim: true,
    },
    email: {
        type: String,
        trim: true,
        default: '',
    },
    address: {
        type: String,
        trim: true,
        default: '',
    },
    classApplyingFor: {
        type: String,
        required: true,
        trim: true,
    },
    source: {
        type: String,
        enum: ['Walk-in', 'Phone', 'Website', 'Referral', 'Social Media', 'Other'],
        default: 'Walk-in',
    },
    enquiryDate: {
        type: Date,
        required: true,
    },
    followUpDate: {
        type: Date,
    },
    status: {
        type: String,
        enum: ['New', 'Contacted', 'Follow-up', 'Converted', 'Closed'],
        default: 'New',
    },
    assignedTo: {
        type: String,
        trim: true,
        default: '',
    },
    notes: {
        type: String,
        trim: true,
        default: '',
    },
}, { timestamps: true });

admissionEnquirySchema.index({ school: 1, status: 1, enquiryDate: -1 });

module.exports = mongoose.model('admissionEnquiry', admissionEnquirySchema);
