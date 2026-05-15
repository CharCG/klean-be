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
exports.verifyPayment = exports.handleWebhook = void 0;
const paymentService = __importStar(require("../services/payment.service"));
const response_util_1 = require("../utils/response.util");
const handleWebhook = async (req, res, next) => {
    try {
        await paymentService.handleWebhook(req.body);
        response_util_1.AppResponse.success(200, 'Webhook processed').send(res);
    }
    catch (err) {
        next(err);
    }
};
exports.handleWebhook = handleWebhook;
const verifyPayment = async (req, res, next) => {
    try {
        const data = await paymentService.verifyAndSyncPayment(req.params.orderId);
        response_util_1.AppResponse.success(200, 'Payment status synced', data).send(res);
    }
    catch (err) {
        next(err);
    }
};
exports.verifyPayment = verifyPayment;
