"use strict";
document.addEventListener('DOMContentLoaded', () => {
    const uploadForm = document.getElementById('uploadForm');
    const uploadStatus = document.getElementById('uploadStatus');
    const videoListContainer = document.getElementById('videoList');
    //動画リスト取得と表示の処理(最上位スコープに移動)
    async function fetchAndDisplayVideos() {
        if (!videoListContainer) {
            console.error('Video list container not found.');
            return;
        }
        try {
            const response = await fetch('/videos');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const videos = await response.json();
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
                videoItem.dataset.videoId = video.id.toString();
                videoItem.addEventListener('click', () => {
                    //動画IDをURLパラメーターとしてvideo.html渡す
                    window.location.href = `/video.html?id=${video.id}`;
                });
                const titleElement = document.createElement('h3');
                titleElement.textContent = video.title;
                const videoPlayer = document.createElement('video');
                videoPlayer.src = `${video.file_path}`;
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
                // 削除ボタンの追加とロジック
                const deleteButton = document.createElement('button');
                deleteButton.textContent = '削除';
                deleteButton.className = 'delete_video_btn'; // 後でイベントリスナーで識別
                deleteButton.dataset.videoId = video.id.toString(); // ボタンにも動画IDを持たせる
                deleteButton.addEventListener('click', async (event) => {
                    event.stopPropagation(); // 重要: 親要素のクリックイベント(もしあれば)発火しないようにする
                    const videoIdToDelete = deleteButton.dataset.videoId;
                    if (!confirm(`本当にこの動画(ID: ${videoIdToDelete})を削除しますか?`)) {
                        return; // キャンセルされたら処理を中断
                    }
                    try {
                        const deleteResponse = await fetch(`/videos/${videoIdToDelete}`, {
                            method: 'DELETE',
                        });
                        if (!deleteResponse.ok) {
                            const errorData = await deleteResponse.json();
                            throw new Error(errorData.message || '動画の削除に失敗しました!');
                        }
                        alert('動画が正常に削除されました!');
                        //削除成功後,動画リストを再読み込みしてUIを更新
                        await fetchAndDisplayVideos(); // リスト全体を再ロード
                    }
                    catch (error) {
                        console.error('動画削除エラー:', error);
                        alert(`動画の削除中にエラーが発生しました: ${error.message || '不明なエラー'}`);
                    }
                });
                videoItem.appendChild(deleteButton);
                videoListContainer.appendChild(videoItem);
            });
        }
        catch (error) {
            console.error('動画リストの取得に失敗しました!:', error);
            if (videoListContainer) {
                videoListContainer.textContent = `Failed to load videos: ${error.message}`;
            }
        }
    }
    //動画アップロードフォームの処理
    if (uploadForm && uploadStatus) {
        uploadForm.addEventListener('submit', async (event) => {
            event.preventDefault();
            const formData = new FormData(uploadForm);
            try {
                uploadStatus.textContent = 'Uploading...';
                const response = await fetch('/upload', {
                    method: 'POST',
                    body: formData,
                });
                if (response.ok) {
                    const result = await response.json();
                    uploadStatus.textContent = `Upload successful! Video ID: ${result.videoId}`;
                    uploadForm.reset();
                    //動画アップロード後にリストを再読み込みする
                    fetchAndDisplayVideos();
                }
                else {
                    const errorText = await response.text();
                    uploadStatus.textContent = `Upload failed: ${errorText}`;
                }
            }
            catch (error) {
                uploadStatus.textContent = `Upload failed: ${error.message}`;
            }
        });
    }
    //ページ見込み時に動画リストをフェッチして表示
    fetchAndDisplayVideos();
    console.log('main読み込みOK');
});
