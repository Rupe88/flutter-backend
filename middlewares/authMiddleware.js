const jwt = require('jsonwebtoken');
const UserModel = require('../models/userModel');
const ErrorHandler = require('../utils/ErrorHandler');

const authMiddleware = async (req, res, next) => {
    const token = req.headers.authorization;
    if (!token || !token.startsWith('Bearer ')) {
        return next(new ErrorHandler('Unauthorized', 401));
    }

    try {
        const decoded = jwt.verify(token.split(' ')[1], process.env.JWT_SECRET);
        const user = await UserModel.findById(decoded.id);

        if (!user) {
            return next(new ErrorHandler('User not found', 404));
        }

        req.user = user;
        next();
    } catch (error) {
        return next(new ErrorHandler('Unauthorized', 401));
    }
};

module.exports = authMiddleware;
