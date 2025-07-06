import express from 'express';
import busboy from 'busboy';
import fsSync from 'fs';
import fsPromises from 'fs/promises';
import path from 'path';
import { PrismaClient } from '../dist/generated/prisma';

const prisma = new PrismaClient();
const app = express();
const port = 3000;

//JSONのbodyをパースするためのミドルウェア
app.use(express.json());

// 静的ファイルを提供するためのミドルウェア
app.use(express.static('public'));

app.use('/uploads', express.static('uploads'));

app.get('/', (req: express.Request, res: express.Response) => {
    res.send('YouTube Clone!');
});

//動画アップロードのエンドポイント (Prisma版)
app.post('/upload', async (req: express.Request, res: express.Response) => {
    //busboyのインスタンスを作成
    const bb = busboy({ headers: req.headers });

    let title: string | undefined;
    let description: string | undefined | null = null;
    let filePath: string | undefined;
    let originalname: string | undefined;

    //ファイルを受け取った時の処理
    bb.on('file', (fieldname, file, info) => {
        // fieldname: フォームフィールド名 (例: 'video')
        // info: { filename: '元のファイル名', encoding: '...', mimeType: '...' }
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        originalname = info.filename;
        const filename = `${fieldname}-${uniqueSuffix}${path.extname(originalname)}`;

        //保存先のパスをuploadsディレクトリ内に設定
        const saveTo = path.join(__dirname, '..', 'uploads', filename);
        filePath = saveTo;// データベースに保存するパス

        // ディレクトリが存在しない場合は作成
        const uploadDir = path.dirname(saveTo);
        if (!fsSync.existsSync(uploadDir)) {
            fsSync.mkdirSync(uploadDir, { recursive: true });
        }

        // ファイルをストリームとして保存
        file.pipe(fsSync.createWriteStream(saveTo));

        file.on('end', () => {
            console.log(`File[${fieldname}] uploaded to ${saveTo}`);
        });

        file.on('error', (err) => {
            console.error(`Error during file stream for ${fieldname}:`, err);
            // エラーハンドリング
        });
    });

    // テキストフィールドを受け取った時の処理
    bb.on('field', (fieldname, val) => {
        if (fieldname === 'title') {
            title = val;
        } else if (fieldname === 'description') {
            description = val;
        }
    });

    // 全てのファイルとフィールドの解析が完了した時の処理
    bb.on('finish', async () => {
        console.log('Done parsing form with Busboy!');
        if (!title || !filePath || !originalname) {
            res.status(400).send('Required fields (title, video, file) are missing.');
            return;
        }
        try {
            const videoData = {
                title: title as string,
                description: description, // nullの可能性があるのでそのまま渡す
                file_path: filePath,
                original_name: originalname,
                upload_date: new Date(),
            };
            const video = await prisma.video.create({
              data: videoData,  
            });
            res.status(201).json({ message: 'Video uploaded successfully!', videoId: video.id});
        } catch (error) {
            console.error('Error uploading video to database:', error);
            res.status(500).send('Error uploading video to database.');
        }
    });
    
    // エラーハンドリング
    bb.on('error', (err) => {
        console.error('Busboy error', err);
        res.status(500).send('Error prosessing video upload.');
    });
    req.pipe(bb);
});

//動画リストを取得するエンドポイント (Prisma版)
const getVideosHandler: express.RequestHandler = async (req, res) => {
    try {
        const videos = await prisma.video.findMany({
            orderBy: {
                upload_date: 'desc',
            },
        });
        res.status(200).json(videos);
    } catch (error) {
        console.error('Error fetching videos', error);
        res.status(500).send('Error fetching videos.');
    }
};

app.get('/videos', getVideosHandler);

//特定の動画を取得するエンドポイント
app.get('/video/:id', (async(req: express.Request, res: express.Response) => {
    const videoId = parseInt(req.params.id, 10);

    if(isNaN(videoId)) {
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
        } else {
            res.status(404).send('Video not found.');
        }
    } catch (error) {
        console.error(`Error fetching video with ID ${videoId}:`, error);
        res.status(500).send('Error fetching video.');
    }
}) as express.RequestHandler);

// ★動画削除のエンドポイントを追加★
app.delete('/videos/:id', (async (req: express.Request, res: express.Response) => {
    const videoId = parseInt(req.params.id, 10);

    if (isNaN(videoId)) {
        return res.status(400).json({ message: 'Invalid video ID.' });
    }
    try {
        const videoToDelete = await prisma.video.findUnique({
            where: { id: videoId},
        });
        if (!videoToDelete) {
            return res.status(404).json({ message: 'Video not found.' });
        }
        const filePath = videoToDelete.file_path;

        // サーバーから動画ファイルを削除(fsPromisesを使用)
        if (filePath) {// filePathが nullや undefined ではないことを確認
            
            try {
                // ファイルが存在するか確認(非同期版)
                await fsPromises.access(filePath);// ファイルが存在しない場合はerrorをスロー
                await fsPromises.unlink(filePath);// ファイルを削除
                console.log(`Successfully deleted file: ${filePath}`);

            } catch (fileError: any) { //fileErrorの型をanyにするかErrorを継承する型に
                
                if (fileError.code === 'ENOENT') {
                    //ファイルが見つからない場合のerrorコード
                    console.warn(`Video file not found at ${filePath}, but proceeding with DB deletion.`);
                } else {
                    // その他のファイル削除エラー
                    console.error(`Error deleting video file ${filePath}:`, fileError);
                    // ここでエラーレスポンスを返すか、データベース削除に進むかは要件による
                    // 例: return res.status(500).json({ message: 'Error deleting video file.' });
                }
            }
        } else {
            console.warn(`File path not found for video ID ${videoId}. Proceeding with DB deletion.`);
        }
        // データベースから動画レコードを削除
        await prisma.video.delete({
            where: { id: videoId },
        });
        res.status(204).send();

    } catch (error) {
        console.error(`Error deleting video with ID ${videoId}:`, error);
        res.status(500).json({ message: 'Error deleting video.'});
    }
}) as express.RequestHandler);

//uploads ディレクトリが存在しない場合は作成(起動時は一度だけ確認)
const uploadDir = path.join(__dirname, '..', 'uploads');
if (!fsSync.existsSync(uploadDir)) {
    fsSync.mkdirSync(uploadDir, {recursive: true});
}

app.listen(port, () => {
    console.log(`Server listening at http://localhost:${port}`);
});