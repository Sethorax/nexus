(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('@sethorax/browser-utils')) :
    typeof define === 'function' && define.amd ? define(['exports', '@sethorax/browser-utils'], factory) :
    (factory((global.nexus = {}),global.browserUtils));
}(this, (function (exports,browserUtils) { 'use strict';

    /*! *****************************************************************************
    Copyright (c) Microsoft Corporation. All rights reserved.
    Licensed under the Apache License, Version 2.0 (the "License"); you may not use
    this file except in compliance with the License. You may obtain a copy of the
    License at http://www.apache.org/licenses/LICENSE-2.0

    THIS CODE IS PROVIDED ON AN *AS IS* BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
    KIND, EITHER EXPRESS OR IMPLIED, INCLUDING WITHOUT LIMITATION ANY IMPLIED
    WARRANTIES OR CONDITIONS OF TITLE, FITNESS FOR A PARTICULAR PURPOSE,
    MERCHANTABLITY OR NON-INFRINGEMENT.

    See the Apache Version 2.0 License for specific language governing permissions
    and limitations under the License.
    ***************************************************************************** */
    /* global Reflect, Promise */

    var extendStatics = function(d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };

    function __extends(d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    }

    var __assign = function() {
        __assign = Object.assign || function __assign(t) {
            for (var s, i = 1, n = arguments.length; i < n; i++) {
                s = arguments[i];
                for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p)) t[p] = s[p];
            }
            return t;
        };
        return __assign.apply(this, arguments);
    };

    function __awaiter(thisArg, _arguments, P, generator) {
        return new (P || (P = Promise))(function (resolve, reject) {
            function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
            function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
            function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
            step((generator = generator.apply(thisArg, _arguments || [])).next());
        });
    }

    function __generator(thisArg, body) {
        var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
        return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
        function verb(n) { return function (v) { return step([n, v]); }; }
        function step(op) {
            if (f) throw new TypeError("Generator is already executing.");
            while (_) try {
                if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
                if (y = 0, t) op = [op[0] & 2, t.value];
                switch (op[0]) {
                    case 0: case 1: t = op; break;
                    case 4: _.label++; return { value: op[1], done: false };
                    case 5: _.label++; y = op[1]; op = [0]; continue;
                    case 7: op = _.ops.pop(); _.trys.pop(); continue;
                    default:
                        if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                        if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                        if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                        if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                        if (t[2]) _.ops.pop();
                        _.trys.pop(); continue;
                }
                op = body.call(thisArg, _);
            } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
            if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
        }
    }

    var Nexus = /** @class */ (function () {
        function Nexus(parser, config) {
            if (config === void 0) { config = {}; }
            this.loading = false;
            this.retryCount = 0;
            this.parser = null;
            this.pushHistory = true;
            this.config = {
                contentRootSelector: "body",
                excludeUrls: new RegExp(".([a-z]+)$", "gm"),
                maxRetries: 3,
                retryTimeout: 500,
                vanillaPageLoadOnError: true,
            };
            this.listeners = {
                error: [],
                beforeLoad: [],
                afterLoad: [],
                beforeSwap: [],
                afterSwap: [],
                targetUrlValidation: [],
            };
            this.parser = parser;
            this.config = __assign({}, this.config, config);
        }
        Nexus.prototype.on = function (type, callback) {
            this.listeners[type].push({ type: type, callback: callback });
            return this;
        };
        Nexus.prototype.watch = function () {
            try {
                this.interceptLinks();
                this.watchPopstate();
            }
            catch (e) {
                this.dispatchError(e);
            }
        };
        Nexus.prototype.dispatchError = function (message) {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.dispatchEvent("error", {
                                url: this.currentUrl,
                                target: this.currentTarget,
                                message: message,
                            })];
                        case 1:
                            _a.sent();
                            if (this.config.vanillaPageLoadOnError && this.currentTarget) {
                                location.href = this.currentUrl;
                            }
                            return [2 /*return*/];
                    }
                });
            });
        };
        Nexus.prototype.swapContent = function (rawData, parsedData) {
            return __awaiter(this, void 0, void 0, function () {
                var title, content, contentRootAttributes, htmlAttributes, bodyAttributes, contentRoot;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            title = parsedData.title, content = parsedData.content, contentRootAttributes = parsedData.contentRootAttributes, htmlAttributes = parsedData.htmlAttributes, bodyAttributes = parsedData.bodyAttributes;
                            contentRoot = document.querySelector(this.config.contentRootSelector);
                            if (!contentRoot) {
                                throw Error("ContentRoot does not exist!");
                            }
                            contentRoot.innerHTML = content;
                            if (title) {
                                document.title = title;
                            }
                            if (contentRootAttributes) {
                                contentRootAttributes.forEach(function (a) {
                                    return contentRoot.setAttribute(a.name, a.value);
                                });
                            }
                            if (bodyAttributes) {
                                bodyAttributes.forEach(function (a) {
                                    return document.body.setAttribute(a.name, a.value);
                                });
                            }
                            if (htmlAttributes) {
                                htmlAttributes.forEach(function (a) {
                                    return document.documentElement.setAttribute(a.name, a.value);
                                });
                            }
                            if (this.pushHistory) {
                                history.pushState({}, title, this.currentUrl);
                            }
                            return [4 /*yield*/, this.dispatchEvent("afterSwap", {
                                    url: this.currentUrl,
                                    target: this.currentTarget,
                                    parsedData: parsedData,
                                    rawData: rawData,
                                })];
                        case 1:
                            _a.sent();
                            this.loading = false;
                            return [2 /*return*/];
                    }
                });
            });
        };
        Nexus.prototype.handleRawPageData = function (data) {
            return __awaiter(this, void 0, void 0, function () {
                var parsedData;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            parsedData = this.parser.parse(data);
                            return [4 /*yield*/, this.dispatchEvent("beforeSwap", {
                                    url: this.currentUrl,
                                    target: this.currentTarget,
                                    rawData: data,
                                    parsedData: parsedData,
                                })];
                        case 1:
                            _a.sent();
                            this.swapContent(data, parsedData);
                            return [2 /*return*/];
                    }
                });
            });
        };
        Nexus.prototype.handleLoadResult = function (res) {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.dispatchEvent("afterLoad", {
                                url: this.currentUrl,
                                target: this.currentTarget,
                            })];
                        case 1:
                            _a.sent();
                            try {
                                this.handleRawPageData(res);
                            }
                            catch (e) {
                                this.dispatchError(e);
                            }
                            return [2 /*return*/];
                    }
                });
            });
        };
        Nexus.prototype.fetchPageContents = function (url) {
            var _this = this;
            var controller = new AbortController();
            var signal = controller.signal;
            var retry = function () {
                _this.retryCount++;
                console.warn("Could not fetch page! Retrying (" + _this.retryCount + "/" + _this.config.maxRetries + ") ...");
                controller.abort();
                setTimeout(function () { return _this.fetchPageContents(url); }, _this.config.retryTimeout);
            };
            fetch(url, __assign({}, this.config.fetchConfig, { signal: signal }))
                .then(function (res) {
                if (res.status >= 400) {
                    throw new Error();
                }
                return res.text();
            })
                .then(function (res) { return _this.handleLoadResult(res); })
                .catch(function () {
                if (_this.retryCount < _this.config.maxRetries) {
                    retry();
                }
                else {
                    _this.dispatchError("Could not fetch page! Max retries exceeded!");
                }
            });
        };
        Nexus.prototype.loadPage = function (url, target) {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            if (this.loading)
                                return [2 /*return*/];
                            this.loading = true;
                            this.currentTarget = target;
                            this.currentUrl = url;
                            return [4 /*yield*/, this.dispatchEvent("beforeLoad", { url: url, target: target })];
                        case 1:
                            _a.sent();
                            this.fetchPageContents(url);
                            return [2 /*return*/];
                    }
                });
            });
        };
        Nexus.prototype.dispatchEvent = function (type, ev) {
            return Promise.all(this.listeners[type].map(function (l) { return Promise.resolve(l.callback(ev)); }));
        };
        Nexus.prototype.validateUrl = function (url, target) {
            return (target.target !== "blank" &&
                this.config.excludeUrls.exec(url) === null &&
                url.indexOf(location.origin) > -1 &&
                url
                    .substr(location.origin.length)
                    .substr(0, 2)
                    .indexOf("#") === -1 &&
                this.listeners["targetUrlValidation"].every(function (l) { return l.callback({ url: url, target: target }) !== false; }));
        };
        Nexus.prototype.interceptLinks = function () {
            return __awaiter(this, void 0, void 0, function () {
                var _this = this;
                return __generator(this, function (_a) {
                    this.onElementClick("a", function (event, target) { return __awaiter(_this, void 0, void 0, function () {
                        var url;
                        return __generator(this, function (_a) {
                            url = target.href;
                            if (this.validateUrl(url, target)) {
                                event.preventDefault();
                                if (url !== location.href) {
                                    this.pushHistory = true;
                                    this.loadPage(url, target);
                                }
                            }
                            return [2 /*return*/];
                        });
                    }); });
                    return [2 /*return*/];
                });
            });
        };
        Nexus.prototype.watchPopstate = function () {
            var _this = this;
            window.onpopstate = function () {
                _this.currentUrl = location.href;
                _this.currentTarget = null;
                _this.pushHistory = false;
                _this.loadPage(location.href, null);
            };
        };
        Nexus.prototype.onElementClick = function (selector, callback) {
            document.addEventListener("click", function (event) {
                var path = browserUtils.getEventPath(event);
                var target = path.find(function (e) {
                    return browserUtils.elementMatches(e, selector);
                });
                if (target) {
                    callback(event, target);
                }
            });
        };
        return Nexus;
    }());

    var NexusParseError = /** @class */ (function (_super) {
        __extends(NexusParseError, _super);
        function NexusParseError() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        return NexusParseError;
    }(Error));
    var NexusParser = /** @class */ (function () {
        function NexusParser() {
        }
        return NexusParser;
    }());

    exports.Nexus = Nexus;
    exports.NexusParseError = NexusParseError;
    exports.NexusParser = NexusParser;

    Object.defineProperty(exports, '__esModule', { value: true });

})));
