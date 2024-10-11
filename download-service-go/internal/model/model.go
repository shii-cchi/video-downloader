package model

type VideoDownloadParams struct {
	VideoURL string
	Type     string
	Quality  string
}

type VideoInfo struct {
	VideoName   string
	RealPath    string
	PreviewPath string
}
