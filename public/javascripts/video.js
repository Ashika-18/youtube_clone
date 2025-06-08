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
document.addEventListener('DOMContentLoaded', function () { return __awaiter(_this, void 0, void 0, function () {
    //URLから動画IDを取得する関数
    function getVideoIdFromUrl() {
        var params = new URLSearchParams(window.location.search);
        var id = params.get('id');
        return id ? parseInt(id, 10) : null;
    }
    var videoTitleElement, videoPlayerElement, videoDescriptionElement, errorMessageElement, videoId, response, video, error_1;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                videoTitleElement = document.getElementById('videoTitle');
                videoPlayerElement = document.getElementById('videoPlayer');
                videoDescriptionElement = document.getElementById('videoDescription');
                errorMessageElement = document.getElementById('errorMessage');
                videoId = getVideoIdFromUrl();
                //★重要: ここで、必須DOM要素が全て取得できたか（nullではないか）を最初にチェックします。
                //        どれか一つでも null なら、それ以降の処理は行わず関数を終了します。
                if (!videoTitleElement || !videoPlayerElement || !videoDescriptionElement || !errorMessageElement) {
                    console.error('One or more required DOM elements not found.');
                    //この時点では画面にerror表示できないため、コンソールにログを出力する
                    return [2 /*return*/];
                }
                // ★ここから下では、TypeScriptはこれら全てのDOM要素が null ではないと認識しますが、
                //   `errorMessageElement` の特定のケースで警告が出るため、`!` を使用します。
                if (!videoId) {
                    //IDがない場合はerrorメッセージを表示
                    errorMessageElement.textContent = 'Error: Video ID not found in URL.';
                    errorMessageElement.style.display = 'block';
                    videoTitleElement.textContent = 'Video Not Found';
                    videoPlayerElement.style.display = 'none'; //プレイヤーを非表示
                    videoDescriptionElement.style.display = 'none'; // 説明も非表示
                    return [2 /*return*/];
                }
                _a.label = 1;
            case 1:
                _a.trys.push([1, 4, , 5]);
                return [4 /*yield*/, fetch("/video/".concat(videoId))];
            case 2:
                response = _a.sent();
                if (!response.ok) {
                    //errorレスポンスの場合
                    if (response.status === 404) {
                        videoTitleElement.textContent = 'Video Not Found';
                        errorMessageElement.textContent = 'The requested video does not exist.';
                    }
                    else {
                        errorMessageElement.textContent = "Error loading video: HTTP status ".concat(response.status);
                    }
                    errorMessageElement.style.display = 'block';
                    videoPlayerElement.style.display = 'none';
                    videoDescriptionElement.style.display = 'none';
                    return [2 /*return*/];
                }
                return [4 /*yield*/, response.json()];
            case 3:
                video = _a.sent();
                //取得した動画情報をページに表示
                videoTitleElement.textContent = video.title;
                videoPlayerElement.src = "/".concat(video.file_path); // 動画ファイルのパスと設定(サーバーの/uploadsに対応)
                videoDescriptionElement.textContent = video.description || 'No description provided.'; // 説明がなければデフォルトメッセージ
                videoPlayerElement.load();
                videoPlayerElement.play();
                return [3 /*break*/, 5];
            case 4:
                error_1 = _a.sent();
                console.error('Error fetching video details:', error_1);
                errorMessageElement.textContent = "Failed to load video: ".concat(error_1.message);
                errorMessageElement.style.display = 'block';
                videoTitleElement.textContent = 'Error Loading Video';
                videoPlayerElement.style.display = 'none';
                videoDescriptionElement.style.display = 'none';
                return [3 /*break*/, 5];
            case 5:
                console.log('video読み込みOK');
                return [2 /*return*/];
        }
    });
}); });
