package dto

type ReceivedMessageDto struct {
	Pattern string           `json:"pattern"`
	Data    VideoDownloadDto `json:"data"`
}

type VideoDownloadDto struct {
	VideoURL string `json:"videoURL"`
	Type     string `json:"type"`
	Quality  string `json:"quality"`
	FolderID string `json:"folderID"`
}
