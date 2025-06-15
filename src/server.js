"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
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
};
Object.defineProperty(exports, "__esModule", { value: true });
var express_1 = require("express");
var multer_1 = require("multer");
var fs_1 = require("fs");
var promises_1 = require("fs/promises");
var path_1 = require("path");
var client_1 = require("./generated/prisma/client");
var prisma = new client_1.PrismaClient();
var app = (0, express_1.default)();
var port = 3000;
//Multerの設定
var storage = multer_1.default.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
        var uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path_1.default.extname(file.originalname));
    },
});
var upload = (0, multer_1.default)({ storage: storage });
//JSONのbodyをパースするためのミドルウェア
app.use(express_1.default.json());
// 静的ファイルを提供するためのミドルウェア
app.use(express_1.default.static('public'));
app.use('/uploads', express_1.default.static('uploads'));
app.get('/', function (req, res) {
    res.send('YouTube Clone!');
});
//動画アップロードのエンドポイント (Prisma版)
app.post('/upload', upload.single('video'), (function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, title, description, filePath, originalname, videoData, video, error_1;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                if (!req.file) {
                    res.status(400).send('No video file uploaded.');
                    return [2 /*return*/];
                }
                _a = req.body, title = _a.title, description = _a.description;
                filePath = req.file.path;
                originalname = req.file.originalname;
                _b.label = 1;
            case 1:
                _b.trys.push([1, 3, , 4]);
                videoData = {
                    title: title,
                    description: req.body.description === undefined ? null : req.body.description,
                    file_path: filePath,
                    original_name: originalname,
                    upload_date: new Date(),
                };
                return [4 /*yield*/, prisma.video.create({
                        data: videoData,
                    })];
            case 2:
                video = _b.sent();
                res.status(201).json({ message: 'Video uploaded successfully!', videoId: video.id });
                return [3 /*break*/, 4];
            case 3:
                error_1 = _b.sent();
                console.error('Error uploading video:', error_1);
                res.status(500).send('Error uploading video to database.');
                return [3 /*break*/, 4];
            case 4: return [2 /*return*/];
        }
    });
}); }));
//動画リストを取得するエンドポイント (Prisma版)
var getVideosHandler = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var videos, error_2;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                return [4 /*yield*/, prisma.video.findMany({
                        orderBy: {
                            upload_date: 'desc',
                        },
                    })];
            case 1:
                videos = _a.sent();
                res.status(200).json(videos);
                return [3 /*break*/, 3];
            case 2:
                error_2 = _a.sent();
                console.error('Error fetching videos', error_2);
                res.status(500).send('Error fetching videos.');
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); };
app.get('/videos', getVideosHandler);
//特定の動画を取得するエンドポイント
app.get('/video/:id', (function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var videoId, video, error_3;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                videoId = parseInt(req.params.id, 10);
                if (isNaN(videoId)) {
                    return [2 /*return*/, res.status(400).send('Invalid video ID.')];
                }
                _a.label = 1;
            case 1:
                _a.trys.push([1, 3, , 4]);
                return [4 /*yield*/, prisma.video.findUnique({
                        where: {
                            id: videoId,
                        },
                    })];
            case 2:
                video = _a.sent();
                if (video) {
                    res.status(200).json(video);
                }
                else {
                    res.status(404).send('Video not found.');
                }
                return [3 /*break*/, 4];
            case 3:
                error_3 = _a.sent();
                console.error("Error fetching video with ID ".concat(videoId, ":"), error_3);
                res.status(500).send('Error fetching video.');
                return [3 /*break*/, 4];
            case 4: return [2 /*return*/];
        }
    });
}); }));
// ★動画削除のエンドポイントを追加★
app.delete('/videos/:id', (function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var videoId, videoToDelete, filePath, fileError_1, error_4;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                videoId = parseInt(req.params.id, 10);
                if (isNaN(videoId)) {
                    return [2 /*return*/, res.status(400).json({ message: 'Invalid video ID.' })];
                }
                _a.label = 1;
            case 1:
                _a.trys.push([1, 11, , 12]);
                return [4 /*yield*/, prisma.video.findUnique({
                        where: { id: videoId },
                    })];
            case 2:
                videoToDelete = _a.sent();
                if (!videoToDelete) {
                    return [2 /*return*/, res.status(404).json({ message: 'Video not found.' })];
                }
                filePath = videoToDelete.file_path;
                if (!filePath) return [3 /*break*/, 8];
                _a.label = 3;
            case 3:
                _a.trys.push([3, 6, , 7]);
                // ファイルが存在するか確認(非同期版)
                return [4 /*yield*/, promises_1.default.access(filePath)];
            case 4:
                // ファイルが存在するか確認(非同期版)
                _a.sent(); // ファイルが存在しない場合はerrorをスロー
                return [4 /*yield*/, promises_1.default.unlink(filePath)];
            case 5:
                _a.sent(); // ファイルを削除
                console.log("Successfully deleted file: ".concat(filePath));
                return [3 /*break*/, 7];
            case 6:
                fileError_1 = _a.sent();
                if (fileError_1.code === 'ENOENT') {
                    //ファイルが見つからない場合のerrorコード
                    console.warn("Video file not found at ".concat(filePath, ", but proceeding with DB deletion."));
                }
                else {
                    // その他のファイル削除エラー
                    console.error("Error deleting video file ".concat(filePath, ":"), fileError_1);
                    // ここでエラーレスポンスを返すか、データベース削除に進むかは要件による
                    // 例: return res.status(500).json({ message: 'Error deleting video file.' });
                }
                return [3 /*break*/, 7];
            case 7: return [3 /*break*/, 9];
            case 8:
                console.warn("File path not found for video ID ".concat(videoId, ". Proceeding with DB deletion."));
                _a.label = 9;
            case 9: 
            // データベースから動画レコードを削除
            return [4 /*yield*/, prisma.video.delete({
                    where: { id: videoId },
                })];
            case 10:
                // データベースから動画レコードを削除
                _a.sent();
                res.status(204).send();
                return [3 /*break*/, 12];
            case 11:
                error_4 = _a.sent();
                console.error("Error deleting video with ID ".concat(videoId, ":"), error_4);
                res.status(500).json({ message: 'Error deleting video.' });
                return [3 /*break*/, 12];
            case 12: return [2 /*return*/];
        }
    });
}); }));
//uploads ディレクトリが存在しない場合は作成(起動時は一度だけ確認)
var uploadDir = './uploads';
if (!fs_1.default.existsSync(uploadDir)) {
    fs_1.default.mkdirSync(uploadDir);
}
app.listen(port, function () {
    console.log("Server listening at http://localhost:".concat(port));
});
