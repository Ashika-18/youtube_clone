interface Video {
    id: number;
    title: string;
    description: string;
    file_path: string;
    original_name: string;
    upload_date: string;
}

document.addEventListener('DOMContentLoaded', () => {
    const uploadForm = document.getElementById('uploadForm') as HTMLFormElement | null;
    const uploadStatus = document.getElementById('uploadStatus') as HTMLDivElement | null;
    const videoListContainer = document.getElementById('videoList') as HTMLDivElement | null;

    //動画リスト取得と表示の処理(最上位スコープに移動)
    async function fetchAndDisplayVideos(): Promise<void> {
        if (!videoListContainer) {
            console.error('Video list container not found.');
            return;
        }
        try {
            const response = await fetch('/videos');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const videos: Video[] = await response.json();
            console.log('取得した動画リスト:', videos);

            //既存の動画リストをクリア(重複表示を防ぐため)
            videoListContainer.innerHTML = '';

            if (videos.length === 0) {
                videoListContainer.textContent = 'No videos upload yet.';
                return;
            }
            videos.forEach(video => {
                const videoItem = document.createElement('div');
                videoItem.classList.add('video_item');

                videoItem.addEventListener('click', () => {
                    //動画IDをURLパラメーターとしてvideo.html渡す
                    window.location.href = `/video.html?id=${video.id}`;
                });

                const titleElement = document.createElement('h3');
                titleElement.textContent = video.title;

                const videoPlayer = document.createElement('video');
                videoPlayer.src = video.file_path;
                videoPlayer.controls = true;
                videoPlayer.width = 320;
                videoPlayer.height = 240;
                videoPlayer.autoplay = false;
                videoPlayer.muted = false;
                
                if (video.description) {
                    const descriptionElement = document.createElement('p');
                    descriptionElement.textContent = video.description;
                    videoItem.appendChild(descriptionElement);
                }
                videoItem.appendChild(titleElement);
                videoItem.appendChild(videoPlayer);
                videoListContainer.appendChild(videoItem);
            });
        } catch (error) {
            console.error('動画リストの取得に失敗しました!:', error);
            if (videoListContainer) {
                videoListContainer.textContent = `Failed to load videos: ${(error as Error).message}`;
            }
        }
    }
    //動画アップロードフォームの処理
    if (uploadForm && uploadStatus) {
        uploadForm.addEventListener('submit', async (event: Event) => {
            event.preventDefault();
            const formData = new FormData(uploadForm);

            try {
                uploadStatus.textContent = 'Uploading...';
                const response = await fetch('/upload', {
                    method: 'POST',
                    body: formData,
                });
                
                if (response.ok) {
                    const result: {message: string; videoId: number} = await response.json();
                    uploadStatus.textContent = `Upload successful! Video ID: ${result.videoId}`;
                    uploadForm.reset();
                    //動画アップロード後にリストを再読み込みする
                    fetchAndDisplayVideos();
                } else {
                    const errorText = await response.text();
                    uploadStatus.textContent = `Upload failed: ${errorText}`;
                }
            } catch (error: any) {
                uploadStatus.textContent = `Upload failed: ${error.message}`;
            }
        });
    }
    //ページ見込み時に動画リストをフェッチして表示
    fetchAndDisplayVideos();
    console.log('main読み込みOK');
})