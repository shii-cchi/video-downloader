package dto

type VideoInfoMessageDto struct {
	Pattern string       `json:"pattern"`
	Data    VideoInfoDto `json:"data"`
}

type VideoInfoDto struct {
	VideoName   string `json:"videoName"`
	RealPath    string `json:"realPath"`
	PreviewPath string `json:"previewPath"`
}
