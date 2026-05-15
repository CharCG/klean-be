"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const multer_1 = __importDefault(require("multer"));
const supabase_js_1 = require("@supabase/supabase-js");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const env_config_1 = require("../config/env.config");
const response_util_1 = require("../utils/response.util");
const router = (0, express_1.Router)();
const upload = (0, multer_1.default)({ storage: multer_1.default.memoryStorage() });
const supabase = (0, supabase_js_1.createClient)(env_config_1.env.SUPABASE_URL, env_config_1.env.SUPABASE_KEY);
router.post('/', auth_middleware_1.authMiddleware, upload.single('file'), async (req, res, next) => {
    try {
        if (!req.file) {
            response_util_1.AppResponse.fail(400, 'No file provided').send(res);
            return;
        }
        const file = req.file;
        const fileExt = file.originalname.split('.').pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
        const filePath = `documents/${fileName}`;
        const { error } = await supabase.storage
            .from('documents')
            .upload(filePath, file.buffer, {
            contentType: file.mimetype,
            upsert: false,
        });
        if (error) {
            response_util_1.AppResponse.error(500, 'Failed to upload file to storage').send(res);
            return;
        }
        const { data: publicUrlData } = supabase.storage
            .from('documents')
            .getPublicUrl(filePath);
        response_util_1.AppResponse.success(200, 'File uploaded', { url: publicUrlData.publicUrl }).send(res);
    }
    catch (err) {
        next(err);
    }
});
exports.default = router;
