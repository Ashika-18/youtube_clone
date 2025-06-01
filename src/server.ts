import express, { Request, Response } from 'express';
import { Pool } from 'pg';
import multer, { Storage } from 'multer';
import fs from 'fs'
import path from 'path';

const app = express();
const port = 3000;

//PostgreSQL接続設定
const pool = new Pool({
    user: 'your_username',
    host: 'localhost',
    database: 'your_database',
    password: 'your_password',
    port: 5432,
});

//Multerの設定
const storage: Storage = multer.diskStrorage({
    destination: (req, file, cd) => {
        cd(null, 'uploads/');
    },
    filename: (req, file, cd) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() *1E9);
        cd(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({ storage: storage });

//JSONのbodyをパースするためのミドルウェア
app.use(express.json());

app.get('/', (req: Request, res: Response) => {
    res.send('YouTube Clone!');
});

//動画アップロードのエンドポイント
app.post('/upload', upload.single('video'), async (req: Request, res: Response) => {
    if (!req.file) {
        return res.status(400).send('No video file uploaded.');
    }
    const { title, description } = req.body;
    const filePath = req.file.path;
    const originalname = req.file.originalname;

    try {
        const result = await pool.query(
            'INSERT INTO videos (title, description, file_path, originalname, upload_date) VALUES ($1, $2, $3, $4, NOW()) RETURNING id',
            [title, description, filePath, originalname] 
        );
        res.status(201).json({ message: 'Video uploaded successfully!', videoId: result.rows[0].id });
    } catch (error) {
        console.error('Error uploading video:', error);
        res.status(500).send('Error up loading video to database.');
    }
});

//uploads ディレクトリが存在しない場合は作成
const uploadDir = './uploads';
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir);
}

app.listen(port, () => {
    console.log(`Server listening at http://localhost:${port}`);
});