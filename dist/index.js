"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const app_1 = require("./app");
const env_config_1 = require("./config/env.config");
app_1.app.listen(env_config_1.env.PORT);
