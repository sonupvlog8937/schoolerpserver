const AdmissionEnquiry = require('../models/admissionEnquirySchema');

const allowedStatuses = ['New', 'Contacted', 'Follow-up', 'Converted', 'Closed'];
const allowedSources = ['Walk-in', 'Phone', 'Website', 'Referral', 'Social Media', 'Other'];

const normalizePayload = (payload) => {
    const normalized = {
        studentName: payload.studentName?.trim(),
        guardianName: payload.guardianName?.trim(),
        phone: payload.phone?.trim(),
        email: payload.email?.trim() || '',
        address: payload.address?.trim() || '',
        classApplyingFor: payload.classApplyingFor?.trim(),
        source: payload.source || 'Walk-in',
        enquiryDate: payload.enquiryDate,
        followUpDate: payload.followUpDate || null,
        status: payload.status || 'New',
        assignedTo: payload.assignedTo?.trim() || '',
        notes: payload.notes?.trim() || '',
    };

    return normalized;
};

const validateEnquiry = (enquiry) => {
    const errors = [];

    if (!enquiry.studentName) errors.push('Student name is required.');
    if (!enquiry.guardianName) errors.push('Guardian name is required.');
    if (!enquiry.phone) errors.push('Phone is required.');
    if (!enquiry.classApplyingFor) errors.push('Class is required.');
    if (!enquiry.enquiryDate) errors.push('Enquiry date is required.');

    if (enquiry.source && !allowedSources.includes(enquiry.source)) {
        errors.push('Invalid source.');
    }

    if (enquiry.status && !allowedStatuses.includes(enquiry.status)) {
        errors.push('Invalid status.');
    }

    if (enquiry.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(enquiry.email)) {
        errors.push('Invalid email address.');
    }

    if (enquiry.phone && !/^\+?[0-9\s-]{8,15}$/.test(enquiry.phone)) {
        errors.push('Invalid phone number.');
    }

    return errors;
};

const createAdmissionEnquiry = async (req, res) => {
    try {
        const normalized = normalizePayload(req.body);
        const errors = validateEnquiry(normalized);

        if (errors.length) {
            return res.status(400).json({ message: errors.join(' ') });
        }

        const enquiry = new AdmissionEnquiry({
            ...normalized,
            school: req.body.school,
        });

        const saved = await enquiry.save();
        return res.status(201).json(saved);
    } catch (err) {
        return res.status(500).json({ message: 'Failed to create admission enquiry.', error: err.message });
    }
};

const listAdmissionEnquiries = async (req, res) => {
    try {
        const { status, source, classApplyingFor, fromDate, toDate, search } = req.query;

        const query = { school: req.params.id };

        if (status && allowedStatuses.includes(status)) query.status = status;
        if (source && allowedSources.includes(source)) query.source = source;
        if (classApplyingFor) query.classApplyingFor = classApplyingFor;

        if (fromDate || toDate) {
            query.enquiryDate = {};
            if (fromDate) query.enquiryDate.$gte = new Date(fromDate);
            if (toDate) query.enquiryDate.$lte = new Date(toDate);
        }

        if (search) {
            query.$or = [
                { studentName: { $regex: search, $options: 'i' } },
                { guardianName: { $regex: search, $options: 'i' } },
                { phone: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } },
            ];
        }

        const enquiries = await AdmissionEnquiry.find(query).sort({ enquiryDate: -1, createdAt: -1 });

        if (!enquiries.length) {
            return res.json({ message: 'No admission enquiries found.' });
        }

        return res.json(enquiries);
    } catch (err) {
        return res.status(500).json({ message: 'Failed to fetch admission enquiries.', error: err.message });
    }
};

const updateAdmissionEnquiry = async (req, res) => {
    try {
        const normalized = normalizePayload(req.body);
        const errors = validateEnquiry(normalized);

        if (errors.length) {
            return res.status(400).json({ message: errors.join(' ') });
        }

        const updated = await AdmissionEnquiry.findByIdAndUpdate(req.params.id, normalized, { new: true });

        if (!updated) {
            return res.status(404).json({ message: 'Admission enquiry not found.' });
        }

        return res.json(updated);
    } catch (err) {
        return res.status(500).json({ message: 'Failed to update admission enquiry.', error: err.message });
    }
};

const deleteAdmissionEnquiry = async (req, res) => {
    try {
        const deleted = await AdmissionEnquiry.findByIdAndDelete(req.params.id);

        if (!deleted) {
            return res.status(404).json({ message: 'Admission enquiry not found.' });
        }

        return res.json({ message: 'Admission enquiry deleted successfully.' });
    } catch (err) {
        return res.status(500).json({ message: 'Failed to delete admission enquiry.', error: err.message });
    }
};

module.exports = {
    createAdmissionEnquiry,
    listAdmissionEnquiries,
    updateAdmissionEnquiry,
    deleteAdmissionEnquiry,
    allowedStatuses,
    allowedSources,
};
