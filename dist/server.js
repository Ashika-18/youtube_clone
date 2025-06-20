"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const multer_1 = __importDefault(require("multer"));
const fs_1 = __importDefault(require("fs"));
const promises_1 = __importDefault(require("fs/promises"));
const path_1 = __importDefault(require("path"));
const client_1 = require("./generated/prisma/client");
const prisma = new client_1.PrismaClient();
const app = (0, express_1.default)();
const port = 3000;
//Multerの設定
const storage = multer_1.default.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path_1.default.extname(file.originalname));
    },
});
const upload = (0, multer_1.default)({ storage: storage });
//JSONのbodyをパースするためのミドルウェア
app.use(express_1.default.json());
// 静的ファイルを提供するためのミドルウェア
app.use(express_1.default.static('public'));
app.use('/uploads', express_1.default.static('uploads'));
app.get('/', (req, res) => {
    res.send('YouTube Clone!');
});
//動画アップロードのエンドポイント (Prisma版)
app.post('/upload', upload.single('video'), (async (req, res) => {
    if (!req.file) {
        res.status(400).send('No video file uploaded.');
        return;
    }
    const { title, description } = req.body;
    const filePath = req.file.path;
    const originalname = req.file.originalname;
    try {
        const videoData = {
            title: title,
            description: req.body.description === undefined ? null : req.body.description,
            file_path: filePath,
            original_name: originalname,
            upload_date: new Date(),
        };
        const video = await prisma.video.create({
            data: videoData,
        });
        res.status(201).json({ message: 'Video uploaded successfully!', videoId: video.id });
    }
    catch (error) {
        console.error('Error uploading video:', error);
        res.status(500).send('Error uploading video to database.');
    }
}));
//動画リストを取得するエンドポイント (Prisma版)
const getVideosHandler = async (req, res) => {
    try {
        const videos = await prisma.video.findMany({
            orderBy: {
                upload_date: 'desc',
            },
        });
        res.status(200).json(videos);
    }
    catch (error) {
        console.error('Error fetching videos', error);
        res.status(500).send('Error fetching videos.');
    }
};
app.get('/videos', getVideosHandler);
//特定の動画を取得するエンドポイント
app.get('/video/:id', (async (req, res) => {
    const videoId = parseInt(req.params.id, 10);
    if (isNaN(videoId)) {
        return res.status(400).send('Invalid video ID.');
    }
    try {
        const video = await prisma.video.findUnique({
            where: {
                id: videoId,
            },
        });
        if (video) {
            res.status(200).json(video);
        }
        else {
            res.status(404).send('Video not found.');
        }
    }
    catch (error) {
        console.error(`Error fetching video with ID ${videoId}:`, error);
        res.status(500).send('Error fetching video.');
    }
}));
// ★動画削除のエンドポイントを追加★
app.delete('/videos/:id', (async (req, res) => {
    const videoId = parseInt(req.params.id, 10);
    if (isNaN(videoId)) {
        return res.status(400).json({ message: 'Invalid video ID.' });
    }
    try {
        const videoToDelete = await prisma.video.findUnique({
            where: { id: videoId },
        });
        if (!videoToDelete) {
            return res.status(404).json({ message: 'Video not found.' });
        }
        const filePath = videoToDelete.file_path;
        // サーバーから動画ファイルを削除(fsPromisesを使用)
        if (filePath) { // filePathが nullや undefined ではないことを確認
            try {
                // ファイルが存在するか確認(非同期版)
                await promises_1.default.access(filePath); // ファイルが存在しない場合はerrorをスロー
                await promises_1.default.unlink(filePath); // ファイルを削除
                console.log(`Successfully deleted file: ${filePath}`);
            }
            catch (fileError) { //fileErrorの型をanyにするかErrorを継承する型に
                if (fileError.code === 'ENOENT') {
                    //ファイルが見つからない場合のerrorコード
                    console.warn(`Video file not found at ${filePath}, but proceeding with DB deletion.`);
                }
                else {
                    // その他のファイル削除エラー
                    console.error(`Error deleting video file ${filePath}:`, fileError);
                    // ここでエラーレスポンスを返すか、データベース削除に進むかは要件による
                    // 例: return res.status(500).json({ message: 'Error deleting video file.' });
                }
            }
        }
        else {
            console.warn(`File path not found for video ID ${videoId}. Proceeding with DB deletion.`);
        }
        // データベースから動画レコードを削除
        await prisma.video.delete({
            where: { id: videoId },
        });
        res.status(204).send();
    }
    catch (error) {
        console.error(`Error deleting video with ID ${videoId}:`, error);
        res.status(500).json({ message: 'Error deleting video.' });
    }
}));
//uploads ディレクトリが存在しない場合は作成(起動時は一度だけ確認)
const uploadDir = './uploads';
if (!fs_1.default.existsSync(uploadDir)) {
    fs_1.default.mkdirSync(uploadDir);
}
app.listen(port, () => {
    console.log(`Server listening at http://localhost:${port}`);
});
