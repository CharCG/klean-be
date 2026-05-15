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
const orderController = __importStar(require("../controllers/order.controller"));
const reviewController = __importStar(require("../controllers/review.controller"));
const reportController = __importStar(require("../controllers/report.controller"));
const express_1 = require("express");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const validate_middleware_1 = require("../middlewares/validate.middleware");
const order_schema_1 = require("../schemas/order.schema");
const review_schema_1 = require("../schemas/review.schema");
const report_schema_1 = require("../schemas/report.schema");
const router = (0, express_1.Router)();
router.post('/', auth_middleware_1.authMiddleware, auth_middleware_1.customerGuard, (0, validate_middleware_1.validateMiddleware)(order_schema_1.createOrderSchema, 'body'), orderController.createOrder);
router.get('/mine', auth_middleware_1.authMiddleware, auth_middleware_1.customerGuard, orderController.listCustomerOrders);
router.get('/merchant', auth_middleware_1.authMiddleware, auth_middleware_1.merchantGuard, orderController.listMerchantOrders);
router.get('/:id', auth_middleware_1.authMiddleware, orderController.getOrderById);
router.post('/:orderId/reviews', auth_middleware_1.authMiddleware, auth_middleware_1.customerGuard, (0, validate_middleware_1.validateMiddleware)(review_schema_1.createReviewSchema, 'body'), reviewController.createReview);
router.post('/:orderId/reports', auth_middleware_1.authMiddleware, auth_middleware_1.customerGuard, (0, validate_middleware_1.validateMiddleware)(report_schema_1.createReportSchema, 'body'), reportController.createReport);
router.patch('/:id/status', auth_middleware_1.authMiddleware, auth_middleware_1.merchantGuard, (0, validate_middleware_1.validateMiddleware)(order_schema_1.updateOrderStatusSchema, 'body'), orderController.updateOrderStatus);
router.patch('/:id/eta', auth_middleware_1.authMiddleware, auth_middleware_1.merchantGuard, (0, validate_middleware_1.validateMiddleware)(order_schema_1.updateEtaSchema, 'body'), orderController.updateOrderEta);
router.patch('/:id/confirm', auth_middleware_1.authMiddleware, auth_middleware_1.customerGuard, orderController.confirmOrderReceived);
exports.default = router;
