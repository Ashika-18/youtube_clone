//videoインターフェースを再利用
interface Video {
    id: number;
    title: string;
    description: string;
    file_path: string;
    original_name: string;
    upload_date: string;
}

document.addEventListener('DOMContentLoaded', async () => {
    const videoTitleElement = document.getElementById('videoTitle') as HTMLHeadingElement | null;
    const videoPlayerElement = document.getElementById('videoPlayer') as HTMLVideoElement | null;
    const videoDescriptionElement = document.getElementById('videoDescription') as HTMLParagraphElement | null;
    const errorMessageElement = document.getElementById('errorMessage') as HTMLParagraphElement | null;

    //URLから動画IDを取得する関数
    function getVideoIdFromUrl(): number | null {
        const params = new URLSearchParams(window.location.search);
        const id = params.get('id');
        return id ? parseInt(id, 10) : null;
    }
    const videoId = getVideoIdFromUrl();

    //★重要: ここで、必須DOM要素が全て取得できたか（nullではないか）を最初にチェックします。
    //        どれか一つでも null なら、それ以降の処理は行わず関数を終了します。
    if (!videoTitleElement || !videoPlayerElement || !videoDescriptionElement || !errorMessageElement) {
        console.error('One or more required DOM elements not found.');
        //この時点では画面にerror表示できないため、コンソールにログを出力する
        return;
    }
    // ★ここから下では、TypeScriptはこれら全てのDOM要素が null ではないと認識しますが、
    //   `errorMessageElement` の特定のケースで警告が出るため、`!` を使用します。

    if (!videoId) {
    //IDがない場合はerrorメッセージを表示
        errorMessageElement!.textContent = 'Error: Video ID not found in URL.';
        errorMessageElement!.style.display = 'block';
        videoTitleElement.textContent = 'Video Not Found';
        videoPlayerElement.style.display = 'none'; //プレイヤーを非表示
        videoDescriptionElement.style.display = 'none';// 説明も非表示
        return;
    }

    try {
    //サーバーから特定の動画情報を取得
    const response = await fetch(`/video/${videoId}`); //サーバー側で定義した/video/:id エンドポイントを呼び出す

    if (!response.ok) {
        //errorレスポンスの場合
        if (response.status === 404) {
            videoTitleElement.textContent = 'Video Not Found';
            errorMessageElement!.textContent = 'The requested video does not exist.';
        } else {
            errorMessageElement!.textContent = `Error loading video: HTTP status ${response.status}`
        }
        errorMessageElement!.style.display = 'block';
        videoPlayerElement.style.display = 'none';
        videoDescriptionElement.style.display = 'none';
        return;
    }
    const video: Video = await response.json();//取得したJSONデータをVideo型にパース

    //取得した動画情報をページに表示
    videoTitleElement.textContent = video.title;
    videoPlayerElement.src = `/${video.file_path}`;// 動画ファイルのパスと設定(サーバーの/uploadsに対応)
    videoDescriptionElement.textContent = video.description || 'No description provided.';// 説明がなければデフォルトメッセージ
    videoPlayerElement.load();
    videoPlayerElement.play();

    } catch (error) {
        console.error('Error fetching video details:', error);
        errorMessageElement!.textContent = `Failed to load video: ${(error as Error).message}`;
        errorMessageElement!.style.display = 'block';
        videoTitleElement.textContent = 'Error Loading Video';
        videoPlayerElement.style.display = 'none';
        videoDescriptionElement.style.display = 'none';
    }
    console.log('video読み込みOK');
});