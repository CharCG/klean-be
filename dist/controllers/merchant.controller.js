"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMyMerchantDashboard = exports.updateMyMerchantProfile = exports.getMyMerchantProfile = exports.getMerchantById = exports.listMerchants = void 0;
const merchantService = __importStar(require("../services/merchant.service"));
const response_util_1 = require("../utils/response.util");
const listMerchants = async (req, res, next) => {
    try {
        const data = await merchantService.listMerchants();
        response_util_1.AppResponse.success(200, 'Merchants retrieved successfully', data).send(res);
    }
    catch (err) {
        next(err);
    }
};
exports.listMerchants = listMerchants;
const getMerchantById = async (req, res, next) => {
    try {
        const data = await merchantService.getMerchantById(req.params.id);
        response_util_1.AppResponse.success(200, 'Merchant retrieved successfully', data).send(res);
    }
    catch (err) {
        next(err);
    }
};
exports.getMerchantById = getMerchantById;
const getMyMerchantProfile = async (req, res, next) => {
    try {
        const data = await merchantService.getMerchantByUserId(req.user.id);
        response_util_1.AppResponse.success(200, 'Merchant profile retrieved successfully', data).send(res);
    }
    catch (err) {
        next(err);
    }
};
exports.getMyMerchantProfile = getMyMerchantProfile;
const updateMyMerchantProfile = async (req, res, next) => {
    try {
        const data = await merchantService.updateMerchantProfile(req.user.id, req.body);
        response_util_1.AppResponse.success(200, 'Merchant profile updated successfully', data).send(res);
    }
    catch (err) {
        next(err);
    }
};
exports.updateMyMerchantProfile = updateMyMerchantProfile;
const getMyMerchantDashboard = async (req, res, next) => {
    try {
        const data = await merchantService.getMerchantDashboard(req.user.id);
        response_util_1.AppResponse.success(200, 'Merchant dashboard retrieved successfully', data).send(res);
    }
    catch (err) {
        next(err);
    }
};
exports.getMyMerchantDashboard = getMyMerchantDashboard;
