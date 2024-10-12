package dto

type VideoInfoMessageDto struct {
	Pattern string       `json:"pattern"`
	Data    VideoInfoDto `json:"data"`
}

type VideoInfoDto struct {
	VideoName   string
	RealPath    string
	PreviewPath string
}
