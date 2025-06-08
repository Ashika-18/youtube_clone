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
var _this = this;
document.addEventListener('DOMContentLoaded', function () {
    var uploadForm = document.getElementById('uploadForm');
    var uploadStatus = document.getElementById('uploadStatus');
    var videoListContainer = document.getElementById('videoList');
    //動画リスト取得と表示の処理(最上位スコープに移動)
    function fetchAndDisplayVideos() {
        return __awaiter(this, void 0, void 0, function () {
            var response, videos, error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!videoListContainer) {
                            console.error('Video list container not found.');
                            return [2 /*return*/];
                        }
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 4, , 5]);
                        return [4 /*yield*/, fetch('/videos')];
                    case 2:
                        response = _a.sent();
                        if (!response.ok) {
                            throw new Error("HTTP error! status: ".concat(response.status));
                        }
                        return [4 /*yield*/, response.json()];
                    case 3:
                        videos = _a.sent();
                        console.log('取得した動画リスト:', videos);
                        //既存の動画リストをクリア(重複表示を防ぐため)
                        videoListContainer.innerHTML = '';
                        if (videos.length === 0) {
                            videoListContainer.textContent = 'No videos upload yet.';
                            return [2 /*return*/];
                        }
                        videos.forEach(function (video) {
                            var videoItem = document.createElement('div');
                            videoItem.classList.add('video_item');
                            var titleElement = document.createElement('h3');
                            titleElement.textContent = video.title;
                            var videoPlayer = document.createElement('video');
                            videoPlayer.src = video.file_path;
                            videoPlayer.controls = true;
                            videoPlayer.width = 320;
                            videoPlayer.height = 240;
                            videoPlayer.autoplay = false;
                            videoPlayer.muted = false;
                            if (video.description) {
                                var descriptionElement = document.createElement('p');
                                descriptionElement.textContent = video.description;
                                videoItem.appendChild(descriptionElement);
                            }
                            videoItem.appendChild(titleElement);
                            videoItem.appendChild(videoPlayer);
                            videoListContainer.appendChild(videoItem);
                        });
                        return [3 /*break*/, 5];
                    case 4:
                        error_1 = _a.sent();
                        console.error('動画リストの取得に失敗しました!:', error_1);
                        if (videoListContainer) {
                            videoListContainer.textContent = "Failed to load videos: ".concat(error_1.message);
                        }
                        return [3 /*break*/, 5];
                    case 5: return [2 /*return*/];
                }
            });
        });
    }
    //動画アップロードフォームの処理
    if (uploadForm && uploadStatus) {
        uploadForm.addEventListener('submit', function (event) { return __awaiter(_this, void 0, void 0, function () {
            var formData, response, result, errorText, error_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        event.preventDefault();
                        formData = new FormData(uploadForm);
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 7, , 8]);
                        uploadStatus.textContent = 'Uploading...';
                        return [4 /*yield*/, fetch('/upload', {
                                method: 'POST',
                                body: formData,
                            })];
                    case 2:
                        response = _a.sent();
                        if (!response.ok) return [3 /*break*/, 4];
                        return [4 /*yield*/, response.json()];
                    case 3:
                        result = _a.sent();
                        uploadStatus.textContent = "Upload successful! Video ID: ".concat(result.videoId);
                        uploadForm.reset();
                        //動画アップロード後にリストを再読み込みする
                        fetchAndDisplayVideos();
                        return [3 /*break*/, 6];
                    case 4: return [4 /*yield*/, response.text()];
                    case 5:
                        errorText = _a.sent();
                        uploadStatus.textContent = "Upload failed: ".concat(errorText);
                        _a.label = 6;
                    case 6: return [3 /*break*/, 8];
                    case 7:
                        error_2 = _a.sent();
                        uploadStatus.textContent = "Upload failed: ".concat(error_2.message);
                        return [3 /*break*/, 8];
                    case 8: return [2 /*return*/];
                }
            });
        }); });
    }
    //ページ見込み時に動画リストをフェッチして表示
    fetchAndDisplayVideos();
});
