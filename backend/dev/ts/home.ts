const closeBtn: HTMLButtonElement | null = document.getElementById('close-btn') as HTMLButtonElement | null;
const urlInput: HTMLInputElement | null = document.getElementById('tutorial_url') as HTMLInputElement | null;
const divError: HTMLDivElement | null = document.getElementById("panel-error") as HTMLDivElement | null;
const textError: HTMLDivElement | null = document.getElementById("text-error") as HTMLDivElement | null;

    if (closeBtn) {
        closeBtn.addEventListener('click', function(event: MouseEvent) {
            const panelError: HTMLElement | null = document.getElementById('panel-error');
            if (panelError) {
                panelError.style.display = 'none'; 
            }
        });
    }
if (urlInput){
    urlInput.addEventListener("keypress", validateVideoUrl);
}
async function validateVideoUrl(event: KeyboardEvent) {
    if (event.key === 'Enter') {
        const videoUrlInput = event.target as HTMLInputElement;
        const videoUrl = videoUrlInput.value.trim();
        if (!videoUrl) {
            return
        }
        const videoId = getYouTubeVideoId(videoUrl);
        if (!videoId) {
            if (divError != null && textError != null){
                textError.innerText = "YouTube video format url is not correct"
                divError.style.display="block"
            } 
            return
        }
        try {
            const response = await fetch(`/tutorial/validate?video_id=${videoId}`);
            const data = await response.json();
            if (data.status == "error"){
                 if (divError != null && textError != null){
                textError.innerText = data.message
                divError.style.display="block"
                }  
                return
            }
            if (divError != null){
                divError.style.display = "none";
            }
            let socket = new WebSocket("ws://localhost:8000/ws");
            socket.onopen = function(event) {
            console.log("WebSocket connected.");
            socket.send(videoUrl);
            };
            socket.onmessage = function(event) {
                console.log(event.data);  // This will log the progress messages from the server
            };
            
            socket.onclose = function(event) {
                console.log("WebSocket closed.");
            };
            
            socket.onerror = function(error) {
                console.error("WebSocket error:", error);
            };
            } catch (error) {
                if (divError != null && textError != null){
                    textError.innerText = "error fetching data"
                    divError.style.display="block"
                }                    
            }
    }
}
function getYouTubeVideoId(url: string): string | null {
    const regex = /[?&]v=([^&]+)/;
    const match = url.match(regex);
    return match && match[1] ? match[1] : null;
}

